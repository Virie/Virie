#include <boost/program_options.hpp>
#include "common/command_line.h"
#include <ctime>

#ifdef USE_ETHASH_CS
#include "common/ethash_manager_cs.h"
using ethash_cache_manager = crypto::ethash_cs::cache_manager_cs;
#else
#include "common/ethash_manager.h"
using ethash_cache_manager = crypto::ethash::cache_manager;
#endif

#include <fstream>
#include <string>
#include <boost/filesystem.hpp>
#include "crypto/hash.h"
#include "iostream"
#include "../io.h"
#include "currency_core/currency_core.h"
#include <cstdint>

#define GENERATE_NONCE_COUNT 1000
#define THREADS_COUNT 2
#define THREAD_REPEAT_COUNT 100

const char delimiter = ' ';

typedef crypto::hash chash;
struct hash_info
{
  uint64_t height;
  uint64_t nonce;
  chash header_hash;
  chash result_hash;
};

using namespace crypto;

namespace po = boost::program_options;

const command_line::arg_descriptor<bool> arg_test_generate = { "generate", "set to generate hashes", false};

const command_line::arg_descriptor<uint64_t> arg_test_generate_height_step = { "height_step", "height step for hashes generate", 1 };
const command_line::arg_descriptor<uint64_t> arg_test_hashes_count = { "hashes_count", "count of hashes to generate", 1000};
const command_line::arg_descriptor<std::string> arg_test_hashes_file = { "hashes_file", "file of hash table to create or open", "table.txt" };
const command_line::arg_descriptor<bool> arg_test_threading = { "threading", "test multithreading", false };

void generate_hash(ethash_cache_manager &cache_manager, uint64_t count, std::string &file, uint64_t height_step)
{
  std::ofstream output(file);
  if (!output.is_open())
  {
    std::cerr << "can't create file" << std::endl;
    return;
  }

  for (uint64_t height = 0; height < count; height++)
  {
    chash inputHash = crypto::rand<crypto::hash>();
    hash_info min_hashes;

    for (uint64_t j = 0; j <= GENERATE_NONCE_COUNT; j++)
    {
      hash_info hashes;
      hashes.height = height * height_step;
      hashes.nonce = j;
      hashes.header_hash = inputHash;
      cache_manager.get_hash(hashes.height, hashes.header_hash, hashes.nonce, hashes.result_hash);

      if (hashes.result_hash < min_hashes.result_hash || hashes.nonce == 0)
      {
        min_hashes = hashes;
      }
    }
    
    output << min_hashes.header_hash << delimiter << min_hashes.result_hash << delimiter
      << min_hashes.height << delimiter << min_hashes.nonce;
    if (height + 1 != count )
    {
      output << std::endl;
    }
  }
  output.close();
}

