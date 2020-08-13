// Copyright (c) 2014-2020 The Virie Project
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.


#include <iostream>
#include <fstream>
#include <iomanip>
#include <initializer_list>
#include <functional>
#include <vector>
#include <memory>
#include <tuple>
#include <boost/program_options.hpp>
#include <boost/filesystem.hpp>

#include "include_base_utils.h"
#include "common/command_line.h"
#include "currency_core/currency_basic.h"
#include "currency_core/currency_config.h"
#include "currency_core/currency_format_utils.h"
#include "currency_core/currency_core.h"
#include "common/deps_version.h"
#include "version.h"

#define DEFAULT_YEARS        11
#define DEFAULT_DAYS         (365 * DEFAULT_YEARS)
#define BLOCKS_IN_TROP_YEAR  (CURRENCY_COUNT_BLOCK_IN_YEAR_COMMON)

namespace po = boost::program_options;
using namespace epee;
using namespace currency;

bool print_report_leap_years(std::ostream& os, uint64_t count_years, bool is_csv);
bool print_report_trop_years(std::ostream& os, uint64_t count_years, bool is_csv);
bool print_report_standart(std::ostream& os, uint64_t count_years, bool is_csv);
bool export_data_for_total_emission(std::ostream& os, uint64_t count_years, bool is_csv);
bool export_data_for_emission_by_trop_year(std::ostream& os, uint64_t count_years, bool is_csv);

namespace
{
const command_line::arg_descriptor<std::string> arg_output            = {"output", "set output file"};
const command_line::arg_descriptor<bool>        arg_report_standart   = {"standart_report", "generate standart report"};
const command_line::arg_descriptor<bool>        arg_report_leap_years = {"report_leap_years", "generate report with leap years"};
const command_line::arg_descriptor<bool>        arg_report_trop_years = {"report_trop_years", "generate report tropical years"};
const command_line::arg_descriptor<bool>        arg_export_total      = {"export_total_emission", "export data for total emission graph"};
const command_line::arg_descriptor<bool>        arg_export_by_year    = {"export_by_year", "export data for tropical year graph"};
const command_line::arg_descriptor<uint64_t>    arg_count_years       = {"count_years", "count years for reports", DEFAULT_YEARS};
const command_line::arg_descriptor<bool>        arg_csv               = {"csv", "generate csv format"};

struct report
{
  const command_line::arg_descriptor<bool> & command;
  const std::function<bool(std::ostream& stream, uint64_t count_years, bool is_csv)> & generate;
};

const report reports [] =
{
 {arg_report_leap_years, print_report_leap_years}
,{arg_report_trop_years, print_report_trop_years}
,{arg_report_standart,   print_report_standart}
,{arg_export_total,      export_data_for_total_emission}
,{arg_export_by_year,    export_data_for_emission_by_trop_year}
};

}  // namespace anonymouce

#define ANTI_OVERFLOW_AMOUNT       1000000.0l
#define GET_PERECENTS_BIG_NUMBERS(per, total) (static_cast<long double>(per)/ANTI_OVERFLOW_AMOUNT)*100.0l / (static_cast<long double>(total)/ANTI_OVERFLOW_AMOUNT)

template<typename T_DOUBLE>
std::string percent_to_string(T_DOUBLE percent)
{
  std::ostringstream ss;
  ss << std::setprecision(2) << std::fixed << percent << "%";
  return ss.str();
}

bool print_report_standart(std::ostream& os, uint64_t count_years, bool is_csv)
{
  os << "don't have access\n";
  return false;
}

class raw
{
public:
  raw(std::ostream& os, bool csv, const std::initializer_list<std::size_t>& arg) : m_os(os), m_csv(csv)
  {
    m_cols.reserve(arg.size());
    m_cols.insert(m_cols.begin(), arg);
  }

  void print_head(const std::string& head)
  {
    std::string temp{head};
    if (m_csv)
    {
      if (temp.find(' ') != temp.npos)
        temp = "\"" + temp + "\"";
    }
    m_os << std::left << temp << '\n';
  }

