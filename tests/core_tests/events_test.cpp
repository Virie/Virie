// Copyright (c) 2014-2020 The Virie Project
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include "chaingen.h"
#include "events_test.h"
#include "offers_helper.h"
#include "currency_core/offers_services_helpers.h"
#include "currency_core/bc_offers_service.h"

using namespace epee;
using namespace currency;

struct test_event_handler : public i_core_event_handler
{
  void on_core_event(const std::string& event_name, const core_event_v& e) override
  {
    if (event_name == CORE_EVENT_ADD_OFFER)
      is_offer_added = true;
  }

  bool is_offer_added = false;
};

events_test::events_test()
{
  REGISTER_CALLBACK_METHOD(events_test, add_event_handler)
  REGISTER_CALLBACK_METHOD(events_test, check_events)
}

bool events_test::generate(std::vector<test_event_entry>& events) const
{
  bool r = false;
  m_accounts.resize(TOTAL_ACCS_COUNT);
  account_base& miner_acc = m_accounts[MINER_ACC_IDX]; miner_acc.generate();
  account_base& alice_acc = m_accounts[ALICE_ACC_IDX]; alice_acc.generate();
  account_base& bob_acc   = m_accounts[BOB_ACC_IDX];   bob_acc.generate();

  MAKE_GENESIS_BLOCK(events, blk_0, miner_acc, test_core_time::get_time())
  REWIND_BLOCKS_N(events, blk_0r, blk_0, miner_acc, CURRENCY_MINED_MONEY_UNLOCK_WINDOW + 2)

  transaction tx_a = AUTO_VAL_INIT(tx_a);
  r = construct_tx_with_many_outputs(events, blk_0r, miner_acc.get_keys(), alice_acc.get_public_address(), TESTS_DEFAULT_FEE * 100, 10, TESTS_DEFAULT_FEE, tx_a);
  CHECK_AND_ASSERT_MES(r, false, "construct_tx_with_many_outputs failed");
  events.push_back(tx_a);
  transaction tx_b = AUTO_VAL_INIT(tx_b);
  r = construct_tx_with_many_outputs(events, blk_0r, miner_acc.get_keys(), bob_acc.get_public_address(), TESTS_DEFAULT_FEE * 100, 10, TESTS_DEFAULT_FEE, tx_b);
  CHECK_AND_ASSERT_MES(r, false, "construct_tx_with_many_outputs failed");
  events.push_back(tx_b);
  MAKE_NEXT_BLOCK_TX_LIST(events, blk_1, blk_0r, miner_acc, std::list<transaction>({ tx_a, tx_b }))
  REWIND_BLOCKS_N(events, blk_1r, blk_1, miner_acc, WALLET_DEFAULT_TX_SPENDABLE_AGE)

  DO_CALLBACK(events, "add_event_handler")

  bc_services::offer_details od = AUTO_VAL_INIT(od);
  fill_test_offer(od);
  od.comment = "new";
  std::vector<attachment_v> attachments;
  bc_services::put_offer_into_attachment(od, attachments);
  MAKE_TX_ATTACH(events, tx_1, alice_acc, alice_acc, TESTS_DEFAULT_FEE, blk_1r, attachments);
  MAKE_NEXT_BLOCK_TX1(events, blk_2, blk_1r, miner_acc, tx_1);

  DO_CALLBACK(events, "check_events")

  return true;
}

bool events_test::add_event_handler(currency::core& c, size_t ev_index, const std::vector<test_event_entry>& events)
{
  m_event_handler.reset(new test_event_handler);
  c.get_blockchain_storage().add_event_handler("test_event_handler_id", m_event_handler.get());
  return true;
}

bool events_test::check_events(currency::core& c, size_t ev_index, const std::vector<test_event_entry>& events)
{
  bool is_offer_added = static_cast<test_event_handler *>(m_event_handler.get())->is_offer_added;
  CHECK_AND_ASSERT_MES(is_offer_added, false, "check_events failed");
  return true;
}