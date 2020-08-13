// Copyright (c) 2014-2020 The Virie Project
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include <gtest/gtest.h>

#include "epee/include/string_tools.h"

using namespace epee;

TEST(string_tools, get_ip_string_from_int32) {
  auto test_impl = [](std::string &&ip_str_orig) {
    uint32_t ip;
    string_tools::get_ip_int32_from_string(ip, ip_str_orig);
    ASSERT_EQ(string_tools::get_ip_string_from_int32(ip), ip_str_orig);
  };

  const uint8_t values[] = {0, 10, 100, 255};
  for (size_t i0 : values)
    for (size_t i1 : values)
      for (size_t i2 : values)
        for (size_t i3 : values) {
          test_impl(
            std::to_string(i0) + "." + std::to_string(i1) + "." + std::to_string(i2) + "." + std::to_string(i3));
        }
}

TEST(string_tools, cut_off_extension)
{
  std::string str_with_extension = "string_tools.extension";
  std::string str_without_extension = "string_tools";
  ASSERT_EQ(epee::string_tools::cut_off_extension(str_with_extension), str_without_extension);
  ASSERT_EQ(epee::string_tools::cut_off_extension(str_without_extension), str_without_extension);

  std::wstring wstr_with_extension = L"string_tools.extension";
  std::wstring wstr_without_extension = L"string_tools";
  ASSERT_EQ(epee::string_tools::cut_off_extension(wstr_with_extension), wstr_without_extension);
  ASSERT_EQ(epee::string_tools::cut_off_extension(wstr_without_extension), wstr_without_extension);
}

TEST(string_tools, restore_from_hex)
{
  const std::string s1("1234567890abcdef");
  const std::string s1_res("\x12\x34\x56\x78\x90\xab\xcd\xef");
  const std::string s1_0res("\x12\x34\x56\x78\x90\xab\xcd\xef");
  const std::string s2("123456789abcdef");
  const std::string s2_res("\x12\x34\x56\x78\x9a\xbc\xde\x0f");
  const std::string s2_0res("\x01\x23\x45\x67\x89\xab\xcd\xef");

  std::string s_res;
  ASSERT_TRUE(string_tools::parse_hexstr_to_binbuff(s1,  s_res)) << "parse_hexstr_to_binbuff with: " << s1;
  ASSERT_EQ(s_res, s1_res);
  ASSERT_TRUE(string_tools::parse_0hexstr_to_binbuff(s1,  s_res)) << "parse_0hexstr_to_binbuff with: "<< s1;
  ASSERT_EQ(s_res, s1_0res);

  ASSERT_TRUE(string_tools::parse_hexstr_to_binbuff(s2,  s_res)) << "parse_hexstr_to_binbuff with: " << s2;
  ASSERT_EQ(s_res, s2_res);
  ASSERT_TRUE(string_tools::parse_0hexstr_to_binbuff(s2,  s_res)) << "parse_0hexstr_to_binbuff with: "<< s2;;
  ASSERT_EQ(s_res, s2_0res);
}