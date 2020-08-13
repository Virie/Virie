// Copyright (c) 2014-2020 The Virie Project
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include <gtest/gtest.h>

#include "common/command_line.h"

template<typename T, typename from_t>
T **argvize(const from_t &from)
{
  T **argv = new T *[from.size()];
  for (auto i = 0; i < from.size(); ++i)
    argv[i] = const_cast<T *>(from[i].c_str());
  return argv;
}

TEST(argv_processor, argv_processor)
{
  std::vector<std::string> argv_vec = {
    "--argument_name_1", "argument_value_1",
    "--argument_value_1", "argument_value_2",
    "--argument_value_2=argument_value_3",
    "--argument_name_3", "argument_value_3",
    "--argument_name_4", "argument_value_4",
    "--argument_name_5=argument_value_5",
    "--argument_name_6=argument_value_6"
  };

  auto argv_vec_copy = argv_vec;

  std::vector<std::wstring> wargv_vec = {
    L"--argument_name_1", L"argument_value_1",
    L"--argument_value_1", L"argument_value_2",
    L"--argument_value_2=argument_value_3",
    L"--argument_name_3", L"argument_value_3",
    L"--argument_name_4", L"argument_value_4",
    L"--argument_name_5=argument_value_5",
    L"--argument_name_6=argument_value_6"
  };

  auto wargv_vec_copy = wargv_vec;

  auto **argv = argvize<char>(argv_vec);
  int argc = argv_vec.size();

  auto argv_processor = command_line::make_argv_processor(argc, argv);

  argv_processor.hide_secret("argument_name_1");
  argv_processor.hide_secret("argument_value_1");
  argv_processor.hide_secret("argument_name_4");
  argv_processor.hide_secret("argument_name_6");

  ASSERT_STREQ("--argument_name_1", argv_vec[0].c_str());
  ASSERT_STREQ("****************", argv_vec[1].c_str());
  ASSERT_STREQ("--argument_value_1", argv_vec[2].c_str());
  ASSERT_STREQ("****************", argv_vec[3].c_str());
  ASSERT_STREQ("--argument_value_2=argument_value_3", argv_vec[4].c_str());
  ASSERT_STREQ("--argument_name_3", argv_vec[5].c_str());
  ASSERT_STREQ("argument_value_3", argv_vec[6].c_str());
  ASSERT_STREQ("--argument_name_4", argv_vec[7].c_str());
  ASSERT_STREQ("****************", argv_vec[8].c_str());
  ASSERT_STREQ("--argument_name_5=argument_value_5", argv_vec[9].c_str());
  ASSERT_STREQ("--argument_name_6=****************", argv_vec[10].c_str());

  {
    auto argv_original = argv_processor.get_argv_original();
    for(size_t i = 0; i < argc; ++i)
      ASSERT_STREQ(argv_vec_copy[i].c_str(), argv_original[i]);
    ASSERT_EQ(argv_original[argc], nullptr); // for execv
  }

  {
    auto argv_utf8 = argv_processor.get_argv();
    for(size_t i = 0; i < argc; ++i)
      ASSERT_STREQ(argv_utf8[i], argv_vec_copy[i].c_str());
  }

  delete[] argv;

  auto **wargv = argvize<wchar_t>(wargv_vec);
  argc = wargv_vec.size();

  auto wargv_processor = command_line::make_argv_processor(argc, wargv);

  wargv_processor.hide_secret("argument_name_1");
  wargv_processor.hide_secret("argument_value_1");
  wargv_processor.hide_secret("argument_name_4");
  wargv_processor.hide_secret("argument_name_6");

  ASSERT_STREQ(L"--argument_name_1", wargv_vec[0].c_str());
  ASSERT_STREQ(L"****************", wargv_vec[1].c_str());
  ASSERT_STREQ(L"--argument_value_1", wargv_vec[2].c_str());
  ASSERT_STREQ(L"****************", wargv_vec[3].c_str());
  ASSERT_STREQ(L"--argument_value_2=argument_value_3", wargv_vec[4].c_str());
  ASSERT_STREQ(L"--argument_name_3", wargv_vec[5].c_str());
  ASSERT_STREQ(L"argument_value_3", wargv_vec[6].c_str());
  ASSERT_STREQ(L"--argument_name_4", wargv_vec[7].c_str());
  ASSERT_STREQ(L"****************", wargv_vec[8].c_str());
  ASSERT_STREQ(L"--argument_name_5=argument_value_5", wargv_vec[9].c_str());
  ASSERT_STREQ(L"--argument_name_6=****************", wargv_vec[10].c_str());

  {
    auto wargv_original = wargv_processor.get_argv_original();
    for(size_t i = 0; i < argc; ++i)
      ASSERT_STREQ(wargv_vec_copy[i].c_str(), wargv_original[i]);
    ASSERT_EQ(wargv_original[argc], nullptr); // for execv
  }

  {
    auto argv_utf8 = wargv_processor.get_argv();
    for(size_t i = 0; i < argc; ++i)
      ASSERT_STREQ(argv_utf8[i], argv_vec_copy[i].c_str());
  }

  delete[] wargv;
}
