#include "gtest/gtest.h"
#include "epee/include/time_helper.h"

//This test works only in GMT+05 time zone, this is the reason why it turn off.
#if 0
TEST(time_helper, get_string_from_time_test) 
{
  std::vector <std::pair <std::string, int64_t>> times_for_get_time{
  std::make_pair("28.01.2020 00:00:00", 1580151600),
  std::make_pair("03.02.2020 00:00:00", 1580670000),
  std::make_pair("01.01.2020 00:00:00", 1577818800),
  std::make_pair("02.03.2020 00:00:00", 1583089200),
  std::make_pair("08.01.2020 00:00:00", 1578423600),
  std::make_pair("20.01.2020 00:00:00", 1579460400),
  std::make_pair("23.04.2020 12:27:08", 1587626828)};

  for (auto value : times_for_get_time)
  {
    std::string res;
    res = epee::misc_utils::get_time_str(value.second);
    ASSERT_EQ(res, value.first);
  }

  std::vector <std::pair <std::string, int64_t>> times_for_get_time_v2{
  std::make_pair("2020_01_28 00_00_00", 1580151600),
  std::make_pair("2020_02_03 00_00_00", 1580670000),
  std::make_pair("2020_01_01 00_00_00", 1577818800),
  std::make_pair("2020_03_02 00_00_00", 1583089200),
  std::make_pair("2020_01_08 00_00_00", 1578423600),
  std::make_pair("2020_01_20 00_00_00", 1579460400),
  std::make_pair("2020_04_23 12_27_08", 1587626828) };

  for (auto value : times_for_get_time_v2)
  {
    std::string res;
    res = epee::misc_utils::get_time_str_v2(value.second);
    ASSERT_EQ(res, value.first);
  }
}

TEST(time_helper, get_restore_string_from_time_test)
{
  std::vector <std::pair <std::string, int64_t>> good_times{
    std::make_pair("2020:1:28", 1580151600),
    std::make_pair("2020:02:03", 1580670000),
    std::make_pair("2020:01:01", 1577818800),
    std::make_pair("2020:3:2", 1583089200),
    std::make_pair("2020:01:8", 1578423600),
    std::make_pair("2020:01:20", 1579460400) };

  for (auto const &date : good_times)
  {
    time_t res_time = 0;
    ASSERT_TRUE(epee::misc_utils::get_restore_time_from_str(res_time, date.first));
    ASSERT_EQ(res_time, date.second);
  }

  std::vector<std::string> bad_times{
    "2020:99:99",
    "-2020:+3:30",
    "      2020     :    3  :  30",
    "2035:1:1",
    "2020:40:40",
    "2019:-11:1",
    "2019:-11:1",
    "2020:1:+1",
    "2020:1:-1",
    ""
  };

  for (auto const &date : bad_times)
  {
    time_t res_time = 0;
    ASSERT_FALSE(epee::misc_utils::get_restore_time_from_str(res_time, date));
  }
}
#endif