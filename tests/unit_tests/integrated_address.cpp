// Copyright (c) 2014-2020 The Virie Project
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include <string>
#include <iostream>
#include <cctype>

#include "include_base_utils.h"
#include "storages/portable_storage_template_helper.h"
#include "wallet/wallet_rpc_server_commans_defs.h"

//operators for structs
namespace tools {
  namespace wallet_rpc {
    bool operator == (const COMMAND_RPC_MAKE_INTEGRATED_ADDRESS::request a,
                      const COMMAND_RPC_MAKE_INTEGRATED_ADDRESS::request b)
    {
      return a.payment_id == b.payment_id;
    }

    bool operator == (const COMMAND_RPC_MAKE_INTEGRATED_ADDRESS::response a,
                      const COMMAND_RPC_MAKE_INTEGRATED_ADDRESS::response b)
    {
      return a.integrated_address == b.integrated_address
          && a.payment_id == b.payment_id;
    }

    bool operator == (const COMMAND_RPC_SPLIT_INTEGRATED_ADDRESS::request a,
                      const COMMAND_RPC_SPLIT_INTEGRATED_ADDRESS::request b)
    {
      return a.integrated_address == b.integrated_address;
    }

    bool operator == (const COMMAND_RPC_SPLIT_INTEGRATED_ADDRESS::response a,
                      const COMMAND_RPC_SPLIT_INTEGRATED_ADDRESS::response b)
    {
      return a.standard_address == b.standard_address
          && a.payment_id == b.payment_id;
    }
  }
}

#include "gtest/gtest.h"
using namespace tools::wallet_rpc;

// remove all spaces and lower
std::string str_simpler(const std::string& s)
{
  std::string res{s};
  res.erase(std::remove_if(res.begin(), res.end(),
                           [](const std::string::value_type c)
  {
    return std::isspace(c);
  })
  , res.end());

  std::transform(res.begin(), res.end(), res.begin(),
                 [](const unsigned char c)
  {
    return std::tolower(c);
  });
  return res;
}

template <class T>
void test(const T& init_val, const std::string& json)
{
  const T item = init_val;
  std::string item_json = epee::serialization::store_t_to_json(item);
  ASSERT_EQ(str_simpler(json),str_simpler(item_json));
  T item_res_from_json;
  ASSERT_TRUE(epee::serialization::load_t_from_json(item_res_from_json, item_json));
  ASSERT_EQ(item, item_res_from_json);

  std::string item_binary =  epee::serialization::store_t_to_binary(item);
  T item_res_from_binary;
  ASSERT_TRUE(epee::serialization::load_t_from_binary(item_res_from_binary, item_binary));
  ASSERT_EQ(item, item_res_from_binary);
}

#define TEST_SERIAL_STRUCT(STRUCT, SUBSTRUCT) \
  TEST(serialze_integrated_address, STRUCT##_##SUBSTRUCT) \
  {\
    test(STRUCT##_##SUBSTRUCT##_##INIT, STRUCT##_##SUBSTRUCT##_##JSON); \
  }

#define TEST_SERIAL(STRUCT) \
  TEST_SERIAL_STRUCT(STRUCT, request) \
  TEST_SERIAL_STRUCT(STRUCT, response) \

const std::string PAYMENT_ID{"\xC2\xC4\xAA\xEA\x00\xC1\x48\x57\x77", 9};
const std::string PAYMENT_ID_HEX{"c2c4aaea00c1485777"};
const std::string INTEGRATED_ADDRESS{"h9MPDxJCbEvHNSXkykzXzy7imqgsunmgn3KoHa1qn3PjEtcySfCTB6ea8YTCrXxZzS9aGBUSGTw1W5XFJGwJXjwUb7yJPREk9ou1kZCthy5x"};
const std::string STANDARD_ADDRESS{"HcjASV5gT5zeABRWbWkTLj8c5vVkzDgyJfKXYQHAHvxS2qZaXke7VHP44jBsBpoDWJC2T4PSN6YEN2P3s9AVPcEWVdZZUx7"};

//------------------------------ COMMAND_RPC_MAKE_INTEGRATED_ADDRESS

const std::string COMMAND_RPC_MAKE_INTEGRATED_ADDRESS_request_JSON =
    "{"
      "\"payment_id\":\"" + PAYMENT_ID_HEX +"\""
    "}";
const COMMAND_RPC_MAKE_INTEGRATED_ADDRESS::request COMMAND_RPC_MAKE_INTEGRATED_ADDRESS_request_INIT{PAYMENT_ID};

const std::string COMMAND_RPC_MAKE_INTEGRATED_ADDRESS_response_JSON =
    "{"
      "\"integrated_address\":\"" + INTEGRATED_ADDRESS + "\","
      "\"payment_id\":\"" + PAYMENT_ID_HEX + "\""
    "}";
const COMMAND_RPC_MAKE_INTEGRATED_ADDRESS::response COMMAND_RPC_MAKE_INTEGRATED_ADDRESS_response_INIT{INTEGRATED_ADDRESS, {PAYMENT_ID}};

TEST_SERIAL(COMMAND_RPC_MAKE_INTEGRATED_ADDRESS)

//------------------------------ COMMAND_RPC_SPLIT_INTEGRATED_ADDRESS

const std::string COMMAND_RPC_SPLIT_INTEGRATED_ADDRESS_request_JSON =
    "{"
      "\"integrated_address\":\"" + INTEGRATED_ADDRESS +"\""
    "}";
const COMMAND_RPC_SPLIT_INTEGRATED_ADDRESS::request COMMAND_RPC_SPLIT_INTEGRATED_ADDRESS_request_INIT{INTEGRATED_ADDRESS};

//const std::string COMMAND_RPC_SPLIT_INTEGRATED_ADDRESS_response_JSON =
//    "{"
//       "\"standard_address\":\"" + STANDARD_ADDRESS + "\","
//       "\"payment_id\":\"" + PAYMENT_ID_HEX + "\""
//    "}";
const std::string COMMAND_RPC_SPLIT_INTEGRATED_ADDRESS_response_JSON =
    "{"
       "\"payment_id\":\"" + PAYMENT_ID_HEX + "\","
       "\"standard_address\":\"" + STANDARD_ADDRESS + "\""
    "}";
const COMMAND_RPC_SPLIT_INTEGRATED_ADDRESS::response COMMAND_RPC_SPLIT_INTEGRATED_ADDRESS_response_INIT{STANDARD_ADDRESS, {PAYMENT_ID}};


TEST_SERIAL(COMMAND_RPC_SPLIT_INTEGRATED_ADDRESS)






