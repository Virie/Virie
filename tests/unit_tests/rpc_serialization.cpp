// Copyright (c) 2014-2020 The Virie Project
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include <gtest/gtest.h>

#include "rpc/core_rpc_server_commands_defs.h"
#include "wallet/wallet_rpc_server_commans_defs.h"
#include "storages/portable_storage_template_helper.h"

std::map<std::string, std::pair<std::string, std::string>> serialized_structs = {

  // legacy JSON-alike RPCs
  {
    "COMMAND_RPC_GET_HEIGHT",
    {
      "{}", "{  \"height\": 0,  \"status\": \"\"}"
    }
  },
  {
    "COMMAND_RPC_GET_TRANSACTIONS",
    {
      "{}", "{  \"status\": \"\"}"
    }
  },
  {
    "COMMAND_RPC_SEND_RAW_TX",
    {
      "{  \"tx_as_hex\": \"\"}", "{  \"status\": \"\"}"
    }
  },
  {
    "COMMAND_RPC_FORCE_RELAY_RAW_TXS",
    {
      "{}", "{  \"status\": \"\"}"
    }
  },
  {
    "COMMAND_RPC_START_MINING",
    {
      "{  \"miner_address\": \"\",  \"threads_count\": 0}", "{  \"status\": \"\"}"
    }
  },
  {
    "COMMAND_RPC_STOP_MINING",
    {
      "{}", "{  \"status\": \"\"}"
    }
  },
  {
#ifdef TESTNET
    "COMMAND_RPC_GET_STATIC_INFO",
    {
      "{}",
      "{  \"rpc_version\": " + std::to_string(CORE_RPC_PROTOCOL_VERSION) + ",  \"test_name\": \"" + std::string(CURRENCY_NAME_SHORT) + "\",  \"version\": \"" + std::string(PROJECT_VERSION_LONG) + "\"}"
    }

#else
    "COMMAND_RPC_GET_STATIC_INFO",
    {
      "{}",
      "{  \"rpc_version\": " + std::to_string(CORE_RPC_PROTOCOL_VERSION) + ",  \"version\": \"" + std::string(PROJECT_VERSION_LONG) + "\"}"
    }
#endif
  },
  {
#ifdef TESTNET
    "COMMAND_RPC_GET_INFO",
    {
      "{  \"flags\": 0}",
      "{  \"alias_count\": 0,  \"alt_blocks_count\": 0,  \"block_reward\": 0,  \"current_blocks_median\": 0,  \"current_max_allowed_block_size\": 0,  \"current_network_hashrate_350\": 0,  \"current_network_hashrate_50\": 0,  \"daemon_network_state\": 0,  \"default_fee\": 0,  \"expiration_median_timestamp\": 0,  \"grey_peerlist_size\": 0,  \"height\": 0,  \"incoming_connections_count\": 0,  \"last_block_size\": 0,  \"last_block_total_reward\": 0,  \"last_pos_timestamp\": 0,  \"last_pow_timestamp\": 0,  \"max_net_seen_height\": 0,  \"mi\": {    \"build_no\": 0,    \"mode\": 0,    \"ver_major\": 0,    \"ver_minor\": 0,    \"ver_revision\": 0  },  \"minimum_fee\": 0,  \"net_time_delta_median\": 0,  \"offers_count\": 0,  \"outgoing_connections_count\": 0,  \"outs_stat\": {    \"amount_0_001\": 0,    \"amount_0_01\": 0,    \"amount_0_1\": 0,    \"amount_1\": 0,    \"amount_10\": 0,    \"amount_100\": 0,    \"amount_1000\": 0,    \"amount_10000\": 0,    \"amount_100000\": 0,    \"amount_1000000\": 0  },  \"performance_data\": {    \"all_txs_insert_time_5\": 0,    \"block_processing_time_0\": 0,    \"block_processing_time_1\": 0,    \"etc_stuff_6\": 0,    \"insert_time_4\": 0,    \"longhash_calculating_time_3\": 0,    \"map_size\": 0,    \"raise_block_core_event\": 0,    \"target_calculating_time_2\": 0,    \"tx_add_one_tx_time\": 0,    \"tx_append_is_expired\": 0,    \"tx_append_rl_wait\": 0,    \"tx_append_time\": 0,    \"tx_check_exist\": 0,    \"tx_check_inputs_attachment_check\": 0,    \"tx_check_inputs_loop\": 0,    \"tx_check_inputs_loop_ch_in_val_sig\": 0,    \"tx_check_inputs_loop_kimage_check\": 0,    \"tx_check_inputs_loop_scan_outputkeys_get_item_size\": 0,    \"tx_check_inputs_loop_scan_outputkeys_loop\": 0,    \"tx_check_inputs_loop_scan_outputkeys_loop_find_tx\": 0,    \"tx_check_inputs_loop_scan_outputkeys_loop_get_subitem\": 0,    \"tx_check_inputs_loop_scan_outputkeys_loop_handle_output\": 0,    \"tx_check_inputs_loop_scan_outputkeys_relative_to_absolute\": 0,    \"tx_check_inputs_prefix_hash\": 0,    \"tx_check_inputs_time\": 0,    \"tx_count\": 0,    \"tx_prapare_append\": 0,    \"tx_print_log\": 0,    \"tx_process_attachment\": 0,    \"tx_process_extra\": 0,    \"tx_process_inputs\": 0,    \"tx_push_global_index\": 0,    \"tx_store_db\": 0,    \"writer_tx_count\": 0  },  \"pos_allowed\": false,  \"pos_block_ts_shift_vs_actual\": 0,  \"pos_diff_total_coins_rate\": 0,  \"pos_difficulty\": \"\",  \"pos_sequence_factor\": 0,  \"pow_difficulty\": 0,  \"pow_sequence_factor\": 0,  \"seconds_for_10_blocks\": 0,  \"seconds_for_30_blocks\": 0,  \"status\": \"\",  \"synchronization_start_height\": 0,  \"synchronized_connections_count\": 0,  \"test_net\": \"" + std::string(CURRENCY_NAME_SHORT) + "\",  \"total_coins\": 0,  \"transactions_cnt_per_day\": 0,  \"transactions_volume_per_day\": 0,  \"tx_count\": 0,  \"tx_count_in_last_block\": 0,  \"tx_pool_performance_data\": {    \"begin_tx_time\": 0,    \"check_inputs_time\": 0,    \"check_inputs_types_supported_time\": 0,    \"check_keyimages_ws_ms_time\": 0,    \"db_commit_time\": 0,    \"expiration_validate_time\": 0,    \"tx_processing_time\": 0,    \"update_db_time\": 0,    \"validate_alias_time\": 0,    \"validate_amount_time\": 0  },  \"tx_pool_size\": 0,  \"unavailable_disk_space\": false,  \"white_peerlist_size\": 0}"
    }

#else
    "COMMAND_RPC_GET_INFO",
    {
      "{  \"flags\": 0}",
      "{  \"alias_count\": 0,  \"alt_blocks_count\": 0,  \"block_reward\": 0,  \"current_blocks_median\": 0,  \"current_max_allowed_block_size\": 0,  \"current_network_hashrate_350\": 0,  \"current_network_hashrate_50\": 0,  \"daemon_network_state\": 0,  \"default_fee\": 0,  \"expiration_median_timestamp\": 0,  \"grey_peerlist_size\": 0,  \"height\": 0,  \"incoming_connections_count\": 0,  \"last_block_size\": 0,  \"last_block_total_reward\": 0,  \"last_pos_timestamp\": 0,  \"last_pow_timestamp\": 0,  \"max_net_seen_height\": 0,  \"mi\": {    \"build_no\": 0,    \"mode\": 0,    \"ver_major\": 0,    \"ver_minor\": 0,    \"ver_revision\": 0  },  \"minimum_fee\": 0,  \"net_time_delta_median\": 0,  \"offers_count\": 0,  \"outgoing_connections_count\": 0,  \"outs_stat\": {    \"amount_0_001\": 0,    \"amount_0_01\": 0,    \"amount_0_1\": 0,    \"amount_1\": 0,    \"amount_10\": 0,    \"amount_100\": 0,    \"amount_1000\": 0,    \"amount_10000\": 0,    \"amount_100000\": 0,    \"amount_1000000\": 0  },  \"performance_data\": {    \"all_txs_insert_time_5\": 0,    \"block_processing_time_0\": 0,    \"block_processing_time_1\": 0,    \"etc_stuff_6\": 0,    \"insert_time_4\": 0,    \"longhash_calculating_time_3\": 0,    \"map_size\": 0,    \"raise_block_core_event\": 0,    \"target_calculating_time_2\": 0,    \"tx_add_one_tx_time\": 0,    \"tx_append_is_expired\": 0,    \"tx_append_rl_wait\": 0,    \"tx_append_time\": 0,    \"tx_check_exist\": 0,    \"tx_check_inputs_attachment_check\": 0,    \"tx_check_inputs_loop\": 0,    \"tx_check_inputs_loop_ch_in_val_sig\": 0,    \"tx_check_inputs_loop_kimage_check\": 0,    \"tx_check_inputs_loop_scan_outputkeys_get_item_size\": 0,    \"tx_check_inputs_loop_scan_outputkeys_loop\": 0,    \"tx_check_inputs_loop_scan_outputkeys_loop_find_tx\": 0,    \"tx_check_inputs_loop_scan_outputkeys_loop_get_subitem\": 0,    \"tx_check_inputs_loop_scan_outputkeys_loop_handle_output\": 0,    \"tx_check_inputs_loop_scan_outputkeys_relative_to_absolute\": 0,    \"tx_check_inputs_prefix_hash\": 0,    \"tx_check_inputs_time\": 0,    \"tx_count\": 0,    \"tx_prapare_append\": 0,    \"tx_print_log\": 0,    \"tx_process_attachment\": 0,    \"tx_process_extra\": 0,    \"tx_process_inputs\": 0,    \"tx_push_global_index\": 0,    \"tx_store_db\": 0,    \"writer_tx_count\": 0  },  \"pos_allowed\": false,  \"pos_block_ts_shift_vs_actual\": 0,  \"pos_diff_total_coins_rate\": 0,  \"pos_difficulty\": \"\",  \"pos_sequence_factor\": 0,  \"pow_difficulty\": 0,  \"pow_sequence_factor\": 0,  \"seconds_for_10_blocks\": 0,  \"seconds_for_30_blocks\": 0,  \"status\": \"\",  \"synchronization_start_height\": 0,  \"synchronized_connections_count\": 0,  \"total_coins\": 0,  \"transactions_cnt_per_day\": 0,  \"transactions_volume_per_day\": 0,  \"tx_count\": 0,  \"tx_count_in_last_block\": 0,  \"tx_pool_performance_data\": {    \"begin_tx_time\": 0,    \"check_inputs_time\": 0,    \"check_inputs_types_supported_time\": 0,    \"check_keyimages_ws_ms_time\": 0,    \"db_commit_time\": 0,    \"expiration_validate_time\": 0,    \"tx_processing_time\": 0,    \"update_db_time\": 0,    \"validate_alias_time\": 0,    \"validate_amount_time\": 0  },  \"tx_pool_size\": 0,  \"unavailable_disk_space\": false,  \"white_peerlist_size\": 0}"
    }
#endif
  },

  // binary RPCs
  {
    "COMMAND_RPC_GET_BLOCKS_FAST",
    {
      "{}",
      "{  \"current_height\": 0,  \"start_height\": 0,  \"status\": \"\"}"
    }
  },
  {
    "COMMAND_RPC_GET_TX_GLOBAL_OUTPUTS_INDEXES",
    {
      "{  \"txid\": \"\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\"}",
      "{  \"status\": \"\"}"
    }
  },
  {
    "COMMAND_RPC_GET_RANDOM_OUTPUTS_FOR_AMOUNTS",
    {
      "{  \"outs_count\": 0,  \"use_forced_mix_outs\": false}",
      "{  \"status\": \"\"}"
    }
  },
  {
    "COMMAND_RPC_SET_MAINTAINERS_INFO",
    {
      "{  \"maintainers_info_buff\": \"\",  \"sign\": \"\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\"}",
      "{  \"status\": \"\"}"
    }
  },
  {
    "COMMAND_RPC_GET_TX_POOL",
    {
      "{}",
      "{  \"status\": \"\",  \"tx_expiration_ts_median\": 0}"
    }
  },
  {
    "COMMAND_RPC_CHECK_KEYIMAGES",
    {
      "{}",
      "{  \"status\": \"\"}"
    }
  },
  {
    "COMMAND_RPC_SCAN_POS",
    {
      "{}",
      "{  \"block_timestamp\": 0,  \"height\": 0,  \"index\": 0,  \"is_pos_allowed\": false,  \"last_block_hash\": \"\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\",  \"starter_timestamp\": 0,  \"status\": \"\"}"
    }
  },
  {
    "COMMAND_RPC_GET_POS_MINING_DETAILS",
    {
      "{}",
      "{  \"last_block_hash\": \"\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\",  \"pos_basic_difficulty\": \"\",  \"pos_mining_allowed\": false,  \"sm\": \"\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\",  \"starter_timestamp\": 0,  \"status\": \"\"}"
    }
  },

  // JSON RPCs
  {
    "COMMAND_RPC_GETBLOCKCOUNT",
    {
      "std::list",
      "{  \"count\": 0,  \"status\": \"\"}"
    }
  },
  {
    "COMMAND_RPC_GETBLOCKHASH",
    {
      "std::vector",
      "std::string"
    }
  },
  {
    "COMMAND_RPC_GETBLOCKTEMPLATE",
    {
      "{  \"extra_text\": \"\",  \"pos_amount\": 0,  \"pos_block\": false,  \"pos_index\": 0,  \"stakeholder_address\": \"\",  \"wallet_address\": \"\"}",
      "{  \"blocktemplate_blob\": \"\",  \"difficulty\": 0,  \"height\": 0,  \"status\": \"\"}"
    }
  },
  {
    "COMMAND_RPC_SUBMITBLOCK",
    {
      "std::vector",
      "{  \"status\": \"\"}"
    }
  },
  {
    "COMMAND_RPC_GET_LAST_BLOCK_HEADER",
    {
      "std::list",
      "{  \"block_header\": {    \"depth\": 0,    \"difficulty\": 0,    \"hash\": \"\",    \"height\": 0,    \"major_version\": 0,    \"minor_version\": 0,    \"nonce\": 0,    \"orphan_status\": false,    \"prev_hash\": \"\",    \"reward\": 0,    \"timestamp\": 0  },  \"status\": \"\"}"
    }
  },
  {
    "COMMAND_RPC_GET_BLOCK_HEADER_BY_HASH",
    {
      "{  \"hash\": \"\"}",
      "{  \"block_header\": {    \"depth\": 0,    \"difficulty\": 0,    \"hash\": \"\",    \"height\": 0,    \"major_version\": 0,    \"minor_version\": 0,    \"nonce\": 0,    \"orphan_status\": false,    \"prev_hash\": \"\",    \"reward\": 0,    \"timestamp\": 0  },  \"status\": \"\"}"
    }
  },
  {
    "COMMAND_RPC_GET_BLOCK_HEADER_BY_HEIGHT",
    {
      "{  \"height\": 0}",
      "{  \"block_header\": {    \"depth\": 0,    \"difficulty\": 0,    \"hash\": \"\",    \"height\": 0,    \"major_version\": 0,    \"minor_version\": 0,    \"nonce\": 0,    \"orphan_status\": false,    \"prev_hash\": \"\",    \"reward\": 0,    \"timestamp\": 0  },  \"status\": \"\"}"
    }
  },
  {
    "COMMAND_RPC_GET_ALIAS_DETAILS",
    {
      "{  \"alias\": \"\"}",
      "{  \"alias_details\": {    \"address\": \"\",    \"comment\": \"\",    \"tracking_key\": \"\"  },  \"status\": \"\"}"
    }
  },
  {
    "COMMAND_RPC_GET_ALIASES_BY_ADDRESS",
    {
      "std::string",
      "{  \"alias\": \"\",  \"status\": \"\"}"
    }
  },
  {
    "COMMAND_RPC_GET_ALIAS_REWARD",
    {
      "{  \"alias\": \"\"}",
      "{  \"reward\": 0,  \"status\": \"\"}"
    }
  },

  //block explorer api
  {
    "COMMAND_RPC_GET_BLOCKS_DETAILS",
    {
      "{  \"count\": 0,  \"height_start\": 0,  \"ignore_transactions\": false}",
      "{  \"status\": \"\"}"
    }
  },
  {
    "COMMAND_RPC_GET_TX_DETAILS",
    {
      "{  \"tx_hash\": \"\"}",
      "{  \"status\": \"\",  \"tx_info\": {    \"amount\": 0,    \"blob\": \"\",    \"blob_size\": 0,    \"fee\": 0,    \"id\": \"\",    \"keeper_block\": 0,    \"object_in_json\": \"\",    \"payment_id\": \"\",    \"pub_key\": \"\",    \"timestamp\": 0  }}"
    }
  },
  {
    "COMMAND_RPC_SERARCH_BY_ID",
    {
      "{  \"id\": \"\"}",
      "{  \"status\": \"\"}"
    }
  },
  {
    "COMMAND_RPC_GET_TX_GLOBAL_OUTPUTS_INDEXES_BY_AMOUNT",
    {
      "{  \"amount\": 0,  \"i\": 0}",
      "{  \"out_no\": 0,  \"status\": \"\",  \"tx_id\": \"0000000000000000000000000000000000000000000000000000000000000000\"}"
    }
  },
  {
    "COMMAND_RPC_GET_MULTISIG_INFO",
    {
      "{  \"ms_id\": \"0000000000000000000000000000000000000000000000000000000000000000\"}",
      "{  \"out_no\": 0,  \"status\": \"\",  \"tx_id\": \"0000000000000000000000000000000000000000000000000000000000000000\"}"
    }
  },
  {
    "COMMAND_RPC_GET_ALL_ALIASES",
    {
      "{}",
      "{  \"status\": \"\"}"
    }
  },
  {
    "COMMAND_RPC_GET_ALIASES",
    {
      "{  \"count\": 0,  \"offset\": 0}",
      "{  \"status\": \"\"}"
    }
  },
  {
    "COMMAND_RPC_GET_POOL_TXS_DETAILS",
    {
      "{}",
      "{  \"status\": \"\"}"
    }
  },
  {
    "COMMAND_RPC_GET_POOL_TXS_BRIEF_DETAILS",
    {
      "{}",
      "{  \"status\": \"\"}"
    }
  },
  {
    "COMMAND_RPC_GET_ALL_POOL_TX_LIST",
    {
      "{}",
      "{  \"status\": \"\"}"
    }
  },
  {
    "COMMAND_RPC_GET_BLOCK_DETAILS",
    {
      "{  \"id\": \"0000000000000000000000000000000000000000000000000000000000000000\"}",
      "{  \"block_details\": {    \"actual_timestamp\": 0,    \"already_generated_coins\": 0,    \"base_reward\": 0,    \"blob\": \"\",    \"block_cumulative_size\": 0,    \"block_tself_size\": 0,    \"cumulative_diff_adjusted\": \"\",    \"cumulative_diff_precise\": \"\",    \"difficulty\": \"\",    \"effective_fee_median\": 0,    \"height\": 0,    \"id\": \"\",    \"is_orphan\": false,    \"miner_text_info\": \"\",    \"object_in_json\": \"\",    \"penalty\": 0,    \"prev_id\": \"\",    \"summary_reward\": 0,    \"this_block_fee_median\": 0,    \"timestamp\": 0,    \"total_fee\": 0,    \"total_txs_size\": 0,    \"type\": 0  },  \"status\": \"\"}"
    }
  },
  {
    "COMMAND_RPC_GET_ALT_BLOCKS_DETAILS",
    {
      "{  \"count\": 0,  \"offset\": 0}",
      "{  \"status\": \"\"}"
    }
  },
  {
    "COMMAND_RPC_RESET_TX_POOL",
    {
      "{}",
      "{  \"status\": \"\"}"
    }
  },
  {
    "COMMAND_RPC_GET_CURRENT_CORE_TX_EXPIRATION_MEDIAN",
    {
      "{}",
      "{  \"expiration_median\": 0,  \"status\": \"\"}"
    }
  },
  {
    "mining::COMMAND_RPC_LOGIN",
    {
      "{  \"agent\": \"\",  \"hi\": {    \"block_id\": \"\",    \"height\": 0  },  \"login\": \"\",  \"pass\": \"\"}",
      "{  \"id\": \"\",  \"job\": {    \"blob\": \"\",    \"difficulty\": \"\",    \"job_id\": \"\",    \"prev_hi\": {      \"block_id\": \"\",      \"height\": 0    }  },  \"status\": \"\"}"
    }
  },
  {
    "mining::COMMAND_RPC_GETJOB",
    {
      "{  \"hi\": {    \"block_id\": \"\",    \"height\": 0  },  \"id\": \"\"}",
      "{  \"blob\": \"\",  \"difficulty\": \"\",  \"job_id\": \"\",  \"prev_hi\": {    \"block_id\": \"\",    \"height\": 0  },  \"status\": \"\"}"
    }
  },
  {
    "mining::COMMAND_RPC_SUBMITSHARE",
    {
      "{  \"id\": \"\",  \"job_id\": \"\",  \"nonce\": 0,  \"result\": \"\"}",
      "{  \"status\": \"\"}"
    }
  },

  // wallet RPCs
  {
    "wallet_rpc::COMMAND_RPC_GET_BALANCE",
    {
      "{}",
      "{  \"balance\": 0,  \"unlocked_balance\": 0}"
    }
  },
  {
    "wallet_rpc::COMMAND_RPC_GET_ADDRESS",
    {
      "{}",
      "{  \"address\": \"\"}"
    }
  },
  {
    "wallet_rpc::COMMAND_RPC_TRANSFER",
    {
      "{  \"fee\": 0,  \"mixin\": 0,  \"payment_id\": \"\",  \"unlock_time\": 0}",
      "{  \"tx_hash\": \"\",  \"tx_unsigned_hex\": \"\"}"
    }
  },
  {
    "wallet_rpc::COMMAND_RPC_STORE",
    {
      "{}",
      "{}"
    }
  },
  {
    "wallet_rpc::COMMAND_RPC_GET_PAYMENTS",
    {
      "{  \"payment_id\": \"\"}",
      "{  \"payments\": [{    \"amount\": 0,    \"block_height\": 0,    \"payment_id\": \"\",    \"tx_hash\": \"\",    \"unlock_time\": 0  }]}"
    }
  },
  {
    "wallet_rpc::COMMAND_RPC_MAKE_INTEGRATED_ADDRESS",
    {
      "{  \"payment_id\": \"\"}",
      "{  \"integrated_address\": \"\",  \"payment_id\": \"\"}"
    }
  },
  {
    "wallet_rpc::COMMAND_RPC_SPLIT_INTEGRATED_ADDRESS",
    {
      "{  \"integrated_address\": \"\"}",
      "{  \"payment_id\": \"\",  \"standard_address\": \"\"}"
    }
  },
  {
    "wallet_rpc::COMMAND_RPC_GET_BULK_PAYMENTS",
    {
      "{  \"allow_locked_transactions\": false,  \"min_block_height\": 0}",
      "{  \"payments\": [{    \"amount\": 0,    \"block_height\": 0,    \"payment_id\": \"\",    \"tx_hash\": \"\",    \"unlock_time\": 0  }]}"
    }
  },
  {
    "wallet_rpc::COMMAND_RPC_SEARCH_FOR_TRANSACTIONS",
    {
      "{  \"filter_by_height\": false,  \"in\": false,  \"max_height\": 0,  \"min_height\": 0,  \"out\": false,  \"pool\": false,  \"tx_id\": \"0000000000000000000000000000000000000000000000000000000000000000\"}",
      "{  \"in\": [{    \"amount\": 0,    \"comment\": \"\",    \"fee\": 0,    \"height\": 0,    \"is_income\": false,    \"is_mining\": false,    \"is_mixing\": false,    \"is_service\": false,    \"payment_id\": \"\",    \"show_sender\": false,    \"td\": {    },    \"timestamp\": 0,    \"tx_blob_size\": 0,    \"tx_hash\": \"0000000000000000000000000000000000000000000000000000000000000000\",    \"tx_type\": 0,    \"unlock_time\": 0  }],  \"out\": [{    \"amount\": 0,    \"comment\": \"\",    \"fee\": 0,    \"height\": 0,    \"is_income\": false,    \"is_mining\": false,    \"is_mixing\": false,    \"is_service\": false,    \"payment_id\": \"\",    \"show_sender\": false,    \"td\": {    },    \"timestamp\": 0,    \"tx_blob_size\": 0,    \"tx_hash\": \"0000000000000000000000000000000000000000000000000000000000000000\",    \"tx_type\": 0,    \"unlock_time\": 0  }],  \"pool\": [{    \"amount\": 0,    \"comment\": \"\",    \"fee\": 0,    \"height\": 0,    \"is_income\": false,    \"is_mining\": false,    \"is_mixing\": false,    \"is_service\": false,    \"payment_id\": \"\",    \"show_sender\": false,    \"td\": {    },    \"timestamp\": 0,    \"tx_blob_size\": 0,    \"tx_hash\": \"0000000000000000000000000000000000000000000000000000000000000000\",    \"tx_type\": 0,    \"unlock_time\": 0  }]}"
    }
  },

  // supernet api
  {
    "wallet_rpc::COMMAND_RPC_MAKETELEPOD",
    {
      "{  \"amount\": 0}",
      "{  \"status\": \"\",  \"tpd\": {    \"account_keys_hex\": \"\",    \"basement_tx_id_hex\": \"\"  }}"
    }
  },
  {
    "wallet_rpc::COMMAND_RPC_CLONETELEPOD",
    {
      "{  \"tpd\": {    \"account_keys_hex\": \"\",    \"basement_tx_id_hex\": \"\"  }}",
      "{  \"status\": \"\",  \"tpd\": {    \"account_keys_hex\": \"\",    \"basement_tx_id_hex\": \"\"  }}"
    }
  },
  {
    "wallet_rpc::COMMAND_RPC_TELEPODSTATUS",
    {
      "{  \"tpd\": {    \"account_keys_hex\": \"\",    \"basement_tx_id_hex\": \"\"  }}",
      "{  \"status\": \"\"}"
    }
  },
  {
    "wallet_rpc::COMMAND_RPC_WITHDRAWTELEPOD",
    {
      "{  \"addr\": \"\",  \"tpd\": {    \"account_keys_hex\": \"\",    \"basement_tx_id_hex\": \"\"  }}",
      "{  \"status\": \"\"}"
    }
  }
};

