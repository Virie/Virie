// Copyright (c) 2014-2020 The Virie Project
// Copyright (c) 2012-2013 The Cryptonote developers
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include <thread>
#include <boost/lexical_cast.hpp>
#include <boost/program_options.hpp>
#include <boost/algorithm/string.hpp>
#include "include_base_utils.h"
#include "common/command_line.h"
#include "common/util.h"
#include "p2p/net_node.h"
#include "currency_protocol/currency_protocol_handler.h"
#include "simplewallet.h"
#include "currency_core/currency_format_utils.h"
#include "storages/http_abstract_invoke.h"
#include "rpc/core_rpc_server_commands_defs.h"
#include "wallet/wallet_rpc_server.h"
#include "currency_core/bc_payments_id.h"
#include "version.h"
#include "string_coding.h"
#include "currency_core/currency_core.h"
#include "common/deps_version.h"
#include "common/miniupnp_helper.h"
#include <time.h>

#if defined(WIN32)
#include <crtdbg.h>
#endif

using namespace std;
using namespace epee;
using namespace currency;
using boost::lexical_cast;
namespace po = boost::program_options;

#define EXTENDED_LOGS_FILE "wallet_details.log"


namespace
{
  const command_line::arg_descriptor<std::string> arg_wallet_file = {"wallet-file", "Use wallet <arg>", ""};
  const command_line::arg_descriptor<std::string> arg_generate_new_wallet = {"generate-new-wallet", "Generate new wallet and save it to <arg> or <address>.wallet by default", ""};
  const command_line::arg_descriptor<std::string> arg_restore_wallet = {"restore-wallet", "Restore wallet and save it to <arg>", ""};
  const command_line::arg_descriptor<std::string> arg_restore_wo_wallet = {"restore-wo-wallet", "Restore watch only wallet and save it to <arg>", ""};
  const command_line::arg_descriptor<std::string> arg_daemon_address = {"daemon-address", "Use daemon instance at http://<host>:<port>", ""};
  const command_line::arg_descriptor<std::string> arg_daemon_host = {"daemon-host", "Use daemon instance at host <arg> instead of localhost", "127.0.0.1"};
  const command_line::arg_descriptor<int> arg_daemon_port = {"daemon-port", "Use daemon instance at port <arg> instead of default", RPC_DEFAULT_PORT};
  const command_line::arg_descriptor<std::string> arg_password {"password", "Wallet password", "", command_line::flag_t::not_use_default};
  const command_line::arg_descriptor<bool> arg_dont_refresh = { "no-refresh", "Do not refresh after load", false };
  const command_line::arg_descriptor<bool> arg_dont_set_date = { "no-set-creation-date", "Do not set wallet creation date", false };
  const command_line::arg_descriptor<bool> arg_print_brain_wallet = { "print-brain-wallet", "Print to console brain wallet", false };
  const command_line::arg_descriptor<std::string> arg_brain_wallet = { "brain-wallet", "Brain for restoring wallet", "", command_line::flag_t::not_use_default | command_line::flag_t::file_support};
  const command_line::arg_descriptor<bool> arg_offline_mode = { "offline-mode", "Don't connect to daemon, work offline (for cold-signing process)", false };
  const command_line::arg_descriptor<std::string> arg_pos_mining_reward_address = { "pos-mining-reward-address", "The block reward will be sent to the given address if specified", "" };
  const command_line::arg_descriptor<bool> arg_disable_upnp = { "disable-upnp", "Disable UPnP (enhances local network privacy)", false, command_line::flag_t::not_use_default };
  const command_line::arg_descriptor<uint32_t> arg_rpc_external_port = {"rpc-external-port", "External port for rpc protocol (if port forwarding used with NAT)", 0};

  const command_line::arg_descriptor< std::vector<std::string> > arg_command = {"command", ""};

  inline std::string interpret_rpc_response(bool ok, const std::string& status)
  {
    std::string err;
    if (ok)
    {
      if (status == CORE_RPC_STATUS_BUSY)
      {
        err = "daemon is busy. Please try later";
      }
      else if (status != CORE_RPC_STATUS_OK)
      {
        err = status;
      }
    }
    else
    {
      err = "possible lost connection to daemon";
    }
    return err;
  }
}

std::string simple_wallet::get_commands_str()
{
  return m_cmd_binder.get_usage();
}

simple_wallet::simple_wallet()
  : m_daemon_port(0),
    m_do_refresh(true),
    m_do_not_set_date(false),
    m_print_brain_wallet(false),
    m_offline_mode(false),
    m_rpc_mode(false),
    m_was_opened(false),
    m_refresh_progress_reporter(*this)
{
  m_cmd_binder.set_handler("start_mining", boost::bind(&simple_wallet::start_mining, this, _1), "start_mining <threads_count> - Start mining in daemon");
  m_cmd_binder.set_handler("stop_mining", boost::bind(&simple_wallet::stop_mining, this, _1), "Stop mining in daemon");
  m_cmd_binder.set_handler("refresh", boost::bind(&simple_wallet::refresh, this, _1), "Resynchronize transactions and balance");
  m_cmd_binder.set_handler("balance", boost::bind(&simple_wallet::show_balance, this, _1), "Show current wallet balance");
  m_cmd_binder.set_handler("incoming_transfers", boost::bind(&simple_wallet::show_incoming_transfers, this, _1), "incoming_transfers [available|unavailable] - Show incoming transfers - all of them or filter them by availability");
  m_cmd_binder.set_handler("incoming_counts", boost::bind(&simple_wallet::show_incoming_transfers_counts, this, _1), "incoming_transfers counts");
  m_cmd_binder.set_handler("list_recent_transfers", boost::bind(&simple_wallet::list_recent_transfers, this, _1), "list_recent_transfers - Show recent maximum 1000 transfers");
  m_cmd_binder.set_handler("list_recent_transfers_ex", boost::bind(&simple_wallet::list_recent_transfers_ex, this, _1), "list_recent_transfers_tx - Write recent transfer in json to wallet_recent_transfers.txt");
  m_cmd_binder.set_handler("dump_transfers", boost::bind(&simple_wallet::dump_trunsfers, this, _1), "dump_transfers - Write  transfers in json to dump_transfers.txt");
  m_cmd_binder.set_handler("dump_keyimages", boost::bind(&simple_wallet::dump_key_images, this, _1), "dump_keyimages - Write  key_images in json to dump_key_images.txt");
  m_cmd_binder.set_handler("payments", boost::bind(&simple_wallet::show_payments, this, _1), "payments <payment_id_1> [<payment_id_2> ... <payment_id_N>] - Show payments <payment_id_1>, ... <payment_id_N>");
  m_cmd_binder.set_handler("bc_height", boost::bind(&simple_wallet::show_blockchain_height, this, _1), "Show blockchain height");
  m_cmd_binder.set_handler("wallet_bc_height", boost::bind(&simple_wallet::show_wallet_bcheight, this, _1), "Show blockchain height");
  m_cmd_binder.set_handler("transfer", boost::bind(&simple_wallet::transfer, this, _1), "transfer <mixin_count> <addr_1> <amount_1> [<addr_2> <amount_2> ... <addr_N> <amount_N>] [payment_id] - Transfer <amount_1>,... <amount_N> to <address_1>,... <address_N>, respectively. <mixin_count> is the number of transactions yours is indistinguishable from (from 0 to maximum available)");
  m_cmd_binder.set_handler("address", boost::bind(&simple_wallet::print_address, this, _1), "Show current wallet public address");
  m_cmd_binder.set_handler("resync", boost::bind(&simple_wallet::resync_wallet, this, _1), "Causes wallet to reset all transfers and re-synchronize wallet, can be used with data in <YYYY:MM:DD> format");
  m_cmd_binder.set_handler("save", boost::bind(&simple_wallet::save, this, _1), "Save wallet synchronized data");
  m_cmd_binder.set_handler("save_watch_only", boost::bind(&simple_wallet::save_watch_only, this, _1), "save_watch_only <filename> <password> - save as watch-only wallet file.");
  m_cmd_binder.set_handler("get_transfer_info", boost::bind(&simple_wallet::get_transfer_info, this, _1), "displays transfer info by key_image or index");
  m_cmd_binder.set_handler("scan_for_collision", boost::bind(&simple_wallet::scan_for_key_image_collisions, this, _1), "Rescan transfers for key image collisions");
  m_cmd_binder.set_handler("fix_collisions", boost::bind(&simple_wallet::fix_collisions, this, _1), "Rescan transfers for key image collisions");
  m_cmd_binder.set_handler("scan_transfers_for_id", boost::bind(&simple_wallet::scan_transfers_for_id, this, _1), "Rescan transfers for tx_id");
  m_cmd_binder.set_handler("scan_transfers_for_ki", boost::bind(&simple_wallet::scan_transfers_for_ki, this, _1), "Rescan transfers for key image");
  m_cmd_binder.set_handler("integrated_address", boost::bind(&simple_wallet::integrated_address, this, _1), "integrated_address [<payment_id>|<integrated_address] - encodes given payment_id along with wallet's address into an integrated address (random payment_id will be used if none is provided). Decodes given integrated_address into standard address");
  m_cmd_binder.set_handler("brain", boost::bind(&simple_wallet::print_brain_wallet, this, _1), "Print to console brain wallet");
  m_cmd_binder.set_handler("spendkey", boost::bind(&simple_wallet::print_spend_key, this, _1), "Display secret spend key");
  m_cmd_binder.set_handler("viewkey", boost::bind(&simple_wallet::print_view_key, this, _1), "Display secret view key");
  m_cmd_binder.set_handler("info", boost::bind(&simple_wallet::print_info, this, _1), "Display info about wallet");
  m_cmd_binder.set_handler("sign_transfer", boost::bind(&simple_wallet::sign_transfer, this, _1), "sign_transfer <unsgined_tx_file> <signed_tx_file> - sign unsigned tx from a watch-only wallet");
  m_cmd_binder.set_handler("submit_transfer", boost::bind(&simple_wallet::submit_transfer, this, _1), "submit_transfer <signed_tx_file> - broadcast signed tx");
  m_cmd_binder.set_handler("stat_transfers", boost::bind(&simple_wallet::stat_transfers, this, _1), "Display free transfers statistic");
  m_cmd_binder.set_handler("locked_transfers", boost::bind(&simple_wallet::locked_transfers, this, _1), "Display locked transfers statistic");
}

