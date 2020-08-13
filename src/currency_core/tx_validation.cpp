// Copyright (c) 2014-2020 The Virie Project
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include "tx_validation.h"
#include "currency_format_utils.h"

namespace currency
{
  bool check_tx_extra(const transaction &tx)
  {
    tx_extra_info ei = AUTO_VAL_INIT(ei);
    return parse_and_validate_tx_extra(tx, ei);
  }

  bool check_tx_inputs_keyimages_diff(const transaction &tx)
  {
    std::unordered_set<crypto::key_image> ki;
    BOOST_FOREACH(const auto& in, tx.vin)
    {
      if (in.type() == typeid(txin_to_key))
      {
        CHECKED_GET_SPECIFIC_VARIANT(in, const txin_to_key, tokey_in, false);
        if (!ki.insert(tokey_in.k_image).second)
          return false;
      }
    }
    return true;
  }

  bool check_tx_syntax(const transaction &tx)
  {
    return true;
  }

  bool check_tx_semantic(const transaction &tx)
  {
    auto tx_hash = get_transaction_hash(tx);

    if (tx.vin.empty())
    {
      LOG_PRINT_RED_L0("tx with empty inputs, rejected for tx id = " << tx_hash);
      return false;
    }

    if (!check_inputs_types_supported(tx))
    {
      LOG_PRINT_RED_L0("unsupported input types for tx id = " << tx_hash);
      return false;
    }

    if (!check_outs_valid(tx))
    {
      LOG_PRINT_RED_L0("tx with invalid outputs, rejected for tx id = " << tx_hash);
      return false;
    }

    if (!check_money_overflow(tx))
    {
      LOG_PRINT_RED_L0("tx has money overflow, rejected for tx id = " << tx_hash);
      return false;
    }

    uint64_t in_amount = 0;
    if (!get_inputs_money_amount(tx, in_amount))
    {
      LOG_PRINT_RED_L0("failed to get_inputs_money_amount for tx id = " << tx_hash);
      return false;
    }

    uint64_t out_amount = get_outs_money_amount(tx);
    if (in_amount < out_amount)
    {
      LOG_PRINT_RED_L0("tx with wrong amounts: ins " << in_amount << ", outs " << out_amount << ", rejected for tx id = " << tx_hash);
      return false;
    }

    if (!check_tx_inputs_keyimages_diff(tx))
    {
      LOG_PRINT_RED_L0("tx inputs have the same key images, rejected for tx id = " << tx_hash);
      return false;
    }

    if (!check_tx_extra(tx))
    {
      LOG_PRINT_RED_L0("tx has wrong extra, rejected for tx id = " << tx_hash);
      return false;
    }

    return true;
  }
} // eof namespace currency