using namespace currency;
using namespace tools;

template<typename struct_t>
std::string serialize(struct_t &&s)
{
  return epee::serialization::store_t_to_json(s);
}

template<>
std::string serialize(std::string &&s)
{
  return "std::string";
}

template<typename T>
std::string serialize(std::vector<T> &&s)
{
  return "std::vector";
}

template<typename T>
std::string serialize(std::list<T> &&s)
{
  return "std::list";
}

template<typename rpc_struct_t>
void print()
{
  std::cout << "request:" << std::endl << serialize(typename rpc_struct_t::request()) << std::endl
            << "response:" << std::endl << serialize(typename rpc_struct_t::response()) << std::endl;
}

std::string filter_rn(std::string str)
{
  str.erase(std::remove_if(str.begin(), str.end(), [] (char c) { return c == '\n' || c == '\r'; }), str.end());
  return str;
}

template<typename struct_t>
void compare_impl(const std::string &serialized, const std::string &tag)
{
  ASSERT_EQ(serialized, filter_rn(serialize(struct_t()))) << "[   INFO   ] struct: "<< tag;
}

template<>
void compare_impl<wallet_rpc::COMMAND_RPC_GET_PAYMENTS::response>(const std::string &serialized, const std::string &tag)
{
  wallet_rpc::COMMAND_RPC_GET_PAYMENTS::response r { { tools::wallet_rpc::payment_details {} } };
  ASSERT_EQ(serialized, filter_rn(serialize(r))) << "[   INFO   ] struct: "<< tag;
}

