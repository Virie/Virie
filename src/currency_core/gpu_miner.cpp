// Copyright (c) 2014-2020 The Virie Project
// Copyright (c) 2012-2013 The Cryptonote developers
// Copyright (c) 2012-2013 The Boolberry developers
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#ifdef USE_OPENCL

#include <sstream>
#include <numeric>
#include <boost/utility/value_init.hpp>
#include <boost/interprocess/detail/atomic.hpp>
#include <boost/limits.hpp>
#include <boost/foreach.hpp>
#include "misc_language.h"
#include "include_base_utils.h"

#include "currency_format_utils.h"
#include "file_io_utils.h"
#include "common/command_line.h"
#include "string_coding.h"
#include "version.h"
#include "storages/portable_storage_template_helper.h"
#include "ethereum/libethash-cl/ethash_cl_miner.h"
#include "common/deps_version.h"

using namespace epee;

#include "gpu_miner.h"

namespace currency
{

  namespace
  {
    static const bool set_ver = deps_version::add_lib_versions(gpu_miner::get_versions());
  }

  template <class t_cb_found, class t_cb_searched>
  struct abstract_search_hook : public ethash_cl_miner::search_hook
  {
    t_cb_found m_cb_found;
    t_cb_searched m_cb_searched;
    abstract_search_hook(t_cb_found cb_found, t_cb_searched cb_searched) :m_cb_found(cb_found), m_cb_searched(cb_searched)
    {}

    //---------------- ethash_cl_miner::search_hook ----------------
    virtual bool found(uint64_t const* nonces, uint32_t count)
    {
      return m_cb_found(nonces, count);
    }
    virtual bool searched(uint64_t start_nonce, uint32_t count)
    {
      return m_cb_searched(start_nonce, count);
    }
  };

  template <class t_cb_found, class t_cb_searched>
  std::shared_ptr<ethash_cl_miner::search_hook>
    get_lambda_hooker(t_cb_found cb_found, t_cb_searched cb_searched)
  {
      return std::shared_ptr<ethash_cl_miner::search_hook>(new abstract_search_hook<t_cb_found, t_cb_searched>(cb_found, cb_searched));
    }


  namespace
  {
    const command_line::arg_descriptor<std::string>   arg_extra_messages      = { "extra-messages-file",  "Specify file for extra messages to include into coinbase transactions", "", command_line::flag_t::not_use_default };
    const command_line::arg_descriptor<std::string>   arg_start_mining        = { "start-mining",         "Specify wallet address to mining for", "", command_line::flag_t::not_use_default };
    const command_line::arg_descriptor<bool>          arg_gpu_list_platforms  = { "gpu-list-platforms",   "GPU mining: list OpenCL platforms", false, command_line::flag_t::not_use_default };
    const command_line::arg_descriptor<bool>          arg_gpu_list_devices    = { "gpu-list-devices",     "GPU mining: list OpenCL devices for each platform", false, command_line::flag_t::not_use_default };
    const command_line::arg_descriptor<uint32_t>      arg_gpu_platform_id     = { "gpu-platform-id",      "GPU mining: select OpenCL platform id", 0, command_line::flag_t::not_use_default };
    const command_line::arg_descriptor<uint32_t>      arg_gpu_device_id       = { "gpu-device-id",        "GPU mining: select OpenCL device id", 0, command_line::flag_t::not_use_default };
    const command_line::arg_descriptor<uint32_t>      arg_gpu_local_work      = { "gpu-local-work-size",  "GPU mining: specify local work size ", 64 };
    const command_line::arg_descriptor<uint32_t>      arg_gpu_global_work     = { "gpu-global-work-size", "GPU mining: specify global work size", 1048576 * 2 };
    const command_line::arg_descriptor<std::string>   arg_gpu_benchmark       = { "gpu-benchmark",        "GPU mining: perform a bechmark instead of actual mining using specified difficulty (or current BC diff if 0)", "", command_line::flag_t::not_use_default };

    // const command_line::arg_descriptor<uint32_t>      arg_mining_threads  = { "mining-threads", "Specify mining threads count", 0, command_line::flag_t::not_use_default };
  }

