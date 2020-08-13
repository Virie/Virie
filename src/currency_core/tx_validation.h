// Copyright (c) 2014-2020 The Virie Project
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#pragma once

#include "currency_basic.h"

namespace currency
{
  bool check_tx_syntax(const transaction &tx);
  bool check_tx_semantic(const transaction &tx);
} // eof namespace currency