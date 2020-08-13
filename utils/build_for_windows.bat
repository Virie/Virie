if "%LOCAL_BOOST_PATH%" == ""     (
  @echo "LOCAL_BOOST_PATH should be set ti the root of Boost, ex C:\local\boost_1_62_0"
  goto error
)

if "%QT_PREFIX_PATH%" == ""       (
  @echo "QT_PREFIX_PATH should be set to the Qt libs folder, ex C:\Qt\Qt5.9.1\5.9.1\msvc2015_64"
  goto error
)

SET INNOSETUP_PATH=C:\Program Files (x86)\Inno Setup 5\ISCC.exe
SET ETC_BINARIES_PATH=C:\home\deploy\etc-binaries
SET BUILDS_PATH=C:\home\deploy\Virie
SET LOCAL_BOOST_LIB_PATH=%LOCAL_BOOST_PATH%\lib64-msvc-14.0
SET SOURCES_PATH=%cd%
SET VCVARSALL_PATH=C:\Program Files (x86)\Microsoft Visual Studio 14.0\VC\vcvarsall.bat

@echo on

set BOOST_ROOT=%LOCAL_BOOST_PATH%
set BOOST_LIBRARYDIR=%LOCAL_BOOST_LIB_PATH%

@echo "---------------- PREPARING BINARIES ---------------------------"
@echo "---------------------------------------------------------------"

cd %SOURCES_PATH%

@echo "---------------- BUILDING APPLICATIONS ------------------------"
@echo "---------------------------------------------------------------"

rmdir build /s /q
mkdir build
cd build
cmake -D CMAKE_PREFIX_PATH="%QT_PREFIX_PATH%" -D BUILD_GUI=TRUE -D STATIC=FALSE %ADDITIONAL_DEFINES% -G "Visual Studio 14 Win64" ..
IF %ERRORLEVEL% NEQ 0 (
  @echo "Failed to cmake"
  goto error
)

setLocal
call "%VCVARSALL_PATH%" x86_amd64

msbuild version.vcxproj /p:SubSystem="CONSOLE,5.02"  /p:Configuration=Release /t:Build
IF %ERRORLEVEL% NEQ 0 (
  @echo "Failed to msbuild version"
  exit 1
)

msbuild src/daemon.vcxproj /p:SubSystem="CONSOLE,5.02"  /p:Configuration=Release /t:Build
IF %ERRORLEVEL% NEQ 0 (
  @echo "Failed to msbuild daemon"
  exit 1
)

msbuild src/simplewallet.vcxproj /p:SubSystem="CONSOLE,5.02"  /p:Configuration=Release /t:Build
IF %ERRORLEVEL% NEQ 0 (
  @echo "Failed to msbuild simplewallet"
  exit 1
)

msbuild src/Virie.vcxproj /p:SubSystem="WINDOWS,5.02" /p:Configuration=Release /t:Build
IF %ERRORLEVEL% NEQ 0 (
  @echo "Failed to msbuild Virie"
  exit 1
)

rem msbuild src/connectivity_tool.vcxproj /p:SubSystem="CONSOLE,5.02" /p:Configuration=Release /t:Build
rem IF %ERRORLEVEL% NEQ 0 (
rem   @echo "Failed to msbuild connectivity_tool"
rem   exit 1
rem )

@rem build GPU-enabled version of deamon in a different folder

cd %SOURCES_PATH%
rmdir build_sm /s /q
mkdir build_sm
cd build_sm
cmake -D BUILD_GUI=FALSE -D USE_OPENCL=TRUE -D STATIC=FALSE %ADDITIONAL_DEFINES% -G "Visual Studio 14 Win64" ..
IF %ERRORLEVEL% NEQ 0 (
  @echo "Failed to cmake (with OPENLC)"
  exit 1
)
msbuild src/daemon.vcxproj /p:SubSystem="CONSOLE,5.02"  /p:Configuration=Release /t:Build
IF %ERRORLEVEL% NEQ 0 (
  @echo "Failed to msbuild daemon (with OPENLC)"
  exit 1
)

move src\Release\viried.exe src\Release\viried_sm.exe
move src\Release\viried.pdb src\Release\viried_sm.pdb

endlocal

@echo on
@echo "sources are built"

cd %SOURCES_PATH%\build\src\Release
mkdir bunch

copy /Y Virie.exe bunch
copy /Y viried.exe bunch
copy /Y %SOURCES_PATH%\build_sm\src\release\viried_sm.exe bunch
copy /Y simplewallet.exe bunch
copy /Y connectivity_tool bunch
copy /Y %SOURCES_PATH%\resources\License.pdf bunch
copy /Y %SOURCES_PATH%\resources\License.txt bunch

%QT_PREFIX_PATH%\bin\windeployqt.exe bunch\Virie.exe

@rem Qt 5.8.0 deploy bug workaround, see also: https://bugreports.qt.io/browse/QTBUG-59251
copy /Y %QT_PREFIX_PATH%\resources\qtwebengine_devtools_resources.pak bunch\resources

cd bunch

set tempory_build_zip_path=%SOURCES_PATH%\build\archive.zip

zip -0 -r %tempory_build_zip_path% *.*
IF %ERRORLEVEL% NEQ 0 (
  @echo "Failed to zip html"
  exit 1
)

@echo "Add html"

cd %SOURCES_PATH%\src\gui\qt-daemon\
zip -x html/package.json html/gulpfile.js html/less/* -r %tempory_build_zip_path% html
IF %ERRORLEVEL% NEQ 0 (
  @echo "Failed to zip html"
  exit 1
)

@echo "Add runtime stuff"

cd %ETC_BINARIES_PATH%
zip -r %tempory_build_zip_path% *.*
IF %ERRORLEVEL% NEQ 0 (
  @echo "Failed to zip from %ETC_BINARIES_PATH%"
  exit 1
)

cd %SOURCES_PATH%\build
IF %ERRORLEVEL% NEQ 0 (
  @echo "Failed to cd %SOURCES_PATH%\build"
  exit 1
)

mkdir installer_src

unzip %tempory_build_zip_path% -d installer_src
IF %ERRORLEVEL% NEQ 0 (
  @echo "Failed to unzip to installer_src"
  exit 1
)

echo "Build success (in %SOURCES_PATH%\build\installer_src)"
cd ..\..

