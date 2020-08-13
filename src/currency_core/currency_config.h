// Copyright (c) 2014-2020 The Virie Project
// Copyright (c) 2012-2013 The Cryptonote developers
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#pragma once

//#include <cstdint>    //in libethash used stdint.h conflicted with cstdint in windows

#ifdef TESTNET
#  ifndef CURRENCY_FORMATION_VERSION
#    define CURRENCY_FORMATION_VERSION                  85
#  endif


#  if CURRENCY_FORMATION_VERSION == 81

//premine
#define PREMINE_AMOUNT                                  10000000000000ull  /* 100_000.00000000 VRE */

#  elif CURRENCY_FORMATION_VERSION == 82

//premine
#define PREMINE_AMOUNT                                  10000300000000ull  // 100_003.00000000 VRE, generated: 06.04.2020 12:52:07, from: 06042020.json

#  elif CURRENCY_FORMATION_VERSION == 83

//premine
#define PREMINE_AMOUNT                                  10000200000000ull  // 100_002.00000000 VRE, generated: 21.07.2020 09:32:16, from: emission_327.json

#  elif CURRENCY_FORMATION_VERSION == 85

//premine
#define PREMINE_AMOUNT                                  100000000000000ull  // 1_000_000.00000000 VRE, generated: 11.08.2020 13:58:12, from: emsn_110820.json

#  else
#    error the undefined premine amount for current CURRENCY_FORMATION_VERSION
#  endif

#else

#define CURRENCY_FORMATION_VERSION                      85

//premine
#define PREMINE_AMOUNT                                  100000000000000ull  // 1_000_000.00000000 VRE, generated: 11.08.2020 13:58:12, from: emsn_110820.json

#endif

#define CURRENCY_MAX_BLOCK_NUMBER                       500000000
#define CURRENCY_MAX_BLOCK_SIZE                         500000000  // block header blob limit, never used!
#define CURRENCY_TX_MAX_ALLOWED_OUTS                    2000
#define CURRENCY_PUBLIC_ADDRESS_TEXTBLOB_VER            0
#define CURRENCY_PUBLIC_ADDRESS_BASE58_PREFIX           99  // addresses start with 'H'
#define CURRENCY_PUBLIC_INTEG_ADDRESS_BASE58_PREFIX     240 // addresses start with 'h9'
#define CURRENCY_MINED_MONEY_UNLOCK_WINDOW              10
#define CURRENT_TRANSACTION_VERSION                     1
#define CURRENT_BLOCK_MAJOR_VERSION                     1
#define CURRENT_BLOCK_MINOR_VERSION                     0
#define CURRENCY_BLOCK_FUTURE_TIME_LIMIT                60*60*2
#define CURRENCY_POS_BLOCK_FUTURE_TIME_LIMIT            60*20

#define BLOCKCHAIN_TIMESTAMP_CHECK_WINDOW               60

// TOTAL_MONEY_SUPPLY - total number coins to be generated
#define TOTAL_MONEY_SUPPLY                              ((uint64_t)(-1))
                                                        
//#define EMISSION_POS_REWARD_DEVIDER                     379555ULL    // originally based on formula "1/((sqrt(1.01, (720*365.4)) - 1))" which is avr 1% per year, and then adjusted
//#define EMISSION_POW_REWARD_DEVIDER                     27098500ULL  // originally based on formula "1/((sqrt(1.005, (720*365.4)) - 1))" which is avr 0.5% per year, and then adjusted

#define POS_START_HEIGHT                                0

#define CURRENCY_REWARD_BLOCKS_WINDOW                   400
#define CURRENCY_BLOCK_GRANTED_FULL_REWARD_ZONE         125000 //size of block (bytes) after which reward for block calculated using block size
#define CURRENCY_COINBASE_BLOB_RESERVED_SIZE            1100
#define CURRENCY_MAX_TRANSACTION_BLOB_SIZE              (CURRENCY_BLOCK_GRANTED_FULL_REWARD_ZONE - CURRENCY_COINBASE_BLOB_RESERVED_SIZE*2) 
#define CURRENCY_FREE_TX_MAX_BLOB_SIZE                  1024 // soft txpool-based limit for free-of-charge txs (such as BC_OFFERS_SERVICE_INSTRUCTION_DEL)
#define CURRENCY_DISPLAY_DECIMAL_POINT                  8

