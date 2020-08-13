// Copyright (c) 2014-2020 The Virie Project
// Copyright (c) 2012-2013 The Cryptonote developers
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#pragma once

#include <stdint.h>
#include <stddef.h>

#define CHACHA8_KEY_SIZE 32
#define CHACHA8_IV_SIZE 8

#if defined(__cplusplus)
#include <memory.h>

#include "hash.h"

namespace crypto {
  extern "C" {
#endif
    void chacha8(const void* data, size_t length, const uint8_t* key, const uint8_t* iv, char* cipher);
#if defined(__cplusplus)
  }

#pragma pack(push, 1)
  POD_CLASS chacha8_key {
    uint8_t data[CHACHA8_KEY_SIZE];

  public:
    void clear() { memset(data, 0, sizeof(data)); }
  };

  POD_CLASS chacha8_iv {
    uint8_t data[CHACHA8_IV_SIZE];
  };
#pragma pack(pop)

  STATIC_ASSERT_POD(chacha8_key, chacha8_iv)

  static_assert(sizeof(chacha8_key) == CHACHA8_KEY_SIZE && sizeof(chacha8_iv) == CHACHA8_IV_SIZE, "Invalid structure size");

  inline void chacha8(const void* data, std::size_t length, const chacha8_key& key, const chacha8_iv& iv, char* cipher)
  {
    chacha8(data, length, reinterpret_cast<const uint8_t*>(&key), reinterpret_cast<const uint8_t*>(&iv), cipher);
  }

  inline void chacha8(const std::string& data, const chacha8_key& key, const chacha8_iv& iv, std::string& cipher)
  {
    const size_t length = data.size();
    cipher.resize(length);
    chacha8(data.data(), length, key, iv, &cipher[0]);
  }

  inline void generate_chacha8_key(const void* pass, size_t sz, chacha8_key& key)
  {
    static_assert(sizeof(chacha8_key) <= sizeof(hash), "Size of hash must be at least that of chacha8_key");
    hash pwd_hash;
    //TODO: change wallet encryption algo
    crypto::cn_fast_hash(pass, sz, pwd_hash);
    memcpy(reinterpret_cast<void*>(&key), &pwd_hash, sizeof(key));
    memset(reinterpret_cast<void*>(&pwd_hash), 0, sizeof(pwd_hash));
  }

  inline void generate_chacha8_key(const std::string& password, chacha8_key& key)
  {
    generate_chacha8_key(password.data(), password.size(), key);
  }


  inline bool chacha_crypt(const void* src_buff, size_t sz, void* target_buff, const void* key_buff, size_t key_buff_size)
  {
    crypto::chacha8_key key;
    crypto::chacha8_iv iv;
    memset(reinterpret_cast<void*>(&iv), 0, sizeof(iv));
    crypto::generate_chacha8_key(key_buff, key_buff_size, key);
    crypto::chacha8(src_buff, sz, key, iv, (char*)target_buff);
    key.clear();
    return true;
  }

  inline bool chacha_crypt(std::string& crypt, const std::string& pass)
  {
    std::string buff(crypt.size(), '\0');
    bool r = chacha_crypt(crypt.data(), crypt.size(), &buff[0], pass.data(), pass.size());
    crypt.swap(buff);
    return r;
  }
//  inline bool chacha_decrypt(std::string& buff, const std::string& pass)
//  {
//    return chacha_crypt(buff, pass);
//  }
  template<typename pod_to_encrypt, typename pod_pass>
  inline bool chacha_crypt(pod_to_encrypt& crypt, const pod_pass& pass)
  {
    static_assert(std::is_pod<pod_to_encrypt>::value, "POD expected for pod_to_encrypt");
    static_assert(std::is_pod<pod_pass>::value, "POD expected for pod_pass");
    std::string buff(sizeof(crypt), '\0');
    bool r = chacha_crypt(&crypt, sizeof(crypt), &buff[0], &pass, sizeof(pass));
    memcpy(reinterpret_cast<void*>(&crypt), buff.data(), sizeof(crypt));
    return r;
  }

  template<typename pod_pass>
  inline bool chacha_crypt(std::string& crypt, const pod_pass& pass)
  {
    static_assert(std::is_pod<pod_pass>::value, "POD expected for pod_pass");
    std::string buff(crypt.size(), '\0');
    bool r = chacha_crypt(crypt.data(), crypt.size(), &buff[0], &pass, sizeof(pass));
    crypt.swap(buff);
    return r;
  }

  template<typename pod_pass>
  inline std::string chacha_crypt(const std::string& input, const pod_pass& pass)
  {
    std::string result;
    result.resize(input.size());
    if (chacha_crypt(input.data(), input.size(), (void*)result.data(), &pass, sizeof pass))
      return result;
    return "";
  }

}

#endif
