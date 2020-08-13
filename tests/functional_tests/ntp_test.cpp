// Copyright (c) 2014-2020 The Virie Project
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include <time.h>
#include "common/util.h"

// defines from currency_protocol_handler.inl, may be inline it
#define TIME_SYNC_NTP_SERVERS                    { "time.google.com", "0.pool.ntp.org", "1.pool.ntp.org", "2.pool.ntp.org", "3.pool.ntp.org" }
#define TIME_SYNC_NTP_ATTEMPTS_COUNT             3                      // max number of attempts when getting time from NTP server
#define TIME_SYNC_NTP_TO_LOCAL_MAX_DIFFERENCE    (60 * 5)               // max acceptable difference between NTP time and local time (seconds)             3                      // max number of attempts when getting time from NTP server

bool test_localtime()
{
  bool exist_one_good_server = false;
  for(const auto & ntp_host : TIME_SYNC_NTP_SERVERS)
  {
    time_t net_time = 0;
    time_t local_time = 0;
    for (size_t att = 0; att < TIME_SYNC_NTP_ATTEMPTS_COUNT; att++)
    {
      net_time = tools::get_sntp_time(ntp_host);
      if (net_time != 0)
      {
        local_time = time(nullptr);
        break;
      }
    }
    if (net_time == 0)
    {
      LOG_PRINT_RED("Try all attempts(" << TIME_SYNC_NTP_ATTEMPTS_COUNT << " don't get net_time from : " << ntp_host, LOG_LEVEL_0);
      continue;
    }
    if (abs(local_time - net_time) < TIME_SYNC_NTP_TO_LOCAL_MAX_DIFFERENCE)
    {
      exist_one_good_server = true;
      LOG_PRINT_GREEN("Server: " << ntp_host << " has time: " << net_time << ", local time: " << local_time, LOG_LEVEL_0);
    }
    else
    {
      LOG_PRINT_RED("Server: " << ntp_host << " has time: " << net_time << ", local time: " << local_time << ", very big differens, more then: " << TIME_SYNC_NTP_TO_LOCAL_MAX_DIFFERENCE, LOG_LEVEL_0);
    }
  }
  return exist_one_good_server;
}



bool ntp_test()
{
  LOG_PRINT_L0("Starting ntp tests...");
  if(!test_localtime())
  {
    LOG_ERROR("Failed test_localtime()");
    return false;
  }

  return true;
}
