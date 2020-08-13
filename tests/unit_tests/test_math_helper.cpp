// Copyright (c) 2012-2013 The Cryptonote developers
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include "gtest/gtest.h"


//#include "string_tools.h"
#include "include_base_utils.h"
using namespace epee;
#include "syncobj.h"
#include "math_helper.h"

using namespace epee::math_helper;

TEST(math_helper_test, math_helper_check_average)
{
  struct
  {
    uint64_t val;
    double avg;
  } source[] =
  {
    {1, 1.0},
    {0, 0.5}
  };

  const double ACCURENCY = 0.0001;
  average<uint64_t,2> a;

  for (const auto & e: source)
  {
    double res = a.update(e.val);
    double delta = std::abs(res - e.avg);
    ASSERT_TRUE(delta < ACCURENCY);
  }

}
