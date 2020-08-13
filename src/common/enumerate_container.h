// Copyright (c) 2014-2020 The Virie Project
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#pragma once

namespace common
{

  namespace detail
  {

    template<typename iterator_t, typename cb_t>
    void enumerate_container(iterator_t begin, iterator_t end, cb_t cb)
    {
      for (auto it = begin; it != end; ++it)
        if (!cb(*it))
          return;
    }

  } // eof namespace detail

  template<typename container_t, typename cb_t>
  void enumerate_container(const container_t &c, cb_t cb, bool forward)
  {
    if (forward)
      detail::enumerate_container(c.begin(), c.end(), std::forward<cb_t>(cb));
    else
      detail::enumerate_container(c.rbegin(), c.rend(), std::forward<cb_t>(cb));
  }

  template<typename container_t, typename cb_t>
  void enumerate_container(const container_t &c, cb_t cb)
  {
    detail::enumerate_container(c.begin(), c.end(), std::forward<cb_t>(cb));
  }

} // eof namespace common
