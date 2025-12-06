@echo off
echo ========================================
echo Cleaning Up Unused Dependencies
echo ========================================
echo.

echo Removing unused packages...
call npm uninstall @react-native-firebase/database
call npm uninstall @react-native/new-app-screen
call npm uninstall @react-navigation/native
call npm uninstall @react-navigation/stack
call npm uninstall @viro-community/react-viro
call npm uninstall axios
call npm uninstall firebase
call npm uninstall react-native-dotenv
call npm uninstall react-native-safe-area-context
call npm uninstall react-native-share

echo.
echo ========================================
echo Cleanup Complete!
echo ========================================
echo.
echo Removed packages:
echo - @react-native-firebase/database (not used)
echo - @react-native/new-app-screen (not used)
echo - @react-navigation/native (custom navigation)
echo - @react-navigation/stack (custom navigation)
echo - @viro-community/react-viro (not imported)
echo - axios (using fetch instead)
echo - firebase (using @react-native-firebase)
echo - react-native-dotenv (not used)
echo - react-native-safe-area-context (not imported)
echo - react-native-share (using built-in Share)
echo.
echo Remaining dependencies are actively used in the project.
echo.
pause
