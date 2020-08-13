// Copyright (c) 2014-2020 The Virie Project
// Copyright (c) 2012-2013 The Cryptonote developers
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

// node.cpp : Defines the entry point for the console application.
//

#include <boost/program_options.hpp>

#include "include_base_utils.h"
#include "version.h"

using namespace epee;

#include "crypto/hash.h"
#include "daemon_service/bc_daemon_service.h"
#include "daemon_commands_handler.h"
#include "notification/notification.h"
#include "console_handler.h"
#include "string_coding.h"
#include "common/deps_version.h"
#include "common/util.h"

#if defined(WIN32)
#include <crtdbg.h>
#pragma comment(lib, "ntdll") // <-- why do we need this?
#endif


//TODO: need refactoring here. (template classes can't be used in BOOST_CLASS_VERSION) 
BOOST_CLASS_VERSION(nodetool::node_server<currency::t_currency_protocol_handler<currency::core> >, CURRENT_P2P_STORAGE_ARCHIVE_VER);


namespace po = boost::program_options;

bool command_line_preprocessor(const boost::program_options::variables_map& vm);

#ifdef WIN32
int wmain(int argc, wchar_t* argv_original[]) {
#else
int main(int argc, char* argv_original[]){
#endif

  auto argv_processor = command_line::make_argv_processor(argc, argv_original);
  char ** argv = argv_processor.get_argv();

  string_tools::set_module_name_and_folder(argv[0]);
#ifdef WIN32
  _CrtSetDbgFlag ( _CRTDBG_ALLOC_MEM_DF | _CRTDBG_LEAK_CHECK_DF );
  //_CrtSetAllocHook(alloc_hook);

#endif
  log_space::get_set_log_detalisation_level(true, command_line::arg_log_level.default_value);
  log_space::log_singletone::add_logger(LOGGER_CONSOLE, NULL, NULL);
  log_space::log_singletone::enable_channels("core,currency_protocol,tx_pool,p2p");
  LOG_PRINT_L0("Starting...");

  tools::signal_handler::install_fatal([](int sig_number, void* address) {
    LOG_ERROR("\n\nFATAL ERROR\nsig: " << sig_number << ", address: " << address);
    std::fflush(nullptr); // all open output streams are flushed
  });

  {
    const auto count_opened_fds = tools::get_opened_fds();
    if (OPENED_DESCRIPTORS_BEFORE_START < count_opened_fds)
    {
      LOG_PRINT_RED_L0("count opened file descripters: " << count_opened_fds << ", maybe memory leak");
    }
  }
  bool restart = false;

  TRY_ENTRY();

  po::options_description desc_cmd_only("Command line options");
  po::options_description desc_cmd_sett("Command line options and settings options", 130, 83);

  command_line::add_arg(desc_cmd_only, command_line::arg_help);
  command_line::add_arg(desc_cmd_only, command_line::arg_version);
  command_line::add_arg(desc_cmd_only, command_line::arg_version_libs);
  command_line::add_arg(desc_cmd_only, command_line::arg_os_version);
  // tools::get_default_data_dir() can't be called during static initialization
  command_line::add_arg(desc_cmd_only, command_line::arg_data_dir, tools::get_default_data_dir());
  command_line::add_arg(desc_cmd_only, command_line::arg_config_file);

  command_line::add_arg(desc_cmd_sett, command_line::arg_log_dir, tools::get_default_data_dir());
  command_line::add_arg(desc_cmd_sett, command_line::arg_log_level);
  command_line::add_arg(desc_cmd_sett, command_line::arg_log_channels);
  command_line::add_arg(desc_cmd_sett, command_line::arg_console);
  command_line::add_arg(desc_cmd_sett, command_line::arg_show_details);
  command_line::add_arg(desc_cmd_sett, command_line::arg_notification_cmd);

  arg_market_disable.default_value = true;
  arg_market_disable.flags = command_line::flag_t::not_use_default;

  daemon_service::bc_daemon_service::init_options(desc_cmd_sett);

  po::options_description desc_options("Allowed options");
  desc_options.add(desc_cmd_only).add(desc_cmd_sett);

  po::variables_map vm;
  bool r = command_line::handle_error_helper(desc_options, [&]()
  {
    po::store(po::parse_command_line(argc, argv, desc_options), vm);

    if (command_line::get_arg(vm, command_line::arg_help))
    {
      console_handlers_binder::message() << CURRENCY_NAME << " v" << PROJECT_VERSION_LONG << std::endl << std::endl
                                         << desc_options << std::endl;
      return false;
    }
#ifdef USE_OPENCL
    if (currency::gpu_miner::handle_cli_info_commands(vm))
      return false;
#endif

    std::string data_dir = command_line::get_arg(vm, command_line::arg_data_dir);
    std::string config = command_line::get_arg(vm, command_line::arg_config_file);

    boost::filesystem::path data_dir_path(epee::string_encoding::utf8_to_wstring(data_dir));
    boost::filesystem::path config_path(epee::string_encoding::utf8_to_wstring(config));
    if (!config_path.has_parent_path())
    {
      config_path = data_dir_path / config_path;
    }

    boost::system::error_code ec;
    if (boost::filesystem::exists(config_path, ec))
    {
      po::store(po::parse_config_file<char>(config_path.string<std::string>().c_str(), desc_cmd_sett), vm);
    }
    po::notify(vm);

    return true;
  });
  if (!r)
    return EXIT_FAILURE;

  //set up logging options
  std::string log_file_name = log_space::log_singletone::get_default_log_file();
  std::string log_dir = command_line::get_arg(vm, command_line::arg_log_dir);

  log_space::log_singletone::add_logger(LOGGER_FILE, log_file_name.c_str(), log_dir.c_str());
  LOG_PRINT_L0(CURRENCY_NAME << " v" << PROJECT_VERSION_LONG);

  if (command_line_preprocessor(vm))
  {
    return EXIT_SUCCESS;
  }

  LOG_PRINT("Module folder: " << argv[0], LOG_LEVEL_0);
#ifdef TESTNET
  LOG_PRINT_YELLOW("Warning, test net: " << CURRENCY_NAME_SHORT, LOG_LEVEL_0);
#endif

  daemon_service::bc_daemon_service daemon_service;

  daemon_cmmands_handler dch(daemon_service.get_p2p_server(), daemon_service.get_rpc_server());
  daemon_service.get_currency_core().set_stop_handler(&dch);
  if (!command_line::has_arg(vm, command_line::arg_console))
    dch.start_handling();
  tools::signal_handler::install([&dch, &daemon_service] {
    dch.stop_handling();
    daemon_service.stop();
  });

  if (!daemon_service.init(vm))
    return EXIT_FAILURE;

  std::unique_ptr<notification::notification> notification;
  if (command_line::has_arg(vm, command_line::arg_notification_cmd))
  {
    std::string notify_cmd = command_line::get_arg(vm, command_line::arg_notification_cmd);
    notification.reset(new notification::notification(notify_cmd));
    daemon_service.get_currency_core().get_blockchain_storage().add_event_handler(ID_NOTIFICATION, notification.get());
  }

#ifndef WIN32
  tools::signal_handler::install_restart([&restart, &dch, &daemon_service]
  {
    restart = true;
    dch.stop_handling();
    daemon_service.stop();
  });
#endif

  daemon_service.start();

  tools::signal_handler::uninstall_restart();
  if (notification)
  {
    daemon_service.get_currency_core().get_blockchain_storage().del_event_handler(ID_NOTIFICATION);
    notification.reset();
  }

  daemon_service.deinit();

  LOG_PRINT("Node stopped.", LOG_LEVEL_0);

  CATCH_ENTRY_L0("main", EXIT_FAILURE)
  if (restart)
  {
    LOG_PRINT("Node restarting.", LOG_LEVEL_0);
    log_space::log_singletone::remove_logger(LOGGER_FILE);
    tools::restart_app(argv_processor.get_argv_original());
    LOG_PRINT("Node restart was fault.", LOG_LEVEL_0);
  }
  return EXIT_SUCCESS;
}

bool command_line_preprocessor(const boost::program_options::variables_map& vm)
{
  bool exit = false;
  if (command_line::has_arg(vm, command_line::arg_version))
  {
    console_handlers_binder::message() << CURRENCY_NAME << " v" << PROJECT_VERSION_LONG << std::endl;
    exit = true;
  }

  if (command_line::has_arg(vm, command_line::arg_version_libs))
  {
    std::stringstream os;
    deps_version::print_deps_version(os);
    console_handlers_binder::message() << os.str();
    exit = true;
  }

  if (command_line::get_arg(vm, command_line::arg_show_details))
  {
    std::stringstream os;
    currency::print_currency_details(os);
    console_handlers_binder::message() << os.str();
    exit = true;
  }
  if (command_line::get_arg(vm, command_line::arg_os_version))
  {
    console_handlers_binder::message() << "OS: " << tools::get_os_version_string() << std::endl;
    exit = true;
  }

  if (exit)
  {
    return true;
  }

  if (command_line::has_arg(vm, command_line::arg_log_level))
  {
    int new_log_level = command_line::get_arg(vm, command_line::arg_log_level);
    if (log_space::check_log_level(new_log_level) &&
      log_space::get_set_log_detalisation_level(false) != new_log_level)
    {
      log_space::get_set_log_detalisation_level(true, new_log_level);
      LOG_PRINT_L0("LOG_LEVEL set to " << new_log_level);
    }
  }

  if (command_line::has_arg(vm, command_line::arg_log_channels))
    log_space::log_singletone::enable_channels(command_line::get_arg(vm, command_line::arg_log_channels));

  return false;
}