//----------------------------------------------------------------------------------------------------

bool simple_wallet::init(const boost::program_options::variables_map& vm)
{
  handle_command_line(vm);

  size_t c = 0; 
  if (!m_generate_new.empty()) ++c;
  if (!m_wallet_file.empty()) ++c;
  if (!m_restore_wallet.empty()) ++c;
  if (!m_restore_wo_wallet.empty()) ++c;
  if (1 != c)
  {
    m_cmd_binder.fail() << "you must specify --wallet-file or --generate-new-wallet params or --restore-wallet or --restore-wo-wallet";
    return false;
  }

  if (m_daemon_address.empty())
    m_daemon_address = std::string("http://") + m_daemon_host + ":" + std::to_string(m_daemon_port);

  tools::password_container pwd_container;
  if (command_line::has_arg(vm, arg_password))
    pwd_container.password(command_line::get_arg(vm, arg_password));
  else if (!pwd_container.read_password())
  {
    m_cmd_binder.fail() << "failed to read wallet password";
    return false;
  }

  m_rpc_mode = command_line::has_arg(vm, tools::wallet_rpc_server::arg_rpc_bind_port);
  m_do_refresh = !command_line::get_arg(vm, arg_dont_refresh);
  m_offline_mode = command_line::get_arg(vm, arg_offline_mode);
  if (m_offline_mode)
    message_writer(epee::colored_cout::console_colors::console_color_yellow, true, std::string(), LOG_LEVEL_0)
      << "WARNING: the wallet is running in OFFLINE MODE!";

  if (command_line::has_arg(vm, arg_print_brain_wallet))
    m_print_brain_wallet = true;

  if (!m_wallet_file.empty())
  {
    const bool r = open_wallet(m_wallet_file, pwd_container.password());
    CHECK_AND_ASSERT_MES(r, false, "could not open account");
  }
  else if (!m_generate_new.empty())
  {
    const bool r = new_wallet(m_generate_new, pwd_container.password());
    CHECK_AND_ASSERT_MES(r, false, "account creation failed");
  }
  else
  {
    if (!command_line::has_arg(vm, arg_brain_wallet))
    {
      m_cmd_binder.fail() << "for restore you must specify --brain-wallet";
      return false;
    }
    const bool watch_only = m_restore_wallet.empty();
    const bool r = restore_wallet(watch_only ? m_restore_wo_wallet : m_restore_wallet, pwd_container.password(), command_line::get_arg(vm, arg_brain_wallet), watch_only);
    CHECK_AND_ASSERT_MES(r, false, "could not restore account");
  }

  if (command_line::has_arg(vm, arg_pos_mining_reward_address))
  {
    auto mining_address_str = command_line::get_arg(vm, arg_pos_mining_reward_address);
    if (!mining_address_str.empty())
    {
      bool r = get_account_address_from_str(m_miner_address, mining_address_str);
      CHECK_AND_ASSERT_MES(r, false, "Failed to parse miner address from string: " << mining_address_str);
      m_cmd_binder.message(epee::colored_cout::console_colors::console_color_yellow) << "PoS reward will be sent to another address: " << mining_address_str;
    }
  }

  return true;
}
//----------------------------------------------------------------------------------------------------
bool simple_wallet::deinit()
{
  return m_wallet ? close_wallet() : true;
}
//----------------------------------------------------------------------------------------------------
void simple_wallet::handle_command_line(const boost::program_options::variables_map& vm)
{
  m_wallet_file     = command_line::get_arg(vm, arg_wallet_file);
  m_generate_new    = command_line::get_arg(vm, arg_generate_new_wallet);
  m_restore_wallet  = command_line::get_arg(vm, arg_restore_wallet);
  m_restore_wo_wallet  = command_line::get_arg(vm, arg_restore_wo_wallet);
  m_daemon_address  = command_line::get_arg(vm, arg_daemon_address);
  m_daemon_host     = command_line::get_arg(vm, arg_daemon_host);
  m_daemon_port     = command_line::get_arg(vm, arg_daemon_port);
  m_do_not_set_date = command_line::get_arg(vm, arg_dont_set_date);
}
//----------------------------------------------------------------------------------------------------
bool simple_wallet::try_connect_to_daemon()
{
  if (!m_wallet->check_connection())
  {
    m_cmd_binder.fail() << "wallet failed to connect to daemon (" << m_daemon_address << "). " <<
      "Daemon either is not started or passed wrong port. " <<
      "Please, make sure that daemon is running or restart the wallet with correct daemon address.";
    return false;
  }

  COMMAND_RPC_GET_STATIC_INFO::request req;
  COMMAND_RPC_GET_STATIC_INFO::response res;
  auto r = m_wallet->get_core_proxy()->call_COMMAND_RPC_GET_STATIC_INFO(req, res);
  if (!r)
  {
    m_cmd_binder.fail() << "wallet failed to connect to daemon (" << m_daemon_address << "). " <<
                        "Daemon either is not started or passed wrong port. " <<
                        "Please, make sure that daemon is running or restart the wallet with correct daemon address.";
    return false;
  }
  if (res.rpc_version < CORE_RPC_PROTOCOL_VERSION)
  {
    m_cmd_binder.fail() << "wallet failed to connect to daemon (" << m_daemon_address << "). " <<
                        "Daemon not supported actual version of RPC protocol.";
    return false;
  }

  return true;
}
//----------------------------------------------------------------------------------------------------
bool simple_wallet::new_wallet(const string &wallet_file, const std::string& password)
{
  m_wallet_file = wallet_file;

  m_wallet.reset(new tools::wallet2());
  m_wallet->callback(this->shared_from_this());
  m_wallet->set_do_rise_transfer(false);
  try
  {
    m_wallet->generate(epee::string_encoding::utf8_to_wstring(m_wallet_file), password);
    m_cmd_binder.message(epee::colored_cout::console_colors::console_color_white, true) << "Generated new wallet: " << m_wallet->get_account().get_public_address_str();
    m_cmd_binder.message() << "view key: " << string_tools::pod_to_hex(m_wallet->get_account().get_keys().m_view_secret_key) << epee::flush;
    if (m_do_not_set_date)
      m_wallet->reset_creation_time(0);

    if (m_print_brain_wallet)
    {
      print_brain_wallet();
    }

  }
  catch (const std::exception& e)
  {
    m_cmd_binder.fail() << "failed to generate new wallet: " << e.what();
    return false;
  }

  m_wallet->init(m_daemon_address);


  m_cmd_binder.message() <<
    "**********************************************************************\n" <<
    "Your wallet has been generated.\n" <<
    "To start synchronizing with the daemon use \"refresh\" command.\n" <<
    "Use \"help\" command to see the list of available commands.\n" <<
    "Always use \"exit\" command when closing simplewallet to save\n" <<
    "current session's state. Otherwise, you will possibly need to synchronize \n" <<
    "your wallet again. Your wallet key is NOT under risk anyway.\n" <<
    "**********************************************************************";
  return true;
}

