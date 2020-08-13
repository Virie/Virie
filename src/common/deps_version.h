// Copyright (c) 2014-2020 The Virie Project
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#pragma once

namespace deps_version
{

  inline std::map<std::string, std::string>& get_ref_dvs()
  {
    static std::map<std::string, std::string> dvs;
    static bool run_once = false;
    if (!run_once)
    {
      run_once = true;
#ifdef BOOST_VERSION
      dvs["boost"] = std::to_string(BOOST_VERSION / 100000) + "." + std::to_string(BOOST_VERSION / 100 % 1000) + "." + std::to_string(BOOST_VERSION % 100);
      dvs["eos-portable-archive"] = "5.0";
#endif
#ifdef MINIUPNPC_VERSION
      dvs["miniupnpc"] = MINIUPNPC_VERSION;
#endif
#ifdef ZLIB_VERSION
      dvs["zlib"] = ZLIB_VERSION;
#endif
#ifdef QT_VERSION_STR
      dvs["qt"] = QT_VERSION_STR;
#endif

    }
    return dvs;
  }

  inline bool add_lib_version(const std::string& lib, const std::string& ver)
  {
    auto& dvs = get_ref_dvs();
    dvs[lib] = ver;
    return true;
  }

  inline bool add_lib_version(const std::pair<std::string, std::string>& libver)
  {
    return add_lib_version(libver.first, libver.second);
  }

  inline bool add_lib_versions(const std::map<std::string, std::string>& libvers)
  {
    bool res = true;
    for (const auto &v : libvers)
    {
      const bool r = add_lib_version(v.first, v.second);
      res &= r;
    }
    return res;
  }

  inline void print_deps_version(std::ostream &os)
  {
    auto& dvs = get_ref_dvs();
    std::size_t max_len = 0;
    for (const auto &dv : dvs)
      max_len = std::max(max_len, dv.first.size());
    max_len += 2;
    for (const auto &dv : dvs)
      os << std::left << std::setw(static_cast<int>(max_len)) << std::setfill(' ') << dv.first << dv.second << std::endl;
  }
} // eof namespace deps_version
