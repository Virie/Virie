// Copyright (c) 2014-2020 The Virie Project
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.
#ifdef USE_ETHASH_CS
#include "ethash_manager_cs.h"
#include "include_base_utils.h"
#include "misc_language.h"
#include "libethash_cs/libethash/include/ethash/ethash.hpp"
#include "libethash_cs/libethash/include/ethash/version.h"
#include "common/deps_version.h"

namespace crypto
{
namespace ethash_cs
{

  namespace
  {
    static const bool set_ver = deps_version::add_lib_version(cache_manager_cs::get_version());
  }

  cache_manager_cs::cache_manager_cs()
  {
  }
  
  cache_manager_cs::~cache_manager_cs()
  {
  }
  
  void cache_manager_cs::get_hash(uint64_t height, const hash& block_fast_hash, uint64_t nonce, hash& res)
  {
    CRITICAL_SECTION_SHARED_LOCK(main_locker);
    uint64_t epoch = height_to_epoch(height);
    if (last_epoch != epoch || !context)
    {
      CRITICAL_SECTION_UNIQUE_LOCK(main_locker);
      if (last_epoch != epoch || !context)
      {
        last_epoch = epoch;
        context.reset(ethash_create_epoch_context_full(epoch));
      }
    }
    ethash::result r = ethash::hash(*context, *(reinterpret_cast<const ethash::hash256*>(&block_fast_hash)), nonce);

    static_assert(sizeof(res) == sizeof(r.final_hash), "hash sizes mismatch");
    res = *(reinterpret_cast<hash*>(&r.final_hash));
  }

  uint64_t cache_manager_cs::height_to_epoch(uint64_t height)
  {
    return height / ETHASH_EPOCH_LENGTH;
  }

  std::pair<std::string, std::string> cache_manager_cs::get_version()
  {
    static const std::string s_version = std::string("revision: ") + ethash::revision + ", version: " + ethash::version;
    return { "ethash_cs", s_version};
  }
}  //namespace ethash_cs
}  //namespace crypto
#endif //USE_ETHASH_CS
