// Copyright (c) 2012-2013 The Cryptonote developers
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include <cstring>
#include <cstdint>
#include <cstdio>
#include <iostream>
#include <vector>
#include <boost/foreach.hpp>
#include "currency_core/currency_basic.h"
#include "currency_core/currency_format_utils.h"
#include "serialization/serialization.h"
#include "serialization/binary_archive.h"
#include "serialization/json_archive.h"
#include "serialization/debug_archive.h"
#include "serialization/variant.h"
#include "serialization/binary_utils.h"
#include "common/boost_serialization_helper.h"
#include "gtest/gtest.h"
using namespace std;

struct Struct
{
  int32_t a;
  int32_t b;
  char blob[8];
};

template <class Archive>
struct serializer<Archive, Struct>
{
  static bool serialize(Archive &ar, Struct &s) {
    ar.begin_object();
    ar.tag("a");
    ar.serialize_int(s.a);
    ar.tag("b");
    ar.serialize_int(s.b);
    ar.tag("blob");
    ar.serialize_blob(s.blob, sizeof(s.blob));
    ar.end_object();
    return true;
  }
};

struct Struct1
{
  vector<boost::variant<Struct, int32_t>> si;
  vector<int16_t> vi;

  BEGIN_SERIALIZE_OBJECT()
    FIELD(si)
    FIELD(vi)
  END_SERIALIZE()
  /*template <bool W, template <bool> class Archive>
  bool do_serialize(Archive<W> &ar)
  {
    ar.begin_object();
    ar.tag("si");
    ::do_serialize(ar, si);
    ar.tag("vi");
    ::do_serialize(ar, vi);
    ar.end_object();
  }*/
};

struct Blob
{
  uint64_t a;
  uint32_t b;

  bool operator==(const Blob& rhs) const
  {
    return a == rhs.a;
  }
};

VARIANT_TAG(binary_archive, Struct, 0xe0);
VARIANT_TAG(binary_archive, int, 0xe1);
VARIANT_TAG(json_archive, Struct, "struct");
VARIANT_TAG(json_archive, int, "int");
VARIANT_TAG(debug_archive, Struct1, "struct1");
VARIANT_TAG(debug_archive, Struct, "struct");
VARIANT_TAG(debug_archive, int, "int");

BLOB_SERIALIZER(Blob);

bool try_parse(const string &blob)
{
  Struct1 s1;
  return serialization::parse_binary(blob, s1);
}

TEST(Serialization, BinaryArchiveInts) {
  uint64_t x = 0xff00000000, x1;

  ostringstream oss;
  binary_archive<true> oar(oss);
  oar.serialize_int(x);
  ASSERT_TRUE(oss.good());
  std::string str = oss.str();
  ASSERT_EQ(8, str.size());
  ASSERT_EQ(string("\0\0\0\0\xff\0\0\0", 8), str);

  istringstream iss(str);
  binary_archive<false> iar(iss);
  iar.serialize_int(x1);
  ASSERT_EQ(8, iss.tellg());
  ASSERT_TRUE(iss.good());

  ASSERT_EQ(x, x1);
}

TEST(Serialization, BinaryArchiveVarInts) {
  uint64_t x = 0xff00000000, x1;

  ostringstream oss;
  binary_archive<true> oar(oss);
  oar.serialize_varint(x);
  ASSERT_TRUE(oss.good());
  std::string str = oss.str();
  ASSERT_EQ(6, str.size());
  ASSERT_EQ(string("\x80\x80\x80\x80\xF0\x1F", 6), str);

  istringstream iss(str);
  binary_archive<false> iar(iss);
  iar.serialize_varint(x1);
  ASSERT_TRUE(iss.good());
  ASSERT_EQ(x, x1);
}

TEST(Serialization, Test1) {
  ostringstream str;
  binary_archive<true> ar(str);

  Struct1 s1;
  s1.si.push_back(0);
  {
    Struct s;
    s.a = 5;
    s.b = 65539;
    std::memcpy(s.blob, "12345678", 8);
    s1.si.push_back(s);
  }
  s1.si.push_back(1);
  s1.vi.push_back(10);
  s1.vi.push_back(22);

  string blob;
  ASSERT_TRUE(serialization::dump_binary(s1, blob));
  ASSERT_TRUE(try_parse(blob));

  ASSERT_EQ('\xE0', blob[6]);
  blob[6] = '\xE1';
  ASSERT_FALSE(try_parse(blob));
  blob[6] = '\xE2';
  ASSERT_FALSE(try_parse(blob));
}

