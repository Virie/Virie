// Copyright (c) 2014-2020 The Virie Project
// Copyright (c) 2012-2013 The Boolberry developers
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include <QtWidgets>
#include <QtWebEngineWidgets>
#include <QPrinter>
#include <QPrintDialog>

#include "string_coding.h"
#include "gui_utils.h"
#include "notification_helper.h"
#include "misc_language.h"

#define PREPARE_ARG_FROM_JSON(arg_type, var_name)   \
  arg_type var_name = AUTO_VAL_INIT(var_name); \
  view::api_response default_ar = AUTO_VAL_INIT(default_ar);  \
if (!epee::serialization::load_t_from_json(var_name, param.toStdString())) \
{                                                          \
  default_ar.error_code = API_RETURN_CODE_BAD_ARG;                 \
  return MAKE_RESPONSE(default_ar); \
}

#define PREPARE_RESPONSE(rsp_type, var_name)   view::api_response_t<rsp_type> var_name = AUTO_VAL_INIT(var_name); 
#define MAKE_RESPONSE(r)   epee::serialization::store_t_to_json(r).c_str();

#define LOG_API_TIMING() const char* pfunc_call_name = LOCAL_FUNCTION_DEF__; LOG_PRINT_BLUE("[API:" << pfunc_call_name << "]-->>", LOG_LEVEL_0); uint64_t ticks_before_start = epee::misc_utils::get_tick_count(); \
  auto cb_leave = epee::misc_utils::create_scope_leave_handler([&ticks_before_start, &pfunc_call_name](){ \
  LOG_PRINT_BLUE("[API:" << pfunc_call_name << "]<<-- (" << epee::misc_utils::get_tick_count() - ticks_before_start << "ms)" << (epee::misc_utils::get_tick_count() - ticks_before_start  > 1000 ? "[!!!LONG CALL!!!]":""), LOG_LEVEL_0); \
  });

#define LOG_API_PARAMS(log_level) LOG_PRINT_BLUE(LOCAL_FUNCTION_DEF__ << "(" << param.toStdString() << ")", log_level)


#include "mainwindow.h"
// 
// void MediatorObject::from_html_to_c(const QString &text)
// {
//   from_c_to_html(text);
// }
// 
// template<typename Arg, typename R, typename C>
// struct InvokeWrapper {
//   R *receiver;
//   void (C::*memberFun)(Arg);
//   void operator()(Arg result) {
//     (receiver->*memberFun)(result);
//   }
// };
// 
// template<typename Arg, typename R, typename C>
// InvokeWrapper<Arg, R, C> invoke(R *receiver, void (C::*memberFun)(Arg))
// {
//   InvokeWrapper<Arg, R, C> wrapper = { receiver, memberFun };
//   return wrapper;
// }


std::wstring convert_to_lower_via_qt(const std::wstring& w)
{
	std::wstring r;
	return QString().fromStdWString(w).toLower().toStdWString();
}


MainWindow::MainWindow():
  //m_quit_requested(false),
  m_gui_deinitialize_done_1(false),
  m_backend_stopped_2(false), 
  m_system_shutdown(false)
{
  m_view = new QWebEngineView(this);
  m_channel = new QWebChannel(m_view->page());
  m_view->page()->setWebChannel(m_channel);

  // register QObjects to be exposed to JavaScript
  m_channel->registerObject(QStringLiteral("mediator_object"), this);

  connect(m_view, SIGNAL(loadFinished(bool)), SLOT(on_load_finished(bool)));  
  
  setCentralWidget(m_view);
  //this->setMouseTracking(true);

  m_view->page()->settings()->setAttribute(QWebEngineSettings::LocalContentCanAccessFileUrls, true);
  m_view->page()->settings()->setAttribute(QWebEngineSettings::LocalContentCanAccessRemoteUrls, true);
  m_view->page()->settings()->setAttribute(QWebEngineSettings::LocalStorageEnabled, true);

  m_view->settings()->setAttribute(QWebEngineSettings::LocalContentCanAccessFileUrls, true);
  m_view->settings()->setAttribute(QWebEngineSettings::LocalContentCanAccessRemoteUrls, true);
  m_view->settings()->setAttribute(QWebEngineSettings::LocalStorageEnabled, true);

  m_localization.resize(localization_id_couter);
  m_localization[localization_id_quit] = "Quit";
  m_localization[localization_id_is_received] = " is received";
  m_localization[localization_id_is_confirmed] = " is confirmed";
  m_localization[localization_id_income_transfer_unconfirmed] = "Income transfer (unconfirmed)";
  m_localization[localization_id_income_transfer_confirmed] = "Income transfer confirmed";
  m_localization[localization_id_locked] = "(locked)";
  m_localization[localization_id_mined] = "(mined)";
  m_localization[localization_id_minimized_title] = "Virie app is minimized to tray";
  m_localization[localization_id_minimized_text] = "You can restore it with double-click or context menu";
  m_localization[localization_id_tray_menu_show] = "localization_id_tray_menu_show";
  m_localization[localization_id_tray_menu_minimize] = "localization_id_tray_menu_minimize";

#ifndef _MSC_VER
	//workaround for macos broken tolower from std, very dirty hack
  bc_services::set_external_to_low_converter(convert_to_lower_via_qt);
#endif

}

MainWindow::~MainWindow()
{
  m_backend.subscribe_to_core_events(nullptr);
  m_view->page()->setWebChannel(nullptr);
  m_channel->deregisterObject(this);
  delete m_channel;
}

void MainWindow::on_load_finished(bool ok)
{
  LOG_PRINT("MainWindow::on_load_finished(ok = " << (ok ? "true" : "false") << ")", LOG_LEVEL_0);
}



//-------------
QString MainWindow::get_default_user_dir(const QString& param)
TRY_ENTRY()
{
  return tools::get_default_user_dir().c_str();
}
CATCH_ENTRY("MainWindow::get_default_user_dir", QString())


bool MainWindow::toggle_mining()
TRY_ENTRY()
{
  m_backend.toggle_pos_mining();
  return true;
}
CATCH_ENTRY("MainWindow::toggle_mining", false)

QString MainWindow::get_exchange_last_top(const QString& params)
{
  return QString();
}

QString MainWindow::get_tx_pool_info()
TRY_ENTRY()
{
  LOG_API_TIMING();
  PREPARE_RESPONSE(view::get_tx_pool_info_response, ar);
  ar.error_code = m_backend.get_tx_pool_info(ar.response_data);
  return MAKE_RESPONSE(ar);
}
CATCH_ENTRY_CUSTOM("MainWindow::get_tx_pool_info",
                  {PREPARE_RESPONSE(view::get_tx_pool_info_response, ar);
                   ar.error_code = API_RETURN_CODE_FAIL;
                   return MAKE_RESPONSE(ar);}, QString())
// bool MainWindow::store_config()
// {
//   return true;
// }

QString MainWindow::get_default_fee()
{
  return QString(std::to_string(m_backend.get_default_fee()).c_str());
}

QString MainWindow::get_options()
TRY_ENTRY()
{
  LOG_API_TIMING();
  PREPARE_RESPONSE(view::gui_options, ar);
  m_backend.get_gui_options(ar.response_data);
  ar.error_code = API_RETURN_CODE_OK;
  return MAKE_RESPONSE(ar);
}
CATCH_ENTRY_CUSTOM("MainWindow::get_options",
                  {PREPARE_RESPONSE(view::gui_options, ar);
                   ar.error_code = API_RETURN_CODE_FAIL;
                   return MAKE_RESPONSE(ar);}, QString())

void MainWindow::tray_quit_requested()
TRY_ENTRY()
{
  LOG_PRINT_MAGENTA("[GUI]->[HTML] tray_quit_requested", LOG_LEVEL_0);  
  emit quit_requested("{}");
}
CATCH_ENTRY("MainWindow::tray_quit_requested", )

void MainWindow::closeEvent(QCloseEvent *event)
TRY_ENTRY()
{
  LOG_PRINT_L0("[GUI] CLOSE EVENT");
   CHECK_AND_ASSERT_MES(m_gui_deinitialize_done_1 == m_backend_stopped_2, void(), "m_gui_deinitialize_done_1 != m_backend_stopped_2, m_gui_deinitialize_done_1 = " << m_gui_deinitialize_done_1 
     << "m_backend_stopped_2 = " << m_backend_stopped_2);


   if (m_system_shutdown && !m_gui_deinitialize_done_1)
   {
     LOG_PRINT_MAGENTA("Shutting down without waiting response from html", LOG_LEVEL_0);
     //Usually QtWebEngineProcess.exe already killed at this moment, so we won't get response from html.
     m_gui_deinitialize_done_1 = true;
     m_backend.send_stop_signal();
   }
   else if (m_gui_deinitialize_done_1 && m_backend_stopped_2)
   {
     store_pos(true);
     store_app_config();
     event->accept();
   }
   else
   {
     //m_quit_requested = true;
     LOG_PRINT_L0("[GUI]->[HTML] quit_requested");
     emit quit_requested("{}");
     event->ignore();
   }
}
CATCH_ENTRY("MainWindow::closeEvent", )

std::string state_to_text(int s)
TRY_ENTRY()
{
  std::string res = epee::string_tools::int_to_hex(s);
  res += "(";
  if (s & Qt::WindowMinimized)
    res += " WindowMinimized";
  if (s & Qt::WindowMaximized)
    res += " WindowMaximized";
  if (s & Qt::WindowFullScreen)
    res += " WindowFullScreen";
  if (s & Qt::WindowActive)
    res += " WindowActive";
  res += ")";

  return res;
}
CATCH_ENTRY("state_to_text", std::string())

void MainWindow::changeEvent(QEvent *e)
TRY_ENTRY()
{
  switch (e->type())
  {
  case QEvent::WindowStateChange:
  {
    QWindowStateChangeEvent* event = static_cast< QWindowStateChangeEvent* >(e);
    qDebug() << "Old state: " << state_to_text(event->oldState()).c_str() << ", new state: " << state_to_text(this->windowState()).c_str();

    if (event->oldState() & Qt::WindowMinimized && !(this->windowState() & Qt::WindowMinimized))
    {
      qDebug() << "Window restored (to normal or maximized state)!";
      if (m_tray_icon)
      {
        //QTimer::singleShot(250, this, SLOT(show()));
      }
      restore_pos();
    }
    else if (!(event->oldState() & Qt::WindowMinimized) && (this->windowState() & Qt::WindowMinimized))
    {
      qDebug() << "Window minimized";
      store_pos();
      show_notification(m_localization[localization_id_minimized_title], m_localization[localization_id_minimized_text]);
    }
    else if (!(event->oldState() & Qt::WindowMaximized) && (this->windowState() & Qt::WindowMaximized))
    {
      //maximize
      store_pos();
      this->update();
    }
    else if ((event->oldState() & Qt::WindowMaximized) && !(this->windowState() & Qt::WindowMaximized))
    {
      //restore
      this->update();
    }

    break;
  }
  default:
    break;
  }

  QWidget::changeEvent(e);
}
CATCH_ENTRY("MainWindow::changeEvent", )

