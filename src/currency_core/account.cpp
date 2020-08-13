// Copyright (c) 2014-2020 The Virie Project
// Copyright (c) 2012-2013 The Cryptonote developers
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include <boost/archive/binary_oarchive.hpp>
#include <boost/archive/binary_iarchive.hpp>
#include <fstream>

#include "include_base_utils.h"
#include "account.h"
#include "warnings.h"
#include "crypto/crypto.h"
#include "currency_core/currency_format_utils.h"
#include "common/mnemonic-encoding.h"
#include "string_tools.h"

using namespace std;

DISABLE_VS_WARNINGS(4244 4345)

namespace currency
{

  //-----------------------------------------------------------------
  account_base::account_base()
  {
    set_null();
  }
  //-----------------------------------------------------------------
  void account_base::set_null()
  {
    m_seed.clear();
    m_keys = account_keys();
    m_creation_timestamp = 0;
  }
  //-----------------------------------------------------------------
  void account_base::generate()
  {
    //generate_keys(m_keys.m_account_address.m_spend_public_key, m_keys.m_spend_secret_key);
    generate_brain_keys(m_keys.m_account_address.m_spend_public_key, m_keys.m_spend_secret_key, m_seed);
    dependent_key(m_keys.m_spend_secret_key, m_keys.m_view_secret_key);
    if (!crypto::secret_key_to_public_key(m_keys.m_view_secret_key, m_keys.m_account_address.m_view_public_key))
      throw std::runtime_error("Failed to create public view key");

    m_creation_timestamp = time(NULL);
  }
  //-----------------------------------------------------------------
  const account_keys& account_base::get_keys() const
  {
    return m_keys;
  }
  //-----------------------------------------------------------------
  std::string account_base::get_restore_data() const
  {
    return m_seed;
  }
  //-----------------------------------------------------------------
  std::string account_base::get_restore_braindata() const 
  {
    std::string restore_string;
    if (!m_seed.empty())
    {
      std::string restore_buff = get_restore_data();
      restore_string = tools::mnemonic_encoding::binary2text(restore_buff);

      uint64_t date_offset = m_creation_timestamp > WALLET_BRAIN_DATE_OFFSET ? m_creation_timestamp - WALLET_BRAIN_DATE_OFFSET : 0;
      uint64_t weeks_count = date_offset / WALLET_BRAIN_DATE_QUANTUM;
      CHECK_AND_ASSERT_THROW_MES(weeks_count < std::numeric_limits<uint32_t>::max(), "internal error: unable to converto to uint32, val = " << weeks_count);
      uint32_t weeks_count_32 = static_cast<uint32_t>(weeks_count);

      restore_string.append(tools::mnemonic_encoding::word_by_num(weeks_count_32));
    }
    else
    {
      if (m_keys.is_watch_only())
      {
        return std::string("");
      }
      crypto::secret_key spend_key = get_keys().m_spend_secret_key;
      restore_string = epee::string_tools::pod_to_hex(spend_key);

      time_t timestamp = get_createtime();
      std::string date;
      epee::misc_utils::get_restore_str_from_time(date, timestamp);

      restore_string.append(" " + date);
    }

    return restore_string;
  }
  //-----------------------------------------------------------------
  bool account_base::restore_keys(const std::string& restore_data)
  {
    //CHECK_AND_ASSERT_MES(restore_data.size() == ACCOUNT_RESTORE_DATA_SIZE, false, "wrong restore data size");
    if (restore_data.size() == BRAINWALLET_DEFAULT_SEED_SIZE)
    {
      crypto::keys_from_default((unsigned char*)restore_data.data(), m_keys.m_account_address.m_spend_public_key, m_keys.m_spend_secret_key);
    }
    else if(restore_data.size() == BRAINWALLET_SHORT_SEED_SIZE)
    {
      crypto::keys_from_short((unsigned char*)restore_data.data(), m_keys.m_account_address.m_spend_public_key, m_keys.m_spend_secret_key);
    }
    else 
    {
      LOG_ERROR("wrong restore data size=" << restore_data.size());
      return false;
    }
    m_seed = restore_data;
    crypto::dependent_key(m_keys.m_spend_secret_key, m_keys.m_view_secret_key);
    bool r = crypto::secret_key_to_public_key(m_keys.m_view_secret_key, m_keys.m_account_address.m_view_public_key);
    CHECK_AND_ASSERT_MES(r, false, "failed to secret_key_to_public_key for view key");
    return true;
  }
  //-----------------------------------------------------------------
  bool account_base::restore_keys_from_braindata(const std::string& restore_data)
  {
    set_createtime(0);
    std::stringstream restore_phrase_stream(restore_data);
    size_t words_count = std::distance(std::istream_iterator<std::string>(restore_phrase_stream), std::istream_iterator<std::string>());

    if (words_count == SPEND_KEY_WORDS_COUNT_WITH_TS)
    {
      time_t restore_create_time;
      std::istringstream date(restore_data.substr(1 + (restore_data.find_last_of(' '))));
      if (epee::misc_utils::get_restore_time_from_str(restore_create_time, date.str()))
      {
        set_createtime(restore_create_time);
      }
    }
    else if (words_count == PHRASE_WORDS_COUNT_WITH_TS)
    {
      auto index = restore_data.find_last_of(' ');
      std::string last_word = restore_data.substr(++index);

      uint64_t count_of_weeks = tools::mnemonic_encoding::num_by_word(last_word);
      time_t timestamp = count_of_weeks * WALLET_BRAIN_DATE_QUANTUM + WALLET_BRAIN_DATE_OFFSET;

      if (timestamp < time(nullptr) && timestamp > WALLET_BRAIN_DATE_OFFSET)
      {
        set_createtime(timestamp);
      }
    }

    if (words_count == SPEND_KEY_WORDS_COUNT || words_count == SPEND_KEY_WORDS_COUNT_WITH_TS)
    {
      return restore_keys_from_spend_key(restore_data);      
    }
    else
    {
      string::size_type start = 0;
      string::size_type last = restore_data.find_first_of(" ");
      uint32_t copied_words_count = 0;
      std::string restore_string;
      while (start - 1 != restore_data.size() && copied_words_count < PHRASE_WORDS_COUNT)
      {
        if (last > start)
        {
          restore_string.append(restore_data.substr(start, last - start) + " ");
          copied_words_count++;
        }

        start = ++last;
        last = restore_data.find_first_of(" ", last);
        if (last == std::string::npos)
        {
          last = restore_data.size();
        }
      }
      std::string restore_buff = tools::mnemonic_encoding::text2binary(restore_string);
      if (!restore_buff.size())
        return false;
      return restore_keys(restore_buff);
    }
    
    return false;
  }
  //-----------------------------------------------------------------
  bool account_base::restore_keys_from_view_key(const std::string& restore_data)
  {
    m_seed.clear();
    m_keys.m_spend_secret_key = currency::null_skey;
    bool r = epee::string_tools::hex_to_pod(restore_data, m_keys.m_view_secret_key);
    CHECK_AND_ASSERT_MES(r, false, "failed to restore secret_view_key");
    r = crypto::secret_key_to_public_key(m_keys.m_view_secret_key, m_keys.m_account_address.m_view_public_key);
    CHECK_AND_ASSERT_MES(r, false, "failed to secret_key_to_public_key for view key");
    set_createtime(0);
    return true;
  }
  //-----------------------------------------------------------------
  bool account_base::restore_keys_from_spend_key(const std::string& restore_data)
  {
    m_seed.clear();
    std::string spend_key = restore_data.substr(0, restore_data.find(" "));

    bool r = epee::string_tools::hex_to_pod(spend_key, m_keys.m_spend_secret_key);
    CHECK_AND_ASSERT_MES(r, false, "failed to restore spend_secret_key");
    r = crypto::secret_key_to_public_key(m_keys.m_spend_secret_key, m_keys.m_account_address.m_spend_public_key);
    CHECK_AND_ASSERT_MES(r, false, "failed to secret_spend_key_to_public_key for view key");
    try
    {
      dependent_key(m_keys.m_spend_secret_key, m_keys.m_view_secret_key);
    }
    catch (...)
    {
      ASSERT_MES_AND_THROW("failed to depend spend key to view key");
      return false;
    }
    r = crypto::secret_key_to_public_key(m_keys.m_view_secret_key, m_keys.m_account_address.m_view_public_key);
    CHECK_AND_ASSERT_MES(r, false, "failed to secret_key_to_public_view_key for view key");
    return true;
  }
  //-----------------------------------------------------------------
  std::string account_base::get_public_address_str()
  {
    //TODO: change this code into base 58
    return get_account_address_as_str(m_keys.m_account_address);
  }
  //-----------------------------------------------------------------
  void account_base::make_account_watch_only()
  {
    m_keys.m_spend_secret_key = currency::null_skey;
    m_seed.clear();
  }
  //-----------------------------------------------------------------
  std::string transform_addr_to_str(const account_public_address& addr)
  {
    return get_account_address_as_str(addr);
  }

  account_public_address transform_str_to_addr(const std::string& str)
  {
    account_public_address ad = AUTO_VAL_INIT(ad);
    if (!get_account_address_from_str(ad, str))
    {
      LOG_ERROR("cannot parse address from string: " << str);
    }
    return ad;
  }
}