//----------------------------------------------------------------------------------------------------
bool simple_wallet::open_wallet(const string &wallet_file, const std::string& password)
{
  m_wallet.reset(new tools::wallet2());
  m_wallet->callback(shared_from_this());

  while (true)
  {
    try
    {
      m_wallet->load(epee::string_encoding::utf8_to_wstring(m_wallet_file), password);
      m_cmd_binder.message(epee::colored_cout::console_colors::console_color_white, true) << "Opened " <<
        (m_wallet->is_watch_only() ? "watch-only" : "") << " wallet: " << m_wallet->get_account().get_public_address_str();

      if (m_print_brain_wallet)
      {
        print_brain_wallet();
      }

      m_miner_address = m_wallet->get_account().get_public_address();

      break;
    }
    catch (const tools::error::wallet_load_notice_wallet_restored& /*e*/)
    {
      m_cmd_binder.message(epee::colored_cout::console_colors::console_color_white, true) << "Opened wallet: " << m_wallet->get_account().get_public_address_str();
      m_cmd_binder.message(epee::colored_cout::console_colors::console_color_red, true) << "NOTICE: Wallet file was damaged and restored.";
      break;
    }
    catch (const std::exception& e)
    {
      m_cmd_binder.fail() << "failed to load wallet: " << e.what();
      return false;
    }
  }

  m_wallet->init(m_daemon_address);

  if (m_offline_mode)
    m_wallet->set_core_proxy(std::make_shared<tools::stub_core_proxy_throw>());

  if (m_do_refresh && !m_offline_mode)
    refresh(std::vector<std::string>());

  m_cmd_binder.message() <<
    "**********************************************************************\n" <<
    "Use \"help\" command to see the list of available commands.\n" <<
    "**********************************************************************";
  return m_was_opened = true;
}
//----------------------------------------------------------------------------------------------------
bool simple_wallet::restore_wallet(const std::string &wallet_file, const std::string& password, const std::string& brain_wallet, bool watch_only /* = false */)
{
  m_wallet_file = wallet_file;
  m_wallet.reset(new tools::wallet2());
  m_wallet->callback(shared_from_this());

  try
  {
    m_wallet->restore(epee::string_encoding::utf8_to_wstring(m_wallet_file), password, brain_wallet);
    m_cmd_binder.message(epee::colored_cout::console_colors::console_color_white, true) << "Restored wallet: " << m_wallet->get_account().get_public_address_str();
  }
  catch (const std::exception& e)
  {
    m_cmd_binder.fail() << "failed to restore " << (watch_only ? "watch only " : "") << "wallet: " << e.what();
    return false;
  }

  if (m_do_refresh && !m_offline_mode)
  {
    m_wallet->init(m_daemon_address);
    refresh(std::vector<std::string>());
  }

  m_cmd_binder.message() <<
    "**********************************************************************\n" <<
    "Your " << (watch_only ? "watch only " : "") << "wallet has been restored.\n" <<
    "**********************************************************************";
  return true;
}
//----------------------------------------------------------------------------------------------------
bool simple_wallet::close_wallet()
{
  bool r = m_wallet->deinit();
  if (!r)
  {
    m_cmd_binder.fail() << "failed to deinit wallet";
    return false;
  }

  try
  {
    tools::store_double_step(m_wallet->get_wallet_path(),
      [this] (const std::wstring &filename) { m_wallet->store(filename); });
  }
  catch (const std::exception& e)
  {
    m_cmd_binder.fail() << e.what();
    return false;
  }

  return true;
}
//----------------------------------------------------------------------------------------------------
bool simple_wallet::save(const std::vector<std::string> &args)
{
  try
  {
    tools::store_double_step(m_wallet->get_wallet_path(),
      [this] (const std::wstring &filename) { m_wallet->store(filename); });
    m_cmd_binder.message() << "Wallet data saved";
  }
  catch (const std::exception& e)
  {
    m_cmd_binder.fail() << e.what();
  }

  return true;
}
//----------------------------------------------------------------------------------------------------
bool simple_wallet::save_watch_only(const std::vector<std::string> &args)
{
  if (args.size() < 2)
  {
    m_cmd_binder.fail() << "wrong parameters, expected filename and password";
    return true;
  }
  try
  {
    m_wallet->store_watch_only(epee::string_encoding::utf8_to_wstring(args[0]), args[1]);
    m_cmd_binder.message() << "Watch-only wallet has been stored to " << args[0];
  }
  catch (const std::exception& e)
  {
    LOG_ERROR("unexpected error: " << e.what());
    m_cmd_binder.fail() << "unexpected error: " << e.what();
  }
  catch (...)
  {
    LOG_ERROR("Unknown error");
    m_cmd_binder.fail() << "unknown error";
  }
  return true;
}
//----------------------------------------------------------------------------------------------------
bool simple_wallet::start_mining(const std::vector<std::string>& args)
{
  if (!try_connect_to_daemon())
    return true;

  COMMAND_RPC_START_MINING::request req;
  req.miner_address = m_wallet->get_account().get_public_address_str();

  if (0 == args.size())
  {
    req.threads_count = 1;
  }
  else if (1 == args.size())
  {
    uint16_t num;
    bool ok = string_tools::get_xtype_from_string(num, args[0]);
    if(!ok || 0 == num)
    {
      m_cmd_binder.fail() << "wrong number of mining threads: \"" << args[0] << "\"";
      return true;
    }
    req.threads_count = num;
  }
  else
  {
    m_cmd_binder.fail() << "wrong number of arguments, expected the number of mining threads";
    return true;
  }

  COMMAND_RPC_START_MINING::response res;
  bool r = net_utils::invoke_http_json_remote_command2(m_daemon_address + "/start_mining", req, res, m_http_client);
  std::string err = interpret_rpc_response(r, res.status);
  if (err.empty())
    m_cmd_binder.message() << "Mining started in daemon";
  else
    m_cmd_binder.fail() << "mining has NOT been started: " << err;
  return true;
}
//----------------------------------------------------------------------------------------------------
bool simple_wallet::stop_mining(const std::vector<std::string>& args)
{
  if (!try_connect_to_daemon())
    return true;

  COMMAND_RPC_STOP_MINING::request req;
  COMMAND_RPC_STOP_MINING::response res;
  bool r = net_utils::invoke_http_json_remote_command2(m_daemon_address + "/stop_mining", req, res, m_http_client);
  std::string err = interpret_rpc_response(r, res.status);
  if (err.empty())
    m_cmd_binder.message() << "Mining stopped in daemon";
  else
    m_cmd_binder.fail() << "mining has NOT been stopped: " << err;
  return true;
}
//----------------------------------------------------------------------------------------------------
void simple_wallet::on_new_block(uint64_t height, const currency::block& block)
{
  m_refresh_progress_reporter.update(height, false);
}
//----------------------------------------------------------------------------------------------------
void simple_wallet::on_money_received(uint64_t height, const currency::transaction& tx, size_t out_index)
{
  m_cmd_binder.message(epee::colored_cout::console_colors::console_color_green, false) <<
    "Height " << height <<
    ", transaction " << get_transaction_hash(tx) <<
    ", received " << print_money(tx.vout[out_index].amount);
  m_refresh_progress_reporter.update(height, true);
}
//----------------------------------------------------------------------------------------------------
void simple_wallet::on_money_spent(uint64_t height, const currency::transaction& in_tx, size_t out_index, const currency::transaction& spend_tx)
{
  m_cmd_binder.message(epee::colored_cout::console_colors::console_color_magenta, false) <<
    "Height " << height <<
    ", transaction " << get_transaction_hash(spend_tx) <<
    ", spent " << print_money(in_tx.vout[out_index].amount);
  m_refresh_progress_reporter.update(height, true);
}
//----------------------------------------------------------------------------------------------------
bool simple_wallet::refresh(const std::vector<std::string>& args)
{
  if (m_offline_mode)
  {
    m_cmd_binder.message() << "refresh is meaningless in OFFLINE MODE";
    return true;
  }

  if (!try_connect_to_daemon())
    return true;

  m_cmd_binder.message() << "Starting refresh...";
  size_t fetched_blocks = 0;
  bool ok = false;
  std::ostringstream ss;
  try
  {
    m_wallet->refresh(fetched_blocks);
    ok = true;
    m_cmd_binder.success() << "Refresh done, blocks received: " << fetched_blocks;
    show_balance();
  }
  catch (const tools::error::daemon_busy&)
  {
    ss << "daemon is busy. Please try later";
  }
  catch (const tools::error::no_connection_to_daemon&)
  {
    ss << "no connection to daemon. Please, make sure daemon is running";
  }
  catch (const tools::error::wallet_rpc_error& e)
  {
    LOG_ERROR("Unknown RPC error: " << e.to_string());
    ss << "RPC error \"" << e.what() << '"';
  }
  catch (const tools::error::refresh_error& e)
  {
    LOG_ERROR("refresh error: " << e.to_string());
    ss << e.what();
  }
  catch (const tools::error::wallet_internal_error& e)
  {
    LOG_ERROR("internal error: " << e.to_string());
    ss << "internal error: " << e.what();
  }
  catch (const std::exception& e)
  {
    LOG_ERROR("unexpected error: " << e.what());
    ss << "unexpected error: " << e.what();
  }
  catch (...)
  {
    LOG_ERROR("Unknown error");
    ss << "unknown error";
  }

  if (!ok)
  {
    m_cmd_binder.fail() << "refresh failed: " << ss.str() << ". Blocks received: " << fetched_blocks;
  }

  return true;
}
//----------------------------------------------------------------------------------------------------
bool simple_wallet::show_balance(const std::vector<std::string>& args/* = std::vector<std::string>()*/)
{
  m_cmd_binder.message() << "balance: " << print_money(m_wallet->balance()) << ", unlocked balance: " << print_money(m_wallet->unlocked_balance());
  return true;
}
//----------------------------------------------------------------------------------------------------
bool print_wti(const tools::wallet_rpc::wallet_transfer_info& wti)
{
  epee::colored_cout::console_colors cl;
  if (wti.is_income)
    cl = epee::colored_cout::console_colors::console_color_green;
  else
    cl = epee::colored_cout::console_colors::console_color_magenta;

  std::string payment_id_placeholder;
  if (!wti.payment_id.empty())
    payment_id_placeholder = std::string("(payment_id:") + wti.payment_id.get_hex() + ")";

  static const std::string separator = ", ";
  std::string remote_side;
  if (!wti.recipients_aliases.empty())
  {
    for (auto it : wti.recipients_aliases)
      remote_side += remote_side.empty() ? it : (separator + it);
  }
  else
  {
    for (auto it : wti.remote_addresses)
      remote_side += remote_side.empty() ? it : (separator + it);
  }

  console_handlers_binder::message_log(cl) << epee::misc_utils::get_time_str_v2(wti.timestamp) << " "
    << (wti.is_income ? "Received " : "Sent    ")
    << print_money(wti.amount) << "(fee:" << print_money(wti.fee) << ")  "
    << remote_side
    << " " << wti.tx_hash << payment_id_placeholder;
  return true;
}
//----------------------------------------------------------------------------------------------------
bool simple_wallet::list_recent_transfers(const std::vector<std::string>& args)
{
  std::vector<tools::wallet_rpc::wallet_transfer_info> unconfirmed;
  std::vector<tools::wallet_rpc::wallet_transfer_info> recent;
  m_wallet->get_recent_transfers_history(recent, 0, 0);
  m_wallet->get_unconfirmed_transfers(unconfirmed);
  //workaround for missed fee

  m_cmd_binder.message() << "Unconfirmed transfers: ";
  for (auto & wti : unconfirmed)
  {
    if (!wti.fee)
      wti.fee = currency::get_tx_fee(wti.tx);
    print_wti(wti);
  }
  m_cmd_binder.message() << "Recent transfers: ";
  for (auto & wti : recent)
  {
    if (!wti.fee)
      wti.fee = currency::get_tx_fee(wti.tx);
    print_wti(wti);
  }
  return true;
}
//----------------------------------------------------------------------------------------------------
bool simple_wallet::list_recent_transfers_ex(const std::vector<std::string>& args)
{
  std::vector<tools::wallet_rpc::wallet_transfer_info> unconfirmed;
  std::vector<tools::wallet_rpc::wallet_transfer_info> recent;
  m_wallet->get_recent_transfers_history(recent, 0, 0);
  m_wallet->get_unconfirmed_transfers(unconfirmed);
  //workaround for missed fee
  stringstream ss;
  m_cmd_binder.success() << "Generating text....";
  ss << "Unconfirmed transfers: " << ENDL;
  for (auto & wti : unconfirmed)
  {
    if (!wti.fee)
      wti.fee = currency::get_tx_fee(wti.tx);
    ss << epee::serialization::store_t_to_json(wti) << ENDL;
  }
  ss << "Recent transfers: " << ENDL;
  for (auto & wti : recent)
  {
    if (!wti.fee)
      wti.fee = currency::get_tx_fee(wti.tx);
    
    ss << epee::serialization::store_t_to_json(wti) << ENDL;
  }
  m_cmd_binder.success() << "Storing text to wallet_recent_transfers.txt....";
  file_io_utils::save_string_to_file(log_space::log_singletone::get_default_log_folder() + "/wallet_recent_transfers.txt", ss.str());
  m_cmd_binder.success() << "Done";

  return true;
}
//----------------------------------------------------------------------------------------------------
bool simple_wallet::dump_trunsfers(const std::vector<std::string>& args)
{

  stringstream ss;
  m_cmd_binder.message() << "Generating text....";
  m_wallet->dump_trunsfers(ss);
  m_cmd_binder.message() << "Storing text to dump_transfers.txt....";
  file_io_utils::save_string_to_file(log_space::log_singletone::get_default_log_folder() + "/dump_transfers.txt", ss.str());
  m_cmd_binder.message() << "Done....";
  return true;
}
//----------------------------------------------------------------------------------------------------
bool simple_wallet::dump_key_images(const std::vector<std::string>& args)
{

  stringstream ss;
  m_cmd_binder.message() << "Generating text....";
  m_wallet->dump_key_images(ss);
  m_cmd_binder.message() << "Storing text to dump_keyimages.txt....";
  file_io_utils::save_string_to_file(log_space::log_singletone::get_default_log_folder() + "/dump_keyimages.txt", ss.str());
  m_cmd_binder.message() << "Done....";
  return true;
}
//----------------------------------------------------------------------------------------------------
bool simple_wallet::show_incoming_transfers(const std::vector<std::string>& args)
{
  bool filter = false;
  bool available = false;
  if (!args.empty())
  {
    if (args[0] == "available")
    {
      filter = true;
      available = true;
    }
    else if (args[0] == "unavailable")
    {
      filter = true;
      available = false;
    }
  }

  tools::wallet2::transfer_container transfers;
  m_wallet->get_transfers(transfers);

  bool transfers_found = false;
  for (const auto& td : transfers)
  {
    if (!filter || available != static_cast<bool>(td.m_flags&WALLET_TRANSFER_DETAIL_FLAG_SPENT))
    {
      if (!transfers_found)
      {
        m_cmd_binder.message() << "        amount       \tspent\tglobal index\t                              tx id";
        transfers_found = true;
      }
      m_cmd_binder.message(static_cast<bool>(td.m_flags&WALLET_TRANSFER_DETAIL_FLAG_SPENT) ? epee::colored_cout::console_colors::console_color_magenta : epee::colored_cout::console_colors::console_color_green, false) <<
        std::setw(21) << print_money(td.amount()) << '\t' <<
        std::setw(3) << (static_cast<bool>(td.m_flags&WALLET_TRANSFER_DETAIL_FLAG_SPENT) ? 'T' : 'F') << "  \t" <<
        std::setw(12) << td.m_global_output_index << '\t' <<
        get_transaction_hash(td.m_ptx_wallet_info->m_tx) << "[" << td.m_ptx_wallet_info->m_block_height << "] unlocked: " << (m_wallet->is_transfer_unlocked(td) ? 'T' : 'F');
    }
  }

  if (!transfers_found)
  {
    if (!filter)
    {
      m_cmd_binder.message() << "No incoming transfers";
    }
    else if (available)
    {
      m_cmd_binder.message() << "No incoming available transfers";
    }
    else
    {
      m_cmd_binder.message() << "No incoming unavailable transfers";
    }
  }

  return true;
}
//----------------------------------------------------------------------------------------------------
bool simple_wallet::show_incoming_transfers_counts(const std::vector<std::string>& args)
{

  tools::wallet2::transfer_container transfers;
  m_wallet->get_transfers(transfers);

  uint64_t spent_count = 0;
  uint64_t unspent_count = 0;
  for (const auto& td : transfers)
  {
    if (td.m_flags&WALLET_TRANSFER_DETAIL_FLAG_SPENT)
    {
      ++spent_count;
    }
    else
    {
      ++unspent_count;
    }
  }
  m_cmd_binder.message() << "Total outs: Spent: " << spent_count << ", Unspent: " << unspent_count;

  return true;
}
//----------------------------------------------------------------------------------------------------
bool simple_wallet::scan_for_key_image_collisions(const std::vector<std::string> &args)
{
  std::unordered_map<crypto::key_image, std::list<size_t> > key_images;
  if (!m_wallet->scan_for_collisions(key_images))
  {
    m_cmd_binder.message() << "Collisions not found";
    return true;
  }
  else
  {
    size_t total_colisions = 0;
    for (auto& item : key_images)
    {
      if (item.second.size() > 1)
      {
        std::stringstream ss;
        for (auto it = item.second.begin(); it != item.second.end(); it++)
          ss << std::to_string(*it)+"|";

        m_cmd_binder.message() << "Collision: " << item.first << " " << ss.str();
        LOG_PRINT_L0("Collision: " << item.first << " " << ss.str());
        total_colisions++;
      }
    }
    m_cmd_binder.message() << "Total collisions: " << total_colisions;
  }

  return true;
}