bool MainWindow::store_app_config()
TRY_ENTRY()
{
  std::string conf_path = m_backend.get_config_folder() + "/" + GUI_INTERNAL_CONFIG;
  LOG_PRINT_L0("storing gui internal config from " << conf_path);
  CHECK_AND_ASSERT_MES(tools::serialize_obj_to_file(m_config, conf_path), false, "failed to store gui internal config");
  return true;
}
CATCH_ENTRY("MainWindow::store_app_config", false)

bool MainWindow::load_app_config()
TRY_ENTRY()
{
  std::string conf_path = m_backend.get_config_folder() + "/" + GUI_INTERNAL_CONFIG;
  LOG_PRINT_L0("loading gui internal config from " << conf_path);
  bool r = tools::unserialize_obj_from_file(m_config, conf_path);
  LOG_PRINT_L0("gui internal config " << (r ? "loaded ok" : "was not loaded"));
  return r;
}
CATCH_ENTRY("MainWindow::load_app_config", false)

bool MainWindow::init(const std::string& htmlPath)
TRY_ENTRY()
{
  //QtWebEngine::initialize();
  init_tray_icon(htmlPath);
  set_html_path(htmlPath);

  m_backend.subscribe_to_core_events(this);

  bool r = QSslSocket::supportsSsl();
  if (r)
  {
    LOG_PRINT_GREEN("[Support SSL]: YES", LOG_LEVEL_0);
  }
  else
  {
//    QMessageBox::question(this, "OpenSSL support disabled.", "OpenSSL support disabled.",
//      QMessageBox::Ok);
    LOG_PRINT_RED("[Support SSL]: NO", LOG_LEVEL_0);
  }

  //----
  this->setContextMenuPolicy(Qt::ContextMenuPolicy::NoContextMenu);
  m_view->setContextMenuPolicy(Qt::ContextMenuPolicy::NoContextMenu);

  return true;
}
CATCH_ENTRY("MainWindow::init", false)

void MainWindow::on_menu_show()
TRY_ENTRY()
{
  qDebug() << "Context menu: show()";
  this->show();
  this->activateWindow();
}
CATCH_ENTRY("MainWindow::on_menu_show", )

void MainWindow::init_tray_icon(const std::string& htmlPath)
TRY_ENTRY()
{
  if (!QSystemTrayIcon::isSystemTrayAvailable())
  {
    LOG_PRINT_L0("System tray is unavailable");
    return;
  }


  m_restore_action = std::unique_ptr<QAction>(new QAction(tr("&Restore"), this));
  connect(m_restore_action.get(), SIGNAL(triggered()), this, SLOT(on_menu_show()));

  m_quit_action = std::unique_ptr<QAction>(new QAction(tr("&Quit"), this));
  connect(m_quit_action.get(), SIGNAL(triggered()), this, SLOT(tray_quit_requested()));

  m_minimize_action = std::unique_ptr<QAction>(new QAction(tr("minimizeAction"), this));
  connect(m_minimize_action.get(), SIGNAL(triggered()), this, SLOT(showMinimized()));

  m_tray_icon_menu = std::unique_ptr<QMenu>(new QMenu(this));
  m_tray_icon_menu->addAction(m_minimize_action.get());
  //m_tray_icon_menu->addAction(m_restore_action.get());
  m_tray_icon_menu->addSeparator();
  m_tray_icon_menu->addAction(m_quit_action.get());

  m_tray_icon = std::unique_ptr<QSystemTrayIcon>(new QSystemTrayIcon(this));
  m_tray_icon->setContextMenu(m_tray_icon_menu.get());

  //setup icon
#ifdef TARGET_OS_MAC
  m_normal_icon_path = htmlPath + "/files/app22macos.png"; // X11 tray icon size is 22x22
  m_blocked_icon_path = htmlPath + "/files/app22macos_blocked.png"; // X11 tray icon size is 22x22
#else
  m_normal_icon_path = htmlPath + "/files/app22windows.png"; // X11 tray icon size is 22x22
  m_blocked_icon_path = htmlPath + "/files/app22windows_blocked.png"; // X11 tray icon size
#endif
                                                                      //setWindowIcon(QIcon(iconPath.c_str()));
  QIcon qi(m_normal_icon_path.c_str());
  qi.setIsMask(true);
  m_tray_icon->setIcon(qi);
  m_tray_icon->setToolTip(CURRENCY_NAME_BASE);
  connect(m_tray_icon.get(), SIGNAL(activated(QSystemTrayIcon::ActivationReason)),
    this, SLOT(trayIconActivated(QSystemTrayIcon::ActivationReason)));
  m_tray_icon->show();
}
CATCH_ENTRY("MainWindow::init_tray_icon", )

void MainWindow::bool_toggle_icon(const QString& param)
TRY_ENTRY()
{
  std::string path;

  if (param == "blocked")
    path = m_blocked_icon_path;
  else
    path = m_normal_icon_path;

  QIcon qi(path.c_str());
  qi.setIsMask(true);
  m_tray_icon->setIcon(qi);
}
CATCH_ENTRY("MainWindow::bool_toggle_icon", )

QString MainWindow::get_log_file()
TRY_ENTRY()
{
  std::string buff;
  epee::file_io_utils::load_last_n_from_file_to_string(log_space::log_singletone::get_actual_log_file_path(), 1000000, buff);
  return QString::fromStdString(buff);
}
CATCH_ENTRY("MainWindow::get_log_file", QString())

void MainWindow::store_window_pos()
TRY_ENTRY()
{
  m_config.geometry = saveGeometry().toStdString();
  m_config.state = saveState().toStdString();
}
CATCH_ENTRY("MainWindow::store_window_pos", )

void MainWindow::restore_window_pos()
TRY_ENTRY()
{
  if (m_config.geometry.empty() || m_config.state.empty())
  {
    apply_default_window_size();
    return;
  }
  restoreGeometry(QByteArray(m_config.geometry.c_str(), m_config.geometry.size()));
  restoreState(QByteArray(m_config.state.c_str(), m_config.state.size()));
}
CATCH_ENTRY("MainWindow::store_window_pos", )

void MainWindow::apply_default_window_size()
TRY_ENTRY()
{
  this->resize(QSize(1200, 770));
}
CATCH_ENTRY("MainWindow::store_pos", )

void MainWindow::store_pos(bool consider_showed)
TRY_ENTRY()
{
  m_config.is_maximized = this->isMaximized();
  //here position supposed to be filled from last unserialize  or filled on maximize handler
  if (!m_config.is_maximized)
    store_window_pos();
  if (consider_showed)
    m_config.is_showed = this->isVisible();
}
CATCH_ENTRY("MainWindow::store_pos", )

void MainWindow::restore_pos(bool consider_showed)
TRY_ENTRY()
{
  restore_window_pos();
  if (consider_showed && !m_config.is_showed)
    setWindowState(windowState() | Qt::WindowMinimized);
  else if (m_config.is_maximized)
    setWindowState(windowState() | Qt::WindowMaximized);
}
CATCH_ENTRY("MainWindow::restore_pos", )

void MainWindow::trayIconActivated(QSystemTrayIcon::ActivationReason reason)
TRY_ENTRY()
{
  if (reason == QSystemTrayIcon::ActivationReason::Trigger)
  {
    if ( !(this->windowState() & Qt::WindowMinimized))
    {
      showMinimized();
    }
    else
    {
      showNormal();
      activateWindow();
    }
  }
}
CATCH_ENTRY("MainWindow::trayIconActivated", )

void MainWindow::load_file(const QString &fileName)
TRY_ENTRY()
{
  LOG_PRINT_L0("Loading html from path: " << fileName.toStdString());
  m_view->load(QUrl::fromLocalFile(QFileInfo(fileName).absoluteFilePath()));
}
CATCH_ENTRY("MainWindow::load_file", )

QString MainWindow::set_clipboard(const QString& param)
TRY_ENTRY()
{
  LOG_API_TIMING();
  QClipboard *clipboard = QApplication::clipboard();
  clipboard->setText(param);
  return "OK";
}
CATCH_ENTRY("MainWindow::set_clipboard", "")

QString MainWindow::get_clipboard()
TRY_ENTRY()
{
  LOG_API_TIMING();
  QClipboard *clipboard = QApplication::clipboard();
  return clipboard->text();
}
CATCH_ENTRY("MainWindow::get_clipboard", "")

QString MainWindow::on_request_quit()
TRY_ENTRY()
{
  LOG_PRINT_MAGENTA("[HTML]->[GUI] on_request_quit", LOG_LEVEL_0);
  m_gui_deinitialize_done_1 = true;
  m_backend.send_stop_signal();

  return "OK";
}
CATCH_ENTRY("inWindow::on_request_quit", API_RETURN_CODE_INTERNAL_ERROR)

bool MainWindow::do_close()
TRY_ENTRY()
{
  this->close();
  return true;
}
CATCH_ENTRY("MainWindow::do_close", false)

bool MainWindow::show_inital()
TRY_ENTRY()
{
  if (load_app_config())
    restore_pos(true);
  else
  {
    apply_default_window_size();
    store_window_pos();
    m_config.is_maximized = false;
    m_config.is_showed = true;
  }
  this->show();
  return true;
}
CATCH_ENTRY("MainWindow::show_inital", false)

bool MainWindow::on_backend_stopped()
TRY_ENTRY()
{
  LOG_PRINT_L0("[BACKEND]->[GUI] on_backend_stopped");
  m_backend_stopped_2 = true;
  //m_deinitialize_done = true;
//  if (m_quit_requested)
//  {

    /*bool r = */QMetaObject::invokeMethod(this, "do_close", Qt::QueuedConnection);
// }
  return true;
}
CATCH_ENTRY("MainWindow::on_backend_stopped", false)