// COIN - number of smallest units in one coin
#define COIN                                            100000000ull        // pow(10, CURRENCY_DISPLAY_DECIMAL_POINT)
#define BASE_REWARD_DUST_THRESHOLD                      10000ull            // pow(10, 4) - change this will cause hard-fork!
#define DEFAULT_DUST_THRESHOLD                          0ull                //

#define TX_DEFAULT_FEE                                  1000000ull          // pow(10, 6)
#define TX_MINIMUM_FEE                                  1000000ull          // pow(10, 6)

#define AMOUNT_EXPECTED_10_YEARS                        (20ull * 1000ull * 1000ull * COIN)  /* 20_000_000.00000000 VRE */

#define CURRENCY_POW_REWARD_FEXED_NEXT                  1000000ull          // 0.01 vre

#define CURRENCY_COUNT_BLOCK_IN_YEAR                    262974ull           // = ~365.24 (tropical year) * 24 (hours in day) * 30 (minutes) singly PoS and PoW
#define CURRENCY_COUNT_BLOCK_IN_YEAR_COMMON             (CURRENCY_COUNT_BLOCK_IN_YEAR * 2ull)           // PoS + PoW
#define CURRENCY_ROW_TABLE_FIXED_REWARD(height, pos_reward, pow_reward)         {height, (pos_reward), (pow_reward)}                                                                                                        // row of table with fixed reward
#define CURRENCY_SIMPLE_PERCENT(percent, blocks, part, unit, without_amount)    ((AMOUNT_EXPECTED_10_YEARS / 100ull * (percent) - (without_amount))* (part) / ((blocks) * (unit)))                                          // simple percent of start emission with ratio

#define CURRENCY_SIMPLE_PERCENT_POS(height, percent, blocks, without_amount)    CURRENCY_SIMPLE_PERCENT(percent, blocks, CURRENCY_POS_REWARD_PART, CURRENCY_POS_REWARD_PART + CURRENCY_POW_REWARD_PART, without_amount)     // simple percent of start emission with POS path
#define CURRENCY_SIMPLE_PERCENT_POW(height, percent, blocks, without_amount)    CURRENCY_SIMPLE_PERCENT(percent, blocks, CURRENCY_POW_REWARD_PART, CURRENCY_POS_REWARD_PART + CURRENCY_POW_REWARD_PART, without_amount)     // simple percent of start emission with POW path

#define CURRENCY_ROW_TABLE_SIMPLE_PERCENT_REWARD_WITHOUT_PERIOD_NEXT(height, percent, blocks, without_amount) \
  CURRENCY_ROW_TABLE_FIXED_REWARD(height, \
                                  (CURRENCY_SIMPLE_PERCENT(percent, blocks, 1ull, 1ull, without_amount) - CURRENCY_POW_REWARD_FEXED_NEXT), \
                                  (CURRENCY_POW_REWARD_FEXED_NEXT))                                      // row of table with simple persent after CURRENCY_NEXT_REWARD_RULE_HEIGHT
#define CURRENCY_ROW_TABLE_SIMPLE_PERCENT_REWARD_NEXT(height, percent) \
  CURRENCY_ROW_TABLE_SIMPLE_PERCENT_REWARD_WITHOUT_PERIOD_NEXT(height, percent, CURRENCY_COUNT_BLOCK_IN_YEAR, 0ull)  // row of table with simple persent after CURRENCY_NEXT_REWARD_RULE_HEIGHT