  void print(std::initializer_list<std::string> values)
  {
    static const size_t NO_SIZE = 0;
    size_t i = 0;
    for (const auto & e : values)
    {
      std::string temp{e};
      if (m_csv)
      {
        if (temp.find(' ') != temp.npos)
          temp = "\"" + temp + "\"";
        m_os << std::left << temp;
      }
      else
      {
        const size_t e_size = (i < m_cols.size()) ? m_cols.at(i) : NO_SIZE;
        if (e_size !=  NO_SIZE)
        {
          if (temp.size() > e_size)
            temp.resize(e_size);
          m_os << std::left << std::setw(e_size) << temp;
        }
        else
          m_os << std::left << temp;
        m_os << ' ';
      }

      if (i < values.size() - 1)
        m_os << (m_csv ? ',' : ' ');
      ++i;
    }
    m_os << '\n';
  }
private:
  std::vector<std::size_t> m_cols;
  std::ostream& m_os;
  bool m_csv;
};

struct pos_pow
{
  uint64_t pos{0ull};
  uint64_t pow{0ull};

  pos_pow() = default;

  pos_pow(uint64_t PoS, uint64_t PoW):pos(PoS),pow(PoW)
  {
  }

  pos_pow& operator +=(const pos_pow& arg)
  {
    pos += arg.pos;
    pow += arg.pow;
    return *this;
  }

  pos_pow& operator /=(const uint64_t arg)
  {
    pos /= arg;
    pow /= arg;
    return *this;
  }

  pos_pow& operator *=(const uint64_t arg)
  {
    pos *= arg;
    pow *= arg;
    return *this;
  }

  uint64_t get_total() const
  {
    return pos + pow;
  }

  void clear()
  {
    pos = 0ull;
    pow = 0ull;
  }
};

pos_pow get_reward_for_period(uint64_t& height, uint64_t& already_generated_coins, const uint64_t count)
{
  uint64_t pos_reward = 0ull;
  uint64_t pow_reward = 0ull;

  for (uint64_t i = 0ull; i < count; i++, height++)
  {
    bool is_pos = (height & 1ull);
    uint64_t emission_reward = 0ull;
    currency::get_block_reward(is_pos, 0, 0, already_generated_coins, emission_reward, height);
    uint64_t& reward = (is_pos ? pos_reward : pow_reward);
    reward += emission_reward;
    already_generated_coins += emission_reward;
  }
  return pos_pow{pos_reward, pow_reward};
}

pos_pow get_block_reward(uint64_t height, uint64_t already_generated_coins)
{
  uint64_t pos_reward = 0ull;
  uint64_t pow_reward = 0ull;
  currency::get_block_reward(true, 0, 0, already_generated_coins, pos_reward, height);
  currency::get_block_reward(false, 0, 0, already_generated_coins, pow_reward, height);

  return pos_pow{pos_reward, pow_reward};
}