template<>
void compare_impl<wallet_rpc::COMMAND_RPC_GET_BULK_PAYMENTS::response>(const std::string &serialized, const std::string &tag)
{
  wallet_rpc::COMMAND_RPC_GET_BULK_PAYMENTS::response r { { tools::wallet_rpc::payment_details {} } };
  ASSERT_EQ(serialized, filter_rn(serialize(r))) << "[   INFO   ] struct: "<< tag;
}

template<>
void compare_impl<wallet_rpc::COMMAND_RPC_SEARCH_FOR_TRANSACTIONS::response>(const std::string &serialized, const std::string &tag)
{
  wallet_rpc::COMMAND_RPC_SEARCH_FOR_TRANSACTIONS::response r;
  r.in.emplace_back();
  r.out.emplace_back();
  r.pool.emplace_back();
  ASSERT_EQ(serialized, filter_rn(serialize(r))) << "[   INFO   ] struct: "<< tag;
}

template<typename rpc_struct_t>
void compare(const std::string &tag)
{
  auto &serialized_values = serialized_structs.at(tag);
  compare_impl<typename rpc_struct_t::request>(serialized_values.first, tag);
  compare_impl<typename rpc_struct_t::response>(serialized_values.second, tag);
}

#define COMPARE_STRUCT_IMPL(struct_name) compare<struct_name>(#struct_name);
#define COMPARE_STRUCT(_, __, struct_name) COMPARE_STRUCT_IMPL(struct_name)
#define COMPARE_STRUCTS(...) BOOST_PP_SEQ_FOR_EACH(COMPARE_STRUCT, , BOOST_PP_VARIADIC_TO_SEQ(__VA_ARGS__))

