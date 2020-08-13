// Copyright (c) 2014-2020 The Virie Project
// Copyright (c) 2012-2013 The Boolberry developers
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#pragma once 
#include "misc_language.h"
#include "string_tools.h"
#include "currency_config.h"

namespace currency
{
  typedef uint64_t (*core_time_func_t)();
  typedef uint64_t (*get_tx_fee_func_t)(uint64_t height);

  struct core_runtime_config
  {
    uint64_t min_coinstake_age;
    uint64_t pos_minimum_heigh; //height
    get_tx_fee_func_t tx_pool_min_fee;
    uint64_t tx_default_fee;
    crypto::public_key alias_validation_pubkey;
    core_time_func_t get_core_time;
  
    static uint64_t _default_core_time_function()
    {
      return time(NULL);
    }
    static uint64_t _default_core_minimm_fee_function(uint64_t height)
    {
      return TX_MINIMUM_FEE;
    }
  };

  inline core_runtime_config get_default_core_runtime_config()
  {
    core_runtime_config pc = AUTO_VAL_INIT(pc);
    pc.min_coinstake_age = POS_MINIMUM_COINSTAKE_AGE;
    pc.pos_minimum_heigh = POS_START_HEIGHT;
    pc.tx_pool_min_fee = &core_runtime_config::_default_core_minimm_fee_function;
    pc.tx_default_fee = TX_DEFAULT_FEE;
    pc.get_core_time = &core_runtime_config::_default_core_time_function;
    bool r = epee::string_tools::hex_to_pod(ALIAS_SHORT_NAMES_VALIDATION_PUB_KEY, pc.alias_validation_pubkey);
    CHECK_AND_ASSERT_THROW_MES(r, "failed to parse alias_validation_pub_key");
    return pc;
  }
}