bool print_report_leap_years(std::ostream &os, uint64_t count_years, bool is_csv)
{
  raw r{os, is_csv, {5, 5, 17, 17, 17, 17, 22, 13, 13, 20, 20, 20}};
  r.print_head("Change in Reward over " + std::to_string(count_years) + " years");
  r.print({"Year",
           "Leap",
           "PoS block reward",
           "PoW block reward",
           "PoS avg reward",
           "PoW avg reward",
           "Generated coins",
           "PoS perecent",
           "PoW perecent",
           "PoS Coins Generated Per Year",
           "PoW Coins Generated Per Year",
           "Coins Generated Per Year"
          });

  uint64_t already_generated_coins = PREMINE_AMOUNT;
  uint64_t height = 1ull;
  r.print({"0",
           " ",
           print_money(0ull),
           print_money(0ull),
           print_money(0ull),
           print_money(0ull),
           print_money(already_generated_coins),
           percent_to_string(GET_PERECENTS_BIG_NUMBERS(0, AMOUNT_EXPECTED_10_YEARS)),
           percent_to_string(GET_PERECENTS_BIG_NUMBERS(0, AMOUNT_EXPECTED_10_YEARS)),
           print_money(0ull),
           print_money(0ull),
           print_money(0ull)});

  for (uint64_t year = 1ull; year <= count_years; ++year)
  {
    const bool leap = (year % 4 == 0);
    const uint64_t days_in_year = (leap) ? 366ull : 365ull;
    const uint64_t period = days_in_year * (CURRENCY_BLOCKS_PER_DAY);
    const auto rewards_in_period = get_reward_for_period(height, already_generated_coins, period);
    auto avg_rewards{rewards_in_period};
    avg_rewards *= 2;
    avg_rewards /= period;

    const auto block_reward = get_block_reward(height, already_generated_coins);

    r.print({std::to_string(year),
             leap ? "+" : " ",
             print_money(block_reward.pos),
             print_money(block_reward.pow),
             print_money(avg_rewards.pos),
             print_money(avg_rewards.pow),
             print_money(already_generated_coins),
             percent_to_string(GET_PERECENTS_BIG_NUMBERS(rewards_in_period.pos, AMOUNT_EXPECTED_10_YEARS)),
             percent_to_string(GET_PERECENTS_BIG_NUMBERS(rewards_in_period.pow, AMOUNT_EXPECTED_10_YEARS)),
             print_money(rewards_in_period.pos),
             print_money(rewards_in_period.pow),
             print_money(rewards_in_period.get_total())});

//    if (year  == 10ull)
//    {
//      stream << "total generated after 10 years PoS: " << print_money(total_generated.pos) << ", PoW: " << print_money(total_generated.pow) << std::endl;
//    }
  }
  return true;
}

bool print_report_trop_years(std::ostream &os, uint64_t count_years, bool is_csv)
{
  raw r{os, is_csv, {4, 14, 14, 24, 24, 24}};

  r.print_head("Change in Reward over " + std::to_string(count_years) + " Tropical Years");
  r.print({"Year",
           "PoS block avg reward",
           "PoW block avg reward",
           "PoS coins generated/year",
           "PoW coins generated/year",
           "Coins Generated Per Year",
           "Total Coins at Close of Period (Year)"
          });

  uint64_t start_with = PREMINE_AMOUNT;
  uint64_t already_generated_coins = start_with;
  uint64_t height = 1ull;
/*
  r.print({"0",
           print_money(0ull),
           print_money(0ull),
           print_money(0ull),
           print_money(0ull),
           print_money(0ull),
           print_money(already_generated_coins)
          });
*/
  for (uint64_t year = 1ull; year <= count_years; ++year)
  {
    const auto rewards_in_period = get_reward_for_period(height, already_generated_coins, BLOCKS_IN_TROP_YEAR); //updated already_generated_coins
    r.print({std::to_string(year),
             print_money(rewards_in_period.pos / (BLOCKS_IN_TROP_YEAR / 2)),
             print_money(rewards_in_period.pow / (BLOCKS_IN_TROP_YEAR / 2)),
             print_money(rewards_in_period.pos),
             print_money(rewards_in_period.pow),
             print_money(rewards_in_period.get_total() + start_with),
             print_money(already_generated_coins)
            });

//    if (year  == 10ull)
//    {
//      stream << "total generated after 10 years PoS: " << print_money(total_generated.pos) << ", PoW: " << print_money(total_generated.pow) << std::endl;
//    }
    start_with = 0;
  }

  return true;
}

bool export_data_for_total_emission(std::ostream &os, uint64_t count_years, bool is_csv)
{
  raw r{os, is_csv, {}};
  uint64_t already_generated_coins = PREMINE_AMOUNT;
  pos_pow total_generated{};
  uint64_t height = 1ull;
  r.print({"0", print_money(PREMINE_AMOUNT), print_money(0ull), print_money(0ull)});
  for (uint64_t day = 1ull; day < /*count_years * 365*/ 4380; ++day)
  {
    auto rewards = get_reward_for_period(height, already_generated_coins, CURRENCY_BLOCKS_PER_DAY);
    total_generated += rewards;

    r.print({std::to_string(day), print_money(PREMINE_AMOUNT), print_money(total_generated.pos), print_money(total_generated.pow)});
  }
  return true;
}

