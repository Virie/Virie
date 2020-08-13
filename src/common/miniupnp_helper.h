// Copyright (c) 2014-2020 The Virie Project
// Copyright (c) 2012-2013 The Boolberry developers
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#pragma once 

#include <thread>
#include <string>
#include <future>
#include <boost/thread.hpp>
#include "include_base_utils.h"
extern "C" {
#include "miniupnpc/miniupnpc.h"
#include "miniupnpc/upnpcommands.h"
#include "miniupnpc/upnperrors.h"
}

#include "misc_language.h"
#include "currency_core/currency_config.h"
#include "version.h"

namespace tools
{
  class miniupnp_helper
  {
  public:
    struct mapping_info
    {
      uint32_t internal_port;
      uint32_t external_port;
    };

    miniupnp_helper() : m_devlist(nullptr), m_urls(AUTO_VAL_INIT(m_urls)), m_data(AUTO_VAL_INIT(m_data)), m_IGD(0)
    {
      m_lanaddr[0] = 0;
    }

    ~miniupnp_helper()
    {
      deinit();
    }

    bool start_regular_mapping(const std::list<mapping_info> &mapping_list, uint32_t period_ms)
    {
      if (!init())
        return false;
      for (auto &mi : mapping_list)
        m_external_ports.push_back(mi.external_port);
      m_mapper_thread = boost::thread([mapping_list, period_ms, this] () {
        run_port_mapping_loop(mapping_list, period_ms);
      });
      return true;
    }

    bool stop_mapping()
    {
      if(m_mapper_thread.joinable())
      {
        m_mapper_thread.interrupt();
        m_mapper_thread.join();
      }

      if(m_IGD == 1)
      {
        do_port_unmapping();
      }
      return true;
    }

  private:
    bool init()
    {
      deinit();

      int error = 0;
      m_devlist = upnpDiscover(2000, nullptr, nullptr, 0, 0, 0, &error);
      if(error)
      {
        LOG_PRINT_L0("Failed to call upnpDiscover");
        return false;
      }
      
      m_IGD = UPNP_GetValidIGD(m_devlist, &m_urls, &m_data, m_lanaddr, sizeof(m_lanaddr));
      if(m_IGD != 1)
      {
        LOG_PRINT_L2("IGD not found");
        return false;
      }
      return true;
    }

    bool deinit()
    {
      stop_mapping();

      if(m_devlist)
      {
        freeUPNPDevlist(m_devlist); 
        m_devlist = nullptr;
      }

      if(m_IGD > 0)
      {
        FreeUPNPUrls(&m_urls);
        m_IGD = 0;
      }
      return true;
    }

    void run_port_mapping_loop(const std::list<mapping_info> &mapping_list, uint32_t period_ms)
    {
      while (true)
      {
        for (auto &mi : mapping_list)
          do_port_mapping(mi.external_port, mi.internal_port);
        boost::this_thread::sleep_for(boost::chrono::milliseconds(period_ms));
      }
    }

    bool do_port_mapping(uint32_t external_port, uint32_t internal_port)
    {
      std::string internal_port_str = std::to_string(internal_port);
      std::string external_port_str = std::to_string(external_port);
      std::string str_desc = CURRENCY_NAME " v" PROJECT_VERSION_LONG;

      int r = UPNP_AddPortMapping(m_urls.controlURL, m_data.first.servicetype,
              external_port_str.c_str(), internal_port_str.c_str(), m_lanaddr, str_desc.c_str(), "TCP", nullptr, "0");

      if(r!=UPNPCOMMAND_SUCCESS)
      {
        LOG_PRINT_L1("AddPortMapping with external_port_str= " << external_port_str << 
                                         ", internal_port_str="  << internal_port_str << 
                                         ", failed with code=" << r << "(" << strupnperror(r) << ")");
      }else
      {
        LOG_PRINT_L0("[upnp] port mapped successful (ext: " << external_port_str << ", int:"  << internal_port_str << ")");
      }
      return true;
    }

    void do_port_unmapping()
    {
      for (auto ep : m_external_ports)
      {
        auto external_port_str = std::to_string(ep);

        int r = UPNP_DeletePortMapping(m_urls.controlURL, m_data.first.servicetype, external_port_str.c_str(), "TCP", nullptr);
        if (r != UPNPCOMMAND_SUCCESS)
          LOG_PRINT_L1("DeletePortMapping with external_port_str= " << external_port_str <<
                                                                    ", failed with code=" << r << "(" << strupnperror(r) << ")");
        else
          LOG_PRINT_L0("[upnp] port unmapped successful (ext: " << external_port_str << ")");
      }
    }

    UPNPDev *m_devlist;
    UPNPUrls m_urls;
    IGDdatas m_data;
    char m_lanaddr[64];
    int m_IGD;
    boost::thread m_mapper_thread;
    std::list<uint32_t> m_external_ports;
  };

  class upnp_launcher
  {
    using mapping_list = std::list<miniupnp_helper::mapping_info>;
  public:
    void register_mapping(const std::string &address, uint32_t internal_port, uint32_t external_port)
    {
      if (address == "127.0.0.1")
        return;
      m_mapping_list.push_back({ internal_port, external_port ? external_port : internal_port });
    }

    bool launch() {
      if (m_mapping_list.empty())
        return false;
      launch_impl(m_mapping_list, m_default_timeout);
      return true;
    }

  private:
    void launch_impl(const mapping_list &ml, uint32_t period_ms)
    {
      m_r = std::async(std::launch::async, [ml, period_ms, this] () -> void {
        m_upnp_helper.reset(new tools::miniupnp_helper());
        m_upnp_helper->start_regular_mapping(ml, period_ms);
        LOG_PRINT_L0("UPnP started OK");
      });
    }
    static const uint32_t m_default_timeout = 20 * 60 * 1000;
    mapping_list m_mapping_list;
    std::unique_ptr<tools::miniupnp_helper> m_upnp_helper;
    std::future<void> m_r;
  };
}

