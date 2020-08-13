// Copyright (c) 2014-2020 The Virie Project
// Copyright (c) 2012-2013 The Cryptonote developers
// Copyright (c) 2012-2013 The Boolberry developers
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#pragma once

#include <typeindex>
#include <unordered_set>
#include <unordered_map>

#include "currency_protocol/currency_protocol_defs.h"

#include "account.h"
#include "include_base_utils.h"
#include "crypto/crypto.h"
#include "crypto/hash.h"
#include "difficulty.h"
//#include "offers_services_helpers.h"
#include "rpc/core_rpc_server_commands_defs.h"
#include "bc_payments_id_service.h"
#include "bc_attachments_helpers_basic.h"
#include "blockchain_storage_basic.h"
#include "bc_payments_id.h"

// ------ get_tx_type_definition -------------
#define       GUI_TX_TYPE_NORMAL                  0
#define       GUI_TX_TYPE_PUSH_OFFER              1
#define       GUI_TX_TYPE_UPDATE_OFFER            2
#define       GUI_TX_TYPE_CANCEL_OFFER            3
#define       GUI_TX_TYPE_NEW_ALIAS               4
#define       GUI_TX_TYPE_UPDATE_ALIAS            5
#define       GUI_TX_TYPE_COIN_BASE               6
#define       GUI_TX_TYPE_ESCROW_PROPOSAL         7
#define       GUI_TX_TYPE_ESCROW_TRANSFER         8
#define       GUI_TX_TYPE_ESCROW_RELEASE_NORMAL   9
#define       GUI_TX_TYPE_ESCROW_RELEASE_BURN     10
#define       GUI_TX_TYPE_ESCROW_CANCEL_PROPOSAL  11
#define       GUI_TX_TYPE_ESCROW_RELEASE_CANCEL   12




//------

namespace currency
{
  bool operator ==(const currency::transaction& a, const currency::transaction& b);
  bool operator ==(const currency::block& a, const currency::block& b);
  bool operator ==(const currency::extra_attachment_info& a, const currency::extra_attachment_info& b);



  typedef boost::multiprecision::uint128_t uint128_tl;
  struct tx_source_entry
  {
    typedef serializable_pair<txout_v, crypto::public_key> output_entry; // txout_v is either global output index or ref_by_id; public_key - is output ephemeral pub key

    std::vector<output_entry> outputs;  //index + key
    uint64_t real_output;               //index in outputs vector of real output_entry
    crypto::public_key real_out_tx_key; //real output's transaction's public key
    size_t real_output_in_tx_index;     //index in transaction outputs vector
    uint64_t amount;                    //money
    uint64_t transfer_index;            //money
    crypto::hash multisig_id;           //if txin_multisig: multisig output id
    size_t ms_sigs_count;               //if txin_multisig: must be equal to output's minimum_sigs
    size_t ms_keys_count;               //if txin_multisig: must be equal to size of output's keys container
    bool separately_signed_tx_complete; //for separately signed tx only: denotes the last source entry in complete tx to explicitly mark the final step of tx creation

    bool is_multisig() const { return ms_sigs_count > 0; }

    BEGIN_SERIALIZE_OBJECT()
      FIELD(outputs)
      FIELD(real_output)
      FIELD(real_out_tx_key)
      FIELD(real_output_in_tx_index)
      FIELD(amount)
      FIELD(transfer_index)
      FIELD(multisig_id)
      FIELD(ms_sigs_count)
      FIELD(ms_keys_count)
      FIELD(separately_signed_tx_complete)
    END_SERIALIZE()
  };

  struct tx_destination_entry
  {
    uint64_t amount;                                 //money
    std::list<account_public_address>   addr;        //destination address, in case of 1 address - txout_to_key, in case of more - txout_multisig
    size_t   minimum_sigs;                           // if txout_multisig: minimum signatures that are required to spend this output (minimum_sigs <= addr.size())  IF txout_to_key - not used
    uint64_t amount_to_provide;                      //amount money that provided by initial creator of tx, used with partially created transactions

    tx_destination_entry() : amount(0), minimum_sigs(0), amount_to_provide(0){}
    tx_destination_entry(uint64_t a, const account_public_address& ad) : amount(a), addr(1, ad), minimum_sigs(0), amount_to_provide(0){}
    tx_destination_entry(uint64_t a, const std::list<account_public_address>& addr) : amount(a), addr(addr), minimum_sigs(addr.size()), amount_to_provide(0){}

    BEGIN_SERIALIZE_OBJECT()
      FIELD(amount)
      FIELD(addr)
      FIELD(minimum_sigs)
      FIELD(amount_to_provide)
    END_SERIALIZE()
  };

  struct tx_extra_info 
  {
    crypto::public_key m_tx_pub_key;
    //crypto::hash m_offers_hash;
    extra_alias_entry m_alias;
    std::string m_user_data_blob;
    extra_attachment_info m_attachment_info;
  };

  //---------------------------------------------------------------------------------------------------------------
  struct genesis_payment_entry
  {
//    std::string paid_prm;
//    std::string prm_usd_price;
//    std::string paid_xmr;
//    std::string xmr_usd_price;
//    std::string paid_qtum;
//    std::string qtum_usd_price;
//    std::string paid_bch;
//    std::string bch_usd_price;
//    std::string paid_rep;
//    std::string rep_usd_price;
//    std::string paid_dash;
//    std::string dash_usd_price;
//    std::string paid_ltc;
//    std::string ltc_usd_price;
//    std::string paid_eos;
//    std::string eos_usd_price;
//    std::string paid_eth;
//    std::string eth_usd_price;
//    std::string paid_btc;
//    std::string btc_usd_price;
	  std::string address_vre;
    double amount_vre_fl;
    double amount_vre_int;
//    std::string vre_usd_price;

