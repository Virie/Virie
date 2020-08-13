// Copyright (c) 2014-2020 The Virie Project
// Copyright (c) 2012-2013 The Cryptonote developers
// Copyright (c) 2012-2013 The Boolberry developers
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#pragma once 
#ifdef USE_OPENCL

#include <boost/atomic.hpp>
#include <boost/program_options.hpp>
#include <atomic>
#include "miner.h"


namespace currency
{
  /************************************************************************/
  /*                                                                      */
  /************************************************************************/
  class gpu_miner 
  {
  public: 
    gpu_miner(i_miner_handler* phandler);
    ~gpu_miner();
    bool init(const boost::program_options::variables_map& vm);
    bool deinit();
    static void init_options(boost::program_options::options_description& desc);
    bool on_block_chain_update();
    bool start(const account_public_address& adr, size_t threads_count);
    uint64_t get_speed();
    uint32_t get_threads_count() const;
    void send_stop_signal();
    bool stop();
    bool is_mining();
    bool on_idle();
    void on_synchronized();
    //synchronous analog (for fast calls)
    void pause();
    void resume();
    void do_print_hashrate(bool do_hr);
    static bool handle_cli_info_commands(const boost::program_options::variables_map& vm);
    static std::map<std::string, std::string> get_versions();
  private:



    bool set_block_template(const block& bl, const wide_difficulty_type& diffic, uint64_t height);
    bool worker_thread();
    bool request_block_template();
    void  merge_hr();
    
    struct miner_config
    {
      uint64_t current_extra_message_index;

      BEGIN_KV_SERIALIZE_MAP()
        KV_SERIALIZE(current_extra_message_index)
      END_KV_SERIALIZE_MAP()
    };


    volatile uint32_t m_stop;
    ::critical_section m_template_lock;
    block m_template;
    std::atomic<uint32_t> m_template_no;
    wide_difficulty_type m_diffic;
    uint64_t m_height;
    volatile uint32_t m_thread_index; 
    volatile uint32_t m_threads_total;
    std::atomic<int32_t> m_pausers_count;
    ::critical_section m_miners_count_lock;

    std::list<boost::thread> m_threads;
    ::critical_section m_threads_lock;
    i_miner_handler* m_phandler;
    account_public_address m_mine_address;
    math_helper::once_a_time_seconds<5> m_update_block_template_interval;
    math_helper::once_a_time_seconds<2> m_update_merge_hr_interval;
    std::vector<blobdata> m_extra_messages;
    miner_config m_config;
    std::string m_config_folder;    
    std::atomic<uint64_t> m_current_hash_rate;
    std::atomic<uint64_t> m_last_hr_merge_time;
    std::atomic<uint64_t> m_hashes;
    bool m_do_print_hashrate;
    bool m_do_mining;    
    bool m_benchmark_mode;
    wide_difficulty_type m_benchmark_diff;

    //GPU config
    unsigned m_global_work_size;
    unsigned m_local_work_size;
    unsigned m_ms_per_batch;
    unsigned m_opencl_platform;
    unsigned m_opencl_device;
    bool m_cl_allow_cpu;
    // default value is 350MB of GPU memory for other stuff (windows system rendering, e.t.c.)
    unsigned m_extra_gpu_memory;

  };
}


#endif// USE_OPENCL