bool export_data_for_emission_by_trop_year(std::ostream& os, uint64_t count_years, bool is_csv)
{
  raw r{os, is_csv, {}};
  uint64_t already_generated_coins = PREMINE_AMOUNT;
  uint64_t height = 1ull;
  for (uint64_t year = 1ull; year <= count_years; ++year)
  {
    const auto &rewards = get_reward_for_period(height, already_generated_coins, BLOCKS_IN_TROP_YEAR);
    r.print({std::to_string(year), print_money(rewards.pos), print_money(rewards.pow)});
  }
  return true;
}

int main(int argc, char* argv[])
{
  string_tools::set_module_name_and_folder(argv[0]);
  // Declare the supported options.
  po::options_description desc_general("General options");
  command_line::add_arg(desc_general, command_line::arg_help);
  command_line::add_arg(desc_general, command_line::arg_version);
  command_line::add_arg(desc_general, command_line::arg_version_libs);
  command_line::add_arg(desc_general, command_line::arg_log_channels);

  po::options_description desc_params("Report options");
  command_line::add_arg(desc_params, arg_output);
  for (const auto & e : reports)
  {
    command_line::add_arg(desc_params, e.command);
  }

  command_line::add_arg(desc_params, arg_count_years);
  command_line::add_arg(desc_params, arg_csv);

  po::options_description desc_all;
  desc_all.add(desc_general).add(desc_params);

  po::variables_map vm;
  bool r = command_line::handle_error_helper(desc_all, [&]()
  {
    po::store(command_line::parse_command_line(argc, argv, desc_general, true), vm);
    if (command_line::get_arg(vm, command_line::arg_help))
    {
      std::cout << desc_all << ENDL;
      return false;
    }

    if (command_line::has_arg(vm, command_line::arg_version))
    {
      std::cout << CURRENCY_NAME << " v" << PROJECT_VERSION_LONG << std::endl;
      return false;
    }

    if (command_line::has_arg(vm, command_line::arg_version_libs))
    {
      deps_version::print_deps_version(std::cout);
      return false;
    }

    if (command_line::has_arg(vm, command_line::arg_log_channels))
      log_space::log_singletone::enable_channels(command_line::get_arg(vm, command_line::arg_log_channels));

    po::store(command_line::parse_command_line(argc, argv, desc_params, false), vm);
    po::notify(vm);

    return true;
  });

  if (!r)
    return EXIT_SUCCESS;

  struct index_report_t
  {
    size_t index;
    size_t count;
  };

  const auto rep = [&]
  {
    index_report_t res{};
    size_t i = 0;
    for (const auto & e : reports)
    {
      if (command_line::has_arg(vm, e.command))
      {
        res.count++;
        res.index = i;
      }
      ++i;
    }
    return res;
  }();

  if (rep.count > 1)
  {
    std::cout << "Must only 1 report" << std::endl;
    return EXIT_FAILURE;
  }

  if (rep.count == 0)
  {
    std::cout << "Select correct parameter" << std::endl;
    std::cout << desc_all << std::endl;
    return EXIT_FAILURE;
  }

  const uint64_t count_years = command_line::get_arg(vm, arg_count_years);
  const std::string filename = command_line::get_arg(vm, arg_output);
  const bool is_csv = command_line::has_arg(vm, arg_csv);
  std::ostream* os = &std::cout;
  std::unique_ptr<boost::filesystem::ofstream> fos;
  if(!filename.empty())
  {
    fos.reset(new boost::filesystem::ofstream());
    fos->open(epee::string_encoding::utf8_to_wstring(filename));
    os = fos.get();
  }
  r = reports[rep.index].generate(*os, count_years, is_csv);
  os->flush();
  os = nullptr;
  fos.reset(nullptr);

  return r ? EXIT_SUCCESS : EXIT_FAILURE;
}