	  BEGIN_KV_SERIALIZE_MAP()
//      KV_SERIALIZE(paid_prm)
//      KV_SERIALIZE(prm_usd_price)
//      KV_SERIALIZE(paid_xmr)
//      KV_SERIALIZE(xmr_usd_price)
//      KV_SERIALIZE(paid_qtum)
//      KV_SERIALIZE(qtum_usd_price)
//      KV_SERIALIZE(paid_bch)
//      KV_SERIALIZE(bch_usd_price)
//      KV_SERIALIZE(paid_rep)
//      KV_SERIALIZE(rep_usd_price)
//      KV_SERIALIZE(paid_dash)
//      KV_SERIALIZE(dash_usd_price)
//      KV_SERIALIZE(paid_ltc)
//      KV_SERIALIZE(ltc_usd_price)
//      KV_SERIALIZE(paid_eos)
//      KV_SERIALIZE(eos_usd_price)
//      KV_SERIALIZE(paid_eth)
//      KV_SERIALIZE(eth_usd_price)
//      KV_SERIALIZE(paid_btc)
//      KV_SERIALIZE(btc_usd_price)
      KV_SERIALIZE(address_vre)
      KV_SERIALIZE_N(amount_vre_fl, "amount_vre")
//      KV_SERIALIZE(vre_usd_price)
	  END_KV_SERIALIZE_MAP()
  };
  struct genesis_config_json_struct
  {
	  std::list<genesis_payment_entry> payments;
	  std::string proof_string;

	  BEGIN_KV_SERIALIZE_MAP()
		  KV_SERIALIZE(payments)
		  KV_SERIALIZE(proof_string)
	  END_KV_SERIALIZE_MAP()
  };


  //---------------------------------------------------------------
  void get_transaction_prefix_hash(const transaction_prefix& tx, crypto::hash& h);
  crypto::hash get_transaction_prefix_hash(const transaction_prefix& tx);
  bool parse_and_validate_tx_from_blob(const blobdata& tx_blob, transaction& tx, crypto::hash& tx_hash);
  bool parse_and_validate_tx_from_blob(const blobdata& tx_blob, transaction& tx);  
  bool construct_miner_tx(size_t height, size_t median_size, uint64_t already_generated_coins, 
                                                             size_t current_block_size, 
                                                             uint64_t fee, 
                                                             const account_public_address &miner_address, 
                                                             const account_public_address &stakeholder_address,
                                                             transaction& tx, 
                                                             const blobdata& extra_nonce = blobdata(), 
                                                             size_t max_outs = CURRENCY_MINER_TX_MAX_OUTS, 
                                                             bool pos = false,
                                                             const pos_entry& pe = pos_entry());

  bool construct_miner_tx(size_t height, size_t median_size, uint64_t already_generated_coins, 
                                                             size_t current_block_size, 
                                                             uint64_t fee, 
                                                             const std::vector<tx_destination_entry>& destinations,
                                                             transaction& tx, 
                                                             const blobdata& extra_nonce = blobdata(),
                                                             size_t max_outs = CURRENCY_MINER_TX_MAX_OUTS,
                                                             bool pos = false,
                                                             const pos_entry& pe = pos_entry());


  //---------------------------------------------------------------
  template<class extra_type_t>
  uint64_t get_tx_x_detail(const transaction& tx)
  {
    extra_type_t e = AUTO_VAL_INIT(e);
    get_type_in_variant_container(tx.extra, e);
    return e.v;
  }
  template<class extra_type_t>
  void set_tx_x_detail(transaction& tx, uint64_t v)
  {
    extra_type_t e = AUTO_VAL_INIT(e);
    e.v = v;
    update_or_add_field_to_extra(tx.extra, e);
  }

  inline uint64_t get_tx_unlock_time(const transaction& tx){ return get_tx_x_detail<etc_tx_details_unlock_time>(tx);}
  inline uint64_t get_tx_flags(const transaction& tx){ return get_tx_x_detail<etc_tx_details_flags>(tx); }
  inline uint64_t get_tx_expiration_time(const transaction& tx){ return get_tx_x_detail<etc_tx_details_expiration_time>(tx); }
  inline void set_tx_unlock_time(transaction& tx, uint64_t v){ set_tx_x_detail<etc_tx_details_unlock_time>(tx, v); }
  inline void set_tx_flags(transaction& tx, uint64_t v){ set_tx_x_detail<etc_tx_details_flags>(tx, v); }
  inline void set_tx_expiration_time(transaction& tx, uint64_t v){ set_tx_x_detail<etc_tx_details_expiration_time>(tx, v); }
  account_public_address get_crypt_address_from_destinations(const account_keys& sender_account_keys, const std::vector<tx_destination_entry>& destinations);

  bool is_tx_expired(const transaction& tx, uint64_t expiration_ts_median);

  template<class t_type>
  std::string print_t_array(const std::vector<t_type>& vec)
  {
    std::stringstream ss;
    for (auto& v : vec)
      ss << v << " ";
    return ss.str();
  }

