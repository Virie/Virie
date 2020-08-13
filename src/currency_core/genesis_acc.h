// Copyright (c) 2014-2020 The Virie Project
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#pragma once 
#include <stdint.h>
#include <algorithm>
#include "currency_format_utils.h"

namespace currency
{


#pragma pack(push, 1)
  struct genesis_tx_dictionary_entry
  {
    uint64_t addr_hash;
    uint64_t offset;

    bool operator< (const genesis_tx_dictionary_entry& s) const
    {
      return addr_hash < s.addr_hash;
    }
  };
#pragma pack(pop)

#if CURRENCY_FORMATION_VERSION == 81

  extern const genesis_tx_dictionary_entry ggenesis_dict[5];

#elif CURRENCY_FORMATION_VERSION == 82

  extern const genesis_tx_dictionary_entry ggenesis_dict[5]; // generated: 06.04.2020 12:52:07, from: 06042020.json

#elif CURRENCY_FORMATION_VERSION == 83

  extern const genesis_tx_dictionary_entry ggenesis_dict[3]; // generated: 21.07.2020 09:32:16, from: emission_327.json

#elif CURRENCY_FORMATION_VERSION == 85

  extern const genesis_tx_dictionary_entry ggenesis_dict[1]; // generated: 11.08.2020 13:58:12, from: emsn_110820.json

#else
#  error the undefined ggenesis_dict for current CURRENCY_FORMATION_VERSION
#endif

  extern const crypto::public_key ggenesis_tx_pub_key;

  inline bool get_account_genesis_offset_by_address(const std::string& addr, uint64_t& offset)
  {
    genesis_tx_dictionary_entry key_entry = AUTO_VAL_INIT(key_entry);
    key_entry.addr_hash = get_string_uint64_hash(addr);

    const genesis_tx_dictionary_entry* pfirst = &ggenesis_dict[0];
    const genesis_tx_dictionary_entry* plast = &ggenesis_dict[sizeof(ggenesis_dict) / sizeof(ggenesis_dict[0])];
    const genesis_tx_dictionary_entry* plower = std::lower_bound(pfirst, plast, key_entry);
    if (plower == plast)
      return false;
    if (plower->addr_hash != key_entry.addr_hash)
      return false;
    offset = plower->offset;
    return true;
  }
}




