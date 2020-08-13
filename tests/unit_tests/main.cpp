// Copyright (c) 2014-2020 The Virie Project
// Copyright (c) 2012-2013 The Cryptonote developers
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include "gtest/gtest.h"
#include "version.h"

#include "include_base_utils.h"

int main(int argc, char** argv)
{
  epee::debug::get_set_enable_assert(true, false);

  epee::log_space::get_set_log_detalisation_level(true, LOG_LEVEL_2);
  epee::log_space::log_singletone::add_logger(LOGGER_CONSOLE, NULL, NULL, LOG_LEVEL_MAX);
  epee::log_space::log_singletone::add_logger(LOGGER_FILE, "unittests.log", "unittests_log");

  LOG_PRINT_L0("Test built on a commit: [" << BUILD_COMMIT_ID << "]");

  ::testing::InitGoogleTest(&argc, argv);

  const auto r = RUN_ALL_TESTS();

  const auto total_test_case_count = ::testing::UnitTest::GetInstance()->total_test_case_count();
  for (size_t i = 0; i < total_test_case_count; ++i)
  {
    auto *test_case = testing::UnitTest::GetInstance()->GetTestCase(i);
    if (test_case->name() == std::string("rpc_serialization") && test_case->Failed())
    {
      LOG_PRINT_MAGENTA(ENDL <<
        "*******************************************************************************************************" << ENDL <<
        "RPC SERIALIZATION TEST was failed.  When changing RPC requests, be sure to adjust the documentation !!!" << ENDL <<
        "*******************************************************************************************************",
        LOG_LEVEL_0);
      break;
    }
  }

  return r;
}
