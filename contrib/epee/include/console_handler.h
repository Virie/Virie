// Copyright (c) 2006-2013, Andrey N. Sabelnikov, www.sabelnikov.net
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
// * Redistributions of source code must retain the above copyright
// notice, this list of conditions and the following disclaimer.
// * Redistributions in binary form must reproduce the above copyright
// notice, this list of conditions and the following disclaimer in the
// documentation and/or other materials provided with the distribution.
// * Neither the name of the Andrey N. Sabelnikov nor the
// names of its contributors may be used to endorse or promote products
// derived from this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER  BE LIABLE FOR ANY
// DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
// ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//

#pragma once

#include <atomic>
#include <condition_variable>
#include <functional>
#include <mutex>
#include <thread>
#include <boost/bind.hpp>

#include "message_writer_mixin.h"
#include "colored_cout.h"

#ifndef PROJECT_VERSION_LONG
#  define LOCAL_PROJECT_VERSION_LONG "not defined version" // need to define version before include this header file
#else
#  define LOCAL_PROJECT_VERSION_LONG PROJECT_VERSION_LONG
#endif

namespace epee
{
  class async_stdin_reader
  {
  public:
    async_stdin_reader()
      : m_run(true)
      , m_has_read_request(false)
      , m_read_status(state_init)
    {
      m_reader_thread = std::thread(std::bind(&async_stdin_reader::reader_thread_func, this));
    }

    ~async_stdin_reader()
    {
      stop();
    }

    // Not thread safe. Only one thread can call this method at once.
    bool get_line(std::string& line)
    {
      if (!start_read())
        return false;

      std::unique_lock<std::mutex> lock(m_response_mutex);
      while (state_init == m_read_status)
      {
        m_response_cv.wait(lock);
      }

      bool res = false;
      if (state_success == m_read_status)
      {
        line = m_line;
        res = true;
      }

      m_read_status = state_init;

      return res;
    }

    void stop()
    {
      if (m_run)
      {
        m_run.store(false, std::memory_order_relaxed);

#if defined(WIN32)
        ::CloseHandle(::GetStdHandle(STD_INPUT_HANDLE));
#endif

        m_request_cv.notify_one();
        m_reader_thread.join();
      }
    }

  private:
    bool start_read()
    {
      std::unique_lock<std::mutex> lock(m_request_mutex);
      if (!m_run.load(std::memory_order_relaxed) || m_has_read_request)
        return false;

      m_has_read_request = true;
      m_request_cv.notify_one();
      return true;
    }

    bool wait_read()
    {
      std::unique_lock<std::mutex> lock(m_request_mutex);
      while (m_run.load(std::memory_order_relaxed) && !m_has_read_request)
      {
        m_request_cv.wait(lock);
      }

      if (m_has_read_request)
      {
        m_has_read_request = false;
        return true;
      }

      return false;
    }

    bool wait_stdin_data()
    {
#if !defined(WIN32)
      int stdin_fileno = ::fileno(stdin);

      while (m_run.load(std::memory_order_relaxed))
      {
        fd_set read_set;
        FD_ZERO(&read_set);
        FD_SET(stdin_fileno, &read_set);

        struct timeval tv;
        tv.tv_sec = 0;
        tv.tv_usec = 100 * 1000;

        int retval = ::select(stdin_fileno + 1, &read_set, NULL, NULL, &tv);
        if (retval < 0)
          return false;
        else if (0 < retval)
          return true;
      }
#endif

      return true;
    }

    void reader_thread_func()
    {
      while (true)
      {
        if (!wait_read())
          break;

        std::string line;
        bool read_ok = true;
        if (wait_stdin_data())
        {
          if (m_run.load(std::memory_order_relaxed))
          {
            std::getline(std::cin, line);
            read_ok = !std::cin.eof() && !std::cin.fail();
          }
        }
        else
        {
          read_ok = false;
        }

        {
          std::unique_lock<std::mutex> lock(m_response_mutex);
          if (m_run.load(std::memory_order_relaxed))
          {
            m_line = std::move(line);
            m_read_status = read_ok ? state_success : state_error;
          }
          else
          {
            m_read_status = state_cancelled;
          }
          m_response_cv.notify_one();
        }
      }
    }

    enum t_state
    {
      state_init,
      state_success,
      state_error,
      state_cancelled
    };

  private:
    std::thread m_reader_thread;
    std::atomic<bool> m_run;

    std::string m_line;
    bool m_has_read_request;
    t_state m_read_status;

    std::mutex m_request_mutex;
    std::mutex m_response_mutex;
    std::condition_variable m_request_cv;
    std::condition_variable m_response_cv;
  };


