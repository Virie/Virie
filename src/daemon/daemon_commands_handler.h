// Copyright (c) 2014-2020 The Virie Project
// Copyright (c) 2012-2013 The Cryptonote developers
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#pragma once

#include <boost/lexical_cast.hpp>

#include "console_handler.h"
#include "p2p/net_node.h"
#include "currency_protocol/currency_protocol_handler.h"
#include "common/util.h"
#include "crypto/hash.h"
#include "warnings.h"
#include "currency_core/bc_offers_service.h"

PUSH_WARNINGS
DISABLE_VS_WARNINGS(4100)

class daemon_cmmands_handler : public currency::i_stop_handler
{
  typedef nodetool::node_server<currency::t_currency_protocol_handler<currency::core> > srv_type;
  srv_type& m_srv;
  currency::core_rpc_server& m_rpc;
  typedef epee::srv_console_handlers_binder<nodetool::node_server<currency::t_currency_protocol_handler<currency::core> > > cmd_binder_type;
  cmd_binder_type m_cmd_binder;
public:
  daemon_cmmands_handler(nodetool::node_server<currency::t_currency_protocol_handler<currency::core> >& srv, currency::core_rpc_server& rpc) :m_srv(srv), m_rpc(rpc)
  {
    m_cmd_binder.set_handler("print_pl", boost::bind(&daemon_cmmands_handler::print_pl, this, _1), "Print peer list");
    m_cmd_binder.set_handler("print_sn", boost::bind(&daemon_cmmands_handler::print_sn, this, _1), "Print seed nodes list");
    m_cmd_binder.set_handler("print_cn", boost::bind(&daemon_cmmands_handler::print_cn, this, _1), "Print connections");
    m_cmd_binder.set_handler("print_cn_history", boost::bind(&daemon_cmmands_handler::print_cn_history, this, _1), "Print connections history");
    m_cmd_binder.set_handler("print_bc", boost::bind(&daemon_cmmands_handler::print_bc, this, _1), "Print blockchain info in a given blocks range, print_bc <begin_height> [<end_height>]");
    m_cmd_binder.set_handler("print_bc_tx", boost::bind(&daemon_cmmands_handler::print_bc_tx, this, _1), "Print blockchain info with trnsactions in a given blocks range, print_bc <begin_height> [<end_height>]");
    //m_cmd_binder.set_handler("print_bci", boost::bind(&daemon_cmmands_handler::print_bci, this, _1));
    m_cmd_binder.set_handler("print_bc_outs", boost::bind(&daemon_cmmands_handler::print_bc_outs, this, _1));
    m_cmd_binder.set_handler("print_market", boost::bind(&daemon_cmmands_handler::print_market, this, _1));
    m_cmd_binder.set_handler("print_bc_outs_stat", boost::bind(&daemon_cmmands_handler::print_bc_outs_stat, this, _1));    
    m_cmd_binder.set_handler("print_block", boost::bind(&daemon_cmmands_handler::print_block, this, _1), "Print block, print_block <block_hash> | <block_height>");
    m_cmd_binder.set_handler("print_tx", boost::bind(&daemon_cmmands_handler::print_tx, this, _1), "Print transaction, print_tx <transaction_hash>");
    m_cmd_binder.set_handler("start_mining", boost::bind(&daemon_cmmands_handler::start_mining, this, _1), "Start mining for specified address, start_mining <addr> [threads=1]");
    m_cmd_binder.set_handler("stop_mining", boost::bind(&daemon_cmmands_handler::stop_mining, this, _1), "Stop mining");
    m_cmd_binder.set_handler("print_pool", boost::bind(&daemon_cmmands_handler::print_pool, this, _1), "Print transaction pool (long format)");
    m_cmd_binder.set_handler("print_pool_sh", boost::bind(&daemon_cmmands_handler::print_pool_sh, this, _1), "Print transaction pool (short format)");
    m_cmd_binder.set_handler("clear_pool", boost::bind(&daemon_cmmands_handler::clear_pool, this, _1), "Clear pool");
    m_cmd_binder.set_handler("show_hr", boost::bind(&daemon_cmmands_handler::show_hr, this, _1), "Start showing hash rate");
    m_cmd_binder.set_handler("hide_hr", boost::bind(&daemon_cmmands_handler::hide_hr, this, _1), "Stop showing hash rate");
    m_cmd_binder.set_handler("save", boost::bind(&daemon_cmmands_handler::save, this, _1), "Save blockchain");
    m_cmd_binder.set_handler("print_daemon_stat", boost::bind(&daemon_cmmands_handler::print_daemon_stat, this, _1), "Print daemon stat");
    m_cmd_binder.set_handler("print_debug_stat", boost::bind(&daemon_cmmands_handler::print_debug_stat, this, _1), "Print debug stat info");
    m_cmd_binder.set_handler("get_transactions_statics", boost::bind(&daemon_cmmands_handler::get_transactions_statistics, this, _1), "Calculates transactions statistics");
    m_cmd_binder.set_handler("force_relay_tx_pool", boost::bind(&daemon_cmmands_handler::force_relay_tx_pool, this, _1), "re-relay all transactions from pool");
    m_cmd_binder.set_handler("clear_cache", boost::bind(&daemon_cmmands_handler::clear_cache, this, _1), "Clear blockchain storage cache");
    m_cmd_binder.set_handler("clear_altblocks", boost::bind(&daemon_cmmands_handler::clear_altblocks, this, _1), "Clear blockchain storage cache");
    m_cmd_binder.set_handler("truncate_bc", boost::bind(&daemon_cmmands_handler::truncate_bc, this, _1), "Truncate blockchain to specified height");
    m_cmd_binder.set_handler("inspect_block_index", boost::bind(&daemon_cmmands_handler::inspect_block_index, this, _1), "Inspects block index for internal errors");
    m_cmd_binder.set_handler("print_db_performance_data", boost::bind(&daemon_cmmands_handler::print_db_performance_data, this, _1), "Dumps all db containers performance counters");
    m_cmd_binder.set_handler("search_by_id", boost::bind(&daemon_cmmands_handler::search_by_id, this, _1), "Search all possible elemets by given id");
    m_cmd_binder.set_handler("find_key_image", boost::bind(&daemon_cmmands_handler::find_key_image, this, _1), "Try to find tx related to key_image");
    m_cmd_binder.set_handler("rescan_aliases", boost::bind(&daemon_cmmands_handler::rescan_aliases, this, _1), "Debug function");
    m_cmd_binder.set_handler("forecast_difficulty", boost::bind(&daemon_cmmands_handler::forecast_difficulty, this, _1), "Prints PoW and PoS difficulties for as many future blocks as possible based on current conditions");
    m_cmd_binder.set_handler("print_deadlock_guard", boost::bind(&daemon_cmmands_handler::print_deadlock_guard, this, _1), "Print all threads which is blocked or involved in mutex ownership");
    m_cmd_binder.set_handler("print_maintainers", boost::bind(&daemon_cmmands_handler::print_maintainers, this, _1), "Print maintainers info");
    m_cmd_binder.set_handler("print_blocklist", boost::bind(&daemon_cmmands_handler::print_blocklist, this, _1), "Print block list");
    m_cmd_binder.set_handler("clear_blocklist", boost::bind(&daemon_cmmands_handler::clear_blocklist, this, _1), "Clear block list");
    m_cmd_binder.set_handler("status", boost::bind(&daemon_cmmands_handler::status, this, _1), "Status");
  }

