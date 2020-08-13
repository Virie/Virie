// Copyright (c) 2014-2020 The Virie Project
// Copyright (c) 2012-2013 The Cryptonote developers
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include <boost/program_options.hpp>

#include "include_base_utils.h"
using namespace epee;

#include "common/command_line.h"
#include "transactions_flow_test.h"
#include "miniupnp_test.h"
#include "ntp_test.h"
#include "core_concurrency_test.h"
#include "string_coding.h"
#include "currency_core/currency_format_utils.h"
#include "generate_test_genesis.h"
#include "deadlock_guard_test.h"
#include "exec_test.h"

namespace po = boost::program_options;

const command_line::arg_descriptor<std::string> arg_test_core_prepare_and_store = { "prepare_and_store_events_to_file", "", "", command_line::flag_t::not_use_default };
const command_line::arg_descriptor<std::string> arg_test_core_load_and_replay = { "load_and_replay_events_from_file", "", "", command_line::flag_t::not_use_default };

namespace
{
  const command_line::arg_descriptor<bool> arg_test_transactions_flow = {"test_transactions_flow", ""};
  const command_line::arg_descriptor<bool> arg_test_miniupnp          = {"test_miniupnp", ""};
  const command_line::arg_descriptor<bool> arg_test_ntp               = {"test_ntp", ""};
  const command_line::arg_descriptor<bool> arg_test_core_concurrency  = {"test-core-concurrency", ""};
  const command_line::arg_descriptor<bool> arg_test_exec  = {"test_exec", ""};

  const command_line::arg_descriptor<std::string> arg_test_host  = {"test-host", "", ""};
  const command_line::arg_descriptor<uint16_t> arg_test_port  = {"test-port", "", 12345};

  const command_line::arg_descriptor<std::string> arg_working_folder  = {"working-folder", "", "."};
  const command_line::arg_descriptor<std::string> arg_source_wallet   = {"source-wallet",  "", "", command_line::flag_t::not_use_default};
  const command_line::arg_descriptor<std::string> arg_dest_wallet     = {"dest-wallet",    "", "", command_line::flag_t::not_use_default};
  const command_line::arg_descriptor<std::string> arg_source_wallet_pass   = {"source-wallet-pass",  "", "", command_line::flag_t::not_use_default};
  const command_line::arg_descriptor<std::string> arg_dest_wallet_pass     = {"dest-wallet-pass",    "", "", command_line::flag_t::not_use_default};

  const command_line::arg_descriptor<std::string> arg_daemon_addr_a   = {"daemon-addr-a",  "", "127.0.0.1:8080"};
  const command_line::arg_descriptor<std::string> arg_daemon_addr_b   = {"daemon-addr-b",  "", "127.0.0.1:8082"};

  const command_line::arg_descriptor<uint64_t> arg_transfer_amount = {"transfer_amount",   "", 60000000000000};
  const command_line::arg_descriptor<size_t> arg_mix_in_factor     = {"mix-in-factor",     "", 10};
  const command_line::arg_descriptor<size_t> arg_tx_count          = {"tx-count",          "", 100};
  const command_line::arg_descriptor<size_t> arg_tx_per_second     = {"tx-per-second",     "", 20};
  const command_line::arg_descriptor<size_t> arg_test_repeat_count = {"test_repeat_count", "", 1};
  const command_line::arg_descriptor<size_t> arg_action            = {"action", "", 0 };
  const command_line::arg_descriptor<size_t> arg_max_tx_in_pool    = { "max_tx_in_pool", "", 10000 };
  const command_line::arg_descriptor<std::string> arg_data_dir     = {"data-dir", "Specify data directory", "."};
  const command_line::arg_descriptor<size_t> arg_wthreads          = {"wthreads",          "number of writing threads to run", 1};
  const command_line::arg_descriptor<size_t> arg_rthreads          = {"rthreads",          "number of reading threads to run", 1};
  const command_line::arg_descriptor<size_t> arg_blocks            = {"blocks",            "number of blocks to generate", 250};
  const command_line::arg_descriptor<size_t> arg_generate_test_genesis_json = { "generate_test_genesis_json", "generates test genesis json, specify amount of accounts", 0, command_line::flag_t::not_use_default };
  const command_line::arg_descriptor<bool>   arg_deadlock_guard    = { "test_deadlock_guard", "Do deadlock guard test", false, command_line::flag_t::not_use_default };
}


