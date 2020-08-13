// Copyright (c) 2014-2020 The Virie Project
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.
// Copyright (c) 2014-2020 The Virie Project

#include <vector>
#include <list>
#include <string>
#include <iostream>
#include "gtest/gtest.h"

#include "common/container_utils.h"

TEST(get_short_chain_history, characteristics)
{
  const size_t TEST_SIZE = 1000;
  const size_t SOLID_SIZE = 10;
  typedef uint64_t base_type;

  std::vector<uint64_t> bch; // blockchain
  bch.reserve(TEST_SIZE);
  bch.push_back(0);          // genesis must by always

  for (size_t height = 0; bch.size() < TEST_SIZE; bch.push_back(++height))
  {
    std::vector<base_type> ids; // for random access
    ids.reserve(height);

    tools::container_utils::get_short_chain_history<SOLID_SIZE>(bch, ids);

    if (bch.size() < SOLID_SIZE + 1)
      ASSERT_EQ(ids.size(), bch.size());

    for (size_t j = 0; j < SOLID_SIZE + 1/*with genesis*/ && j < ids.size(); j++)
      ASSERT_EQ(ids[j], bch[height - j]) << "[          ] first " << SOLID_SIZE << "must be serial";

    for (size_t j = 1; j < ids.size(); j++)
      ASSERT_GT(ids[j - 1], ids[j]) << "[          ] wrong order: " << ids[j - 1] << ", " << ids[j];

    ASSERT_EQ(0, ids.back()) << "[          ] NO GENESIS";
    ASSERT_LE(ids.size(), bch.size());

    if (bch.size() > SOLID_SIZE + 1)
      ASSERT_GE(ids.size(), SOLID_SIZE + 1);
  }
}

static void get_short_chain_history_oroginal(size_t SOLID_SIZE, const std::vector<uint64_t> & bch, std::list<uint64_t> & ids)
{
  ids.clear();
  size_t i = 0;
  size_t current_multiplier = 1;
  size_t sz = bch.size();
  if(!sz)
    return;
  size_t current_back_offset = 1;
  bool genesis_included = false;
  while(current_back_offset < sz)
  {
    ids.push_back(bch[sz-current_back_offset]);
    if(sz-current_back_offset == 0)
      genesis_included = true;
    if(i < SOLID_SIZE)
    {
      ++current_back_offset;
    }else
    {
      current_back_offset += current_multiplier *= 2;
    }
    ++i;
  }
  if(!genesis_included)
    ids.push_back(bch[0]);
}

TEST(get_short_chain_history, with_oroginal)
{
  const size_t TEST_SIZE = 1000;
  const size_t SOLID_SIZE = 10;

  std::vector<uint64_t> bch; // blockchain
  bch.reserve(TEST_SIZE);
  bch.push_back(0);          // genesis must by always

  std::list<uint64_t> ids_prev;
  for (size_t height = 0; bch.size() < TEST_SIZE; bch.push_back(++height))
  {
    std::list<uint64_t> ids_original;
    get_short_chain_history_oroginal(SOLID_SIZE, bch, ids_original);

    std::list<uint64_t> ids;
    tools::container_utils::get_short_chain_history<SOLID_SIZE>(bch, ids);

    ASSERT_TRUE(ids_original == ids) << "[          ] different on height: " << height;

    ASSERT_TRUE(ids != ids_prev) << "[          ] constated ids on height: " << height;
    ids_prev.swap(ids);
  }

}
