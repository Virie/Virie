// Copyright (c) 2014-2020 The Virie Project
// Copyright (c) 2012-2013 The Cryptonote developers
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#pragma  once 

#include <boost/program_options/options_description.hpp>
#include <boost/program_options/variables_map.hpp>
#include "net/http_server_impl_base.h"
#include "wallet_rpc_server_commans_defs.h"
#include "wallet2.h"
#include "common/command_line.h"
namespace tools
{
  /************************************************************************/
  /*                                                                      */
  /************************************************************************/
  class wallet_rpc_server: public epee::http_server_impl_base<wallet_rpc_server>
  {
  public:
    typedef epee::net_utils::connection_context_base connection_context;

    wallet_rpc_server(wallet2& cr);

    const static command_line::arg_descriptor<std::string> arg_rpc_bind_port;
    const static command_line::arg_descriptor<std::string> arg_rpc_bind_ip;
    const static command_line::arg_descriptor<std::string> arg_miner_text_info;
    


    static void init_options(boost::program_options::options_description& desc);
    bool init(const boost::program_options::variables_map& vm);
    bool run(bool offline_mode, const currency::account_public_address &miner_address);
    void send_stop_signal();
    std::string get_binded_address() const { return m_bind_ip; }

    CHAIN_HTTP_TO_MAP2(connection_context); //forward http requests to uri map

    BEGIN_URI_MAP2()
      BEGIN_JSON_RPC_MAP("/json_rpc")
        MAP_JON_RPC_WE("getbalance",   on_getbalance,   wallet_rpc::COMMAND_RPC_GET_BALANCE)
        MAP_JON_RPC_WE("getaddress",   on_getaddress,   wallet_rpc::COMMAND_RPC_GET_ADDRESS)
        MAP_JON_RPC_WE("transfer",     on_transfer,     wallet_rpc::COMMAND_RPC_TRANSFER)
        MAP_JON_RPC_WE("store",        on_store,        wallet_rpc::COMMAND_RPC_STORE)
        MAP_JON_RPC_WE("get_payments", on_get_payments, wallet_rpc::COMMAND_RPC_GET_PAYMENTS)
        MAP_JON_RPC_WE("get_bulk_payments",         on_get_bulk_payments,         wallet_rpc::COMMAND_RPC_GET_BULK_PAYMENTS)
        MAP_JON_RPC_WE("make_integrated_address",   on_make_integrated_address,   wallet_rpc::COMMAND_RPC_MAKE_INTEGRATED_ADDRESS)
        MAP_JON_RPC_WE("split_integrated_address",  on_split_integrated_address,  wallet_rpc::COMMAND_RPC_SPLIT_INTEGRATED_ADDRESS)
        MAP_JON_RPC_WE("sign_transfer",             on_sign_transfer,             wallet_rpc::COMMAND_SIGN_TRANSFER)
        MAP_JON_RPC_WE("submit_transfer",           on_submit_transfer,           wallet_rpc::COMMAND_SUBMIT_TRANSFER)
        MAP_JON_RPC_WE("search_for_transactions",   on_search_for_transactions,   wallet_rpc::COMMAND_RPC_SEARCH_FOR_TRANSACTIONS)
        // supernet api
        MAP_JON_RPC_WE("maketelepod",   on_maketelepod,   wallet_rpc::COMMAND_RPC_MAKETELEPOD)
        MAP_JON_RPC_WE("clonetelepod",  on_clonetelepod, wallet_rpc::COMMAND_RPC_CLONETELEPOD)
        MAP_JON_RPC_WE("telepodstatus", on_telepodstatus, wallet_rpc::COMMAND_RPC_TELEPODSTATUS)
        MAP_JON_RPC_WE("withdrawtelepod", on_withdrawtelepod, wallet_rpc::COMMAND_RPC_WITHDRAWTELEPOD)
        //marketplace API
        MAP_JON_RPC_WE("marketplace_get_offers_ex",           on_marketplace_get_my_offers,     wallet_rpc::COMMAND_MARKETPLACE_GET_MY_OFFERS)
        MAP_JON_RPC_WE("marketplace_push_offer",              on_marketplace_push_offer,        wallet_rpc::COMMAND_MARKETPLACE_PUSH_OFFER)
        MAP_JON_RPC_WE("marketplace_push_update_offer",       on_marketplace_push_update_offer, wallet_rpc::COMMAND_MARKETPLACE_PUSH_UPDATE_OFFER)
        MAP_JON_RPC_WE("marketplace_cancel_offer",            on_marketplace_cancel_offer,      wallet_rpc::COMMAND_MARKETPLACE_CANCEL_OFFER)
      END_JSON_RPC_MAP()
    END_URI_MAP2()

