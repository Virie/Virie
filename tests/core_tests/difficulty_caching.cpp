#include "chaingen.h"
#include "difficulty_caching.h"

gen_difficulty_caching::gen_difficulty_caching()
{
  REGISTER_CALLBACK("check_diff", gen_difficulty_caching::check_diff)
  REGISTER_CALLBACK("check_diff_after_switch", gen_difficulty_caching::check_diff_after_switch)
}

bool gen_difficulty_caching::generate(std::vector<test_event_entry>& events)
{
  uint64_t ts_start = 1450000000;

  GENERATE_ACCOUNT(miner_account)

  MAKE_GENESIS_BLOCK(events, blk_0, miner_account, ts_start)
  MAKE_NEXT_BLOCK(events, blk_1, blk_0, miner_account)
  MAKE_NEXT_BLOCK(events, blk_2, blk_1, miner_account)
  MAKE_NEXT_BLOCK(events, blk_3, blk_0, miner_account)

  m_last_alt_block_hash = get_block_hash(blk_3);

  DO_CALLBACK(events, "check_diff")

  MAKE_NEXT_BLOCK(events, blk_4, blk_3, miner_account)
  MAKE_NEXT_BLOCK(events, blk_5, blk_4, miner_account)
  MAKE_NEXT_BLOCK(events, blk_6, blk_5, miner_account)
  MAKE_NEXT_BLOCK(events, blk_7, blk_6, miner_account)
  MAKE_NEXT_BLOCK(events, blk_8, blk_7, miner_account)
  MAKE_NEXT_BLOCK(events, blk_9, blk_8, miner_account)

  DO_CALLBACK(events, "check_diff_after_switch")

  return true;
}

bool gen_difficulty_caching::check_diff(currency::core& c, size_t ev_index, const std::vector<test_event_entry>& events)
{
  currency::blockchain_storage::alt_chain_type alt_chain;
  currency::blockchain_storage::alt_chain_container alt_chains;
  auto &bs = c.get_blockchain_storage();
  bs.get_alternative_chains(alt_chains);
  auto alt_it = alt_chains.find(m_last_alt_block_hash);
  while (alt_it != alt_chains.end())
  {
    alt_chain.push_front(alt_it);
    alt_it = alt_chains.find(alt_it->second.bl.prev_id);
  }
  m_alt_diff = bs.get_next_diff_conditional2(false, alt_chain, alt_chain.front()->second.height, alt_chain.front()->second);
  m_diff = bs.get_cached_next_difficulty(false);

  std::list<currency::block> blocks;
  bool r = c.get_blocks(0, 10000, blocks);
  CHECK_TEST_CONDITION(r);
  m_last_alt_block_hash = get_block_hash(blocks.back());

  return true;
}

bool gen_difficulty_caching::check_diff_after_switch(currency::core& c, size_t ev_index, const std::vector<test_event_entry>& events)
{
  currency::blockchain_storage::alt_chain_type alt_chain;
  currency::blockchain_storage::alt_chain_container alt_chains;
  auto &bs = c.get_blockchain_storage();
  bs.get_alternative_chains(alt_chains);
  auto alt_it = alt_chains.find(m_last_alt_block_hash);
  while (alt_it != alt_chains.end())
  {
    alt_chain.push_front(alt_it);
    alt_it = alt_chains.find(alt_it->second.bl.prev_id);
  }
  CHECK_EQ(m_diff, bs.get_next_diff_conditional2(false, alt_chain, alt_chain.front()->second.height, alt_chain.front()->second));
  CHECK_NOT_EQ(m_diff, bs.get_cached_next_difficulty(false));
  return true;
}