  template<class t_server>
  bool empty_commands_handler(t_server* psrv, const std::string& command)
  {
    return true;
  }


  class async_console_handler
  {
  public:
    async_console_handler()
    {
    }

    template<class t_server, class chain_handler>
    bool run(t_server* psrv, chain_handler ch_handler, const std::string& prompt = "#", const std::string& usage = "")
    {
      return run(prompt, usage, [&](const std::string& cmd) { return ch_handler(psrv, cmd); }, [&] { psrv->send_stop_signal(); });
    }

    template<class chain_handler>
    bool run(chain_handler ch_handler, const std::string& prompt = "#", const std::string& usage = "")
    {
      return run(prompt, usage, [&](const std::string& cmd) { return ch_handler(cmd); }, [] { });
    }

    void stop()
    {
      m_stdin_reader.stop();
    }

  private:
    template<typename t_cmd_handler, typename t_exit_handler>
    bool run(const std::string& prompt, const std::string& usage, const t_cmd_handler& cmd_handler, const t_exit_handler& exit_handler)
    {
      TRY_ENTRY();
      bool continue_handle = true;
      while(continue_handle)
      {
        if (!prompt.empty())
        {
          epee::colored_cout::cu_cout.set_color(epee::colored_cout::console_colors::console_color_yellow, true);
          epee::colored_cout::cu_cout << prompt;
          if (' ' != prompt.back())
            epee::colored_cout::cu_cout << ' ';
          epee::colored_cout::cu_cout.reset_color();
          epee::colored_cout::cu_cout.flush();
        }

        std::string command;
        if(!m_stdin_reader.get_line(command))
        {
          LOG_PRINT("Failed to read line. Stopping...", LOG_LEVEL_0);
          continue_handle = false;
          break;
        }
        string_tools::trim(command);

        LOG_PRINT_L2("Read command: " << command);
        if (0 == command.compare("exit") || 0 == command.compare("q"))
        {
          cmd_handler(command);
          continue_handle = false;
        }
        else if (command.empty())
        {
          continue;
        }
        else if (cmd_handler(command))
        {
          continue;
        }
        else
        {
          epee::colored_cout::cu_cout << "unknown command: " << command << std::endl;
          epee::colored_cout::cu_cout << usage;
        }
      }
      exit_handler();
      return true;
      CATCH_ENTRY_L0("console_handler", false);
    }

  private:
    async_stdin_reader m_stdin_reader;
  };


  template<class t_server, class t_handler>
  bool start_default_console(t_server* ptsrv, t_handler handlr, const std::string& prompt, const std::string& usage = "")
  {
    std::shared_ptr<async_console_handler> console_handler = std::make_shared<async_console_handler>();
	boost::thread([=](){console_handler->run<t_server, t_handler>(ptsrv, handlr, prompt, usage);}).detach();
    return true;
  }

  template<class t_server>
  bool start_default_console(t_server* ptsrv, const std::string& prompt, const std::string& usage = "")
  {
    return start_default_console(ptsrv, empty_commands_handler<t_server>, prompt, usage);
  }

  template<class t_server, class t_handler>
    bool no_srv_param_adapter(t_server* ptsrv, const std::string& cmd, t_handler handlr)
    {
      return handlr(cmd);
    }

  template<class t_server, class t_handler>
  bool run_default_console_handler_no_srv_param(t_server* ptsrv, t_handler handlr, const std::string& prompt, const std::string& usage = "")
  {
    async_console_handler console_handler;
    return console_handler.run(ptsrv, boost::bind<bool>(no_srv_param_adapter<t_server, t_handler>, _1, _2, handlr), prompt, usage);
  }

  template<class t_server, class t_handler>
  bool start_default_console_handler_no_srv_param(t_server* ptsrv, t_handler handlr, const std::string& prompt, const std::string& usage = "")
  {
    boost::thread( boost::bind(run_default_console_handler_no_srv_param<t_server, t_handler>, ptsrv, handlr, prompt, usage) );
    return true;
  }

  /*template<class a>
  bool f(int i, a l)
  {
    return true;
  }*/
  /*
  template<class chain_handler>
  bool default_console_handler2(chain_handler ch_handler, const std::string usage)
  */


  /*template<class t_handler>
  bool start_default_console2(t_handler handlr, const std::string& usage = "")
  {
    //std::string usage_local = usage;
    boost::thread( boost::bind(default_console_handler2<t_handler>, handlr, usage) );
    //boost::function<bool ()> p__ = boost::bind(f<t_handler>, 1, handlr);
    //boost::function<bool ()> p__ = boost::bind(default_console_handler2<t_handler>, handlr, usage);
    //boost::thread tr(p__);
    return true;
  }*/

