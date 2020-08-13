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

//#include <atltime.h>
//#include <sqlext.h>
#include <boost/regex.hpp>
#include <boost/date_time/posix_time/posix_time.hpp>
#include <boost/date_time/local_time/local_time.hpp>
#include <boost/date_time/local_time_adjustor.hpp>
#include <boost/date_time/c_local_time_adjustor.hpp>
#include "warnings.h"
#include "syncobj.h"
#include "reg_exp_definer.h"

namespace epee
{
namespace misc_utils
{

#ifdef __ATLTIME_H__

	inline
	bool get_time_t_from_ole_date(DATE src, time_t& res)
	{
		SYSTEMTIME st = {0};
		if(TRUE != ::VariantTimeToSystemTime(src, &st))
			return false;
		ATL::CTime ss(st);
		res = ss.GetTime();
		return true;
	}
#endif
  inline bool get_restore_time_from_str(time_t& dst, const std::string& src)
  {
    try
    {
      STATIC_REGEXP_EXPR_1(re, " *(\\d{4}):(\\d{1,2}):(\\d{1,2}) *", boost::regex::normal);
      boost::smatch match;

      if (!boost::regex_match(src, match, re))
        return false;

      unsigned int year = boost::lexical_cast<unsigned int>(match[1].str());
      unsigned int month = boost::lexical_cast<unsigned int>(match[2].str());
      unsigned int day = boost::lexical_cast<unsigned int>(match[3].str());

      if (year < 1970 || year > 2038
        || month < 1 || month > 12
        || day < 1 || day > 31) {
        return false;
      }

      tm date{};
      date.tm_year = year - 1900;
      date.tm_mon = month - 1;
      date.tm_mday = day;

      dst = mktime(&date);

      if (dst == -1 || dst > std::time(0) + 3600)
        return false;
      return true;
    }
    catch (...)
    {
      return false;
    }
  }

  inline std::string get_time_str_from_format(const time_t& time_, const char* format)
  {
    using pTimeAdjustor = boost::date_time::c_local_adjustor<boost::posix_time::ptime>;
    char tmpbuf[200] = { 0 };

    boost::posix_time::ptime pTime = pTimeAdjustor::utc_to_local(boost::posix_time::from_time_t(time_));

    if (pTime.is_not_a_date_time())
    {
      std::stringstream strs;
      strs << "[wrong_time: " << std::hex << time_ << "]";
      return strs.str();
    }

    tm pt = boost::posix_time::to_tm(pTime);
    strftime(tmpbuf, 199, format, &pt);

    return tmpbuf;
  }

  inline bool get_restore_str_from_time(std::string &dst, const time_t src)
  {
    dst.clear();
    dst.append(get_time_str_from_format(src, "%Y:%m:%d"));
    return true;
  }


	inline 
	std::string get_time_str(const time_t& time_)
	{
    return get_time_str_from_format(time_, "%d.%m.%Y %H:%M:%S");
	}

	inline 
		std::string get_time_str_v2(const time_t& time_)
	{
    return get_time_str_from_format(time_, "%Y_%m_%d %H_%M_%S");
	}

  inline 
    std::string get_time_str_v3(const boost::posix_time::ptime& time_)
  {
    return boost::posix_time::to_simple_string(time_);
  }

  

	inline std::string get_internet_time_str(const time_t& time_)
	{
		char tmpbuf[200] = {0};
    boost::posix_time::ptime pTime =boost::posix_time::from_time_t(time_);
    tm pt = boost::posix_time::to_tm(pTime);
		strftime( tmpbuf, 199, "%a, %d %b %Y %H:%M:%S GMT", &pt );
		return tmpbuf;
	}

	inline std::string get_time_interval_string(const time_t& time_)
	{
		std::string res;
		time_t tail = time_;
		if (tail < 0)
		{
			tail = -tail;
			res = "-";
		}
PUSH_WARNINGS
DISABLE_VS_WARNINGS(4244)
		int days = tail/(60*60*24);
		tail = tail%(60*60*24);
		int hours = tail/(60*60);
		tail = tail%(60*60);
		int minutes = tail/(60);
		tail = tail%(60);
		int seconds = tail;
POP_WARNINGS
		res += std::string("d") + boost::lexical_cast<std::string>(days) + ".h" + boost::lexical_cast<std::string>(hours) + ".m" + boost::lexical_cast<std::string>(minutes) + ".s" + boost::lexical_cast<std::string>(seconds);
		return res;
	}

#ifdef __SQLEXT
	inline
	bool odbc_time_to_oledb_taime(const SQL_TIMESTAMP_STRUCT& odbc_timestamp, DATE& oledb_date)
	{
		
		SYSTEMTIME st = {0};
		st.wYear = odbc_timestamp.year;
		st.wDay = odbc_timestamp.day;
		st.wHour = odbc_timestamp.hour ;
		st.wMilliseconds = (WORD)odbc_timestamp.fraction ;
		st.wMinute = odbc_timestamp.minute ;
		st.wMonth = odbc_timestamp.month ;
		st.wSecond = odbc_timestamp.second ;

		if(TRUE != ::SystemTimeToVariantTime(&st, &oledb_date))
			return false;
		return true;
	}

#endif
}
}