  gpu_miner::gpu_miner(i_miner_handler* phandler) :m_stop(1),
    m_template(boost::value_initialized<block>()),
    m_template_no(0),
    m_diffic(0),
    m_height(0),
    m_thread_index(0),
    m_threads_total(1),
    m_pausers_count(0),
    m_phandler(phandler),
    m_config(AUTO_VAL_INIT(m_config)),
    m_current_hash_rate(0),
    m_last_hr_merge_time(0),
    m_hashes(0),
    m_do_print_hashrate(false),
    m_do_mining(false),
    m_benchmark_mode(false),
    m_global_work_size(0),
    m_local_work_size(0),
    m_ms_per_batch(ethash_cl_miner::c_defaultMSPerBatch),
    m_opencl_platform(0),
    m_opencl_device(0),
    m_cl_allow_cpu(false),
    m_extra_gpu_memory(350000000)
  {
  }
  //-----------------------------------------------------------------------------------------------------
  gpu_miner::~gpu_miner()
  {
    stop();
  }
  //-----------------------------------------------------------------------------------------------------
  bool gpu_miner::set_block_template(const block& bl, const wide_difficulty_type& di, uint64_t height)
  {
    CRITICAL_REGION_LOCAL(m_template_lock);
    m_template = bl;
    m_diffic = di;
    m_height = height;
    ++m_template_no;
    return true;
  }
  //-----------------------------------------------------------------------------------------------------
  bool gpu_miner::on_block_chain_update()
  {
    if (!is_mining())
      return true;

    //here miner threads may work few rounds without 
    return request_block_template();
  }
  //-----------------------------------------------------------------------------------------------------
  bool gpu_miner::request_block_template()
  {
    block bl = AUTO_VAL_INIT(bl);
    wide_difficulty_type di = AUTO_VAL_INIT(di);
    uint64_t height = AUTO_VAL_INIT(height);
    currency::blobdata extra_nonce = PROJECT_VERSION_LONG "|ethash-solo-gpu-miner";
    if (m_extra_messages.size() && m_config.current_extra_message_index < m_extra_messages.size())
    {
      extra_nonce = m_extra_messages[m_config.current_extra_message_index];
    }
    if (!m_phandler->get_block_template(bl, m_mine_address, m_mine_address, di, height, extra_nonce))
    {
      LOG_ERROR("Failed to get_block_template()");
      return false;
    }
    set_block_template(bl, di, height);
    return true;
  }
  //-----------------------------------------------------------------------------------------------------
  bool gpu_miner::on_idle()
  {
    m_update_block_template_interval.do_call([&](){
      if (is_mining())
        request_block_template();
      return true;
    });

    m_update_merge_hr_interval.do_call([&](){
      merge_hr();
      return true;
    });

    return true;
  }
  //-----------------------------------------------------------------------------------------------------
  void gpu_miner::do_print_hashrate(bool do_hr)
  {
    m_do_print_hashrate = do_hr;
  }
  //-----------------------------------------------------------------------------------------------------
  void gpu_miner::merge_hr()
  {
    if (m_last_hr_merge_time && is_mining())
    {
      m_current_hash_rate = (m_hashes * 1000) / ((misc_utils::get_tick_count() - m_last_hr_merge_time + 1));
    }
    m_last_hr_merge_time = misc_utils::get_tick_count();
    m_hashes = 0;
    if (m_do_print_hashrate && is_mining())
      LOG_PRINT_L0("hr: " << m_current_hash_rate << std::endl);
  }
  //-----------------------------------------------------------------------------------------------------
  void gpu_miner::init_options(boost::program_options::options_description& desc)
  {
    command_line::add_arg(desc, arg_extra_messages);
    command_line::add_arg(desc, arg_start_mining);
    command_line::add_arg(desc, arg_gpu_list_platforms);
    command_line::add_arg(desc, arg_gpu_list_devices);
    command_line::add_arg(desc, arg_gpu_device_id);
    command_line::add_arg(desc, arg_gpu_platform_id);
    command_line::add_arg(desc, arg_gpu_local_work);
    command_line::add_arg(desc, arg_gpu_global_work);
    command_line::add_arg(desc, arg_gpu_benchmark);

    //command_line::add_arg(desc, arg_mining_threads);
  }
  //-----------------------------------------------------------------------------------------------------
  bool gpu_miner::init(const boost::program_options::variables_map& vm)
  {
    m_config_folder = command_line::get_arg(vm, command_line::arg_data_dir);
    epee::serialization::load_t_from_json_file(m_config, m_config_folder + "/" + MINER_CONFIG_FILENAME);

    if (command_line::has_arg(vm, arg_extra_messages))
    {
      std::string buff;
      bool r = file_io_utils::load_file_to_string(command_line::get_arg(vm, arg_extra_messages), buff);
      CHECK_AND_ASSERT_MES(r, false, "Failed to load file with extra messages: " << command_line::get_arg(vm, arg_extra_messages));
      std::vector<std::string> extra_vec;
      boost::split(extra_vec, buff, boost::is_any_of("\n"), boost::token_compress_on);
      m_extra_messages.resize(extra_vec.size());
      for (size_t i = 0; i != extra_vec.size(); i++)
      {
        string_tools::trim(extra_vec[i]);
        if (!extra_vec[i].size())
          continue;
        std::string buff = string_encoding::base64_decode(extra_vec[i]);
        if (buff != "0")
          m_extra_messages[i] = buff;
      }
      LOG_PRINT_L0("Loaded " << m_extra_messages.size() << " extra messages, current index " << m_config.current_extra_message_index);
    }

    if (command_line::has_arg(vm, arg_start_mining))
    {
      if (!currency::get_account_address_from_str(m_mine_address, command_line::get_arg(vm, arg_start_mining)))
      {
        LOG_ERROR("Target account address " << command_line::get_arg(vm, arg_start_mining) << " has wrong format, starting daemon canceled");
        return false;
      }
      m_do_mining = true;
    }

    if (command_line::has_arg(vm, arg_gpu_device_id))
      m_opencl_device = command_line::get_arg(vm, arg_gpu_device_id);

    if (command_line::has_arg(vm, arg_gpu_platform_id))
      m_opencl_platform = command_line::get_arg(vm, arg_gpu_platform_id);
    
    if (command_line::has_arg(vm, arg_gpu_local_work))
      m_local_work_size = command_line::get_arg(vm, arg_gpu_local_work);
    
    if (command_line::has_arg(vm, arg_gpu_global_work))
      m_global_work_size = command_line::get_arg(vm, arg_gpu_global_work);

    if (command_line::has_arg(vm, arg_gpu_benchmark))
    {
      m_benchmark_mode = true;
      std::string str = command_line::get_arg(vm, arg_gpu_benchmark);
      m_benchmark_diff.assign(str);

      // in case of benchmark don't wait for syncronization, start over there
      account_public_address null_addr = AUTO_VAL_INIT(null_addr);
      start(null_addr, 0);

      m_do_print_hashrate = true;
    }

    return true;
  }
  //-----------------------------------------------------------------------------------------------------
  bool gpu_miner::deinit()
  {
    if (!tools::create_directories_if_necessary(m_config_folder))
    {
      LOG_PRINT_L0("Failed to create data directory: " << m_config_folder);
      return false;
    }
    epee::serialization::store_t_to_json_file(m_config, m_config_folder + "/" + MINER_CONFIG_FILENAME);
    return true;
  }
  //-----------------------------------------------------------------------------------------------------
  bool gpu_miner::is_mining()
  {
    return !m_stop;
  }
  //----------------------------------------------------------------------------------------------------- 
  bool gpu_miner::start(const account_public_address& adr, size_t /* threads_count -- ignored */)
  {
    m_mine_address = adr;

    CRITICAL_REGION_LOCAL(m_threads_lock);
    if (is_mining())
    {
      LOG_PRINT_L0("Starting miner:  miner already running");
      return false;
    }

    if (!m_threads.empty())
    {
      LOG_ERROR("Starting miner canceled:  there are still active mining threads");
      return false;
    }

    m_template_no = 0;
    request_block_template(); // always update block template prior to mining

    ethash_set_use_dag(true);

    LOG_PRINT_MAGENTA("Configuring GPU device:" << ENDL
      << "  platform id:    " << m_opencl_platform << ENDL
      << "  device id:      " << m_opencl_device << ENDL
      << "  local work sz:  " << m_local_work_size << ENDL
      << "  global work sz: " << m_global_work_size, LOG_LEVEL_0);

    bool res = ethash_cl_miner::configureGPU(
      m_opencl_platform,
      m_local_work_size,
      m_global_work_size,
      m_ms_per_batch,
      m_cl_allow_cpu,
      m_extra_gpu_memory,
      get_block_height(m_template));
    
    CHECK_AND_ASSERT_MES(res, false, "Failed to initialize gpu device!");
    LOG_PRINT_MAGENTA("GPU configured successfully!", LOG_LEVEL_0);
    if (m_benchmark_mode)
    {
      std::stringstream ss;
      if (m_benchmark_diff != 0)
        ss << m_benchmark_diff;
      else 
        ss << "default";
      LOG_PRINT_YELLOW("ATTENTION!! benchmark mode is ON (using " << ss.str() << " difficulty). Nothing will be sent to the network", LOG_LEVEL_0);
    }

    boost::interprocess::ipcdetail::atomic_write32(&m_stop, 0);
    boost::interprocess::ipcdetail::atomic_write32(&m_thread_index, 0);

    for (size_t i = 0; i != m_threads_total; i++)
      m_threads.push_back(boost::thread(boost::bind(&gpu_miner::worker_thread, this)));

    LOG_PRINT_L0("Mining has started with " << m_threads_total << " threads, good luck!");
    return true;
  }
  //-----------------------------------------------------------------------------------------------------
  uint64_t gpu_miner::get_speed()
  {
    if (is_mining())
      return m_current_hash_rate;
    else
      return 0;
  }
  //-----------------------------------------------------------------------------------------------------
  uint32_t gpu_miner::get_threads_count() const
  {
    return m_threads_total;
  }
  //-----------------------------------------------------------------------------------------------------
  void gpu_miner::send_stop_signal()
  {
    boost::interprocess::ipcdetail::atomic_write32(&m_stop, 1);
  }
  //-----------------------------------------------------------------------------------------------------
  bool gpu_miner::stop()
  {
    LOG_PRINT_L1("Finishing " << m_threads.size() << " threads...");
    send_stop_signal();
    CRITICAL_REGION_LOCAL(m_threads_lock);

    for(boost::thread& th : m_threads)
      if (th.joinable() && th.get_id() != boost::this_thread::get_id())
        th.join();

    m_threads.clear();
    LOG_PRINT_L0("Mining has been stopped, " << m_threads.size() << " finished");
    return true;
  }
  //-----------------------------------------------------------------------------------------------------
  void gpu_miner::on_synchronized()
  {
    if (m_do_mining)
    {
      start(m_mine_address, 0);
    }
  }
  //-----------------------------------------------------------------------------------------------------
  void gpu_miner::pause()
  {
    CRITICAL_REGION_LOCAL(m_miners_count_lock);
    ++m_pausers_count;
    if (m_pausers_count == 1 && is_mining())
      LOG_PRINT_L2("MINING PAUSED");
  }
  //-----------------------------------------------------------------------------------------------------
  void gpu_miner::resume()
  {
    CRITICAL_REGION_LOCAL(m_miners_count_lock);
    --m_pausers_count;
    if (m_pausers_count < 0)
    {
      m_pausers_count = 0;
      LOG_PRINT_RED_L0("Unexpected miner2::resume() called");
    }
    if (!m_pausers_count && is_mining())
      LOG_PRINT_L2("MINING RESUMED");
  }
  //-----------------------------------------------------------------------------------------------------
  bool gpu_miner::handle_cli_info_commands(const boost::program_options::variables_map& vm)
  {
    if (command_line::has_arg(vm, arg_gpu_list_platforms))
    {
      ethash_cl_miner::listPlatforms();
      return true;
    }

    if (command_line::has_arg(vm, arg_gpu_list_devices))
    {
      ethash_cl_miner::listAllDevices();
      return true;
    }

    return false;
  }
  //-----------------------------------------------------------------------------------------------------
  std::map<std::string, std::string> gpu_miner::get_versions()
  {
    return
    {
      { "cl.hpp", "1.2.9" },
      { "opencl", ethash_cl_miner::platform_version() }
    };
  }
  //-----------------------------------------------------------------------------------------------------
  bool gpu_miner::worker_thread()
  {
    bool r = false;
    uint32_t th_local_index = boost::interprocess::ipcdetail::atomic_inc32(&m_thread_index);
    LOG_PRINT_L0("Miner thread was started [" << th_local_index << "]");
    log_space::log_singletone::set_thread_log_prefix(std::string("[miner ") + std::to_string(th_local_index) + "]");
    wide_difficulty_type local_diff = 0;
    uint32_t local_template_ver = m_template_no - 1; // enforce DAG & ethash_cl_miner initialization at the very beginning of the work loop
    uint64_t local_template_height = 0;
    uint64_t local_template_epoch = UINT64_MAX;
    crypto::hash block_pow_template_hash = null_hash;
    block b;
    std::shared_ptr<ethash_cl_miner> cl_miner_ptr(new ethash_cl_miner());

    while (!m_stop)
    {
      if (m_pausers_count)//anti split workaround
      {
        misc_utils::sleep_no_w(100);
        continue;
      }

      if (local_template_ver != m_template_no)
      {
        CRITICAL_REGION_BEGIN(m_template_lock);
        b = m_template; 
        blobdata block_blob;
        block_blob = get_block_hashing_blob(b);
        
        access_nonce_in_block_blob(block_blob) = 0;
        block_pow_template_hash = crypto::cn_fast_hash(block_blob.data(), block_blob.size());

        local_diff = (m_benchmark_mode && m_benchmark_diff != 0) ? m_benchmark_diff : m_diffic;
        CRITICAL_REGION_END();
        local_template_height = get_block_height(b);
        local_template_ver = m_template_no;
        if (local_template_epoch != ethash_height_to_epoch(local_template_height))
        {
          local_template_epoch = ethash_height_to_epoch(local_template_height);
          LOG_PRINT_MAGENTA("(Re)configuring DAG and GPU for epoch " << local_template_epoch << " (height " << local_template_height << ").....", LOG_LEVEL_0);
          cl_miner_ptr.reset(new ethash_cl_miner());
          uint64_t dag_size = 0;
          const uint8_t* p_dag = ethash_get_dag(local_template_epoch, dag_size);
          CHECK_AND_ASSERT_MES(p_dag != nullptr, false, "Failed to obtain DAG for epoch " << local_template_epoch);
          LOG_PRINT_MAGENTA("(Re)initing GPU.....", LOG_LEVEL_0);
          r = cl_miner_ptr->init(p_dag, dag_size, m_opencl_platform, m_opencl_device);
          CHECK_AND_ASSERT_MES(r, false, "Failed to initialize ethash open cl miner");
        }
      }

      if (local_template_ver == 0) // set_block_template() has not been called yet
      {
        LOG_PRINT_L2("Block template has not been set yet, waiting....");
        epee::misc_utils::sleep_no_w(1000);
        continue;
      }

      //set up mining handlers
      auto hooker_ptr = get_lambda_hooker(
        [&](uint64_t const* nonces, uint32_t count) // found handler
        {
          if (m_stop)
          {
            LOG_PRINT_MAGENTA("Found " << count << " nonces, SKIPPED because stop flag has been raised", LOG_LEVEL_1);
            return true;
          }

          for (uint32_t i = 0; i < count; ++i)
          {
            uint64_t nonce = nonces[i];
            crypto::hash h = get_block_longhash(local_template_height, block_pow_template_hash, nonce);
            LOG_PRINT_MAGENTA("Found nonce [" << i+1 << "/" << count << "]: " << nonce << " (pow: " << h << ", boundary: 0x" << std::hex << std::setfill('0') << std::setw(16) << currency::difficulty_to_boundary(local_diff) << ", diff: " << std::dec << local_diff << ")", LOG_LEVEL_1);
            if (check_hash(h, local_diff))
            {
              //we lucky!
              b.nonce = nonce;

              LOG_PRINT_GREEN((m_benchmark_mode ? " (BENCHMARK MODE) " : "") << "Found block " << get_block_hash(b) << " HEIGHT " << local_template_height << " (pow: " << h << ") for difficulty: " << local_diff, LOG_LEVEL_0);
              //LOG_PRINT2("found_blocks", epee::string_tools::buff_to_hex_nodelimer(t_serializable_object_to_blob(b)), LOG_LEVEL_0);
              //stop();
              //return false;


              if (!m_benchmark_mode)
              {
                if (m_phandler->handle_block_found(b))
                {
                  //success, let's update config
                  ++m_config.current_extra_message_index;
                  epee::serialization::store_t_to_json_file(m_config, m_config_folder + "/" + MINER_CONFIG_FILENAME);
                }
                else
                {
                  LOG_PRINT_RED("handle_block_found failed for found block " << get_block_hash(b), LOG_LEVEL_0);
                }
              }
              //LOG_PRINT_MAGENTA("Ignoring other found nonces for this height!", LOG_LEVEL_0);
              break;
            }
            else
            {
              LOG_PRINT_MAGENTA("Found nonce [" << i+1 << "/" << count << "]: " << nonce << " doesn't met the requirements: pow: " << h << ", boundary: 0x" << std::hex << std::setfill('0') << std::setw(16) << currency::difficulty_to_boundary(local_diff) << ", diff: " << local_diff, LOG_LEVEL_0);
            }
          }
          return true;
        },

        [&](uint64_t start_nonce, uint32_t count)  //searched handler
        {
          m_hashes += count;
          return true;
        }
        );

      uint64_t upper_64_of_boundary = currency::difficulty_to_boundary(local_diff);
      LOG_PRINT_MAGENTA("[Search] request for difficulty " << local_diff << ", upper boundary: 0x" << std::hex << std::setfill('0') << std::setw(16) << upper_64_of_boundary, LOG_LEVEL_3);
      cl_miner_ptr->search((const uint8_t *)&block_pow_template_hash, upper_64_of_boundary, *static_cast<ethash_cl_miner::search_hook*>(hooker_ptr.get()));
      //LOG_PRINT_MAGENTA("[Search] request for difficulty " << local_diff << " returned ", LOG_LEVEL_3);
    }
    LOG_PRINT_L0("Miner thread stopped [" << th_local_index << "]");
    return true;
  }
  //-----------------------------------------------------------------------------------------------------
}

#endif
