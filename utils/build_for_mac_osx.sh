set -x #echo on
curr_path=$(pwd)

# check that all the required environment vars are set
: "${VIRIE_QT_PATH:?variable not set, see also macosx_build_config.command}"
: "${VIRIE_BOOST_ROOT:?variable not set, see also macosx_build_config.command}"
: "${VIRIE_BOOST_LIBS_PATH:?variable not set, see also macosx_build_config.command}"
: "${VIRIE_BUILD_DIR:?variable not set, see also macosx_build_config.command}"

export BUILD_PREFIX_NAME="virie-macos-x64-webengine-$BUILD_SUFFIX"

echo "---------------- BUILDING PROJECT ----------------"
echo "--------------------------------------------------"
echo "Building...."

rm -rf $VIRIE_BUILD_DIR; mkdir -p "$VIRIE_BUILD_DIR/release"; cd "$VIRIE_BUILD_DIR/release"

cmake -D BUILD_GUI=TRUE -D CMAKE_PREFIX_PATH="$VIRIE_QT_PATH/clang_64" -D CMAKE_BUILD_TYPE=Release -D BOOST_ROOT="$VIRIE_BOOST_ROOT" -D BOOST_LIBRARYDIR="$VIRIE_BOOST_LIBS_PATH" ${ADDITIONAL_DEFINES} ../..
if [ $? -ne 0 ]; then
    echo "Failed to cmake"
    exit 1
fi

make -j Virie
if [ $? -ne 0 ]; then
    echo "Failed to make Virie"
    exit 1
fi

# for version
make -j connectivity_tool;
if [ $? -ne 0 ]; then
    echo "Failed to make connectivity_tool"
    exit 1
fi

cd src/
if [ $? -ne 0 ]; then
    echo "Failed to cd src"
    exit 1
fi

# copy all necessary libs into the bundle in order to workaround El Capitan's SIP restrictions
mkdir -p Virie.app/Contents/Frameworks/boost_libs
cp -R "$VIRIE_BOOST_LIBS_PATH/" Virie.app/Contents/Frameworks/boost_libs/
if [ $? -ne 0 ]; then
    echo "Failed to cp workaround to MacOS"
    exit 1
fi

# rename process name to big letter
mv Virie.app/Contents/MacOS/virie Virie.app/Contents/MacOS/Virie
if [ $? -ne 0 ]; then
    echo "May be already big letter"
fi

cp ../../../resources/License.pdf Virie.app/Contents/MacOS/License.pdf
cp ../../../resources/License.txt Virie.app/Contents/MacOS/License.txt

# fix boost libs paths in main executable and libs to workaround El Capitan's SIP restrictions
source ../../../utils/macosx_fix_boost_libs_path.sh
fix_boost_libs_in_binary @executable_path/../Frameworks/boost_libs Virie.app/Contents/MacOS/Virie
fix_boost_libs_in_libs @executable_path/../Frameworks/boost_libs Virie.app/Contents/Frameworks/boost_libs

"$VIRIE_QT_PATH/clang_64/bin/macdeployqt" Virie.app
if [ $? -ne 0 ]; then
    echo "Failed to macdeployqt Virie.app"
    exit 1
fi

rsync -a ../../../src/gui/qt-daemon/html Virie.app/Contents/MacOS --exclude less --exclude package.json --exclude gulpfile.js
if [ $? -ne 0 ]; then
    echo "Failed to cp html to MacOS"
    exit 1
fi

cp ../../../src/gui/qt-daemon/app.icns Virie.app/Contents/Resources
if [ $? -ne 0 ]; then
    echo "Failed to cp app.icns to resources"
    exit 1
fi

codesign -s "Virie" --deep -vv -f Virie.app
if [ $? -ne 0 ]; then
    echo "Failed to sign application"
    exit 1
fi

cd ../../..
echo "Build success (in ${VIRIE_BUID_DIR}/release/src/Virie.app)"
