add_executable(rpc_stress_test rpc_stress.cpp)
target_link_libraries(rpc_stress_test wallet currency_core crypto common zlibstatic ${Boost_LIBRARIES})