//----------------------------------------------------------------------------------------------------
bool simple_wallet::fix_collisions(const std::vector<std::string> &args)
{
  size_t collisions_fixed = m_wallet->fix_collisions();
  m_cmd_binder.message() << collisions_fixed << " collisions fixed";
  return true;
}

void print_td_list(const std::list<tools::wallet2::transfer_details>& td)
{
  console_handlers_binder::message_log() << "entries found: " << td.size();
  for (auto& e : td)
  {
    std::string json_details = epee::serialization::store_t_to_json(e);
    console_handlers_binder::message_log() << "------------------------" << ENDL << json_details;
  }
  
}
//----------------------------------------------------------------------------------------------------
bool simple_wallet::scan_transfers_for_id(const std::vector<std::string> &args)
{
  crypto::hash id = currency::null_hash;
  if (!epee::string_tools::parse_tpod_from_hex_string(args[0], id))
  {
    m_cmd_binder.fail() << "expected valid tx id";
    return true;
  }
  std::list<tools::wallet2::transfer_details> td;
  m_wallet->scan_for_transaction_entries(id, currency::null_ki, td);
  print_td_list(td);
  return true;
}
//----------------------------------------------------------------------------------------------------
bool simple_wallet::scan_transfers_for_ki(const std::vector<std::string> &args)
{
  crypto::key_image ki = currency::null_ki;
  if (!epee::string_tools::parse_tpod_from_hex_string(args[0], ki))
  {
    m_cmd_binder.fail() << "expected valid key_image";
    return true;
  }
  std::list<tools::wallet2::transfer_details> td;
  m_wallet->scan_for_transaction_entries(currency::null_hash, ki, td);
  print_td_list(td);
  return true;
}
//----------------------------------------------------------------------------------------------------
bool simple_wallet::get_transfer_info(const std::vector<std::string> &args)
{
  if (args.empty())
  {
    m_cmd_binder.fail() << "expected key_image";
    return true;
  }

  size_t i = 0;
  tools::wallet2::transfer_details td = AUTO_VAL_INIT(td);

  if (epee::string_tools::get_xtype_from_string(i, args[0]))
  {
    if (!m_wallet->get_transfer_info_by_index(i, td))
    {
      m_cmd_binder.fail() << "failed to find transfer info by index";
      return true;
    }
  }
  else
  {
    crypto::key_image ki = currency::null_ki;
    if (!epee::string_tools::parse_tpod_from_hex_string(args[0], ki))
    {
      m_cmd_binder.fail() << "expected valid key_image";
      return true;
    }
    if (!m_wallet->get_transfer_info_by_key_image(ki, td, i))
    {
      m_cmd_binder.fail() << "failed to find transfer info by key_image";
      return true;

    }
  }
  std::string json_details = epee::serialization::store_t_to_json(td);
  m_cmd_binder.message() << "related transfer info:[" << i << "] " << ENDL << json_details;

  return true;
}
//----------------------------------------------------------------------------------------------------
bool simple_wallet::show_payments(const std::vector<std::string> &args)
{
  if(args.empty())
  {
    m_cmd_binder.fail() << "expected at least one payment_id";
    return true;
  }

  m_cmd_binder.message() << "                            payment                             \t" <<
    "                          transaction                           \t" <<
    "  height\t       amount        \tunlock time";

  bool payments_found = false;
  for(std::string arg : args)
  {
    currency::bc_payment_id payment_id;
    bool r=payment_id.from_hex(arg);
    if (!r)
    {
      m_cmd_binder.fail() << "payment id error parser from hex: \"" << arg << "\"";
      return true;
    }
    std::list<tools::wallet2::payment_details> payments;
    m_wallet->get_payments(payment_id, payments);
    if (payments.empty())
    {
      m_cmd_binder.message() << "No payments with id " << arg;
      continue;
    }

    for (const tools::wallet2::payment_details& pd : payments)
    {
      if (!payments_found)
      {
        payments_found = true;
      }
      m_cmd_binder.success() <<
        arg << '\t' <<
        pd.m_tx_hash << '\t' <<
        std::setw(8) << pd.m_block_height << '\t' <<
        std::setw(21) << print_money(pd.m_amount) << '\t' <<
        pd.m_unlock_time;
    }
//     else
//     {
//       m_cmd_binder.fail() << "payment id has invalid format: \"" << arg << "\", expected 64-character string";
//     }
  }

  return true;
}
//------------------------------------------------------------------------------------------------------------------
uint64_t simple_wallet::get_daemon_blockchain_height(std::string& err)
{
  COMMAND_RPC_GET_HEIGHT::request req;
  COMMAND_RPC_GET_HEIGHT::response res = boost::value_initialized<COMMAND_RPC_GET_HEIGHT::response>();
  bool r = net_utils::invoke_http_json_remote_command2(m_daemon_address + "/getheight", req, res, m_http_client);
  err = interpret_rpc_response(r, res.status);
  return res.height;
}
//----------------------------------------------------------------------------------------------------
bool simple_wallet::show_blockchain_height(const std::vector<std::string>& args)
{
  if (!try_connect_to_daemon())
    return true;

  std::string err;
  uint64_t bc_height = get_daemon_blockchain_height(err);
  if (err.empty())
    m_cmd_binder.message() << bc_height;
  else
    m_cmd_binder.fail() << "failed to get blockchain height: " << err;
  return true;
}
//----------------------------------------------------------------------------------------------------
bool simple_wallet::show_wallet_bcheight(const std::vector<std::string>& args)
{

  uint64_t bc_height = m_wallet->get_blockchain_current_height();
  m_cmd_binder.message() << bc_height;
  return true;
}
//----------------------------------------------------------------------------------------------------
bool simple_wallet::transfer(const std::vector<std::string> &args_)
{
  if (!try_connect_to_daemon())
    return true;

  std::vector<std::string> local_args = args_;
  if(local_args.size() < 3)
  {
    m_cmd_binder.fail() << "wrong number of arguments, expected at least 3, got " << local_args.size();
    return true;
  }

  size_t fake_outs_count;
  if(!string_tools::get_xtype_from_string(fake_outs_count, local_args[0]))
  {
    m_cmd_binder.fail() << "mixin_count should be non-negative integer, got " << local_args[0];
    return true;
  }
  local_args.erase(local_args.begin());

  
  currency::bc_payment_id payment_id;
  if (1 == local_args.size() % 2)
  {
    std::string payment_id_hex=local_args.back();
    if (!payment_id.from_hex(payment_id_hex))
    {
      m_cmd_binder.fail() << "payment id bad hex: " << payment_id_hex;
      return true;
    }
    local_args.pop_back();
  }

  if (!payment_id.is_size_ok())
  {
    m_cmd_binder.fail() << "payment id is too long: " << payment_id.id.size() << " bytes, max allowed: " << BC_PAYMENT_ID_SERVICE_SIZE_MAX;
    return true;
  }

  vector<currency::tx_destination_entry> dsts;
  for (size_t i = 0; i < local_args.size(); i += 2) 
  {
    currency::bc_payment_id embedded_payment_id;
    currency::tx_destination_entry de;
    de.addr.resize(1);
    if(!(de.addr.size() == 1 && m_wallet->get_transfer_address(local_args[i], de.addr.front(), embedded_payment_id)))
    {
      m_cmd_binder.fail() << "wrong address: " << local_args[i];
      return true;
    }

    if (local_args.size() <= i + 1)
    {
      m_cmd_binder.fail() << "amount for the last address " << local_args[i] << " is not specified";
      return true;
    }

    bool ok = currency::parse_amount(de.amount, local_args[i + 1]);
    if(!ok || 0 == de.amount)
    {
      m_cmd_binder.fail() << "amount is wrong: " << local_args[i] << ' ' << local_args[i + 1] <<
        ", expected number from 0 to " << print_money(std::numeric_limits<uint64_t>::max());
      return true;
    }

    if (!embedded_payment_id.empty())
    {
      if (!payment_id.empty())
      {
        m_cmd_binder.fail() << "address " + local_args[i] + " has embedded payment id \"" + embedded_payment_id.get_hex() + "\" which conflicts with previously set payment id: \"" << payment_id.get_hex() << "\"";
        return true;
      }
      payment_id = embedded_payment_id;
    }

    dsts.push_back(de);
  }


  std::vector<currency::attachment_v> attachments;
  if (!set_payment_id_to_tx(attachments, payment_id))
  {
    m_cmd_binder.fail() << "provided (or embedded) payment id can't be set: \"" << payment_id.get_hex() << "\"";
    return true;
  }

  try
  {
    currency::transaction tx;
    std::vector<extra_v> extra;
    m_wallet->transfer(dsts, fake_outs_count, 0, m_wallet->get_core_runtime_config().tx_default_fee, extra, attachments, tx);
    if (!m_wallet->is_watch_only())
      m_cmd_binder.success() << "Money successfully sent, transaction " << get_transaction_hash(tx) << ", " << get_object_blobsize(tx) << " bytes";
    else
      m_cmd_binder.success() << "Transaction prepared for signing and saved into \"virie_tx_unsigned\" file, use full wallet to sign transfer and then use \"submit_transfer\" on this wallet to broadcast the transaction to the network";
  }
  catch (const tools::error::daemon_busy&)
  {
    m_cmd_binder.fail() << "daemon is busy. Please try later";
  }
  catch (const tools::error::no_connection_to_daemon&)
  {
    m_cmd_binder.fail() << "no connection to daemon. Please, make sure daemon is running.";
  }
  catch (const tools::error::wallet_rpc_error& e)
  {
    LOG_ERROR("Unknown RPC error: " << e.to_string());
    m_cmd_binder.fail() << "RPC error \"" << e.what() << '"';
  }
  catch (const tools::error::get_random_outs_error&)
  {
    m_cmd_binder.fail() << "failed to get random outputs to mix";
  }
  catch (const tools::error::not_enough_money& e)
  {
    m_cmd_binder.fail() << "not enough money to transfer, available only " << print_money(e.available()) <<
      ", transaction amount " << print_money(e.tx_amount() + e.fee()) << " = " << print_money(e.tx_amount()) <<
      " + " << print_money(e.fee()) << " (fee)";
  }
  catch (const tools::error::not_enough_outs_to_mix& e)
  {
    auto writer = m_cmd_binder.fail();
    writer << "not enough outputs for specified mixin_count = " << e.mixin_count() << ":";
    for (const currency::COMMAND_RPC_GET_RANDOM_OUTPUTS_FOR_AMOUNTS::outs_for_amount& outs_for_amount : e.scanty_outs())
    {
      writer << "\noutput amount = " << print_money(outs_for_amount.amount) << ", fount outputs to mix = " << outs_for_amount.outs.size();
    }
  }
  catch (const tools::error::tx_not_constructed&)
  {
    m_cmd_binder.fail() << "transaction was not constructed";
  }
  catch (const tools::error::tx_rejected& e)
  {
    m_cmd_binder.fail() << "transaction " << get_transaction_hash(e.tx()) << " was rejected by daemon with status \"" << e.status() << '"';
  }
  catch (const tools::error::tx_sum_overflow& e)
  {
    m_cmd_binder.fail() << e.what();
  }
  catch (const tools::error::tx_too_big& e)
  {
    currency::transaction tx = e.tx();
    m_cmd_binder.fail() << "transaction " << get_transaction_hash(e.tx()) << " is too big. Transaction size: " <<
      get_object_blobsize(e.tx()) << " bytes, transaction size limit: " << e.tx_size_limit() << " bytes. Try to separate this payment into few smaller transfers.";
  }
  catch (const tools::error::zero_destination&)
  {
    m_cmd_binder.fail() << "one of destinations is zero";
  }
  catch (const tools::error::transfer_error& e)
  {
    LOG_ERROR("unknown transfer error: " << e.to_string());
    m_cmd_binder.fail() << "unknown transfer error: " << e.what();
  }
  catch (const tools::error::wallet_internal_error& e)
  {
    LOG_ERROR("internal error: " << e.to_string());
    m_cmd_binder.fail() << "internal error: " << e.what();
  }
  catch (const std::exception& e)
  {
    LOG_ERROR("unexpected error: " << e.what());
    m_cmd_binder.fail() << "unexpected error: " << e.what();
  }
  catch (...)
  {
    LOG_ERROR("Unknown error");
    m_cmd_binder.fail() << "unknown error";
  }

  return true;
}
//----------------------------------------------------------------------------------------------------
bool simple_wallet::run()
{
  std::string addr_start = m_wallet->get_account().get_public_address_str().substr(0, 6);
  return m_cmd_binder.run_handling("[" + std::string(CURRENCY_NAME_BASE) + (m_wallet->is_watch_only() ? "WO" : "") + " wallet " + addr_start + "]: ", "");
}
//----------------------------------------------------------------------------------------------------
void simple_wallet::stop()
{
  m_cmd_binder.stop_handling();
  m_wallet->stop();
}
//----------------------------------------------------------------------------------------------------
bool simple_wallet::print_address(const std::vector<std::string> &args/* = std::vector<std::string>()*/)
{
  m_cmd_binder.message() << m_wallet->get_account().get_public_address_str();
  return true;
}
//----------------------------------------------------------------------------------------------------
bool simple_wallet::resync_wallet(const std::vector<std::string> &args/* = std::vector<std::string>()*/)
{
  if (args.size() > 1)
  {
    LOG_ERROR("too many arguments ");
    return false;
  }
  if (!args.empty())
  {
    time_t time = 0;
    if (epee::misc_utils::get_restore_time_from_str(time, args.at(0)))
    {
      m_wallet->get_account().set_createtime(time);
    }
    else
    {
      LOG_ERROR("Time argument have wrong format");
      return false;
    }
  }
  m_wallet->reset_history();
  return true;
}
//----------------------------------------------------------------------------------------------------
bool simple_wallet::process_command(const std::vector<std::string> &args)
{
  return m_cmd_binder.process_command_vec(args);
}
//----------------------------------------------------------------------------------------------------
bool simple_wallet::integrated_address(const std::vector<std::string> &args)
{
  if (args.size() > 1)
  {
    m_cmd_binder.fail() << "none or one argument expected, " << args.size() << " provided";
    return true;
  }

  if (args.size() == 1)
  {
    std::string addr_or_payment_id_hex = args[0];
    currency::account_public_address addr = AUTO_VAL_INIT(addr);
    currency::bc_payment_id embedded_payment_id;
    if (currency::get_account_address_and_payment_id_from_str(addr, embedded_payment_id, addr_or_payment_id_hex))
    {
      // address provided
      if (embedded_payment_id.empty())
      {
        m_cmd_binder.message() << addr_or_payment_id_hex << " is a standard address";
        return true;
      }
      m_cmd_binder.success() << "integrated address:       " << addr_or_payment_id_hex;
      m_cmd_binder.message() << "standard address:         " << get_account_address_as_str(addr);
      m_cmd_binder.message() << "payment id (" << std::setw(3) << embedded_payment_id.id.size() << " bytes) :  " << epee::string_tools::mask_non_ascii_chars(embedded_payment_id.id);
      m_cmd_binder.message() << "payment id (hex-encoded): " << embedded_payment_id.get_hex();
      return true;
    }

    // seems like not a valid address, treat as payment id
    currency::bc_payment_id payment_id;
    if (!payment_id.from_hex(addr_or_payment_id_hex))
    {
      m_cmd_binder.fail() << "invalid payment id given: \'" << addr_or_payment_id_hex << "\', hex-encoded string was expected";
      return true;
    }

    if (!payment_id.is_size_ok())
    {
      m_cmd_binder.fail() << "payment id is too long: " << payment_id.id.size() << " bytes, max allowed: " << BC_PAYMENT_ID_SERVICE_SIZE_MAX << " bytes";
      return true;
    }
    m_cmd_binder.message() << "this wallet standard address: " << m_wallet->get_account().get_public_address_str();
    m_cmd_binder.message() << "payment id: (" << std::setw(3) << payment_id.id.size() << " bytes) :     " << epee::string_tools::mask_non_ascii_chars(payment_id.id);
    m_cmd_binder.message() << "payment id (hex-encoded):     " << payment_id.get_hex();
    m_cmd_binder.success() << "integrated address:           " << get_account_address_and_payment_id_as_str(m_wallet->get_account().get_public_address(), payment_id);
    return true;
  }

  // args.size() == 0
  currency::bc_payment_id payment_id{std::string(8, ' ')};
  crypto::generate_random_bytes(payment_id.id.size(), &payment_id.id.front()); //TODO:move into bc_payments_id.h method generate
  m_cmd_binder.message() << "this wallet standard address:       " << m_wallet->get_account().get_public_address_str();
  m_cmd_binder.message() << "generated payment id (hex-encoded): " << payment_id.get_hex();
  m_cmd_binder.success() << "integrated address:                 " << get_account_address_and_payment_id_as_str(m_wallet->get_account().get_public_address(), payment_id);

  return true;
}
//----------------------------------------------------------------------------------------------------
bool simple_wallet::print_brain_wallet(const std::vector<std::string> &)
{
  m_cmd_binder.message() << "Brain wallet: " << m_wallet->get_account().get_restore_braindata() << std::endl << std::flush;
  m_cmd_binder.warning() << "Print this phrase out or write it down and save it in a secret place. This phrase will allow you to recover the safe even if you lose the safe file or forget the password to the safe.";
  return true;
}
//----------------------------------------------------------------------------------------------------
bool simple_wallet::print_spend_key(const std::vector<std::string> &)
{
  if (m_wallet->is_watch_only())
  {
    m_cmd_binder.fail() << "Wallet is watch-only and has no spend key";
    return true;
  }
  m_cmd_binder.warning() << "Be careful not to share this information with third parties.";
  auto &keys = m_wallet->get_account().get_keys();
  auto priv = string_tools::pod_to_hex(keys.m_spend_secret_key);
  auto pub = string_tools::pod_to_hex(keys.m_account_address.m_spend_public_key);
  m_cmd_binder.message() << "secret: " << priv << epee::flush;
  m_cmd_binder.message() << "public: " << pub << epee::flush;
  return true;
}
//----------------------------------------------------------------------------------------------------
bool simple_wallet::print_view_key(const std::vector<std::string> &)
{
  m_cmd_binder.warning() << "Be careful not to share this information with third parties.";
  auto &keys = m_wallet->get_account().get_keys();
  auto priv = string_tools::pod_to_hex(keys.m_view_secret_key);
  auto pub = string_tools::pod_to_hex(keys.m_account_address.m_view_public_key);
  m_cmd_binder.message() << "secret: " << priv << epee::flush;
  m_cmd_binder.message() << "public: " << pub << epee::flush;
  return true;
}
//----------------------------------------------------------------------------------------------------
bool simple_wallet::print_info(const std::vector<std::string> &)
{
  auto genesis_id = m_wallet->get_genesis_hash();
  time_t timestamp = m_wallet->get_account().get_createtime();
  std::string date;
  epee::misc_utils::get_restore_str_from_time(date, timestamp);

  m_cmd_binder.message() << "wallet: " << (m_wallet->is_watch_only() ? "watch only" : "normal wallet") << std::endl
    << "secret phrase: " << (m_wallet->get_account().get_restore_data().size() > 0 ? "exists" : "not exists") << std::endl
    << "date of creation: " << date << std::endl
    << "genesis hash: " << ((genesis_id == null_hash) ? "not exists" : epee::string_tools::pod_to_hex(genesis_id)) << std::endl
    << "current hight: " << m_wallet->get_blockchain_current_height();
  return true;
}
//----------------------------------------------------------------------------------------------------
bool simple_wallet::sign_transfer(const std::vector<std::string> &args)
{
  if (m_wallet->is_watch_only())
  {
    m_cmd_binder.fail() << "You can't sign transaction in watch-only wallet";
    return true;
  }

  if (args.size() < 2)
  {
    m_cmd_binder.fail() << "wrong parameters, expected: <unsigned_tx_file> <signed_tx_file>";
    return true;
  }
  try
  {
    currency::transaction res_tx;
    m_wallet->sign_transfer_files(args[0], args[1], res_tx);
    m_cmd_binder.success() << "transaction signed and stored to file: " << args[1] << ", transaction " << get_transaction_hash(res_tx) << ", " << get_object_blobsize(res_tx) << " bytes";
  }
  catch (const std::exception& e)
  {
    LOG_ERROR("unexpected error: " << e.what());
    m_cmd_binder.fail() << "unexpected error: " << e.what();
  }
  catch (...)
  {
    LOG_ERROR("Unknown error");
    m_cmd_binder.fail() << "unknown error";
  }
  return true;
}
//----------------------------------------------------------------------------------------------------
bool simple_wallet::submit_transfer(const std::vector<std::string> &args)
{
  if (args.size() < 1)
  {
    m_cmd_binder.fail() << "wrong parameters, expected filename";
    return true;
  }
  if (m_offline_mode)
  {
    m_cmd_binder.message() << "submit_transfer is impossible in OFFLINE MODE";
    return true;
  }
  try
  {
    currency::transaction res_tx;
    m_wallet->submit_transfer_files(args[0], res_tx);
    m_cmd_binder.success() << "transaction " << get_transaction_hash(res_tx) << " was successfully sent, size: " << get_object_blobsize(res_tx) << " bytes";
  }
  catch (const std::exception& e)
  {
    LOG_ERROR("unexpected error: " << e.what());
    m_cmd_binder.fail() << "unexpected error: " << e.what();
  }
  catch (...)
  {
    LOG_ERROR("Unknown error");
    m_cmd_binder.fail() << "unknown error";
  }
  return true;
}
//----------------------------------------------------------------------------------------------------
bool simple_wallet::stat_transfers(const std::vector<std::string> &args)
{
  auto mw = m_cmd_binder.message_log();
  m_wallet->print_free_transfers(mw);
  return true;
}
//----------------------------------------------------------------------------------------------------
bool simple_wallet::locked_transfers(const std::vector<std::string> &args)
{
  auto mw = m_cmd_binder.message_log();
  m_wallet->print_locked_transfers(mw);
  return true;
}
//----------------------------------------------------------------------------------------------------

