// Copyright (c) 2014-2020 The Virie Project
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include "bc_daemon_service.h"

namespace daemon_service
{
  bc_daemon_service::bc_daemon_service() : m_offers_service(nullptr),
                                           m_currency_core(&m_currency_protocol),
                                           m_currency_protocol(m_currency_core, &m_p2p_server),
                                           m_p2p_server(m_currency_protocol),
                                           m_rpc_server(m_currency_core, m_p2p_server, m_offers_service) {}

  namespace
  {
    const command_line::arg_descriptor<bool> arg_disable_upnp =                     { "disable-upnp", "Disable UPnP (enhances local network privacy)", false, command_line::flag_t::not_use_default };
    const command_line::arg_descriptor<bool> arg_disable_stop_if_time_out_of_sync = { "disable-stop-if-time-out-of-sync", "Do not stop the daemon if serious time synchronization problem is detected", false, command_line::flag_t::not_use_default };
    const command_line::arg_descriptor<bool> arg_disable_stop_on_low_free_space   = { "disable-stop-on-low-free-space", "Do not stop the daemon if free space at data dir is critically low", false, command_line::flag_t::not_use_default };
    const command_line::arg_descriptor<bool> arg_show_rpc_autodoc =                 { "show_rpc_autodoc", "Display rpc auto-generated documentation template" };
    const command_line::arg_descriptor<uint32_t> arg_rpc_external_port = {"rpc-external-port", "External port for rpc protocol (if port forwarding used with NAT)", 0};
#ifdef ENABLE_STRATUM_SUPPORT
    const command_line::arg_descriptor<uint32_t> arg_stratum_external_port = {"stratum-external-port", "External port for stratum server (if port forwarding used with NAT)", 0};
#endif
  }

  void bc_daemon_service::init_options(boost::program_options::options_description& desc)
  {
    currency::core::init_options(desc);
    currency::core_rpc_server::init_options(desc);
    nodetool::node_server<currency::t_currency_protocol_handler<currency::core> >::init_options(desc);
#ifdef USE_OPENCL
    currency::gpu_miner::init_options(desc);
#else
    currency::miner::init_options(desc);
#endif
    bc_services::bc_offers_service::init_options(desc);
#ifdef ENABLE_STRATUM_SUPPORT
    currency::stratum_server::init_options(desc);
#endif
    command_line::add_arg(desc, arg_disable_upnp);
    command_line::add_arg(desc, arg_disable_stop_if_time_out_of_sync);
    command_line::add_arg(desc, arg_disable_stop_on_low_free_space);
    command_line::add_arg(desc, arg_show_rpc_autodoc);
    command_line::add_arg(desc, arg_rpc_external_port);
#ifdef ENABLE_STRATUM_SUPPORT
    command_line::add_arg(desc, arg_stratum_external_port);
#endif
  }

  bool bc_daemon_service::init(const boost::program_options::variables_map &vm)
  {
    if (command_line::has_arg(vm, arg_disable_stop_if_time_out_of_sync) &&
        command_line::get_arg(vm, arg_disable_stop_if_time_out_of_sync))
      m_currency_core.get_ref_stop_senders().set_ignore_time_sync(true);
    if (command_line::has_arg(vm, arg_disable_stop_on_low_free_space) &&
        command_line::get_arg(vm, arg_disable_stop_on_low_free_space))
      m_currency_core.get_ref_stop_senders().set_ignore_free_space(true);

    if (command_line::has_arg(vm, arg_show_rpc_autodoc) && command_line::get_arg(vm, arg_show_rpc_autodoc))
      print_rpc_autodoc();

    auto& bcs = m_currency_core.get_blockchain_storage();

    bcs.get_attachment_services_manager().add_service(&m_offers_service);

    currency::checkpoints checkpoints;
    bool r = create_checkpoints(checkpoints);
    CHECK_AND_ASSERT_MES(r, false, "Failed to initialize checkpoints");
    r = m_currency_core.set_checkpoints(std::move(checkpoints));
    CHECK_AND_ASSERT_MES(r, false, "Failed to initialize core: set_checkpoints failed");

    notify("Initializing core");
    r = m_currency_core.init(vm);
    CHECK_AND_ASSERT_MES(r, false, "Failed to initialize core");
    LOG_PRINT_L0("Core initialized OK");

    if (!m_offers_service.is_disabled() && bcs.get_current_blockchain_size() > 1 &&
        bcs.get_top_block_id() != m_offers_service.get_last_seen_block_id())
    {
      r = resync_market(bcs, m_offers_service);
      CHECK_AND_ASSERT_MES(r, false, "Failed to initialize core: resync_market");
      //clear events that came after resync market
      auto *ph = bcs.get_event_handler();
      if (ph) ph->on_clear_events();
    }

    notify("Initializing P2P server");
    r = m_p2p_server.init(vm);
    CHECK_AND_ASSERT_MES(r, false, "Failed to initialize P2P server");
    LOG_PRINT_L0("P2P server initialized OK on port: " << m_p2p_server.get_this_peer_port());

    notify("Initializing currency protocol");
    r = m_currency_protocol.init(vm);
    CHECK_AND_ASSERT_MES(r, false, "Failed to initialize currency protocol");
    LOG_PRINT_L0("Currency protocol initialized OK");

    notify("Initializing core RPC server");
    r = m_rpc_server.init(vm);
    CHECK_AND_ASSERT_MES(r, false, "Failed to initialize core RPC server");
    LOG_PRINT_L0("Core RPC server initialized OK on port: " << m_rpc_server.get_binded_port());

#ifdef ENABLE_STRATUM_SUPPORT
    bool stratum_enabled = currency::stratum_server::should_start(vm);
    if (stratum_enabled)
    {
      m_stratum_server.reset(new currency::stratum_server(&m_currency_core));
      notify("Initializing stratum server");
      r = m_stratum_server->init(vm);
      CHECK_AND_ASSERT_MES(r, false, "Failed to initialize stratum server");
      LOG_PRINT_L0("Stratum server initialized OK");
      if (!command_line::get_arg(vm, arg_disable_upnp))
        m_upnp_launcher.register_mapping(m_stratum_server->get_binded_address(), m_stratum_server->get_binded_port(),
          command_line::get_arg(vm, arg_stratum_external_port));
    }
#endif

    if (!command_line::get_arg(vm, arg_disable_upnp))
    {
      m_upnp_launcher.register_mapping(m_p2p_server.get_binded_address(), m_p2p_server.get_this_peer_port(),
        m_p2p_server.get_external_peer_port());
      m_upnp_launcher.register_mapping(m_rpc_server.get_binded_address(), m_rpc_server.get_binded_port(),
        command_line::get_arg(vm, arg_rpc_external_port));
      if (m_upnp_launcher.launch())
        notify("Starting UPnP");
    }

    return true;
  }

