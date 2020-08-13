// Copyright (c) 2014-2020 The Virie Project
// Copyright (c) 2012-2013 The Cryptonote developers
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.


#include "include_base_utils.h"
#include "common/util.h"
using namespace epee;

#include "wallet_rpc_server.h"
#include "common/command_line.h"
#include "currency_core/currency_format_utils.h"
#include "currency_core/account.h"
#include "misc_language.h"
#include "crypto/hash.h"
#include "wallet_rpc_server_error_codes.h"

#define WALLET_RPC_BEGIN_TRY_ENTRY()     try
#define WALLET_RPC_CATCH_TRY_ENTRY()     \
        catch (const tools::error::daemon_busy& e) \
        { \
          er.code = WALLET_RPC_ERROR_CODE_DAEMON_IS_BUSY; \
          er.message = e.what(); \
          return false; \
        } \
        catch (const std::exception& e) \
        { \
          er.code = WALLET_RPC_ERROR_CODE_GENERIC_TRANSFER_ERROR; \
          er.message = e.what(); \
          return false; \
        } \
        catch (...) \
        { \
          er.code = WALLET_RPC_ERROR_CODE_UNKNOWN_ERROR; \
          er.message = "WALLET_RPC_ERROR_CODE_UNKNOWN_ERROR"; \
          return false; \
        }

namespace tools
{
  //-----------------------------------------------------------------------------------
  const command_line::arg_descriptor<std::string> wallet_rpc_server::arg_rpc_bind_port = {"rpc-bind-port", "Starts wallet as rpc server for wallet operations, sets bind port for server", "", command_line::flag_t::not_use_default};
  const command_line::arg_descriptor<std::string> wallet_rpc_server::arg_rpc_bind_ip = {"rpc-bind-ip", "Specify ip to bind rpc server", "127.0.0.1"};
  const command_line::arg_descriptor<std::string> wallet_rpc_server::arg_miner_text_info = { "miner_text_info", "Set block extra text info", "", command_line::flag_t::not_use_default };