TEST(rpc_serialization, rpc_serialization)
{
  // legacy JSON-alike RPCs
  COMPARE_STRUCTS(
    COMMAND_RPC_GET_HEIGHT, COMMAND_RPC_GET_TRANSACTIONS, COMMAND_RPC_SEND_RAW_TX, COMMAND_RPC_FORCE_RELAY_RAW_TXS,
    COMMAND_RPC_START_MINING, COMMAND_RPC_STOP_MINING, COMMAND_RPC_GET_INFO
  )
  // binary RPCs
  COMPARE_STRUCTS(
    COMMAND_RPC_GET_BLOCKS_FAST, COMMAND_RPC_GET_TX_GLOBAL_OUTPUTS_INDEXES, COMMAND_RPC_GET_RANDOM_OUTPUTS_FOR_AMOUNTS,
    COMMAND_RPC_SET_MAINTAINERS_INFO, COMMAND_RPC_GET_TX_POOL, COMMAND_RPC_CHECK_KEYIMAGES,
    COMMAND_RPC_SCAN_POS, COMMAND_RPC_GET_POS_MINING_DETAILS
  )
  // JSON RPCs
  COMPARE_STRUCTS(
    COMMAND_RPC_GETBLOCKCOUNT, COMMAND_RPC_GETBLOCKHASH, COMMAND_RPC_GETBLOCKTEMPLATE, COMMAND_RPC_SUBMITBLOCK,
    COMMAND_RPC_GET_LAST_BLOCK_HEADER, COMMAND_RPC_GET_BLOCK_HEADER_BY_HASH, COMMAND_RPC_GET_BLOCK_HEADER_BY_HEIGHT,
    COMMAND_RPC_GET_ALIAS_DETAILS, COMMAND_RPC_GET_ALIASES_BY_ADDRESS, COMMAND_RPC_GET_ALIAS_REWARD
  )
  // block explorer api
  COMPARE_STRUCTS(
    COMMAND_RPC_GET_BLOCKS_DETAILS, COMMAND_RPC_GET_TX_DETAILS, COMMAND_RPC_SERARCH_BY_ID, COMMAND_RPC_GET_STATIC_INFO,
    COMMAND_RPC_GET_INFO, COMMAND_RPC_GET_TX_GLOBAL_OUTPUTS_INDEXES_BY_AMOUNT, COMMAND_RPC_GET_MULTISIG_INFO,
    COMMAND_RPC_GET_ALL_ALIASES, COMMAND_RPC_GET_ALIASES, COMMAND_RPC_GET_POOL_TXS_DETAILS,
    COMMAND_RPC_GET_POOL_TXS_BRIEF_DETAILS, COMMAND_RPC_GET_ALL_POOL_TX_LIST, COMMAND_RPC_GET_BLOCK_DETAILS,
    COMMAND_RPC_GET_ALT_BLOCKS_DETAILS, COMMAND_RPC_RESET_TX_POOL, COMMAND_RPC_GET_CURRENT_CORE_TX_EXPIRATION_MEDIAN
  )
  // remote miner RPCs
  COMPARE_STRUCTS(
    mining::COMMAND_RPC_LOGIN, mining::COMMAND_RPC_GETJOB, mining::COMMAND_RPC_SUBMITSHARE
  )
  // wallet RPCs
  COMPARE_STRUCTS(
    wallet_rpc::COMMAND_RPC_GET_BALANCE, wallet_rpc::COMMAND_RPC_GET_ADDRESS, wallet_rpc::COMMAND_RPC_TRANSFER,
    wallet_rpc::COMMAND_RPC_STORE, wallet_rpc::COMMAND_RPC_GET_PAYMENTS, wallet_rpc::COMMAND_RPC_MAKE_INTEGRATED_ADDRESS,
    wallet_rpc::COMMAND_RPC_SPLIT_INTEGRATED_ADDRESS, wallet_rpc::COMMAND_RPC_GET_BULK_PAYMENTS,
    wallet_rpc::COMMAND_RPC_SEARCH_FOR_TRANSACTIONS
  )
  // supernet api
  COMPARE_STRUCTS(
    wallet_rpc::COMMAND_RPC_MAKETELEPOD, wallet_rpc::COMMAND_RPC_CLONETELEPOD, wallet_rpc::COMMAND_RPC_TELEPODSTATUS,
    wallet_rpc::COMMAND_RPC_WITHDRAWTELEPOD
  )
}
