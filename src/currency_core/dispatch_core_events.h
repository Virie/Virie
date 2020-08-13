// Copyright (c) 2014-2020 The Virie Project
// Copyright (c) 2014-2015 The Boolberry developers
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#pragma once

#include "currency_basic.h"
#include "offers_service_basics.h" //TODO: point to refactoring 
#include "rpc/core_rpc_server_commands_defs.h"
//#include "serialization/keyvalue_serialization_boost_variant.h"

#define CORE_EVENT_ADD_OFFER         "CORE_EVENT_ADD_OFFER"
#define CORE_EVENT_REMOVE_OFFER      "CORE_EVENT_REMOVE_OFFER"
#define CORE_EVENT_UPDATE_OFFER      "CORE_EVENT_UPDATE_OFFER"
#define CORE_EVENT_ADD_ALIAS         "CORE_EVENT_ADD_ALIAS"
#define CORE_EVENT_UPDATE_ALIAS      "CORE_EVENT_UPDATE_ALIAS"
#define CORE_EVENT_BLOCK_ADDED       "CORE_EVENT_BLOCK_ADDED"


namespace currency
{
  typedef boost::variant<bc_services::offer_details_ex, bc_services::update_offer_details, alias_rpc_details, update_alias_rpc_details, void_struct> core_event_v;

  struct core_event
  {
    std::string method;
    core_event_v details;

    BEGIN_KV_SERIALIZE_MAP()
      KV_SERIALIZE(method)
      //KV_SERIALIZE(details)
    END_KV_SERIALIZE_MAP()
  };



  /************************************************************************/
  /*                                                                      */
  /************************************************************************/
  struct i_core_event_handler
  {
    virtual ~i_core_event_handler() = default;
    virtual void on_core_event(const std::string& event_name, const core_event_v& e){}
    virtual void on_complete_events(){}
    virtual void on_clear_events(){}
  };

  /************************************************************************/
  /*                                                                      */
  /************************************************************************/
  class core_event_handlers : public i_core_event_handler
  {
  public:

    virtual ~core_event_handlers()
    {
      CRITICAL_REGION_LOCAL(m_handlers_loc);
      m_handlers.clear();
    }

    bool add(const std::string& id, i_core_event_handler* phandler)
    {
      CRITICAL_REGION_LOCAL(m_handlers_loc);
      if (phandler == nullptr || id.empty())
      {
        LOG_ERROR("Event handler" << (id.empty()? " error: id.empty()" : "") << (nullptr == phandler ? " error: phandler == nullptr" : ""));
        return false;
      }
      if (m_handlers.count(id) != 0)
      {
        LOG_ERROR("Event handler with id " << id << " already added");
        return false;
      }
      LOG_PRINT_L2("core_event_handlers: added event handler id: " << id);
      m_handlers[id] = phandler;
      return true;
    }

    bool del(const std::string& id)
    {
      CRITICAL_REGION_LOCAL(m_handlers_loc);
      auto i = m_handlers.find(id);
      if (i == m_handlers.end())
      {
        LOG_ERROR("Event handler with id " << id << " don't exist");
        return false;
      }
      LOG_PRINT_L2("core_event_handlers: deleted event handler id: " << id);
      m_handlers.erase(i);
      return true;
    }

  private:

    template<class t_event>
    void for_each_handler(t_event event)
    {
      CRITICAL_REGION_LOCAL(m_handlers_loc);
      for(auto& eh: m_handlers)
      {
        auto & ehs = eh.second;
        if (ehs != nullptr)
          event(ehs);
      }
    }

  public:
    //--------------------  i_core_event_handler --------------------
    virtual void on_core_event(const std::string& event_name, const core_event_v& e) override
    {
      for_each_handler([&](i_core_event_handler* ph){ ph->on_core_event(event_name, e);});
    }
    virtual void on_complete_events() override
    {
      for_each_handler([](i_core_event_handler* ph){ ph->on_complete_events();});
    }
    virtual void on_clear_events() override
    {
      for_each_handler([](i_core_event_handler* ph){ ph->on_clear_events();});
    }
  private:
    std::map<std::string, i_core_event_handler*> m_handlers;
    mutable epee::critical_section m_handlers_loc;

  };


}
