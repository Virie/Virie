// Copyright (c) 2014-2020 The Virie Project
// Copyright (c) 2012-2013 The Boolberry developers
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include <chrono>
#include <boost/thread.hpp>
#include "common/miniupnp_helper.h"

bool test_casual(uint32_t port)
{
  tools::miniupnp_helper hlpr;
  auto r = hlpr.start_regular_mapping({ { port, port }, { port, port + 1 }, { port + 2, port + 2 } }, 20 * 60 * 1000);
  CHECK_AND_ASSERT_MES(r, false, "failed to start_regular_mapping");
  boost::this_thread::sleep_for(boost::chrono::milliseconds(50000));
  r = hlpr.stop_mapping();
  CHECK_AND_ASSERT_MES(r, false, "failed to stop_mapping");
  return true;
}

#include <boost/algorithm/string.hpp>
#include <boost/asio.hpp>

using namespace boost::asio;

bool test_connection(const std::string &host, uint32_t port)
{
  io_service ios;
  std::atomic<bool> to_stop(false);
  auto t = boost::thread([&to_stop, &ios] ()
  {
    while (!to_stop)
    {
      ios.poll_one();
      ios.reset();
    }
  });

  ip::tcp::acceptor acceptor(ios, ip::tcp::endpoint(ip::tcp::v4(), port));
  ip::tcp::socket socket(ios);
  acceptor.async_accept(socket, [] (boost::system::error_code ec)
  {
    if (ec)
      LOG_ERROR(ec.message());
  });

  tools::miniupnp_helper hlpr;
  auto r = hlpr.start_regular_mapping({ { port, port } }, 20 * 60 * 1000);
  CHECK_AND_ASSERT_MES(r, false, "failed to start_regular_mapping");
  boost::this_thread::sleep_for(boost::chrono::milliseconds(5000));

  ip::tcp::endpoint ep(ip::address::from_string(host), port);
  ip::tcp::socket sock(ios);
  boost::system::error_code ec;
  sock.connect(ep, ec);

  to_stop = true;
  if (t.joinable())
    t.join();

  r = hlpr.stop_mapping();
  CHECK_AND_ASSERT_MES(r, false, "failed to stop_mapping");
  if(ec)
  {
    LOG_ERROR(ec.message());
    return false;
  }
  else
    sock.close();

  return true;
}

bool miniupnp_test(const std::string &host, uint32_t port)
{
  LOG_PRINT_L0("Starting miniupnp tests...");
  CHECK_AND_ASSERT_MES(test_casual(port), false, "failed test_casual()");
  CHECK_AND_ASSERT_MES(test_connection(host, port), false, "failed test_connection()");
  return true;
}