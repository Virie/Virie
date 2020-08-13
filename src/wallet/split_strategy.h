// Copyright (c) 2014-2019 The Virie Project
// Copyright (c) 2012-2013 The Cryptonote developers
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#pragma once

namespace tools {
  namespace detail {
    inline void digit_split_strategy(const std::vector <currency::tx_destination_entry> &dsts,
      const currency::tx_destination_entry &change_dst, uint64_t dust_threshold,
      std::vector <currency::tx_destination_entry> &splitted_dsts, uint64_t &dust, uint64_t max_output_allowed)
    {
      splitted_dsts.clear();
      dust = 0;

      BOOST_FOREACH(auto & de, dsts)
      {
        if (de.addr.size() > 1) {
          //for multisig we don't split
          splitted_dsts.push_back(de);
        } else {
          currency::decompose_amount_into_digits(de.amount, dust_threshold,
            [&](uint64_t chunk) { splitted_dsts.push_back(currency::tx_destination_entry(chunk, de.addr)); },
            [&](uint64_t a_dust) { splitted_dsts.push_back(currency::tx_destination_entry(a_dust, de.addr)); },
            max_output_allowed);
        }
      }

      if (change_dst.amount > 0) {
        if (change_dst.addr.size() > 1) {
          //for multisig we don't split
          splitted_dsts.push_back(change_dst);
        } else {
          currency::decompose_amount_into_digits(change_dst.amount, dust_threshold,
            [&](uint64_t chunk) { splitted_dsts.push_back(currency::tx_destination_entry(chunk, change_dst.addr)); },
            [&](uint64_t a_dust) { dust = a_dust; }, max_output_allowed);

        }
      }
    }
    //----------------------------------------------------------------------------------------------------
    inline void null_split_strategy(const std::vector <currency::tx_destination_entry> &dsts,
      const currency::tx_destination_entry &change_dst, uint64_t dust_threshold,
      std::vector <currency::tx_destination_entry> &splitted_dsts, uint64_t &dust, uint64_t max_output_allowed)
    {
      splitted_dsts = dsts;

      dust = 0;
      uint64_t change = change_dst.amount;
      if (0 < dust_threshold) {
        for (uint64_t order = 10; order <= 10 * dust_threshold; order *= 10) {
          uint64_t dust_candidate = change_dst.amount % order;
          uint64_t change_candidate = (change_dst.amount / order) * order;
          if (dust_candidate <= dust_threshold) {
            dust = dust_candidate;
            change = change_candidate;
          } else {
            break;
          }
        }
      }

      if (0 != change) {
        splitted_dsts.push_back(currency::tx_destination_entry(change, change_dst.addr));
      }
    }
    //----------------------------------------------------------------------------------------------------
    inline void void_split_strategy(const std::vector <currency::tx_destination_entry> &dsts,
      const currency::tx_destination_entry &change_dst, uint64_t dust_threshold,
      std::vector <currency::tx_destination_entry> &splitted_dsts, uint64_t &dust, uint64_t max_output_allowed)
    {
      splitted_dsts = dsts;
      if (change_dst.amount > 0)
        splitted_dsts.push_back(change_dst);
    }
  } // eof namespace detail
} // eof namespace tools