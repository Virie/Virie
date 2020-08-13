// Copyright (c) 2014-2020 The Virie Project
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#pragma once
#include <functional>
#include <string>
#include "currency_protocol/currency_protocol_defs.h"
#include "currency_core/currency_basic.h"
#include "crypto/hash.h"
#include "wallet/wallet_rpc_server_error_codes.h"
#include "currency_core/offers_service_basics.h"
#include "currency_core/bc_escrow_service.h"
#include "currency_core/bc_payments_id_service.h"

namespace currency
{
  struct bc_payment_id
  {
    std::string id;

    bool empty() const
    {
      return id.empty();
    }

    bool is_size_ok() const
    {
      return id.size() <= BC_PAYMENT_ID_SERVICE_SIZE_MAX;
    }

    std::string get_hex() const
    {
      return epee::string_tools::buff_to_hex_nodelimer(id);
    }

    bool from_hex(const std::string & hex)
    {
      std::string res;

      if (!epee::string_tools::parse_0hexstr_to_binbuff(hex, res))
      {
        id.clear();
        return false;
      }
      id.swap(res);
      return true;
    }

    bool from_hex_throw(const std::string & hex)
    {
      CHECK_AND_ASSERT_THROW_MES(from_hex(hex), "Failed to parse hex string:" << hex);
      return true;
    }

    std::string save() const
    {
      return get_hex();
    }

    bool load(std::string hex)
    {
      return from_hex_throw(hex);
    }

    bool operator == (const bc_payment_id& other_id) const
    {
      return id == other_id.id;
    }

    bool operator != (const bc_payment_id& other_id) const  // for gtest
    {
      return id != other_id.id;
    }
  };

  inline bool is_payment_id_size_ok(const bc_payment_id& payment_id)
  {
    return payment_id.id.size() <= BC_PAYMENT_ID_SERVICE_SIZE_MAX;
  }

}

namespace boost
{
  namespace serialization
  {
    template <class Archive>
    inline void serialize(Archive &a, currency::bc_payment_id &x, const boost::serialization::version_type ver)
    {
      a & x.id;
    }
  }
}


namespace std
{
    template<> struct hash<currency::bc_payment_id> {
        std::size_t operator()(const currency::bc_payment_id& key) const {
            return std::hash<std::string>{}(key.id);
        }
    };
}
