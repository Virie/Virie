// Copyright (c) 2014-2020 The Virie Project
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include "genesis_acc.h"


namespace currency
{

#if CURRENCY_FORMATION_VERSION == 81

  const std::string ggenesis_tx_pub_key_str = "0e7b621b24821055f701844f5b78e82a01185388b66d4c57cb499d5df58919ef";
  const crypto::public_key ggenesis_tx_pub_key = epee::string_tools::parse_tpod_from_hex_string<crypto::public_key>(ggenesis_tx_pub_key_str);
  extern const genesis_tx_dictionary_entry ggenesis_dict[5];
  const genesis_tx_dictionary_entry ggenesis_dict[5] = {
    {1610213985582294552ull,2},
    {6281667556601057795ull,3},
    {11056276598677148991ull,1},
    {13258820080864060085ull,4},
    {15335053953745349836ull,0}
  };

#elif CURRENCY_FORMATION_VERSION == 82

  const std::string ggenesis_tx_pub_key_str = "f33036daac342e7903fe7bd62914bdaec6f10b8f26a75dbf3b9445a885fc5ff3"; // generated: 06.04.2020 12:52:07, from: 06042020.json
  const crypto::public_key ggenesis_tx_pub_key = epee::string_tools::parse_tpod_from_hex_string<crypto::public_key>(ggenesis_tx_pub_key_str);
  extern const genesis_tx_dictionary_entry ggenesis_dict[5];
  const genesis_tx_dictionary_entry ggenesis_dict[5] = {
  {1610213985582294552ull,2} // HiyvSUVc7t...
  ,{11056276598677148991ull,1} // HdEmJ18E95...
  ,{13258820080864060085ull,3} // HdWuQQZHDB...
  ,{15335053953745349836ull,0} // Hdru2ec2uS...
  ,{15399516823990709108ull,4} // HZmHLb8Jsh...
  };

#elif CURRENCY_FORMATION_VERSION == 83

  const std::string ggenesis_tx_pub_key_str = "3b96242ebd22789d2e66a620b40dc7b1ee46ebe455fddc1d45e6335a4638d8ed"; // generated: 21.07.2020 09:32:16, from: emission_327.json
  const crypto::public_key ggenesis_tx_pub_key = epee::string_tools::parse_tpod_from_hex_string<crypto::public_key>(ggenesis_tx_pub_key_str);
  extern const genesis_tx_dictionary_entry ggenesis_dict[3];
  const genesis_tx_dictionary_entry ggenesis_dict[3] = {
  {1610213985582294552ull,2} // HiyvSUVc7t...
  ,{11056276598677148991ull,1} // HdEmJ18E95...
  ,{15335053953745349836ull,0} // Hdru2ec2uS...
  };

#elif CURRENCY_FORMATION_VERSION == 85

  const std::string ggenesis_tx_pub_key_str = "6c20feb4f853156a0ba0d30a63e6a248e753a1126377f0e9c6245614a8bf30e4"; // generated: 11.08.2020 13:58:12, from: emsn_110820.json
  const crypto::public_key ggenesis_tx_pub_key = epee::string_tools::parse_tpod_from_hex_string<crypto::public_key>(ggenesis_tx_pub_key_str);
  extern const genesis_tx_dictionary_entry ggenesis_dict[1];
  const genesis_tx_dictionary_entry ggenesis_dict[1] = {
  {3380613565924602144ull,0} // HgV1BHD2Jp...
  };

#else
#  error the undefined ggenesis_dict for current CURRENCY_FORMATION_VERSION
#endif

}