#ifdef WIN32
int wmain(int argc, wchar_t* argv_original[]){
#else
int main(int argc, char* argv_original[]){
#endif

  auto argv_processor = command_line::make_argv_processor(argc, argv_original);
  char ** argv = argv_processor.get_argv();
  argv_processor.hide_secret(arg_password.name);
  argv_processor.hide_secret(arg_brain_wallet.name);

#ifdef WIN32
  _CrtSetDbgFlag ( _CRTDBG_ALLOC_MEM_DF | _CRTDBG_LEAK_CHECK_DF );
#endif

  tools::signal_handler::install_fatal([](int sig_number, void* address) {
    console_handlers_binder::fail_log() << "\n\nFATAL ERROR\nsig: " << sig_number << ", address: " << address;
  });

  {
    const auto count_opened_fds = tools::get_opened_fds();
    if (OPENED_DESCRIPTORS_BEFORE_START < count_opened_fds)
    {
      LOG_PRINT_RED_L0("count opened file descripters: " << count_opened_fds << ", maybe memory leak");
    }
  }

  bool restart = false;

  //TRY_ENTRY();
  { // for RAII
    string_tools::set_module_name_and_folder(argv[0]);

    po::options_description desc_general("General options");
    command_line::add_arg(desc_general, command_line::arg_help);
    command_line::add_arg(desc_general, command_line::arg_version);
    command_line::add_arg(desc_general, command_line::arg_version_libs);
    command_line::add_arg(desc_general, command_line::arg_log_level);
    command_line::add_arg(desc_general, command_line::arg_log_channels);

    po::options_description desc_params("Wallet options");
    command_line::add_arg(desc_params, arg_wallet_file);
    command_line::add_arg(desc_params, arg_generate_new_wallet);
    command_line::add_arg(desc_params, arg_restore_wallet);
    command_line::add_arg(desc_params, arg_restore_wo_wallet);
    command_line::add_arg(desc_params, arg_password);
    command_line::add_arg(desc_params, arg_daemon_address);
    command_line::add_arg(desc_params, arg_daemon_host);
    command_line::add_arg(desc_params, arg_daemon_port);
    command_line::add_arg(desc_params, arg_command);
    command_line::add_arg(desc_params, arg_dont_refresh);
    command_line::add_arg(desc_params, arg_dont_set_date);
    command_line::add_arg(desc_params, arg_print_brain_wallet);
    command_line::add_arg(desc_params, arg_brain_wallet);
    command_line::add_arg(desc_params, arg_offline_mode);
    command_line::add_arg(desc_params, arg_pos_mining_reward_address);
    command_line::add_arg(desc_params, arg_disable_upnp);
    command_line::add_arg(desc_params, arg_rpc_external_port);

    tools::wallet_rpc_server::init_options(desc_params);

    po::positional_options_description positional_options;
    positional_options.add(arg_command.name, -1);

    po::options_description desc_all;
    desc_all.add(desc_general).add(desc_params);
    po::variables_map vm;

    std::shared_ptr<simple_wallet> sw(new simple_wallet);

    bool r = command_line::handle_error_helper(desc_all, [&]()
    {
      po::store(command_line::parse_command_line(argc, argv, desc_general, true), vm);

      if (command_line::get_arg(vm, command_line::arg_help))
      {
        console_handlers_binder::message()
            << "Usage: simplewallet [--wallet-file=<file>|"
               "--generate-new-wallet=<file>|"
               "--restore-wallet=<file>|"
               "--restore-wo-wallet=<file>] [other options] [<COMMAND>]";
        console_handlers_binder::message() << desc_all << '\n' << sw->get_commands_str();
        return false;
      }
      else if (command_line::has_arg(vm, command_line::arg_version))
      {
        console_handlers_binder::message() << CURRENCY_NAME << " wallet v" << PROJECT_VERSION_LONG;
        return false;
      }
      else if (command_line::has_arg(vm, command_line::arg_version_libs))
      {
        auto mr = console_handlers_binder::message();
        deps_version::print_deps_version(mr);
        return false;
      }

      //set up logging options
      log_space::get_set_log_detalisation_level(true, LOG_LEVEL_2);
      log_space::log_singletone::add_logger(LOGGER_FILE, log_space::log_singletone::get_default_log_file().c_str(),
                                            log_space::log_singletone::get_default_log_folder().c_str(), LOG_LEVEL_MAX);

      if (command_line::has_arg(vm, command_line::arg_log_level))
      {
        int log_level = command_line::get_arg(vm, command_line::arg_log_level);
        if (log_space::check_log_level(log_level))
        {
          LOG_PRINT_L0("Setting log level = " << log_level);
          log_space::get_set_log_detalisation_level(true, log_level);
        }
      }

      if (command_line::has_arg(vm, command_line::arg_log_channels))
        log_space::log_singletone::enable_channels(command_line::get_arg(vm, command_line::arg_log_channels));

      auto parser = po::command_line_parser(argc, argv).options(desc_params).positional(positional_options);
      po::store(parser.run(), vm);
      po::notify(vm);
      return true;
    });
    if (!r)
      return EXIT_FAILURE;

    console_handlers_binder::message_log(epee::colored_cout::console_colors::console_color_white, true) << CURRENCY_NAME << " wallet v" << PROJECT_VERSION_LONG;

    r = sw->init(vm);
    CHECK_AND_ASSERT_MES(r, EXIT_FAILURE, "Failed to initialize wallet");

    if (!sw->was_opened())
      return EXIT_FAILURE;

#ifdef TESTNET
    LOG_PRINT_YELLOW("Warning, test net: " << CURRENCY_NAME_SHORT, LOG_LEVEL_0);
#endif

    tools::upnp_launcher upnp_launcher;
    if (sw->is_rpc_mode())
    {
      log_space::log_singletone::add_logger(LOGGER_CONSOLE, nullptr, nullptr, LOG_LEVEL_2);

      LOG_PRINT_L0("Starting wallet RPC server...");
      auto *w = sw->get_wallet();
      CHECK_AND_ASSERT_MES(w, EXIT_FAILURE, "Wallet is not opened");
      tools::wallet_rpc_server wrpc(*w);
      r = wrpc.init(vm);
      CHECK_AND_ASSERT_MES(r, EXIT_FAILURE, "Failed to initialize wallet rpc server");
      tools::signal_handler::install([&wrpc] {
        LOG_PRINT_L0("System signal is given.");
        wrpc.send_stop_signal();
      });
      if (!command_line::get_arg(vm, arg_disable_upnp))
      {
        upnp_launcher.register_mapping(wrpc.get_binded_address(), wrpc.get_binded_port(),
                                       command_line::get_arg(vm, arg_rpc_external_port));
        if (upnp_launcher.launch())
          LOG_PRINT_L0("Starting UPnP");
      }
#ifndef WIN32
      tools::signal_handler::install_restart([&restart, &wrpc]
      {
        restart = true;
        wrpc.send_stop_signal();
      });
#endif
      LOG_PRINT_L0("Starting wallet rpc server");
      wrpc.run(sw->is_offline_mode(), sw->get_miner_address());
      LOG_PRINT_L0("Stopped wallet rpc server");
    }
    else
    {
      std::vector<std::string> command = command_line::get_arg(vm, arg_command);
      if (!command.empty())
      {
        sw->process_command(command);
        sw->stop();
      }
      else
      {
        tools::signal_handler::install([sw] { sw->stop(); });
        sw->run();
      }
    }
    sw->deinit();
  }
  //CATCH_ENTRY_L0("main", 1);
  if (restart)
  {
    LOG_PRINT("simplewallet restarting.", LOG_LEVEL_0);
    log_space::log_singletone::remove_logger(LOGGER_FILE);
    tools::restart_app(argv_processor.get_argv_original());
    LOG_PRINT("simplewallet restart was fault.", LOG_LEVEL_0);
  }
  return EXIT_SUCCESS;
}
