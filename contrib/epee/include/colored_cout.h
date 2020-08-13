// Copyright (c) 2020-2020 The Virie Project
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.
#pragma once

#include <iostream>
#include <string>
#include <array>
#include <atomic>
#include <cstdlib>
#include <cstdio>

#ifdef _WIN32
#include <io.h>
#include <windows.h>
#else
#include <unistd.h>
#endif

#include "string_coding.h"

namespace epee
{
namespace colored_cout
{

enum console_colors
{
  console_color_default,
  console_color_white,
  console_color_red,
  console_color_green,
  console_color_blue,
  console_color_cyan,
  console_color_magenta,
  console_color_yellow,
  console_color_count
};
#ifdef _WIN32
  static constexpr WORD NO_BRING_COLORS[console_color_count] = {FOREGROUND_RED | FOREGROUND_GREEN | FOREGROUND_BLUE,
                                                                FOREGROUND_RED | FOREGROUND_GREEN | FOREGROUND_BLUE,
                                                                FOREGROUND_RED,
                                                                FOREGROUND_GREEN,
                                                                FOREGROUND_BLUE | FOREGROUND_INTENSITY,
                                                                FOREGROUND_GREEN,
                                                                FOREGROUND_BLUE | FOREGROUND_RED,
                                                                FOREGROUND_RED | FOREGROUND_GREEN,
                                                               };
#else
  static constexpr char const* NO_BRING_COLORS[console_color_count] = {"\033[0m", "\033[0;37m", "\033[0;31m", "\033[0;32m", "\033[0;34m", "\033[0;36m", "\033[0;35m", "\033[0;33m"};
  static constexpr char const* BRING_COLORS[console_color_count] = {"\033[1;37m", "\033[1;37m", "\033[1;31m", "\033[1;32m", "\033[1;34m", "\033[1;36m", "\033[1;35m", "\033[1;33m"};
#endif

template <size_t BUF_SIZE>
class colored_cout_buf : public std::streambuf
{
public:
  typedef std::streambuf parent_type;
  typedef typename parent_type::char_type char_type;
  typedef typename parent_type::int_type int_type;
  typedef typename parent_type::traits_type traits_type;
  typedef typename parent_type::pos_type pos_type;
  typedef typename parent_type::off_type off_type;

protected:
  virtual int_type overflow(int_type c = traits_type::eof()) override
  {
    if (c != traits_type::eof())
    {
      *parent_type::pptr() = c;
      parent_type::pbump(1);
      return sync() == 0 ? c : traits_type::eof();
    }
    return traits_type::eof();
  }

  virtual int sync() override
  {
    if (parent_type::pptr() == parent_type::pbase())
      return 0;

    const ptrdiff_t sz = parent_type::pptr() - parent_type::pbase();
    write_imp(parent_type::pbase(), sz);
    parent_type::pbump(-sz);
    return 0;
  }

  virtual std::streamsize xsputn(char_type const* p, std::streamsize sz) override
  {
    if (sync() != 0)
      return 0;
    write_imp(p, sz);
    return sz;
  }

public:
  colored_cout_buf()
  {
    char_type * const start = m_buffer.data();
    char_type * const end = start + (m_buffer.size() - 1);
    parent_type::setp(start, end);
  }

  ~colored_cout_buf() = default;

  void set_color(size_t color, bool bright)
  {
    sync();

    if (color >= console_color_count)
      return;

#ifdef _WIN32
    SetConsoleTextAttribute(m_h_stdout, NO_BRING_COLORS[color] | (bright ? FOREGROUND_INTENSITY:0));
#else
    std::cout << (bright ? BRING_COLORS[color] : NO_BRING_COLORS[color]) << std::flush;
#endif
  }

  void reset_color()
  {
    set_color(console_color_default, false);
  }

private:

  void write_imp(char_type const* p_char, std::streamsize sz)
  {
#ifdef _WIN32
    const std::wstring & w_str = epee::string_encoding::utf8_to_wstring(std::basic_string<char_type>(p_char, sz));
    WriteConsoleW(m_h_stdout, w_str.c_str(), w_str.size(), NULL, NULL);
#else
    const std::basic_string<char_type> str(p_char, sz);
    std::cout << str << std::flush;
#endif
  }

  std::array<char_type, BUF_SIZE> m_buffer;

#ifdef _WIN32
  HANDLE m_h_stdout{GetStdHandle(STD_OUTPUT_HANDLE)};
#endif
};

template <size_t BUF_SIZE = 100>
class colored_cout : public std::ostream
{
public:
  typedef std::streambuf parent_type;
  typedef typename parent_type::char_type char_type;

  colored_cout() : std::basic_ostream<char_type>(&m_cout_buf)
  {
    if (!is_console())
      rdbuf(std::cout.rdbuf()); // for pipe
  }

  void set_color(size_t color, bool bright)
  {
    if (!is_console())
      return;
    m_cout_buf.set_color(color, bright);
  }

  inline void reset_color()
  {
    if (!is_console())
      return;
    m_cout_buf.reset_color();
  }

  bool is_console()
  {
    static std::atomic<bool> stat_was_init{false};
    static std::atomic<bool> stat_is_console{false};
    if (!stat_was_init.load())
    {
#ifdef _WIN32
      if (0 != _isatty(_fileno(stdout)))
        stat_is_console.store(true);
#else
      if (0 != isatty(fileno(stdout)))
        stat_is_console.store(true);
#endif
    }
    stat_was_init.store(true);
    return stat_is_console;
  }

private:
  colored_cout_buf<BUF_SIZE> m_cout_buf;
};

class colored_cout_singleton
{
public:
  static colored_cout<> & get_inst()
  {
    static colored_cout<> c_cout;
    return c_cout;
  }
private:
  colored_cout_singleton() = delete;
  colored_cout_singleton(const colored_cout_singleton&) = delete;
  colored_cout_singleton(colored_cout_singleton&&) = delete;
};

#define cu_cout colored_cout_singleton::get_inst()

} //colored_cout
} //epee
