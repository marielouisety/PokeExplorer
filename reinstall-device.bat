@echo off
echo ========================================
echo Reinstalling PokeExplorer on Device
echo ========================================
echo.

echo Step 1: Cleaning up unused dependencies...
call npm uninstall @react-native-firebase/database @react-native/new-app-screen @react-navigation/native @react-navigation/stack @viro-community/react-viro axios firebase react-native-dotenv react-native-safe-area-context react-native-share

echo.
echo Step 2: Installing dependencies...
call npm install

echo.
echo Step 3: Cleaning Android build...
cd android
call gradlew clean
cd ..

echo.
echo Step 4: Uninstalling old app from device...
adb uninstall com.pokeexplorer

echo.
echo Step 5: Building and installing on device...
call npx react-native run-android --device

echo.
echo ========================================
echo Installation Complete!
echo ========================================
pause
