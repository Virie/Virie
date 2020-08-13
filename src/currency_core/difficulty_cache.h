// Copyright (c) 2014-2020 The Virie Project
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#pragma once

#include <unordered_map>
#include <mutex>
#include "difficulty.h"
#include "currency_config.h"

namespace currency
{

  class difficulty_cache
  {
  public:
    wide_difficulty_type get(bool is_pos, size_t chain_length);
    void set(wide_difficulty_type diff, bool is_pos, size_t chain_length);
    void reset();
    void reset(bool is_pos);

  private:
    std::array<wide_difficulty_type, 2> m_diffs { { 0, 0 } };
    size_t m_chain_length = 0;
    mutable std::mutex m_lock;
  };

} // eof namespace currency