bool MainWindow::update_daemon_status(const view::daemon_status_info& info)
TRY_ENTRY()
{
  //this->update_daemon_state(info);
  std::string json_str;
  epee::serialization::store_t_to_json(info, json_str);

  //lifehack
  if (m_last_update_daemon_status_json == json_str)
    return true;

  LOG_PRINT_L0("SENDING SIGNAL -> [update_daemon_state] " << info.daemon_network_state
               << "; [net_time_delta_median] " << info.net_time_delta_median  //temporarily
               << "; json: " << json_str);  //temporarily
  //this->update_daemon_state(json_str.c_str());
  QMetaObject::invokeMethod(this, "update_daemon_state", Qt::QueuedConnection, Q_ARG(QString, json_str.c_str()));
  m_last_update_daemon_status_json = json_str;
  return true;
}
CATCH_ENTRY("MainWindow::update_daemon_status", false)

bool MainWindow::show_msg_box(const std::string& message)
TRY_ENTRY()
{
  QMessageBox::information(this, "Error", message.c_str(), QMessageBox::Ok);
  return true;
}
CATCH_ENTRY("MainWindow::show_msg_box", false)

bool MainWindow::init_backend(int argc, char* argv[])
TRY_ENTRY()
{
  return m_backend.init(argc, argv, this);
}
CATCH_ENTRY("MainWindow::init_backend", false)

bool MainWindow::start_backend()
TRY_ENTRY()
{
  return m_backend.start();
}
CATCH_ENTRY("MainWindow::start_backend", false)

bool MainWindow::update_wallet_status(const view::wallet_status_info& wsi)
TRY_ENTRY()
{
  m_wallet_states->operator [](wsi.wallet_id) = wsi.wallet_state;
  std::string json_str;
  epee::serialization::store_t_to_json(wsi, json_str);
  LOG_PRINT_L0("SENDING SIGNAL -> [update_wallet_status]:" << std::endl << json_str );
  QMetaObject::invokeMethod(this, "update_wallet_status", Qt::QueuedConnection, Q_ARG(QString, json_str.c_str()));
  return true;
}
CATCH_ENTRY("MainWindow::update_wallet_status", false)

bool MainWindow::set_options(const view::gui_options& opt)
TRY_ENTRY()
{
  std::string json_str;
  epee::serialization::store_t_to_json(opt, json_str);
  LOG_PRINT_L0("SENDING SIGNAL -> [set_options]:" << std::endl << json_str);
  QMetaObject::invokeMethod(this, "set_options", Qt::QueuedConnection, Q_ARG(QString, json_str.c_str()));
  return true;
}
CATCH_ENTRY("MainWindow::set_options", false)

bool MainWindow::nativeEventFilter(const QByteArray &eventType, void *message, long *result)
TRY_ENTRY()
{
#ifdef WIN32
  MSG *msg = static_cast< MSG * >(message);
  if (msg->message == WM_QUERYENDSESSION)
  {
    m_system_shutdown = true;
    LOG_PRINT_MAGENTA("SYSTEM SHUTDOWN", LOG_LEVEL_0);
  }
#endif
  return false;
}
CATCH_ENTRY("MainWindow::nativeEventFilter", false)


bool MainWindow::update_wallets_info(const view::wallets_summary_info& wsi)
TRY_ENTRY()
{
  std::string json_str;
  epee::serialization::store_t_to_json(wsi, json_str);
  LOG_PRINT_L0("SENDING SIGNAL -> [update_wallets_info]"<< std::endl << json_str );
  
  QMetaObject::invokeMethod(this, "update_wallets_info", Qt::QueuedConnection, Q_ARG(QString, json_str.c_str()));
  return true;
}
CATCH_ENTRY("MainWindow::update_wallets_info", false)

bool MainWindow::money_transfer(const view::transfer_event_info& tei)
TRY_ENTRY()
{
  std::string json_str;
  epee::serialization::store_t_to_json(tei, json_str);

  LOG_PRINT_L0("SENDING SIGNAL -> [money_transfer]" << std::endl << json_str);
  //this->money_transfer(json_str.c_str());
  QMetaObject::invokeMethod(this, "money_transfer", Qt::QueuedConnection, Q_ARG(QString, json_str.c_str()));
  if (!m_tray_icon)
    return true;
  if (!tei.ti.is_income)
    return true;
  if (!tei.ti.amount)
    return true;
//  if (tei.ti.is_mining && m_wallet_states->operator [](tei.wallet_id) != view::wallet_status_info::wallet_state_ready)
//    return true;

//don't show unconfirmed tx
  if (tei.ti.height == 0)
    return true;

  auto amount_str = currency::print_money(tei.ti.amount);
  std::string title, msg;
  if (tei.ti.height == 0) // unconfirmed trx
  {
    msg = amount_str + " " + CURRENCY_NAME_ABR + " " + m_localization[localization_id_is_received];
    title = m_localization[localization_id_income_transfer_unconfirmed];
  }
  else
  {
    msg = amount_str + " " + CURRENCY_NAME_ABR + " " + m_localization[localization_id_is_confirmed];
    title = m_localization[localization_id_income_transfer_confirmed];
  }
  if (tei.ti.is_mining)
    msg += m_localization[localization_id_mined];
  else if (tei.ti.unlock_time)
    msg += m_localization[localization_id_locked];

  QMetaObject::invokeMethod(this, "show_notification", Qt::QueuedConnection, Q_ARG(QString, title.c_str()), Q_ARG(QString, msg.c_str()));

  return true;
}
CATCH_ENTRY("MainWindow::money_transfer", false)

bool MainWindow::money_transfer_cancel(const view::transfer_event_info& tei)
TRY_ENTRY()
{
  std::string json_str;
  epee::serialization::store_t_to_json(tei, json_str);

  LOG_PRINT_L0("SENDING SIGNAL -> [money_transfer_cancel]");
  //this->money_transfer_cancel(json_str.c_str());
  QMetaObject::invokeMethod(this, "money_transfer_cancel", Qt::QueuedConnection, Q_ARG(QString, json_str.c_str()));

  return true;
}
CATCH_ENTRY("MainWindow::money_transfer_cancel", false)

bool MainWindow::wallet_sync_progress(const view::wallet_sync_progres_param& p)
TRY_ENTRY()
{
  LOG_PRINT_L2("SENDING SIGNAL -> [wallet_sync_progress]" << " wallet_id: " << p.wallet_id << ": " << p.progress << "%");
  //this->wallet_sync_progress(epee::serialization::store_t_to_json(p).c_str());
  QMetaObject::invokeMethod(this, "wallet_sync_progress", Qt::QueuedConnection, Q_ARG(QString, epee::serialization::store_t_to_json(p).c_str()));
  return true;
}
CATCH_ENTRY("MainWindow::wallet_sync_progress", false)

bool MainWindow::set_html_path(const std::string& path)
TRY_ENTRY()
{
  load_file(QString((path + "/index.html").c_str()));
  return true;
}
CATCH_ENTRY("MainWindow::set_html_path", false)

bool MainWindow::pos_block_found(const currency::block& block_found)
TRY_ENTRY()
{
  std::stringstream ss;
  ss << "Found Block h = " << currency::get_block_height(block_found);
  LOG_PRINT_L0("SENDING SIGNAL -> [update_pos_mining_text]");
  //this->update_pos_mining_text(ss.str().c_str());
  QMetaObject::invokeMethod(this, "update_pos_mining_text", Qt::QueuedConnection, Q_ARG(QString, ss.str().c_str()));
  return true;
}
CATCH_ENTRY("MainWindow::pos_block_found", false)

QString MainWindow::get_version()
{
  return PROJECT_VERSION_LONG;
}

QString MainWindow::get_os_version()
TRY_ENTRY()
{
  return tools::get_os_version_string().c_str();
}
CATCH_ENTRY("MainWindow::get_os_version", API_RETURN_CODE_INTERNAL_ERROR)

QString MainWindow::get_alias_cost(const QString& param)
TRY_ENTRY()
{
  LOG_API_TIMING();
  PREPARE_ARG_FROM_JSON(view::struct_with_one_t_type<std::string>, lvl);
  view::get_alias_cost_response resp = AUTO_VAL_INIT(resp);
  resp.error_code = m_backend.get_alias_cost(lvl.v, resp.cost);
  return MAKE_RESPONSE(resp);
}
CATCH_ENTRY_CUSTOM("MainWindow::get_alias_cost", {view::get_alias_cost_response resp = AUTO_VAL_INIT(resp);
                                                   resp.error_code = API_RETURN_CODE_FAIL;
                                                   return MAKE_RESPONSE(resp);}, QString())

QString MainWindow::set_localization_strings(const QString param)
TRY_ENTRY()
{
  LOG_API_TIMING();
  PREPARE_ARG_FROM_JSON(view::set_localization_request, lr);
  view::api_response resp = AUTO_VAL_INIT(resp);

  if (lr.strings.size()  < localization_id_couter)
  {
    LOG_ERROR("Wrong localization size: " << lr.strings.size() << ", expected size at least " << localization_id_couter);
    resp.error_code = API_RETURN_CODE_FAIL;
  }
  else
  {
    m_localization = lr.strings;
    m_quit_action->setText(QString().fromUtf8(m_localization[localization_id_quit].c_str()));
    m_restore_action->setText(QString().fromUtf8(m_localization[localization_id_tray_menu_show].c_str()));
    m_minimize_action->setText(QString().fromUtf8(m_localization[localization_id_tray_menu_minimize].c_str()));
    resp.error_code = API_RETURN_CODE_OK;
    LOG_PRINT_L0("New localization set, language title: " << lr.language_title << ", strings " << lr.strings.size());
  }
  return MAKE_RESPONSE(resp);
}
CATCH_ENTRY_CUSTOM("MainWindow::set_localization_strings", {view::api_response resp = AUTO_VAL_INIT(resp);
                                                            resp.error_code = API_RETURN_CODE_FAIL;
                                                            return MAKE_RESPONSE(resp);}, QString())

QString MainWindow::request_alias_registration(const QString& param)
TRY_ENTRY()
{
  LOG_API_TIMING();
  //return que_call2<view::request_alias_param>("request_alias_registration", param, [this](const view::request_alias_param& tp, view::api_response& ar){
  PREPARE_ARG_FROM_JSON(view::request_alias_param, tp);
  PREPARE_RESPONSE(view::transfer_response, ar);

  //  view::transfer_response tr = AUTO_VAL_INIT(tr);
  currency::transaction res_tx = AUTO_VAL_INIT(res_tx);
  ar.error_code = m_backend.request_alias_registration(tp.alias, tp.wallet_id, tp.fee, res_tx, tp.reward);
  if (ar.error_code != API_RETURN_CODE_OK)
    return MAKE_RESPONSE(ar);


  ar.response_data.success = true;
  ar.response_data.tx_hash = string_tools::pod_to_hex(currency::get_transaction_hash(res_tx));
  ar.response_data.tx_blob_size = currency::get_object_blobsize(res_tx);
  ar.error_code = API_RETURN_CODE_OK;
  return MAKE_RESPONSE(ar);
}
CATCH_ENTRY_CUSTOM("MainWindow::request_alias_registration", {PREPARE_RESPONSE(view::transfer_response, ar);
                                                              ar.error_code = API_RETURN_CODE_FAIL;
                                                              return MAKE_RESPONSE(ar);}, QString())

