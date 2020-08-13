set -x #echo on
curr_path=${BASH_SOURCE%/*}

# check that all the required environment vars are set
: "${VIRIE_QT_PATH:?variable not set, see also macosx_build_config.command}"
: "${VIRIE_BOOST_ROOT:?variable not set, see also macosx_build_config.command}"
: "${VIRIE_BOOST_LIBS_PATH:?variable not set, see also macosx_build_config.command}"
: "${VIRIE_BUILD_DIR:?variable not set, see also macosx_build_config.command}"

BUILD_DIR=$curr_path/../$VIRIE_BUILD_DIR/macos_xcodeproj
BUILD_TYPE=Release

rm -rf $BUILD_DIR
mkdir -p "$BUILD_DIR/$BUILD_TYPE"
cd "$BUILD_DIR/$BUILD_TYPE"

cmake -D BUILD_GUI=TRUE -D CMAKE_PREFIX_PATH="$VIRIE_QT_PATH/clang_64" -D CMAKE_BUILD_TYPE=$BUILD_TYPE -D BOOST_ROOT="$VIRIE_BOOST_ROOT" -D BOOST_LIBRARYDIR="$VIRIE_BOOST_LIBS_PATH" -G Xcode ../../..