  uint64_t get_string_uint64_hash(const std::string& str);
  bool construct_tx_out(const tx_destination_entry& de, const crypto::secret_key& tx_sec_key, size_t output_index, transaction& tx, std::set<uint16_t>& deriv_cache, uint8_t tx_outs_attr = CURRENCY_TO_KEY_OUT_RELAXED);
  bool validate_alias_name(const std::string& al);
  void get_attachment_extra_info_details(const std::vector<attachment_v>& attachment, extra_attachment_info& eai);
  bool construct_tx(const account_keys& sender_account_keys, 
    const std::vector<tx_source_entry>& sources, 
    const std::vector<tx_destination_entry>& destinations, 
    const std::vector<attachment_v>& attachments,
    transaction& tx, 
    uint64_t unlock_time, 
    uint8_t tx_outs_attr = CURRENCY_TO_KEY_OUT_RELAXED, 
    bool shuffle = true);
  bool construct_tx(const account_keys& sender_account_keys, 
    const std::vector<tx_source_entry>& sources, 
    const std::vector<tx_destination_entry>& destinations,
    const std::vector<extra_v>& extra,
    const std::vector<attachment_v>& attachments,
    transaction& tx, 
    crypto::secret_key& one_time_secret_key,
    uint64_t unlock_time,
    uint8_t tx_outs_attr = CURRENCY_TO_KEY_OUT_RELAXED, 
    bool shuffle = true,
    uint64_t flags = 0);
  bool construct_tx(const account_keys& sender_account_keys,
    const std::vector<tx_source_entry>& sources,
    const std::vector<tx_destination_entry>& destinations,
    const std::vector<extra_v>& extra,
    const std::vector<attachment_v>& attachments,
    transaction& tx,
    crypto::secret_key& one_time_secret_key,
    uint64_t unlock_time,
    const account_public_address& crypt_account,
    uint64_t expiration_time,
    uint8_t tx_outs_attr = CURRENCY_TO_KEY_OUT_RELAXED,
    bool shuffle = true,
    uint64_t flags = 0);

  bool sign_multisig_input_in_tx(currency::transaction& tx, size_t ms_input_index, const currency::account_keys& keys, const currency::transaction& source_tx, bool *p_is_input_fully_signed = nullptr);

  bool sign_extra_alias_entry(extra_alias_entry& ai, const crypto::public_key& pkey, const crypto::secret_key& skey);
  crypto::hash get_sign_buff_hash_for_alias_update(const extra_alias_entry& ai);
  bool add_tx_extra_alias(transaction& tx, const extra_alias_entry& alinfo);
  bool parse_and_validate_tx_extra(const transaction& tx, tx_extra_info& extra);
  bool parse_and_validate_tx_extra(const transaction& tx, crypto::public_key& tx_pub_key);
  crypto::public_key get_tx_pub_key_from_extra(const transaction& tx);
  bool add_tx_pub_key_to_extra(transaction& tx, const crypto::public_key& tx_pub_key);
  bool add_tx_extra_userdata(transaction& tx, const blobdata& extra_nonce);

  crypto::hash get_multisig_out_id(const transaction& tx, size_t n);
  bool is_out_to_acc(const account_keys& acc, const txout_to_key& out_key, const crypto::key_derivation& derivation, size_t output_index);
  bool is_out_to_acc(const account_keys& acc, const txout_multisig& out_multisig, const crypto::key_derivation& derivation, size_t output_index);
  bool lookup_acc_outs(const account_keys& acc, const transaction& tx, const crypto::public_key& tx_pub_key, std::vector<size_t>& outs, uint64_t& money_transfered, crypto::key_derivation& derivation);
  bool lookup_acc_outs(const account_keys& acc, const transaction& tx, std::vector<size_t>& outs, uint64_t& money_transfered, crypto::key_derivation& derivation);
  bool get_tx_fee(const transaction& tx, uint64_t & fee);
  uint64_t get_tx_fee(const transaction& tx);
  bool derive_ephemeral_key_helper(const account_keys& ack, const crypto::public_key& tx_public_key, size_t real_output_index, keypair& in_ephemeral);
  bool generate_key_image_helper(const account_keys& ack, const crypto::public_key& tx_public_key, size_t real_output_index, keypair& in_ephemeral, crypto::key_image& ki);
  bool derive_public_key_from_target_address(const account_public_address& destination_addr, const crypto::secret_key& tx_sec_key, size_t index, crypto::public_key& out_eph_public_key, crypto::key_derivation& derivation);
  bool derive_public_key_from_target_address(const account_public_address& destination_addr, const crypto::secret_key& tx_sec_key, size_t index, crypto::public_key& out_eph_public_key);
  void get_blob_hash(const blobdata& blob, crypto::hash& res);
  crypto::hash get_blob_hash(const blobdata& blob);
  std::string short_hash_str(const crypto::hash& h);
  bool is_mixattr_applicable_for_fake_outs_counter(uint8_t mix_attr, uint64_t fake_attr_count);
  bool is_tx_spendtime_unlocked(uint64_t unlock_time, uint64_t current_blockchain_size, uint64_t current_time);
  bool decrypt_payload_items(bool is_income, const transaction& tx, const account_keys& acc_keys, std::vector<payload_items_v>& decrypted_items);
  void encrypt_attachments(transaction& tx, const account_keys& sender_keys, const account_public_address& destination_addr, const keypair& tx_random_key);
  bool is_derivation_used_to_encrypt(const transaction& tx, const crypto::key_derivation& derivation);
  uint64_t get_tx_type(const transaction& tx);
  size_t get_multisig_out_index(const std::vector<tx_out>& outs);
  size_t get_multisig_in_index(const std::vector<txin_v>& inputs);

