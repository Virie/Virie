// Copyright (c) 2014-2020 The Virie Project
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#pragma once 
#include <string>
#include "currency_core/currency_config.h"
namespace currency
{

#pragma pack(push, 1)

#if CURRENCY_FORMATION_VERSION == 81

  struct genesis_tx_raw_data
  {
    uint64_t const v[31];
    uint8_t const r[7];
  };

#elif CURRENCY_FORMATION_VERSION == 82

  struct genesis_tx_raw_data // generated: 06.04.2020 12:52:07, from: 06042020.json
  {
    uint64_t const v[31];
    uint8_t const r[7];
  };

#elif CURRENCY_FORMATION_VERSION == 83

  struct genesis_tx_raw_data // generated: 21.07.2020 09:32:16, from: emission_327.json
  {
    uint64_t const v[21];
    uint8_t const r[3];
  };

#elif CURRENCY_FORMATION_VERSION == 85

  struct genesis_tx_raw_data // generated: 11.08.2020 13:58:12, from: emsn_110820.json
  {
    uint64_t const v[11];
    uint8_t const r[1];
  };

#else
#  error the undefined genesis for current CURRENCY_FORMATION_VERSION
#endif

#pragma pack(pop)
extern const genesis_tx_raw_data ggenesis_tx_raw;

}  // namespace currency