QString MainWindow::request_alias_update(const QString& param)
TRY_ENTRY()
{
  LOG_API_TIMING();
  PREPARE_ARG_FROM_JSON(view::request_alias_param, tp);
  PREPARE_RESPONSE(view::transfer_response, ar);

  //  view::transfer_response tr = AUTO_VAL_INIT(tr);
  currency::transaction res_tx = AUTO_VAL_INIT(res_tx);
  ar.error_code = m_backend.request_alias_update(tp.alias, tp.wallet_id, tp.fee, res_tx, tp.reward);
  if (ar.error_code != API_RETURN_CODE_OK)
    return MAKE_RESPONSE(ar);


  ar.response_data.success = true;
  ar.response_data.tx_hash = string_tools::pod_to_hex(currency::get_transaction_hash(res_tx));
  ar.response_data.tx_blob_size = currency::get_object_blobsize(res_tx);
  ar.error_code = API_RETURN_CODE_OK;
  return MAKE_RESPONSE(ar);
}
CATCH_ENTRY_CUSTOM("QString MainWindow::request_alias_update", {PREPARE_RESPONSE(view::transfer_response, ar);
                                                                ar.error_code = API_RETURN_CODE_FAIL;
                                                                return MAKE_RESPONSE(ar);}, QString())

QString MainWindow::transfer(const QString& param)
TRY_ENTRY()
{
  LOG_API_TIMING();
  //return que_call2<view::transfer_params>("transfer", json_transfer_object, [this](const view::transfer_params& tp, view::api_response& ar){
  PREPARE_ARG_FROM_JSON(view::transfer_params, tp);
  PREPARE_RESPONSE(view::transfer_response, ar);

  if (!tp.destinations.size())
  {
    ar.error_code = API_RETURN_CODE_BAD_ARG;
    return MAKE_RESPONSE(ar);
  }

  currency::transaction res_tx = AUTO_VAL_INIT(res_tx);
  ar.error_code = m_backend.transfer(tp.wallet_id, tp, res_tx);
  if (ar.error_code != API_RETURN_CODE_OK)
    return MAKE_RESPONSE(ar);

  ar.response_data.success = true;
  ar.response_data.tx_hash = string_tools::pod_to_hex(currency::get_transaction_hash(res_tx));
  ar.response_data.tx_blob_size = currency::get_object_blobsize(res_tx);
  return MAKE_RESPONSE(ar);
}
CATCH_ENTRY_CUSTOM("MainWindow::transfer", {PREPARE_RESPONSE(view::transfer_response, ar);
                                            ar.error_code = API_RETURN_CODE_FAIL;
                                            return MAKE_RESPONSE(ar);}, QString())

void MainWindow::message_box(const QString& msg)
TRY_ENTRY()
{
  show_msg_box(msg.toStdString());
}
CATCH_ENTRY("MainWindow::message_box", )

struct serialize_variant_visitor : public boost::static_visitor<std::string>
{
  template<class t_type>
  std::string operator()(const t_type& v) const
  {
    return epee::serialization::store_t_to_json(v);
  }
};

template <class t_variant>
std::string serialize_variant(const t_variant& v)
TRY_ENTRY()
{
  return boost::apply_visitor(serialize_variant_visitor(), v);
}
CATCH_ENTRY("serialize_variant", std::string())


void MainWindow::on_core_event(const std::string& event_name, const currency::core_event_v& e)
TRY_ENTRY()
{
  //at the moment we don't forward CORE_EVENT_BLOCK_ADDEDevent to GUI
  if (CORE_EVENT_BLOCK_ADDED == event_name)
    return;

  currency::core_event ce{};
  ce.details = currency::core_event_v(e);
  ce.method = event_name;

  CRITICAL_REGION_LOCAL(m_events_lock);
  m_events.push_back(ce);
}
CATCH_ENTRY("MainWindow::on_core_event", )

std::string get_events_que_json_string(const std::list<currency::core_event>& eq, std::string& methods_list)
TRY_ENTRY()
{
  //t the moment portable_storage is not supporting polymorphic objects lists, so 
  //there is no hope to make serialization with variant list, lets handle it manual
  std::stringstream ss;
  ss << "{  \"events\" : [";
  uint64_t need_coma = false;
  for (const auto& e : eq)
  {
    if (need_coma)
    {
      ss << ",";
      methods_list += "|";
    }
    methods_list += e.method;
    ss << "{ \"method\": \"" << e.method << "\","  << ENDL;
    ss << "\"details\": " << serialize_variant(e.details) << ENDL << "}";
    need_coma = true;
  }
  ss << "]}";
  return ss.str();
}
CATCH_ENTRY("get_events_que_json_string", std::string())

struct events_que_struct
{
  std::list<currency::core_event> m_que;

  BEGIN_KV_SERIALIZE_MAP()
    KV_SERIALIZE(m_que)
  END_KV_SERIALIZE_MAP()
};

void MainWindow::on_complete_events()
TRY_ENTRY()
{
  events_que_struct events_local{};
  {
    CRITICAL_REGION_LOCAL(m_events_lock);
    events_local.m_que.swap(m_events);
  }
  if (!events_local.m_que.empty())
  {
    std::string methods_list;
    TIME_MEASURE_START_MS(core_events_handl_time);
    TIME_MEASURE_START_MS(json_buff_generate_time);
    std::string json_buff = get_events_que_json_string(events_local.m_que, methods_list);
    TIME_MEASURE_FINISH_MS(json_buff_generate_time);
    

    bool res = QMetaObject::invokeMethod(this, "on_core_event",
      Qt::QueuedConnection,
      Q_ARG(QString, QString(json_buff.c_str())));
    TIME_MEASURE_FINISH_MS(core_events_handl_time);
    if (!res)
    {
      LOG_ERROR("QMetaObject::invokeMethod for \"on_core_event\" returned false" << ENDL << "Details: " << ENDL << json_buff);
    }
    LOG_PRINT_L0("SENT SIGNAL -> [CORE_EVENTS]: " << events_local.m_que.size()
      << ", handle_time: " << core_events_handl_time << "(json: " << json_buff_generate_time << ")ms, json_buff size = " << json_buff.size() << ", methods: " << methods_list);
    LOG_PRINT_L2("CORE_EVENTS sent signal details: " << ENDL << json_buff);
  }
}
CATCH_ENTRY("MainWindow::on_complete_events", );

void MainWindow::on_clear_events()
TRY_ENTRY()
{
  CRITICAL_REGION_LOCAL(m_events_lock);
  m_events.clear();
}
CATCH_ENTRY("MainWindow::on_clear_events", )

QString MainWindow::get_secure_app_data(const QString& param)
TRY_ENTRY()
{
  LOG_API_TIMING();
  view::api_response ar = AUTO_VAL_INIT(ar);
  view::password_data pwd = AUTO_VAL_INIT(pwd);

  if (!epee::serialization::load_t_from_json(pwd, param.toStdString()))
  {
    ar.error_code = API_RETURN_CODE_BAD_ARG;
    return MAKE_RESPONSE(ar);
  }

  std::string app_data_buff;
  std::string filename = m_backend.get_config_folder() + "/" + GUI_SECURE_CONFIG_FILENAME;
  bool r = file_io_utils::load_file_to_string(filename, app_data_buff);
  if (!r)
  {
    LOG_PRINT_L1("gui secure config was not loaded from " << filename);
    return "";
  }

  if (app_data_buff.size() < sizeof(app_data_file_binary_header))
  {
    LOG_ERROR("app_data_buff.size() < sizeof(app_data_file_binary_header) check failed while loading from " << filename);
    ar.error_code = API_RETURN_CODE_FAIL;
    return MAKE_RESPONSE(ar);
  }

  crypto::chacha_crypt(app_data_buff, pwd.pass);

  const app_data_file_binary_header* phdr = reinterpret_cast<const app_data_file_binary_header*>(app_data_buff.data());
  if (phdr->m_signature != APP_DATA_FILE_BINARY_SIGNATURE)
  {
    LOG_ERROR("gui secure config: password missmatch while loading from " << filename);
    ar.error_code = API_RETURN_CODE_WRONG_PASSWORD;
    return MAKE_RESPONSE(ar);
  }

  return app_data_buff.substr(sizeof(app_data_file_binary_header)).c_str();
}
CATCH_ENTRY_CUSTOM("MainWindow::get_secure_app_data", {view::api_response ar = AUTO_VAL_INIT(ar);
                                                       ar.error_code = API_RETURN_CODE_FAIL;
                                                       return MAKE_RESPONSE(ar);}, QString())

QString MainWindow::store_app_data(const QString& param)
TRY_ENTRY()
{
  LOG_API_TIMING();
  view::api_response ar = AUTO_VAL_INIT(ar);

  const std::string folder = m_backend.get_config_folder();
  if (!tools::create_directories_if_necessary(folder))
  {
    LOG_PRINT_L0("Failed to create data directory: " << folder);
    ar.error_code = API_RETURN_CODE_FAIL;
    return MAKE_RESPONSE(ar);
  }

  //bool r = file_io_utils::save_string_to_file(m_backend.get_config_folder() + "/" + GUI_CONFIG_FILENAME, param.toStdString());

  const std::string file = folder + "/" + GUI_CONFIG_FILENAME;
  bool r = file_io_utils::save_string_to_file(file, param.toStdString());
  //view::api_response ar;
  if (!r)
  {
    LOG_PRINT_L0("Failed to store data to file: " << file);
    ar.error_code = API_RETURN_CODE_FAIL;
    return MAKE_RESPONSE(ar);
  }
  //ar.error_code = store_to_file((m_backend.get_config_folder() + "/" + GUI_CONFIG_FILENAME).c_str(), param).toStdString();
  ar.error_code = API_RETURN_CODE_OK;
  return MAKE_RESPONSE(ar);
}
CATCH_ENTRY_CUSTOM("MainWindow::store_app_data", {view::api_response ar = AUTO_VAL_INIT(ar);
                                                  ar.error_code = API_RETURN_CODE_FAIL;
                                                  return MAKE_RESPONSE(ar);}, QString())