  bool start_handling()
  {
    m_cmd_binder.start_handling(&m_srv, "", "");
    return true;
  }

  // interface currency::i_stop_handler
  void stop_handling() override
  {
    m_cmd_binder.stop_handling();
  }

private:


//   //--------------------------------------------------------------------------------
//   std::string get_commands_str()
//   {
//     return m_cmd_binder.get_usage();
//   }
//   //--------------------------------------------------------------------------------
//   bool help(const std::vector<std::string>& /*args*/)
//   {
//     m_cmd_binder.message() << get_commands_str() << std::endl;
//     return true;
//   }
  //--------------------------------------------------------------------------------
  template<typename func_t>
  bool print_impl(func_t print_func)
  {
    std::stringstream os;
    print_func(os);
    m_cmd_binder.message() << os.str() << std::endl;
    return true;
  }
  //--------------------------------------------------------------------------------
  bool print_pl(const std::vector<std::string>& args)
  {
    return print_impl([this] (std::ostream &s) { m_srv.log_peerlist(s); });
  }
  //--------------------------------------------------------------------------------
  bool print_sn(const std::vector<std::string>& args)
  {
    return print_impl([this] (std::ostream &s) { this->m_srv.log_seeds(s); });
  }
  //--------------------------------------------------------------------------------
  bool save(const std::vector<std::string>& args)
  {
    return true;
  }
  //--------------------------------------------------------------------------------
  bool print_daemon_stat(const std::vector<std::string>& args)
  {
    currency::COMMAND_RPC_GET_INFO::request req = AUTO_VAL_INIT(req);
    req.flags = COMMAND_RPC_GET_INFO_FLAG_ALL_FLAGS;
    currency::COMMAND_RPC_GET_INFO::response resp = AUTO_VAL_INIT(resp);
    currency::core_rpc_server::connection_context cc = AUTO_VAL_INIT(cc);
    m_rpc.on_get_info(req, resp, cc);
    LOG_PRINT_L0("STAT INFO:" << ENDL << epee::serialization::store_t_to_json(resp).c_str());
    return true;
  }
  //--------------------------------------------------------------------------------
  bool print_debug_stat(const std::vector<std::string>& args)
  {
    currency::core_stat_info si = AUTO_VAL_INIT(si);
    currency::core_stat_info::params pr = AUTO_VAL_INIT(pr);
    pr.chain_len = 10;
    m_srv.get_payload_object().get_core().get_stat_info(pr, si);
    LOG_PRINT_GREEN("CORE_STAT_INFO: " << epee::serialization::store_t_to_json(si), LOG_LEVEL_0);

    return true;
  }
  //--------------------------------------------------------------------------------
  bool get_transactions_statistics(const std::vector<std::string>& args)
  {
    m_srv.get_payload_object().get_core().get_blockchain_storage().print_transactions_statistics();
    return true;
  }
  //--------------------------------------------------------------------------------
  bool force_relay_tx_pool(const std::vector<std::string>& args)
  {
    bool r = m_srv.get_payload_object().get_core().get_tx_pool().force_relay_pool();
    m_cmd_binder.message() << (r ? "Success" : "Failed") << std::endl;
    return r;
  }