  uint64_t get_reward_from_miner_tx(const transaction& tx);

  crypto::hash get_transaction_hash(const transaction& t);
  bool get_transaction_hash(const transaction& t, crypto::hash& res);
  bool get_transaction_hash(const transaction& t, crypto::hash& res, uint64_t& blob_size);
  //bool get_transaction_hash(const transaction& t, crypto::hash& res, size_t& blob_size);
  blobdata get_block_hashing_blob(const block& b);
  bool get_block_hash(const block& b, crypto::hash& res);
  crypto::hash get_block_hash(const block& b);
  bool generate_genesis_block(block& bl);
  const crypto::hash& get_genesis_hash(bool need_to_set = false, const crypto::hash& h = null_hash);
  bool parse_and_validate_block_from_blob(const blobdata& b_blob, block& b);
  uint64_t get_inputs_money_amount(const transaction& tx);
  bool get_inputs_money_amount(const transaction& tx, uint64_t& money);
  uint64_t get_outs_money_amount(const transaction& tx);
  bool check_inputs_types_supported(const transaction& tx);
  bool check_outs_valid(const transaction& tx);
  bool parse_amount(uint64_t& amount, const std::string& str_amount);
  void ethash_set_use_dag(bool use_dag);
  const uint8_t* ethash_get_dag(uint64_t epoch, uint64_t& dag_size);
  uint64_t ethash_height_to_epoch(uint64_t height);
  
  crypto::hash get_block_longhash(uint64_t h, const crypto::hash& block_long_ash, uint64_t nonce);
  void get_block_longhash(const block& b, crypto::hash& res);
  crypto::hash get_block_longhash(const block& b);
  bool unserialize_block_complete_entry(const COMMAND_RPC_GET_BLOCKS_FAST::response& serialized,
    COMMAND_RPC_GET_BLOCKS_DIRECT::response& unserialized);

  
  uint64_t get_alias_cost_from_fee(const std::string& alias, uint64_t fee_median);
  //const crypto::public_key get_offer_secure_key_by_index_from_tx(const transaction& tx, size_t index);

  bool check_money_overflow(const transaction& tx);
  bool check_outs_overflow(const transaction& tx);
  bool check_inputs_overflow(const transaction& tx);
  uint64_t get_block_height(const transaction& coinbase);
  uint64_t get_block_height(const block& b);
  std::vector<txout_v> relative_output_offsets_to_absolute(const std::vector<txout_v>& off);
  std::vector<txout_v> absolute_output_offsets_to_relative(const std::vector<txout_v>& off);
  // prints amount in format "3.14000000", "0.00000000", 3_141_592.60000000 with_separates = true
  std::string print_money(uint64_t amount, bool with_separates = false);
  std::string print_fixed_decimal_point(uint64_t amount, size_t decimal_point, bool with_separates = false);
  // prints amount in format "3.14", "0.0"
  std::string print_money_brief(uint64_t amount);
  uint64_t get_actual_timestamp(const block& b);
  
  bool addendum_to_hexstr(const std::vector<crypto::hash>& add, std::string& hex_buff);
  bool hexstr_to_addendum(const std::string& hex_buff, std::vector<crypto::hash>& add);
  bool set_payment_id_to_tx(std::vector<attachment_v>& att, const currency::bc_payment_id& payment_id);
  bool add_padding_to_tx(transaction& tx, size_t count);
  bool is_service_tx(const transaction& tx);
  bool is_mixin_tx(const transaction& tx);
  bool is_showing_sender_addres(const transaction& tx);
  uint64_t get_amount_for_zero_pubkeys(const transaction& tx);
  //std::string get_comment_from_tx(const transaction& tx);
  std::string print_stake_kernel_info(const stake_kernel& sk);
  std::string dump_ring_sig_data(const crypto::hash& hash_for_sig, const crypto::key_image& k_image, const std::vector<const crypto::public_key*>& output_keys_ptrs, const std::vector<crypto::signature>& sig);

  //PoS
  bool is_pos_block(const block& b);
  uint64_t get_coinday_weight(uint64_t amount);
  wide_difficulty_type correct_difficulty_with_sequence_factor(size_t sequence_factor, wide_difficulty_type diff);
  void print_currency_details(std::ostream &os);
  std::string print_reward_change_first_blocks(size_t n_of_first_blocks);
  bool get_aliases_reward_account(account_public_address& acc, crypto::secret_key& acc_view_key);
  bool get_aliases_reward_account(account_public_address& acc);
  alias_rpc_details alias_info_to_rpc_alias_info(const currency::extra_alias_entry& ai);
  update_alias_rpc_details alias_info_to_rpc_update_alias_info(const currency::extra_alias_entry& ai, const std::string& old_address);
  size_t get_service_attachments_count_in_tx(const transaction& tx);
  bool fill_tx_rpc_outputs(tx_rpc_extended_info& tei, const transaction& tx, const transaction_chain_entry* ptce);
  bool fill_tx_rpc_inputs(tx_rpc_extended_info& tei, const transaction& tx);
  bool fill_tx_rpc_details(tx_rpc_extended_info& tei, const transaction& tx, const transaction_chain_entry* ptce, const crypto::hash& h, uint64_t timestamp, bool is_short = false);
  bool fill_block_rpc_details(block_rpc_extended_info& pei_rpc, const block_extended_info& bei_chain, const crypto::hash& h);
  void append_per_block_increments_for_tx(const transaction& tx, std::unordered_map<uint64_t, uint32_t>& gindices);

