// Copyright (c) 2014-2020 The Virie Project
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#pragma once

#include "include_base_utils.h"

#include "currency_core/currency_core.h"
#include "currency_core/bc_offers_service.h"
#include "rpc/core_rpc_server.h"
#include "p2p/net_node.h"
#include "currency_protocol/currency_protocol_handler.h"
#include "common/miniupnp_helper.h"
#include "currency_core/core_tools.h"
#include "currency_core/checkpoints_create.h"
#ifdef ENABLE_STRATUM_SUPPORT
#include "stratum/stratum_server.h"
#endif


namespace daemon_service
{
  class bc_daemon_service
  {
  public:
    using notify_func_t = std::function<void(const std::string &)>;

    bc_daemon_service();
    bc_daemon_service(const bc_daemon_service &) = delete;
    bc_daemon_service &operator=(const bc_daemon_service &) = delete;
    ~bc_daemon_service() = default;

    static void init_options(boost::program_options::options_description& desc);

    bool init(const boost::program_options::variables_map &vm);
    bool deinit();
    bool start(bool sync = true);
    bool stop();

    void set_notify_func(notify_func_t &&notify_func);
    inline currency::core &get_currency_core() { return m_currency_core; }
    inline nodetool::node_server<currency::t_currency_protocol_handler<currency::core> > &get_p2p_server() { return m_p2p_server; }
    inline currency::core_rpc_server &get_rpc_server() { return m_rpc_server; }
    inline bc_services::bc_offers_service &get_offers_service() { return m_offers_service; }

  private:
    void notify(const std::string &state) const;
    void print_rpc_autodoc();

    bc_services::bc_offers_service m_offers_service;
    currency::core m_currency_core;
    currency::t_currency_protocol_handler<currency::core> m_currency_protocol;
    nodetool::node_server<currency::t_currency_protocol_handler<currency::core> > m_p2p_server;
    currency::core_rpc_server m_rpc_server;
    tools::upnp_launcher m_upnp_launcher;

    std::unique_ptr<notify_func_t> m_notify_func;
#ifdef ENABLE_STRATUM_SUPPORT
    std::unique_ptr<currency::stratum_server> m_stratum_server;
#endif
  };
} // eof namespace daemon_service