static const struct
{
  const uint64_t height;                                // if height of block <= then this height then:
  const uint64_t reward_pos;                            //    if pos block then this reward
  const uint64_t reward_pow;                            //    else this reward
}                                                       // else next row
CURRENCY_REWARDS[]={
  CURRENCY_ROW_TABLE_FIXED_REWARD(300ULL, 1 * COIN, 1 * COIN),                                          // fixed rewards for first 300 blocks
  CURRENCY_ROW_TABLE_SIMPLE_PERCENT_REWARD_WITHOUT_PERIOD_NEXT(CURRENCY_COUNT_BLOCK_IN_YEAR_COMMON, 20ull,
                CURRENCY_COUNT_BLOCK_IN_YEAR - 300ull / 2ull, PREMINE_AMOUNT + 300ull * COIN),          // 1-st year reward 20% of expected emission (withot start emission and first 300 blocks)
  CURRENCY_ROW_TABLE_SIMPLE_PERCENT_REWARD_NEXT(CURRENCY_COUNT_BLOCK_IN_YEAR_COMMON * 2ull, 15ull),     // 2-nd year reward 15% of expected emission
  CURRENCY_ROW_TABLE_SIMPLE_PERCENT_REWARD_NEXT(CURRENCY_COUNT_BLOCK_IN_YEAR_COMMON * 3ull, 12ull),     // 3-th year reward 12% of expected emission
  CURRENCY_ROW_TABLE_SIMPLE_PERCENT_REWARD_NEXT(CURRENCY_COUNT_BLOCK_IN_YEAR_COMMON * 4ull, 11ull),     // 4-th year reward 11% of expected emission
  CURRENCY_ROW_TABLE_SIMPLE_PERCENT_REWARD_NEXT(CURRENCY_COUNT_BLOCK_IN_YEAR_COMMON * 5ull, 10ull),     // 5-th year reward 10% of expected emission
  CURRENCY_ROW_TABLE_SIMPLE_PERCENT_REWARD_NEXT(CURRENCY_COUNT_BLOCK_IN_YEAR_COMMON * 6ull, 9ull),      // 6-th year reward 9% of expected emission
  CURRENCY_ROW_TABLE_SIMPLE_PERCENT_REWARD_NEXT(CURRENCY_COUNT_BLOCK_IN_YEAR_COMMON * 7ull, 8ull),      // 7-th year reward 8% of expected emission
  CURRENCY_ROW_TABLE_SIMPLE_PERCENT_REWARD_NEXT(CURRENCY_COUNT_BLOCK_IN_YEAR_COMMON * 8ull, 6ull),      // 8-th year reward 6% of expected emission
  CURRENCY_ROW_TABLE_SIMPLE_PERCENT_REWARD_NEXT(CURRENCY_COUNT_BLOCK_IN_YEAR_COMMON * 9ull, 5ull),      // 9-th year reward 5% of expected emission
  CURRENCY_ROW_TABLE_SIMPLE_PERCENT_REWARD_NEXT(CURRENCY_COUNT_BLOCK_IN_YEAR_COMMON * 10ull, 4ull),     // 10-th year reward 4% of expected emission
  CURRENCY_ROW_TABLE_SIMPLE_PERCENT_REWARD_NEXT(~0ull,                                       1ull)      // after 10 years reward 1% of expected emission
};


//#define CURRENCY_FIXED_REWARD_ZONE_HEIGHT1              300                   // blocks will have fixed reward up to this height (including)
//#define CURRENCY_FIXED_REWARD_ZONE_REWARD_AMOUNT1       ((uint64_t)100000000) // should be TX_MINIMUM_FEE * CURRENCY_FIXED_REWARD_ZONE_FEE_MULTIPLIER
//#define CURRENCY_FIXED_REWARD_ZONE_FEE_MULTIPLIER       1000                  // reward in minimum fees for a block in the zone

//#define CURRENCY_FIXED_REWARD_ZONE_HEIGHT2              (~0ULL)               // blocks will have fixed reward up to this height (including) after CURRENCY_FIXED_REWARD_ZONE_HEIGHT1
//#define CURRENCY_FIXED_POS_REWARD_ZONE_REWARD_AMOUNT2   (1000000ULL * COIN * 5ULL / 6ULL / 262980ULL)    // fixed emmision 262980 = 365.25 * 720
//#define CURRENCY_FIXED_POW_REWARD_ZONE_REWARD_AMOUNT2   (1000000ULL * COIN        / 6ULL / 262980ULL)    // fixed emmision 262980 = 365.25 * 720

