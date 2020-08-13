add_subdirectory(libethash)
if(USE_OPENCL)
  add_subdirectory(libethash-cl)
endif()

set_property(TARGET ethash PROPERTY FOLDER "contrib")
if(USE_OPENCL)
  set_property(TARGET ethash-cl PROPERTY FOLDER "contrib")
  set_property(TARGET clbin2h PROPERTY FOLDER "contrib")
endif()

if(MSVC)
   target_compile_options(ethash PRIVATE /wd4477 /wd4267)
else()
   target_compile_options(ethash PRIVATE -Wno-format -Wno-aggregate-return -Wno-empty-body)
endif() 
	
