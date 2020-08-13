// Copyright (c) 2012-2013 The Cryptonote developers
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#pragma once

#if defined(_MSC_VER)
#define POD_CLASS struct
#else
#define POD_CLASS class
#endif

#include <boost/preprocessor/variadic/to_seq.hpp>
#include <boost/preprocessor/seq/for_each.hpp>

#define IS_POD(type) std::is_pod<type>::value
#define STATIC_ASSERT_POD_IMPL(_, __, type) static_assert(IS_POD(type), #type);
#define STATIC_ASSERT_POD(...) BOOST_PP_SEQ_FOR_EACH(STATIC_ASSERT_POD_IMPL, _, BOOST_PP_VARIADIC_TO_SEQ(__VA_ARGS__))