TEST(Serialization, Overflow) {
  Blob x = { 0xff00000000 };
  Blob x1;

  string blob;
  ASSERT_TRUE(serialization::dump_binary(x, blob));
  ASSERT_EQ(sizeof(Blob), blob.size());

  ASSERT_TRUE(serialization::parse_binary(blob, x1));
  ASSERT_EQ(x, x1);

  vector<Blob> bigvector;
  ASSERT_FALSE(serialization::parse_binary(blob, bigvector));
  ASSERT_EQ(0, bigvector.size());
}

TEST(Serialization, serializes_vector_uint64_as_varint)
{
  std::vector<uint64_t> v;
  string blob;

  ASSERT_TRUE(serialization::dump_binary(v, blob));
  ASSERT_EQ(1, blob.size());

  // +1 byte
  v.push_back(0);
  ASSERT_TRUE(serialization::dump_binary(v, blob));
  ASSERT_EQ(2, blob.size());

  // +1 byte
  v.push_back(1);
  ASSERT_TRUE(serialization::dump_binary(v, blob));
  ASSERT_EQ(3, blob.size());

  // +2 bytes
  v.push_back(0x80);
  ASSERT_TRUE(serialization::dump_binary(v, blob));
  ASSERT_EQ(5, blob.size());

  // +2 bytes
  v.push_back(0xFF);
  ASSERT_TRUE(serialization::dump_binary(v, blob));
  ASSERT_EQ(7, blob.size());

  // +2 bytes
  v.push_back(0x3FFF);
  ASSERT_TRUE(serialization::dump_binary(v, blob));
  ASSERT_EQ(9, blob.size());

  // +3 bytes
  v.push_back(0x40FF);
  ASSERT_TRUE(serialization::dump_binary(v, blob));
  ASSERT_EQ(12, blob.size());

  // +10 bytes
  v.push_back(0xFFFFFFFFFFFFFFFF);
  ASSERT_TRUE(serialization::dump_binary(v, blob));
  ASSERT_EQ(22, blob.size());
}

TEST(Serialization, serializes_vector_int64_as_fixed_int)
{
  std::vector<int64_t> v;
  string blob;

  ASSERT_TRUE(serialization::dump_binary(v, blob));
  ASSERT_EQ(1, blob.size());

  // +8 bytes
  v.push_back(0);
  ASSERT_TRUE(serialization::dump_binary(v, blob));
  ASSERT_EQ(9, blob.size());

  // +8 bytes
  v.push_back(1);
  ASSERT_TRUE(serialization::dump_binary(v, blob));
  ASSERT_EQ(17, blob.size());

  // +8 bytes
  v.push_back(0x80);
  ASSERT_TRUE(serialization::dump_binary(v, blob));
  ASSERT_EQ(25, blob.size());

  // +8 bytes
  v.push_back(0xFF);
  ASSERT_TRUE(serialization::dump_binary(v, blob));
  ASSERT_EQ(33, blob.size());

  // +8 bytes
  v.push_back(0x3FFF);
  ASSERT_TRUE(serialization::dump_binary(v, blob));
  ASSERT_EQ(41, blob.size());

  // +8 bytes
  v.push_back(0x40FF);
  ASSERT_TRUE(serialization::dump_binary(v, blob));
  ASSERT_EQ(49, blob.size());

  // +8 bytes
  v.push_back(0xFFFFFFFFFFFFFFFF);
  ASSERT_TRUE(serialization::dump_binary(v, blob));
  ASSERT_EQ(57, blob.size());
}

namespace
{
  template<typename T>
  std::vector<T> linearize_vector2(const std::vector< std::vector<T> >& vec_vec)
  {
    std::vector<T> res;
    BOOST_FOREACH(const auto& vec, vec_vec)
    {
      res.insert(res.end(), vec.begin(), vec.end());
    }
    return res;
  }
}

bool test_get_varint_packed_size_for_num(uint64_t n)
{
  std::stringstream ss;
  typedef std::ostreambuf_iterator<char> it;
  tools::write_varint(it(ss), n);
  return ss.str().size() == tools::get_varint_packed_size(n);
}

