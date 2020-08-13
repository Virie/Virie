// Copyright (c) 2014-2020 The Virie Project
// Copyright (c) 2012-2013 The Boolberry developers
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include <QApplication>
#include "application/mainwindow.h"
#include "qdebug.h"
#include <thread>
//#include "qtlogger.h"
#include "include_base_utils.h"
#include "currency_core/currency_config.h"
#include <math.h>
#include <string_coding.h>
#include <cstdlib>

// class MyApplication : public QApplication
// {
// 
// 
// }
int main(int argc, char *argv[]) 
{
//#if defined(ARCH_CPU_X86_64) && _MSC_VER <= 1800
       // VS2013's CRT only checks the existence of FMA3 instructions, not the
       // enabled-ness of them at the OS level (this is fixed in VS2015). We force
       // off usage of FMA3 instructions in the CRT to avoid using that path and
       // hitting illegal instructions when running on CPUs that support FMA3, but
       // OSs that don't. Because we use the static library CRT we have to call
       // this function once in each DLL.
       // See http://crbug.com/436603.
//       _set_FMA3_enable(0);
//#endif  // ARCH_CPU_X86_64 && _MSC_VER <= 1800

#ifdef _MSC_VER 
  #ifdef _WIN64
  _set_FMA3_enable(0);
  #endif
  //mutex to let InnoSetup know about running instance
  ::CreateMutex(NULL, FALSE, CURRENCY_NAME_BASE "_instance");
  //::CreateMutex(NULL, FALSE, "Global\\" CURRENCY_NAME_BASE "_instance");
#endif

    QApplication app(argc, argv);
    epee::string_tools::set_module_name_and_folder(app.arguments().at(0).toUtf8().constData());
    QCoreApplication::setAttribute(Qt::AA_EnableHighDpiScaling);
    MainWindow viewer;
   
    std::vector<char*> argvU;
    for (int i = 0; i < argc; i++)
    {
      argvU.push_back(const_cast<char*>(app.arguments().at(i).toUtf8().constData()));
    }
    if (!viewer.init_backend(argc, argvU.data()))
    {
      static_cast<view::i_view*>(&viewer)->show_msg_box("Failed to initialize backend, check debug logs for more details.");
      return 1;
    }
    app.installNativeEventFilter(&viewer);
    viewer.setWindowTitle(CURRENCY_NAME_BASE);
    viewer.show_inital();
    if(!viewer.start_backend())
      return 1;
    
    return app.exec();
}
