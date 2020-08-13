set -e
#curr_path=${BASH_SOURCE%/*}

function build_fancy_dmg() # $1 - path to package folder, $2 - dmg output filename, $3 - license file
{
  if [ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ]
  then
    echo "build_fancy_dmg is called with no or invalid parameters"
    return 1
  fi

  $distrib_path/utils/contrib/create-dmg/create-dmg \
    --volname "Virie installer" \
    --volicon "$distrib_path/src/gui/qt-daemon/app.icns" \
    --background "$distrib_path/resources/dmg_installer_bg.png" \
    --window-pos 200 120 \
    --window-size 487 290 \
    --icon-size 128 \
    --icon Virie.app 112 115 \
    --hide-extension Virie.app \
    --app-drop-link 365 115 \
    $2 \
    $1

  if [ $? -ne 0 ]
  then
    echo "Failed create-dmg"
    return 1
  fi

  $distrib_path/utils/contrib/create-dmg/support/dmg-license.py $2 $3
  if [ $? -ne 0 ]
  then
    echo "Failed dmg-license.py"
    return 1
  fi

  return 0
}