  bool clear_cache(const std::vector<std::string>& args)
  {
    m_srv.get_payload_object().get_core().get_blockchain_storage().reset_db_cache();
    return true;
  }  
  bool clear_altblocks(const std::vector<std::string>& args)
  {
    m_srv.get_payload_object().get_core().get_blockchain_storage().clear_altblocks();
    return true;
  }
  
  //--------------------------------------------------------------------------------
  bool show_hr(const std::vector<std::string>& args)
  {
  if(!m_srv.get_payload_object().get_core().get_miner().is_mining()) 
  {
    m_cmd_binder.message() << "Mining is not started. You need start mining before you can see hash rate." << ENDL;
  } else 
  {
    m_srv.get_payload_object().get_core().get_miner().do_print_hashrate(true);
  }
    return true;
  }
  //--------------------------------------------------------------------------------
  bool hide_hr(const std::vector<std::string>& args)
  {
    m_srv.get_payload_object().get_core().get_miner().do_print_hashrate(false);
    return true;
  }
  //--------------------------------------------------------------------------------
  bool print_bc_outs(const std::vector<std::string>& args)
  {
    if(args.size() != 1)
    {
      m_cmd_binder.message() << "need file path as parameter" << ENDL;
      return true;
    }
    m_srv.get_payload_object().get_core().print_blockchain_outs(args[0]);
    return true;
  }
  //--------------------------------------------------------------------------------
  bool print_market(const std::vector<std::string>& args)
  {
    bc_services::bc_offers_service* offers_service = dynamic_cast<bc_services::bc_offers_service*>(m_srv.get_payload_object().get_core().get_blockchain_storage().get_attachment_services_manager().get_service_by_id(BC_OFFERS_SERVICE_ID));
    CHECK_AND_ASSERT_MES(offers_service != nullptr, false, "Offers service was not registered in attachment service manager!");

    offers_service->print_market(log_space::log_singletone::get_default_log_folder() + "/market.txt");
    return true;
  }
  //--------------------------------------------------------------------------------
  bool print_bc_outs_stat(const std::vector<std::string>& args)
  {
    m_srv.get_payload_object().get_core().get_blockchain_storage().print_blockchain_outs_stat();
    return true;
  }
  //--------------------------------------------------------------------------------
  bool print_cn(const std::vector<std::string>& args)
  {
    print_impl([this] (std::ostream &s) { m_srv.get_payload_object().log_connections(s); });
    return true;
  }
  //--------------------------------------------------------------------------------
  bool print_cn_history(const std::vector<std::string>& args)
  {
    print_impl([this] (std::ostream &s) { m_srv.get_payload_object().log_connections_history(s); });
    return true;
  }
  //--------------------------------------------------------------------------------
  bool print_bc(const std::vector<std::string>& args)
  {
    if(!args.size())
    {
      m_cmd_binder.message() << "need block index parameter" << ENDL;
      return false;
    }
    uint64_t start_index = 0;
    uint64_t end_block_parametr = m_srv.get_payload_object().get_core().get_current_blockchain_size();
    if(!string_tools::get_xtype_from_string(start_index, args[0]))
    {
      m_cmd_binder.message() << "wrong starter block index parameter" << ENDL;
      return false;
    }
    if(args.size() >1 && !string_tools::get_xtype_from_string(end_block_parametr, args[1]))
    {
      m_cmd_binder.message() << "wrong end block index parameter" << ENDL;
      return false;
    }

    print_impl([this, start_index, end_block_parametr] (std::ostream &s) {
      m_srv.get_payload_object().get_core().print_blockchain(s, start_index, end_block_parametr);
    });
    return true;
  }
  //--------------------------------------------------------------------------------
  bool truncate_bc(const std::vector<std::string>& args)
  {
    if (!args.size())
    {
      m_cmd_binder.message() << "truncate height needed" << ENDL;
      return false;
    }
    uint64_t tr_h = 0;
    if (!string_tools::get_xtype_from_string(tr_h, args[0]))
    {
      m_cmd_binder.message() << "wrong truncate index" << ENDL;
      return false;
    }

    m_srv.get_payload_object().get_core().get_blockchain_storage().truncate_blockchain(tr_h);
    return true;
  }
  bool inspect_block_index(const std::vector<std::string>& args)
  {
    m_srv.get_payload_object().get_core().get_blockchain_storage().inspect_blocks_index();
    return true;
  }
  bool print_db_performance_data(const std::vector<std::string>& args)
  {
    return print_impl([this] (std::ostream &s) {
      m_srv.get_payload_object().get_core().get_blockchain_storage().print_db_cache_perfeormance_data(s);
    });
  }
  //--------------------------------------------------------------------------------
  bool search_by_id(const std::vector<std::string>& args)
  {

    if (!args.size())
    {
      m_cmd_binder.message() << "need ID parameter" << ENDL;
      return false;
    }
    crypto::hash id = currency::null_hash;
    if (!parse_hash256(args[0], id))
    {
      m_cmd_binder.message() << "specified ID parameter '"<< args[0] << "' is wrong" << ENDL;
      return false;
    }
    std::list<std::string> res_list;
    m_srv.get_payload_object().get_core().get_blockchain_storage().search_by_id(id, res_list);
    std::string joined = boost::algorithm::join(res_list, "|");
    LOG_PRINT_L0("Result of search: " << joined);
    return true;
  }
  //--------------------------------------------------------------------------------
  bool find_key_image(const std::vector<std::string>& args)
  {

    if (!args.size())
    {
      m_cmd_binder.message() << "need key_image parameter" << ENDL;
      return false;
    }
    crypto::key_image ki = currency::null_ki;
    if (!epee::string_tools::parse_tpod_from_hex_string(args[0], ki))
    {
      m_cmd_binder.message() << "specified key_image parameter '" << args[0] << "' is wrong" << ENDL;
      return false;
    }
    std::list<std::string> res_list;
    crypto::hash tx_id = currency::null_hash;
    auto tx_chain_entry = m_srv.get_payload_object().get_core().get_blockchain_storage().find_key_image_and_related_tx(ki, tx_id);

    if (tx_chain_entry)
    {
      LOG_PRINT_L0("Found tx: " << ENDL << obj_to_json_str(tx_chain_entry->tx) << ENDL << "height: " << tx_chain_entry->m_keeper_block_height);
    }
    if (tx_id == currency::null_hash)
    {
      LOG_PRINT_L0("Not found any related tx.");
    }
    else
    {
      LOG_PRINT_L0("TxID: " << tx_id);
    }
    return true;
  }
  //--------------------------------------------------------------------------------
  bool rescan_aliases(const std::vector<std::string>& args)
  {
    bool r = m_srv.get_payload_object().get_core().get_blockchain_storage().validate_all_aliases_for_new_median_mode();
    m_cmd_binder.message() << (r ? "Success" : "Failed") << std::endl;
    return r;
  }
  //--------------------------------------------------------------------------------
  bool print_bc_tx(const std::vector<std::string>& args)
  {
    if (!args.size())
    {
      m_cmd_binder.message() << "need block index parameter" << ENDL;
      return false;
    }
    uint64_t start_index = 0;
    uint64_t end_block_parametr = m_srv.get_payload_object().get_core().get_current_blockchain_size();
    if (!string_tools::get_xtype_from_string(start_index, args[0]))
    {
      m_cmd_binder.message() << "wrong starter block index parameter" << ENDL;
      return false;
    }
    if (args.size() > 1 && !string_tools::get_xtype_from_string(end_block_parametr, args[1]))
    {
      m_cmd_binder.message() << "wrong end block index parameter" << ENDL;
      return false;
    }
    LOG_PRINT_GREEN("Storing text to blockchain_with_tx.txt....", LOG_LEVEL_0);
    m_srv.get_payload_object().get_core().get_blockchain_storage().print_blockchain_with_tx(start_index, end_block_parametr);
    LOG_PRINT_GREEN("Done", LOG_LEVEL_0);
    return true;
  }
  //--------------------------------------------------------------------------------
  bool print_bci(const std::vector<std::string>& args)
  {
    m_srv.get_payload_object().get_core().print_blockchain_index();
    return true;
  }
  //--------------------------------------------------------------------------------
  template <typename T>
  static bool print_as_json(T& obj)
  {
    LOG_PRINT_L0(obj_to_json_str(obj) << ENDL);
    return true;
  }
  //--------------------------------------------------------------------------------
  bool print_block_by_height(uint64_t height)
  {
    std::list<currency::block> blocks;
    m_srv.get_payload_object().get_core().get_blocks(height, 1, blocks);

    if (1 == blocks.size())
    {
      currency::block& block = blocks.front();
      LOG_PRINT_GREEN("------------------ block_id: " << get_block_hash(block) << " ------------------" << ENDL << currency::obj_to_json_str(block), LOG_LEVEL_0);
    }
    else
    {
      uint64_t current_height;
      crypto::hash top_id;
      m_srv.get_payload_object().get_core().get_blockchain_top(current_height, top_id);
      LOG_PRINT_GREEN("block wasn't found. Current block chain height: " << current_height << ", requested: " << height, LOG_LEVEL_0);
      return false;
    }

    return true;
  }
  //--------------------------------------------------------------------------------
  bool print_block_by_hash(const std::string& arg)
  {
    crypto::hash block_hash;
    if (!parse_hash256(arg, block_hash))
    {
      return false;
    }

    //std::list<crypto::hash> block_ids;
    //block_ids.push_back(block_hash);
    //std::list<currency::block> blocks;
    //std::list<crypto::hash> missed_ids;
    currency::block_extended_info bei = AUTO_VAL_INIT(bei);
    bool r = m_srv.get_payload_object().get_core().get_blockchain_storage().get_block_extended_info_by_hash(block_hash, bei);
    //m_srv.get_payload_object().get_core().get_blocks(block_ids, blocks, missed_ids);

    if (r)
    {
//      currency::block& block = bei.bl;
      LOG_PRINT_GREEN("------------------ block_id: " << get_block_hash(bei.bl) << " ------------------" << ENDL << currency::obj_to_json_str(bei), LOG_LEVEL_0);
      m_srv.get_payload_object().get_core().get_blockchain_storage().calc_tx_cummulative_blob(bei.bl);
    }
    else
    {
      LOG_PRINT_GREEN("block wasn't found: " << arg, LOG_LEVEL_0);
      return false;
    }

    return true;
  }
  //--------------------------------------------------------------------------------
  bool print_block(const std::vector<std::string>& args)
  {
    if (args.empty())
    {
      m_cmd_binder.message() << "expected: print_block (<block_hash> | <block_height>)" << std::endl;
      return true;
    }

    const std::string& arg = args.front();
    try
    {
      uint64_t height = boost::lexical_cast<uint64_t>(arg);
      print_block_by_height(height);
    }
    catch (boost::bad_lexical_cast&)
    {
      print_block_by_hash(arg);
    }

    return true;
  }
  //--------------------------------------------------------------------------------
  bool print_tx(const std::vector<std::string>& args)
  {
    if (args.empty())
    {
      m_cmd_binder.message() << "expected: print_tx <transaction hash>" << std::endl;
      return true;
    }

    const std::string& str_hash = args.front();
    crypto::hash tx_hash;
    if (!parse_hash256(str_hash, tx_hash))
    {
      return true;
    }

//     std::vector<crypto::hash> tx_ids;
//     tx_ids.push_back(tx_hash);
//     std::list<currency::transaction> txs;
//     std::list<crypto::hash> missed_ids;
//     m_srv.get_payload_object().get_core().get_transactions(tx_ids, txs, missed_ids);

    auto tx_entry_ptr = m_srv.get_payload_object().get_core().get_blockchain_storage().get_tx_chain_entry(tx_hash);
    if (!tx_entry_ptr)
    {
      LOG_PRINT_RED("transaction wasn't found: " << tx_hash, LOG_LEVEL_0);
      return true;
    }
    currency::block_extended_info bei = AUTO_VAL_INIT(bei);
    m_srv.get_payload_object().get_core().get_blockchain_storage().get_block_extended_info_by_height(tx_entry_ptr->m_keeper_block_height, bei);
    uint64_t timestamp = bei.bl.timestamp;

    const currency::transaction& tx = tx_entry_ptr->tx;
    std::stringstream ss;

    ss << "------------------------------------------------------"
      << ENDL << "tx_id: " << tx_hash
      << ENDL << "keeper_block: " << tx_entry_ptr->m_keeper_block_height << ",  timestamp (" << timestamp << ") " << epee::misc_utils::get_internet_time_str(timestamp)
      << ENDL << currency::obj_to_json_str(tx)
      << ENDL << "------------------------------------------------------"
      << ENDL << epee::string_tools::buff_to_hex_nodelimer(t_serializable_object_to_blob(tx))
      << ENDL << "------------------------------------------------------";


    ss << "ATTACHMENTS: " << ENDL;
    for (auto at : tx.attachment)
    {
      if (at.type() == typeid(currency::tx_service_attachment))
      {        
        const currency::tx_service_attachment& sa = boost::get<currency::tx_service_attachment>(at);
        ss << "++++++++++++++++++++++++++++++++ " << ENDL;
        ss << "[SERVICE_ATTACHMENT]: ID = \'" << sa.service_id << "\', INSTRUCTION: \'" << sa.instruction << "\'" << ENDL; 

        if (!(sa.flags&TX_SERVICE_ATTACHMENT_ENCRYPT_BODY))
        {
          std::string body = sa.body;
          if (sa.flags&TX_SERVICE_ATTACHMENT_DEFLATE_BODY)
          {
            bool r = epee::zlib_helper::unpack(sa.body, body);
            CHECK_AND_ASSERT_MES(r, false, "Failed to unpack");
          }
          ss << "BODY: " << body << ENDL;
        }
      }
    }

    LOG_PRINT_GREEN(ss.str(), LOG_LEVEL_0);
    return true;
  }
  //--------------------------------------------------------------------------------
  bool print_pool(const std::vector<std::string>& args)
  {
    LOG_PRINT_L0("Pool state: " << ENDL << m_srv.get_payload_object().get_core().print_pool(false));
    return true;
  }
  //--------------------------------------------------------------------------------
  bool print_pool_sh(const std::vector<std::string>& args)
  {
    LOG_PRINT_L0("Pool state: " << ENDL << m_srv.get_payload_object().get_core().print_pool(true));
    return true;
  }
  //--------------------------------------------------------------------------------
  bool clear_pool(const std::vector<std::string>& args)
  {
    bool r = m_srv.get_payload_object().get_core().clear_pool();
    m_cmd_binder.message() << "Clear pool " << (r ? "success" : "failed") << std::endl;
    return r;
  }
  //--------------------------------------------------------------------------------
  bool start_mining(const std::vector<std::string>& args)
  {
    if(!args.size())
    {
      m_cmd_binder.message() << "Please, specify wallet address to mine for: start_mining <addr> [threads=1]" << std::endl;
      return true;
    }

    currency::account_public_address adr;
    if(!currency::get_account_address_from_str(adr, args.front()))
    {
      m_cmd_binder.message() << "target account address has wrong format" << std::endl;
      return true;
    }
    size_t threads_count = 1;
    if(args.size() > 1)
    {
      bool ok = string_tools::get_xtype_from_string(threads_count, args[1]);
      threads_count = (ok && 0 < threads_count) ? threads_count : 1;
    }

    m_srv.get_payload_object().get_core().get_miner().start(adr, threads_count);
    return true;
  }
  //--------------------------------------------------------------------------------
  bool stop_mining(const std::vector<std::string>& args)
  {
    m_srv.get_payload_object().get_core().get_miner().stop();
    return true;
  }
  //--------------------------------------------------------------------------------
  bool forecast_difficulty(const std::vector<std::string>& args)
  {
    if (args.size() > 0)
    {
      LOG_ERROR("command requires no agruments");
      return false;
    }

    std::vector<std::pair<uint64_t, currency::wide_difficulty_type>> pow_diffs, pos_diffs;

    bool r = false;
    r = m_srv.get_payload_object().get_core().get_blockchain_storage().forecast_difficulty(pow_diffs, false);
    CHECK_AND_ASSERT_MES(r, false, "forecast_difficulty failed");

    r = m_srv.get_payload_object().get_core().get_blockchain_storage().forecast_difficulty(pos_diffs, true);
    CHECK_AND_ASSERT_MES(r, false, "forecast_difficulty failed");

    CHECK_AND_ASSERT_MES(pow_diffs.size() == pow_diffs.size(), false, "mismatch in sizes: " << pow_diffs.size() << ", " << pow_diffs.size());

    std::stringstream ss;
    ss << " The next " << pow_diffs.size() - 1 << " PoW and PoS blocks will have the following difficulties:" << ENDL;
    ss << " #  aprox. PoW height   PoW difficulty  aprox. PoS height   PoS difficulty" << ENDL;
    for (size_t i = 0; i < pow_diffs.size(); ++i)
    {
      ss << std::right << std::setw(2) << i;
      ss << "  " << std::setw(6) << std::left << pow_diffs[i].first;
      if (i == 0)
        ss << " (last block) ";
      else
        ss << "              ";
      ss << std::setw(10) << std::left << pow_diffs[i].second;
      
      ss << "      ";
      ss << std::setw(6) << std::left << pos_diffs[i].first;
      if (i == 0)
        ss << " (last block) ";
      else
        ss << "              ";
      ss << pos_diffs[i].second;
      ss << ENDL;
    }

    LOG_PRINT_L0(ENDL << ss.str());
    return true;
  }
  //--------------------------------------------------------------------------------
  bool print_deadlock_guard(const std::vector<std::string>& args)
  {
    LOG_PRINT_L0(ENDL << epee::deadlock_guard_singleton::get_dlg_state());
    return true;
  }
  //--------------------------------------------------------------------------------
  bool print_maintainers(const std::vector<std::string>& args)
  {
    return print_impl([this] (std::ostream &s) { m_srv.log_maintainers(s); });
  }