  /************************************************************************/
  /*                                                                      */
  /************************************************************************/
  class console_handlers_binder : public message_writer_mixin
  {
    typedef boost::function<bool (const std::vector<std::string> &)> console_command_handler;
    typedef std::map<std::string, std::pair<console_command_handler, std::string> > command_handlers_map;
    std::unique_ptr<boost::thread> m_console_thread;
    command_handlers_map m_command_handlers;
    async_console_handler m_console_handler;
  public:
    console_handlers_binder()
    {
      m_command_handlers.insert({
        { "help", { [this] (const std::vector<std::string> &args) { return help(args); }, "Show this help" } },
        { "version", { [this] (const std::vector<std::string> &args) { std::cout << LOCAL_PROJECT_VERSION_LONG << std::endl; return true ;}, "Show verson "} },
        { "channels_list",   { console_handlers_binder::print_channels_list, "Print channels list" } },
        { "enable_channel",  { console_handlers_binder::enable_channel, "enable_channel <name> - Enable specified log "
          "channel(s), <name> is a one name of channel or comma separated several names or 'all' if all channels" } },
        { "disable_channel", { console_handlers_binder::disable_channel, "disable_channel <name> - Disable specified "
          "log channel(s), <name> is a one name of channel or comma separated several names or 'all' if all channels" } },
        { "enable_console_logger", { console_handlers_binder::enable_console_logger, "Enables console logging" } },
        { "disable_console_logger", { console_handlers_binder::disable_console_logger, "Disables console logging" } },
        { "set_log", { console_handlers_binder::set_log, "set_log <level> or <channel_name> <1|0> - Change current log "
          "detalisation level, <level> is a number 0-4, <channel_name> is a one name of channel or comma separated "
          "several names or 'all' if all channels, <1|0> is a state of channel(s) that means enabled|disabled" } }
      });
    }

    std::string get_usage() const
    {
      std::stringstream ss;
      ss << "Commands: " << ENDL;
      size_t max_command_len = 0;
      for(auto& x:m_command_handlers)
      {
        const size_t curr_len = x.first.size();
        if(curr_len > max_command_len)
          max_command_len = curr_len;
      }

      max_command_len += 2;
      for(auto& x:m_command_handlers)
      {
        ss << "  " << std::left << std::setw(max_command_len) << x.first << x.second.second << ENDL;
      }
      return ss.str();
    }
    void set_handler(const std::string& cmd, const console_command_handler& hndlr, const std::string& usage = "")
    {
      command_handlers_map::mapped_type & vt = m_command_handlers[cmd];
      vt.first = hndlr;
      vt.second = usage;
    }
    bool process_command_vec(const std::vector<std::string>& cmd)
    {
      if(!cmd.size())
        return false;
      auto it = m_command_handlers.find(cmd.front());
      if (it == m_command_handlers.end())
      {
        std::string searchString = cmd.front();
        std::vector<command_handlers_map::iterator> foundedCommands;

        for (command_handlers_map::iterator element = m_command_handlers.begin(); element != m_command_handlers.end(); ++element)
        {
          if (searchString == element->first.substr(0, searchString.size()))
            foundedCommands.push_back(element);
        }
        if (foundedCommands.size() == 1)
        {
          it = foundedCommands.at(0);
        }
        else if (!foundedCommands.empty())
        {
          epee::colored_cout::cu_cout << "similar commands : " << std::endl;
          for (auto element : foundedCommands)
          {
            epee::colored_cout::cu_cout << element->first << " ";
          }
          epee::colored_cout::cu_cout << std::endl;
        }
      }
      if(it == m_command_handlers.end())
        return false;
      std::vector<std::string> cmd_local(cmd.begin()+1, cmd.end());
      return it->second.first(cmd_local);
    }

    bool process_command_str(const std::string& cmd)
    {
      std::vector<std::string> cmd_v;
      boost::split(cmd_v,cmd,boost::is_any_of(" "), boost::token_compress_on);
      return process_command_vec(cmd_v);
    }

    /*template<class t_srv>
    bool start_handling(t_srv& srv, const std::string& usage_string = "")
    {
      start_default_console_handler_no_srv_param(&srv, boost::bind(&console_handlers_binder::process_command_str, this, _1));
      return true;
    }*/

    bool start_handling(const std::string& prompt, const std::string& usage_string = "")
    {
      m_console_thread.reset(new boost::thread(boost::bind(&console_handlers_binder::run_handling, this, prompt, usage_string)));
      m_console_thread->detach();
      return true;
    }