QString MainWindow::is_file_exist(const QString& path)
{
  try{
    bool r = file_io_utils::is_file_exist(path.toStdWString());
    if (r)
      return API_RETURN_CODE_ALREADY_EXISTS;
    else
      return API_RETURN_CODE_FILE_NOT_FOUND;
  }
  catch (const std::exception& ex)
  {
    LOG_ERROR("FILED TO STORE TO FILE: " << path.toStdString() << " ERROR:" << ex.what());
    return QString(API_RETURN_CODE_ALREADY_EXISTS) + ": " + ex.what();
  }

  catch (...)
  {
    return API_RETURN_CODE_ALREADY_EXISTS;
  }
}
QString MainWindow::store_to_file(const QString& path, const QString& buff)
{
  try{
    bool r = file_io_utils::save_string_to_file_throw(path.toStdWString(), buff.toStdString());
    if (r)
      return API_RETURN_CODE_OK;
    else
      return API_RETURN_CODE_ACCESS_DENIED;
  }
  catch (const std::exception& ex)
  {
    LOG_ERROR("FILED TO STORE TO FILE: " << path.toStdString() << " ERROR:" << ex.what());
    return QString(API_RETURN_CODE_ACCESS_DENIED) + ": " + ex.what();
  }

  catch (...)
  {
    return API_RETURN_CODE_ACCESS_DENIED;
  }
}

QString MainWindow::get_app_data()
TRY_ENTRY()
{
  LOG_API_TIMING();
  std::string app_data_buff;
  file_io_utils::load_file_to_string(m_backend.get_config_folder() + "/" + GUI_CONFIG_FILENAME, app_data_buff);
  return app_data_buff.c_str();
}
CATCH_ENTRY("MainWindow::get_app_data", QString())

QString MainWindow::store_secure_app_data(const QString& param, const QString& pass)
TRY_ENTRY()
{
  LOG_API_TIMING();
  view::api_response ar = AUTO_VAL_INIT(ar);

  const std::string folder = m_backend.get_config_folder();
  if (!tools::create_directories_if_necessary(folder))
  {
    ar.error_code = API_RETURN_CODE_FAIL;
    LOG_PRINT_L0("Failed to create data directory: " << folder);
    return MAKE_RESPONSE(ar);
  }

  std::string buff(sizeof(app_data_file_binary_header), 0);
  app_data_file_binary_header* phdr = (app_data_file_binary_header*)buff.data();
  phdr->m_signature = APP_DATA_FILE_BINARY_SIGNATURE;
  phdr->m_cb_body = 0; // for future use

  buff.append(param.toStdString());
  crypto::chacha_crypt(buff, pass.toStdString());

  const std::string file = folder + "/" + GUI_SECURE_CONFIG_FILENAME;
  bool r = file_io_utils::save_string_to_file(file, buff);
  if (!r)
  {
    LOG_PRINT_L0("Failed to store data to file: " << file);
    ar.error_code = API_RETURN_CODE_FAIL;
    return MAKE_RESPONSE(ar);
  }

  ar.error_code = API_RETURN_CODE_OK;
  return MAKE_RESPONSE(ar);
}
CATCH_ENTRY_CUSTOM("MainWindow::store_secure_app_data", {view::api_response ar = AUTO_VAL_INIT(ar);
                                                         ar.error_code = API_RETURN_CODE_FAIL;
                                                         return MAKE_RESPONSE(ar);}, QString())

QString MainWindow::have_secure_app_data()
TRY_ENTRY()
{
  LOG_API_TIMING();
  view::api_response ar = AUTO_VAL_INIT(ar);

  boost::system::error_code ec;
  std::wstring path_to_config = epee::string_encoding::utf8_to_wstring(m_backend.get_config_folder() + "/" + GUI_SECURE_CONFIG_FILENAME);
  if (boost::filesystem::exists(path_to_config, ec))
    ar.error_code = API_RETURN_CODE_TRUE;
  else
    ar.error_code = API_RETURN_CODE_FALSE;

  LOG_PRINT_L0("have_secure_app_data, r = " << ar.error_code);

  return MAKE_RESPONSE(ar);
}
CATCH_ENTRY_CUSTOM("MainWindow::have_secure_app_data", {view::api_response ar = AUTO_VAL_INIT(ar);
                                                        ar.error_code = API_RETURN_CODE_FAIL;
                                                        return MAKE_RESPONSE(ar);}, QString())

QString MainWindow::drop_secure_app_data()
TRY_ENTRY()
{
  LOG_API_TIMING();
  view::api_response ar = AUTO_VAL_INIT(ar);

  boost::system::error_code ec;
  std::wstring path_to_config = epee::string_encoding::utf8_to_wstring(m_backend.get_config_folder() + "/" + GUI_SECURE_CONFIG_FILENAME);
  if (boost::filesystem::remove(path_to_config, ec))
    ar.error_code = API_RETURN_CODE_TRUE;
  else
    ar.error_code = API_RETURN_CODE_FALSE;

  LOG_PRINT_L0("drop_secure_app_data, r = " << ar.error_code);

  return MAKE_RESPONSE(ar);
}
CATCH_ENTRY_CUSTOM("MainWindow::drop_secure_app_data", {view::api_response ar = AUTO_VAL_INIT(ar);
                                                        ar.error_code = API_RETURN_CODE_FAIL;
                                                        return MAKE_RESPONSE(ar);}, QString())

QString MainWindow::get_all_aliases()
TRY_ENTRY()
{
  LOG_API_TIMING();
  //PREPARE_ARG_FROM_JSON(view::struct_with_one_t_type<uint64_t>, param);
  PREPARE_RESPONSE(view::alias_set, rsp);

  rsp.error_code = m_backend.get_aliases(rsp.response_data);
  QString res = MAKE_RESPONSE(rsp);
  LOG_PRINT_GREEN("GET_ALL_ALIASES: res: " <<  rsp.error_code << ", count: " << rsp.response_data.aliases.size() << ", string buff size: " << res.size(), LOG_LEVEL_1);
  return res;
}
CATCH_ENTRY_CUSTOM("MainWindow::get_all_aliases", {PREPARE_RESPONSE(view::alias_set, rsp);
                                                   rsp.error_code = API_RETURN_CODE_FAIL;
                                                   MAKE_RESPONSE(rsp);}, QString())

QString MainWindow::get_alias_info_by_address(const QString& param)
TRY_ENTRY()
{
  LOG_API_TIMING();
  PREPARE_RESPONSE(currency::alias_rpc_details, rsp);
  rsp.error_code = m_backend.get_alias_info_by_address(param.toStdString(), rsp.response_data);
  return MAKE_RESPONSE(rsp);
}
CATCH_ENTRY_CUSTOM("MainWindow::get_alias_info_by_address", {PREPARE_RESPONSE(currency::alias_rpc_details, rsp);
                                                             rsp.error_code = API_RETURN_CODE_FAIL;
                                                             return MAKE_RESPONSE(rsp);}, QString())

QString MainWindow::get_alias_info_by_name(const QString& param)
TRY_ENTRY()
{
  LOG_API_TIMING();
  PREPARE_RESPONSE(currency::alias_rpc_details, rsp);
  rsp.error_code = m_backend.get_alias_info_by_name(param.toStdString(), rsp.response_data);
  return MAKE_RESPONSE(rsp);
}
CATCH_ENTRY_CUSTOM("MainWindow::get_alias_info_by_name", {PREPARE_RESPONSE(currency::alias_rpc_details, rsp);
                                                          rsp.error_code = API_RETURN_CODE_FAIL;
                                                          return MAKE_RESPONSE(rsp);}, QString())

QString MainWindow::validate_address(const QString& param)
TRY_ENTRY()
{
  LOG_API_TIMING();
  view::address_validation_response ar = AUTO_VAL_INIT(ar);
  ar.error_code = m_backend.validate_address(param.toStdString(), ar.payment_id);
  return MAKE_RESPONSE(ar);
}
CATCH_ENTRY_CUSTOM("MainWindow::validate_address", {view::address_validation_response ar = AUTO_VAL_INIT(ar);
                                                    ar.error_code = API_RETURN_CODE_FAIL;
                                                    return MAKE_RESPONSE(ar);}, QString())

QString MainWindow::set_log_level(const QString& param)
TRY_ENTRY()
{
  LOG_API_TIMING();
  PREPARE_ARG_FROM_JSON(view::struct_with_one_t_type<int64_t>, lvl);
  epee::log_space::get_set_log_detalisation_level(true, lvl.v);
  default_ar.error_code = API_RETURN_CODE_OK;
  LOG_PRINT("[LOG LEVEL]: set to " << lvl.v, LOG_LEVEL_MIN);
  
  return MAKE_RESPONSE(default_ar);
}
CATCH_ENTRY_CUSTOM("MainWindow::set_log_level", {PREPARE_RESPONSE(view::struct_with_one_t_type<int64_t>, ar);
                                                 ar.error_code = API_RETURN_CODE_FAIL;
                                                 return MAKE_RESPONSE(ar);}, QString())

QString MainWindow::get_log_level(const QString& param)
TRY_ENTRY()
{
  LOG_API_TIMING();
  PREPARE_RESPONSE(view::struct_with_one_t_type<int>, ar);
  ar.response_data.v = epee::log_space::get_set_log_detalisation_level();
  ar.error_code = API_RETURN_CODE_OK;
  return MAKE_RESPONSE(ar);
}
CATCH_ENTRY_CUSTOM("MainWindow::get_log_level", {PREPARE_RESPONSE(view::struct_with_one_t_type<int>, ar);
                                                 ar.error_code = API_RETURN_CODE_FAIL;
                                                 return MAKE_RESPONSE(ar);}, QString())

// QString MainWindow::dump_all_offers()
// {
//   LOG_API_TIMING();
//   //return que_call2<view::api_void>("dump_all_offers", "{}", [this](const view::api_void& owd, view::api_response& ar){
//   PREPARE_RESPONSE(view::api_void, ar);
//   //view::api_void av;
//   QString path = QFileDialog::getOpenFileName(this, "Select file",
//     "",
//     "");
// 
//   if (!path.length())
//   {
//     ar.error_code = API_RETURN_CODE_CANCELED;
//     return MAKE_RESPONSE(ar);
//   }
// 
//   currency::COMMAND_RPC_GET_ALL_OFFERS::response rp = AUTO_VAL_INIT(rp);
//   ar.error_code = m_backend.get_all_offers(rp);
// 
//   std::string buff = epee::serialization::store_t_to_json(rp);
//   bool r = file_io_utils::save_string_to_file(path.toStdString(), buff);
//   if (!r)
//     ar.error_code = API_RETURN_CODE_FAIL;
//   else
//     ar.error_code = API_RETURN_CODE_OK;
// 
//   return MAKE_RESPONSE(ar);
// }

