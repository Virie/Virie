// Copyright (c) 2014-2020 The Virie Project
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include "difficulty_cache.h"

namespace currency
{

  wide_difficulty_type difficulty_cache::get(bool is_pos, size_t chain_length)
  {
    std::lock_guard<std::mutex> lock(m_lock);
    if (chain_length != m_chain_length)
      m_diffs[is_pos] = 0;
    return m_diffs[is_pos];
  }

  void difficulty_cache::set(wide_difficulty_type diff, bool is_pos, size_t chain_length)
  {
    std::lock_guard<std::mutex> lock(m_lock);
    m_diffs[is_pos] = diff;
    m_chain_length = chain_length;
  }

  void difficulty_cache::reset()
  {
    std::lock_guard<std::mutex> lock(m_lock);
    m_diffs.fill(0);
  }

  void difficulty_cache::reset(bool is_pos)
  {
    std::lock_guard<std::mutex> lock(m_lock);
    m_diffs[is_pos] = 0;
  }

} // eof namespace currency