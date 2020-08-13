// Copyright (c) 2014-2020 The Virie Project
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include <thread>
#include "gtest/gtest.h"

#include <syncobj.h>
#include <misc_log_ex.h>

bool test_syncobj()
{
  std::recursive_mutex lock;
  std::atomic<bool> to_stop(false);
  auto t = std::thread([&lock, &to_stop] ()
    {
      CRITICAL_REGION_TRY_BEGIN(lock)
      while (!to_stop);
      CRITICAL_REGION_END()
    }
  );
  std::this_thread::sleep_for(std::chrono::milliseconds(500));
  CRITICAL_REGION_TRY_BEGIN(lock)
  return false;
  CRITICAL_REGION_END()
  to_stop = true;
  if (t.joinable())
    t.join();
  CRITICAL_REGION_TRY_BEGIN_VAR(lock, cr_1)
  CRITICAL_REGION_TRY_BEGIN_VAR(lock, cr_2)
  return true;
  CRITICAL_REGION_END()
  CRITICAL_REGION_END()
  return false;
}

TEST(test_syncobj, test_syncobj)
{
  bool r = test_syncobj();
  ASSERT_TRUE(r);
}