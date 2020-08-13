// Copyright (c) 2014-2020 The Virie Project
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#pragma once 
#include "chaingen.h"
#include "wallet_tests_basic.h"


struct events_test : public wallet_test
{
  events_test();
  bool generate(std::vector<test_event_entry>& events) const;
  bool add_event_handler(currency::core& c, size_t ev_index, const std::vector<test_event_entry>& events);
  bool check_events(currency::core& c, size_t ev_index, const std::vector<test_event_entry>& events);

private:
  std::unique_ptr<currency::i_core_event_handler> m_event_handler;
};
