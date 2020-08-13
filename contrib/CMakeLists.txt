set(UPNPC_BUILD_STATIC ON CACHE BOOL "Build static library")
set(UPNPC_BUILD_SHARED OFF CACHE BOOL "Build shared library")
set(UPNPC_BUILD_TESTS OFF CACHE BOOL "Build test executables")
set(UPNPC_BUILD_SAMPLE OFF CACHE BOOL "Build sample executables")
set(UPNPC_NO_INSTALL ON CACHE BOOL "Disable installation")
add_subdirectory(miniupnpc)
add_subdirectory(zlib)
add_subdirectory(db)
add_subdirectory(ethereum)
add_subdirectory(libethash_cs)


set_property(TARGET libminiupnpc-static PROPERTY FOLDER "contrib")
set_property(TARGET zlibstatic PROPERTY FOLDER "contrib")
set_property(TARGET lmdb PROPERTY FOLDER "contrib")


if(MSVC)
  set_property(TARGET libminiupnpc-static APPEND_STRING PROPERTY COMPILE_FLAGS " -wd4244 -wd4267")
elseif(NOT MSVC)
  set_property(TARGET libminiupnpc-static APPEND_STRING PROPERTY COMPILE_FLAGS " -Wno-undef -Wno-unused-result -Wno-unused-value")
endif()
