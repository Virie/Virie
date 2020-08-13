// Copyright (c) 2014-2020 The Virie Project
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include "genesis.h"

namespace currency
{

#if CURRENCY_FORMATION_VERSION == 81

  const genesis_tx_raw_data ggenesis_tx_raw = {{
   0xd7c2800500000101,0xf66bda67eabc032f,0xec5ec0e3c96044a0,0x7fa8871200f91058,0x380eab101e16ba80,0x032fd7c2800066f9,0xcee448aca3db65de,0xbe00deaedd62e356,0x6003eebc79c8f44f,0x80e4f88a64d13c7c,0xcccb032fd7c28000,0x6f0231bbfda0976d,0xa6d54da825780a10,0xdc03cdc880edd54c,0x8000a9f328bc2b3e,0x6a0301cbdd848de0
  ,0xa47330d9dbd37399,0xe965300520362f82,0xcfcd6b4afbff49a5,0x003bcf88d14201b8,0xcd0357a6e0b69a80,0xd59ebb7946fc95d7,0x187b8c103712ed07,0x1ed6599b368ce1cb,0x003feee0aabb2a66,0x82241b627b0e1608,0x785b4f8401f75510,0x6db6885318012ae8,0x89f55d9d49cb574c,0x1750a1170015ef19,0xe2c4172711177d5a},
  {0x17,0xbe,0x0d,0x0e,0x0a,0x00,0x00}};

#elif CURRENCY_FORMATION_VERSION == 82

  const genesis_tx_raw_data ggenesis_tx_raw = {{ // generated: 06.04.2020 12:52:07, from: 06042020.json
   0xd7c2800500000101,0xe7b48293f972032f,0x1fba7752372aa9a5,0xdfa3185056500f66,0x9a1ed53b828cbbcd,0x032fd7c280000d1b,0x484a6a0490447c91,0x76724a2ea58b29d3,0xec83135d91f7b920,0x4507d87824f5ce2a,0xd347032fd7c28000,0x761d822bd69446a2,0xe1083586b6e1590f,0x34bbd52ad5c0e5c5,0x80008447d62c3ee2,0x640301d1c68bc580
  ,0xc4c6d3b049ab1edd,0x65632191c07a437e,0xf713224a004afd07,0x00922f1783bcc22b,0x800351bee885c080,0xd2c13e0c5304e759,0x2737ea17689df51b,0x6cd583f0d63ce250,0x006d6fd379d6364e,0x34acda3630f31608,0x1429d67bfe03792e,0xa7268f0bf1c6aebd,0xfc85a845943bbf5d,0x17e3c2170015f35f,0xd8fa17ac6017664c},
  {0x17,0x0d,0x2b,0x0e,0x0a,0x00,0x00}};

#elif CURRENCY_FORMATION_VERSION == 83

  const genesis_tx_raw_data ggenesis_tx_raw = {{ // generated: 21.07.2020 09:32:16, from: emission_327.json
   0xcac0800300000101,0x7683310302a384f3,0x09cfa5580bf2253c,0xc592e3c581bbef34,0x9190af3ffb157cd1,0xc2800069bf96f022,0x1943e47725032fd7,0x0c57abacca322e5d,0x08620cd1755f875b,0xb716a96407b24e71,0x2fd7c28000a8fb30,0xcbd9a7a5d2671403,0x71d5891ca53a25dc,0xea1b950fb501dbfd,0xa85c7db4cd69eded,0x2e24963b160600f0
  ,0x20a6662e9d7822bd,0xe4eb46eeb1c70db4,0x5a33e6451ddcfd55,0x33170015edd83846,0x0e0d8417547e1781},
  {0x0a,0x00,0x00}};

#elif CURRENCY_FORMATION_VERSION == 85

  const genesis_tx_raw_data ggenesis_tx_raw = {{ // generated: 11.08.2020 13:58:12, from: emsn_110820.json
   0xe980800100000101,0xef6faa0316deb183,0xa08a777afacb5f54,0xbdb2970be8bd0ee5,0xde5cfc9b082eecbc,0x160400cd08834d3c,0x6a1553f8b4fe206c,0x48a2e6630ad3a00b,0xe9f0776312a153e7,0xe430bfa8145624c6,0x000a0efaf2170015},
  {0x00}};

#else
#  error the undefined genesis for current CURRENCY_FORMATION_VERSION
#endif

}

