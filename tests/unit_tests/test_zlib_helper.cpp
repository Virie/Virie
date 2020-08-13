// Copyright (c) 2014-2020 The Virie Project
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include <gtest/gtest.h>

#include <include_base_utils.h>
#include <epee/include/zlib_helper.h>
extern "C"
{
#include <crypto/random.h>
}

namespace
{
  void test_impl(const std::string &data)
  {
    std::string result(data);
    ASSERT_TRUE(epee::zlib_helper::pack(result));
    if (!data.empty())
      ASSERT_NE(data, result);
    ASSERT_TRUE(epee::zlib_helper::unpack(result)) << "[info      ] data size: " << data.size();
    ASSERT_EQ(result.size(), data.size());
    ASSERT_EQ(data, result);
  }
}

TEST(zlib_helper, zlib_helper)
{
  std::string data;
  ASSERT_NO_FATAL_FAILURE(test_impl(data)); // empty

  for (size_t i = 1; i < 2048; ++i)
  {
    std::string data(i, ' ');
    ASSERT_NO_FATAL_FAILURE(test_impl(data)); // good compressible
    generate_random_bytes(i, &data[0]);
    ASSERT_NO_FATAL_FAILURE(test_impl(data));
  }

  // big sizes
  data.clear();
  for (size_t i = 1; i <= 5; ++i)
    for (size_t times = 0, mb = i * 1024 * 1024; times < 2; ++times)
    {
      std::string data2;
      data2.resize(mb);
      generate_random_bytes(mb, &data2[0]);
      ASSERT_NE(data, data2);
      data2.swap(data);
      ASSERT_NO_FATAL_FAILURE(test_impl(data));
    }
}
