// Copyright (c) 2014-2020 The Virie Project
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include <gtest/gtest.h>
#include "daemon_service/bc_daemon_service.h"

TEST(rpc_autodoc, rpc_autodoc)
{
  daemon_service::bc_daemon_service ds;
  auto &rpc_server = ds.get_rpc_server();

  epee::net_utils::http::http_request_info query_info;
  epee::net_utils::http::http_response_info response_info;
  epee::net_utils::connection_context_base conn_context;
  std::string generate_reference = std::string("RPC_COMMANDS_LIST:\n");
  auto sz = generate_reference.size();
  bool call_found = false;
  rpc_server.handle_http_request_map(query_info, response_info, conn_context, call_found, generate_reference);
  ASSERT_TRUE(generate_reference.size() > sz);
  std::string json_rpc_reference;
  query_info.m_URI = JSON_RPC_REFERENCE_MARKER;
  query_info.m_body = "{\"jsonrpc\": \"2.0\", \"method\": \"nonexisting_method\", \"params\": {}},";
  rpc_server.handle_http_request_map(query_info, response_info, conn_context, call_found, json_rpc_reference);
  ASSERT_TRUE(json_rpc_reference.size());

  generate_reference.clear();
  ASSERT_TRUE(auto_doc<json_command_type_t<currency::COMMAND_RPC_GETBLOCKCOUNT>>("", generate_reference));
  generate_reference += "s";
  ASSERT_FALSE(auto_doc<json_command_type_t<currency::COMMAND_RPC_GETBLOCKCOUNT>>("", generate_reference));
}