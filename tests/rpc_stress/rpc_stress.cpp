#include <wallet/core_default_rpc_proxy.h>
#include <common/command_line.h>
#include <boost/program_options.hpp>


void try_requests(const std::string &address)
{
  auto core_proxy = std::unique_ptr<tools::i_core_proxy>(new tools::default_http_core_proxy);
  core_proxy->set_connection_addr(address);

  for (std::size_t i = 0; i < 10; ++i)
  {
    {
      currency::COMMAND_RPC_GET_INFO::request req = AUTO_VAL_INIT(req);
      req.flags = COMMAND_RPC_GET_INFO_FLAG_ALL_FLAGS;
      currency::COMMAND_RPC_GET_INFO::response res = AUTO_VAL_INIT(res);
      CHECK_AND_ASSERT_THROW_MES(core_proxy->call_COMMAND_RPC_GET_INFO(req, res), "Failed to RPC request.");
    }

    {
      currency::COMMAND_RPC_GET_TX_POOL::request req = AUTO_VAL_INIT(req);
      currency::COMMAND_RPC_GET_TX_POOL::response res = AUTO_VAL_INIT(res);
      CHECK_AND_ASSERT_THROW_MES(core_proxy->call_COMMAND_RPC_GET_TX_POOL(req, res), "Failed to RPC request.");
    }

    {
      currency::COMMAND_RPC_GET_BLOCKS_DETAILS::request req = AUTO_VAL_INIT(req);
      currency::COMMAND_RPC_GET_BLOCKS_DETAILS::response res = AUTO_VAL_INIT(res);
      req.height_start = 0;
      req.count = 1;
      req.ignore_transactions = true;
      CHECK_AND_ASSERT_THROW_MES(core_proxy->call_COMMAND_RPC_GET_BLOCKS_DETAILS(req, res), "Failed to RPC request.");
    }
  }

  LOG_PRINT_GREEN("Tests of thread " << std::this_thread::get_id() << " passed.", LOG_LEVEL_0);
}

void test(std::string address)
{
  std::list<std::thread> thread_pool;
  for (std::size_t i = 0; i < 100; ++i)
    thread_pool.emplace_back([&address] () { try_requests(address); });
  for (auto &t : thread_pool)
    if (t.joinable())
      t.join();
  thread_pool.clear();
}

namespace po = boost::program_options;

namespace
{
  const command_line::arg_descriptor<std::string> arg_address  = { "address", "Address of RPC server.", "http://127.0.0.1:11512" };
}

int main(int argc, char* argv[])
{
  epee::log_space::get_set_log_detalisation_level(true, LOG_LEVEL_0);
  epee::log_space::log_singletone::add_logger(LOGGER_CONSOLE, nullptr, nullptr, LOG_LEVEL_2);

  po::options_description desc_options("Allowed options");
  command_line::add_arg(desc_options, command_line::arg_help);

  command_line::add_arg(desc_options, arg_address);

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

  auto address = command_line::get_arg(vm, arg_address);
  test(std::move(address));
}