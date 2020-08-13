// Copyright (c) 2014-2020 The Virie Project
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include "chaingen.h"
#include "offers_tests_common.h"
#include "pos_same_kernels_tests.h"

using namespace epee;
using namespace currency;


pos_the_same_kernels_in_different_blocks::pos_the_same_kernels_in_different_blocks()
{
  REGISTER_CALLBACK_METHOD(pos_the_same_kernels_in_different_blocks, check);
}

bool pos_the_same_kernels_in_different_blocks::generate(std::vector<test_event_entry>& events) const
{
  uint64_t ts_start = 1338224400;
  std::list<currency::account_base> coin_stake_sources;

  GENERATE_ACCOUNT(miner_account);

  coin_stake_sources.push_back(miner_account);
  MAKE_GENESIS_BLOCK(events, blk_0, miner_account, ts_start);

  MAKE_NEXT_BLOCK(events, blk_1, blk_0, miner_account);
  REWIND_BLOCKS_N_WITH_TIME(events, blk_1r, blk_1, miner_account, CURRENCY_MINED_MONEY_UNLOCK_WINDOW);

  MAKE_NEXT_POS_BLOCK(events, blk_2, blk_1r, miner_account, coin_stake_sources);

  MAKE_NEXT_POS_BLOCK(events, blk_3, blk_1r, miner_account, coin_stake_sources);
  DO_CALLBACK(events, "check");

  return true;
}

bool pos_the_same_kernels_in_different_blocks::check(currency::core& c, size_t /*ev_index*/, const std::vector<test_event_entry>& /*events*/)
{
  std::list<currency::block> altblocks;
  c.get_alternative_blocks(altblocks);

  std::list<currency::block> blocks;
  c.get_blocks(0, c.get_current_blockchain_size(), blocks);

  auto it_res = std::find_first_of(altblocks.begin(), altblocks.end(), blocks.begin(), blocks.end(), [](const currency::block & a_bl, const currency::block & bl){
    return currency::get_block_hash(a_bl) == currency::get_block_hash(bl);
  });

  CHECK_AND_ASSERT_MES(it_res == altblocks.end(), false, "PoS block added into mainchain and altchain");
  return true;
}
