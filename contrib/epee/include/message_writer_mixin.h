// Copyright (c) 2014-2020 The Virie Project
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#pragma once

#include "include_base_utils.h"
#include "colored_cout.h"

namespace epee
{
  class message_writer_mixin
  {
  public:
    message_writer_mixin() = default;
    virtual ~message_writer_mixin() = default;
    message_writer_mixin(const message_writer_mixin &) = delete;
    message_writer_mixin operator=(const message_writer_mixin &) = delete;

    using colors = epee::colored_cout::console_colors;

    class message_writer : public std::stringstream
    {
    public:
      explicit message_writer(colors color = default_color, bool bright = false, std::string&& prefix = "",
        bool to_log = false, int log_level = LOG_LEVEL_2) :
        m_to_flush(true), m_color(color), m_bright(bright), m_to_log(to_log), m_log_level(log_level)
      {
        rdbuf()->sputn(prefix.c_str(), prefix.size());
      }

      message_writer(message_writer &&rhs) noexcept :
        m_to_flush(rhs.m_to_flush), m_color(rhs.m_color), m_bright(rhs.m_bright), m_to_log(rhs.m_to_log),
        m_log_level(rhs.m_log_level)
      {
        rhs.m_to_flush = false;
      }

      virtual ~message_writer() { _flush(); }

    private:
      bool m_to_flush;
      epee::colored_cout::console_colors m_color;
      bool m_bright;
      bool m_to_log;
      int m_log_level;

      message_writer &_flush()
      {
        if (!m_to_flush) return *this;
        m_to_flush = false;
        flush();
        if (m_to_log)
          LOG_PRINT(str(), m_log_level);
        const bool use_color = m_color != default_color;
        if (use_color)
          epee::colored_cout::cu_cout.set_color(m_color, m_bright);
        epee::colored_cout::cu_cout << str();
        if (use_color)
          epee::colored_cout::cu_cout.reset_color();
        epee::colored_cout::cu_cout << std::endl;
        clear();
        return *this;
      }

      friend inline std::ostream &flush(std::ostream &os);
    };

    static inline message_writer message(colors color = default_color, bool bright = false, std::string&& prefix = "")
    {
      return message_writer(color, bright, std::forward<std::string>(prefix));
    }

    static inline message_writer success()
    {
      return message(colors::console_color_green);
    }

    static inline message_writer fail()
    {
      return message(colors::console_color_red, true, "Error: ");
    }

    static inline message_writer warning()
    {
      return message(colors::console_color_yellow, true, "Warning: ");
    }

    static inline message_writer message_log(colors color = default_color, bool bright = false, std::string&& prefix = "",
      int log_level = LOG_LEVEL_2)
    {
      return message_writer(color, bright, std::forward<std::string>(prefix), true, log_level);
    }

    static inline message_writer success_log()
    {
      return message_log(colors::console_color_green, false, "", LOG_LEVEL_2);
    }

    static inline message_writer fail_log()
    {
      return message_log(colors::console_color_red, true, "Error: ", LOG_LEVEL_0);
    }

    static inline message_writer warning_log()
    {
      return message_log(colors::console_color_yellow, true, "Warning: ", LOG_LEVEL_1);
    }

  private:
    static const auto default_color = colors::console_color_default;
  };

  using message_writer = message_writer_mixin::message_writer;

  inline std::ostream &flush(std::ostream &os)
  {
    auto *p_os = dynamic_cast<message_writer *>(&os);
    return p_os ? p_os->_flush() : os;
  }
} // eof namespace epee