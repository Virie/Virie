// Copyright (c) 2014-2020 The Virie Project
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#pragma once

namespace tools
{
namespace container_utils
{

template <size_t SOLID_SIZE, typename T_BCH, typename T_RES, typename T_CONVERTER>
void get_short_chain_history(const T_BCH & bch, T_RES& ids, T_CONVERTER converter_routine)
{
  ids.clear();
  const uint64_t sz = bch.size();
  if (sz == 0)
    return;
  for (uint64_t back_offset = 1, multiplier = 1; back_offset < sz; back_offset += multiplier)
  {
    ids.push_back(converter_routine(bch[sz - back_offset]));
    if (back_offset > SOLID_SIZE)
      multiplier *= 2;
  }
  ids.push_back(converter_routine(bch[0]));
}

template <size_t SOLID_SIZE, typename T_BCH, typename T_RES>
void get_short_chain_history(const T_BCH & bch, T_RES& ids)
{
  get_short_chain_history<SOLID_SIZE>(bch, ids, [](const typename T_RES::value_type & e) {return e;});
}


} // namespace container_utils
} // namespace tools
