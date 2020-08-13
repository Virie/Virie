import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-api',
  templateUrl: './api.component.html',
  styleUrls: ['./api.component.scss']
})
export class ApiComponent implements OnInit {
  objectLinks: any;
  infoExample: any;
  getBlocksDetails: any;
  getMainBlockDetails: any;
  getAltBlocksDetails: any;
  getAltBlockDetails: any;
  getPoolTXSDetails: any;
  getPoolTXSbriefDetails: any;
  geAllPoolTXlist: any;
  getTXdetails: any;

  dropdowns = {
    'info': false,
    'blocks': false,
    'block': false,
    'altblocks': false,
    'altblock': false,
    'pool_transact': false,
    'brief_pool_transact': false,
    'all_pool_ids_transact': false,
    'transaction': false,
  };

  constructor() {
  }

  ngOnInit() {
    this.objectLinks = {
      url_request_format: 'https://explorer.virieproject.com/api/{method}/{param1}/{param2}',
      url_get_info: 'https://explorer.virieproject.com/api/get_info/4294967295',
      url_get_blocks_details: 'https://explorer.virieproject.com/api/get_blocks_details/{:offset}/{:count}',
      url_get_main_block_details: 'https://explorer.virieproject.com/api/get_main_block_details/{:hash}',
      url_get_alt_blocks_details: 'https://explorer.virieproject.com/api/get_alt_blocks_details/{:offset}/{:count}',
      url_get_alt_block_details: 'https://explorer.virieproject.com/api/get_alt_block_details/{:hash}',
      url_get_pool_txs_details: 'https://explorer.virieproject.com/api/get_pool_txs_details',
      url_get_pool_txs_brief_details: 'https://explorer.virieproject.com/api/get_pool_txs_brief_details',
      url_get_all_pool_tx_list: 'https://explorer.virieproject.com/api/get_all_pool_tx_list',
      url_get_tx_details: 'https://explorer.virieproject.com/api/get_tx_details/{:tx_hash}'
    };
    this.infoExample = {
      'id': 0,
      'jsonrpc': '2.0',
      'result': {
        'alias_count': 6885,
        'alt_blocks_count': 18,
        'block_reward': 556984,
        'current_blocks_median': 125000,
        'current_max_allowed_block_size': 250000,
        'current_network_hashrate_350': 2742,
        'current_network_hashrate_50': 2975,
        'daemon_network_state': 2,
        'default_fee': 100000,
        'grey_peerlist_size': 32,
        'height': 199791,
        'incoming_connections_count': 0,
        'last_block_size': 0,
        'last_block_total_reward': 111516,
        'last_pos_timestamp': 1559380365,
        'last_pow_timestamp': 1559646383,
        'max_net_seen_height': 199647,
        'mi': {
          'build_no': 0,
          'mode': 0,
          'ver_major': 0,
          'ver_minor': 0,
          'ver_revision': 0
        },
        'minimum_fee': 100000,
        'net_time_delta_median': -1,
        'offers_count': 7132,
        'outgoing_connections_count': 8,
        'outs_stat': {
          'amount_0_001': 395850,
          'amount_0_01': 546,
          'amount_0_1': 7013,
          'amount_1': 592,
          'amount_10': 850,
          'amount_100': 1543,
          'amount_1000': 3281,
          'amount_10000': 6,
          'amount_100000': 0,
          'amount_1000000': 0
        },
        'performance_data': {
          'all_txs_insert_time_5': 4247,
          'block_processing_time_0': 24000,
          'block_processing_time_1': 25766,
          'etc_stuff_6': 13374,
          'insert_time_4': 731,
          'longhash_calculating_time_3': 3524,
          'map_size': 137438953472,
          'raise_block_core_event': 1,
          'target_calculating_time_2': 3451,
          'tx_add_one_tx_time': 4669,
          'tx_append_is_expired': 1,
          'tx_append_rl_wait': 0,
          'tx_append_time': 3376,
          'tx_check_exist': 13,
          'tx_check_inputs_attachment_check': 15,
          'tx_check_inputs_loop': 1793,
          'tx_check_inputs_loop_ch_in_val_sig': 657,
          'tx_check_inputs_loop_kimage_check': 15,
          'tx_check_inputs_loop_scan_outputkeys_get_item_size': 9,
          'tx_check_inputs_loop_scan_outputkeys_loop': 244,
          'tx_check_inputs_loop_scan_outputkeys_loop_find_tx': 104,
          'tx_check_inputs_loop_scan_outputkeys_loop_get_subitem': 123,
          'tx_check_inputs_loop_scan_outputkeys_loop_handle_output': 4,
          'tx_check_inputs_loop_scan_outputkeys_relative_to_absolute': 0,
          'tx_check_inputs_prefix_hash': 0,
          'tx_check_inputs_time': 1284,
          'tx_count': 0,
          'tx_prapare_append': 0,
          'tx_print_log': 0,
          'tx_process_attachment': 2630,
          'tx_process_extra': 5,
          'tx_process_inputs': 301,
          'tx_push_global_index': 353,
          'tx_store_db': 42,
          'writer_tx_count': 0
        },
        'pos_allowed': true,
        'pos_block_ts_shift_vs_actual': 160,
        'pos_diff_total_coins_rate': 0,
        'pos_difficulty': '4569114214',
        'pos_sequence_factor': 0,
        'pow_difficulty': 336326,
        'pow_sequence_factor': 2201,
        'seconds_for_10_blocks': 629,
        'seconds_for_30_blocks': 3193,
        'status': 'OK',
        'synchronization_start_height': 194436,
        'synchronized_connections_count': 8,
        'total_coins': 3021929053697,
        'transactions_cnt_per_day': 0,
        'transactions_volume_per_day': 0,
        'tx_count': 21482,
        'tx_count_in_last_block': 0,
        'tx_pool_performance_data': {
          'begin_tx_time': 24,
          'check_inputs_time': 3577,
          'check_inputs_types_supported_time': 0,
          'check_keyimages_ws_ms_time': 849,
          'db_commit_time': 2684,
          'expiration_validate_time': 3,
          'tx_processing_time': 7405,
          'update_db_time': 217,
          'validate_alias_time': 14,
          'validate_amount_time': 0
        },
        'tx_pool_size': 0,
        'white_peerlist_size': 19
      }
    };
    this.getBlocksDetails = {
      'id': 0,
      'jsonrpc': '2.0',
      'result': {
        'blocks': [
          {
            'actual_timestamp': 1539137488,
            'already_generated_coins': 2945030460000,
            'base_reward': 100000000,
            'blob': '',
            'block_cumulative_size': 0,
            'block_tself_size': 0,
            'cumulative_diff_adjusted': '828963',
            'cumulative_diff_precise': '4710474',
            'difficulty': '480661',
            'effective_fee_median': 10000,
            'height': 10,
            'id': 'b218f13df0912a2059438802b6353d3c1097c772752cba03319d346d7582630d',
            'is_orphan': false,
            'miner_text_info': 'singapore2',
            'object_in_json': '{\n  "major_version": 1, \n  "nonce": 171688597, \n  "prev_id": "387c6e655083b2005f1bb6856e5b8a997f32e7c5cedbab56885ef9d2067203fe", \n  "minor_version": 0, \n  "timestamp": 1539137488, \n  "flags": 0, \n  "miner_tx": {\n    "version": 1, \n    "vin": [ {\n        "gen": {\n          "height": 10\n        }\n      }\n    ], \n    "vout": [ {\n        "amount": 100000000, \n        "target": {\n          "key": "5ca437550f72d300b4118f560800904ca95544332277effe63762b0677400a7700"\n        }\n      }\n    ], \n    "extra": [ {\n        "pub_key": "285f1e510e6916b09be5eaa74808aafda927d03f612a69335eafaef2cda87989"\n      }, {\n        "user_data": , \n        "buff": 10"73696e6761706f726532"\n      }, {\n        "extra_padding": , \n        "buff": [ ]\n      }, {\n        "derive_hint": , \n        "v": 8231\n      }, {\n        "unlock_time": , \n        "v": 20\n      }], \n    "signatures": [ ], \n    "attachment": [ ]\n  }, \n  "tx_hashes": [ ]\n}',
            'penalty': 0,
            'prev_id': '387c6e655083b2005f1bb6856e5b8a997f32e7c5cedbab56885ef9d2067203fe',
            'summary_reward': 100000000,
            'this_block_fee_median': 0,
            'timestamp': 1539137488,
            'total_fee': 0,
            'total_txs_size': 0,
            'transactions_details': [
              {
                'amount': 100000000,
                'blob': '',
                'blob_size': 96,
                'fee': 0,
                'id': 'f5d14731a8a46aae6dc0ed4e77f50ecd6d55221cc94234cdfcaa7b26942ddd4c',
                'keeper_block': 10,
                'object_in_json': '',
                'pub_key': '285f1e510e6916b09be5eaa74808aafda927d03f612a69335eafaef2cda87989',
                'timestamp': 1539137488
              }
            ],
            'type': 1
          },
          {
            'actual_timestamp': 1539137537,
            'already_generated_coins': 2945130460000,
            'base_reward': 100000000,
            'blob': '',
            'block_cumulative_size': 0,
            'block_tself_size': 0,
            'cumulative_diff_adjusted': '857335',
            'cumulative_diff_precise': '5214268',
            'difficulty': '503794',
            'effective_fee_median': 10000,
            'height': 11,
            'id': '8cca4dbd1866a212dd3942eb289b7d2563945e42f3fc7e4f508e204d8eb84cd3',
            'is_orphan': false,
            'miner_text_info': 'canada1',
            'object_in_json': '{\n  "major_version": 1, \n  "nonce": 2683656803, \n  "prev_id": "b218f13df0912a2059438802b6353d3c1097c772752cba03319d346d7582630d", \n  "minor_version": 0, \n  "timestamp": 1539137537, \n  "flags": 0, \n  "miner_tx": {\n    "version": 1, \n    "vin": [ {\n        "gen": {\n          "height": 11\n        }\n      }\n    ], \n    "vout": [ {\n        "amount": 100000000, \n        "target": {\n          "key": "6cdfb71a0628ee4cb1b16bd54bdaed2a48876384d9d02646633311c0ec39a22d00"\n        }\n      }\n    ], \n    "extra": [ {\n        "pub_key": "5e15a401c4d16e3077858e5480a4a7934b191409b9d5771a03f95d09b35b64d1"\n      }, {\n        "user_data": , \n        "buff": 7"63616e61646131"\n      }, {\n        "extra_padding": , \n        "buff": [ ]\n      }, {\n        "derive_hint": , \n        "v": 48301\n      }, {\n        "unlock_time": , \n        "v": 21\n      }], \n    "signatures": [ ], \n    "attachment": [ ]\n  }, \n  "tx_hashes": [ ]\n}',
            'penalty': 0,
            'prev_id': 'b218f13df0912a2059438802b6353d3c1097c772752cba03319d346d7582630d',
            'summary_reward': 100000000,
            'this_block_fee_median': 0,
            'timestamp': 1539137537,
            'total_fee': 0,
            'total_txs_size': 0,
            'transactions_details': [
              {
                'amount': 100000000,
                'blob': '',
                'blob_size': 93,
                'fee': 0,
                'id': 'bddba9c5ccfc61b1776573b60ce2c106f4a2a865b78e6fd0ad1ba511f3b03d28',
                'keeper_block': 11,
                'object_in_json': '',
                'pub_key': '5e15a401c4d16e3077858e5480a4a7934b191409b9d5771a03f95d09b35b64d1',
                'timestamp': 1539137537
              }
            ],
            'type': 1
          },
          {
            'actual_timestamp': 1539137698,
            'already_generated_coins': 2945230460000,
            'base_reward': 100000000,
            'blob': '',
            'block_cumulative_size': 0,
            'block_tself_size': 0,
            'cumulative_diff_adjusted': '879904',
            'cumulative_diff_precise': '5748608',
            'difficulty': '534340',
            'effective_fee_median': 10000,
            'height': 12,
            'id': '7b7b650e6183e75faafef494843f482a8a945458578d8ae2ba6a87cab0119f0e',
            'is_orphan': false,
            'miner_text_info': 'hetzner3',
            'object_in_json': '{\n  "major_version": 1, \n  "nonce": 2242003019, \n  "prev_id": "8cca4dbd1866a212dd3942eb289b7d2563945e42f3fc7e4f508e204d8eb84cd3", \n  "minor_version": 0, \n  "timestamp": 1539137698, \n  "flags": 0, \n  "miner_tx": {\n    "version": 1, \n    "vin": [ {\n        "gen": {\n          "height": 12\n        }\n      }\n    ], \n    "vout": [ {\n        "amount": 100000000, \n        "target": {\n          "key": "32cf9bc9c192ff5cf607fa72bfecc4390cf12f50c9c6b8c92fc201f08aaa827d00"\n        }\n      }\n    ], \n    "extra": [ {\n        "pub_key": "44dce63eb346fa55f460e6098e7ff1406c5ae21ee658f7561c217252c38b1abd"\n      }, {\n        "user_data": , \n        "buff": 8"6865747a6e657233"\n      }, {\n        "extra_padding": , \n        "buff": [ ]\n      }, {\n        "derive_hint": , \n        "v": 58427\n      }, {\n        "unlock_time": , \n        "v": 22\n      }], \n    "signatures": [ ], \n    "attachment": [ ]\n  }, \n  "tx_hashes": [ ]\n}',
            'penalty': 0,
            'prev_id': '8cca4dbd1866a212dd3942eb289b7d2563945e42f3fc7e4f508e204d8eb84cd3',
            'summary_reward': 100000000,
            'this_block_fee_median': 0,
            'timestamp': 1539137698,
            'total_fee': 0,
            'total_txs_size': 0,
            'transactions_details': [
              {
                'amount': 100000000,
                'blob': '',
                'blob_size': 94,
                'fee': 0,
                'id': '60ae890b486ae968244371545bb434e85fdee6ee5d022e7463c26affb1ef304b',
                'keeper_block': 12,
                'object_in_json': '',
                'pub_key': '44dce63eb346fa55f460e6098e7ff1406c5ae21ee658f7561c217252c38b1abd',
                'timestamp': 1539137698
              }
            ],
            'type': 1
          },
          {
            'actual_timestamp': 1539137924,
            'already_generated_coins': 2945330460000,
            'base_reward': 100000000,
            'blob': '',
            'block_cumulative_size': 0,
            'block_tself_size': 0,
            'cumulative_diff_adjusted': '896311',
            'cumulative_diff_precise': '6266501',
            'difficulty': '517893',
            'effective_fee_median': 10000,
            'height': 13,
            'id': '9928b56d9646a8b1eed7c51652b7d453728ec8677b6f2822fe0868eec9ca2b0b',
            'is_orphan': false,
            'miner_text_info': 'hetzner1',
            'object_in_json': '{\n  "major_version": 1, \n  "nonce": 1156097169, \n  "prev_id": "7b7b650e6183e75faafef494843f482a8a945458578d8ae2ba6a87cab0119f0e", \n  "minor_version": 0, \n  "timestamp": 1539137924, \n  "flags": 0, \n  "miner_tx": {\n    "version": 1, \n    "vin": [ {\n        "gen": {\n          "height": 13\n        }\n      }\n    ], \n    "vout": [ {\n        "amount": 100000000, \n        "target": {\n          "key": "4913356ba3441e91a0b4f48463b89ef9a2a9502338c94af7434e81ab4227408e00"\n        }\n      }\n    ], \n    "extra": [ {\n        "pub_key": "07d6fd6a8afde8915fd5f0133b1a770a40549cc459f37f92a4ca23c102fef89c"\n      }, {\n        "user_data": , \n        "buff": 8"6865747a6e657231"\n      }, {\n        "extra_padding": , \n        "buff": [ ]\n      }, {\n        "derive_hint": , \n        "v": 12623\n      }, {\n        "unlock_time": , \n        "v": 23\n      }], \n    "signatures": [ ], \n    "attachment": [ ]\n  }, \n  "tx_hashes": [ ]\n}',
            'penalty': 0,
            'prev_id': '7b7b650e6183e75faafef494843f482a8a945458578d8ae2ba6a87cab0119f0e',
            'summary_reward': 100000000,
            'this_block_fee_median': 0,
            'timestamp': 1539137924,
            'total_fee': 0,
            'total_txs_size': 0,
            'transactions_details': [
              {
                'amount': 100000000,
                'blob': '',
                'blob_size': 94,
                'fee': 0,
                'id': '2f89c13bcf4971c9e53317e1e5897ebc6d5b17cce31db387684d802caf2ce3cc',
                'keeper_block': 13,
                'object_in_json': '',
                'pub_key': '07d6fd6a8afde8915fd5f0133b1a770a40549cc459f37f92a4ca23c102fef89c',
                'timestamp': 1539137924
              }
            ],
            'type': 1
          },
          {
            'actual_timestamp': 1539138052,
            'already_generated_coins': 2945430460000,
            'base_reward': 100000000,
            'blob': '',
            'block_cumulative_size': 0,
            'block_tself_size': 0,
            'cumulative_diff_adjusted': '907779',
            'cumulative_diff_precise': '6749159',
            'difficulty': '482658',
            'effective_fee_median': 10000,
            'height': 14,
            'id': '59111ea9cf6e28499d1aef9d477515192a23ad9fc48713a6df18d9238d9a308f',
            'is_orphan': false,
            'miner_text_info': 'hetzner3',
            'object_in_json': '{\n  "major_version": 1, \n  "nonce": 3223588368, \n  "prev_id": "9928b56d9646a8b1eed7c51652b7d453728ec8677b6f2822fe0868eec9ca2b0b", \n  "minor_version": 0, \n  "timestamp": 1539138052, \n  "flags": 0, \n  "miner_tx": {\n    "version": 1, \n    "vin": [ {\n        "gen": {\n          "height": 14\n        }\n      }\n    ], \n    "vout": [ {\n        "amount": 100000000, \n        "target": {\n          "key": "df4fe77ddf26834fc0aceebf686cecc43507b0e78140040ab799a3e86f9a275300"\n        }\n      }\n    ], \n    "extra": [ {\n        "pub_key": "628583301b0654609e274dee17cc872489f2098c086b23db12278925fa8176b7"\n      }, {\n        "user_data": , \n        "buff": 8"6865747a6e657233"\n      }, {\n        "extra_padding": , \n        "buff": [ ]\n      }, {\n        "derive_hint": , \n        "v": 31007\n      }, {\n        "unlock_time": , \n        "v": 24\n      }], \n    "signatures": [ ], \n    "attachment": [ ]\n  }, \n  "tx_hashes": [ ]\n}',
            'penalty': 0,
            'prev_id': '9928b56d9646a8b1eed7c51652b7d453728ec8677b6f2822fe0868eec9ca2b0b',
            'summary_reward': 100000000,
            'this_block_fee_median': 0,
            'timestamp': 1539138052,
            'total_fee': 0,
            'total_txs_size': 0,
            'transactions_details': [
              {
                'amount': 100000000,
                'blob': '',
                'blob_size': 94,
                'fee': 0,
                'id': '614981f79ab4a50208d62dcd4b5fcff12e50880efd83c86a94b4fc7eb728f78a',
                'keeper_block': 14,
                'object_in_json': '',
                'pub_key': '628583301b0654609e274dee17cc872489f2098c086b23db12278925fa8176b7',
                'timestamp': 1539138052
              }
            ],
            'type': 1
          },
          {
            'actual_timestamp': 1539138120,
            'already_generated_coins': 2945530460000,
            'base_reward': 100000000,
            'blob': '',
            'block_cumulative_size': 0,
            'block_tself_size': 0,
            'cumulative_diff_adjusted': '916339',
            'cumulative_diff_precise': '7229527',
            'difficulty': '480368',
            'effective_fee_median': 10000,
            'height': 15,
            'id': '1941601c9312832180248eef4b2191e4394eeef5dcfb6e7dbdcba86656b35b76',
            'is_orphan': false,
            'miner_text_info': 'canada1',
            'object_in_json': '{\n  "major_version": 1, \n  "nonce": 1539103911, \n  "prev_id": "59111ea9cf6e28499d1aef9d477515192a23ad9fc48713a6df18d9238d9a308f", \n  "minor_version": 0, \n  "timestamp": 1539138120, \n  "flags": 0, \n  "miner_tx": {\n    "version": 1, \n    "vin": [ {\n        "gen": {\n          "height": 15\n        }\n      }\n    ], \n    "vout": [ {\n        "amount": 100000000, \n        "target": {\n          "key": "edad0306841db45096d75be211c2feedf9365a779599316fb3f0c7a5b4a60b1f00"\n        }\n      }\n    ], \n    "extra": [ {\n        "pub_key": "3981cc485298887a0eee74e9a25916d2922aaaf7f627c2f917a382e63aaf31b5"\n      }, {\n        "user_data": , \n        "buff": 7"63616e61646131"\n      }, {\n        "extra_padding": , \n        "buff": [ ]\n      }, {\n        "derive_hint": , \n        "v": 254\n      }, {\n        "unlock_time": , \n        "v": 25\n      }], \n    "signatures": [ ], \n    "attachment": [ ]\n  }, \n  "tx_hashes": [ ]\n}',
            'penalty': 0,
            'prev_id': '59111ea9cf6e28499d1aef9d477515192a23ad9fc48713a6df18d9238d9a308f',
            'summary_reward': 100000000,
            'this_block_fee_median': 0,
            'timestamp': 1539138120,
            'total_fee': 0,
            'total_txs_size': 0,
            'transactions_details': [
              {
                'amount': 100000000,
                'blob': '',
                'blob_size': 93,
                'fee': 0,
                'id': 'c30b2fe57022a2ace90e1dddab1286c0828523aaa89c916d6d8307a5877818b3',
                'keeper_block': 15,
                'object_in_json': '',
                'pub_key': '3981cc485298887a0eee74e9a25916d2922aaaf7f627c2f917a382e63aaf31b5',
                'timestamp': 1539138120
              }
            ],
            'type': 1
          },
          {
            'actual_timestamp': 1539138266,
            'already_generated_coins': 2945630460000,
            'base_reward': 100000000,
            'blob': '',
            'block_cumulative_size': 0,
            'block_tself_size': 0,
            'cumulative_diff_adjusted': '922950',
            'cumulative_diff_precise': '7724136',
            'difficulty': '494609',
            'effective_fee_median': 10000,
            'height': 16,
            'id': '910c5d46161936eb2e11db6c277f219e37a82bf4c481530a5524ac2d8b5c5388',
            'is_orphan': false,
            'miner_text_info': 'hetzner1',
            'object_in_json': '{\n  "major_version": 1, \n  "nonce": 2457782096, \n  "prev_id": "1941601c9312832180248eef4b2191e4394eeef5dcfb6e7dbdcba86656b35b76", \n  "minor_version": 0, \n  "timestamp": 1539138266, \n  "flags": 0, \n  "miner_tx": {\n    "version": 1, \n    "vin": [ {\n        "gen": {\n          "height": 16\n        }\n      }\n    ], \n    "vout": [ {\n        "amount": 100000000, \n        "target": {\n          "key": "1d4cdbc35d7aa1c2f107cb9a933fc987e27557fdfa6030dfb4eb533c7b295a3c00"\n        }\n      }\n    ], \n    "extra": [ {\n        "pub_key": "ce26362ab1d4dcb62b50a177f5fad7c703297b0993d1579968ab13bae9d57c01"\n      }, {\n        "user_data": , \n        "buff": 8"6865747a6e657231"\n      }, {\n        "extra_padding": , \n        "buff": [ ]\n      }, {\n        "derive_hint": , \n        "v": 47263\n      }, {\n        "unlock_time": , \n        "v": 26\n      }], \n    "signatures": [ ], \n    "attachment": [ ]\n  }, \n  "tx_hashes": [ ]\n}',
            'penalty': 0,
            'prev_id': '1941601c9312832180248eef4b2191e4394eeef5dcfb6e7dbdcba86656b35b76',
            'summary_reward': 100000000,
            'this_block_fee_median': 0,
            'timestamp': 1539138266,
            'total_fee': 0,
            'total_txs_size': 0,
            'transactions_details': [
              {
                'amount': 100000000,
                'blob': '',
                'blob_size': 94,
                'fee': 0,
                'id': 'f1112f111e182768f112011a697110a751594094386e5b440a53c6a5bae699dd',
                'keeper_block': 16,
                'object_in_json': '',
                'pub_key': 'ce26362ab1d4dcb62b50a177f5fad7c703297b0993d1579968ab13bae9d57c01',
                'timestamp': 1539138266
              }
            ],
            'type': 1
          },
          {
            'actual_timestamp': 1539138320,
            'already_generated_coins': 2945730460000,
            'base_reward': 100000000,
            'blob': '',
            'block_cumulative_size': 0,
            'block_tself_size': 0,
            'cumulative_diff_adjusted': '927841',
            'cumulative_diff_precise': '8211977',
            'difficulty': '487841',
            'effective_fee_median': 10000,
            'height': 17,
            'id': '26a0096dc3fd4c172e89847b34fac55fa44f8b92f7b1e21dec77667aba3c149c',
            'is_orphan': false,
            'miner_text_info': 'hetzner1',
            'object_in_json': '{\n  "major_version": 1, \n  "nonce": 1239639227, \n  "prev_id": "910c5d46161936eb2e11db6c277f219e37a82bf4c481530a5524ac2d8b5c5388", \n  "minor_version": 0, \n  "timestamp": 1539138320, \n  "flags": 0, \n  "miner_tx": {\n    "version": 1, \n    "vin": [ {\n        "gen": {\n          "height": 17\n        }\n      }\n    ], \n    "vout": [ {\n        "amount": 100000000, \n        "target": {\n          "key": "4d382f649757945036a4b1a7142499f2fcb5dcc01e36fd124ec765ed2e38c31800"\n        }\n      }\n    ], \n    "extra": [ {\n        "pub_key": "7c3eca83aa8403bf2bfb4a393a9bccd3322e1da8da4cb4b36ef0502f8cf8d8ff"\n      }, {\n        "user_data": , \n        "buff": 8"6865747a6e657231"\n      }, {\n        "extra_padding": , \n        "buff": [ ]\n      }, {\n        "derive_hint": , \n        "v": 14578\n      }, {\n        "unlock_time": , \n        "v": 27\n      }], \n    "signatures": [ ], \n    "attachment": [ ]\n  }, \n  "tx_hashes": [ ]\n}',
            'penalty': 0,
            'prev_id': '910c5d46161936eb2e11db6c277f219e37a82bf4c481530a5524ac2d8b5c5388',
            'summary_reward': 100000000,
            'this_block_fee_median': 0,
            'timestamp': 1539138320,
            'total_fee': 0,
            'total_txs_size': 0,
            'transactions_details': [
              {
                'amount': 100000000,
                'blob': '',
                'blob_size': 94,
                'fee': 0,
                'id': '8c3fdb3b9af60601ad54c597be3083f4c6d2e8528263869e2fa055faed41f69d',
                'keeper_block': 17,
                'object_in_json': '',
                'pub_key': '7c3eca83aa8403bf2bfb4a393a9bccd3322e1da8da4cb4b36ef0502f8cf8d8ff',
                'timestamp': 1539138320
              }
            ],
            'type': 1
          },
          {
            'actual_timestamp': 1539138258,
            'already_generated_coins': 2945830460000,
            'base_reward': 100000000,
            'blob': '',
            'block_cumulative_size': 0,
            'block_tself_size': 0,
            'cumulative_diff_adjusted': '931633',
            'cumulative_diff_precise': '8716295',
            'difficulty': '504318',
            'effective_fee_median': 10000,
            'height': 18,
            'id': 'afa551d2f7f1a92ce8f036c3de5cbb48aae71ddf8d5883608e82fd2e5c75d024',
            'is_orphan': false,
            'miner_text_info': 'singapore1',
            'object_in_json': '{\n  "major_version": 1, \n  "nonce": 1020982212, \n  "prev_id": "26a0096dc3fd4c172e89847b34fac55fa44f8b92f7b1e21dec77667aba3c149c", \n  "minor_version": 0, \n  "timestamp": 1539138258, \n  "flags": 0, \n  "miner_tx": {\n    "version": 1, \n    "vin": [ {\n        "gen": {\n          "height": 18\n        }\n      }\n    ], \n    "vout": [ {\n        "amount": 100000000, \n        "target": {\n          "key": "3a1ea8bd90d717754a6872c37c62bd25e2a08a03802ff49010681f66a8939a1d00"\n        }\n      }\n    ], \n    "extra": [ {\n        "pub_key": "46f2c21355468231a03fb6a2e2e3692ff511ac985bf8b2dc17fc306bbd3e38f6"\n      }, {\n        "user_data": , \n        "buff": 10"73696e6761706f726531"\n      }, {\n        "extra_padding": , \n        "buff": [ ]\n      }, {\n        "derive_hint": , \n        "v": 57331\n      }, {\n        "unlock_time": , \n        "v": 28\n      }], \n    "signatures": [ ], \n    "attachment": [ ]\n  }, \n  "tx_hashes": [ ]\n}',
            'penalty': 0,
            'prev_id': '26a0096dc3fd4c172e89847b34fac55fa44f8b92f7b1e21dec77667aba3c149c',
            'summary_reward': 100000000,
            'this_block_fee_median': 0,
            'timestamp': 1539138258,
            'total_fee': 0,
            'total_txs_size': 0,
            'transactions_details': [
              {
                'amount': 100000000,
                'blob': '',
                'blob_size': 96,
                'fee': 0,
                'id': 'd3f7cc614c8dee02f34f0b9761475843b6eef250a05e852d890e3b1222b2c790',
                'keeper_block': 18,
                'object_in_json': '',
                'pub_key': '46f2c21355468231a03fb6a2e2e3692ff511ac985bf8b2dc17fc306bbd3e38f6',
                'timestamp': 1539138258
              }
            ],
            'type': 1
          },
          {
            'actual_timestamp': 1539138478,
            'already_generated_coins': 2945930460000,
            'base_reward': 100000000,
            'blob': '',
            'block_cumulative_size': 0,
            'block_tself_size': 0,
            'cumulative_diff_adjusted': '934653',
            'cumulative_diff_precise': '9251585',
            'difficulty': '535290',
            'effective_fee_median': 10000,
            'height': 19,
            'id': 'c94cb63ad2817c600702b22c20e5483883f27f857810307db3a2a55b902aad18',
            'is_orphan': false,
            'miner_text_info': 'singapore2',
            'object_in_json': '{\n  "major_version": 1, \n  "nonce": 2816278418, \n  "prev_id": "afa551d2f7f1a92ce8f036c3de5cbb48aae71ddf8d5883608e82fd2e5c75d024", \n  "minor_version": 0, \n  "timestamp": 1539138478, \n  "flags": 0, \n  "miner_tx": {\n    "version": 1, \n    "vin": [ {\n        "gen": {\n          "height": 19\n        }\n      }\n    ], \n    "vout": [ {\n        "amount": 100000000, \n        "target": {\n          "key": "725f96506d1b7dd30eab7396a8a625bf2b309fc5f5e773e07053e375e6e3f82d00"\n        }\n      }\n    ], \n    "extra": [ {\n        "pub_key": "8d451b5a8c13c01d26c807abb8742e11c0e5b822ffe83fda2f3611488e3fbcce"\n      }, {\n        "user_data": , \n        "buff": 10"73696e6761706f726532"\n      }, {\n        "extra_padding": , \n        "buff": [ ]\n      }, {\n        "derive_hint": , \n        "v": 41404\n      }, {\n        "unlock_time": , \n        "v": 29\n      }], \n    "signatures": [ ], \n    "attachment": [ ]\n  }, \n  "tx_hashes": [ ]\n}',
            'penalty': 0,
            'prev_id': 'afa551d2f7f1a92ce8f036c3de5cbb48aae71ddf8d5883608e82fd2e5c75d024',
            'summary_reward': 100000000,
            'this_block_fee_median': 0,
            'timestamp': 1539138478,
            'total_fee': 0,
            'total_txs_size': 0,
            'transactions_details': [
              {
                'amount': 100000000,
                'blob': '',
                'blob_size': 96,
                'fee': 0,
                'id': '7464927143df1ec3c8a88fb584836f2d808c402b7863199aab2c18ef3f933d5e',
                'keeper_block': 19,
                'object_in_json': '',
                'pub_key': '8d451b5a8c13c01d26c807abb8742e11c0e5b822ffe83fda2f3611488e3fbcce',
                'timestamp': 1539138478
              }
            ],
            'type': 1
          },
          {
            'actual_timestamp': 1539138646,
            'already_generated_coins': 2946030460000,
            'base_reward': 100000000,
            'blob': '',
            'block_cumulative_size': 0,
            'block_tself_size': 0,
            'cumulative_diff_adjusted': '936877',
            'cumulative_diff_precise': '9777244',
            'difficulty': '525659',
            'effective_fee_median': 10000,
            'height': 20,
            'id': '102846165d203b10788c38acd30557be42aee1f5f1353051d864a61df1b8ed0e',
            'is_orphan': false,
            'miner_text_info': 'singapore2',
            'object_in_json': '{\n  "major_version": 1, \n  "nonce": 1892813588, \n  "prev_id": "c94cb63ad2817c600702b22c20e5483883f27f857810307db3a2a55b902aad18", \n  "minor_version": 0, \n  "timestamp": 1539138646, \n  "flags": 0, \n  "miner_tx": {\n    "version": 1, \n    "vin": [ {\n        "gen": {\n          "height": 20\n        }\n      }\n    ], \n    "vout": [ {\n        "amount": 100000000, \n        "target": {\n          "key": "94e6a593342017d2820ef8b59917896e69bda12b80e94eeffaec444d20d970a900"\n        }\n      }\n    ], \n    "extra": [ {\n        "pub_key": "a06d1fa946dd9a295ef52314b113d85fdafe6fefef2b2b62a688da14ba5347c8"\n      }, {\n        "user_data": , \n        "buff": 10"73696e6761706f726532"\n      }, {\n        "extra_padding": , \n        "buff": [ ]\n      }, {\n        "derive_hint": , \n        "v": 22291\n      }, {\n        "unlock_time": , \n        "v": 30\n      }], \n    "signatures": [ ], \n    "attachment": [ ]\n  }, \n  "tx_hashes": [ ]\n}',
            'penalty': 0,
            'prev_id': 'c94cb63ad2817c600702b22c20e5483883f27f857810307db3a2a55b902aad18',
            'summary_reward': 100000000,
            'this_block_fee_median': 0,
            'timestamp': 1539138646,
            'total_fee': 0,
            'total_txs_size': 0,
            'transactions_details': [
              {
                'amount': 100000000,
                'blob': '',
                'blob_size': 96,
                'fee': 0,
                'id': '370017d2509d8bbcc6b502b1c8cb449545e21ac7e01ddda9fdb56f1b2f4e0a3f',
                'keeper_block': 20,
                'object_in_json': '',
                'pub_key': 'a06d1fa946dd9a295ef52314b113d85fdafe6fefef2b2b62a688da14ba5347c8',
                'timestamp': 1539138646
              }
            ],
            'type': 1
          },
          {
            'actual_timestamp': 1539138796,
            'already_generated_coins': 2946130460000,
            'base_reward': 100000000,
            'blob': '',
            'block_cumulative_size': 0,
            'block_tself_size': 0,
            'cumulative_diff_adjusted': '938511',
            'cumulative_diff_precise': '10291836',
            'difficulty': '514592',
            'effective_fee_median': 10000,
            'height': 21,
            'id': 'e46314de5873bbe8c5ae41ab8adbd76197441fe06e5b1d9ac878180bdc9b7689',
            'is_orphan': false,
            'miner_text_info': 'hetzner3',
            'object_in_json': '{\n  "major_version": 1, \n  "nonce": 1806899762, \n  "prev_id": "102846165d203b10788c38acd30557be42aee1f5f1353051d864a61df1b8ed0e", \n  "minor_version": 0, \n  "timestamp": 1539138796, \n  "flags": 0, \n  "miner_tx": {\n    "version": 1, \n    "vin": [ {\n        "gen": {\n          "height": 21\n        }\n      }\n    ], \n    "vout": [ {\n        "amount": 100000000, \n        "target": {\n          "key": "a4285d90889cba0dd3c97c9c3ffb3087e0a8c407b9d6b0330910bb4019268e6b00"\n        }\n      }\n    ], \n    "extra": [ {\n        "pub_key": "96cf2bb2ab7175d43f58f321578259ccc66e6a8ced5d544bfb8593e2c5412578"\n      }, {\n        "user_data": , \n        "buff": 8"6865747a6e657233"\n      }, {\n        "extra_padding": , \n        "buff": [ ]\n      }, {\n        "derive_hint": , \n        "v": 27569\n      }, {\n        "unlock_time": , \n        "v": 31\n      }], \n    "signatures": [ ], \n    "attachment": [ ]\n  }, \n  "tx_hashes": [ ]\n}',
            'penalty': 0,
            'prev_id': '102846165d203b10788c38acd30557be42aee1f5f1353051d864a61df1b8ed0e',
            'summary_reward': 100000000,
            'this_block_fee_median': 0,
            'timestamp': 1539138796,
            'total_fee': 0,
            'total_txs_size': 0,
            'transactions_details': [
              {
                'amount': 100000000,
                'blob': '',
                'blob_size': 94,
                'fee': 0,
                'id': '6673afe1ab0ad1d4dc264a7e9bbb9d7be64469b318b0bbc51bc1477c5cc7ab0f',
                'keeper_block': 21,
                'object_in_json': '',
                'pub_key': '96cf2bb2ab7175d43f58f321578259ccc66e6a8ced5d544bfb8593e2c5412578',
                'timestamp': 1539138796
              }
            ],
            'type': 1
          }
        ],
        'status': 'OK'
      }
    }
    this.getMainBlockDetails = {
      'id': 0,
      'jsonrpc': '2.0',
      'result': {
        'block_details': {
          'actual_timestamp': 1559646383,
          'already_generated_coins': 3021929053697,
          'base_reward': 111516,
          'blob': '',
          'block_cumulative_size': 0,
          'block_tself_size': 0,
          'cumulative_diff_adjusted': '17283138494',
          'cumulative_diff_precise': '31327043039',
          'difficulty': '336326',
          'effective_fee_median': 325000,
          'height': 199790,
          'id': '13477a03491fbc76c8bdae5ab6b302514144e2176015d0788a36290a30c4d686',
          'is_orphan': false,
          'miner_text_info': 'canada1',
          'object_in_json': '{\n  "major_version": 1, \n  "nonce": 799703125, \n  "prev_id": "f9f74b4f23aa8f67eae810f46aec854cab23e1b028a9f7947d38324d6adc00bc", \n  "minor_version": 0, \n  "timestamp": 1559646383, \n  "flags": 0, \n  "miner_tx": {\n    "version": 1, \n    "vin": [ {\n        "gen": {\n          "height": 199790\n        }\n      }\n    ], \n    "vout": [ {\n        "amount": 6, \n        "target": {\n          "key": "2e26a8ecbaab5e7b136524722424b50b465cdc362f792782936316dbee00a27000"\n        }\n      }, {\n        "amount": 10, \n        "target": {\n          "key": "a9848726aca736aac43c98f0ff208befd56e434a5f7c7c1148174ca4d1a11f8d00"\n        }\n      }, {\n        "amount": 500, \n        "target": {\n          "key": "4a9caede69934c1d44562b05d900503f67351e7782cad9c64a97c15d1152df2100"\n        }\n      }, {\n        "amount": 1000, \n        "target": {\n          "key": "08d3a590cc9a8c56f7b80b2f2eb0c081b7ecae2c6b306b748012c682cf0a811400"\n        }\n      }, {\n        "amount": 10000, \n        "target": {\n          "key": "fec96b7970239b3f0a0cb27decd06668e7f5a6bea987d57d744900e9e545677800"\n        }\n      }, {\n        "amount": 100000, \n        "target": {\n          "key": "bbcb07d4173272a2c74d9a168e285abf1f67270e2d60acc931929299c1074f3100"\n        }\n      }\n    ], \n    "extra": [ {\n        "pub_key": "181477ab7f557634cd0a46510535b820924ddae827f2254a77bc5a1c12b4f8aa"\n      }, {\n        "user_data": , \n        "buff": 7"63616e61646131"\n      }, {\n        "extra_padding": , \n        "buff": [ ]\n      }, {\n        "derive_hint": , \n        "v": 18411\n      }, {\n        "unlock_time": , \n        "v": 199800\n      }], \n    "signatures": [ ], \n    "attachment": [ ]\n  }, \n  "tx_hashes": [ ]\n}',
          'penalty': 0,
          'prev_id': 'f9f74b4f23aa8f67eae810f46aec854cab23e1b028a9f7947d38324d6adc00bc',
          'summary_reward': 111516,
          'this_block_fee_median': 0,
          'timestamp': 1559646383,
          'total_fee': 0,
          'total_txs_size': 0,
          'transactions_details': [
            {
              'amount': 111516,
              'blob': '',
              'blob_size': 274,
              'fee': 0,
              'id': 'f171925f0e9e060606ac240b58fe7b8da4bd5d8f41b9dabf27871c0635490775',
              'keeper_block': 199790,
              'object_in_json': '',
              'pub_key': '181477ab7f557634cd0a46510535b820924ddae827f2254a77bc5a1c12b4f8aa',
              'timestamp': 1559646383
            }
          ],
          'type': 1
        },
        'status': 'OK'
      }
    };
    this.getAltBlocksDetails = {
      'id': 0,
      'jsonrpc': '2.0',
      'result': {
        'blocks': [
          {
            'actual_timestamp': 1559381387,
            'already_generated_coins': 0,
            'base_reward': 0,
            'blob': '',
            'block_cumulative_size': 0,
            'block_tself_size': 0,
            'cumulative_diff_adjusted': '17262576428',
            'cumulative_diff_precise': '30608109647',
            'difficulty': '364841',
            'effective_fee_median': 0,
            'height': 197336,
            'id': '623cfa7d40d0b614838eeb6356594e1c3c9eddd415b1fce3a162bf8d44102bce',
            'is_orphan': true,
            'miner_text_info': 'canada2',
            'object_in_json': '{\n  "major_version": 1, \n  "nonce": 4232758930, \n  "prev_id": "89f96cd8154d02da7620495196317edc5a7e91267a70f739c16135733b691d7f", \n  "minor_version": 0, \n  "timestamp": 1559381387, \n  "flags": 0, \n  "miner_tx": {\n    "version": 1, \n    "vin": [ {\n        "gen": {\n          "height": 197336\n        }\n      }\n    ], \n    "vout": [ {\n        "amount": 2, \n        "target": {\n          "key": "d3403162f26c71dd2748b44312efd07db398fe27afcc7d708b07a578a05794d600"\n        }\n      }, {\n        "amount": 500, \n        "target": {\n          "key": "8bb0d9e0092183906fe53bae360751f159ad7c13a7f12716ed7325770cfcae2b00"\n        }\n      }, {\n        "amount": 1000, \n        "target": {\n          "key": "bfb6a27a0e3d26351ec6122dd48c45a1406278e775000d001f262b8c372a80e300"\n        }\n      }, {\n        "amount": 10000, \n        "target": {\n          "key": "934735b0261670c90b978a71dee82146190939eafc39634eff117ebe2c81d00800"\n        }\n      }, {\n        "amount": 100000, \n        "target": {\n          "key": "8e2fa856c1a778ca08e0733031bee56156dea9bb35bb50ed1ebca6e866b8108800"\n        }\n      }\n    ], \n    "extra": [ {\n        "pub_key": "163af9f1f15463964077ede264afeb0e3b65196dd837aedbc6c514fb48b1d1f9"\n      }, {\n        "user_data": , \n        "buff": 7"63616e61646132"\n      }, {\n        "extra_padding": , \n        "buff": [ ]\n      }, {\n        "derive_hint": , \n        "v": 3595\n      }, {\n        "unlock_time": , \n        "v": 197346\n      }], \n    "signatures": [ ], \n    "attachment": [ ]\n  }, \n  "tx_hashes": [ ]\n}',
            'penalty': '18446744073709440114',
            'prev_id': '89f96cd8154d02da7620495196317edc5a7e91267a70f739c16135733b691d7f',
            'summary_reward': 111502,
            'this_block_fee_median': 0,
            'timestamp': 1559381387,
            'total_fee': 0,
            'total_txs_size': 0,
            'transactions_details': [
              {
                'amount': 111502,
                'blob': '',
                'blob_size': 239,
                'extra': [
                  {
                    'datails_view': '',
                    'short_view': '163af9f1f15463964077ede264afeb0e3b65196dd837aedbc6c514fb48b1d1f9',
                    'type': 'pub_key'
                  },
                  {
                    'datails_view': '63616e61646132',
                    'short_view': '7 bytes',
                    'type': 'user_data'
                  },
                  {
                    'datails_view': '',
                    'short_view': '0 bytes',
                    'type': 'extra_padding'
                  },
                  {
                    'datails_view': '0b0e',
                    'short_view': '0b0e',
                    'type': 'XOR'
                  },
                  {
                    'datails_view': '',
                    'short_view': 'height: 197346',
                    'type': 'unlock_time'
                  }
                ],
                'fee': 0,
                'id': '9be9833cb03b276857014a2bf7d15e65a6ab930061d64bf3c44e68d7c4c84c88',
                'ins': [
                  {
                    'amount': 0,
                    'kimage_or_ms_id': '',
                    'multisig_count': 0
                  }
                ],
                'keeper_block': 0,
                'object_in_json': '',
                'outs': [
                  {
                    'amount': 2,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      'd3403162f26c71dd2748b44312efd07db398fe27afcc7d708b07a578a05794d6'
                    ]
                  },
                  {
                    'amount': 500,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      '8bb0d9e0092183906fe53bae360751f159ad7c13a7f12716ed7325770cfcae2b'
                    ]
                  },
                  {
                    'amount': 1000,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      'bfb6a27a0e3d26351ec6122dd48c45a1406278e775000d001f262b8c372a80e3'
                    ]
                  },
                  {
                    'amount': 10000,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      '934735b0261670c90b978a71dee82146190939eafc39634eff117ebe2c81d008'
                    ]
                  },
                  {
                    'amount': 100000,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      '8e2fa856c1a778ca08e0733031bee56156dea9bb35bb50ed1ebca6e866b81088'
                    ]
                  }
                ],
                'pub_key': '163af9f1f15463964077ede264afeb0e3b65196dd837aedbc6c514fb48b1d1f9',
                'timestamp': 1559381387
              }
            ],
            'type': 1
          },
          {
            'actual_timestamp': 1559377865,
            'already_generated_coins': 0,
            'base_reward': 0,
            'blob': '',
            'block_cumulative_size': 0,
            'block_tself_size': 0,
            'cumulative_diff_adjusted': '17263663552',
            'cumulative_diff_precise': '435921463402564341',
            'difficulty': '5867487846',
            'effective_fee_median': 0,
            'height': 197344,
            'id': '1846b5ea3a0f4d399244d121e0c0853d953d9e6d80252ab99614b89bb62973cd',
            'is_orphan': true,
            'miner_text_info': '',
            'object_in_json': '{\n  "major_version": 1, \n  "nonce": 0, \n  "prev_id": "ac86b5d39ecabc82bad3bd69fcb69e89f0a6978159451c7cbeefb1d8e735277a", \n  "minor_version": 0, \n  "timestamp": 1559377860, \n  "flags": 1, \n  "miner_tx": {\n    "version": 1, \n    "vin": [ {\n        "gen": {\n          "height": 197344\n        }\n      }, {\n        "key": {\n          "amount": 50000000, \n          "key_offsets": [ {\n              "uint64_t": 580\n            }\n          ], \n          "k_image": "b00545a481f27575aacfc68c1c4ea0b5862873bc5aca8b31e02dd1d7cf6b45f9", \n          "etc_details": [ ]\n        }\n      }], \n    "vout": [ {\n        "amount": 4, \n        "target": {\n          "key": "5d799a79baa2b02a4f9e07f9900a851f14459c42cb8b060138faea26e48c7ae500"\n        }\n      }, {\n        "amount": 10, \n        "target": {\n          "key": "51ec0a2a5f6303c25d36d016e1621ca1470ddfab73a7ca34c5d8ccbf475d8c7300"\n        }\n      }, {\n        "amount": 900, \n        "target": {\n          "key": "6e8a216b67f55f87a26c439a3aec41fca6928c9a7c1df1cd4bfa0d8e2d8693a800"\n        }\n      }, {\n        "amount": 6000, \n        "target": {\n          "key": "799643be5efaa36c25a683e676d8485d7ba5a35dd6d15ebed9d20df5e4909a4800"\n        }\n      }, {\n        "amount": 50000, \n        "target": {\n          "key": "71cb7f51cd8bd8c40a03cc4e6d9e6f032e8b8863563e794645807bb2cdb80a0200"\n        }\n      }, {\n        "amount": 500000, \n        "target": {\n          "key": "9a5e55c915fe0df97ff2049fbde3d0e08bdb7f815107199d38671433c00ed5eb00"\n        }\n      }, {\n        "amount": 1000000, \n        "target": {\n          "key": "5f384fc4454ba899eef436adbde34a164084e55ac4603018cb2c824d811a145000"\n        }\n      }, {\n        "amount": 50000000, \n        "target": {\n          "key": "8fa114975d0e2a09052e46b1440820bb1a582d1073081c00eaa1c892a7e8b5e800"\n        }\n      }\n    ], \n    "extra": [ {\n        "pub_key": "fcd4b3c08e4a1b0d84515e45382255a3d5c584e6147cfe3730cbb4b04d49e7c6"\n      }, {\n        "extra_padding": , \n        "buff": [ ]\n      }, {\n        "derive_hint": , \n        "v": 7316\n      }, {\n        "unlock_time": , \n        "v": 197354\n      }, {\n        "etc_tx_time": , \n        "v": 1559377865\n      }], \n    "signatures": [ [ "309b8ea01cd149bdbad8b5f46e95b9af1200d65b20b8b3d080a4c03ced3af90c584f685b0a6bfe46b57e1ca9b7fe0a8900ab5e9599faf4063710cb23322cf008"\n      ]\n    ], \n    "attachment": [ ]\n  }, \n  "tx_hashes": [ "562553e3c20dc73d4cabb3d4b15149d0b1d666f253f1acef607e28d04e66a22e"\n  ]\n}',
            'penalty': '18446744073708994702',
            'prev_id': 'ac86b5d39ecabc82bad3bd69fcb69e89f0a6978159451c7cbeefb1d8e735277a',
            'summary_reward': 1556914,
            'this_block_fee_median': 0,
            'timestamp': 1559377860,
            'total_fee': 1000000,
            'total_txs_size': 0,
            'transactions_details': [
              {
                'amount': 51556914,
                'blob': '',
                'blob_size': 395,
                'extra': [
                  {
                    'datails_view': '',
                    'short_view': 'fcd4b3c08e4a1b0d84515e45382255a3d5c584e6147cfe3730cbb4b04d49e7c6',
                    'type': 'pub_key'
                  },
                  {
                    'datails_view': '',
                    'short_view': '0 bytes',
                    'type': 'extra_padding'
                  },
                  {
                    'datails_view': '941c',
                    'short_view': '941c',
                    'type': 'XOR'
                  },
                  {
                    'datails_view': '',
                    'short_view': 'height: 197354',
                    'type': 'unlock_time'
                  },
                  {
                    'datails_view': '',
                    'short_view': 'timestamp: 1559377865 ��, 01 ���� 2019 08:31:05 GMT',
                    'type': 'pos_time'
                  }
                ],
                'fee': 0,
                'id': 'f0eaa87754a4e7e83be5b3e334042cb8eacdbae635032a04181204082f70abc4',
                'ins': [
                  {
                    'amount': 0,
                    'kimage_or_ms_id': '',
                    'multisig_count': 0
                  },
                  {
                    'amount': 50000000,
                    'global_indexes': [
                      580
                    ],
                    'kimage_or_ms_id': 'b00545a481f27575aacfc68c1c4ea0b5862873bc5aca8b31e02dd1d7cf6b45f9',
                    'multisig_count': 0
                  }
                ],
                'keeper_block': 0,
                'object_in_json': '',
                'outs': [
                  {
                    'amount': 4,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      '5d799a79baa2b02a4f9e07f9900a851f14459c42cb8b060138faea26e48c7ae5'
                    ]
                  },
                  {
                    'amount': 10,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      '51ec0a2a5f6303c25d36d016e1621ca1470ddfab73a7ca34c5d8ccbf475d8c73'
                    ]
                  },
                  {
                    'amount': 900,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      '6e8a216b67f55f87a26c439a3aec41fca6928c9a7c1df1cd4bfa0d8e2d8693a8'
                    ]
                  },
                  {
                    'amount': 6000,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      '799643be5efaa36c25a683e676d8485d7ba5a35dd6d15ebed9d20df5e4909a48'
                    ]
                  },
                  {
                    'amount': 50000,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      '71cb7f51cd8bd8c40a03cc4e6d9e6f032e8b8863563e794645807bb2cdb80a02'
                    ]
                  },
                  {
                    'amount': 500000,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      '9a5e55c915fe0df97ff2049fbde3d0e08bdb7f815107199d38671433c00ed5eb'
                    ]
                  },
                  {
                    'amount': 1000000,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      '5f384fc4454ba899eef436adbde34a164084e55ac4603018cb2c824d811a1450'
                    ]
                  },
                  {
                    'amount': 50000000,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      '8fa114975d0e2a09052e46b1440820bb1a582d1073081c00eaa1c892a7e8b5e8'
                    ]
                  }
                ],
                'pub_key': 'fcd4b3c08e4a1b0d84515e45382255a3d5c584e6147cfe3730cbb4b04d49e7c6',
                'timestamp': 1559377865
              },
              {
                'amount': 100000,
                'blob': '',
                'blob_size': 700,
                'fee': 1000000,
                'id': '562553e3c20dc73d4cabb3d4b15149d0b1d666f253f1acef607e28d04e66a22e',
                'keeper_block': 197344,
                'object_in_json': '',
                'pub_key': 'f710872dc1278b34946946dfc2fce6537309e0460e7c643eab885e37b0f45b96',
                'timestamp': 1559377865
              }
            ],
            'type': 0
          },
          {
            'actual_timestamp': 1559379065,
            'already_generated_coins': 0,
            'base_reward': 0,
            'blob': '',
            'block_cumulative_size': 0,
            'block_tself_size': 0,
            'cumulative_diff_adjusted': '17272872521',
            'cumulative_diff_precise': '435922108174981071',
            'difficulty': '5553382903',
            'effective_fee_median': 0,
            'height': 197461,
            'id': 'f96db416660d0107ec73bb4770a6191bc1359a11ffca3abe0067f25324fa50f4',
            'is_orphan': true,
            'miner_text_info': '',
            'object_in_json': '{\n  "major_version": 1, \n  "nonce": 0, \n  "prev_id": "b10e333214b44c36f061d72a9937ae82164eac1d00b39bec6a83fa84fc31c3e1", \n  "minor_version": 0, \n  "timestamp": 1559379540, \n  "flags": 1, \n  "miner_tx": {\n    "version": 1, \n    "vin": [ {\n        "gen": {\n          "height": 197461\n        }\n      }, {\n        "key": {\n          "amount": 50000, \n          "key_offsets": [ {\n              "uint64_t": 20631\n            }\n          ], \n          "k_image": "ff13628571849c8ff01c4663d3a106d7aa4d191dc612ae43c5d1a00dc1783e69", \n          "etc_details": [ ]\n        }\n      }], \n    "vout": [ {\n        "amount": 6, \n        "target": {\n          "key": "c131891ad6539876c8fa0eae2fa8eed010359b4e3707532e8601d18cbff8a6b700"\n        }\n      }, {\n        "amount": 20, \n        "target": {\n          "key": "263332b38c8579bac1ab0e5fcdc7483dcd4604471eb2833e6fa13eab8ba1e8aa00"\n        }\n      }, {\n        "amount": 900, \n        "target": {\n          "key": "d8db9889d4f77f9a0f413602133dcbeb6379bc11a4b2be8a44ab03258b6e710500"\n        }\n      }, {\n        "amount": 6000, \n        "target": {\n          "key": "bcdef951ee3aece242d4a1b498ef6a063ce7cdacab0a19be683d45f3ca339dfd00"\n        }\n      }, {\n        "amount": 50000, \n        "target": {\n          "key": "e10960123c31496ee1b0fdbe249667bcc7ccb745d71636e14cd48fd41417c1a900"\n        }\n      }, {\n        "amount": 500000, \n        "target": {\n          "key": "3d319422607667383373d1fe8bbdcad9bb1514edf2c949a163b866ba0bf7db4100"\n        }\n      }, {\n        "amount": 50000, \n        "target": {\n          "key": "2087f034fc28723796939b2fce905b46f02f911c0b294f57896c1a56f49460c900"\n        }\n      }\n    ], \n    "extra": [ {\n        "pub_key": "58e383ef56371b62c83b2553542909c8a209c057804619f0769489456539345d"\n      }, {\n        "extra_padding": , \n        "buff": [ ]\n      }, {\n        "derive_hint": , \n        "v": 35987\n      }, {\n        "unlock_time": , \n        "v": 197471\n      }, {\n        "etc_tx_time": , \n        "v": 1559379065\n      }], \n    "signatures": [ [ "140c4ee4e23dbdc79ae1777e8d042976306abd0aa6ae0bdf811143768e4de20c3e457642c53862971db86a712d2062b95f5a038da93417b1583ce1b69edb1006"\n      ]\n    ], \n    "attachment": [ ]\n  }, \n  "tx_hashes": [ ]\n}',
            'penalty': '18446744073708994690',
            'prev_id': 'b10e333214b44c36f061d72a9937ae82164eac1d00b39bec6a83fa84fc31c3e1',
            'summary_reward': 556926,
            'this_block_fee_median': 0,
            'timestamp': 1559379540,
            'total_fee': 0,
            'total_txs_size': 0,
            'transactions_details': [
              {
                'amount': 606926,
                'blob': '',
                'blob_size': 356,
                'extra': [
                  {
                    'datails_view': '',
                    'short_view': '58e383ef56371b62c83b2553542909c8a209c057804619f0769489456539345d',
                    'type': 'pub_key'
                  },
                  {
                    'datails_view': '',
                    'short_view': '0 bytes',
                    'type': 'extra_padding'
                  },
                  {
                    'datails_view': '938c',
                    'short_view': '938c',
                    'type': 'XOR'
                  },
                  {
                    'datails_view': '',
                    'short_view': 'height: 197471',
                    'type': 'unlock_time'
                  },
                  {
                    'datails_view': '',
                    'short_view': 'timestamp: 1559379065 ��, 01 ���� 2019 08:51:05 GMT',
                    'type': 'pos_time'
                  }
                ],
                'fee': 0,
                'id': 'f47120d0bce012c2c9940b75c25e7fb28af93257f32c63a8d608148083037e98',
                'ins': [
                  {
                    'amount': 0,
                    'kimage_or_ms_id': '',
                    'multisig_count': 0
                  },
                  {
                    'amount': 50000,
                    'global_indexes': [
                      20631
                    ],
                    'kimage_or_ms_id': 'ff13628571849c8ff01c4663d3a106d7aa4d191dc612ae43c5d1a00dc1783e69',
                    'multisig_count': 0
                  }
                ],
                'keeper_block': 0,
                'object_in_json': '',
                'outs': [
                  {
                    'amount': 6,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      'c131891ad6539876c8fa0eae2fa8eed010359b4e3707532e8601d18cbff8a6b7'
                    ]
                  },
                  {
                    'amount': 20,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      '263332b38c8579bac1ab0e5fcdc7483dcd4604471eb2833e6fa13eab8ba1e8aa'
                    ]
                  },
                  {
                    'amount': 900,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      'd8db9889d4f77f9a0f413602133dcbeb6379bc11a4b2be8a44ab03258b6e7105'
                    ]
                  },
                  {
                    'amount': 6000,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      'bcdef951ee3aece242d4a1b498ef6a063ce7cdacab0a19be683d45f3ca339dfd'
                    ]
                  },
                  {
                    'amount': 50000,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      'e10960123c31496ee1b0fdbe249667bcc7ccb745d71636e14cd48fd41417c1a9'
                    ]
                  },
                  {
                    'amount': 500000,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      '3d319422607667383373d1fe8bbdcad9bb1514edf2c949a163b866ba0bf7db41'
                    ]
                  },
                  {
                    'amount': 50000,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      '2087f034fc28723796939b2fce905b46f02f911c0b294f57896c1a56f49460c9'
                    ]
                  }
                ],
                'pub_key': '58e383ef56371b62c83b2553542909c8a209c057804619f0769489456539345d',
                'timestamp': 1559379065
              }
            ],
            'type': 0
          },
          {
            'actual_timestamp': 1559379660,
            'already_generated_coins': 0,
            'base_reward': 0,
            'blob': '',
            'block_cumulative_size': 0,
            'block_tself_size': 0,
            'cumulative_diff_adjusted': '17278093319',
            'cumulative_diff_precise': '435922418515117988',
            'difficulty': '5138120422',
            'effective_fee_median': 0,
            'height': 197522,
            'id': '417e7ca16c36e72f9917bddfe5050e49699b475616ce3231e24de8f1a2f59c8f',
            'is_orphan': true,
            'miner_text_info': '',
            'object_in_json': '{\n  "major_version": 1, \n  "nonce": 0, \n  "prev_id": "5578becd91dec382ac0d0dd8ca01682c97fd27f8a7a6eeff30243a2db799abbc", \n  "minor_version": 0, \n  "timestamp": 1559379780, \n  "flags": 1, \n  "miner_tx": {\n    "version": 1, \n    "vin": [ {\n        "gen": {\n          "height": 197522\n        }\n      }, {\n        "key": {\n          "amount": 50000, \n          "key_offsets": [ {\n              "uint64_t": 26325\n            }\n          ], \n          "k_image": "028a87b5945b188d35267b9b9c86ad6529d07c417043aa6195e1f41c001f70e6", \n          "etc_details": [ ]\n        }\n      }], \n    "vout": [ {\n        "amount": 2, \n        "target": {\n          "key": "efcb84dc7b67cb24abc2b79c574b8c1bea193f5deaeee2e3e73546495c60fedf00"\n        }\n      }, {\n        "amount": 30, \n        "target": {\n          "key": "05ee909031bc521d3a9cb0a6e873e3a9353ff78a72c033b7e6e1adc37a7a9f9000"\n        }\n      }, {\n        "amount": 900, \n        "target": {\n          "key": "520c4f0c99c480565414b2a4ecdab210fca024e55193fa9f6b94c30f0e45b42600"\n        }\n      }, {\n        "amount": 6000, \n        "target": {\n          "key": "641ee8f647c2aa5a7deb0a459f2f6f0303a66e5ad1d6e32243c05adedfa451f300"\n        }\n      }, {\n        "amount": 50000, \n        "target": {\n          "key": "5625d936798fae953ea9f0eef1f97d83856e3f63663508abd3468c2ddf315ed300"\n        }\n      }, {\n        "amount": 500000, \n        "target": {\n          "key": "e24364801da92a70589fdd8b4abbdc4a7d54d54eeefed7a66c1628d4b10a7d4700"\n        }\n      }, {\n        "amount": 50000, \n        "target": {\n          "key": "ac5e413919ab528eb3f87e7085e78b2d8e8d55ba167fb2fbf66be66bc8b7534c00"\n        }\n      }\n    ], \n    "extra": [ {\n        "pub_key": "f2d9fc4633ebcc401a805446fdd1d809796398d83d193a22030efbb5af65dd01"\n      }, {\n        "extra_padding": , \n        "buff": [ ]\n      }, {\n        "derive_hint": , \n        "v": 47553\n      }, {\n        "unlock_time": , \n        "v": 197532\n      }, {\n        "etc_tx_time": , \n        "v": 1559379660\n      }], \n    "signatures": [ [ "d43faaf3a26a36af3ca4339a2b1a019627f9bab36153f905c5c928b536be2a01c9a4997bb515f941b664b66b5c49e532b49a0383406e840792aada98bc6ba101"\n      ]\n    ], \n    "attachment": [ ]\n  }, \n  "tx_hashes": [ ]\n}',
            'penalty': '18446744073708994684',
            'prev_id': '5578becd91dec382ac0d0dd8ca01682c97fd27f8a7a6eeff30243a2db799abbc',
            'summary_reward': 556932,
            'this_block_fee_median': 0,
            'timestamp': 1559379780,
            'total_fee': 0,
            'total_txs_size': 0,
            'transactions_details': [
              {
                'amount': 606932,
                'blob': '',
                'blob_size': 356,
                'extra': [
                  {
                    'datails_view': '',
                    'short_view': 'f2d9fc4633ebcc401a805446fdd1d809796398d83d193a22030efbb5af65dd01',
                    'type': 'pub_key'
                  },
                  {
                    'datails_view': '',
                    'short_view': '0 bytes',
                    'type': 'extra_padding'
                  },
                  {
                    'datails_view': 'c1b9',
                    'short_view': 'c1b9',
                    'type': 'XOR'
                  },
                  {
                    'datails_view': '',
                    'short_view': 'height: 197532',
                    'type': 'unlock_time'
                  },
                  {
                    'datails_view': '',
                    'short_view': 'timestamp: 1559379660 ��, 01 ���� 2019 09:01:00 GMT',
                    'type': 'pos_time'
                  }
                ],
                'fee': 0,
                'id': '664a38bc5de3d8846cc4708e8fd9964a3cde709de7a05958a0cb8160738772a9',
                'ins': [
                  {
                    'amount': 0,
                    'kimage_or_ms_id': '',
                    'multisig_count': 0
                  },
                  {
                    'amount': 50000,
                    'global_indexes': [
                      26325
                    ],
                    'kimage_or_ms_id': '028a87b5945b188d35267b9b9c86ad6529d07c417043aa6195e1f41c001f70e6',
                    'multisig_count': 0
                  }
                ],
                'keeper_block': 0,
                'object_in_json': '',
                'outs': [
                  {
                    'amount': 2,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      'efcb84dc7b67cb24abc2b79c574b8c1bea193f5deaeee2e3e73546495c60fedf'
                    ]
                  },
                  {
                    'amount': 30,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      '05ee909031bc521d3a9cb0a6e873e3a9353ff78a72c033b7e6e1adc37a7a9f90'
                    ]
                  },
                  {
                    'amount': 900,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      '520c4f0c99c480565414b2a4ecdab210fca024e55193fa9f6b94c30f0e45b426'
                    ]
                  },
                  {
                    'amount': 6000,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      '641ee8f647c2aa5a7deb0a459f2f6f0303a66e5ad1d6e32243c05adedfa451f3'
                    ]
                  },
                  {
                    'amount': 50000,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      '5625d936798fae953ea9f0eef1f97d83856e3f63663508abd3468c2ddf315ed3'
                    ]
                  },
                  {
                    'amount': 500000,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      'e24364801da92a70589fdd8b4abbdc4a7d54d54eeefed7a66c1628d4b10a7d47'
                    ]
                  },
                  {
                    'amount': 50000,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      'ac5e413919ab528eb3f87e7085e78b2d8e8d55ba167fb2fbf66be66bc8b7534c'
                    ]
                  }
                ],
                'pub_key': 'f2d9fc4633ebcc401a805446fdd1d809796398d83d193a22030efbb5af65dd01',
                'timestamp': 1559379660
              }
            ],
            'type': 0
          },
          {
            'actual_timestamp': 1559379661,
            'already_generated_coins': 0,
            'base_reward': 0,
            'blob': '',
            'block_cumulative_size': 0,
            'block_tself_size': 0,
            'cumulative_diff_adjusted': '17278101884',
            'cumulative_diff_precise': '435922423643996454',
            'difficulty': '5128878466',
            'effective_fee_median': 0,
            'height': 197523,
            'id': '9527e79abb20870b67e42ddcf9e3cd8f84ac34c734be32670d8f011d13520f81',
            'is_orphan': true,
            'miner_text_info': '',
            'object_in_json': '{\n  "major_version": 1, \n  "nonce": 0, \n  "prev_id": "417e7ca16c36e72f9917bddfe5050e49699b475616ce3231e24de8f1a2f59c8f", \n  "minor_version": 0, \n  "timestamp": 1559380095, \n  "flags": 1, \n  "miner_tx": {\n    "version": 1, \n    "vin": [ {\n        "gen": {\n          "height": 197523\n        }\n      }, {\n        "key": {\n          "amount": 500000, \n          "key_offsets": [ {\n              "uint64_t": 74816\n            }\n          ], \n          "k_image": "9b9969c6a285572a4d6421f8121a871e44222d7f5eb1a5bdf2cfaf283e15324d", \n          "etc_details": [ ]\n        }\n      }], \n    "vout": [ {\n        "amount": 2, \n        "target": {\n          "key": "8d652ad35bdc541ef6b86d633b35d803d03a1cf9e859fdd486aeee7672032ad000"\n        }\n      }, {\n        "amount": 30, \n        "target": {\n          "key": "b4a509c443f4c855d92ac26d689638b1967f0ad0bfa986346c049d969a86183400"\n        }\n      }, {\n        "amount": 900, \n        "target": {\n          "key": "165f49ee482a8b622448a4b840d44ebcce6e40761b9f030ae91857794d32f00800"\n        }\n      }, {\n        "amount": 6000, \n        "target": {\n          "key": "b19664ae3a0285e3ca633423ee826cb5946b0bef5ececf224573c23a03c52f0d00"\n        }\n      }, {\n        "amount": 50000, \n        "target": {\n          "key": "6039fa3c8e9775c0e67816e288b0b419ddaf0812c43b9c2816fc9a39c10fa08000"\n        }\n      }, {\n        "amount": 500000, \n        "target": {\n          "key": "b9ccb9f5c7e899e6c95f7c4a2c982643193c13c96bb393cd608d1a2504f3804e00"\n        }\n      }, {\n        "amount": 500000, \n        "target": {\n          "key": "79d29a06f29ab13cde0cbf4dc4faf179ae564049d5ed6a6efaad93a88a70bc6b00"\n        }\n      }\n    ], \n    "extra": [ {\n        "pub_key": "e300404a83a3c2351c8d6436862af91df3ea7108ec3a86c434effdf2f538fd12"\n      }, {\n        "extra_padding": , \n        "buff": [ ]\n      }, {\n        "derive_hint": , \n        "v": 5407\n      }, {\n        "unlock_time": , \n        "v": 197533\n      }, {\n        "etc_tx_time": , \n        "v": 1559379661\n      }], \n    "signatures": [ [ "c77fd52c50d3f3ee823c66363ad96c56ce5918e027e741d870b1d64488cb0804e6abe9278f8ab042979c02338c2b69f089c001adb7d6f5c7d8732fccfa638e03"\n      ]\n    ], \n    "attachment": [ ]\n  }, \n  "tx_hashes": [ ]\n}',
            'penalty': '18446744073708994684',
            'prev_id': '417e7ca16c36e72f9917bddfe5050e49699b475616ce3231e24de8f1a2f59c8f',
            'summary_reward': 556932,
            'this_block_fee_median': 0,
            'timestamp': 1559380095,
            'total_fee': 0,
            'total_txs_size': 0,
            'transactions_details': [
              {
                'amount': 1056932,
                'blob': '',
                'blob_size': 356,
                'extra': [
                  {
                    'datails_view': '',
                    'short_view': 'e300404a83a3c2351c8d6436862af91df3ea7108ec3a86c434effdf2f538fd12',
                    'type': 'pub_key'
                  },
                  {
                    'datails_view': '',
                    'short_view': '0 bytes',
                    'type': 'extra_padding'
                  },
                  {
                    'datails_view': '1f15',
                    'short_view': '1f15',
                    'type': 'XOR'
                  },
                  {
                    'datails_view': '',
                    'short_view': 'height: 197533',
                    'type': 'unlock_time'
                  },
                  {
                    'datails_view': '',
                    'short_view': 'timestamp: 1559379661 ��, 01 ���� 2019 09:01:01 GMT',
                    'type': 'pos_time'
                  }
                ],
                'fee': 0,
                'id': '87b7c2a630b822b35cc1b3e572cee41c2c4d1240f19758e83891a86d284ea1b9',
                'ins': [
                  {
                    'amount': 0,
                    'kimage_or_ms_id': '',
                    'multisig_count': 0
                  },
                  {
                    'amount': 500000,
                    'global_indexes': [
                      74816
                    ],
                    'kimage_or_ms_id': '9b9969c6a285572a4d6421f8121a871e44222d7f5eb1a5bdf2cfaf283e15324d',
                    'multisig_count': 0
                  }
                ],
                'keeper_block': 0,
                'object_in_json': '',
                'outs': [
                  {
                    'amount': 2,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      '8d652ad35bdc541ef6b86d633b35d803d03a1cf9e859fdd486aeee7672032ad0'
                    ]
                  },
                  {
                    'amount': 30,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      'b4a509c443f4c855d92ac26d689638b1967f0ad0bfa986346c049d969a861834'
                    ]
                  },
                  {
                    'amount': 900,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      '165f49ee482a8b622448a4b840d44ebcce6e40761b9f030ae91857794d32f008'
                    ]
                  },
                  {
                    'amount': 6000,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      'b19664ae3a0285e3ca633423ee826cb5946b0bef5ececf224573c23a03c52f0d'
                    ]
                  },
                  {
                    'amount': 50000,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      '6039fa3c8e9775c0e67816e288b0b419ddaf0812c43b9c2816fc9a39c10fa080'
                    ]
                  },
                  {
                    'amount': 500000,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      'b9ccb9f5c7e899e6c95f7c4a2c982643193c13c96bb393cd608d1a2504f3804e'
                    ]
                  },
                  {
                    'amount': 500000,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      '79d29a06f29ab13cde0cbf4dc4faf179ae564049d5ed6a6efaad93a88a70bc6b'
                    ]
                  }
                ],
                'pub_key': 'e300404a83a3c2351c8d6436862af91df3ea7108ec3a86c434effdf2f538fd12',
                'timestamp': 1559379661
              }
            ],
            'type': 0
          },
          {
            'actual_timestamp': 1559410555,
            'already_generated_coins': 0,
            'base_reward': 0,
            'blob': '',
            'block_cumulative_size': 0,
            'block_tself_size': 0,
            'cumulative_diff_adjusted': '17283132560',
            'cumulative_diff_precise': '30687664585',
            'difficulty': '332685',
            'effective_fee_median': 0,
            'height': 197812,
            'id': 'bec9c868d79f76511b4a4a2ae556324df3f97735737e12c2fe77ed15ad98fe99',
            'is_orphan': true,
            'miner_text_info': 'canada2',
            'object_in_json': '{\n  "major_version": 1, \n  "nonce": 3109274664, \n  "prev_id": "0f3711cf940f5eab7ab75975e82fb8b8eafcb5811a45275dd75a2248edc411e0", \n  "minor_version": 0, \n  "timestamp": 1559410555, \n  "flags": 0, \n  "miner_tx": {\n    "version": 1, \n    "vin": [ {\n        "gen": {\n          "height": 197812\n        }\n      }\n    ], \n    "vout": [ {\n        "amount": 8, \n        "target": {\n          "key": "51920a168448d8c7b8a58fab5c134f4b891a841b12644783945e7977ae402edb00"\n        }\n      }, {\n        "amount": 500, \n        "target": {\n          "key": "58b2d78268c01df9955fb3c7226577d95a79f025182716fdd884e2745e661b0900"\n        }\n      }, {\n        "amount": 1000, \n        "target": {\n          "key": "1f84dfd0c9a4edefcb904b291960be254dbaf7f84c762797bb6fdde723175c2200"\n        }\n      }, {\n        "amount": 10000, \n        "target": {\n          "key": "09e466c6df0ecf3f16b5c15f82331f7c605bd9222078a678b7c00bfcd89be16f00"\n        }\n      }, {\n        "amount": 100000, \n        "target": {\n          "key": "07e15ad240ec3f17786f172fea6b616267cb8b96e1d967d406e1d1f82b83f76300"\n        }\n      }\n    ], \n    "extra": [ {\n        "pub_key": "51be88f5b4f5b692ce5ad92e346bb632f35ffafd2323e12b733b79b6f8bdc8ea"\n      }, {\n        "user_data": , \n        "buff": 7"63616e61646132"\n      }, {\n        "extra_padding": , \n        "buff": [ ]\n      }, {\n        "derive_hint": , \n        "v": 8241\n      }, {\n        "unlock_time": , \n        "v": 197822\n      }], \n    "signatures": [ ], \n    "attachment": [ ]\n  }, \n  "tx_hashes": [ ]\n}',
            'penalty': '18446744073709440108',
            'prev_id': '0f3711cf940f5eab7ab75975e82fb8b8eafcb5811a45275dd75a2248edc411e0',
            'summary_reward': 111508,
            'this_block_fee_median': 0,
            'timestamp': 1559410555,
            'total_fee': 0,
            'total_txs_size': 0,
            'transactions_details': [
              {
                'amount': 111508,
                'blob': '',
                'blob_size': 239,
                'extra': [
                  {
                    'datails_view': '',
                    'short_view': '51be88f5b4f5b692ce5ad92e346bb632f35ffafd2323e12b733b79b6f8bdc8ea',
                    'type': 'pub_key'
                  },
                  {
                    'datails_view': '63616e61646132',
                    'short_view': '7 bytes',
                    'type': 'user_data'
                  },
                  {
                    'datails_view': '',
                    'short_view': '0 bytes',
                    'type': 'extra_padding'
                  },
                  {
                    'datails_view': '3120',
                    'short_view': '3120',
                    'type': 'XOR'
                  },
                  {
                    'datails_view': '',
                    'short_view': 'height: 197822',
                    'type': 'unlock_time'
                  }
                ],
                'fee': 0,
                'id': '4562f8cf1b4a74a1732cb8679d37639b566797c6f7587ba61d9493e9628e21e5',
                'ins': [
                  {
                    'amount': 0,
                    'kimage_or_ms_id': '',
                    'multisig_count': 0
                  }
                ],
                'keeper_block': 0,
                'object_in_json': '',
                'outs': [
                  {
                    'amount': 8,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      '51920a168448d8c7b8a58fab5c134f4b891a841b12644783945e7977ae402edb'
                    ]
                  },
                  {
                    'amount': 500,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      '58b2d78268c01df9955fb3c7226577d95a79f025182716fdd884e2745e661b09'
                    ]
                  },
                  {
                    'amount': 1000,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      '1f84dfd0c9a4edefcb904b291960be254dbaf7f84c762797bb6fdde723175c22'
                    ]
                  },
                  {
                    'amount': 10000,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      '09e466c6df0ecf3f16b5c15f82331f7c605bd9222078a678b7c00bfcd89be16f'
                    ]
                  },
                  {
                    'amount': 100000,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      '07e15ad240ec3f17786f172fea6b616267cb8b96e1d967d406e1d1f82b83f763'
                    ]
                  }
                ],
                'pub_key': '51be88f5b4f5b692ce5ad92e346bb632f35ffafd2323e12b733b79b6f8bdc8ea',
                'timestamp': 1559410555
              }
            ],
            'type': 1
          },
          {
            'actual_timestamp': 1559572490,
            'already_generated_coins': 0,
            'base_reward': 0,
            'blob': '',
            'block_cumulative_size': 0,
            'block_tself_size': 0,
            'cumulative_diff_adjusted': '17283136568',
            'cumulative_diff_precise': '31120889104',
            'difficulty': '321190',
            'effective_fee_median': 0,
            'height': 199148,
            'id': 'b84c00bd6f01ffabea838785d3d18a7d6f53deddcc0d5cbc08bc1f25f65dbb16',
            'is_orphan': true,
            'miner_text_info': 'singapore1',
            'object_in_json': '{\n  "major_version": 1, \n  "nonce": 2757765893, \n  "prev_id": "b322235daecb5b996e12f53f23d4d8b806f8b7217fce0629e74b1aa83738f856", \n  "minor_version": 0, \n  "timestamp": 1559572490, \n  "flags": 0, \n  "miner_tx": {\n    "version": 1, \n    "vin": [ {\n        "gen": {\n          "height": 199148\n        }\n      }\n    ], \n    "vout": [ {\n        "amount": 3, \n        "target": {\n          "key": "a6ad8a90cc8025d0aeaf36dc9239b4323273623b90c5604597b747331649ee6500"\n        }\n      }, {\n        "amount": 10, \n        "target": {\n          "key": "83fec17ef5c01c568ccdb1e4d22f7a1e27865a35095bc64c56643ea8bb89dee000"\n        }\n      }, {\n        "amount": 500, \n        "target": {\n          "key": "5b417e161b4840b8bdb56a8f31d02491ac7c35866b117f2b855f16fa77a883b100"\n        }\n      }, {\n        "amount": 1000, \n        "target": {\n          "key": "742e74f7ffa345fbd505fab4757bd64e93d7fe5a34c9513030145c7c57c6fa4f00"\n        }\n      }, {\n        "amount": 10000, \n        "target": {\n          "key": "a33a7b5c4ddf94d825af3a9e4c6e051aed9039f9f316ebecb573a05e3d5962de00"\n        }\n      }, {\n        "amount": 100000, \n        "target": {\n          "key": "7a22fd06047595d15ed7cc5b3e59c2a1de98427e8ce1408dd6a1fcb5e89ead2b00"\n        }\n      }\n    ], \n    "extra": [ {\n        "pub_key": "d5cce89269e15c2babc79f08f21ebbd43ec4fba3c4c18c4d5b9b6f577c8626df"\n      }, {\n        "user_data": , \n        "buff": 10"73696e6761706f726531"\n      }, {\n        "extra_padding": , \n        "buff": [ ]\n      }, {\n        "derive_hint": , \n        "v": 46686\n      }, {\n        "unlock_time": , \n        "v": 199158\n      }], \n    "signatures": [ ], \n    "attachment": [ ]\n  }, \n  "tx_hashes": [ ]\n}',
            'penalty': '18446744073709440103',
            'prev_id': 'b322235daecb5b996e12f53f23d4d8b806f8b7217fce0629e74b1aa83738f856',
            'summary_reward': 111513,
            'this_block_fee_median': 0,
            'timestamp': 1559572490,
            'total_fee': 0,
            'total_txs_size': 0,
            'transactions_details': [
              {
                'amount': 111513,
                'blob': '',
                'blob_size': 277,
                'extra': [
                  {
                    'datails_view': '',
                    'short_view': 'd5cce89269e15c2babc79f08f21ebbd43ec4fba3c4c18c4d5b9b6f577c8626df',
                    'type': 'pub_key'
                  },
                  {
                    'datails_view': '73696e6761706f726531',
                    'short_view': '10 bytes',
                    'type': 'user_data'
                  },
                  {
                    'datails_view': '',
                    'short_view': '0 bytes',
                    'type': 'extra_padding'
                  },
                  {
                    'datails_view': '5eb6',
                    'short_view': '5eb6',
                    'type': 'XOR'
                  },
                  {
                    'datails_view': '',
                    'short_view': 'height: 199158',
                    'type': 'unlock_time'
                  }
                ],
                'fee': 0,
                'id': 'bb91f9881236b2febbee142a78ab70ee948bf248b25401fac84c58e8d9e2596d',
                'ins': [
                  {
                    'amount': 0,
                    'kimage_or_ms_id': '',
                    'multisig_count': 0
                  }
                ],
                'keeper_block': 0,
                'object_in_json': '',
                'outs': [
                  {
                    'amount': 3,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      'a6ad8a90cc8025d0aeaf36dc9239b4323273623b90c5604597b747331649ee65'
                    ]
                  },
                  {
                    'amount': 10,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      '83fec17ef5c01c568ccdb1e4d22f7a1e27865a35095bc64c56643ea8bb89dee0'
                    ]
                  },
                  {
                    'amount': 500,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      '5b417e161b4840b8bdb56a8f31d02491ac7c35866b117f2b855f16fa77a883b1'
                    ]
                  },
                  {
                    'amount': 1000,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      '742e74f7ffa345fbd505fab4757bd64e93d7fe5a34c9513030145c7c57c6fa4f'
                    ]
                  },
                  {
                    'amount': 10000,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      'a33a7b5c4ddf94d825af3a9e4c6e051aed9039f9f316ebecb573a05e3d5962de'
                    ]
                  },
                  {
                    'amount': 100000,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      '7a22fd06047595d15ed7cc5b3e59c2a1de98427e8ce1408dd6a1fcb5e89ead2b'
                    ]
                  }
                ],
                'pub_key': 'd5cce89269e15c2babc79f08f21ebbd43ec4fba3c4c18c4d5b9b6f577c8626df',
                'timestamp': 1559572490
              }
            ],
            'type': 1
          },
          {
            'actual_timestamp': 1559635984,
            'already_generated_coins': 0,
            'base_reward': 0,
            'blob': '',
            'block_cumulative_size': 0,
            'block_tself_size': 0,
            'cumulative_diff_adjusted': '17283138239',
            'cumulative_diff_precise': '31298510791',
            'difficulty': '332769',
            'effective_fee_median': 0,
            'height': 199705,
            'id': '4739a067ad11367c581c3049318e6fd57db2ba69e1236315cb957e80c9e54d72',
            'is_orphan': true,
            'miner_text_info': 'hetzner1',
            'object_in_json': '{\n  "major_version": 1, \n  "nonce": 2065105151, \n  "prev_id": "d882f7cd8ea9ec5742dcc56cb1c2b6f804a0a119ac7e7baaf11b84ad991303f8", \n  "minor_version": 0, \n  "timestamp": 1559635984, \n  "flags": 0, \n  "miner_tx": {\n    "version": 1, \n    "vin": [ {\n        "gen": {\n          "height": 199705\n        }\n      }\n    ], \n    "vout": [ {\n        "amount": 6, \n        "target": {\n          "key": "6ce3f5112f7d6706412fbb55a4daed6061db8ff416989b3749479de050cd418500"\n        }\n      }, {\n        "amount": 10, \n        "target": {\n          "key": "8c7703b8f2a6d17e5fd17f2ec8aaa1a005473f15dc926aa96cb038fc78d3cabf00"\n        }\n      }, {\n        "amount": 500, \n        "target": {\n          "key": "a70e8cb181abeaba517236fe93a61953685b4e024dbc262e48d2342519b8ecad00"\n        }\n      }, {\n        "amount": 1000, \n        "target": {\n          "key": "755d413092632c32bb6ac517d5514785fe3c8b825320413a7669b12da57850c800"\n        }\n      }, {\n        "amount": 10000, \n        "target": {\n          "key": "6425c3c32fec7237319b4a7b1d8434f51a75f16f34b2163db65a1f4265be095b00"\n        }\n      }, {\n        "amount": 100000, \n        "target": {\n          "key": "cda13fea9618744822981284c40cc752d34f70e886aa212dbf610135862a1ec700"\n        }\n      }\n    ], \n    "extra": [ {\n        "pub_key": "c18a45c2238ba53a38fe881ad0dc8a183cdde4e8dfe6888006d75944dc052aca"\n      }, {\n        "user_data": , \n        "buff": 8"6865747a6e657231"\n      }, {\n        "extra_padding": , \n        "buff": [ ]\n      }, {\n        "derive_hint": , \n        "v": 15715\n      }, {\n        "unlock_time": , \n        "v": 199715\n      }], \n    "signatures": [ ], \n    "attachment": [ ]\n  }, \n  "tx_hashes": [ ]\n}',
            'penalty': '18446744073709440100',
            'prev_id': 'd882f7cd8ea9ec5742dcc56cb1c2b6f804a0a119ac7e7baaf11b84ad991303f8',
            'summary_reward': 111516,
            'this_block_fee_median': 0,
            'timestamp': 1559635984,
            'total_fee': 0,
            'total_txs_size': 0,
            'transactions_details': [
              {
                'amount': 111516,
                'blob': '',
                'blob_size': 275,
                'extra': [
                  {
                    'datails_view': '',
                    'short_view': 'c18a45c2238ba53a38fe881ad0dc8a183cdde4e8dfe6888006d75944dc052aca',
                    'type': 'pub_key'
                  },
                  {
                    'datails_view': '6865747a6e657231',
                    'short_view': '8 bytes',
                    'type': 'user_data'
                  },
                  {
                    'datails_view': '',
                    'short_view': '0 bytes',
                    'type': 'extra_padding'
                  },
                  {
                    'datails_view': '633d',
                    'short_view': '633d',
                    'type': 'XOR'
                  },
                  {
                    'datails_view': '',
                    'short_view': 'height: 199715',
                    'type': 'unlock_time'
                  }
                ],
                'fee': 0,
                'id': 'b437a83124353687dfbe43d77937297bfa43fd35a8d2c43556b71ef30484313b',
                'ins': [
                  {
                    'amount': 0,
                    'kimage_or_ms_id': '',
                    'multisig_count': 0
                  }
                ],
                'keeper_block': 0,
                'object_in_json': '',
                'outs': [
                  {
                    'amount': 6,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      '6ce3f5112f7d6706412fbb55a4daed6061db8ff416989b3749479de050cd4185'
                    ]
                  },
                  {
                    'amount': 10,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      '8c7703b8f2a6d17e5fd17f2ec8aaa1a005473f15dc926aa96cb038fc78d3cabf'
                    ]
                  },
                  {
                    'amount': 500,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      'a70e8cb181abeaba517236fe93a61953685b4e024dbc262e48d2342519b8ecad'
                    ]
                  },
                  {
                    'amount': 1000,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      '755d413092632c32bb6ac517d5514785fe3c8b825320413a7669b12da57850c8'
                    ]
                  },
                  {
                    'amount': 10000,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      '6425c3c32fec7237319b4a7b1d8434f51a75f16f34b2163db65a1f4265be095b'
                    ]
                  },
                  {
                    'amount': 100000,
                    'global_index': 0,
                    'is_spent': false,
                    'minimum_sigs': 0,
                    'pub_keys': [
                      'cda13fea9618744822981284c40cc752d34f70e886aa212dbf610135862a1ec7'
                    ]
                  }
                ],
                'pub_key': 'c18a45c2238ba53a38fe881ad0dc8a183cdde4e8dfe6888006d75944dc052aca',
                'timestamp': 1559635984
              }
            ],
            'type': 1
          }
        ],
        'status': 'OK'
      }
    };
    this.getAltBlockDetails = {
      'id': 0,
      'jsonrpc': '2.0',
      'result': {
        'block_details': {
          'actual_timestamp': 1559572490,
          'already_generated_coins': 0,
          'base_reward': 0,
          'blob': '',
          'block_cumulative_size': 0,
          'block_tself_size': 0,
          'cumulative_diff_adjusted': '17283136568',
          'cumulative_diff_precise': '31120889104',
          'difficulty': '321190',
          'effective_fee_median': 0,
          'height': 199148,
          'id': 'b84c00bd6f01ffabea838785d3d18a7d6f53deddcc0d5cbc08bc1f25f65dbb16',
          'is_orphan': true,
          'miner_text_info': 'singapore1',
          'object_in_json': '{\n  "major_version": 1, \n  "nonce": 2757765893, \n  "prev_id": "b322235daecb5b996e12f53f23d4d8b806f8b7217fce0629e74b1aa83738f856", \n  "minor_version": 0, \n  "timestamp": 1559572490, \n  "flags": 0, \n  "miner_tx": {\n    "version": 1, \n    "vin": [ {\n        "gen": {\n          "height": 199148\n        }\n      }\n    ], \n    "vout": [ {\n        "amount": 3, \n        "target": {\n          "key": "a6ad8a90cc8025d0aeaf36dc9239b4323273623b90c5604597b747331649ee6500"\n        }\n      }, {\n        "amount": 10, \n        "target": {\n          "key": "83fec17ef5c01c568ccdb1e4d22f7a1e27865a35095bc64c56643ea8bb89dee000"\n        }\n      }, {\n        "amount": 500, \n        "target": {\n          "key": "5b417e161b4840b8bdb56a8f31d02491ac7c35866b117f2b855f16fa77a883b100"\n        }\n      }, {\n        "amount": 1000, \n        "target": {\n          "key": "742e74f7ffa345fbd505fab4757bd64e93d7fe5a34c9513030145c7c57c6fa4f00"\n        }\n      }, {\n        "amount": 10000, \n        "target": {\n          "key": "a33a7b5c4ddf94d825af3a9e4c6e051aed9039f9f316ebecb573a05e3d5962de00"\n        }\n      }, {\n        "amount": 100000, \n        "target": {\n          "key": "7a22fd06047595d15ed7cc5b3e59c2a1de98427e8ce1408dd6a1fcb5e89ead2b00"\n        }\n      }\n    ], \n    "extra": [ {\n        "pub_key": "d5cce89269e15c2babc79f08f21ebbd43ec4fba3c4c18c4d5b9b6f577c8626df"\n      }, {\n        "user_data": , \n        "buff": 10"73696e6761706f726531"\n      }, {\n        "extra_padding": , \n        "buff": [ ]\n      }, {\n        "derive_hint": , \n        "v": 46686\n      }, {\n        "unlock_time": , \n        "v": 199158\n      }], \n    "signatures": [ ], \n    "attachment": [ ]\n  }, \n  "tx_hashes": [ ]\n}',
          'penalty': '18446744073709440103',
          'prev_id': 'b322235daecb5b996e12f53f23d4d8b806f8b7217fce0629e74b1aa83738f856',
          'summary_reward': 111513,
          'this_block_fee_median': 0,
          'timestamp': 1559572490,
          'total_fee': 0,
          'total_txs_size': 0,
          'transactions_details': [
            {
              'amount': 111513,
              'blob': '',
              'blob_size': 277,
              'extra': [
                {
                  'datails_view': '',
                  'short_view': 'd5cce89269e15c2babc79f08f21ebbd43ec4fba3c4c18c4d5b9b6f577c8626df',
                  'type': 'pub_key'
                },
                {
                  'datails_view': '73696e6761706f726531',
                  'short_view': '10 bytes',
                  'type': 'user_data'
                },
                {
                  'datails_view': '',
                  'short_view': '0 bytes',
                  'type': 'extra_padding'
                },
                {
                  'datails_view': '5eb6',
                  'short_view': '5eb6',
                  'type': 'XOR'
                },
                {
                  'datails_view': '',
                  'short_view': 'height: 199158',
                  'type': 'unlock_time'
                }
              ],
              'fee': 0,
              'id': 'bb91f9881236b2febbee142a78ab70ee948bf248b25401fac84c58e8d9e2596d',
              'ins': [
                {
                  'amount': 0,
                  'kimage_or_ms_id': '',
                  'multisig_count': 0
                }
              ],
              'keeper_block': 0,
              'object_in_json': '',
              'outs': [
                {
                  'amount': 3,
                  'global_index': 0,
                  'is_spent': false,
                  'minimum_sigs': 0,
                  'pub_keys': [
                    'a6ad8a90cc8025d0aeaf36dc9239b4323273623b90c5604597b747331649ee65'
                  ]
                },
                {
                  'amount': 10,
                  'global_index': 0,
                  'is_spent': false,
                  'minimum_sigs': 0,
                  'pub_keys': [
                    '83fec17ef5c01c568ccdb1e4d22f7a1e27865a35095bc64c56643ea8bb89dee0'
                  ]
                },
                {
                  'amount': 500,
                  'global_index': 0,
                  'is_spent': false,
                  'minimum_sigs': 0,
                  'pub_keys': [
                    '5b417e161b4840b8bdb56a8f31d02491ac7c35866b117f2b855f16fa77a883b1'
                  ]
                },
                {
                  'amount': 1000,
                  'global_index': 0,
                  'is_spent': false,
                  'minimum_sigs': 0,
                  'pub_keys': [
                    '742e74f7ffa345fbd505fab4757bd64e93d7fe5a34c9513030145c7c57c6fa4f'
                  ]
                },
                {
                  'amount': 10000,
                  'global_index': 0,
                  'is_spent': false,
                  'minimum_sigs': 0,
                  'pub_keys': [
                    'a33a7b5c4ddf94d825af3a9e4c6e051aed9039f9f316ebecb573a05e3d5962de'
                  ]
                },
                {
                  'amount': 100000,
                  'global_index': 0,
                  'is_spent': false,
                  'minimum_sigs': 0,
                  'pub_keys': [
                    '7a22fd06047595d15ed7cc5b3e59c2a1de98427e8ce1408dd6a1fcb5e89ead2b'
                  ]
                }
              ],
              'pub_key': 'd5cce89269e15c2babc79f08f21ebbd43ec4fba3c4c18c4d5b9b6f577c8626df',
              'timestamp': 1559572490
            }
          ],
          'type': 1
        },
        'status': 'OK'
      }
    };

    this.getPoolTXSDetails = {
      'id': 0,
      'jsonrpc': '2.0',
      'result': {
        'status': 'OK',
        'txs': [
          {
            'amount': 1999900000000,
            'blob': '',
            'blob_size': 1110,
            'fee': 100000000,
            'id': '31ab972b0f83f51f3daf4f500f335ced79bab8ef36d4b917f302eadf262fd256',
            'keeper_block': 0,
            'object_in_json': '',
            'pub_key': '82f339a52f488b74354feed5475fbe964486011e8e924d539ffc3ef021538c72',
            'timestamp': 1558427600
          }
        ]
      }
    };
    this.getPoolTXSbriefDetails = {
      'id': 0,
      'jsonrpc': '2.0',
      'result': {
        'status': 'OK',
        'txs': [
          {
            'fee': 100000000,
            'id': '31ab972b0f83f51f3daf4f500f335ced79bab8ef36d4b917f302eadf262fd256',
            'sz': 1110,
            'total_amount': 1999900000000
          }
        ]
      }
    };
    this.geAllPoolTXlist = {
      'id': 0,
      'jsonrpc': '2.0',
      'result': {
        'ids': ['103be6d1660c1e6a52c1a0f2f4f525b5fe689ef7c1d177b9d02c16f5cfb60e6a', 'bb7691172d33d1e2b07525a75f7d5af7d3f1ca578d395b8cf590893e505d3708'],
        'status': 'OK'
      }
    };

    this.getTXdetails = {
      'id': 0,
      'jsonrpc': '2.0',
      'result': {
        'status': 'OK',
        'tx_info': {
          'amount': 111516,
          'blob': '',
          'blob_size': 274,
          'extra': [
            {
              'datails_view': '',
              'short_view': 'b88a77acc2e46874492a6a4a7df900c8c7d6ffeb53bef8300015f04f4e27630b',
              'type': 'pub_key'
            },
            {
              'datails_view': '63616e61646132',
              'short_view': '7 bytes',
              'type': 'user_data'
            },
            {
              'datails_view': '',
              'short_view': '0 bytes',
              'type': 'extra_padding'
            },
            {
              'datails_view': '6881',
              'short_view': '6881',
              'type': 'XOR'
            },
            {
              'datails_view': '',
              'short_view': 'height: 199797',
              'type': 'unlock_time'
            }
          ],
          'fee': 0,
          'id': 'f447ae041112b0bf8726ca5d25b4142432b6aa92fbbfa817d300377d5633c467',
          'ins': [
            {
              'amount': 0,
              'kimage_or_ms_id': '',
              'multisig_count': 0
            }
          ],
          'keeper_block': 199787,
          'object_in_json': '',
          'outs': [
            {
              'amount': 6,
              'global_index': 18684,
              'is_spent': false,
              'minimum_sigs': 0,
              'pub_keys': [
                'd925b221a3d76d67f75bceb64a1588cdd9b78dab52c48824c00aea17ae901a48'
              ]
            },
            {
              'amount': 10,
              'global_index': 19147,
              'is_spent': false,
              'minimum_sigs': 0,
              'pub_keys': [
                'c0bbd542e9546694495e3dc067b780283e769f1d93d2a7318aced1f57b9704cb'
              ]
            },
            {
              'amount': 500,
              'global_index': 13517,
              'is_spent': false,
              'minimum_sigs': 0,
              'pub_keys': [
                'd66fb630af31dfab452c8d9af3a419bb374d92b7d5ed85b72855b3082d1495b4'
              ]
            },
            {
              'amount': 1000,
              'global_index': 69461,
              'is_spent': false,
              'minimum_sigs': 0,
              'pub_keys': [
                'ecf7b6b47b081018277960887750d85f61cc9884aa4de1e5d2a417ad28ac06bf'
              ]
            },
            {
              'amount': 10000,
              'global_index': 132090,
              'is_spent': false,
              'minimum_sigs': 0,
              'pub_keys': [
                '7d0d59a3555c3261dcf38f34e364ecb8eeed570af208a5396548ef97ee8033f6'
              ]
            },
            {
              'amount': 100000,
              'global_index': 395846,
              'is_spent': false,
              'minimum_sigs': 0,
              'pub_keys': [
                '6c659ef6b41eddc42a0b9e2b328b982dde65fc97926e620183929e6ea5395663'
              ]
            }
          ],
          'pub_key': 'b88a77acc2e46874492a6a4a7df900c8c7d6ffeb53bef8300015f04f4e27630b',
          'timestamp': 1559646106
        }
      }
    };
  }

  clickEvent(name: string) {
    this.dropdowns[name] = !this.dropdowns[name];
  }
}

