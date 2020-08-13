// Copyright (c) 2014-2020 The Virie Project
// Copyright (c) 2012-2013 The Cryptonote developers
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.


#include <boost/asio/deadline_timer.hpp>

#include "include_base_utils.h"
using namespace epee;

#include "util.h"
#include "currency_core/currency_config.h"
#include "zlib_helper.h"
#include "string_coding.h"

#ifdef WIN32
#include <windows.h>
#include <shlobj.h>
#include <strsafe.h>
#include <lm.h>
#pragma comment(lib, "netapi32.lib")
#else 
#include <sys/utsname.h>
#endif


#ifdef __linux__
#  include <cstdlib>
#  include <cstring>
#  include <sys/wait.h>
#  include <sys/wait.h>
#endif


namespace tools
{
  std::function<void(void)> signal_handler::m_handler = &noop_handler;
  std::function<void(int, void*)> signal_handler::m_fatal_handler = &noop_fatal_handler;
  std::function<void(void)> signal_handler::m_restart_handler = &noop_handler;

#ifdef WIN32

  bool GetWinMajorMinorVersion(DWORD& major, DWORD& minor)
  {
	  bool bRetCode = false;
	  LPBYTE pinfoRawData = 0;
	  if (NERR_Success == NetWkstaGetInfo(NULL, 100, &pinfoRawData))
	  {
		  WKSTA_INFO_100* pworkstationInfo = (WKSTA_INFO_100*)pinfoRawData;
		  major = pworkstationInfo->wki100_ver_major;
		  minor = pworkstationInfo->wki100_ver_minor;
		  ::NetApiBufferFree(pinfoRawData);
		  bRetCode = true;
	  }
	  return bRetCode;
  }