QString MainWindow::webkit_launched_script()
TRY_ENTRY()
{
  m_last_update_daemon_status_json.clear();
  return "";
}
CATCH_ENTRY("MainWindow::webkit_launched_script", QString())
////////////////////
QString MainWindow::show_openfile_dialog(const QString& param)
TRY_ENTRY()
{
  view::system_filedialog_request ofdr = AUTO_VAL_INIT(ofdr);
  view::system_filedialog_response ofdres = AUTO_VAL_INIT(ofdres);
  if (!epee::serialization::load_t_from_json(ofdr, param.toStdString()))
  {
    ofdres.error_code = API_RETURN_CODE_BAD_ARG;
    return MAKE_RESPONSE(ofdres);
  }

  QString path = QFileDialog::getOpenFileName(this, ofdr.caption.c_str(),
    ofdr.default_dir.c_str(),
    ofdr.filemask.c_str());

  if (!path.length())
  {
    ofdres.error_code = API_RETURN_CODE_CANCELED;
    return MAKE_RESPONSE(ofdres);
  }

  ofdres.error_code = API_RETURN_CODE_OK;
  ofdres.path = path.toStdString();
  return MAKE_RESPONSE(ofdres); 
}
CATCH_ENTRY_CUSTOM("MainWindow::show_openfile_dialog", {view::system_filedialog_response ofdres = AUTO_VAL_INIT(ofdres);
                                                        ofdres.error_code = API_RETURN_CODE_FAIL;
                                                        return MAKE_RESPONSE(ofdres);}, QString())


QString MainWindow::show_savefile_dialog(const QString& param)
TRY_ENTRY()
{
  PREPARE_ARG_FROM_JSON(view::system_filedialog_request, ofdr);
  view::system_filedialog_response ofdres = AUTO_VAL_INIT(ofdres);

  QString path = QFileDialog::getSaveFileName(this, ofdr.caption.c_str(),
    ofdr.default_dir.c_str(),
    ofdr.filemask.c_str());

  if (!path.length())
  {
    ofdres.error_code = API_RETURN_CODE_CANCELED;
    return MAKE_RESPONSE(ofdres);
  }

  ofdres.error_code = API_RETURN_CODE_OK;
  ofdres.path = path.toStdString();
  return MAKE_RESPONSE(ofdres);
}
CATCH_ENTRY_CUSTOM("MainWindow::show_savefile_dialog", {view::system_filedialog_response ofdres = AUTO_VAL_INIT(ofdres);
                                                        ofdres.error_code = API_RETURN_CODE_FAIL;
                                                        return MAKE_RESPONSE(ofdres);}, QString())

QString MainWindow::close_wallet(const QString& param)
TRY_ENTRY()
{
  LOG_API_TIMING();
  //return que_call2<view::wallet_id_obj>("close_wallet", param, [this](const view::wallet_id_obj& owd, view::api_response& ar){
  PREPARE_ARG_FROM_JSON(view::wallet_id_obj, owd);
  PREPARE_RESPONSE(view::api_void, ar);
  ar.error_code = m_backend.close_wallet(owd.wallet_id);
  return MAKE_RESPONSE(ar);
}
CATCH_ENTRY_CUSTOM("MainWindow::close_wallet", {PREPARE_RESPONSE(view::api_void, ar);
                                                ar.error_code = API_RETURN_CODE_FAIL;
                                                return MAKE_RESPONSE(ar);}, QString())

QString MainWindow::get_contracts(const QString& param)
TRY_ENTRY()
{
  LOG_API_TIMING();
  PREPARE_ARG_FROM_JSON(view::wallet_id_obj, owd);
  PREPARE_RESPONSE(view::contracts_array, ar);
  ar.error_code = m_backend.get_contracts(owd.wallet_id, ar.response_data.contracts);
  return MAKE_RESPONSE(ar);
}
CATCH_ENTRY_CUSTOM("MainWindow::get_contracts", {PREPARE_RESPONSE(view::contracts_array, ar);
                                                 ar.error_code = API_RETURN_CODE_FAIL;
                                                 return MAKE_RESPONSE(ar);}, QString())

QString MainWindow::create_proposal(const QString& param)
TRY_ENTRY()
{
  LOG_API_TIMING();
  PREPARE_ARG_FROM_JSON(view::create_proposal_param, cpp);
  PREPARE_RESPONSE(view::contracts_array, ar);
  ar.error_code = m_backend.create_proposal(cpp.wallet_id, cpp.details, cpp.payment_id, cpp.expiration_period, cpp.fee, cpp.b_fee);
  return MAKE_RESPONSE(ar);
}
CATCH_ENTRY_CUSTOM("MainWindow::create_proposal", {PREPARE_RESPONSE(view::contracts_array, ar);
                                                   ar.error_code = API_RETURN_CODE_FAIL;
                                                   return MAKE_RESPONSE(ar);}, QString())

QString MainWindow::accept_proposal(const QString& param)
TRY_ENTRY()
{
  LOG_API_TIMING();
  PREPARE_ARG_FROM_JSON(view::wallet_and_contract_id_param, waip);
  PREPARE_RESPONSE(view::api_void, ar);
  ar.error_code = m_backend.accept_proposal(waip.wallet_id, waip.contract_id);
  return MAKE_RESPONSE(ar);
}
CATCH_ENTRY_CUSTOM("MainWindow::accept_proposal", {PREPARE_RESPONSE(view::api_void, ar);
                                                   ar.error_code = API_RETURN_CODE_FAIL;
                                                   return MAKE_RESPONSE(ar);}, QString())

QString MainWindow::release_contract(const QString& param)
TRY_ENTRY()
{
  LOG_API_TIMING();
  PREPARE_ARG_FROM_JSON(view::accept_proposal_param, rcp);
  PREPARE_RESPONSE(view::api_void, ar);
  ar.error_code = m_backend.release_contract(rcp.wallet_id, rcp.contract_id, rcp.release_type);
  return MAKE_RESPONSE(ar);
}
CATCH_ENTRY_CUSTOM("MainWindow::release_contract", {PREPARE_RESPONSE(view::api_void, ar);
                                                   ar.error_code = API_RETURN_CODE_FAIL;
                                                   return MAKE_RESPONSE(ar);}, QString())

QString MainWindow::request_cancel_contract(const QString& param)
TRY_ENTRY()
{
  LOG_API_TIMING();
  PREPARE_ARG_FROM_JSON(view::crequest_cancel_contract_param, rcp);
  PREPARE_RESPONSE(view::api_void, ar);
  ar.error_code = m_backend.request_cancel_contract(rcp.wallet_id, rcp.contract_id, rcp.fee, rcp.expiration_period);
  return MAKE_RESPONSE(ar);
}
CATCH_ENTRY_CUSTOM("MainWindow::request_cancel_contract", {PREPARE_RESPONSE(view::api_void, ar);
                                                   ar.error_code = API_RETURN_CODE_FAIL;
                                                   return MAKE_RESPONSE(ar);}, QString())

QString MainWindow::accept_cancel_contract(const QString& param)
TRY_ENTRY()
{
  LOG_API_TIMING();
  PREPARE_ARG_FROM_JSON(view::wallet_and_contract_id_param, wci);
  PREPARE_RESPONSE(view::api_void, ar);
  ar.error_code = m_backend.accept_cancel_contract(wci.wallet_id, wci.contract_id);
  return MAKE_RESPONSE(ar);
}
CATCH_ENTRY_CUSTOM("MainWindow::accept_cancel_contract", {PREPARE_RESPONSE(view::api_void, ar);
                                                          ar.error_code = API_RETURN_CODE_FAIL;
                                                          return MAKE_RESPONSE(ar);}, QString())

QString MainWindow::generate_wallet(const QString& param)
TRY_ENTRY()
{
  LOG_API_TIMING();
  //return que_call2<view::open_wallet_request>("generate_wallet", param, [this](const view::open_wallet_request& owd, view::api_response& ar){
  PREPARE_ARG_FROM_JSON(view::open_wallet_request, owd);
  PREPARE_RESPONSE(view::open_wallet_response, ar);
  ar.error_code = m_backend.generate_wallet(epee::string_encoding::utf8_to_wstring(owd.path), owd.pass, ar.response_data);
  return MAKE_RESPONSE(ar);
}
CATCH_ENTRY_CUSTOM("MainWindow::generate_wallet", {PREPARE_RESPONSE(view::open_wallet_response, ar);
                                                   ar.error_code = API_RETURN_CODE_FAIL;
                                                   return MAKE_RESPONSE(ar);}, QString())

QString MainWindow::restore_wallet(const QString& param)
TRY_ENTRY()
{
  LOG_API_TIMING();
  //return que_call2<view::restore_wallet_request>("restore_wallet", param, [this](const view::restore_wallet_request& owd, view::api_response& ar){
  PREPARE_ARG_FROM_JSON(view::restore_wallet_request, owd);
  PREPARE_RESPONSE(view::open_wallet_response, ar);
  ar.error_code = m_backend.restore_wallet(epee::string_encoding::utf8_to_wstring(owd.path), owd.pass, owd.restore_key, ar.response_data);
  return MAKE_RESPONSE(ar);
}
CATCH_ENTRY_CUSTOM("MainWindow::restore_wallet", {PREPARE_RESPONSE(view::open_wallet_response, ar);
                                                  ar.error_code = API_RETURN_CODE_FAIL;
                                                  return MAKE_RESPONSE(ar);}, QString())

QString MainWindow::open_wallet(const QString& param)
TRY_ENTRY()
{
  LOG_API_TIMING();

  //return que_call2<view::open_wallet_request>("open_wallet", param, [this](const view::open_wallet_request& owd, view::api_response& ar){
  PREPARE_ARG_FROM_JSON(view::open_wallet_request, owd);
  PREPARE_RESPONSE(view::open_wallet_response, ar);
  ar.error_code = m_backend.open_wallet(epee::string_encoding::utf8_to_wstring(owd.path), owd.pass, ar.response_data);
  return MAKE_RESPONSE(ar);
}
CATCH_ENTRY_CUSTOM("MainWindow::open_wallet", {PREPARE_RESPONSE(view::open_wallet_response, ar);
                                               ar.error_code = API_RETURN_CODE_FAIL;
                                               return MAKE_RESPONSE(ar);}, QString())

