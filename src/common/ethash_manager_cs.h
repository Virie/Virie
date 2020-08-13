// Copyright (c) 2014-2020 The Virie Project
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#pragma once
#ifdef USE_ETHASH_CS
#include <boost/thread/locks.hpp>
#include <boost/thread/shared_mutex.hpp>
#include "libethash_cs/libethash/include/ethash/ethash.h"
#include "crypto/crypto.h"

namespace crypto
{
namespace ethash_cs
{
  class cache_manager_cs
  {
  public:
    cache_manager_cs();
    ~cache_manager_cs();

    void get_hash(uint64_t height, const hash& block_fast_hash, uint64_t nonce, hash& res);
    static uint64_t height_to_epoch(uint64_t height);
    static std::pair<std::string, std::string> get_version();
  private:
    int number_of_readers = 0;
    struct deleter
    {
      void operator() (ethash_epoch_context_full* delete_context)
      {
        ethash_destroy_epoch_context_full(delete_context);
      }
    };
    std::unique_ptr<ethash_epoch_context_full, deleter> context = nullptr;
    uint64_t last_epoch = 0;
    boost::shared_mutex main_locker;
  };
}
}
#endif //USE_ETHASH_CS