template <typename Manager_Type>
bool check_hashes_diff(Manager_Type &cache_manager, std::string &file)
{
  std::ifstream input(file);
  uint32_t test = 0;
  chash actual;
  std::string input_string;

  clock_t all_nonce_time = 0;
  clock_t min_value = 0;
  clock_t max_value = 0;
  if (!input.is_open())
  {
    std::cerr << "can't open file" << std::endl;
    return false;
  }
  clock_t Start = clock();

  hash_info tested_hash;
  while (!input.eof())
  {
    input >> tested_hash.header_hash >> tested_hash.result_hash >> tested_hash.height >> tested_hash.nonce;
    ++test;
    cache_manager.get_hash(tested_hash.height, tested_hash.header_hash, tested_hash.nonce, actual);
    if (tested_hash.result_hash != actual) 
    {
      std::cout << "Hash mismatch on test " << test << std::endl << "Input: ";
      std::cout << epee::string_tools::pod_to_hex(tested_hash.header_hash) << std::endl;

      std::cout << std::endl << "Expected hash: ";
      std::cout << epee::string_tools::pod_to_hex(tested_hash.result_hash) << std::endl;

      std::cout << std::endl << "Actual hash: ";
      std::cout << epee::string_tools::pod_to_hex(actual) << std::endl;
      return false;
    }
    uint32_t min_hash_nonce = 0;
    chash min_hash;
    clock_t begin_nonce_generate = clock();
    for (int j = 0; j < GENERATE_NONCE_COUNT; j++)
    {
      cache_manager.get_hash(tested_hash.height, tested_hash.header_hash, j, actual);
      if (actual < min_hash || j == 0)
      {
        min_hash = actual;
        min_hash_nonce = j;
      }
    }
    clock_t finished_time = clock() - begin_nonce_generate;

    if (min_hash_nonce != tested_hash.nonce)
    {
      std::cout << "min nonce mismatch on test " << test << std::endl << "Input:"
        << tested_hash.nonce << std::endl << "Actual:" << min_hash_nonce << std::endl;
      return false;
    }

    if (min_value == 0 && max_value == 0)
    {
      min_value = finished_time;
      max_value = finished_time;
    }
    if (finished_time < min_value)
    {
      min_value = finished_time;
    }
    if (finished_time > max_value)
    {
      max_value = finished_time;
    }
    all_nonce_time += finished_time;
  }
  input.close();
  std::cout << "Generate with 1000 " << "nonce average: " << all_nonce_time / test
    << "ms min value: " << min_value << "ms max value: " << max_value << "ms" << std::endl;
  std::cout << "test finished elapsed time " << clock() - Start << "ms" << std::endl;
  return true;
}
template <typename Manager_Type>
bool multithreading_test(Manager_Type &manager)
{
  std::vector<int> height_scenario{ 0, 0, ETHASH_EPOCH_LENGTH, 0, 0, ETHASH_EPOCH_LENGTH, ETHASH_EPOCH_LENGTH, 0, ETHASH_EPOCH_LENGTH, ETHASH_EPOCH_LENGTH };
  std::vector<hash_info> hashes_arr;
  std::vector<std::thread> threads_pool;
  std::cout << "thread test preparing";
  for (auto height : height_scenario)
  {
    std::cout << "." << std::flush;
    hash_info hashes;
    hashes.header_hash = crypto::rand<crypto::hash>();
    hashes.height = height;
    hashes.nonce = 0;
    manager.get_hash(hashes.height, hashes.header_hash, hashes.nonce, hashes.result_hash);
    hashes_arr.push_back(hashes);
  }
  std::cout << "end" << std::endl;

  std::atomic<bool> res{true};
  std::atomic<uint64_t> ms{0};

  std::cout << "start thread test" << std::endl;
  size_t index=0;
  for (auto hashes : hashes_arr)
  {
    std::thread work_thread = std::thread([&](const hash_info & hi, size_t index)
      {
        std::cout << "[" << index << "] epoch: " << hi.height << " started "<<std::endl;
        clock_t start = clock();
        for (int j = 0; j < THREAD_REPEAT_COUNT; j++)
        {
          chash result_hash;
          manager.get_hash(hi.height, hi.header_hash, hi.nonce, result_hash);
          if (result_hash != hi.result_hash)
          {
            std::cout << "hashes mismatch" << std::endl;
            res = false;
            break;
          }
        }
        auto delay = clock() - start;
        std::cout << "[" << index << "] epoch: " << hi.height << ", delay: " << delay << " ms"<< std::endl;
        ms += delay;
      }, hashes, index++);
    threads_pool.push_back(std::move(work_thread));
  }
  for (auto &th : threads_pool)
  {
    th.join();
  }
  std::cout << "test finished in " << ms << "ms (without join), res: " << (res ? "good" : "bad")<< std::endl;
  return res;
}

int main(int argc, char *argv[]) {
  po::options_description desc_options("Allowed options");
  command_line::add_arg(desc_options, command_line::arg_help);
  command_line::add_arg(desc_options, arg_test_generate_height_step);
  command_line::add_arg(desc_options, arg_test_generate);
  command_line::add_arg(desc_options, arg_test_hashes_count);
  command_line::add_arg(desc_options, arg_test_hashes_file);
  command_line::add_arg(desc_options, arg_test_threading);

  po::variables_map vm;
  bool r = command_line::handle_error_helper(desc_options, [&]()
    {
      po::store(po::parse_command_line(argc, argv, desc_options), vm);
      po::notify(vm);
      return true;
    });
  if (!r)
    return 1;

  if (command_line::get_arg(vm, command_line::arg_help))
  {
    std::cout << desc_options << std::endl;
    return 0;
  }
  if (command_line::get_arg(vm, arg_test_hashes_file).empty())
  {
    std::cout << desc_options << std::endl;
    return 0;
  }

  uint64_t height_step = command_line::get_arg(vm, arg_test_generate_height_step);
  std::string file_name = command_line::get_arg(vm, arg_test_hashes_file);
  bool generate = command_line::get_arg(vm, arg_test_generate);  
  bool threading_test = command_line::get_arg(vm, arg_test_threading);;
  
  
  if (generate)
  {
#ifndef USE_ETHASH_CS
    uint64_t count = command_line::get_arg(vm, arg_test_hashes_count);
    ethash_cache_manager cache_manager;
    std::cout << "start generate hashes" << std::endl;
    generate_hash(cache_manager, count, file_name, height_step);
    std::cout << "generated finished" << std::endl;
#endif
  }
  else if (threading_test)
  {
    std::cout << "start threading_test" << std::endl;
    ethash_cache_manager cache_manager;
    multithreading_test(cache_manager);
  }
  else
  {
    std::cout << "check diff" << std::endl;
    ethash_cache_manager cache_manager;
    check_hashes_diff(cache_manager, file_name);
  }
  return 0;
}