  std::string get_windows_version_display_string()
  {
	  std::string     winver;
	  OSVERSIONINFOEX osver;
	  SYSTEM_INFO     sysInfo;
	  typedef void(__stdcall *GETSYSTEMINFO) (LPSYSTEM_INFO);

#pragma warning (push)
#pragma warning (disable:4996)
		  memset(&osver, 0, sizeof(osver));
	  osver.dwOSVersionInfoSize = sizeof(osver);
	  GetVersionEx((LPOSVERSIONINFO)&osver);
#pragma warning (pop)
	  DWORD major = 0;
	  DWORD minor = 0;
	  if (GetWinMajorMinorVersion(major, minor))
	  {
		  osver.dwMajorVersion = major;
		  osver.dwMinorVersion = minor;
	  }
	  else if (osver.dwMajorVersion == 6 && osver.dwMinorVersion == 2)
	  {
		  OSVERSIONINFOEXW osvi;
		  ULONGLONG cm = 0;
		  cm = VerSetConditionMask(cm, VER_MINORVERSION, VER_EQUAL);
		  ZeroMemory(&osvi, sizeof(osvi));
		  osvi.dwOSVersionInfoSize = sizeof(osvi);
		  osvi.dwMinorVersion = 3;
		  if (VerifyVersionInfoW(&osvi, VER_MINORVERSION, cm))
		  {
			  osver.dwMinorVersion = 3;
		  }
	  }

	  GETSYSTEMINFO getSysInfo = (GETSYSTEMINFO)GetProcAddress(GetModuleHandleA("kernel32.dll"), "GetNativeSystemInfo");
	  if (getSysInfo == NULL)  getSysInfo = ::GetSystemInfo;
	  getSysInfo(&sysInfo);

	  if (osver.dwMajorVersion == 10 && osver.dwMinorVersion >= 0 && osver.wProductType != VER_NT_WORKSTATION)  winver = "Windows 10 Server";
	  else if (osver.dwMajorVersion == 10 && osver.dwMinorVersion >= 0 && osver.wProductType == VER_NT_WORKSTATION)  winver = "Windows 10";
    else if (osver.dwMajorVersion == 6 && osver.dwMinorVersion == 3 && osver.wProductType != VER_NT_WORKSTATION)  winver = "Windows Server 2012 R2";
    else if (osver.dwMajorVersion == 6 && osver.dwMinorVersion == 3 && osver.wProductType == VER_NT_WORKSTATION)  winver = "Windows 8.1";
    else if (osver.dwMajorVersion == 6 && osver.dwMinorVersion == 2 && osver.wProductType != VER_NT_WORKSTATION)  winver = "Windows Server 2012";
    else if (osver.dwMajorVersion == 6 && osver.dwMinorVersion == 2 && osver.wProductType == VER_NT_WORKSTATION)  winver = "Windows 8";
    else if (osver.dwMajorVersion == 6 && osver.dwMinorVersion == 1 && osver.wProductType != VER_NT_WORKSTATION)  winver = "Windows Server 2008 R2";
    else if (osver.dwMajorVersion == 6 && osver.dwMinorVersion == 1 && osver.wProductType == VER_NT_WORKSTATION)  winver = "Windows 7";
    else if (osver.dwMajorVersion == 6 && osver.dwMinorVersion == 0 && osver.wProductType != VER_NT_WORKSTATION)  winver = "Windows Server 2008";
    else if (osver.dwMajorVersion == 6 && osver.dwMinorVersion == 0 && osver.wProductType == VER_NT_WORKSTATION)  winver = "Windows Vista";
    else if (osver.dwMajorVersion == 5 && osver.dwMinorVersion == 2 && osver.wProductType == VER_NT_WORKSTATION
		  &&  sysInfo.wProcessorArchitecture == PROCESSOR_ARCHITECTURE_AMD64) 
      winver = "Windows XP x64";
	  else if (osver.dwMajorVersion == 5 && osver.dwMinorVersion == 2)   winver = "Windows Server 2003";
    else if (osver.dwMajorVersion == 5 && osver.dwMinorVersion == 1)   winver = "Windows XP";
    else if (osver.dwMajorVersion == 5 && osver.dwMinorVersion == 0)   winver = "Windows 2000";
    else  winver = "unknown";

	  if (osver.wServicePackMajor != 0)
	  {
		  std::string sp;
		  char buf[128] = { 0 };
		  sp = " Service Pack ";
		  sprintf_s(buf, sizeof(buf), "%hd", osver.wServicePackMajor);
		  sp.append(buf);
		  winver += sp;
	  }

	  if (osver.dwMajorVersion >= 6)
	  {
		  if (sysInfo.wProcessorArchitecture == PROCESSOR_ARCHITECTURE_AMD64)
			  winver += ", 64-bit";
		  else if (sysInfo.wProcessorArchitecture == PROCESSOR_ARCHITECTURE_INTEL)
			  winver += ", 32-bit";
	  }


	  winver += "("
		  + std::to_string(osver.dwMajorVersion) + ":"
		  + std::to_string(osver.dwMinorVersion) + ":"
		  + std::to_string(osver.dwBuildNumber) + ":"
		  + std::to_string(osver.dwPlatformId) + ":"
		  + std::to_string(osver.wServicePackMajor) + ":"
		  + std::to_string(osver.wServicePackMinor) + ":"
		  + std::to_string(osver.wSuiteMask) + ":"
		  + std::to_string(osver.wProductType) + ")";

	  return winver;
  }

#else
std::string get_nix_version_display_string()
{
  utsname un;

  if(uname(&un) < 0)
    return std::string("*nix: failed to get os version");
  return std::string() + un.sysname + " " + un.version + " " + un.release;
}
#endif



  std::string get_os_version_string()
  {
#ifdef WIN32
    return get_windows_version_display_string();
#else
    return get_nix_version_display_string();
#endif
  }

  uint64_t get_free_space(const std::string& folder)
  {
    boost::filesystem::space_info si = boost::filesystem::space(epee::string_encoding::utf8_to_wstring(folder));
    return si.available;
  }

#ifdef WIN32
  std::string get_special_folder_path(int nfolder, bool iscreate)
  {
    namespace fs = boost::filesystem;
    wchar_t psz_path[MAX_PATH] = L"";

    if(SHGetSpecialFolderPathW(NULL, psz_path, nfolder, iscreate))
    {
      return epee::string_encoding::wstring_to_utf8( psz_path);
    }

    LOG_ERROR("SHGetSpecialFolderPathW() failed, could not obtain requested path.");
    return "";
  }
#endif

