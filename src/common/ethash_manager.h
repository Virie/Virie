// Copyright (c) 2014-2020 The Virie Project
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#pragma once
#include <atomic>
#include <syncobj.h>
//#include <boost/thread/locks.hpp>
//#include <boost/thread/mutex.hpp>
//#include <boost/thread/shared_mutex.hpp>

#include "cache_helper.h"
#include "ethereum/libethash/internal.h"
#include "crypto/crypto.h"

namespace crypto
{
namespace ethash
{
  class cache_manager
  {
  public:
    cache_manager();
    ~cache_manager();
    void get_hash(uint64_t height, const hash& block_fast_hash, uint64_t nonce, hash& res);
    void set_use_dag(bool use);
    const uint8_t* get_dag(uint64_t epoch, uint64_t& dag_size);

    static uint64_t height_to_epoch(uint64_t height);
    static std::pair<std::string, std::string> get_version();

  private:
    //boost::mutex m_cs;
    boost::shared_mutex main_locker;
    uint64_t m_current_epoch;
    ethash_light_t m_light_cache;
    ethash_full_t m_dag;
    std::atomic<bool> m_use_dag;

    static int generate_dag_handler(unsigned progress);
    bool generate_dataset(uint64_t epoch);

    static_assert(sizeof(crypto::hash) == sizeof(ethash_h256_t), "sizeof(hash) != sizeof(ethash_h256_t)");
  };
}
}
