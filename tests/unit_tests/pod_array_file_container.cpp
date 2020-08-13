// Copyright (c) 2014-2019 The Virie Project
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include <gtest/gtest.h>

#include "wallet/pod_array_file_container.h"

using namespace epee;
namespace fs = boost::filesystem;

template<typename pod_t>
void test_impl()
{
  std::wstring filename = L"pod_array_file_container_test";

  if (fs::exists(filename))
    fs::remove(filename);

  using container_t = tools::pod_array_file_container<pod_t, 0x123456, 1>;

  container_t pafc;
  ASSERT_TRUE(pafc.open(filename));
  ASSERT_EQ(pafc.size(), 0);
  ASSERT_EQ(fs::file_size(filename), sizeof(typename container_t::header_t));

  std::vector<pod_t> data;
  data.reserve(100);
  for (std::size_t i = 0; i < 100; ++i)
  {
    data.emplace_back();
    auto &item = data.back();
    crypto::generate_random_bytes(sizeof(item), &item);

    pafc.push_back(item);
    ASSERT_EQ(pafc.size(), i + 1);
    ASSERT_EQ(fs::file_size(filename), sizeof(typename container_t::header_t) + (i + 1) * sizeof(pod_t));
  }

  std::size_t counter = 0;
  pafc.read_all([&data, &counter] (const pod_t &item) {
    ASSERT_FALSE(memcmp(&data[counter++], &item, sizeof(item)));
  });

  pafc.close();

  fs::ofstream s;
  s.open(filename, std::ios::binary | std::ios::out | std::ios::app);
  ASSERT_TRUE(s.is_open());
  ASSERT_TRUE(s.good());
  s.write("1", 1);
  ASSERT_TRUE(s.good());
  s.close();

  ASSERT_TRUE(pafc.open(filename));
  ASSERT_EQ(pafc.size(), 100);
  ASSERT_EQ(fs::file_size(filename), sizeof(typename container_t::header_t) + 100 * sizeof(pod_t));

  counter = 0;
  pafc.read_all([&data, &counter] (const pod_t &item) {
    ASSERT_FALSE(memcmp(&data[counter++], &item, sizeof(item)));
  });

  pafc.close();

  s.open(filename, std::ios::binary | std::ios::out | std::ios::trunc);
  ASSERT_TRUE(s.is_open());
  ASSERT_TRUE(s.good());
  s.write("1", 1);
  ASSERT_TRUE(s.good());
  s.close();

  ASSERT_TRUE(pafc.open(filename));
  ASSERT_EQ(pafc.size(), 0);
  ASSERT_EQ(fs::file_size(filename), sizeof(typename container_t::header_t));

  pafc.read_all([&data, &counter] (const pod_t &item) {
    ASSERT_FALSE(memcmp(&data[counter++], &item, sizeof(item)));
  });

  pafc.close();

  s.open(filename, std::ios::binary | std::ios::in | std::ios::trunc);
  ASSERT_TRUE(s.is_open());
  ASSERT_TRUE(s.good());
  s.close();

  ASSERT_TRUE(pafc.open(filename));
  ASSERT_EQ(pafc.size(), 0);
  ASSERT_EQ(fs::file_size(filename), sizeof(typename container_t::header_t));

  pafc.close();

  if (fs::exists(filename))
    fs::remove(filename);
}

TEST(string_tools, pod_array_file_container)
{
#pragma pack(push, 1)
  struct pod_t_1 {
    char some_1[55];
    std::size_t some_2;
    int some_3;
  };
#pragma pack(pop)
#pragma pack(push, 1)
  struct pod_t_2 {
    int some_1;
  };
#pragma pack(pop)
  test_impl<pod_t_1>();
  test_impl<pod_t_2>();
}
