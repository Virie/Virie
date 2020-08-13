// Copyright (c) 2014-2020 The Virie Project
// Copyright (c) 2012-2013 The Cryptonote developers
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.


#include "command_line.h"
#include "currency_core/currency_config.h"

namespace command_line
{
  const arg_descriptor<bool>		arg_help = {"help", "Produce help message"};
  const arg_descriptor<bool>		arg_version = {"version", "Output version information"};
  const arg_descriptor<bool>    arg_version_libs = {"version_libs", "Output used libraries version information"};
  const arg_descriptor<std::string> arg_data_dir = {"data-dir", "Specify data directory"};

  const arg_descriptor<std::string> arg_config_file =  { "config-file", "Specify configuration file", std::string(CURRENCY_NAME_SHORT ".conf") };
  const arg_descriptor<bool>        arg_os_version =   { "os-version", "" };
  const arg_descriptor<std::string> arg_log_dir =      { "log-dir", "Specify logging directory" };
  const arg_descriptor<int>         arg_log_level =    { "log-level", "Set logging level in range from -1 to 4", LOG_LEVEL_2 };
  const arg_descriptor<std::string> arg_log_channels =  { "log-channels", "log-channels <name> - Enable log channel(s), "
    "<name> is a one name of channel or comma separated several names or 'all' if all channels", "", flag_t::not_use_default };
  const arg_descriptor<bool>        arg_console =      { "no-console", "Disable daemon console commands" };
  const arg_descriptor<bool>        arg_show_details = { "currency-details", "Display currency details" };
  const arg_descriptor<std::string> arg_notification_cmd = {"notification", "Notify new block", "" };

  template<>
  boost::program_options::typed_value<bool>* make_semantic(const arg_descriptor<bool>& arg)
  {
    return boost::program_options::bool_switch();
  }

  template<>
  bool has_arg(const boost::program_options::variables_map& vm, const arg_descriptor<bool>& arg)
  {
    if (vm.find(arg.name) == vm.end())
      return false;
    return vm[arg.name].template as<bool>();
  }

  template<>
  std::string get_arg(const boost::program_options::variables_map& vm, const arg_descriptor<std::string>& arg)
  {
    auto value = vm[arg.name].template as<std::string>();
    if (!arg.is_file_support() || value.empty() || value[0] != '@')
      return value;
    std::string filename(&value[1]);
    value.clear();
    epee::file_io_utils::load_file_to_string(filename, value);
    return value;
  }
}