      //json_rpc
      bool on_getbalance(const wallet_rpc::COMMAND_RPC_GET_BALANCE::request& req, wallet_rpc::COMMAND_RPC_GET_BALANCE::response& res, epee::json_rpc::error& er, connection_context& cntx);
      bool on_getaddress(const wallet_rpc::COMMAND_RPC_GET_ADDRESS::request& req, wallet_rpc::COMMAND_RPC_GET_ADDRESS::response& res, epee::json_rpc::error& er, connection_context& cntx);
      bool on_transfer(const wallet_rpc::COMMAND_RPC_TRANSFER::request& req, wallet_rpc::COMMAND_RPC_TRANSFER::response& res, epee::json_rpc::error& er, connection_context& cntx);
      bool on_store(const wallet_rpc::COMMAND_RPC_STORE::request& req, wallet_rpc::COMMAND_RPC_STORE::response& res, epee::json_rpc::error& er, connection_context& cntx);
      bool on_get_payments(const wallet_rpc::COMMAND_RPC_GET_PAYMENTS::request& req, wallet_rpc::COMMAND_RPC_GET_PAYMENTS::response& res, epee::json_rpc::error& er, connection_context& cntx);
      bool on_get_bulk_payments(const wallet_rpc::COMMAND_RPC_GET_BULK_PAYMENTS::request& req, wallet_rpc::COMMAND_RPC_GET_BULK_PAYMENTS::response& res, epee::json_rpc::error& er, connection_context& cntx);
      bool on_make_integrated_address(const wallet_rpc::COMMAND_RPC_MAKE_INTEGRATED_ADDRESS::request& req, wallet_rpc::COMMAND_RPC_MAKE_INTEGRATED_ADDRESS::response& res, epee::json_rpc::error& er, connection_context& cntx);
      bool on_split_integrated_address(const wallet_rpc::COMMAND_RPC_SPLIT_INTEGRATED_ADDRESS::request& req, wallet_rpc::COMMAND_RPC_SPLIT_INTEGRATED_ADDRESS::response& res, epee::json_rpc::error& er, connection_context& cntx);

      bool on_sign_transfer(const wallet_rpc::COMMAND_SIGN_TRANSFER::request& req, wallet_rpc::COMMAND_SIGN_TRANSFER::response& res, epee::json_rpc::error& er, connection_context& cntx);
      bool on_submit_transfer(const wallet_rpc::COMMAND_SUBMIT_TRANSFER::request& req, wallet_rpc::COMMAND_SUBMIT_TRANSFER::response& res, epee::json_rpc::error& er, connection_context& cntx);

      bool on_search_for_transactions(const wallet_rpc::COMMAND_RPC_SEARCH_FOR_TRANSACTIONS::request& req, wallet_rpc::COMMAND_RPC_SEARCH_FOR_TRANSACTIONS::response& res, epee::json_rpc::error& er, connection_context& cntx);


    bool on_maketelepod(const wallet_rpc::COMMAND_RPC_MAKETELEPOD::request& req, wallet_rpc::COMMAND_RPC_MAKETELEPOD::response& res, epee::json_rpc::error& er, connection_context& cntx);
      bool on_clonetelepod(const wallet_rpc::COMMAND_RPC_CLONETELEPOD::request& req, wallet_rpc::COMMAND_RPC_CLONETELEPOD::response& res, epee::json_rpc::error& er, connection_context& cntx);
      bool on_telepodstatus(const wallet_rpc::COMMAND_RPC_TELEPODSTATUS::request& req, wallet_rpc::COMMAND_RPC_TELEPODSTATUS::response& res, epee::json_rpc::error& er, connection_context& cntx);
      bool on_withdrawtelepod(const wallet_rpc::COMMAND_RPC_WITHDRAWTELEPOD::request& req, wallet_rpc::COMMAND_RPC_WITHDRAWTELEPOD::response& res, epee::json_rpc::error& er, connection_context& cntx);

      bool on_marketplace_get_my_offers(const wallet_rpc::COMMAND_MARKETPLACE_GET_MY_OFFERS::request& req, wallet_rpc::COMMAND_MARKETPLACE_GET_MY_OFFERS::response& res, epee::json_rpc::error& er, connection_context& cntx);
      bool on_marketplace_push_offer(const wallet_rpc::COMMAND_MARKETPLACE_PUSH_OFFER::request& req, wallet_rpc::COMMAND_MARKETPLACE_PUSH_OFFER::response& res, epee::json_rpc::error& er, connection_context& cntx);
      bool on_marketplace_push_update_offer(const wallet_rpc::COMMAND_MARKETPLACE_PUSH_UPDATE_OFFER::request& req, wallet_rpc::COMMAND_MARKETPLACE_PUSH_UPDATE_OFFER::response& res, epee::json_rpc::error& er, connection_context& cntx);
      bool on_marketplace_cancel_offer(const wallet_rpc::COMMAND_MARKETPLACE_CANCEL_OFFER::request& req, wallet_rpc::COMMAND_MARKETPLACE_CANCEL_OFFER::response& res, epee::json_rpc::error& er, connection_context& cntx);

      bool handle_command_line(const boost::program_options::variables_map& vm);
      bool build_transaction_from_telepod(const wallet_rpc::telepod& tlp, const currency::account_public_address& acc2, currency::transaction& tx2, std::string& status);

  private:
      wallet2& m_wallet;
      std::string m_port;
      std::string m_bind_ip;
  };
}