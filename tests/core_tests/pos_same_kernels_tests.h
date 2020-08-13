// Copyright (c) 2014-2020 The Virie Project
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#pragma once
#include "chaingen.h"

struct pos_the_same_kernels_in_different_blocks : public test_chain_unit_base
{
  pos_the_same_kernels_in_different_blocks();

  bool check_block_verification_context(const currency::block_verification_context& bvc, size_t /*event_idx*/, const currency::block& /*blk*/)
  {
    return true;
  }

  bool generate(std::vector<test_event_entry>& events) const;
  bool check(currency::core& c, size_t ev_index, const std::vector<test_event_entry>& events);
};
