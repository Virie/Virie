// Copyright (c) 2014-2020 The Virie Project
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include "ethash_manager.h"
#include "include_base_utils.h"
#include "misc_language.h"
#include "ethereum/libethash/io.h"
#include "common/deps_version.h"

namespace crypto
{
namespace ethash
{

  namespace
  {
    static const bool set_ver = deps_version::add_lib_version(cache_manager::get_version());
  }

  int cache_manager::generate_dag_handler(unsigned progress)
  {
    LOG_PRINT_L0("DAG generation progress: " << progress << "%");
    return 0;
  }

  bool cache_manager::generate_dataset(uint64_t epoch)
  TRY_ENTRY()
  {
    //TODO: change it somehow to read/write lock
    //boost::upgrade_lock<boost::shared_mutex> lock(m_cs);
    //boost::upgrade_to_unique_lock<boost::shared_mutex> unique_lock(lock);

    if (m_light_cache == nullptr || m_current_epoch != epoch)
    {
      LOG_PRINT_YELLOW("Generating ethash light for epoch " << epoch << "....", LOG_LEVEL_0);

      char dirname[256] = "";
      ethash_get_default_dirname(dirname, sizeof dirname);

      // make sure the directory is exists
      {
        boost::filesystem::path fs_dir(dirname);
        if (!boost::filesystem::is_directory(fs_dir))
          boost::filesystem::create_directories(fs_dir);
        CHECK_AND_ASSERT_MES(boost::filesystem::is_directory(fs_dir), false, "failed to create directories at " << dirname);
      }

      m_light_cache = ethash_light_filecached(epoch * ETHASH_EPOCH_LENGTH, dirname);
      CHECK_AND_ASSERT_MES(m_light_cache != nullptr, false, "failed to generate ethash light cache");
      m_dag = nullptr;
      m_current_epoch = epoch;
      LOG_PRINT_YELLOW("Generated ethash light OK", LOG_LEVEL_0);
    }

    if (m_use_dag && !m_dag)
    {
      LOG_PRINT_YELLOW("Generating DAG for epoch " << m_current_epoch << "....", LOG_LEVEL_0);
      m_dag = ethash_full_new(m_light_cache, generate_dag_handler);
      CHECK_AND_ASSERT_MES(m_dag, false, "Failed to generate DAG");
      LOG_PRINT_YELLOW("Generated DAG OK", LOG_LEVEL_0);
    }

    return true;
  }
  CATCH_ENTRY("cache_manager::generate_dataset", false)


  cache_manager::cache_manager()
    : m_current_epoch(0)
    , m_light_cache(nullptr)
    , m_dag(nullptr)
    , m_use_dag(false)
  {}
  
  cache_manager::~cache_manager()
  {
    ethash_light_delete(m_light_cache);

  }

  void cache_manager::get_hash(uint64_t height, const hash& block_fast_hash, uint64_t nonce, hash& res)
  {
    //TODO: change it somehow to read/write lock 
    //boost::shared_lock<boost::shared_mutex> lock(m_cs);
    //boost::lock_guard<boost::mutex> guard(m_cs);
    //boost::upgrade_lock<boost::shared_mutex> lock(main_locker);
    CRITICAL_SECTION_SHARED_LOCK(main_locker);
    ethash_h256_t* et_style_hash = (ethash_h256_t*)&block_fast_hash;

    uint64_t epoch = height_to_epoch(height);

    if (!m_light_cache || m_current_epoch != epoch)
    {
      CRITICAL_SECTION_UNIQUE_LOCK(main_locker);
      generate_dataset(epoch);
      CHECK_AND_ASSERT_THROW_MES(m_light_cache != nullptr, "dataset generation failed");
    }
    ethash_return_value_t r = AUTO_VAL_INIT(r);
    if (m_use_dag && m_dag != nullptr)
    {
      r = ethash_full_compute(m_dag, *et_style_hash, nonce);
    }
    else
    {
      r = ethash_light_compute(m_light_cache, *et_style_hash, nonce);
    }
    memcpy(&res, &r.result, sizeof(r.result));
  }
  
  uint64_t cache_manager::height_to_epoch(uint64_t height)
  {
    return height / ETHASH_EPOCH_LENGTH;
  }

  const uint8_t* cache_manager::get_dag(uint64_t epoch, uint64_t& dag_size)
  {
    dag_size = 0;
    m_use_dag = true;
    if (!generate_dataset(epoch))
      return nullptr;
    dag_size = m_dag->file_size;
    return (const uint8_t *)m_dag->data;
  }

  std::pair<std::string, std::string> cache_manager::get_version()
  {
    return { "ethash", std::to_string(ETHASH_REVISION) };
  }


  void cache_manager::set_use_dag(bool use)
  {
//     //TODO: refactoring needed (in case if epoch change will happend while full dag is generating - then unexpected behaviour )
//     if (use)
//     {
//       if (m_light_cache)
//         m_dag = ethash_full_new(m_light_cache, generate_dag_handler);
// 
//       m_use_dag = true;
//     }
    m_use_dag = use;
  }

}
}