  bool print_blocklist(const std::vector<std::string> &args)
  {
    LOG_PRINT_L0(m_srv.print_blocklist());
    return true;
  }

  bool clear_blocklist(const std::vector<std::string> &args)
  {
    m_srv.clear_blocklist();
    return true;
  }

  bool status(const std::vector<std::string> &args)
  {
    auto &cc = m_srv.get_payload_object().get_core();

    const size_t width = 26;
    std::ostringstream ss;

#define SS_ ss << std::left << std::setw(width)

    SS_ << "uptime" << epee::misc_utils::get_time_interval_string(time(nullptr) - m_srv.get_up_time()) << std::endl;
    SS_ << "synchronized" << (m_srv.get_payload_object().is_synchronized() ? "yes" : "no") << std::endl;
    SS_ << "connections count" << m_srv.get_connections_count() << std::endl;

    const bool is_mining = cc.get_miner().is_mining();
    SS_ << "is mining" << (is_mining ? std::to_string(cc.get_miner().get_threads_count()) : "no") << std::endl;

    const uint64_t height = cc.get_top_block_height();
    SS_ << "top block height" << height << std::endl;
    SS_ << "alternative blocks count" << cc.get_alternative_blocks_count() << std::endl;
    SS_ << "pool transactions count" << cc.get_pool_transactions_count() << std::endl;
    SS_ << "errors count" << epee::log_space::get_error_count() << std::endl;
    SS_ << "default fee" << currency::print_money(TX_DEFAULT_FEE) << std::endl;
    SS_ << "minimum fee" << currency::print_money(currency::get_tx_minimum_fee(height)) << std::endl;

    uint64_t pos_reward = 0ull;
    uint64_t pow_reward = 0ull;
    currency::get_block_reward(true, 0, 0, 0, pos_reward, height);
    currency::get_block_reward(false, 0, 0, 0, pow_reward, height);

    SS_ << "pos reward" << currency::print_money(pos_reward) << std::endl;
    SS_ << "pow reward" << currency::print_money(pow_reward) << std::endl;

#undef SS_

    return print_impl([&ss] (std::ostream &s) { s << ss.str(); });
  }

};
POP_WARNINGS
