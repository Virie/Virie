// Copyright (c) 2014-2020 The Virie Project
// Copyright (c) 2012-2013 The Cryptonote developers
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include "pod_array_file_container.h"

namespace tools
{
  void key_images_container::load(const std::wstring &filename, bool &was_changed)
  {
    if (!m_file_container.open(filename))
      return;
    std::size_t restored_count = 0;
    m_file_container.read_all([this, &restored_count] (const out_key_to_ki &item) {
      if (m_key_images.insert({ item.out_key, item.key_image }).second)
      {
        restored_count++;
        LOG_PRINT_L0("pending key image restored: (" << epee::string_tools::pod_to_hex(item.out_key) << ", " << epee::string_tools::pod_to_hex(item.key_image) << ")");
      }
    });
    if (restored_count)
    {
      was_changed = true;
      LOG_PRINT_L0(restored_count << " elements restored, requesting full wallet resync" << ENDL <<
        "key images size: " << m_key_images.size() << ", file container size: " << m_file_container.size());
    }
  }

  bool key_images_container::push_back(const out_key_to_ki &value)
  {
    return m_key_images.insert({ value.out_key, value.key_image }).second && m_file_container.push_back(value);
  }

  bool key_images_container::empty() const
  {
    return m_key_images.empty();
  }

  key_images_container::key_images_map::size_type key_images_container::size() const
  {
    return m_key_images.size();
  }

  key_images_container::key_images_map::const_iterator key_images_container::find(const key_images_map::key_type &key) const
  {
    return m_key_images.find(key);
  }

  key_images_container::key_images_map::const_iterator key_images_container::end() const
  {
    return m_key_images.end();
  }

  bool key_images_container::clear_file()
  {
    return m_file_container.clear();
  }
} // eof namespace tools