TEST(Serialization, validate_get_varint_packed_size)
{
  ASSERT_TRUE(test_get_varint_packed_size_for_num(0ull));

  ASSERT_TRUE(test_get_varint_packed_size_for_num(0x7Full));
  ASSERT_TRUE(test_get_varint_packed_size_for_num(0x7Full + 1));

  ASSERT_TRUE(test_get_varint_packed_size_for_num(0x3FFFull));
  ASSERT_TRUE(test_get_varint_packed_size_for_num(0x3FFFull + 1));

  ASSERT_TRUE(test_get_varint_packed_size_for_num(0x1FFFFFull));
  ASSERT_TRUE(test_get_varint_packed_size_for_num(0x1FFFFFull + 1));

  ASSERT_TRUE(test_get_varint_packed_size_for_num(0xFFFFFFFull));
  ASSERT_TRUE(test_get_varint_packed_size_for_num(0xFFFFFFFull + 1));

  ASSERT_TRUE(test_get_varint_packed_size_for_num(0x7FFFFFFFFull));
  ASSERT_TRUE(test_get_varint_packed_size_for_num(0x7FFFFFFFFull + 1));

  ASSERT_TRUE(test_get_varint_packed_size_for_num(0x3FFFFFFFFFFull));
  ASSERT_TRUE(test_get_varint_packed_size_for_num(0x3FFFFFFFFFFull + 1));

  ASSERT_TRUE(test_get_varint_packed_size_for_num(0x1FFFFFFFFFFFFull));
  ASSERT_TRUE(test_get_varint_packed_size_for_num(0x1FFFFFFFFFFFFull + 1));

  ASSERT_TRUE(test_get_varint_packed_size_for_num(0xFFFFFFFFFFFFFFull));
  ASSERT_TRUE(test_get_varint_packed_size_for_num(0xFFFFFFFFFFFFFFull + 1));

  ASSERT_TRUE(test_get_varint_packed_size_for_num(0x7FFFFFFFFFFFFFFFull));
  ASSERT_TRUE(test_get_varint_packed_size_for_num(0x7FFFFFFFFFFFFFFFull + 1));

  ASSERT_TRUE(test_get_varint_packed_size_for_num(~0ull));
}