#define WALLET_MAX_ALLOWED_OUTPUT_AMOUNT                ((uint64_t)0xffffffffffffffffull)
#define CURRENCY_MINER_TX_MAX_OUTS                      CURRENCY_TX_MAX_ALLOWED_OUTS

#define ORPHANED_BLOCKS_MAX_COUNT                       100

#define DIFFICULTY_STARTER                              1
#define DIFFICULTY_POS_TARGET                           120 // seconds
#define DIFFICULTY_POW_TARGET                           120 // seconds
#define DIFFICULTY_TOTAL_TARGET                         ((DIFFICULTY_POS_TARGET + DIFFICULTY_POW_TARGET) / 4)
#define DIFFICULTY_WINDOW                               720 // blocks
#define DIFFICULTY_LAG                                  15  // !!!
#define DIFFICULTY_CUT                                  60  // timestamps to cut after sorting
#define DIFFICULTY_BLOCKS_COUNT                         (DIFFICULTY_WINDOW + DIFFICULTY_LAG)

#define CURRENCY_BLOCKS_PER_DAY                         ((60 * 60 * 24) / (DIFFICULTY_TOTAL_TARGET))


#define TX_EXPIRATION_TIMESTAMP_CHECK_WINDOW            20
#define TX_EXPIRATION_MEDIAN_SHIFT                      ((TX_EXPIRATION_TIMESTAMP_CHECK_WINDOW)/2)*DIFFICULTY_TOTAL_TARGET

#define CURRENCY_LOCKED_TX_ALLOWED_DELTA_BLOCKS         1
#define CURRENCY_LOCKED_TX_ALLOWED_DELTA_SECONDS        (DIFFICULTY_TOTAL_TARGET * CURRENCY_LOCKED_TX_ALLOWED_DELTA_BLOCKS)

#define DIFFICULTY_BLOCKS_ESTIMATE_TIMESPAN             DIFFICULTY_TOTAL_TARGET        // just alias

#define MAX_ALIAS_PER_BLOCK                             1000
#define ALIAS_COST_PERIOD                               (CURRENCY_BLOCKS_PER_DAY * 7)  // week
#define ALIAS_COST_RECENT_PERIOD                        (CURRENCY_BLOCKS_PER_DAY * 8)  // week + 1 day (we guarantee split depth at least 1 day)
#define ALIAS_VERY_INITAL_COST                          ((uint64_t)10000)              // to avoid split when default fee changed
#define ALIAS_MEDIAN_RECALC_INTERWAL                    CURRENCY_BLOCKS_PER_DAY


#define BLOCKS_IDS_SYNCHRONIZING_DEFAULT_COUNT          2000      // by default, blocks ids count in synchronizing
#define BLOCKS_SYNCHRONIZING_DEFAULT_COUNT              200       // by default, blocks count in blocks downloading
#define BLOCKS_SYNCHRONIZING_DEFAULT_SIZE               2000000   // by default keep synchronizing packets not bigger then 2MB
#define CURRENCY_PROTOCOL_HOP_RELAX_COUNT               3         // value of hop, after which we use only announce of new block


#define CURRENCY_ALT_BLOCK_LIVETIME_COUNT               (CURRENCY_BLOCKS_PER_DAY * 7)//one week
#define CURRENCY_MEMPOOL_TX_LIVETIME                    345600 //seconds, 4 days
#define COLD_SIGN_TRANSFER_RESERVATION_TIME             345600 //seconds, 4 days


#ifndef P2P_DEFAULT_PORT
#  define P2P_DEFAULT_PORT                              11522
#endif

#ifndef RPC_DEFAULT_PORT
#  define RPC_DEFAULT_PORT                              11523
#endif

#ifndef STRATUM_DEFAULT_PORT
#  define STRATUM_DEFAULT_PORT                          11555
#endif

