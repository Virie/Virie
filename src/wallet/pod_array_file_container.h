// Copyright (c) 2014-2019 The Virie Project
// Copyright (c) 2012-2013 The Cryptonote developers
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#pragma once

#include <unordered_map>
#include <boost/filesystem/fstream.hpp>
#include <boost/filesystem/operations.hpp>
#include <boost/serialization/serialization.hpp>

#include "include_base_utils.h"
#include "crypto/crypto.h"

namespace tools
{
  namespace fs = boost::filesystem;

  template<typename pod_t, uint64_t orig_signature, uint64_t orig_version>
  class pod_array_file_container
  {
    static_assert(std::is_pod<pod_t>::value, "pod_t must be pod");
  public:
    pod_array_file_container() = default;
    pod_array_file_container(const pod_array_file_container &) = delete;
    pod_array_file_container &operator=(const pod_array_file_container &) = delete;
    ~pod_array_file_container() { close(); }

#pragma pack(push, 1)
    struct header_t
    {
      uint64_t signature;
      uint64_t version;
    };
#pragma pack (pop)

    bool open(const std::wstring& filename, bool create_if_not_exist = true)
    {
      m_filename = filename;
      m_size = 0;

      if (!fs::exists(filename))
        return create_if_not_exist ? create() : false;

      auto sz = fs::file_size(filename);
      if (sz < sizeof(header_t))
        return create();
      else if (auto trunc_sz = (sz - sizeof(header_t)) % sizeof(pod_t))
        fs::resize_file(filename, sz - trunc_sz);

      m_stream.open(m_filename, std::ios::binary | std::ios::in | std::ios::out | std::ios::app);
      CHECK_AND_ASSERT_MES(is_good(), false, "can not open file");

      header_t h;
      m_stream.seekg(0, std::ios::beg);
      m_stream.read(reinterpret_cast<char *>(&h), sizeof(h));
      CHECK_AND_ASSERT_MES(is_good(), false, "can not read from file");
      m_stream.seekg(0, std::ios::end);

      m_size = (sz - sizeof(header_t)) / sizeof(pod_t);

      return orig_signature == h.signature || create();
    }

    void close()
    {
      if (m_stream.is_open()) m_stream.close();
    }

    bool push_back(const pod_t& item)
    {
      CHECK_AND_ASSERT(is_good(), false);
      m_stream.write(reinterpret_cast<const char *>(&item), sizeof(item));
      CHECK_AND_ASSERT(is_good(), false);
      m_stream.flush();
      m_size++;
      return true;
    }

    template<typename cb_t>
    bool read_all(cb_t &&cb)
    {
      CHECK_AND_ASSERT_MES(is_good(), false, "file is not opened or failed");
      m_stream.seekg(sizeof(header_t));
      while (m_stream.rdstate() == std::ios::goodbit)
      {
        pod_t value;
        m_stream.read(reinterpret_cast<char *>(&value), sizeof(value));
        if (is_good()) cb(value);
      }
      m_stream.clear();
      return true;
    }

    bool clear()
    {
      close();
      return create();
    }

    std::size_t size() const { return m_size; }

  private:
    std::wstring m_filename;
    mutable std::size_t m_size = 0;
    mutable fs::fstream m_stream;

    bool create()
    {
      if (fs::exists(m_filename))
        fs::remove(m_filename);
      m_size = 0;
      m_stream.open(m_filename, std::ios::binary | std::ios::in | std::ios::out | std::ios::app);
      CHECK_AND_ASSERT_MES(is_good(), false, "can not open file");
      header_t h { orig_signature, orig_version };
      m_stream.write(reinterpret_cast<char *>(&h), sizeof(h));
      m_stream.flush();
      CHECK_AND_ASSERT_MES(is_good(), false, "can not write to file");
      return true;
    }

    bool is_good() const
    {
      return m_stream.is_open() && (m_stream.rdstate() == std::ios::goodbit || m_stream.rdstate() == std::ios::eofbit);
    }
  };

#pragma pack(push, 1)
  struct out_key_to_ki
  {
    crypto::public_key out_key;
    crypto::key_image  key_image;
  };
#pragma pack(pop)

  struct key_images_container
  {
  public:
    using key_images_map = std::unordered_map<crypto::public_key, crypto::key_image>;

    key_images_container() = default;
    key_images_container(const key_images_container &) = delete;
    key_images_container &operator=(const key_images_container &) = delete;
    ~key_images_container() = default;
    void load(const std::wstring &filename, bool &was_changed);
    bool push_back(const out_key_to_ki &value);
    bool empty() const;
    key_images_map::size_type size() const;
    key_images_map::const_iterator find(const key_images_map::key_type &key) const;
    key_images_map::const_iterator end() const;

    bool clear_file();

  private:
    static const uint64_t m_signature = 0x1000111101101022LL;
    static const uint64_t m_version = 1;

    key_images_map m_key_images;
    pod_array_file_container<out_key_to_ki, m_signature, m_version> m_file_container;

    friend class boost::serialization::access;

    template<class Archive>
    void serialize(Archive &ar, const unsigned int version)
    {
      ar & m_key_images;
    }
  };
} // eof namespace tools