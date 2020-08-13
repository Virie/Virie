// Copyright (c) 2014-2020 The Virie Project
// Copyright (c) 2012-2013 The Cryptonote developers
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#pragma once

#include "checkpoints.h"
#include "misc_log_ex.h"

#define ADD_CHECKPOINT(h, hash)  CHECK_AND_ASSERT(checkpoints.add_checkpoint(h,  hash), false);

namespace currency {
  inline bool create_checkpoints(currency::checkpoints& checkpoints)
  {
#ifdef TESTNET
#  if CURRENCY_FORMATION_VERSION == 81
    ADD_CHECKPOINT(50000, "F25E14F184050B94FDDE44C0EC09210C57E694126180F4A0AF4BB3AF354C5F58");
#  endif
#endif
    return true;
  }
}

#undef ADD_CHECKPOINT