  std::string get_default_data_dir()
  {
    //namespace fs = boost::filesystem;
    // Windows < Vista: C:\Documents and Settings\Username\Application Data\CURRENCY_NAME_SHORT
    // Windows >= Vista: C:\Users\Username\AppData\Roaming\CURRENCY_NAME_SHORT
    // Mac: ~/Library/Application Support/CURRENCY_NAME_SHORT
    // Unix: ~/.CURRENCY_NAME_SHORT
    std::string config_folder;
#ifdef WIN32
    // Windows
#ifdef _M_X64
    config_folder = get_special_folder_path(CSIDL_APPDATA, true) + "/" + CURRENCY_NAME_SHORT;
#else 
    config_folder = get_special_folder_path(CSIDL_APPDATA, true) + "/" + CURRENCY_NAME_SHORT + "-x86";
#endif 
#else
    std::string pathRet;
    char* pszHome = getenv("HOME");
    if (pszHome == NULL || strlen(pszHome) == 0)
      pathRet = "/";
    else
      pathRet = pszHome;
#ifdef __APPLE__
    // Mac
    pathRet += "/Library/Application Support";
    config_folder =  (pathRet + "/" + CURRENCY_NAME_SHORT);
#else
    // Unix
    config_folder = (pathRet + "/." + CURRENCY_NAME_SHORT);
#endif
#endif

    return config_folder;
  }
  std::string get_host_computer_name()
  {
    char szname[1024] = "";
    gethostname(szname, sizeof(szname));
    szname[sizeof(szname)-1] = 0; //just to be sure
    return szname;
  }


  std::string get_default_user_dir()
  {
    //namespace fs = boost::filesystem;
    // Windows < Vista: C:\Documents and Settings\Username 
    // Windows >= Vista: C:\Users\Username\AppData\Roaming\CURRENCY_NAME_SHORT
    // Mac: ~/Library/Application Support/CURRENCY_NAME_SHORT
    // Unix: ~/.CURRENCY_NAME_SHORT
    std::string wallets_dir;
#ifdef WIN32
    // Windows
    wallets_dir = get_special_folder_path(CSIDL_PERSONAL, true) + "/" + CURRENCY_NAME_BASE;
#else
    std::string pathRet;
    char* pszHome = getenv("HOME");
    if (pszHome == NULL || strlen(pszHome) == 0)
      pathRet = "/";
    else
      pathRet = pszHome;

    wallets_dir = (pathRet + "/" + CURRENCY_NAME_BASE);

#endif
    return wallets_dir;
  }

  std::string get_current_username()
  {
#ifdef WIN32
    // Windows
    const char* psz_username = getenv("USERNAME");
#else
    const char* psz_username = getenv("USER");
#endif
    if (psz_username == NULL || strlen(psz_username) == 0)
      psz_username = "unknown_user";

    return std::string(psz_username);
  }



  bool create_directories_if_necessary(const std::string& path)
  {
    namespace fs = boost::filesystem;
    boost::system::error_code ec;
    fs::path fs_path(epee::string_encoding::utf8_to_wstring(path));
    if (fs::is_directory(fs_path, ec))
    {
      return true;
    }

    bool res = fs::create_directories(fs_path, ec);
    if (res)
    {
      LOG_PRINT_L2("Created directory: " << path);
    }
    else
    {
      LOG_PRINT_L2("Can't create directory: " << path << ", err: "<< ec.message());
    }

    return res;
  }

  std::error_code replace_file(const std::string& replacement_name, const std::string& replaced_name)
  {
    int code;
#if defined(WIN32)
    // Maximizing chances for success
    DWORD attributes = ::GetFileAttributes(replaced_name.c_str());
    if (INVALID_FILE_ATTRIBUTES != attributes)
    {
      ::SetFileAttributes(replaced_name.c_str(), attributes & (~FILE_ATTRIBUTE_READONLY));
    }

    bool ok = 0 != ::MoveFileEx(replacement_name.c_str(), replaced_name.c_str(), MOVEFILE_REPLACE_EXISTING);
    code = ok ? 0 : static_cast<int>(::GetLastError());
#else
    bool ok = 0 == std::rename(replacement_name.c_str(), replaced_name.c_str());
    code = ok ? 0 : errno;
#endif
    return std::error_code(code, std::system_category());
  }


#define REQUEST_LOG_CHUNK_SIZE_MAX (10 * 1024 * 1024)

