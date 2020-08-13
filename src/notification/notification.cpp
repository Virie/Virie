// Copyright (c) 2014-2020 The Virie Project
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include <iostream>
#include <vector>
#include <string>
#include "notification.h"


namespace notification
{


void notification::on_core_event(const std::string& event_name, const currency::core_event_v& e)
TRY_ENTRY()
{
  if (CORE_EVENT_BLOCK_ADDED != event_name)
    return;
  m_skiped++;
  if (m_cmd.empty())
    return;
  {
    CRITICAL_REGION_TRY_BEGIN(m_exec_run);
    const uint64_t local_skiped = m_skiped;
    const std::vector<std::string> arg {{std::to_string(local_skiped)}};
    bool ret = m_exec.run(m_cmd, arg);
    if (!ret)
    {
      LOG_PRINT_RED_L0("exec.run(" << m_cmd << ") not started");
    }
    else
    {
      m_skiped -= local_skiped;
    }
    CRITICAL_REGION_END();
  }
}
CATCH_ENTRY("MainWindow::on_core_event", )



void notification::on_complete_events(){}
void notification::on_clear_events(){}

}