  /************************************************************************/
  /*                                                                      */
  /************************************************************************/
  template<class t_array>
  struct array_hasher : std::unary_function<t_array&, std::size_t>
  {
    std::size_t operator()(const t_array& val) const
    {
      return boost::hash_range(&val.data[0], &val.data[sizeof(val.data)]);
    }
  };

  template<class t_txin_v>
  typename std::conditional<std::is_const<t_txin_v>::value, const std::vector<txin_etc_details_v>, std::vector<txin_etc_details_v> >::type& get_txin_etc_options(t_txin_v& in)
  {
    static typename std::conditional<std::is_const<t_txin_v>::value, const std::vector<txin_etc_details_v>, std::vector<txin_etc_details_v> >::type stub;


    //static  stub;

    if (in.type() == typeid(txin_to_key))
      return boost::get<txin_to_key>(in).etc_details;
    else if (in.type() == typeid(txin_multisig))
      return boost::get<txin_multisig>(in).etc_details;
     else
       return stub;
  }

  template<class t_extra_container>
  bool add_attachments_info_to_extra(t_extra_container& extra_container, const std::vector<attachment_v>& attachments)
  {
    if (!attachments.empty())
    {
      extra_attachment_info eai = AUTO_VAL_INIT(eai);
      get_attachment_extra_info_details(attachments, eai);
      extra_container.push_back(eai);
    }
    return true;
  }


  /************************************************************************/
  /* helper functions                                                     */
  /************************************************************************/
  size_t get_max_block_size();
  size_t get_max_tx_size();
  bool get_block_reward(bool is_pos, size_t median_size, size_t current_block_size, uint64_t already_generated_coins, uint64_t &reward, uint64_t height);
  uint64_t get_base_block_reward(bool is_pos, uint64_t already_generated_coins, uint64_t height);
  uint64_t get_tx_minimum_fee(uint64_t height);
  std::string get_account_address_as_str(const account_public_address& addr);
  std::string get_account_address_and_payment_id_as_str(const account_public_address& addr, const currency::bc_payment_id& payment_id);
  bool get_account_address_from_str(account_public_address& addr, const std::string& str);
  bool get_account_address_and_payment_id_from_str(account_public_address& addr, currency::bc_payment_id& payment_id, const std::string& str);
  bool is_coinbase(const transaction& tx);
  bool is_pos_coinbase(const transaction &tx);
  bool is_pow_coinbase(const transaction &tx);
  bool have_attachment_service_in_container(const std::vector<attachment_v>& av, const std::string& service_id, const std::string& instruction);
  crypto::hash prepare_prefix_hash_for_sign(const transaction& tx, uint64_t in_index, const crypto::hash& tx_id);

