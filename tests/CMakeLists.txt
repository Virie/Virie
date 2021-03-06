add_subdirectory(gtest)
include_directories(${gtest_SOURCE_DIR}/include ${gtest_SOURCE_DIR})

file(GLOB_RECURSE CORE_TESTS core_tests/*)
file(GLOB_RECURSE CRYPTO_TESTS crypto/*)
file(GLOB_RECURSE FUNC_TESTS functional_tests/*)
file(GLOB_RECURSE PERFORMANCE_TESTS performance_tests/*)
file(GLOB_RECURSE UNIT_TESTS unit_tests/* ../src/daemon_service/bc_daemon_service.cpp)

source_group(core_tests FILES ${CORE_TESTS})
source_group(crypto_tests FILES ${CRYPTO_TESTS})
source_group(functional_tests FILES ${FUNC_TESTS})
source_group(performance_tests FILES ${PERFORMANCE_TESTS})
source_group(unit_tests FILES ${UNIT_TESTS})

# add_subdirectory(daemon_tests)
add_subdirectory(db_tests)
add_subdirectory(rpc_stress)

add_executable(coretests ${CORE_TESTS})
add_executable(crypto-tests ${CRYPTO_TESTS})
add_executable(difficulty-tests difficulty/difficulty.cpp)
add_executable(hash-tests hash/main.cpp)
add_executable(hash-target-tests hash-target.cpp)
add_executable(functional_tests ${FUNC_TESTS})
add_executable(performance_tests ${PERFORMANCE_TESTS})
add_executable(unit_tests ${UNIT_TESTS})
add_executable(net_load_tests_clt net_load_tests/clt.cpp)
add_executable(net_load_tests_srv net_load_tests/srv.cpp)
add_executable(libethash_test libethash_test/libethash_test.cpp)
add_executable(mnemonic_encoding_test mnemonic_encoding_tests/mnemonic_encoding_test.cpp)
add_executable(colored_cout_test colored_cout_test/colored_cout_test.cpp )

add_dependencies(coretests version)

target_link_libraries(coretests currency_core common crypto wallet rpc zlibstatic ${CMAKE_THREAD_LIBS_INIT} ${Boost_LIBRARIES})
target_link_libraries(difficulty-tests currency_core common ${CMAKE_THREAD_LIBS_INIT} ${Boost_LIBRARIES})
target_link_libraries(functional_tests wallet currency_core crypto common rpc zlibstatic libminiupnpc-static ${CMAKE_THREAD_LIBS_INIT} ${Boost_LIBRARIES})
target_link_libraries(hash-tests crypto)
target_link_libraries(hash-target-tests crypto currency_core ${CMAKE_THREAD_LIBS_INIT} ${Boost_LIBRARIES})
target_link_libraries(performance_tests currency_core common crypto zlibstatic ${CMAKE_THREAD_LIBS_INIT} ${Boost_LIBRARIES})
target_link_libraries(unit_tests wallet currency_core crypto common rpc gtest_main zlibstatic libminiupnpc-static ${CMAKE_THREAD_LIBS_INIT} ${Boost_LIBRARIES})
target_link_libraries(net_load_tests_clt currency_core common crypto gtest_main ${CMAKE_THREAD_LIBS_INIT} ${Boost_LIBRARIES})
target_link_libraries(net_load_tests_srv currency_core common crypto gtest_main ${CMAKE_THREAD_LIBS_INIT} ${Boost_LIBRARIES})
target_link_libraries(mnemonic_encoding_test common ${Boost_LIBRARIES})
target_link_libraries(colored_cout_test ${Boost_LIBRARIES})

if(USE_ETHASH_CS)
  add_definitions(-DUSE_ETHASH_CS)
  target_link_libraries(libethash_test crypto common ethash_cs ${CMAKE_THREAD_LIBS_INIT} ${Boost_LIBRARIES})
else()
  target_link_libraries(libethash_test crypto common ethash ${CMAKE_THREAD_LIBS_INIT} ${Boost_LIBRARIES})
endif()

if(NOT MSVC)
  set_property(TARGET gtest gtest_main unit_tests net_load_tests_clt net_load_tests_srv APPEND_STRING PROPERTY COMPILE_FLAGS " -Wno-undef -Wno-sign-compare")
  set_property(TARGET coretests APPEND_STRING PROPERTY COMPILE_FLAGS " -Wno-error=comment")
  if(APPLE)
    set_property(TARGET gtest gtest_main APPEND_STRING PROPERTY COMPILE_FLAGS " -Wno-unused-private-field")
  endif()
endif()


add_custom_target(tests DEPENDS coretests difficulty hash performance_tests unit_tests)
set_property(TARGET colored_cout_test db_tests rpc_stress_test mnemonic_encoding_test libethash_test coretests crypto-tests functional_tests difficulty-tests gtest gtest_main hash-tests hash-target-tests performance_tests unit_tests tests net_load_tests_clt net_load_tests_srv PROPERTY FOLDER "tests")

add_test(crypto crypto-tests ${CMAKE_CURRENT_SOURCE_DIR}/crypto/tests.txt)
add_test(difficulty difficulty-tests ${CMAKE_CURRENT_SOURCE_DIR}/difficulty/data.txt)
foreach(hash IN ITEMS fast slow tree extra-blake extra-groestl extra-jh extra-skein)
  add_test(hash-${hash} hash-tests ${hash} ${CMAKE_CURRENT_SOURCE_DIR}/hash/tests-${hash}.txt)
endforeach(hash)
add_test(hash-target hash-target-tests)
add_test(unit_tests unit_tests)
add_test(coretests coretests)
add_test(libethash_test libethash_test)
add_test(mnemonic_encoding_test mnemonic_encoding_test)
add_test(colored_cout_test colored_cout_test)

# set PCH for core_tests
if(MSVC)
  set_property(TARGET coretests APPEND_STRING PROPERTY COMPILE_FLAGS " /Yuchaingen.h /Zm1000")
  set_property(SOURCE "core_tests/chaingen.cpp" APPEND_STRING PROPERTY COMPILE_FLAGS " /Ycchaingen.h /Zm1000")
  if(USE_PCH) # see also src/CMakeLists.txt for details
    set_property(TARGET coretests colored_cout_test difficulty-tests mnemonic_encoding_test libethash_test functional_tests hash-target-tests performance_tests unit_tests APPEND_STRING PROPERTY LINK_FLAGS "$(MSBuildProjectDirectory)/../src/$(ConfigurationName)/stdafx.obj")
    set_property(TARGET db_tests rpc_stress_test APPEND_STRING PROPERTY LINK_FLAGS "$(MSBuildProjectDirectory)/../../src/$(ConfigurationName)/stdafx.obj")
  endif()
endif()
