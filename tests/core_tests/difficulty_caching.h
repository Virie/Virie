#pragma once
#include "chaingen.h"


class gen_difficulty_caching : public test_chain_unit_base
{
public:
  gen_difficulty_caching();

  bool generate(std::vector<test_event_entry>& events);

  bool check_diff(currency::core& c, size_t ev_index, const std::vector<test_event_entry>& events);
  bool check_diff_after_switch(currency::core& c, size_t ev_index, const std::vector<test_event_entry>& events);

private:
  crypto::hash m_last_alt_block_hash;
  currency::wide_difficulty_type m_diff, m_alt_diff;
};