  //------------------------------------------------------------------------------------
  template<class t_pod_type, class result_type>
  result_type get_pod_checksum(const t_pod_type& bl)
  {
    const unsigned char* pbuf = reinterpret_cast<const unsigned char*>(&bl);
    result_type summ = 0;
    for (size_t i = 0; i != sizeof(t_pod_type)-1; i++)
      summ += pbuf[i];

    return summ;
  }
  //---------------------------------------------------------------
  template<class tx_out_t>
  bool is_out_to_acc(const account_keys& acc, const tx_out_t& out_key, const crypto::public_key& tx_pub_key, size_t output_index)
  {
    crypto::key_derivation derivation;
    generate_key_derivation(tx_pub_key, acc.m_view_secret_key, derivation);
    return is_out_to_acc(acc, out_key, derivation, output_index);
  }
  //---------------------------------------------------------------
  template<typename specic_type_t, typename variant_t_container>
  bool have_type_in_variant_container(const variant_t_container& av)
  {
    for (auto& ai : av)
    {
      if (ai.type() == typeid(specic_type_t))
      {
        return true;
      }
    }
    return false;
  }
  //---------------------------------------------------------------
  template<typename specic_type_t, typename variant_t_container>
  size_t count_type_in_variant_container(const variant_t_container& av)
  {
    size_t result = 0;
    for (auto& ai : av)
    {
      if (ai.type() == typeid(specic_type_t))
        ++result;
    }
    return result;
  }
  //---------------------------------------------------------------
  template<typename specic_type_t, typename variant_t_container>
  bool get_type_in_variant_container(const variant_t_container& av, specic_type_t& a)
  {
    for (auto& ai : av)
    {
      if (ai.type() == typeid(specic_type_t))
      {
        a = boost::get<specic_type_t>(ai);
        return true;
      }
    }
    return false;
  }
  //---------------------------------------------------------------
  template<typename variant_container_t>
  bool check_allowed_types_in_variant_container(const variant_container_t& container, const std::unordered_set<std::type_index>& allowed_types, bool elements_must_be_unique = true)
  {
    for (auto it = container.begin(); it != container.end(); ++it)
    {
      if (allowed_types.count(std::type_index(it->type())) == 0)
        return false;

      if (elements_must_be_unique)
      {
        for (auto jt = it + 1; jt != container.end(); ++jt)
          if (it->type().hash_code() == jt->type().hash_code())
            return false;
      }
    }
    return true;
  }
  //---------------------------------------------------------------
  template<typename variant_container_t>
  bool check_allowed_types_in_variant_container(const variant_container_t& container, const variant_container_t& allowed_types_examples, bool elements_must_be_unique = true)
  {
    std::unordered_set<std::type_index> allowed_types;
    for (auto& el : allowed_types_examples)
      if (!allowed_types.insert(std::type_index(el.type())).second)
        return false; // invalid allowed_types_examples container

    return check_allowed_types_in_variant_container(container, allowed_types, elements_must_be_unique);
  }
  //---------------------------------------------------------------
  template<typename variant_container_t>
  std::string stringize_types_in_variant_container(const variant_container_t& container)
  {
    std::string result;
    for (auto it = container.begin(); it != container.end(); ++it)
      result = (result + it->type().name()) + (it + 1 != container.end() ? ", " : "");
    return result;
  }
  //----------------------------------------------------------------------------------------------------
  template<class t_container>
  bool validate_attachment_info(const t_container& container, const std::vector<attachment_v>& attachments, bool allow_no_info_for_non_empty_attachments_container)
  {
    // this routine makes sure the container has correct and valid extra_attachment_info
    extra_attachment_info eai = AUTO_VAL_INIT(eai);
    bool r = get_type_in_variant_container(container, eai);
    if (!r && allow_no_info_for_non_empty_attachments_container)
      return true;

    // two valid options here: 1) no attachment info and empty attachements container; 2) attachment info present and the container is not empty
    CHECK_AND_ASSERT_MES(r == !attachments.empty(), false, "Invalid attachment info: extra_attachment_info is " << (r ? "present" : "not present") << " while attachments size is " << attachments.size());

    CHECK_AND_ASSERT_MES(eai.cnt <= attachments.size(), false, "Incorrect attachments counter: " << eai.cnt << " while attachments size is " << attachments.size());

    extra_attachment_info eai_local = AUTO_VAL_INIT(eai_local);
    if (eai.cnt == attachments.size())
    {
      get_attachment_extra_info_details(attachments, eai_local);
    }
    else
    {
      std::vector<attachment_v> attachments_local(attachments.begin(), attachments.begin() + static_cast<size_t>(eai.cnt)); // make a local copy of eai.cnt attachments
      get_attachment_extra_info_details(attachments_local, eai_local);
    }

    // ...and compare with the one from the container
    CHECK_AND_ASSERT_MES(eai == eai_local, false, "Invalid attachments info: (" << eai.cnt << "," << eai.hsh << "," << eai.sz << ")  expected: (" << eai_local.cnt << "," << eai_local.hsh << "," << eai_local.sz << ")");

    return true;
  }

  //------------------------------------------------------------------
  template<class alias_rpc_details_t>
  bool alias_info_to_rpc_alias_info(const currency::extra_alias_entry& ai, alias_rpc_details_t& ari)
  {
    return alias_info_to_rpc_alias_info(ai.m_alias, ai, ari);
  }

  template<class alias_rpc_details_t>
  bool alias_info_to_rpc_alias_info(const std::string& alias, const currency::extra_alias_entry_base& aib, alias_rpc_details_t& ari)
  {
    ari.alias = alias;
    ari.details.address = currency::get_account_address_as_str(aib.m_address);
    ari.details.comment = aib.m_text_comment;
    if (aib.m_view_key.size())
      ari.details.tracking_key = epee::string_tools::pod_to_hex(aib.m_view_key.back());

    return true;
  }

  template<class alias_rpc_details_t>
  bool alias_rpc_details_to_alias_info(const alias_rpc_details_t& ard, currency::extra_alias_entry& ai)
  {
    if (!currency::get_account_address_from_str(ai.m_address, ard.details.address))
    {
      LOG_ERROR("Failed to parse address: " << ard.details.address);
      return false;
    }
    if (ard.details.tracking_key.size())
    {
      if (!epee::string_tools::parse_tpod_from_hex_string(ard.details.tracking_key, ai.m_view_key))
      {
        LOG_ERROR("Failed to parse tracking_key: " << ard.details.tracking_key);
        return false;
      }
    }
    //ai.m_sign; atm alias updating disabled
    ai.m_text_comment = ard.details.comment;
    ai.m_alias = ard.alias;
    return true;
  }


  template<class extra_t>
  extra_t& get_or_add_field_to_extra(std::vector<extra_v>& extra)
  {
    for (auto& ev : extra)
    {
      if (ev.type() == typeid(extra_t))
        return boost::get<extra_t>(ev);
    }
    extra.push_back(extra_t());
    return boost::get<extra_t>(extra.back());
  }
  template<class variant_t, class variant_type_t>
  void update_or_add_field_to_extra(std::vector<variant_t>& variant_container, const variant_type_t& v)
  {
    for (auto& ev : variant_container)
    {
      if (ev.type() == typeid(variant_type_t))
      {
        boost::get<variant_type_t>(ev) = v;
        return;
      }
    }
    variant_container.push_back(v);
  }

  //---------------------------------------------------------------
  template<typename t_container>
  bool get_payment_id_from_tx(const t_container& att, currency::bc_payment_id& payment_id)
  {
    tx_service_attachment sa = AUTO_VAL_INIT(sa);
    if (bc_services::get_first_service_attachment_by_id(att, BC_PAYMENT_ID_SERVICE_ID, "", sa))
    {
      payment_id.id=sa.body;
      return true;
    }
    return false;
  }

