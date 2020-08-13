Building
--------

### Dependencies
| component / version | minimum <br>(not recommended but may work) | recommended | most recent of what we have ever tested |
|--|--|--|--|
| gcc (Linux) | 5.4.0 | 7.2.0 | 7.3.0 |
| [MSVC](https://visualstudio.microsoft.com/downloads/) (Windows) | 2015 (14.0 update 1) | 2015 (14.0 update 3) | 2017 (15.9.0) |
| [XCode](https://developer.apple.com/downloads/) (macOS) | 7.3.1 | 9.2 | 9.2 |
| [CMake](https://cmake.org/download/) | 2.8.6 | 3.4.1 | 3.13.0 |
| [Boost](https://www.boost.org/users/download/) | 1.56 | 1.60 | 1.68 |
| [Qt](https://download.qt.io/archive/qt/) (only for GUI) | 5.8.0 | 5.9.1 | 5.11.2 |

### Linux
Recommended OS version: Ubuntu 18.04 LTS.
 1. Install dependencies: `sudo apt-get install build-essential git cmake unzip libicu-dev ocl-icd-opencl-dev mesa-common-dev libglu1-mesa-dev`
 2. Install Qt
 3. Install Boost
	 3.1. Download and unpack Boost
	 3.2. Run booststrap script: <br> `./bootstrap.sh --with-libraries=system,filesystem,thread,date_time,chrono,regex,serialization,atomic,program_options,locale`
	 3.3. Build Boost by running `b2` script
 4. Set environment variables (in your `~/.bashrc` for instance):
	 4.1. `BOOST_ROOT` should be set to Boost root folder
	 4.2. `QT_PREFIX_PATH` should be set to Qt libs folder
 5. Build command-line applications and tests:
  `mkdir build` <br> `cd build` <br> `cmake -DBUILD_GUI=FALSE -DSTATIC=TRUE ..` <br> `make`
5. In order to build GUI, revise and run script at `/utils/build_for_linux.sh`

### Windows
Recommended OS version: Windows 7 x64.
1. Install required prerequisites.
2. Copy `utils/configure_local_paths.cmd.example` to `utils/configure_local_paths.cmd` and make sure paths in the file are correct.
3. Run `utils/configure_win64_msvs2015_gui.cmd` or `utils/configure_win64_msvs2017_gui.cmd` according to your MSVC version.
4. Go to the build folder and open Virie.sln in MSVC.
5. Build.

In order to correctly deploy Qt GUI application you also need to do the following:
6. Copy Virie.exe to a folder (e.g. `depoy`). 
7. Run  `PATH_TO_QT\bin\windeployqt.exe deploy/Virie.exe`.
8. Copy folder `\src\gui\qt-daemon\html` to `deploy\html`.

### macOS
Recommended OS version: macOS Sierra 10.12.6 x64.
1. Install required prerequisites.
2. Set environment variables as stated in `utils/macosx_build_config.command`.
3.  `mkdir build` <br> `cd build` <br> `cmake ..` <br> `make`

To build GUI application:

1. Create self-signing certificate via Keychain Access:
    a. Run Keychain Access.
    b. Choose Keychain Access > Certificate Assistant > Create a Certificate.
    c. Use “Virie” (without quotes) as certificate name.
    d. Choose “Code Signing” in “Certificate Type” field.
    e. Press “Create”, then “Done”.
    f. Make sure the certificate was added to keychain "System". If not—move it to "System".
    g. Double click the certificate you've just added, enter the trust section and under "When using this certificate" select "Always trust".
    h. Unfold the certificate in Keychain Access window and double click underlying private key "Virie". Select "Access Control" tab, then select "Allow all applications to access this item". Click "Save Changes".
2. Revise building script, comment out unwanted steps and run it:  `utils/build_for_mac_osx.sh`
3. The application should be here: `/buid_mac_osx_64/release/src`


Good luck!

