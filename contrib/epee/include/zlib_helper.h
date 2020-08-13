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
extern "C" { 
#include "zlib/zlib.h"
}

namespace epee 
{
namespace zlib_helper
{

inline bool pack(const std::string& src, std::string& dest)
{
  dest.clear();
  if (src.size() == 0)
    return true;

  z_stream zstream = {};
  int r = deflateInit(&zstream, Z_DEFAULT_COMPRESSION);
  if (r != Z_OK)
  {
    deflateEnd(&zstream);
    LOG_ERROR("Failed to deflateInit. error: " << zError(r));
    return false;
  }

  uLong dest_size = deflateBound(&zstream, (uLong)src.size());
  dest.resize(dest_size);

  zstream.next_in = (Bytef *)src.data();
  zstream.avail_in = (uInt)src.size();
  zstream.next_out = (Bytef *)dest.data();
  zstream.avail_out = (uInt)dest.size();

  r = deflate(&zstream, Z_FINISH);
  if (!zstream.avail_out || r != Z_STREAM_END)
  {
    deflateEnd(&zstream);
    LOG_ERROR("Failed to deflate. error: " << zError(r));
    return false;
  }

  if(dest.size() != zstream.avail_out)
    dest.resize(dest.size() - zstream.avail_out);

  deflateEnd(& zstream );
  return true;
}

inline bool pack(std::string& target)
{
  if (target.empty())
    return true;
  std::string result;
  bool r = pack(target, result);
  if (r)
    result.swap(target);
  return r;
}

inline bool pack_without_header(std::string& target)
{
  if (target.empty())
    return true;
  std::string result;
  bool r = pack(target, result);
  if (r)
  {
    result.erase(0, 2);
    result.swap(target);
  }
  return r;
}

inline bool unpack(const std::string& src, std::string& dest)
{
  dest.clear();
  if (src.size() == 0)
    return true;

  z_stream zstream = {};
  int r = inflateInit(&zstream);
  if (r != Z_OK)
  {
    inflateEnd(&zstream);
    LOG_ERROR("Failed to inflateInit. error: " << zError(r));
    return false;
  }

  const uInt dest_size = (uInt)src.size() + 4;
  std::string buf;
  zstream.next_in = (Bytef*)src.data();
  zstream.avail_in = (uInt)src.size();

  while (r != Z_STREAM_END)
  {
    buf.resize(dest_size);
    zstream.next_out = (Bytef *)&buf[0];
    zstream.avail_out = dest_size;

    if (zstream.avail_in == 0) break;

    r = inflate(&zstream, Z_NO_FLUSH);
    if (r != Z_OK && r != Z_STREAM_END)
    {
      inflateEnd(&zstream);
      LOG_ERROR("Failed to inflate. error: " << zError(r));
      return false;
    }

    if(dest_size == zstream.avail_out)
    {
      inflateEnd(&zstream);
      LOG_ERROR("Can't unpack buffer");
      return false;
    }

    buf.resize(dest_size - zstream.avail_out);
    if(dest.empty())
      buf.swap(dest);
    else
      dest += buf;
  }

  inflateEnd(&zstream );
  return r == Z_STREAM_END;
}

inline bool unpack(std::string& target)
{
  std::string result;
  bool r = unpack(target, result);
  if (r)
    result.swap(target);
  return r;
}

} // namespace zlib_helper
} // namespace epee