  //---------------------------------------------------------------
  template<class t_object>
  bool get_object_hash(const t_object& o, crypto::hash& res)
  {
    get_blob_hash(t_serializable_object_to_blob(o), res);
    return true;
  }
  //---------------------------------------------------------------
  template<class t_object>
  crypto::hash get_object_hash(const t_object& o)
  {
    crypto::hash h;
    get_object_hash(o, h);
    return h;
  }
  //---------------------------------------------------------------

  template<class t_object>
  size_t get_object_blobsize(const t_object& o)
  {
    blobdata b = t_serializable_object_to_blob(o);
    return b.size();
  }
  //---------------------------------------------------------------
  size_t get_object_blobsize(const transaction& t);
  size_t get_object_blobsize(const transaction& t, uint64_t prefix_blob_size);
  //---------------------------------------------------------------
  template<class t_object>
  bool get_object_hash(const t_object& o, crypto::hash& res, uint64_t& blob_size)
  {
    blobdata bl = t_serializable_object_to_blob(o);
    blob_size = bl.size();
    get_blob_hash(bl, res);
    return true;
  }
  //---------------------------------------------------------------
  template <typename T>
  std::string obj_to_json_str(const T& obj)
  {
    std::stringstream ss;
    json_archive<true> ar(ss, true);
    bool r = ::serialization::serialize(ar, const_cast<T&>(obj));
    CHECK_AND_ASSERT_MES(r, "", "obj_to_json_str failed: serialization::serialize returned false");
    return ss.str();
  }
  //---------------------------------------------------------------
  // 62387455827 -> 455827 + 7000000 + 80000000 + 300000000 + 2000000000 + 60000000000, where 455827 <= dust_threshold
  template<typename chunk_handler_t, typename dust_handler_t>
  void decompose_amount_into_digits(uint64_t amount, uint64_t dust_threshold, const chunk_handler_t& chunk_handler, const dust_handler_t& dust_handler, uint64_t max_output_allowed, size_t max_outs_count, size_t outs_count = 0)
  {
    CHECK_AND_ASSERT_MES(amount != 0, void(), "zero amount");
    CHECK_AND_ASSERT_MES(amount / max_output_allowed <= max_outs_count, void(), "too big amount: " << print_money(amount) << " for given max_output_allowed: " << print_money(max_output_allowed) << ", it would require >" << amount / max_output_allowed << " outputs");

    bool is_dust_handled = false;
    uint64_t dust = 0;
    uint64_t multiplier = 1;
    while (0 != amount )
    {
      uint64_t chunk = (amount % 10) * multiplier;
      if (chunk > max_output_allowed)
        break;
      amount /= 10;
      multiplier *= 10;
      


      if (dust + chunk <= dust_threshold)
      {
        dust += chunk;
      }
      else
      {
        if (!is_dust_handled && 0 != dust)
        {
          dust_handler(dust);
          is_dust_handled = true;
        }
        if (0 != chunk)
        {
          chunk_handler(chunk);
          ++outs_count;
        }
      }
    }
    if (amount)
    {
      //CHECK_AND_ASSERT_MES_NO_RET(max_output_allowed >= multiplier, "max_output_allowed > multiplier");
      CHECK_AND_ASSERT_MES(multiplier != 0, void(), "decompose_amount_into_digits: internal error: multiplier == 0");
      uint64_t amount_multiplied = amount * multiplier;
      while (amount_multiplied >= max_output_allowed)
      {
        amount_multiplied -= max_output_allowed;
        chunk_handler(max_output_allowed);
        ++outs_count;
        CHECK_AND_ASSERT_MES(outs_count < max_outs_count || amount_multiplied == 0, void(), "decompose_amount_into_digits: too many outputs");
      }

      if (amount_multiplied != 0)
        decompose_amount_into_digits(amount_multiplied, dust_threshold, chunk_handler, dust_handler, max_output_allowed, max_outs_count, outs_count);
    }


    if (!is_dust_handled && 0 != dust)
    {
      dust_handler(dust);
    }
  }
  
  template<typename chunk_handler_t, typename dust_handler_t>
  void decompose_amount_into_digits(uint64_t amount, uint64_t dust_threshold, const chunk_handler_t& chunk_handler, const dust_handler_t& dust_handler)
  {
    decompose_amount_into_digits(amount, dust_threshold, chunk_handler, dust_handler, WALLET_MAX_ALLOWED_OUTPUT_AMOUNT, CURRENCY_TX_MAX_ALLOWED_OUTS, 0);
  }

