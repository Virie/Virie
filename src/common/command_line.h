// Copyright (c) 2014-2020 The Virie Project
// Copyright (c) 2012-2013 The Cryptonote developers
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#pragma once

#include <iostream>
#include <type_traits>

#include <boost/program_options/parsers.hpp>
#include <boost/program_options/options_description.hpp>
#include <boost/program_options/variables_map.hpp>
#include "include_base_utils.h"
#include "epee/include/file_io_utils.h"

namespace command_line
{
  enum flag_t : uint8_t
  {
    none,
    required = 1u << 0u,
    file_support = 1u << 1u,
    not_use_default = 1u << 2u
  };

  using flag_value_t = std::underlying_type<flag_t>::type;

  template<typename T>
  struct arg_descriptor
  {
    using value_type = T;

    inline bool has_flag(flag_t flag) const { return flags & static_cast<flag_value_t>(flag); }
    inline bool is_required() const { return has_flag(flag_t::required); }
    inline bool is_file_support() const { return has_flag(flag_t::file_support); }
    inline bool to_use_default() const { return !has_flag(flag_t::not_use_default); }

    const char* name;
    const char* description;
    T default_value;
    flag_value_t flags;
  };

  template<typename arg_t, typename T>
  void set_default_value(const arg_t &arg, T value) { arg->default_value(value); }

  template<typename arg_t, typename T>
  void set_default_value(const arg_t &arg, std::vector<T> value) { arg->default_value(value, ""); }

  template<typename T>
  boost::program_options::typed_value<T>* make_semantic(const arg_descriptor<T>& arg)
  {
    auto semantic = boost::program_options::value<T>();
    if (arg.is_required())
      semantic = semantic->required();
    else if (arg.to_use_default())
      set_default_value(semantic, arg.default_value);
    return semantic;
  }

  template<>
  boost::program_options::typed_value<bool>* make_semantic(const arg_descriptor<bool>& arg);

  template<typename T>
  void add_arg(boost::program_options::options_description& description, const arg_descriptor<T>& arg, bool unique = true)
  {
    if (0 != description.find_nothrow(arg.name, false))
    {
      CHECK_AND_ASSERT_MES(!unique, void(), "Argument already exists: " << arg.name);
      return;
    }
    description.add_options()(arg.name, make_semantic(arg), arg.description);
  }

  template<typename T>
  void add_arg(boost::program_options::options_description& description, arg_descriptor<T> arg, T default_value, bool unique = true)
  {
    arg.default_value = default_value;
    add_arg(description, arg, unique);
  }

  template<typename charT>
  boost::program_options::basic_parsed_options<charT> parse_command_line(int argc, const charT* const argv[],
    const boost::program_options::options_description& desc, bool allow_unregistered = false)
  {
    auto parser = boost::program_options::command_line_parser(argc, argv);
    parser.options(desc);
    if (allow_unregistered)
    {
      parser.allow_unregistered();
    }
    return parser.run();
  }

  template<typename F>
  bool handle_error_helper(const boost::program_options::options_description& desc, F parser)
  {
    try
    {
      return parser();
    }
    catch (std::exception& e)
    {
      std::cerr << "Failed to parse arguments: " << e.what() << std::endl;
      std::cerr << desc << std::endl;
      return false;
    }
    catch (...)
    {
      std::cerr << "Failed to parse arguments: unknown exception" << std::endl;
      std::cerr << desc << std::endl;
      return false;
    }
  }

  template<typename T>
  bool has_arg(const boost::program_options::variables_map& vm, const arg_descriptor<T>& arg)
  {
    if (vm.find(arg.name) == vm.end())
      return false;
    auto value = vm[arg.name];
    return !value.empty();
  }

  template<>
  bool has_arg(const boost::program_options::variables_map& vm, const arg_descriptor<bool>& arg);

  template<typename T>
  T get_arg(const boost::program_options::variables_map& vm, const arg_descriptor<T>& arg)
  {
    return vm[arg.name].template as<T>();
  }