  void wallet_rpc_server::init_options(boost::program_options::options_description& desc)
  {
    command_line::add_arg(desc, arg_rpc_bind_ip);
    command_line::add_arg(desc, arg_rpc_bind_port);
    command_line::add_arg(desc, arg_miner_text_info);
  }
  //------------------------------------------------------------------------------------------------------------------------------
  wallet_rpc_server::wallet_rpc_server(wallet2& w):m_wallet(w)
  {}
  //------------------------------------------------------------------------------------------------------------------------------
  bool wallet_rpc_server::run(bool offline_mode, const currency::account_public_address &miner_address)
  {
    if (!offline_mode)
      m_net_server.add_idle_handler([this, &miner_address](){
        try
        {
          std::size_t blocks_fetched;
          m_wallet.refresh_noexept(blocks_fetched);
          if (m_wallet.is_stopped())
            return true;

          bool has_related_alias_in_unconfirmed = false;
          LOG_PRINT_L2("wallet RPC idle: scanning tx pool...");
          m_wallet.scan_tx_pool(has_related_alias_in_unconfirmed);

          if (!m_wallet.is_watch_only())
            m_wallet.try_mint_pos(miner_address);
        }
        catch (error::no_connection_to_daemon&)
        {
          LOG_PRINT_RED("no connection to the daemon", LOG_LEVEL_0);
        }
        catch(std::exception& e)
        {
          LOG_ERROR("exeption caught in wallet_rpc_server::idle_handler: " << e.what());
        }
        catch(...)
        {
          LOG_ERROR("unknown exeption caught in wallet_rpc_server::idle_handler");
        }
        return true;
      }, 2000, "wallet2::try_mint_pos");

    //DO NOT START THIS SERVER IN MORE THEN 1 THREADS WITHOUT REFACTORING
    return epee::http_server_impl_base<wallet_rpc_server, connection_context>::run(1, true);
  }
  void wallet_rpc_server::send_stop_signal()
  {
    m_wallet.stop();
    epee::http_server_impl_base<wallet_rpc_server>::send_stop_signal();
  }
  //------------------------------------------------------------------------------------------------------------------------------
  bool wallet_rpc_server::handle_command_line(const boost::program_options::variables_map& vm)
  {
    m_bind_ip = command_line::get_arg(vm, arg_rpc_bind_ip);
    m_port = command_line::get_arg(vm, arg_rpc_bind_port);
    if (command_line::has_arg(vm, arg_miner_text_info))
    {
      m_wallet.set_miner_text_info(command_line::get_arg(vm, arg_miner_text_info));
    }
    return true;
  }
  //------------------------------------------------------------------------------------------------------------------------------
  bool wallet_rpc_server::init(const boost::program_options::variables_map& vm)
  {
    m_net_server.set_threads_prefix("RPC");
    bool r = handle_command_line(vm);
    CHECK_AND_ASSERT_MES(r, false, "Failed to process command line in core_rpc_server");
    return epee::http_server_impl_base<wallet_rpc_server, connection_context>::init(m_port, m_bind_ip);
  }
  //------------------------------------------------------------------------------------------------------------------------------
  bool wallet_rpc_server::on_getbalance(const wallet_rpc::COMMAND_RPC_GET_BALANCE::request& req, wallet_rpc::COMMAND_RPC_GET_BALANCE::response& res, epee::json_rpc::error& er, connection_context& cntx)
  WALLET_RPC_BEGIN_TRY_ENTRY()
  {
    res.balance = m_wallet.balance();
    res.unlocked_balance = m_wallet.unlocked_balance();
    return true;
  }
  WALLET_RPC_CATCH_TRY_ENTRY()
//------------------------------------------------------------------------------------------------------------------------------
  bool wallet_rpc_server::on_getaddress(const wallet_rpc::COMMAND_RPC_GET_ADDRESS::request& req, wallet_rpc::COMMAND_RPC_GET_ADDRESS::response& res, epee::json_rpc::error& er, connection_context& cntx)
  WALLET_RPC_BEGIN_TRY_ENTRY()
  {
    res.address = m_wallet.get_account().get_public_address_str();
    return true;
  }
  WALLET_RPC_CATCH_TRY_ENTRY()
  //------------------------------------------------------------------------------------------------------------------------------
  bool wallet_rpc_server::on_transfer(const wallet_rpc::COMMAND_RPC_TRANSFER::request& req, wallet_rpc::COMMAND_RPC_TRANSFER::response& res, epee::json_rpc::error& er, connection_context& cntx)
  WALLET_RPC_BEGIN_TRY_ENTRY()
  {
    currency::bc_payment_id payment_id = req.payment_id;
    if (req.destinations.empty())
    {
      er.code = WALLET_RPC_ERROR_CODE_WRONG_ADDRESS;
      er.message = std::string("WALLET_RPC_ERROR_CODE_WRONG_ADDRESS: destination empty");
      return false;
    }

    std::vector<currency::tx_destination_entry> dsts;
    dsts.reserve(req.destinations.size());
    for (const auto & dest : req.destinations)
    {
      currency::tx_destination_entry de;
      de.addr.resize(1);
      currency::bc_payment_id embedded_payment_id;
      if(!m_wallet.get_transfer_address(dest.address, de.addr.back(), embedded_payment_id))
      {
        er.code = WALLET_RPC_ERROR_CODE_WRONG_ADDRESS;
        er.message = std::string("WALLET_RPC_ERROR_CODE_WRONG_ADDRESS: ") + dest.address;
        return false;
      }
      if (!embedded_payment_id.empty())
      {
        if (!payment_id.empty() && payment_id != embedded_payment_id)
        {
          er.code = WALLET_RPC_ERROR_CODE_WRONG_PAYMENT_ID;
          er.message = std::string("embedded payment id: ") + embedded_payment_id.get_hex() + " conflicts with previously set payment id: " + payment_id.get_hex();
          return false;
        }
        payment_id = embedded_payment_id;
      }
      if (dest.amount == 0)
      {
        er.code = WALLET_RPC_ERROR_CODE_GENERIC_TRANSFER_ERROR;
        er.message = std::string("zero amount for: ") + dest.address;
        return false;
      }
      de.amount = dest.amount;
      dsts.push_back(de);
    }
    std::vector<currency::attachment_v> attachments;
    if (!payment_id.empty() && !currency::set_payment_id_to_tx(attachments, payment_id))
    {
      er.code = WALLET_RPC_ERROR_CODE_WRONG_PAYMENT_ID;
      er.message = std::string("payment id ") + payment_id.get_hex() + " is invalid and can't be set";
      return false;
    }

    currency::transaction tx;
    std::vector<currency::extra_v> extra;
    std::string signed_tx_blob_str;
    m_wallet.transfer(dsts, req.mixin, req.unlock_time, req.fee, extra, attachments, tx, &signed_tx_blob_str);
    if (m_wallet.is_watch_only())
    {
      res.tx_unsigned_hex = epee::string_tools::buff_to_hex_nodelimer(signed_tx_blob_str); // watch-only wallets can't sign and relay transactions
      // leave res.tx_hash empty, because tx has will change after signing
    }
    else
    {
      res.tx_hash = epee::string_tools::pod_to_hex(currency::get_transaction_hash(tx));
    }
    return true;
  }
  WALLET_RPC_CATCH_TRY_ENTRY()
  //------------------------------------------------------------------------------------------------------------------------------
  bool wallet_rpc_server::on_store(const wallet_rpc::COMMAND_RPC_STORE::request& req, wallet_rpc::COMMAND_RPC_STORE::response& res, epee::json_rpc::error& er, connection_context& cntx)
  WALLET_RPC_BEGIN_TRY_ENTRY()
  {
    tools::store_double_step(m_wallet.get_wallet_path(),
        [this] (const std::wstring &filename) { m_wallet.store(filename); });
    return true;
  }
  WALLET_RPC_CATCH_TRY_ENTRY()
  //------------------------------------------------------------------------------------------------------------------------------
  bool wallet_rpc_server::on_get_payments(const wallet_rpc::COMMAND_RPC_GET_PAYMENTS::request& req, wallet_rpc::COMMAND_RPC_GET_PAYMENTS::response& res, epee::json_rpc::error& er, connection_context& cntx)
  {
    currency::bc_payment_id payment_id = req.payment_id;

    res.payments.clear();
    std::list<wallet2::payment_details> payment_list;
    m_wallet.get_payments(payment_id, payment_list);
    for (auto payment : payment_list)
    {
      wallet_rpc::payment_details rpc_payment;
      rpc_payment.payment_id   = payment_id;
      rpc_payment.tx_hash      = epee::string_tools::pod_to_hex(payment.m_tx_hash);
      rpc_payment.amount       = payment.m_amount;
      rpc_payment.block_height = payment.m_block_height;
      rpc_payment.unlock_time  = payment.m_unlock_time;
      res.payments.push_back(std::move(rpc_payment));
    }

    return true;
  }
  //------------------------------------------------------------------------------------------------------------------------------
  bool wallet_rpc_server::on_get_bulk_payments(const wallet_rpc::COMMAND_RPC_GET_BULK_PAYMENTS::request& req, wallet_rpc::COMMAND_RPC_GET_BULK_PAYMENTS::response& res, epee::json_rpc::error& er, connection_context& cntx)
  {
    res.payments.clear();

    for (const auto & payment_id_str : req.payment_ids)
    {
      currency::bc_payment_id payment_id;

      if (!payment_id.from_hex(payment_id_str))
      {
        res.payments.clear();
        er.code = WALLET_RPC_ERROR_CODE_WRONG_PAYMENT_ID;
        er.message = std::string("invalid payment id given: \'") + payment_id_str + "\', hex-encoded string was expected";
        return false;
      }

      std::list<wallet2::payment_details> payment_list;
      m_wallet.get_payments(payment_id, payment_list, req.min_block_height);

      for (const auto & payment : payment_list)
      {
        if (payment.m_unlock_time && !req.allow_locked_transactions)
        {
          //check that transaction don't have locking for time longer then 10 blocks ahead
          //TODO: add code for "unlock_time" set as timestamp, now it's all being filtered
          if (payment.m_unlock_time > payment.m_block_height + WALLET_DEFAULT_TX_SPENDABLE_AGE)
            continue;
        }

        wallet_rpc::payment_details rpc_payment;
        rpc_payment.payment_id = payment_id;
        rpc_payment.tx_hash = epee::string_tools::pod_to_hex(payment.m_tx_hash);
        rpc_payment.amount = payment.m_amount;
        rpc_payment.block_height = payment.m_block_height;
        rpc_payment.unlock_time = payment.m_unlock_time;
        res.payments.push_back(std::move(rpc_payment));
      }
    }
    return true;
  }
  //------------------------------------------------------------------------------------------------------------------------------
  bool wallet_rpc_server::on_make_integrated_address(const wallet_rpc::COMMAND_RPC_MAKE_INTEGRATED_ADDRESS::request& req, wallet_rpc::COMMAND_RPC_MAKE_INTEGRATED_ADDRESS::response& res, epee::json_rpc::error& er, connection_context& cntx)
  {
    currency::bc_payment_id payment_id = req.payment_id;

    if (!payment_id.is_size_ok())
    {
      er.code = WALLET_RPC_ERROR_CODE_WRONG_PAYMENT_ID;
      er.message = std::string("given payment id is too long: \'") + payment_id.get_hex() + "\'";
      return false;
    }

    if (payment_id.empty())
    {
      std::string& id = payment_id.id;
      id = std::string(8, ' ');
      crypto::generate_random_bytes(id.size(), &id.front());  ///TODO:: move generate to class
    }

    res.integrated_address = currency::get_account_address_and_payment_id_as_str(m_wallet.get_account().get_public_address(), payment_id);
    res.payment_id = payment_id;

    return !res.integrated_address.empty();
  }
  //------------------------------------------------------------------------------------------------------------------------------
  bool wallet_rpc_server::on_split_integrated_address(const wallet_rpc::COMMAND_RPC_SPLIT_INTEGRATED_ADDRESS::request& req, wallet_rpc::COMMAND_RPC_SPLIT_INTEGRATED_ADDRESS::response& res, epee::json_rpc::error& er, connection_context& cntx)
  {
    currency::account_public_address addr;
    currency::bc_payment_id payment_id;
    if (!currency::get_account_address_and_payment_id_from_str(addr, payment_id, req.integrated_address))
    {
      er.code = WALLET_RPC_ERROR_CODE_WRONG_ADDRESS;
      er.message = std::string("invalid integrated address given: \'") + req.integrated_address + "\'";
      return false;
    }

    res.standard_address = currency::get_account_address_as_str(addr);
    res.payment_id = payment_id;
    return true;
  }
  //------------------------------------------------------------------------------------------------------------------------------
  bool wallet_rpc_server::on_sign_transfer(const wallet_rpc::COMMAND_SIGN_TRANSFER::request& req, wallet_rpc::COMMAND_SIGN_TRANSFER::response& res, epee::json_rpc::error& er, connection_context& cntx)
  WALLET_RPC_BEGIN_TRY_ENTRY()
  {
    currency::transaction tx = AUTO_VAL_INIT(tx);
    std::string tx_unsigned_blob;
    if (!string_tools::parse_hexstr_to_binbuff(req.tx_unsigned_hex, tx_unsigned_blob))
    {
      er.code = WALLET_RPC_ERROR_CODE_WRONG_ARGUMENT;
      er.message = "tx_unsigned_hex is invalid";
      return false;
    }
    std::string tx_signed_blob;
    m_wallet.sign_transfer(tx_unsigned_blob, tx_signed_blob, tx);

    res.tx_signed_hex = epee::string_tools::buff_to_hex_nodelimer(tx_signed_blob);
    res.tx_hash = epee::string_tools::pod_to_hex(currency::get_transaction_hash(tx));
    return true;
  }
  WALLET_RPC_CATCH_TRY_ENTRY()
  //------------------------------------------------------------------------------------------------------------------------------
  bool wallet_rpc_server::on_submit_transfer(const wallet_rpc::COMMAND_SUBMIT_TRANSFER::request& req, wallet_rpc::COMMAND_SUBMIT_TRANSFER::response& res, epee::json_rpc::error& er, connection_context& cntx)
  WALLET_RPC_BEGIN_TRY_ENTRY()
  {
    std::string tx_signed_blob;
    if (!string_tools::parse_hexstr_to_binbuff(req.tx_signed_hex, tx_signed_blob)) {
      er.code = WALLET_RPC_ERROR_CODE_WRONG_ARGUMENT;
      er.message = "tx_signed_hex is invalid";
      return false;
    }

    currency::transaction tx = AUTO_VAL_INIT(tx);
    m_wallet.submit_transfer(tx_signed_blob, tx);
    res.tx_hash = epee::string_tools::pod_to_hex(currency::get_transaction_hash(tx));

    return true;
  }
  WALLET_RPC_CATCH_TRY_ENTRY()
  //------------------------------------------------------------------------------------------------------------------------------
  bool wallet_rpc_server::on_search_for_transactions(const wallet_rpc::COMMAND_RPC_SEARCH_FOR_TRANSACTIONS::request& req, wallet_rpc::COMMAND_RPC_SEARCH_FOR_TRANSACTIONS::response& res, epee::json_rpc::error& er, connection_context& cntx)
  {
    bool tx_id_specified = req.tx_id != currency::null_hash;

    // process confirmed txs
    m_wallet.enumerate_transfers_history([&] (const wallet_rpc::wallet_transfer_info &wti) -> bool {

      if (tx_id_specified)
      {
        if (wti.tx_hash != req.tx_id)
          return true; // continue
      }

      if (req.filter_by_height)
      {
        if (!wti.height) // unconfirmed
          return true; // continue

        if (wti.height < req.min_height)
        {
          // no need to scan more
          return false; // stop
        }
        if (wti.height > req.max_height)
        {
          return true; // continue
        }
      }

      if (wti.is_income && req.in)
        res.in.push_back(wti);

      if (!wti.is_income && req.out)
        res.out.push_back(wti);

      return true; // continue
    }, false /* forward */);

    // process unconfirmed txs
    if (req.pool)
    {
      m_wallet.enumerate_unconfirmed_transfers([&] (const std::pair<crypto::hash, wallet_rpc::wallet_transfer_info> &p) -> bool {
        const auto &wti = p.second;
        if ((wti.is_income && req.in) || (!wti.is_income && req.out))
          res.pool.push_back(wti);
        return true; // continue
      });
    }

    return true;
  }
  //------------------------------------------------------------------------------------------------------------------------------
  bool wallet_rpc_server::on_marketplace_get_my_offers(const wallet_rpc::COMMAND_MARKETPLACE_GET_MY_OFFERS::request& req, wallet_rpc::COMMAND_MARKETPLACE_GET_MY_OFFERS::response& res, epee::json_rpc::error& er, connection_context& cntx)
  WALLET_RPC_BEGIN_TRY_ENTRY()
  {
    m_wallet.get_actual_offers(res.offers);
    size_t offers_count_before_filtering = res.offers.size();
    bc_services::filter_offers_list(res.offers, req.filter, m_wallet.get_core_runtime_config().get_core_time());
    LOG_PRINT("get_my_offers(): " << res.offers.size() << " offers returned (" << offers_count_before_filtering << " was before filter)", LOG_LEVEL_1);
    return true;
  }
  WALLET_RPC_CATCH_TRY_ENTRY()
  //------------------------------------------------------------------------------------------------------------------------------
  bool wallet_rpc_server::on_marketplace_push_offer(const wallet_rpc::COMMAND_MARKETPLACE_PUSH_OFFER::request& req, wallet_rpc::COMMAND_MARKETPLACE_PUSH_OFFER::response& res, epee::json_rpc::error& er, connection_context& cntx)
  WALLET_RPC_BEGIN_TRY_ENTRY()
  {
    currency::transaction res_tx = AUTO_VAL_INIT(res_tx);
    m_wallet.push_offer(req.od, res_tx);

    res.tx_hash = string_tools::pod_to_hex(currency::get_transaction_hash(res_tx));
    res.tx_blob_size = currency::get_object_blobsize(res_tx);
    return true;
  }
  WALLET_RPC_CATCH_TRY_ENTRY()
  //------------------------------------------------------------------------------------------------------------------------------
  bool wallet_rpc_server::on_marketplace_push_update_offer(const wallet_rpc::COMMAND_MARKETPLACE_PUSH_UPDATE_OFFER::request& req, wallet_rpc::COMMAND_MARKETPLACE_PUSH_UPDATE_OFFER::response& res, epee::json_rpc::error& er, connection_context& cntx)
  WALLET_RPC_BEGIN_TRY_ENTRY()
  {
    currency::transaction res_tx = AUTO_VAL_INIT(res_tx);
    m_wallet.update_offer_by_id(req.tx_id, req.no, req.od, res_tx);

    res.tx_hash = string_tools::pod_to_hex(currency::get_transaction_hash(res_tx));
    res.tx_blob_size = currency::get_object_blobsize(res_tx);
    return true;
  }
  WALLET_RPC_CATCH_TRY_ENTRY()
  //------------------------------------------------------------------------------------------------------------------------------
  bool wallet_rpc_server::on_marketplace_cancel_offer(const wallet_rpc::COMMAND_MARKETPLACE_CANCEL_OFFER::request& req, wallet_rpc::COMMAND_MARKETPLACE_CANCEL_OFFER::response& res, epee::json_rpc::error& er, connection_context& cntx)
  WALLET_RPC_BEGIN_TRY_ENTRY()
  {
    currency::transaction res_tx = AUTO_VAL_INIT(res_tx);
    m_wallet.cancel_offer_by_id(req.tx_id, req.no, res_tx);

    res.tx_hash = string_tools::pod_to_hex(currency::get_transaction_hash(res_tx));
    res.tx_blob_size = currency::get_object_blobsize(res_tx);
    return true;
  }
  WALLET_RPC_CATCH_TRY_ENTRY()
  //------------------------------------------------------------------------------------------------------------------------------
  bool wallet_rpc_server::on_maketelepod(const wallet_rpc::COMMAND_RPC_MAKETELEPOD::request& req, wallet_rpc::COMMAND_RPC_MAKETELEPOD::response& res, epee::json_rpc::error& er, connection_context& cntx)
  {
    //check available balance
    if (m_wallet.unlocked_balance() <= req.amount)
    { 
      res.status = "INSUFFICIENT_COINS";
      return true;
    }

    currency::account_base acc;
    acc.generate();
    std::vector<currency::tx_destination_entry> dsts(1);
    dsts.back().amount = req.amount;
    dsts.back().addr.resize(1);
    dsts.back().addr.back() = acc.get_keys().m_account_address;
    currency::transaction tx = AUTO_VAL_INIT(tx);
    try
    {
      std::vector<currency::extra_v> extra;
      std::vector<currency::attachment_v> attachments;

      m_wallet.transfer(dsts, 0, 0, m_wallet.get_core_runtime_config().tx_default_fee, extra, attachments, tx);
    }
    catch (const std::runtime_error& er)
    {
      LOG_ERROR("Failed to send transaction: " << er.what());
      res.status = "INTERNAL_ERROR";
      return true;
    }

    res.tpd.basement_tx_id_hex = string_tools::pod_to_hex(currency::get_transaction_hash(tx));    
    std::string buff = epee::serialization::store_t_to_binary(acc);    
    res.tpd.account_keys_hex = string_tools::buff_to_hex_nodelimer(buff);

    res.status = "OK";
    LOG_PRINT_GREEN("TELEPOD ISSUED [" << currency::print_money(req.amount) << "BBR, base_tx_id: ]" << currency::get_transaction_hash(tx), LOG_LEVEL_0);

    return true;
  }
  //------------------------------------------------------------------------------------------------------------------------------
  bool wallet_rpc_server::build_transaction_from_telepod(const wallet_rpc::telepod& tlp, const currency::account_public_address& acc2, currency::transaction& tx2, std::string& status)
  {
    //check if base transaction confirmed
    currency::COMMAND_RPC_GET_TRANSACTIONS::request get_tx_req = AUTO_VAL_INIT(get_tx_req);
    currency::COMMAND_RPC_GET_TRANSACTIONS::response get_tx_rsp = AUTO_VAL_INIT(get_tx_rsp);
    get_tx_req.txs_hashes.push_back(tlp.basement_tx_id_hex);
    if (!m_wallet.get_core_proxy()->call_COMMAND_RPC_GET_TRANSACTIONS(get_tx_req, get_tx_rsp)
      || get_tx_rsp.status != CORE_RPC_STATUS_OK
      || !get_tx_rsp.txs_as_hex.size())
    {
      status = "UNCONFIRMED";
      return false;
    }

    //extract account keys
    std::string acc_buff;
    currency::account_base acc = AUTO_VAL_INIT(acc);
    if (!string_tools::parse_hexstr_to_binbuff(tlp.account_keys_hex, acc_buff))
    {
      LOG_ERROR("Failed to parse_hexstr_to_binbuff(tlp.account_keys_hex, acc_buff)");
      status = "BAD";
      return false;
    }
    if (!epee::serialization::load_t_from_binary(acc, acc_buff))
    {
      LOG_ERROR("Failed to load_t_from_binary(acc, acc_buff)");
      status = "BAD";
      return false;
    }

    //extract transaction
    currency::transaction tx = AUTO_VAL_INIT(tx);
    std::string buff;
    if (!string_tools::parse_hexstr_to_binbuff(get_tx_rsp.txs_as_hex.back(), buff))
    {
      LOG_ERROR("Failed to parse_hexstr_to_binbuff(get_tx_rsp.txs_as_hex.back(), buff)");
      status = "INTERNAL_ERROR";
      return false;
    }
    if (!currency::parse_and_validate_tx_from_blob(buff, tx))
    {
      LOG_ERROR("Failed to currency::parse_and_validate_tx_from_blob(buff, tx)");
      status = "INTERNAL_ERROR";
      return false;
    }

    crypto::public_key tx_pub_key = currency::get_tx_pub_key_from_extra(tx);
    if (tx_pub_key == currency::null_pkey)
    {
      LOG_ERROR("Failed to currency::get_tx_pub_key_from_extra(tx)");
      status = "BAD";
      return false;

    }

    //get transaction global output indices 
    currency::COMMAND_RPC_GET_TX_GLOBAL_OUTPUTS_INDEXES::request get_ind_req = AUTO_VAL_INIT(get_ind_req);
    currency::COMMAND_RPC_GET_TX_GLOBAL_OUTPUTS_INDEXES::response get_ind_rsp = AUTO_VAL_INIT(get_ind_rsp);
    get_ind_req.txid = currency::get_transaction_hash(tx);
    if (!m_wallet.get_core_proxy()->call_COMMAND_RPC_GET_TX_GLOBAL_OUTPUTS_INDEXES(get_ind_req, get_ind_rsp)
      || get_ind_rsp.status != CORE_RPC_STATUS_OK
      || get_ind_rsp.o_indexes.size() != tx.vout.size())
    {
      LOG_ERROR("Problem with call_COMMAND_RPC_GET_TX_GLOBAL_OUTPUTS_INDEXES(....) ");
      status = "INTERNAL_ERROR";
      return false;
    }

    //prepare inputs
    std::vector<currency::tx_source_entry> sources;
    size_t i = 0;
    uint64_t amount = 0;
    for (auto& o : get_ind_rsp.o_indexes)
    {
      //check if input is for telepod's address
      if (currency::is_out_to_acc(acc.get_keys(), boost::get<currency::txout_to_key>(tx.vout[i].target), tx_pub_key, i))
      {
        //income output 
        amount += tx.vout[i].amount;
        sources.resize(sources.size() + 1);
        currency::tx_source_entry& tse = sources.back();
        tse.amount = tx.vout[i].amount;
        tse.outputs.push_back(currency::tx_source_entry::output_entry(o, boost::get<currency::txout_to_key>(tx.vout[i].target).key));
        tse.real_out_tx_key = tx_pub_key;
        tse.real_output = 0;
        tse.real_output_in_tx_index = i;
      }
      ++i;
    }


    //prepare outputs
    std::vector<currency::tx_destination_entry> dsts(1);
    currency::tx_destination_entry& dst = dsts.back();
    dst.addr.push_back(acc2);
    dst.amount = amount - m_wallet.get_core_runtime_config().tx_default_fee;

    //generate transaction
    const std::vector<currency::extra_v> extra;
    const std::vector<currency::attachment_v> attachments;
    crypto::secret_key sk;
    bool r = currency::construct_tx(acc.get_keys(), sources, dsts, extra, attachments, tx2, sk, 0);
    if (!r)
    {
      LOG_ERROR("Problem with construct_tx(....) ");
      status = "INTERNAL_ERROR";
      return false;
    }
    if (CURRENCY_MAX_TRANSACTION_BLOB_SIZE <= get_object_blobsize(tx2))
    {
      LOG_ERROR("Problem with construct_tx(....), blobl size os too big: " << get_object_blobsize(tx2));
      status = "INTERNAL_ERROR";
      return false;
    }

    return true;
  }
  //------------------------------------------------------------------------------------------------------------------------------
  bool wallet_rpc_server::on_clonetelepod(const wallet_rpc::COMMAND_RPC_CLONETELEPOD::request& req, wallet_rpc::COMMAND_RPC_CLONETELEPOD::response& res, epee::json_rpc::error& er, connection_context& cntx)
  {
    currency::transaction tx2 = AUTO_VAL_INIT(tx2);
    //new destination account 
    currency::account_base acc2 = AUTO_VAL_INIT(acc2);
    acc2.generate();

    if (!build_transaction_from_telepod(req.tpd, acc2.get_keys().m_account_address, tx2, res.status))
    {
      LOG_ERROR("Failed to build_transaction_from_telepod(...)");
      return true;
    }

    //send transaction to daemon
    currency::COMMAND_RPC_SEND_RAW_TX::request req_send_raw;
    req_send_raw.tx_as_hex = epee::string_tools::buff_to_hex_nodelimer(tx_to_blob(tx2));
    currency::COMMAND_RPC_SEND_RAW_TX::response rsp_send_raw;
    bool r = m_wallet.get_core_proxy()->call_COMMAND_RPC_SEND_RAW_TX(req_send_raw, rsp_send_raw);
    if (!r || rsp_send_raw.status != CORE_RPC_STATUS_OK)
    {
      LOG_ERROR("Problem with construct_tx(....), blobl size os too big: " << get_object_blobsize(tx2));
      res.status = "INTERNAL_ERROR";
      return true;
    }

    res.tpd.basement_tx_id_hex = string_tools::pod_to_hex(currency::get_transaction_hash(tx2));
    std::string acc2_buff = epee::serialization::store_t_to_binary(acc2);
    res.tpd.account_keys_hex = string_tools::buff_to_hex_nodelimer(acc2_buff);

    res.status = "OK";
    LOG_PRINT_GREEN("TELEPOD ISSUED [" << currency::print_money(currency::get_outs_money_amount(tx2)) << "BBR, base_tx_id: ]" << currency::get_transaction_hash(tx2), LOG_LEVEL_0);

    return true;
  }
  //------------------------------------------------------------------------------------------------------------------------------
  bool wallet_rpc_server::on_telepodstatus(const wallet_rpc::COMMAND_RPC_TELEPODSTATUS::request& req, wallet_rpc::COMMAND_RPC_TELEPODSTATUS::response& res, epee::json_rpc::error& er, connection_context& cntx)
  {
    currency::transaction tx2 = AUTO_VAL_INIT(tx2);
    //new destination account 
    currency::account_base acc2 = AUTO_VAL_INIT(acc2);
    acc2.generate();

    if (!build_transaction_from_telepod(req.tpd, acc2.get_keys().m_account_address, tx2, res.status))
    {
      return true;
    }
    //check if transaction is spent
    currency::COMMAND_RPC_CHECK_KEYIMAGES::request req_ki = AUTO_VAL_INIT(req_ki);
    currency::COMMAND_RPC_CHECK_KEYIMAGES::response rsp_ki = AUTO_VAL_INIT(rsp_ki);
    for (auto& i : tx2.vin)
      req_ki.images.push_back(boost::get<currency::txin_to_key>(i).k_image);

    if (!m_wallet.get_core_proxy()->call_COMMAND_RPC_COMMAND_RPC_CHECK_KEYIMAGES(req_ki, rsp_ki) 
      || rsp_ki.status != CORE_RPC_STATUS_OK
      || rsp_ki.images_stat.size() != req_ki.images.size())
    {
      LOG_ERROR("Problem with call_COMMAND_RPC_COMMAND_RPC_CHECK_KEYIMAGES(....)");
      res.status = "INTERNAL_ERROR";
      return true;
    }

    for (auto s : rsp_ki.images_stat)
    {
      if (!s)
      {
        res.status = "SPENT";
        return true;
      }
    }

    res.status = "OK";
    return true;
  }
  //------------------------------------------------------------------------------------------------------------------------------
  bool wallet_rpc_server::on_withdrawtelepod(const wallet_rpc::COMMAND_RPC_WITHDRAWTELEPOD::request& req, wallet_rpc::COMMAND_RPC_WITHDRAWTELEPOD::response& res, epee::json_rpc::error& er, connection_context& cntx)
  {
    currency::transaction tx2 = AUTO_VAL_INIT(tx2);
    //parse destination add 
    currency::account_public_address acc_addr = AUTO_VAL_INIT(acc_addr);
    if (!currency::get_account_address_from_str(acc_addr, req.addr))
    {
      LOG_ERROR("Failed to build_transaction_from_telepod(...)");
      res.status = "BAD_ADDRESS";
      return true;
    }

    if (!build_transaction_from_telepod(req.tpd, acc_addr, tx2, res.status))
    {
      LOG_ERROR("Failed to build_transaction_from_telepod(...)");
      return true;
    }

    //send transaction to daemon
    currency::COMMAND_RPC_SEND_RAW_TX::request req_send_raw;
    req_send_raw.tx_as_hex = epee::string_tools::buff_to_hex_nodelimer(tx_to_blob(tx2));
    currency::COMMAND_RPC_SEND_RAW_TX::response rsp_send_raw;
    bool r = m_wallet.get_core_proxy()->call_COMMAND_RPC_SEND_RAW_TX(req_send_raw, rsp_send_raw);
    if (!r || rsp_send_raw.status != CORE_RPC_STATUS_OK)
    {
      LOG_ERROR("Problem with construct_tx(....), blobl size os too big: " << get_object_blobsize(tx2));
      res.status = "INTERNAL_ERROR";
      return true;
    }

    res.status = "OK";
    LOG_PRINT_GREEN("TELEPOD WITHDRAWN [" << currency::print_money(currency::get_outs_money_amount(tx2)) << "BBR, tx_id: ]" << currency::get_transaction_hash(tx2), LOG_LEVEL_0);

    return true;
  }
}