TEST(Serialization, serializes_transacion_signatures_correctly)
{
  using namespace currency;

  transaction tx;
  transaction tx1;
  string blob;

  // Empty tx
  tx = AUTO_VAL_INIT(tx);
  ASSERT_TRUE(serialization::dump_binary(tx, blob));
  ASSERT_EQ(6, blob.size()); // 5 bytes + 0 bytes extra + 0 bytes signatures
  ASSERT_TRUE(serialization::parse_binary(blob, tx1));
  if (!(tx == tx1))
  {
    ASSERT_TRUE(false);
  }
  
  ASSERT_EQ(linearize_vector2(tx.signatures), linearize_vector2(tx1.signatures));

  // Miner tx without signatures
  txin_gen txin_gen1;
  txin_gen1.height = 0;
  tx = AUTO_VAL_INIT(tx);
  tx.vin.push_back(txin_gen1);
  ASSERT_TRUE(serialization::dump_binary(tx, blob));
  ASSERT_EQ(8, blob.size()); // 5 bytes + 2 bytes vin[0] + 0 bytes extra + 0 bytes signatures
  ASSERT_TRUE(serialization::parse_binary(blob, tx1));
  if (!(tx == tx1))
  {
    ASSERT_TRUE(false);
  }
  ASSERT_EQ(linearize_vector2(tx.signatures), linearize_vector2(tx1.signatures));

  // Miner tx with empty signatures 2nd vector
  tx.signatures.resize(1);
  ASSERT_TRUE(serialization::dump_binary(tx, blob));
  ASSERT_EQ(9, blob.size()); // 5 bytes + 2 bytes vin[0] + 0 bytes extra + 0 bytes signatures + counter
  ASSERT_TRUE(serialization::parse_binary(blob, tx1));
  if (!(tx == tx1))
  {
    ASSERT_TRUE(false);
  }
  ASSERT_EQ(linearize_vector2(tx.signatures), linearize_vector2(tx1.signatures));

  //TX VALIDATION REMOVED FROM SERIALIZATION
  /*
  // Miner tx with one signature
  tx.signatures[0].resize(1);
  ASSERT_FALSE(serialization::dump_binary(tx, blob));

  // Miner tx with 2 empty vectors
  tx.signatures.resize(2);
  tx.signatures[0].resize(0);
  tx.signatures[1].resize(0);
  ASSERT_FALSE(serialization::dump_binary(tx, blob));

  // Miner tx with 2 signatures
  tx.signatures[0].resize(1);
  tx.signatures[1].resize(1);
  ASSERT_FALSE(serialization::dump_binary(tx, blob));
  */

  // Two txin_gen, no signatures
  tx.vin.push_back(txin_gen1);
  tx.signatures.resize(0);
  ASSERT_TRUE(serialization::dump_binary(tx, blob));
  ASSERT_EQ(10, blob.size()); // 5 bytes + 2 * 2 bytes vins + 0 bytes extra + 0 bytes signatures
  ASSERT_TRUE(serialization::parse_binary(blob, tx1));
  if (!(tx == tx1))
  {
    ASSERT_TRUE(false);
  }
  ASSERT_EQ(linearize_vector2(tx.signatures), linearize_vector2(tx1.signatures));

  // Two txin_gen, signatures vector contains only one empty element
  //tx.signatures.resize(1);
  //ASSERT_FALSE(serialization::dump_binary(tx, blob));

  // Two txin_gen, signatures vector contains two empty elements
  tx.signatures.resize(2);
  ASSERT_TRUE(serialization::dump_binary(tx, blob));
  ASSERT_EQ(12, blob.size()); // 5 bytes + 2 * 2 bytes vins + 0 bytes extra + 0 bytes signatures
  ASSERT_TRUE(serialization::parse_binary(blob, tx1));
  if (!(tx == tx1))
  {
    ASSERT_TRUE(false);
  }
  ASSERT_EQ(linearize_vector2(tx.signatures), linearize_vector2(tx1.signatures));

  // Two txin_gen, signatures vector contains three empty elements
  //tx.signatures.resize(3);
  //ASSERT_FALSE(serialization::dump_binary(tx, blob));

  // Two txin_gen, signatures vector contains two non empty elements
  //tx.signatures.resize(2);
  //tx.signatures[0].resize(1);
  //tx.signatures[1].resize(1);
  //ASSERT_FALSE(serialization::dump_binary(tx, blob));

  // A few bytes instead of signature
  tx.vin.clear();
  tx.vin.push_back(txin_gen1);
  tx.signatures.clear();
  ASSERT_TRUE(serialization::dump_binary(tx, blob));
  blob.append(std::string(sizeof(crypto::signature) / 2, 'x'));
  ASSERT_FALSE(serialization::parse_binary(blob, tx1));

  // blob contains one signature
  blob.append(std::string(sizeof(crypto::signature) / 2, 'y'));
  ASSERT_FALSE(serialization::parse_binary(blob, tx1));

  // Not enough signature vectors for all inputs
  //txin_to_key txin_to_key1;
  //txin_to_key1.key_offsets.resize(2);
  //tx.vin.clear();
  //tx.vin.push_back(txin_to_key1);
  //tx.vin.push_back(txin_to_key1);
  //tx.signatures.resize(1);
  //tx.signatures[0].resize(2);
  //ASSERT_FALSE(serialization::dump_binary(tx, blob));
  
  
  
  /*
  // Too much signatures for two inputs
  tx.signatures.resize(3);
  tx.signatures[0].resize(2);
  tx.signatures[1].resize(2);
  tx.signatures[2].resize(2);
  ASSERT_FALSE(serialization::dump_binary(tx, blob));

  // First signatures vector contains too little elements
  tx.signatures.resize(2);
  tx.signatures[0].resize(1);
  tx.signatures[1].resize(2);
  ASSERT_FALSE(serialization::dump_binary(tx, blob));

  // First signatures vector contains too much elements
  tx.signatures.resize(2);
  tx.signatures[0].resize(3);
  tx.signatures[1].resize(2);
  ASSERT_FALSE(serialization::dump_binary(tx, blob));

  // There are signatures for each input
  tx.signatures.resize(2);
  tx.signatures[0].resize(2);
  tx.signatures[1].resize(2);
  ASSERT_TRUE(serialization::dump_binary(tx, blob));
  ASSERT_TRUE(serialization::parse_binary(blob, tx1));
  ASSERT_EQ(tx, tx1);
  ASSERT_EQ(linearize_vector2(tx.signatures), linearize_vector2(tx1.signatures));

  // Blob doesn't contain enough data
  blob.resize(blob.size() - sizeof(crypto::signature) / 2);
  ASSERT_FALSE(serialization::parse_binary(blob, tx1));

  // Blob contains too much data
  blob.resize(blob.size() + sizeof(crypto::signature));
  ASSERT_FALSE(serialization::parse_binary(blob, tx1));

  // Blob contains one excess signature
  blob.resize(blob.size() + sizeof(crypto::signature) / 2);
  ASSERT_FALSE(serialization::parse_binary(blob, tx1));
  */
}