  template<>
  std::string get_arg(const boost::program_options::variables_map& vm, const arg_descriptor<std::string>& arg);

  extern const arg_descriptor<bool>        arg_help;
  extern const arg_descriptor<bool>        arg_version;
  extern const arg_descriptor<bool>        arg_version_libs;
  extern const arg_descriptor<std::string> arg_data_dir;
  extern const arg_descriptor<std::string> arg_config_file;
  extern const arg_descriptor<bool>        arg_os_version;
  extern const arg_descriptor<std::string> arg_log_dir;
  extern const arg_descriptor<int>         arg_log_level;
  extern const arg_descriptor<std::string> arg_log_channels;
  extern const arg_descriptor<bool>        arg_console;
  extern const arg_descriptor<bool>        arg_show_details;
  extern const arg_descriptor<bool>        arg_show_rpc_autodoc;
  extern const arg_descriptor<bool>        arg_disable_upnp;
  extern const arg_descriptor<bool>        arg_disable_stop_if_time_out_of_sync;
  extern const arg_descriptor<bool>        arg_disable_stop_on_low_free_space;
  extern const arg_descriptor<std::string> arg_notification_cmd;

  template <typename CharT>
  class argv_processor
  {
    public:
    argv_processor(int argc, CharT* argv[]) : m_argc(argc), m_argv_original(argv), m_argv_copy_pointers(argc + 1, nullptr), m_argv(argc, nullptr)
    {
      std::vector<size_t> sizes;
      sizes.reserve(argc);
      m_strings.reserve(argc);
      for (auto i = 0; i < argc; ++i)
      {
        sizes.push_back(m_argv_copy.size());
        const std::basic_string<CharT> argv_i(argv[i]);
        m_argv_copy.append(argv_i).append(1, CharT(0));
        m_strings.push_back(epee::string_encoding::wstring_to_utf8(argv_i));
      }
      std::transform(sizes.cbegin(), sizes.cend(), m_argv_copy_pointers.begin(), [&](size_t s)
      {
        return &m_argv_copy[s];
      });
    }

    char ** get_argv()
    {
      std::transform(m_strings.begin(), m_strings.end(), m_argv.begin(), [](std::string& s)
      {
        return &s[0];
      });
      return &m_argv[0];
    }

    CharT ** get_argv_original()
    {
      return &m_argv_copy_pointers[0];
    }

    void hide_secret(const std::string &arg_name)
    {
      hide_secret_impl(arg_name);
    }

    private:
    void hide_secret_impl(const std::string &arg_name)
    {
      int value_index = -1;
      std::size_t match_length = 0;
      std::size_t hide_offset = 0;

      for (std::size_t i = 0; i < m_strings.size(); ++i)
      {
        std::size_t offset = 0;
        auto str = m_strings[i];

        if (str.size() < 2 || str.substr(0, 2) != "--")
          continue;
        str = str.substr(2);

        auto r = str.find('=');
        if (r != std::string::npos)
        {
          offset = r + 3;
          str = str.substr(0, r);
        }

        if (str != arg_name.substr(0, str.size()) || str.size() <= match_length)
          continue;

        match_length = str.size();
        hide_offset = offset;
        value_index = hide_offset ? i : i + 1;
      }

      if (value_index < 0)
        return;

      auto *value = m_argv_original[value_index];
      auto value_length = std::basic_string<CharT>(value).size();
      std::fill(value + hide_offset, value + value_length, SECRET_SYMBOL);
    }

    const CharT SECRET_SYMBOL = '*';

    int m_argc;
    CharT ** m_argv_original;
    std::basic_string<CharT> m_argv_copy;
    std::vector<CharT*> m_argv_copy_pointers; // for execv last element must be NULL!!!  TODO: double copy when CharT == char
    std::vector<char*> m_argv;
    std::vector<std::string> m_strings;
  };

  template <typename CharT>
  inline argv_processor<CharT> make_argv_processor(int argc, CharT* argv[])
  {
    return argv_processor<CharT>(argc, argv);
  }
}