#ifndef P2P_NETWORK_ID_BYTE_A
#  define P2P_NETWORK_ID_BYTE_A                         0
#endif


#define P2P_NETWORK_ID_VER                              (CURRENCY_FORMATION_VERSION+0)

#define COMMAND_RPC_GET_BLOCKS_FAST_MAX_COUNT           4000

#define P2P_LOCAL_WHITE_PEERLIST_LIMIT                  1000
#define P2P_LOCAL_GRAY_PEERLIST_LIMIT                   5000

#define P2P_DEFAULT_CONNECTIONS_COUNT                   8
#define P2P_DEFAULT_HANDSHAKE_INTERVAL                  60           //secondes
#define P2P_DEFAULT_PACKET_MAX_SIZE                     50000000     //50000000 bytes maximum packet size
#define P2P_DEFAULT_PEERS_IN_HANDSHAKE                  250
#define P2P_DEFAULT_CONNECTION_TIMEOUT                  5000       //5 seconds
#define P2P_DEFAULT_PING_CONNECTION_TIMEOUT             2000       //2 seconds
#define P2P_DEFAULT_INVOKE_TIMEOUT                      60*2*1000  //2 minutes
#define P2P_DEFAULT_HANDSHAKE_INVOKE_TIMEOUT            10000      //10 seconds
#define P2P_MAINTAINERS_PUB_KEY                         "2c8eb2bc8489011e46a7e10b49257541fefd7e9f4e832856de3aa8fe182194cc"
#define P2P_DEFAULT_WHITELIST_CONNECTIONS_PERCENT       70
#define P2P_FAILED_ADDR_FORGET_SECONDS                  (60*5)     //5 minutes

#define P2P_IP_BLOCKTIME                                (60*60*24) //24 hours
#define P2P_IP_FAILS_BEFOR_BLOCK                        2
#define P2P_IDLE_CONNECTION_KILL_INTERVAL               (5*60) //5 minutes
#define P2P_ALLOWED_BLOCKLIST_MAX_SIZE                  2

//PoS definitions
#define POS_SCAN_WINDOW                                 60*10 //seconds // 10 minutes
#define POS_SCAN_STEP                                   15    //seconds
#define POS_MAC_ACTUAL_TIMESTAMP_TO_MINED               (POS_SCAN_WINDOW + 100)

#define POS_STARTER_KERNEL_HASH                         "bd82e18d42a7ad239588b24fd356d63cc82717e1fae8f6a492cd25d62fda263f"
#define POS_MODFIFIER_INTERVAL                          10
#define POS_WALLET_MINING_SCAN_INTERVAL                 POS_SCAN_STEP  //seconds
#define POS_MINIMUM_COINSTAKE_AGE                       10 // blocks count


#define WALLET_FILE_SIGNATURE                           0x1111011101101011LL  //Bender's nightmare
#define WALLET_FILE_MAX_BODY_SIZE                       0x88888888L //2GB
#define WALLET_FILE_MAX_KEYS_SIZE                       10000 //

#define OFFER_MAXIMUM_LIFE_TIME                         (60 * 60 * 24 * 30)  // 30 days

#define GUI_BLOCKS_DISPLAY_COUNT                        40
#define GUI_DISPATCH_QUE_MAXSIZE                        100

#define ALLOW_DEBUG_COMMANDS


#define CURRENCY_NAME_ABR                               "VRE"
#define CURRENCY_NAME_BASE                              "Virie"
#define CURRENCY_NAME_SHORT_BASE                        "Virie"

#ifndef CURRENCY_NAME
#  define CURRENCY_NAME                                 CURRENCY_NAME_BASE
#endif

#ifndef CURRENCY_NAME_SHORT
#  define CURRENCY_NAME_SHORT                           CURRENCY_NAME_SHORT_BASE
#endif