int main(int argc, char* argv[])
{
  TRY_ENTRY();
  string_tools::set_module_name_and_folder(argv[0]);

  uint64_t reward = 0;
  currency::get_block_reward(false, 500000, 589313, 10300000000000000, reward, 11030);

  //set up logging options
  log_space::get_set_log_detalisation_level(true, LOG_LEVEL_0);
  log_space::log_singletone::add_logger(LOGGER_CONSOLE, NULL, NULL, LOG_LEVEL_2);
  log_space::log_singletone::add_logger(LOGGER_FILE, 
    log_space::log_singletone::get_default_log_file().c_str(), 
    log_space::log_singletone::get_default_log_folder().c_str());


  po::options_description desc_options("Allowed options");
  command_line::add_arg(desc_options, command_line::arg_help);

  command_line::add_arg(desc_options, arg_test_transactions_flow);
  command_line::add_arg(desc_options, arg_test_miniupnp);
  command_line::add_arg(desc_options, arg_test_ntp);
  command_line::add_arg(desc_options, arg_test_core_concurrency);
  command_line::add_arg(desc_options, arg_test_exec);
  command_line::add_arg(desc_options, arg_test_core_prepare_and_store);
  command_line::add_arg(desc_options, arg_test_core_load_and_replay);

  command_line::add_arg(desc_options, arg_test_host);
  command_line::add_arg(desc_options, arg_test_port);

  command_line::add_arg(desc_options, arg_working_folder);
  command_line::add_arg(desc_options, arg_source_wallet);
  command_line::add_arg(desc_options, arg_dest_wallet);
  command_line::add_arg(desc_options, arg_source_wallet_pass);
  command_line::add_arg(desc_options, arg_dest_wallet_pass);
  command_line::add_arg(desc_options, arg_daemon_addr_a);
  command_line::add_arg(desc_options, arg_daemon_addr_b);

  command_line::add_arg(desc_options, arg_transfer_amount);
  command_line::add_arg(desc_options, arg_mix_in_factor);
  command_line::add_arg(desc_options, arg_tx_count);
  command_line::add_arg(desc_options, arg_tx_per_second);
  command_line::add_arg(desc_options, arg_test_repeat_count);
  command_line::add_arg(desc_options, arg_action);
  command_line::add_arg(desc_options, arg_data_dir);
  command_line::add_arg(desc_options, arg_wthreads);
  command_line::add_arg(desc_options, arg_rthreads);
  command_line::add_arg(desc_options, arg_blocks);
  command_line::add_arg(desc_options, arg_generate_test_genesis_json);
  command_line::add_arg(desc_options, arg_max_tx_in_pool);
  command_line::add_arg(desc_options, arg_deadlock_guard);

  
  
  test_serialization();

  po::variables_map vm;
  bool r = command_line::handle_error_helper(desc_options, [&]()
  {
    po::store(po::parse_command_line(argc, argv, desc_options), vm);
    po::notify(vm);
    return true;
  });
  if (!r)
    return 1;

  if (command_line::get_arg(vm, command_line::arg_help))
  {
    std::cout << desc_options << std::endl;
    return 0;
  }



  size_t repeat_count = command_line::get_arg(vm, arg_test_repeat_count);
  if (command_line::get_arg(vm, arg_test_transactions_flow))
  {
    //const std::string working_folder     = command_line::get_arg(vm, arg_working_folder);
    std::string path_source_wallet, path_target_wallet, source_wallet_pass, target_wallet_pass;
    path_source_wallet = command_line::get_arg(vm, arg_source_wallet);
    path_target_wallet = command_line::get_arg(vm, arg_dest_wallet);
    source_wallet_pass = command_line::get_arg(vm, arg_source_wallet_pass);
    target_wallet_pass = command_line::get_arg(vm, arg_dest_wallet_pass);

    const std::string c_path_source_wallet = path_source_wallet;
    const std::string c_path_target_wallet = path_target_wallet;


    std::string daemon_addr_a = command_line::get_arg(vm, arg_daemon_addr_a);
    std::string daemon_addr_b = command_line::get_arg(vm, arg_daemon_addr_b);
    //uint64_t amount_to_transfer = command_line::get_arg(vm, arg_transfer_amount);
    size_t mix_in_factor = command_line::get_arg(vm, arg_mix_in_factor);
    //size_t transactions_count = command_line::get_arg(vm, arg_tx_count);
    //size_t transactions_per_second = command_line::get_arg(vm, arg_tx_per_second);

    size_t action = command_line::get_arg(vm, arg_action);
    size_t max_tx_in_pool = command_line::get_arg(vm, arg_max_tx_in_pool);
    

    for(size_t i = 0; i != repeat_count; i++)
      if(!transactions_flow_test(
        epee::string_encoding::utf8_to_wstring(c_path_source_wallet), 
        source_wallet_pass,
        epee::string_encoding::utf8_to_wstring(c_path_target_wallet), 
        target_wallet_pass,
        daemon_addr_a, 
        daemon_addr_b, 
/*        amount_to_transfer, */
        mix_in_factor, 
        action, 
        max_tx_in_pool))
        break;

    std::string s;
    std::cin >> s;
    
    return 0;
  }else if(command_line::get_arg(vm, arg_test_miniupnp))
  {
    auto host = command_line::get_arg(vm, arg_test_host);
    auto port = command_line::get_arg(vm, arg_test_port);
    if (host.empty())
    {
      std::cerr << "Please, add --" << arg_test_host.name << " option. " <<
                "And check that option 'upnp' enabled on your router." << std::endl;
      return 1;
    }
    miniupnp_test(host, port);
    return 0;
  }else if(command_line::get_arg(vm, arg_test_ntp))
  {
    ntp_test();
    return 0;
  }else if(command_line::has_arg(vm, arg_generate_test_genesis_json))
  {
	generate_test_genesis(command_line::get_arg(vm, arg_generate_test_genesis_json));
    return 0;
  }
  else if (command_line::get_arg(vm, arg_deadlock_guard) )
  {
    do_deadlock_test_main();
    return 1;
  }
  else if (command_line::get_arg(vm, arg_test_core_concurrency))
  {
    for (size_t i = 0; i != repeat_count; i++)
    {
      LOG_PRINT_L0("REPEAT #" << i);
      size_t wthreads = command_line::get_arg(vm, arg_wthreads);
      size_t rthreads = command_line::get_arg(vm, arg_rthreads);
      size_t blocks_count = command_line::get_arg(vm, arg_blocks);
      if (!core_concurrency_test(vm, wthreads, rthreads, blocks_count))
        break;
    }
    return 0;
  }
  else if (command_line::get_arg(vm, arg_test_exec))
  {
    exec_test();
    return 0;
  }
  else
  {
    std::cout << desc_options << std::endl;
    return 1;
  }

  CATCH_ENTRY_L0("main", 1);

  return 0;
}
