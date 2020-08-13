// Copyright (c) 2014-2020 The Virie Project
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#pragma once

#include "p2p_protocol_defs.h"

namespace nodetool
{
  template<typename context_t, size_t max_size>
  class connections_history
  {
  public:
    void add(const context_t &context)
    {
      std::lock_guard<std::mutex> lock(m_lock);
      m_history.push_back(context);
      while (m_history.size() > max_size)
        m_history.pop_front();
    }

    template<typename context_cast_t>
    std::list<std::pair<peerid_type, context_cast_t>> get_list()
    {
      std::lock_guard<std::mutex> lock(m_lock);
      std::list<std::pair<peerid_type, context_cast_t>> list;
      for (auto &context : m_history)
        list.emplace_back(context.peer_id, static_cast<context_cast_t>(context));
      return list;
    }

  private:
    std::mutex m_lock;
    std::list<context_t> m_history;
  };
} // eof namespace nodetool