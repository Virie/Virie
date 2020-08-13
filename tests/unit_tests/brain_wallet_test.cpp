// Copyright (c) 2012-2013 The Cryptonote developers
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include "gtest/gtest.h"

#include "include_base_utils.h"
#include "currency_core/account.h"
#include "common/mnemonic-encoding.h"
#include "epee/include/string_tools.h"
#include <iomanip>
#include <vector>

TEST(brain_wallet, store_restore_test) 
{
  //test 25 words phrase
  for (size_t i = 0; i != 100; i++)
  {
    currency::account_base acc;
    acc.generate();
    auto restore_data = acc.get_restore_braindata();

    uint64_t timestamp = (acc.get_createtime() - WALLET_BRAIN_DATE_OFFSET) / WALLET_BRAIN_DATE_QUANTUM;
    uint64_t awaiting_timestamp = timestamp * WALLET_BRAIN_DATE_QUANTUM + WALLET_BRAIN_DATE_OFFSET;

    currency::account_base acc2;
    bool r = acc2.restore_keys_from_braindata(restore_data);
    ASSERT_TRUE(r) << "test 25 words phrase test, restore keys failed" << std::endl;

    ASSERT_EQ(acc2.get_keys(), acc.get_keys()) << "test 25 words phrase test, keys mismatch" << std::endl;
    ASSERT_EQ(acc2.get_createtime(), awaiting_timestamp) << "test 25 words phrase test, timestamp mismatch" << std::endl;
  }
  //test 24 words phrase
  for (size_t i = 0; i != 100; i++)
  {
    currency::account_base acc;
    acc.generate();
    auto restore_data = acc.get_restore_braindata();

    auto index = restore_data.find_last_of(' ');
    restore_data.erase(index);

    currency::account_base acc2;
    bool r = acc2.restore_keys_from_braindata(restore_data);
    ASSERT_TRUE(r) << "test 24 words phrase test, restore keys failed" << std::endl;

    ASSERT_EQ(acc2.get_keys(), acc.get_keys()) << "test 24 words phrase test, keys mismatch" << std::endl;
  }

  for (size_t i = 0; i != 100; i++)
  {
    currency::account_base acc;
    acc.generate();
    auto &keys = acc.get_keys();
    auto restore_data = epee::string_tools::pod_to_hex(keys.m_spend_secret_key);

    currency::account_base acc2;
    bool r = acc2.restore_keys_from_braindata(restore_data);
    ASSERT_TRUE(r) << "spend key restore test, restore keys failed" << std::endl;

    ASSERT_EQ(acc2.get_keys(), acc.get_keys()) << "spend key restore test, keys mismatch" << std::endl;
  }

  for (size_t i = 0; i != 100; i++)
  {
    currency::account_base acc;
    acc.generate();
    auto &keys = acc.get_keys();
    auto restore_data = epee::string_tools::pod_to_hex(keys.m_spend_secret_key);

    time_t timestamp = acc.get_createtime();
    tm * time = localtime(&timestamp);
    std::stringstream date;
    date << time->tm_year + 1900 << ":" << time->tm_mon + 1 << ":" << time->tm_mday;
    restore_data.append(" " + date.str());

    tm date_time = { 0 };
    date_time.tm_year = time->tm_year;
    date_time.tm_mon = time->tm_mon;
    date_time.tm_mday = time->tm_mday;
    time_t awaiting_create_time = mktime(&date_time);

    currency::account_base acc2;
    bool r = acc2.restore_keys_from_braindata(restore_data);
    ASSERT_TRUE(r) << "spend key restore with timestamp test, restore keys failed" << std::endl;

    ASSERT_EQ(acc2.get_keys(), acc.get_keys()) << "spend key restore with timestamp test, keys mismatch" << std::endl;
    ASSERT_EQ(acc2.get_createtime(), awaiting_create_time) << "spend key restore with timestamp test, timestamps mismatch" << std::endl;
  }

  std::string good_phrase = "petal girl stare chocolate best rhythm pressure bag shimmer rhyme deserve belief victim heaven favorite doubt awe forehead volume through mind space constant weep just";
  currency::account_base acc;
  acc.restore_keys_from_braindata(good_phrase);

  std::vector <std::string> wrong_phrases
  {
    "petal GIRL stare chocolate best rhythm pressure bag SHIMMER rhyme deserve belief victim heaven favorite doubt awe forehead volume through mind space constant weep just",
    "   petal girl stare chocolate     best rhythm pressure bag shimmer rhyme deserve belief victim heaven favorite doubt awe forehead volume through mind  space constant weep     just"
  };

  for (auto phrase : wrong_phrases)
  {
    currency::account_base acc2;
    acc2.restore_keys_from_braindata(phrase);

    ASSERT_EQ(acc2.get_keys(), acc.get_keys()) << "restore with wrong phrase test, keys mismatch" << std::endl;
    ASSERT_EQ(acc2.get_createtime(), acc.get_createtime()) << "restore with wrong phrase test, timestamps mismatch" << std::endl;
  }

  std::vector <std::string> partial_restore_phrases
  {
    "petal girl stare chocolate best rhythm pressure bag shimmer rhyme deserve belief victim heaven favorite doubt awe forehead volume through mind space constant weep weary!",
    "petal girl stare chocolate best rhythm pressure bag shimmer rhyme deserve belief victim heaven favorite doubt awe forehead volume through mind space constant weep weary constant weep weary just"
  };

  for (auto phrase : partial_restore_phrases)
  {
    currency::account_base acc2;
    acc2.restore_keys_from_braindata(phrase);

    ASSERT_EQ(acc2.get_keys(), acc.get_keys()) << "restore with partial restore phrases test, keys mismatch" << std::endl;
    ASSERT_EQ(acc2.get_createtime(), 0) << "restore with partial restore phrases test, timestamp != 0" << std::endl;
  }

  acc.generate();
  auto &keys = acc.get_keys();
  auto restore_data = epee::string_tools::pod_to_hex(keys.m_spend_secret_key);

  restore_data.append(" blablabla"); //uncorrect date 

  currency::account_base acc2;
  bool r = acc2.restore_keys_from_braindata(restore_data);
  ASSERT_TRUE(r) << "spend key restore with uncorrect timestamp test, restore keys failed" << std::endl;

  ASSERT_EQ(acc2.get_keys(), acc.get_keys()) << "spend key restore with uncorrect timestamp test, keys mismatch" << std::endl;
  ASSERT_EQ(acc2.get_createtime(), 0) << "spend key restore with uncorrect timestamp test, timestamps not 0" << std::endl;
}