  template<typename chunk_handler_t, typename dust_handler_t>
  void decompose_amount_into_digits(uint64_t amount, uint64_t dust_threshold, const chunk_handler_t& chunk_handler, const dust_handler_t& dust_handler, uint64_t max_output_allowed)
  {
    decompose_amount_into_digits(amount, dust_threshold, chunk_handler, dust_handler, max_output_allowed, CURRENCY_TX_MAX_ALLOWED_OUTS, 0);
  }
  //---------------------------------------------------------------
  inline size_t get_input_expected_signatures_count(const txin_v& tx_in)
  {
    struct txin_signature_size_visitor : public boost::static_visitor<size_t>
    {
      size_t operator()(const txin_gen& /*txin*/) const   { return 0; }
      size_t operator()(const txin_to_key& txin) const    { return txin.key_offsets.size(); }
      size_t operator()(const txin_multisig& txin) const  { return txin.sigs_count; }
    };

    return boost::apply_visitor(txin_signature_size_visitor(), tx_in);
  }
  //---------------------------------------------------------------
  inline const std::vector<txin_etc_details_v>* get_input_etc_details(const txin_v& in)
  {
    if (in.type().hash_code() == typeid(txin_to_key).hash_code())
      return &boost::get<txin_to_key>(in).etc_details;
    if (in.type().hash_code() == typeid(txin_multisig).hash_code())
      return &boost::get<txin_multisig>(in).etc_details;
    return nullptr;
  }
  //---------------------------------------------------------------
  inline std::vector<txin_etc_details_v>* get_input_etc_details(txin_v& in)
  {
    if (in.type().hash_code() == typeid(txin_to_key).hash_code())
      return &boost::get<txin_to_key>(in).etc_details;
    if (in.type().hash_code() == typeid(txin_multisig).hash_code())
      return &boost::get<txin_multisig>(in).etc_details;
    return nullptr;
  }
  //---------------------------------------------------------------

  blobdata block_to_blob(const block& b);
  bool block_to_blob(const block& b, blobdata& b_blob);
  blobdata tx_to_blob(const transaction& b);
  bool tx_to_blob(const transaction& b, blobdata& b_blob);
  void get_tx_tree_hash(const std::vector<crypto::hash>& tx_hashes, crypto::hash& h);
  crypto::hash get_tx_tree_hash(const std::vector<crypto::hash>& tx_hashes);
  crypto::hash get_tx_tree_hash(const block& b);

#define CHECKED_GET_SPECIFIC_VARIANT(variant_var, specific_type, variable_name, fail_return_val) \
  CHECK_AND_ASSERT_MES(variant_var.type() == typeid(specific_type), fail_return_val, "wrong variant type: " << variant_var.type().name() << ", expected " << typeid(specific_type).name()); \
  specific_type& variable_name = boost::get<specific_type>(variant_var);

  struct input_amount_getter : public boost::static_visitor<uint64_t>
  {
    template<class t_input>
    uint64_t operator()(const t_input& i) const{return i.amount;}
    uint64_t operator()(const txin_gen& i) const {return 0;}
  };

  inline uint64_t get_amount_from_variant(const txin_v& v)
  {
    return boost::apply_visitor(input_amount_getter(), v);
  }

  inline bool build_kernel(const crypto::key_image& ki,
    stake_kernel& kernel,
    const stake_modifier_type& stake_modifier,
    uint64_t timestamp)
  {
    kernel = stake_kernel();
    kernel.kimage = ki;
    kernel.stake_modifier = stake_modifier;
    kernel.block_timestamp = timestamp;
    return true;
  };

  //---------------------------------------------------------------
  std::ostream& operator <<(std::ostream& o, const ref_by_id& r);
  //---------------------------------------------------------------
  std::string utf8_to_upper(const std::string& s);
  std::string utf8_to_lower(const std::string& s);
  bool utf8_substring_test_case_insensitive(const std::string& match, const std::string& s); // Returns true is 's' contains 'match' (case-insensitive)

} // namespace currency

template <class T>
std::ostream &print256(std::ostream &o, const T &v) {
  return o << "<" << epee::string_tools::pod_to_hex(v) << ">";
}

template <class T>
std::ostream &print16(std::ostream &o, const T &v) {
  return o << "<" << epee::string_tools::pod_to_hex(v).substr(0, 5) << "..>";
}

template <class T>
std::string print16(const T &v) {
  return std::string("<") + epee::string_tools::pod_to_hex(v).substr(0, 5) + "..>";
}

template <class T>
std::istream &scan256(std::istream &i, T &v)
{
  std::string v_str;
  i >> v_str;
  if (v_str.size() != sizeof(T) * 2 + 2)
    throw std::runtime_error("incorect size");
  if (!epee::string_tools::hex_to_pod(v_str.substr(1, v_str.size() - 2), v))
    throw std::runtime_error("error hex_to_pod");
  return i;
}

//POD_MAKE_COMPARABLE(currency, extra_attachment_info)


// namespace std
// {
//   inline
//   bool operator ==(const currency::transaction& a, const currency::transaction& b)
//   {
//     return currency::get_transaction_hash(a) == currency::get_transaction_hash(b);
//   }
//   inline
//   bool operator ==(const currency::block& a, const currency::block& b)
//   {
//     return currency::get_block_hash(a) == currency::get_block_hash(b);
//   }
// }

bool parse_hash256(const std::string str_hash, crypto::hash& hash);

namespace crypto {
  inline std::ostream &operator <<(std::ostream &o, const crypto::public_key &v) { return print256(o, v); }
  inline std::ostream &operator <<(std::ostream &o, const crypto::secret_key &v) { return print256(o, v); }
  inline std::ostream &operator <<(std::ostream &o, const crypto::key_derivation &v) { return print256(o, v); }
  inline std::ostream &operator <<(std::ostream &o, const crypto::key_image &v) { return print256(o, v); }
  inline std::ostream &operator <<(std::ostream &o, const crypto::signature &v) { return print256(o, v); }
  inline std::ostream &operator <<(std::ostream &o, const crypto::hash &v) { return print256(o, v); }
  inline std::istream &operator >>(std::istream &i, crypto::hash &v) { return scan256(i, v); }
}
