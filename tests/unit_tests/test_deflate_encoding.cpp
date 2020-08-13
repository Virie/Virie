// Copyright (c) 2014-2020 The Virie Project
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include <gtest/gtest.h>

#include <include_base_utils.h>
#include <epee/include/zlib_helper.h>
#include <epee/include/gzip_encoding.h>
extern "C"
{
#include <crypto/random.h>
}

namespace
{
  void test_impl(std::string &encoded, const std::string &decoded)
  {
    struct decode_handler : public epee::net_utils::i_target_handler
    {
      virtual ~decode_handler() = default;

      bool handle_target_data(std::string &piece_of_transfer) override
      {
        if (result.empty())
          result.swap(piece_of_transfer);
        else
          result += piece_of_transfer;
        return true;
      }

      std::string result;
    };

    decode_handler dh;
    epee::net_utils::content_encoding_gzip encoder(&dh);

    if (encoded.size() > 3)
    {
      auto first_part = encoded.substr(0, encoded.size() / 2);
      auto second_part = encoded.substr(encoded.size() / 2, encoded.size() / 2);
      encoder.update_in(first_part);
      encoder.update_in(second_part);
    } else
      encoder.update_in(encoded);

    ASSERT_STREQ(decoded.c_str(), dh.result.c_str());
  }

  void test_impl(const std::string &data)
  {
    std::string encoded_data = data;
//    ASSERT_TRUE(epee::zlib_helper::pack(encoded_data));
//    test_impl(encoded_data, data);

    encoded_data = data;
    ASSERT_TRUE(epee::zlib_helper::pack_without_header(encoded_data));
    test_impl(encoded_data, data);
  }
}

TEST(test_inflate_encoding, test_inflate_encoding)
{
  std::string data;
  ASSERT_NO_FATAL_FAILURE(test_impl(data)); // empty

  for (size_t i = 1; i < 2048; ++i)
  {
    std::string data(i, ' ');
    ASSERT_NO_FATAL_FAILURE(test_impl(data)); // good compressible
    generate_random_bytes(i, &data[0]);
    ASSERT_NO_FATAL_FAILURE(test_impl(data));
  }

  // big sizes
  data.clear();
  for (size_t i = 1; i <= 5; ++i)
    for (size_t times = 0, mb = i * 1024 * 1024; times < 2; ++times)
    {
      std::string data2;
      data2.resize(mb);
      generate_random_bytes(mb, &data2[0]);
      ASSERT_NE(data, data2);
      data2.swap(data);
      ASSERT_NO_FATAL_FAILURE(test_impl(data));
    }
}