  bool bc_daemon_service::deinit()
  {
#ifdef ENABLE_STRATUM_SUPPORT
    if (m_stratum_server)
    {
      notify("Deinitializing Stratum server");
      m_stratum_server.reset();
    }
#endif

    notify("Deinitializing core RPC server");
    m_rpc_server.deinit();

    notify("Deinitializing currency protocol");
    m_currency_protocol.deinit();

    notify("Deinitializing P2P server");
    m_p2p_server.deinit();

    m_currency_core.set_currency_protocol(nullptr);
    m_currency_protocol.set_p2p_endpoint(nullptr);

    m_offers_service.set_last_seen_block_id(m_currency_core.get_blockchain_storage().get_top_block_id());

    notify("Deinitializing market");
    static_cast<currency::i_bc_service&>(m_offers_service).deinit();

    notify("Deinitializing core");
    m_currency_core.deinit();

    return true;
  }

  bool bc_daemon_service::start(bool sync)
  {
    notify("Starting core RPC server");
    bool r = m_rpc_server.run(2, false);
    CHECK_AND_ASSERT_MES(r, false, "Failed to starting core RPC server");
    LOG_PRINT_L0("Core RPC server started OK");

#ifdef ENABLE_STRATUM_SUPPORT
    if (m_stratum_server)
    {
      r = m_stratum_server->run(false);
      CHECK_AND_ASSERT_MES(r, false, "Failed to starting stratum server");
      LOG_PRINT_L0("Stratum server started OK");
    }
#endif

    notify("Starting P2P server");
    r = m_p2p_server.run(sync);
    CHECK_AND_ASSERT_MES(r, false, "Failed to starting P2P server");

    return true;
  }

  bool bc_daemon_service::stop()
  {
#ifdef ENABLE_STRATUM_SUPPORT
    if (m_stratum_server)
    {
      notify("Stopping stratum server");
      m_stratum_server->send_stop_signal();
      m_stratum_server->timed_wait_server_stop(1000);
    }
#endif

    notify("Stopping P2P server");
    m_p2p_server.send_stop_signal();
    m_p2p_server.timed_wait_server_stop(60 * 1000);

    notify("Stopping core RPC server");
    m_rpc_server.send_stop_signal();
    m_rpc_server.timed_wait_server_stop(5000);

    return true;
  }

  void bc_daemon_service::set_notify_func(notify_func_t &&notify_func)
  {
    m_notify_func.reset(new notify_func_t(std::move(notify_func)));
  }

  void bc_daemon_service::notify(const std::string &state) const
  {
    LOG_PRINT_L0(state << "...");
    if (m_notify_func)
      (*m_notify_func)(state);
  }

  void bc_daemon_service::print_rpc_autodoc()
  {
    LOG_PRINT_L0("Dumping RPC auto-generated documents!");
    epee::net_utils::http::http_request_info query_info;
    epee::net_utils::http::http_response_info response_info;
    epee::net_utils::connection_context_base conn_context;
    std::string generate_reference = std::string("RPC_COMMANDS_LIST:\n");
    bool call_found = false;
    m_rpc_server.handle_http_request_map(query_info, response_info, conn_context, call_found, generate_reference);
    std::string json_rpc_reference;
    query_info.m_URI = JSON_RPC_REFERENCE_MARKER;
    query_info.m_body = "{\"jsonrpc\": \"2.0\", \"method\": \"nonexisting_method\", \"params\": {}},";
    m_rpc_server.handle_http_request_map(query_info, response_info, conn_context, call_found, json_rpc_reference);
    LOG_PRINT_L0(generate_reference << ENDL << "----------------------------------------" << ENDL << json_rpc_reference);
  }
} // eof namespace daemon_service
