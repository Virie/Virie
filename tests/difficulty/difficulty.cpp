// Copyright (c) 2014-2020 The Virie Project
// Copyright (c) 2012-2013 The Cryptonote developers
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include <cstddef>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <vector>
#include <algorithm>
#include <boost/program_options.hpp>

#include "common/util.h"
#include "string_tools.h"
#include "common/command_line.h"
#include "currency_core/currency_config.h"
#include "currency_core/difficulty.h"

#define COUNT_GENERATE 2000
#define DEFAULT_TEST_DIFFICULTY_TARGET        120

#define NEXT_DIFFICULTY_ALGO(A,B,C) currency::next_difficulty(A,B,C)

namespace fs = boost::filesystem;

bool generate(const std::string& file_name, uint64_t count = COUNT_GENERATE)
{
  struct powers_t
  {
    uint64_t step;
    uint64_t power;
  };

  const std::vector<powers_t> table_powers{ {100, 10}, {500, 1000}, {1000, 10000}, {1500, 100000}, {~0ull, 10} };

  std::vector<std::uint64_t> times;
  times.reserve(DIFFICULTY_WINDOW + 1);
  times.push_back(0);

  std::vector<currency::wide_difficulty_type> diffs;;
  diffs.reserve(DIFFICULTY_WINDOW + 1);
  diffs.push_back(DIFFICULTY_STARTER);

  uint64_t time = 100;
  TRY_ENTRY();
    std::srand(unsigned(std::time(0)));
    fs::ofstream fo;
    fo.open(file_name);

    fo << times.front() << "\t" << diffs.front() << std::endl;
    for (uint64_t i = 0; i < count; ++i)
    {
      currency::wide_difficulty_type w_diff = NEXT_DIFFICULTY_ALGO(times, diffs, DEFAULT_TEST_DIFFICULTY_TARGET);
      currency::difficulty_type diff = w_diff.convert_to<uint64_t>();

      fo << time << "\t" << diff << std::endl;

      times.push_back(time);
      w_diff += diffs.front();
      diffs.insert(diffs.begin(), w_diff);

      while (times.size() > DIFFICULTY_WINDOW)
        times.erase(times.begin());

      while (diffs.size() > DIFFICULTY_WINDOW)
        diffs.pop_back();

      const uint64_t power_limit = std::find_if(std::begin(table_powers), std::end(table_powers), [i](const powers_t& e) -> bool
      {
        return i < e.step;
      }) -> power;

      const uint64_t power_rand = power_limit + std::rand() * power_limit / 5 / RAND_MAX; //  rnd = 20%
      const uint64_t l = 120 * diff / power_rand;
      time += l + 1;

    }
  CATCH_ENTRY("generate to: " << file_name, false);
  std::cout << "Generated to: " << file_name << std::endl;
  return true;
}

namespace po = boost::program_options;

namespace
{
  const command_line::arg_descriptor<bool> arg_generate = {"generate", "Generate table"};
  const command_line::arg_descriptor<std::string> arg_file_name = {"file", "File name", "data.txt"};
}

int main(int argc, char *argv[]) {

  epee::string_tools::set_module_name_and_folder(argv[0]);
  epee::log_space::get_set_log_detalisation_level(true, LOG_LEVEL_4);
  epee::log_space::log_singletone::add_logger(LOGGER_CONSOLE, NULL, NULL, LOG_LEVEL_4);

  po::options_description desc_options("Allowed options");
  command_line::add_arg(desc_options, command_line::arg_help);
  command_line::add_arg(desc_options, arg_generate);
  command_line::add_arg(desc_options, arg_file_name);

  po::variables_map vm;

  bool r = command_line::handle_error_helper(desc_options, [&]()
  {
    po::store(po::parse_command_line(argc, argv, desc_options), vm);
    if (command_line::has_arg(vm, command_line::arg_help))
    {
      std::cout << desc_options << std::endl;
      return false;
    }
    po::notify(vm);
    return true;
  });
  if (!r)
    return EXIT_FAILURE;

  const std::string file_name = command_line::get_arg(vm, arg_file_name);
  if (command_line::has_arg(vm, arg_generate))
    return generate(file_name) ? EXIT_SUCCESS : EXIT_FAILURE;

  std::vector<uint64_t> timestamps;
  timestamps.reserve(DIFFICULTY_WINDOW + 1);
  std::vector<currency::wide_difficulty_type> wide_cumulative_difficulties;
  wide_cumulative_difficulties.reserve(DIFFICULTY_WINDOW + 1);

  TRY_ENTRY();
    fs::ifstream data(file_name);
    data.exceptions(std::fstream::badbit);
    data.clear(data.rdstate());
    uint64_t timestamp, difficulty;
    currency::wide_difficulty_type wide_cumulative_difficulty = 0;
    for (size_t n = 0; data >> timestamp >> difficulty; ++n)
    {
      currency::wide_difficulty_type wide_res = NEXT_DIFFICULTY_ALGO(timestamps, wide_cumulative_difficulties, DEFAULT_TEST_DIFFICULTY_TARGET);
      if (wide_res.convert_to<uint64_t>() != difficulty) {
        std::cout << "Wrong wide difficulty for block " << n << std::endl
                  << "Expected: " << difficulty << std::endl
                  << "Found: " << wide_res << std::endl;
        return EXIT_FAILURE;
      }

      timestamps.push_back(timestamp);
      if (timestamps.size() > DIFFICULTY_WINDOW)
        timestamps.erase(timestamps.begin());

      wide_cumulative_difficulties.insert(wide_cumulative_difficulties.begin(), wide_cumulative_difficulty += difficulty);
      if (wide_cumulative_difficulties.size() > DIFFICULTY_WINDOW)
        wide_cumulative_difficulties.pop_back();
    }
    if (!data.eof())
      data.clear(std::fstream::badbit);
  CATCH_ENTRY("difficulty test from: " << file_name, EXIT_FAILURE);

  std::cout << "TEST SUCCESS" << std::endl;
  return EXIT_SUCCESS;
}