//alias registration wallet
#define ALIAS_REWARDS_ACCOUNT_SPEND_PUB_KEY             "0000000000000000000000000000000000000000000000000000000000000000" //burn alias money
#define ALIAS_REWARDS_ACCOUNT_VIEW_PUB_KEY              "0000000000000000000000000000000000000000000000000000000000000000" //burn alias money
#define ALIAS_REWARDS_ACCOUNT_VIEW_SEC_KEY              "0000000000000000000000000000000000000000000000000000000000000000" //burn alias money

#define ALIAS_MINIMUM_PUBLIC_SHORT_NAME_ALLOWED         6
#define ALIAS_SHORT_NAMES_VALIDATION_PUB_KEY            "7059654bcdb9674b415068f5eae609df2cd43de2c4e94a0c3211156edd5ddcda" 


#define ALIAS_NAME_MAX_LEN                              255
#define ALIAS_VALID_CHARS                               "0123456789abcdefghijklmnopqrstuvwxyz-."
#define ALIAS_COMMENT_MAX_SIZE_BYTES                    400

#define CURRENCY_CORE_INSTANCE_LOCK_FILE                "lock.lck"


#define CURRENCY_POOLDATA_FOLDERNAME                    "poolstate"
#define CURRENCY_BLOCKCHAINDATA_FOLDERNAME              "blockchain"
#define P2P_NET_DATA_FILENAME                           "p2pstate.bin"
#define MINER_CONFIG_FILENAME                           "miner_conf.json"
#define GUI_SECURE_CONFIG_FILENAME                      "gui_secure_conf.bin"
#define GUI_CONFIG_FILENAME                             "gui_settings.json"
#define GUI_INTERNAL_CONFIG                             "gui_internal_config.bin"

//#define CURRENT_BLOCKCHAIN_STORAGE_ARCHIVE_VER          (CURRENCY_FORMATION_VERSION+97)
#define CURRENT_TRANSACTION_CHAIN_ENTRY_ARCHIVE_VER     3
#define CURRENT_BLOCK_EXTENDED_INFO_ARCHIVE_VER         1

#define BLOCKCHAIN_STORAGE_MAJOR_COMPATIBILITY_VERSION  (CURRENCY_FORMATION_VERSION + 4)
#define BLOCKCHAIN_STORAGE_MINOR_COMPATIBILITY_VERSION  1


#define BC_OFFERS_CURRENT_OFFERS_SERVICE_ARCHIVE_VER    (CURRENCY_FORMATION_VERSION + BLOCKCHAIN_STORAGE_MAJOR_COMPATIBILITY_VERSION + 9)
#define BC_OFFERS_CURRENCY_MARKET_FILENAME              "market.bin"


#define WALLET_FILE_SERIALIZATION_VERSION               (CURRENCY_FORMATION_VERSION + 64)
#define WALLET_LAST_VERSION_WITHOUT_COLD_SIGN           143
#ifdef TESTNET
#define WALLET_LAST_VERSION_WITHOUT_COLD_SIGN_RESERVES  144
#else
#define WALLET_LAST_VERSION_WITHOUT_COLD_SIGN_RESERVES  145
#endif

#define CURRENT_MEMPOOL_ARCHIVE_VER                     (CURRENCY_FORMATION_VERSION + 31)

#define MINIMUM_REQUIRED_FREE_SPACE_BYTES               (1024 * 1024 * 100)

#define OPENED_DESCRIPTORS_BEFORE_START                 10

static_assert(CURRENCY_MINER_TX_MAX_OUTS <= CURRENCY_TX_MAX_ALLOWED_OUTS, "Miner tx must obey normal tx max outs limit");
static_assert(PREMINE_AMOUNT / WALLET_MAX_ALLOWED_OUTPUT_AMOUNT < CURRENCY_MINER_TX_MAX_OUTS, "Premine can't be divided into reasonable number of outs");
//static_assert(CURRENCY_FIXED_REWARD_ZONE_REWARD_AMOUNT1 == TX_MINIMUM_FEE * CURRENCY_FIXED_REWARD_ZONE_FEE_MULTIPLIER, "CURRENCY_FIXED_REWARD_ZONE_REWARD_AMOUNT is incorrect with regard to TX_MINIMUM_FEE");