  bool get_log_chunk_gzipped(uint64_t offset, uint64_t size, std::string& output, std::string& error)
  {
    if (size > REQUEST_LOG_CHUNK_SIZE_MAX)
    {
      error = std::string("size is exceeding the limit = ") + epee::string_tools::num_to_string_fast(REQUEST_LOG_CHUNK_SIZE_MAX);
      return false;
    }

    std::string log_filename = epee::log_space::log_singletone::get_actual_log_file_path();
    if (boost::filesystem::ifstream log{ epee::string_encoding::utf8_to_wstring(log_filename), std::ifstream::ate | std::ifstream::binary })
    {
      uint64_t file_size = log.tellg();

      if (offset >= file_size)
      {
        error = "offset is out of bounds";
        return false;
      }

      if (offset + size > file_size)
      {
        error = "offset + size if out of bounds";
        return false;
      }

      if (size != 0)
      {
        log.seekg(offset);
        output.resize(size);
        log.read(&output.front(), size);
        uint64_t read_bytes = log.gcount();
        if (read_bytes != size)
        {
          error = std::string("read bytes: ") + epee::string_tools::num_to_string_fast(read_bytes);
          output.clear();
          return false;
        }

        if (!epee::zlib_helper::pack(output))
        {
          error = "zlib pack failed";
          output.clear();
          return false;
        }
      }

      return true;
    }

    error = std::string("can't open ") + log_filename;
    return false;
  }

  uint64_t get_log_file_size()
  {
    std::string log_filename = epee::log_space::log_singletone::get_actual_log_file_path();
    boost::filesystem::ifstream in(epee::string_encoding::utf8_to_wstring(log_filename), std::ifstream::ate | std::ifstream::binary);
    return static_cast<uint64_t>(in.tellg());
  }


#define TIME_WAIT_ANSWER_FROM_SERVER  1 //seconds

  time_t get_sntp_time(const std::string& host_name)
  {
    using boost::asio::ip::udp;
    using boost::asio::deadline_timer;

    try
    {
      boost::asio::io_service io_service;
      udp::resolver resolver(io_service);
      udp::resolver::query query(boost::asio::ip::udp::v4(), host_name, "ntp");
      udp::endpoint receiver_endpoint = *resolver.resolve(query);
      udp::socket socket(io_service);
      socket.open(udp::v4());

      std::array<uint8_t, 48> buf {{ 0b0100011, 0, 0, 0, 0, 0, 0, 0, 0 }};
      socket.send_to(boost::asio::buffer(buf), receiver_endpoint);

      buf[0] = 0;
      boost::system::error_code ec = boost::asio::error::would_block;
      boost::asio::deadline_timer deadline(io_service);
      deadline.expires_at(boost::posix_time::pos_infin);

      std::function<void(const boost::system::error_code&)> callback_deadline = [&](const boost::system::error_code&){
        if (deadline.expires_at() <= deadline_timer::traits_type::now())
            {
              socket.cancel();
              deadline.expires_at(boost::posix_time::pos_infin);
            }
        deadline.async_wait(callback_deadline);
      };

      deadline.async_wait(callback_deadline);
      size_t len = 0;
      udp::endpoint sender_endpoint;
      socket.async_receive_from(boost::asio::buffer(buf), sender_endpoint, [&](const boost::system::error_code& error, std::size_t bytes_transferred ){
        ec = error;
        len = bytes_transferred;
      });
      deadline.expires_from_now(boost::posix_time::seconds(TIME_WAIT_ANSWER_FROM_SERVER));
      do
        io_service.run_one();
      while (ec == boost::asio::error::would_block);

      if (len != 48)
      {
        LOG_PRINT_L2("get_ntp_time(): get_ntp_time(): returned form: " << host_name << " only " << len << " bytes");
        return 0;
      }

      if ((buf[0] >> 6) == 0b11)  // LI
      {
        LOG_PRINT_L2("get_ntp_time(): get_ntp_time(): host: " << host_name << " don't synchronized");
        return 0;
      }

      time_t time_recv = (time_t) ntohl(*((uint64_t*) (buf.data()+32)));
      time_recv -= 2208988800ull;  //Unix time starts from 01/01/1970 == 2208988800U
      return time_recv;
    }
    catch (const std::exception& e)
    {
      LOG_PRINT_L2("get_ntp_time(): exception: " << e.what());
      return 0;
    }
    catch (...)
    {
      return 0;
    }
  }