QString MainWindow::get_my_offers(const QString& param)
TRY_ENTRY()
{
  LOG_API_TIMING();
  //return que_call2<view::open_wallet_request>("open_wallet", param, [this](const view::open_wallet_request& owd, view::api_response& ar){
  PREPARE_ARG_FROM_JSON(bc_services::core_offers_filter, f);
  PREPARE_RESPONSE(currency::COMMAND_RPC_GET_OFFERS_EX::response, ar);
  ar.error_code = m_backend.get_my_offers(f, ar.response_data.offers);
  return MAKE_RESPONSE(ar);
}
CATCH_ENTRY_CUSTOM("MainWindow::get_my_offers", {PREPARE_RESPONSE(currency::COMMAND_RPC_GET_OFFERS_EX::response, ar);
                                                 ar.error_code = API_RETURN_CODE_FAIL;
                                                 return MAKE_RESPONSE(ar);}, QString())

QString MainWindow::get_fav_offers(const QString& param)
TRY_ENTRY()
{
  LOG_API_TIMING();
  PREPARE_ARG_FROM_JSON(view::get_fav_offers_request, f);
  PREPARE_RESPONSE(currency::COMMAND_RPC_GET_OFFERS_EX::response, ar);
  ar.error_code = m_backend.get_fav_offers(f.ids, f.filter, ar.response_data.offers);
  return MAKE_RESPONSE(ar);
}
CATCH_ENTRY_CUSTOM("MainWindow::get_fav_offers", {PREPARE_RESPONSE(currency::COMMAND_RPC_GET_OFFERS_EX::response, ar);
                                                  ar.error_code = API_RETURN_CODE_FAIL;
                                                  return MAKE_RESPONSE(ar);}, QString())

QString MainWindow::is_pos_allowed()
TRY_ENTRY()
{
  LOG_API_TIMING();
  return m_backend.is_pos_allowed().c_str();
}
CATCH_ENTRY("MainWindow::is_pos_allowed", API_RETURN_CODE_FALSE)

QString MainWindow::run_wallet(const QString& param)
TRY_ENTRY()
{
  LOG_API_TIMING();
  PREPARE_ARG_FROM_JSON(view::wallet_id_obj, wio);
  default_ar.error_code = m_backend.run_wallet(wio.wallet_id);
  return MAKE_RESPONSE(default_ar);
}
CATCH_ENTRY_CUSTOM("MainWindow::run_wallet", {PREPARE_RESPONSE(view::wallet_id_obj, ar);
                                              ar.error_code = API_RETURN_CODE_FAIL;
                                              return MAKE_RESPONSE(ar);}, QString())

QString MainWindow::resync_wallet(const QString& param)
TRY_ENTRY()
{
  LOG_API_TIMING();
  //return que_call2<view::wallet_id_obj>("get_wallet_info", param, [this](const view::wallet_id_obj& a, view::api_response& ar){
  PREPARE_ARG_FROM_JSON(view::wallet_id_obj, a);
  PREPARE_RESPONSE(view::api_void, ar);
  ar.error_code = m_backend.resync_wallet(a.wallet_id);
  return MAKE_RESPONSE(ar);
}
CATCH_ENTRY_CUSTOM("MainWindow::resync_wallet", {PREPARE_RESPONSE(view::api_void, ar);
                                                 ar.error_code = API_RETURN_CODE_FAIL;
                                                 return MAKE_RESPONSE(ar)}, QString())

// QString MainWindow::get_all_offers(const QString& param)
// {
//   LOG_API_TIMING();
//   //return que_call2<view::api_void>("get_all_offers", param, [this](const view::api_void& a, view::api_response& ar){
//   //  PREPARE_ARG_FROM_JSON(view::api_void, a);
//   PREPARE_RESPONSE(currency::COMMAND_RPC_GET_ALL_OFFERS::response, ar);
//   ar.error_code = m_backend.get_all_offers(ar.response_data);
//   return MAKE_RESPONSE(ar);
// }


QString MainWindow::get_offers_ex(const QString& param)
TRY_ENTRY()
{
  LOG_API_TIMING();
  //return que_call2<bc_services::core_offers_filter>("get_offers_ex", param, [this](const bc_services::core_offers_filter& f, view::api_response& ar){
  PREPARE_ARG_FROM_JSON(bc_services::core_offers_filter, f);
  PREPARE_RESPONSE(currency::COMMAND_RPC_GET_OFFERS_EX::response, ar);
  ar.error_code = m_backend.get_offers_ex(f, ar.response_data.offers, ar.response_data.total_offers);
  return MAKE_RESPONSE(ar);
}
CATCH_ENTRY_CUSTOM("MainWindow::get_offers_ex", {PREPARE_RESPONSE(currency::COMMAND_RPC_GET_OFFERS_EX::response, ar);
                                                 ar.error_code = API_RETURN_CODE_FAIL;
                                                 return MAKE_RESPONSE(ar)}, QString())

QString MainWindow::push_offer(const QString& param)
TRY_ENTRY()
{
  LOG_API_TIMING();
  LOG_API_PARAMS(LOG_LEVEL_2);
  //return que_call2<view::push_offer_param>("push_offer", param, [this](const view::push_offer_param& a, view::api_response& ar){
  PREPARE_ARG_FROM_JSON(view::push_offer_param, a);
  PREPARE_RESPONSE(view::transfer_response, ar);


  currency::transaction res_tx = AUTO_VAL_INIT(res_tx);

  ar.error_code = m_backend.push_offer(a.wallet_id, a.od, res_tx);
  if (ar.error_code != API_RETURN_CODE_OK)
    return MAKE_RESPONSE(ar);
  
  ar.response_data.success = true;
  ar.response_data.tx_hash = string_tools::pod_to_hex(currency::get_transaction_hash(res_tx));
  ar.response_data.tx_blob_size = currency::get_object_blobsize(res_tx);
  ar.error_code = API_RETURN_CODE_OK;
  return MAKE_RESPONSE(ar);
}
CATCH_ENTRY_CUSTOM("MainWindow::push_offer", {PREPARE_RESPONSE(view::transfer_response, ar);
                                              ar.error_code = API_RETURN_CODE_FAIL;
                                              return MAKE_RESPONSE(ar)}, QString())

QString MainWindow::cancel_offer(const QString& param)
TRY_ENTRY()
{
  LOG_API_TIMING();
  LOG_API_PARAMS(LOG_LEVEL_2);
  //  return que_call2<view::cancel_offer_param>("cancel_offer", param, [this](const view::cancel_offer_param& a, view::api_response& ar){
  PREPARE_ARG_FROM_JSON(view::cancel_offer_param, a);
  PREPARE_RESPONSE(view::transfer_response, ar);

  currency::transaction res_tx = AUTO_VAL_INIT(res_tx);

  ar.error_code = m_backend.cancel_offer(a, res_tx);
  if (ar.error_code != API_RETURN_CODE_OK)
    return MAKE_RESPONSE(ar);

  ar.response_data.success = true;
  ar.response_data.tx_hash = string_tools::pod_to_hex(currency::get_transaction_hash(res_tx));
  ar.response_data.tx_blob_size = currency::get_object_blobsize(res_tx);
  ar.error_code = API_RETURN_CODE_OK;
  return MAKE_RESPONSE(ar);
}
CATCH_ENTRY_CUSTOM("MainWindow::cancel_offer", {PREPARE_RESPONSE(view::transfer_response, ar);
                                                ar.error_code = API_RETURN_CODE_FAIL;
                                                return MAKE_RESPONSE(ar)}, QString())

QString MainWindow::push_update_offer(const QString& param)
TRY_ENTRY()
{
  LOG_API_TIMING();
   LOG_API_PARAMS(LOG_LEVEL_2);
   //return que_call2<bc_services::update_offer_details>("cancel_offer", param, [this](const bc_services::update_offer_details& a, view::api_response& ar){
   PREPARE_ARG_FROM_JSON(bc_services::update_offer_details, a);
   PREPARE_RESPONSE(view::transfer_response, ar);

   currency::transaction res_tx = AUTO_VAL_INIT(res_tx);

   ar.error_code = m_backend.push_update_offer(a, res_tx);
   if (ar.error_code != API_RETURN_CODE_OK)
     return MAKE_RESPONSE(ar);

   ar.response_data.success = true;
   ar.response_data.tx_hash = string_tools::pod_to_hex(currency::get_transaction_hash(res_tx));
   ar.response_data.tx_blob_size = currency::get_object_blobsize(res_tx);
   ar.error_code = API_RETURN_CODE_OK;
   return MAKE_RESPONSE(ar);
}
CATCH_ENTRY_CUSTOM("MainWindow::push_update_offer", {PREPARE_RESPONSE(view::transfer_response, ar);
                                                     ar.error_code = API_RETURN_CODE_FAIL;
                                                     return MAKE_RESPONSE(ar)}, QString())

QString MainWindow::get_recent_transfers(const QString& param)
TRY_ENTRY()
{
  LOG_API_TIMING();
  PREPARE_ARG_FROM_JSON(view::get_recent_transfers_request, a);
  PREPARE_RESPONSE(view::transfers_array, ar);
  ar.error_code = m_backend.get_recent_transfers(a.wallet_id, a.offest, a.count, ar.response_data);
  return MAKE_RESPONSE(ar);
}
CATCH_ENTRY_CUSTOM("MainWindow::get_recent_transfers", {PREPARE_RESPONSE(view::transfers_array, ar);
                                                        ar.error_code = API_RETURN_CODE_FAIL;
                                                        return MAKE_RESPONSE(ar)}, QString())

QString MainWindow::get_mining_history(const QString& param)
TRY_ENTRY()
{
  LOG_API_TIMING();
  //return prepare_call<view::wallet_id_obj, tools::wallet_rpc::mining_history>("get_mining_history", param, [this](const view::wallet_id_obj& a, view::api_response& ar) {
  PREPARE_ARG_FROM_JSON(view::wallet_id_obj, a);
  PREPARE_RESPONSE(tools::wallet_rpc::mining_history, ar);

  ar.error_code = m_backend.get_mining_history(a.wallet_id, ar.response_data);
  if (ar.error_code != API_RETURN_CODE_OK)
    return MAKE_RESPONSE(ar);

  ar.error_code = API_RETURN_CODE_OK;
  return MAKE_RESPONSE(ar);
}
CATCH_ENTRY_CUSTOM("MainWindow::get_mining_history", {PREPARE_RESPONSE(tools::wallet_rpc::mining_history, ar);
                                                      ar.error_code = API_RETURN_CODE_FAIL;
                                                      return MAKE_RESPONSE(ar)}, QString())

