#!/bin/bash

# Environment prerequisites:
# 1) QT_PREFIX_PATH should be set to Qt libs folder
# 2) BOOST_ROOT should be set to the root of Boost
#
# for example, place these lines to the end of your ~/.bashrc :
#
# export BOOST_ROOT=/home/user/boost_1_66_0
# export QT_PREFIX_PATH=/home/user/Qt5.10.1/5.10.1/gcc_64

: "${BOOST_ROOT:?BOOST_ROOT should be set to the root of Boost, ex.: /home/user/boost_1_66_0}"
: "${QT_PREFIX_PATH:?QT_PREFIX_PATH should be set to Qt libs folder, ex.: /home/user/Qt5.10.1/5.10.1/gcc_64}"

COUNT_PROC=2

echo "---------------- BUILDING PROJECT ----------------"
echo "--------------------------------------------------"
echo "Building...."

# build GPU-enabled daemon for solo mining

rm -rf build_sm; mkdir -p build_sm/release; cd build_sm/release
cmake -D STATIC=true -D ARCH=x86-64 -D USE_OPENCL=TRUE -D BUILD_GUI=FALSE -D CMAKE_BUILD_TYPE=Release ${ADDITIONAL_DEFINES} ../..
if [ $? -ne 0 ]; then
    echo "Failed to run cmake (with opencl)"
    exit 1
fi

make -j ${COUNT_PROC} daemon
if [ $? -ne 0 ]; then
    echo "Failed to make daemon (with opencl)"
    exit 1
fi

cd ../..

# build regular non-GPU binaries

rm -rf build; mkdir -p build/release; cd build/release;
cmake -D STATIC=true -D ARCH=x86-64 -D BUILD_GUI=TRUE -D CMAKE_PREFIX_PATH="$QT_PREFIX_PATH" -D CMAKE_BUILD_TYPE=Release ${ADDITIONAL_DEFINES} ../..
if [ $? -ne 0 ]; then
    echo "Failed to run cmake"
    exit 1
fi

make -j ${COUNT_PROC} daemon Virie;
if [ $? -ne 0 ]; then
    echo "Failed to make daemon Virie"
    exit 1
fi

make -j ${COUNT_PROC} simplewallet;
if [ $? -ne 0 ]; then
    echo "Failed to make simplewallet"
    exit 1
fi

make -j ${COUNT_PROC} connectivity_tool;
if [ $? -ne 0 ]; then
    echo "Failed to make! connectivity_tool"
    exit 1
fi

rm -rf Virie;
mkdir -p Virie;

rsync -a ../../src/gui/qt-daemon/html ./Virie --exclude less --exclude package.json --exclude gulpfile.js
cp -Rv ../../utils/Virie.sh ./Virie
cp -Rv ../../resources/License.txt ./Virie
cp -Rv ../../resources/License.pdf ./Virie
chmod 777 ./Virie/Virie.sh
mkdir ./Virie/lib
cp $QT_PREFIX_PATH/lib/libicudata.so* ./Virie/lib
cp $QT_PREFIX_PATH/lib/libicui18n.so* ./Virie/lib
cp $QT_PREFIX_PATH/lib/libicuuc.so* ./Virie/lib
cp $QT_PREFIX_PATH/lib/libQt5Core.so* ./Virie/lib
cp $QT_PREFIX_PATH/lib/libQt5DBus.so* ./Virie/lib
cp $QT_PREFIX_PATH/lib/libQt5Gui.so* ./Virie/lib
cp $QT_PREFIX_PATH/lib/libQt5Network.so* ./Virie/lib
cp $QT_PREFIX_PATH/lib/libQt5OpenGL.so* ./Virie/lib
cp $QT_PREFIX_PATH/lib/libQt5Positioning.so* ./Virie/lib
cp $QT_PREFIX_PATH/lib/libQt5PrintSupport.so* ./Virie/lib
cp $QT_PREFIX_PATH/lib/libQt5Qml.so* ./Virie/lib
cp $QT_PREFIX_PATH/lib/libQt5Quick.so* ./Virie/lib
cp $QT_PREFIX_PATH/lib/libQt5Sensors.so* ./Virie/lib
cp $QT_PREFIX_PATH/lib/libQt5Sql.so* ./Virie/lib
cp $QT_PREFIX_PATH/lib/libQt5Widgets.so* ./Virie/lib
cp $QT_PREFIX_PATH/lib/libQt5WebEngine.so* ./Virie/lib
cp $QT_PREFIX_PATH/lib/libQt5WebEngineCore.so* ./Virie/lib
cp $QT_PREFIX_PATH/lib/libQt5WebEngineWidgets.so* ./Virie/lib
cp $QT_PREFIX_PATH/lib/libQt5WebChannel.so* ./Virie/lib
cp $QT_PREFIX_PATH/lib/libQt5XcbQpa.so* ./Virie/lib
cp $QT_PREFIX_PATH/lib/libQt5QuickWidgets.so* ./Virie/lib
cp $QT_PREFIX_PATH/libexec/QtWebEngineProcess ./Virie
cp $QT_PREFIX_PATH/resources/qtwebengine_resources.pak ./Virie
cp $QT_PREFIX_PATH/resources/qtwebengine_resources_100p.pak ./Virie
cp $QT_PREFIX_PATH/resources/qtwebengine_resources_200p.pak ./Virie
cp $QT_PREFIX_PATH/resources/icudtl.dat ./Virie

mkdir ./Virie/lib/platforms
cp $QT_PREFIX_PATH/plugins/platforms/libqxcb.so ./Virie/lib/platforms
mkdir ./Virie/xcbglintegrations
cp $QT_PREFIX_PATH/plugins/xcbglintegrations/libqxcb-glx-integration.so ./Virie/xcbglintegrations

cp -Rv src/viried src/Virie src/simplewallet  src/connectivity_tool ./Virie

cp -v ../../build_sm/release/src/viried ./Virie/viried_sm

cd ../..

echo "Build success (in build/release/Virie)"