    exec::~exec()
    {
      kill();
    }

    bool exec::run(const std::string& cmd, const std::vector<std::string>& argv)
    {
      if (running())
        return false;

      if (cmd.empty())
        return false;

#ifdef __linux__
      pid_t pid = ::fork();
      if (pid < 0)
      {
        LOG_PRINT_RED_L0("exec::run() fork return error: " << pid);
        return false;
      }

      if (pid == 0)
      { //child
        ::setpgid(::getpid(), ::getpid());

        std::vector<char*> pp_argv(2+ argv.size(), nullptr);
        size_t len = cmd.size() + 1;
        for (const auto& arg: argv)
          len += arg.size() + 1;
        std::vector<char> p_argv(len, '\0');
        size_t shift=cmd.size() + 1;
        std::memcpy(&p_argv[0], cmd.c_str(), shift);
        pp_argv[0] = &p_argv[0];
        size_t i = 1;
        for (const auto& arg: argv)
        {
          const size_t arg_len = arg.size() + 1;
          std::memcpy(&p_argv[shift], arg.c_str(), arg_len);
          pp_argv[i] = &p_argv[shift];
          shift += arg_len;
          i++;
        }

        int error = ::execv(pp_argv[0], &pp_argv[0]);
        LOG_PRINT_RED_L0("exec::run() execv don't started, error: " << error << ", errno: " << errno);

        ::exit(1);

      } //parent
      m_pid = pid;
      LOG_PRINT_L2("exec::run() pid: " << m_pid);
      return true;
#else
      return false;
#endif
    }

    bool exec::running()
    {
#ifdef __linux__
      if (m_pid == 0)
        return false;
      if (check_and_wait())
        return false;
      return true;
#else
      return false;
#endif
    }

    void exec::kill()
    {
      if (!running())
        return;
#ifdef __linux__
      LOG_PRINT_L2("exec::kill() pid: " << m_pid);
      ::kill(m_pid, SIGKILL);
      for (auto i = 0; i < 100; ++i)
      {
        if (check_and_wait())
          return;
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
      }
      LOG_ERROR("failed to kill pid " << m_pid);
#endif
    }

    bool exec::check_and_wait()
    {
#ifdef __linux__
      if (m_pid == 0)
        return true;
      int status;
      pid_t pid = ::waitpid(m_pid, &status, WNOHANG);
      if (pid == m_pid)
      {
        int ret = 0;
        if (WIFEXITED(status) != 0)
        {
          ret = WEXITSTATUS(status);
          LOG_PRINT_L2("exec::check_and_wait() normal exit with return: " << ret);
        }
        else if (WIFSIGNALED(status))
        {
          LOG_PRINT_L2("exec::check_and_wait() signaled exit with signal: " << WTERMSIG(status));
        }
        else if (WIFSTOPPED(status))
        {
          LOG_PRINT_L2("exec::check_and_wait() stoped exit with signal: " << WSTOPSIG(status));
        }
        m_pid = 0;
        return true;
      }
      else if (pid == 0) //working
      {
        LOG_PRINT_RED_L0("exec::check_and_wait() process busy");
        return false;
      }

      LOG_PRINT_RED_L0("exec::check_and_wait() waitpid return error: " << pid);
#endif
      return true;
    }
}