struct portable_serialize_struct
{
  bool bool_1 = true;
  bool bool_2 = false;

  uint8_t uint8_t_1 = 0x00;
  uint8_t uint8_t_2 = 0xff;

  int8_t int8_t_1 = 0x00;
  int8_t int8_t_2 = 0xff;

  uint16_t uint16_t_1 = 0x0000;
  uint16_t uint16_t_2 = 0xffff;
  uint16_t uint16_t_3 = 0x1234;
  uint16_t uint16_t_4 = 0xff00;

  int16_t int16_t_1 = 0x0000;
  int16_t int16_t_2 = 0xffff;
  int16_t int16_t_3 = 0x1234;
  int16_t int16_t_4 = 0xff00;

  uint32_t uint32_t_1 = 0x00000000;
  uint32_t uint32_t_2 = 0xffffffff;
  uint32_t uint32_t_3 = 0x12345678;
  uint32_t uint32_t_4 = 0xff000000;

  int32_t int32_t_1 = 0x00000000;
  int32_t int32_t_2 = 0xffffffff;
  int32_t int32_t_3 = 0x12345678;
  int32_t int32_t_4 = 0xff000000;

  uint64_t uint64_t_1 = 0x0000000000000000;
  uint64_t uint64_t_2 = 0xffffffffffffffff;
  uint64_t uint64_t_3 = 0x123456789abcdef1;
  uint64_t uint64_t_4 = 0xff00000000000000;

  int64_t int64_t_1 = 0x0000000000000000;
  int64_t int64_t_2 = 0xffffffffffffffff;
  int64_t int64_t_3 = 0x123456789abcdef1;
  int64_t int64_t_4 = 0xff00000000000000;

  template <class t_archive>
  inline void serialize(t_archive &a, const unsigned int ver)
  {
    a & bool_1;
    a & bool_2;

    a & uint8_t_1;
    a & uint8_t_2;

    a & int8_t_1;
    a & int8_t_2;

    a & uint16_t_1;
    a & uint16_t_2;
    a & uint16_t_3;
    a & uint16_t_4;

    a & int16_t_1;
    a & int16_t_2;
    a & int16_t_3;
    a & int16_t_4;

    a & uint32_t_1;
    a & uint32_t_2;
    a & uint32_t_3;
    a & uint32_t_4;

    a & int32_t_1;
    a & int32_t_2;
    a & int32_t_3;
    a & int32_t_4;

    a & uint64_t_1;
    a & uint64_t_2;
    a & uint64_t_3;
    a & uint64_t_4;

    a & int64_t_1;
    a & int64_t_2;
    a & int64_t_3;
    a & int64_t_4;
  }
};

TEST(Serialization, portable_serialization)
{
  std::string origin_hex = "7f010b00000154000001ff00ffff0002ffff0234120200ff00ffff023412ff000004ffffffff047856341204000000ff00ffff0478563412fd0000000008ffffffffffffffff08f1debc9a785634120800000000000000ff00ffff08f1debc9a78563412f900000000000000";

  portable_serialize_struct origin;
  std::stringstream s;

  bool r = tools::portble_serialize_obj_to_stream(origin, s);
  ASSERT_TRUE(r);

  ASSERT_STREQ(epee::string_tools::buff_to_hex_nodelimer(s.str()).c_str(), origin_hex.c_str());

  portable_serialize_struct o;
  memset(reinterpret_cast<void *>(&o), 0, sizeof(o));
  r = tools::portable_unserialize_obj_from_stream(o, s);
  ASSERT_TRUE(r);

  r = memcmp(reinterpret_cast<void *>(&o), reinterpret_cast<void *>(&origin), sizeof(o)) == 0;
  ASSERT_TRUE(r);
}