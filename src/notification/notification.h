// Copyright (c) 2014-2020 The Virie Project
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#pragma once

#include "include_base_utils.h"
#include "currency_core/dispatch_core_events.h"
#include "common/util.h"

#define ID_NOTIFICATION "NOTIFICATION"

namespace notification
{

  class notification : public currency::i_core_event_handler
  {

  public:
    notification(const std::string& cmd): m_cmd(cmd){}
    virtual ~notification()
    {
      //kill sender
    }

  private:
    //--------------------  i_core_event_handler --------------------
    virtual void on_core_event(const std::string& event_name, const currency::core_event_v& e) override;
    virtual void on_complete_events() override;
    virtual void on_clear_events() override;

    const std::string m_cmd;
    tools::exec m_exec{};

    std::atomic<uint64_t> m_skiped{0};
    mutable epee::critical_section m_exec_run;
  };

}