QString MainWindow::start_pos_mining(const QString& param)
TRY_ENTRY()
{
  LOG_API_TIMING();
  PREPARE_ARG_FROM_JSON(view::wallet_id_obj, wo);
  default_ar.error_code = m_backend.start_pos_mining(wo.wallet_id);
  return MAKE_RESPONSE(default_ar);
}
CATCH_ENTRY_CUSTOM("MainWindow::start_pos_mining", {PREPARE_RESPONSE(view::wallet_id_obj, ar);
                                                    ar.error_code = API_RETURN_CODE_FAIL;
                                                    return MAKE_RESPONSE(ar);}, QString())

QString MainWindow::stop_pos_mining(const QString& param)
TRY_ENTRY()
{
  LOG_API_TIMING();
  PREPARE_ARG_FROM_JSON(view::wallet_id_obj, wo);
  default_ar.error_code = m_backend.stop_pos_mining(wo.wallet_id);
  return MAKE_RESPONSE(default_ar);
}
CATCH_ENTRY_CUSTOM("MainWindow::stop_pos_mining", {PREPARE_RESPONSE(view::wallet_id_obj, ar);
                                                   ar.error_code = API_RETURN_CODE_FAIL;
                                                   return MAKE_RESPONSE(ar);}, QString())

QString MainWindow::get_smart_safe_info(const QString& param)
TRY_ENTRY()
{
  LOG_API_TIMING();
  PREPARE_ARG_FROM_JSON(view::wallet_id_obj, wo);
  PREPARE_RESPONSE(view::get_restore_info_response, ar);
  ar.error_code = m_backend.get_wallet_restore_info(wo.wallet_id, ar.response_data.restore_key);
  return MAKE_RESPONSE(ar);
}
CATCH_ENTRY_CUSTOM("MainWindow::get_smart_safe_info", {PREPARE_RESPONSE(view::get_restore_info_response, ar);
                                                       ar.error_code = API_RETURN_CODE_FAIL;
                                                       return MAKE_RESPONSE(ar)}, QString())

QString MainWindow::get_mining_estimate(const QString& param)
TRY_ENTRY()
{
  LOG_API_TIMING();
  PREPARE_ARG_FROM_JSON(view::request_mining_estimate, me);
  PREPARE_RESPONSE(view::response_mining_estimate, ar);
  ar.error_code = m_backend.get_mining_estimate(me.amount_coins, me.time, ar.response_data.final_amount, ar.response_data.all_coins_and_pos_diff_rate, ar.response_data.days_estimate);
  return MAKE_RESPONSE(ar);
}
CATCH_ENTRY_CUSTOM("MainWindow::get_mining_estimate", {PREPARE_RESPONSE(view::response_mining_estimate, ar);
                                                       ar.error_code = API_RETURN_CODE_FAIL;
                                                       return MAKE_RESPONSE(ar)}, QString())

QString MainWindow::backup_wallet_keys(const QString& param)
TRY_ENTRY()
{
  LOG_API_TIMING();
  PREPARE_ARG_FROM_JSON(view::backup_keys_request, me);
  default_ar.error_code = m_backend.backup_wallet(me.wallet_id, epee::string_encoding::utf8_to_wstring(me.path));
  return MAKE_RESPONSE(default_ar);
}
CATCH_ENTRY_CUSTOM("MainWindow::backup_wallet_keys", {PREPARE_RESPONSE(view::backup_keys_request, ar);
                                                      ar.error_code = API_RETURN_CODE_FAIL;
                                                      return MAKE_RESPONSE(ar)}, QString())

QString MainWindow::reset_wallet_password(const QString& param)
TRY_ENTRY()
{
  LOG_API_TIMING();
  PREPARE_ARG_FROM_JSON(view::reset_pass_request, me);
  default_ar.error_code = m_backend.reset_wallet_password(me.wallet_id, me.pass);
  return MAKE_RESPONSE(default_ar);
}
CATCH_ENTRY_CUSTOM("MainWindow::reset_wallet_password", {PREPARE_RESPONSE(view::reset_pass_request, ar);
                                                         ar.error_code = API_RETURN_CODE_FAIL;
                                                         return MAKE_RESPONSE(ar);}, QString())

QString MainWindow::is_wallet_password_valid(const QString& param)
TRY_ENTRY()
{
  LOG_API_TIMING();
  PREPARE_ARG_FROM_JSON(view::reset_pass_request, me);
  default_ar.error_code = m_backend.is_wallet_password_valid(me.wallet_id, me.pass);
  return MAKE_RESPONSE(default_ar);
}
CATCH_ENTRY_CUSTOM("MainWindow::is_wallet_password_valid", {PREPARE_RESPONSE(view::reset_pass_request, ar);
                                                            ar.error_code = API_RETURN_CODE_FAIL;
                                                            return MAKE_RESPONSE(ar);}, QString())

QString MainWindow::is_autostart_enabled()
TRY_ENTRY()
{
  LOG_API_TIMING();
  view::api_response ar = AUTO_VAL_INIT(ar);

  if (gui_tools::GetStartOnSystemStartup())
    ar.error_code = API_RETURN_CODE_TRUE;
  else
    ar.error_code = API_RETURN_CODE_FALSE;

  return MAKE_RESPONSE(ar);
}
CATCH_ENTRY_CUSTOM("MainWindow::is_autostart_enabled", {view::api_response ar = AUTO_VAL_INIT(ar);
                                                        ar.error_code = API_RETURN_CODE_FAIL;
                                                        return MAKE_RESPONSE(ar)}, QString())

QString MainWindow::toggle_autostart(const QString& param)
TRY_ENTRY()
{
  LOG_API_TIMING();
  PREPARE_ARG_FROM_JSON(view::struct_with_one_t_type<bool>, as);

  if (gui_tools::SetStartOnSystemStartup(as.v))
    default_ar.error_code = API_RETURN_CODE_OK;
  else
    default_ar.error_code = API_RETURN_CODE_FAIL;

  return MAKE_RESPONSE(default_ar);
}
CATCH_ENTRY_CUSTOM("MainWindow::toggle_autostart", {PREPARE_RESPONSE(view::struct_with_one_t_type<bool>, ar);
                                                    ar.error_code = API_RETURN_CODE_FAIL;
                                                    return MAKE_RESPONSE(ar);}, QString())

QString MainWindow::check_available_sources(const QString& param)
TRY_ENTRY()
{
  LOG_API_TIMING();
  PREPARE_ARG_FROM_JSON(view::api_request_t<std::list<uint64_t> >, sources);
  return m_backend.check_available_sources(sources.wallet_id, sources.req_data).c_str();
}
CATCH_ENTRY("MainWindow::check_available_sources", std::string(API_RETURN_CODE_FALSE).c_str())

QString MainWindow::open_url_in_browser(const QString& param)
TRY_ENTRY()
{
  QString prefix = "https://";
  if (!QDesktopServices::openUrl(QUrl(prefix + param)))
  {
    LOG_ERROR("Failed top open URL: " << param.toStdString());
    return API_RETURN_CODE_FAIL;
  }
  LOG_PRINT_L0("[Open URL]: " << param.toStdString());
  return API_RETURN_CODE_OK;
}
CATCH_ENTRY("MainWindow::open_url_in_browser", API_RETURN_CODE_FAIL)

QString MainWindow::is_valid_restore_wallet_text(const QString& param)
TRY_ENTRY()
{
  LOG_API_TIMING();
  return m_backend.is_valid_brain_restore_data(param.toStdString()).c_str();
}
CATCH_ENTRY("MainWindow::is_valid_restore_wallet_text", std::string(API_RETURN_CODE_FALSE).c_str())

void MainWindow::contextMenuEvent(QContextMenuEvent * event)
TRY_ENTRY()
{
}
CATCH_ENTRY("MainWindow::contextMenuEvent", )

QString MainWindow::print_text(const QString& param)
TRY_ENTRY()
{
  LOG_API_TIMING();
  PREPARE_ARG_FROM_JSON(view::print_text_param, ptp);

  //in >> htmlContent;

  QTextDocument *document = new QTextDocument();
  document->setHtml(ptp.html_text.c_str());

  QPrinter printer;
  default_ar.error_code = API_RETURN_CODE_CANCELED;

  QPrintDialog *dialog = new QPrintDialog(&printer, this);
  dialog->setOptions(QAbstractPrintDialog::PrintToFile);
  auto res = dialog->exec();
  if (res != QDialog::Accepted)
  {
    LOG_PRINT_L0("[PRINT_TEXT] exec  != QDialog::Accepted, res=" << res);
    return MAKE_RESPONSE(default_ar);
  }

  document->print(&printer);

  delete document;
  default_ar.error_code = API_RETURN_CODE_OK;
  LOG_PRINT_L0("[PRINT_TEXT] default_ar.error_code = " << default_ar.error_code);
  return MAKE_RESPONSE(default_ar);
}
CATCH_ENTRY_CUSTOM("MainWindow::print_text", {PREPARE_RESPONSE(view::print_text_param, ar);
                                              ar.error_code = API_RETURN_CODE_FAIL;
                                              return MAKE_RESPONSE(ar);}, QString())

QString MainWindow::print_log(const QString& param)
TRY_ENTRY()
{
  PREPARE_ARG_FROM_JSON(view::print_log_params, plp);

  LOG_PRINT("[GUI_LOG]" << plp.msg, plp.log_level);

  default_ar.error_code = API_RETURN_CODE_OK;
  return MAKE_RESPONSE(default_ar);
}
CATCH_ENTRY_CUSTOM("MainWindow::print_log", {PREPARE_RESPONSE(view::print_log_params, ar);
                                             ar.error_code = API_RETURN_CODE_FAIL;
                                             return MAKE_RESPONSE(ar);}, QString())

void MainWindow::show_notification(const std::string& title, const std::string& message)
TRY_ENTRY()
{
  show_notification(QString().fromUtf8(title.c_str()), QString().fromUtf8(message.c_str()));
}
CATCH_ENTRY("MainWindow::show_notification", )

void MainWindow::show_notification(const QString &title, const QString &message)
TRY_ENTRY()
{
  LOG_PRINT_L1("system notification: \"" << title.toStdString() << "\", \"" << message.toStdString() << "\"");

  // it's expected that title and message are utf-8 encoded!

#if !defined(__APPLE__)
  // use Qt tray icon to show messages on Windows and Linux
  CHECK_AND_ASSERT_MES(m_tray_icon != nullptr, (void)(0), "m_tray_icon is null!");
  m_tray_icon->showMessage(title, message);
#else
  // use native notification system on macOS
  notification_helper::show(title.toStdString(), message.toStdString());
#endif
}
CATCH_ENTRY("MainWindow::show_notification", )