    void stop_handling()
    {
      m_console_handler.stop();
    }

    bool run_handling(const std::string& prompt, const std::string& usage_string)
    {
      return m_console_handler.run(boost::bind(&console_handlers_binder::process_command_str, this, _1), prompt, usage_string);
    }

    bool help(const std::vector<std::string>& /*args*/)
    {
      epee::colored_cout::cu_cout << get_usage() << ENDL;
      return true;
    }
    /*template<class t_srv>
    bool run_handling(t_srv& srv, const std::string& usage_string)
    {
      return run_default_console_handler_no_srv_param(&srv, boost::bind<bool>(&console_handlers_binder::process_command_str, this, _1), usage_string);
    }*/
  private:
    static bool print_channels_list(const std::vector<std::string>&)
    {
      log_space::log_singletone::print_channels_list();
      return true;
    }

    static bool enable_channel(const std::vector<std::string>& args)
    {
      if (args.size() != 1)
      {
        epee::colored_cout::cu_cout << "Missing channel name to enable." << ENDL;
        return true;
      }
      epee::log_space::log_singletone::enable_channels(args[0]);
      return true;
    }

    static bool disable_channel(const std::vector<std::string>& args)
    {
      if (args.size() != 1)
      {
        epee::colored_cout::cu_cout << "Missing channel name to disable." << ENDL;
        return true;
      }
      epee::log_space::log_singletone::disable_channels(args[0]);
      return true;
    }

    static bool enable_console_logger(const std::vector<std::string> &args)
    {
      log_space::log_singletone::add_logger(LOGGER_CONSOLE, NULL, NULL, log_space::log_singletone::get_set_log_detalisation_level());
      LOG_PRINT_L0("Console logger enabled.");
      return true;
    }

    static bool disable_console_logger(const std::vector<std::string> &args)
    {
      log_space::log_singletone::remove_logger(LOGGER_CONSOLE);
      epee::colored_cout::cu_cout << "Console logger disabled." << std::endl;
      return true;
    }

    static bool set_log(const std::vector<std::string> &args)
    {
      static const std::string wrong_syntax_message = "set_log: wrong syntax, usage: set_log log_level_number_0_4 | log_channel_name_1,log_channel_name_2,... 0|1";

      auto log_level = log_space::get_set_log_detalisation_level();
      if (args.size() < 1 || args.size() > 2)
      {
        epee::colored_cout::cu_cout << "current log level: " << log_level << std::endl;
        log_space::log_singletone::print_channels_list();
        LOG_PRINT_RED_L0(wrong_syntax_message);
        return true;
      }

      if (args.size() == 2)
      {
        std::string channel_str = args[0];
        std::string value_str = args[1];
        if (value_str == "1" || value_str == "e" || value_str == "y")
          epee::log_space::log_singletone::enable_channels(channel_str);
        else
          epee::log_space::log_singletone::disable_channels(channel_str);
      }
      else
      {
        uint16_t new_log_level = 0;
        if (!string_tools::get_xtype_from_string(new_log_level, args[0]) || LOG_LEVEL_MAX < new_log_level)
        {
          LOG_PRINT_RED_L0(wrong_syntax_message);
          return true;
        }
        log_space::log_singletone::get_set_log_detalisation_level(true, new_log_level);
        epee::colored_cout::cu_cout << "log level: " << log_level << " -> " << new_log_level << std::endl;
      }

      return true;
    }
  };

  /* work around because of broken boost bind */
  template<class t_server>
  class srv_console_handlers_binder: public console_handlers_binder
  {
    bool process_command_str(t_server* /*psrv*/, const std::string& cmd)
    {
      return console_handlers_binder::process_command_str(cmd);
    }
  public:
    bool start_handling(t_server* psrv, const std::string& prompt, const std::string& usage_string = "")
    {
      boost::thread(boost::bind(&srv_console_handlers_binder<t_server>::run_handling, this, psrv, prompt, usage_string)).detach();
      return true;
    }

    bool run_handling(t_server* psrv, const std::string& prompt, const std::string& usage_string)
    {
      return m_console_handler.run(psrv, boost::bind(&srv_console_handlers_binder<t_server>::process_command_str, this, _1, _2), prompt, usage_string);
    }

    void stop_handling()
    {
      m_console_handler.stop();
    }

    //--------------------------------------------------------------------------------

  private:
    async_console_handler m_console_handler;
  };
}

#undef LOCAL_PROJECT_VERSION_LONG
