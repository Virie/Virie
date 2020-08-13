#include <epee/include/colored_cout.h>
#include <string>

#define TEST_STRING_OUTPUT_COUNT 100
#define TEST_STRING_SIZE 5000
int main()
{
  std::string test_text(u8"abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ "
    u8"\u0410\u0411\u0412\u0413\u0414\u0415\u0416\u0417\u0418\u0419\u041A\u041B\u041C\u041D\u041E\u041F "
    u8"\u0420\u0421\u0422\u0423\u0424\u0425\u0426\u0427\u0428\u0429\u042A\u042B\u042C\u042D\u042E\u042F "
    u8"1234567890 \u263A\u2639\u263B\u262F\u262E");

  for (int color_number = epee::colored_cout::console_colors::console_color_default; color_number < epee::colored_cout::console_colors::console_color_count; color_number++)
  {
    epee::colored_cout::cu_cout.set_color(color_number, true);
    epee::colored_cout::cu_cout << test_text << std::endl;

    epee::colored_cout::cu_cout.set_color(color_number, false);
    epee::colored_cout::cu_cout << test_text << std::endl;

    epee::colored_cout::cu_cout.reset_color();
  }

  srand(time(NULL));
  for (uint64_t j = 0; j < TEST_STRING_OUTPUT_COUNT; j++)
  {
    std::string output_test_string;
    for (uint64_t i = 0; i < TEST_STRING_SIZE; i++)
    {
      output_test_string += rand() % ('z' - 'a' + 1) + 'a';
    }
    epee::colored_cout::cu_cout << output_test_string;
    epee::colored_cout::cu_cout << u8"\u263A\u2639\u263B\u262F\u262E";
  }
  
  epee::colored_cout::cu_cout << std::endl;
}