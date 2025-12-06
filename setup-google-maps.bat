@echo off
echo ========================================
echo Google Maps Setup for PokeExplorer
echo ========================================
echo.

echo Step 1: Cleaning Android build...
cd android
call gradlew clean
cd ..
echo ✓ Android cleaned
echo.

echo Step 2: Removing node_modules...
if exist node_modules rmdir /s /q node_modules
echo ✓ node_modules removed
echo.

echo Step 3: Installing dependencies...
call npm install
echo ✓ Dependencies installed
echo.

echo Step 4: Installing react-native-maps@0.31.1...
call npm install react-native-maps@0.31.1 --save
echo ✓ react-native-maps installed
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Connect your Android device via USB
echo 2. Enable USB debugging on your device
echo 3. Run: npx react-native run-android
echo.
echo If maps still don't work:
echo - Ensure Maps SDK for Android is enabled in Google Cloud Console
echo - Verify SHA-1 fingerprint is added to API key
echo - Check that billing is enabled (free tier available)
echo.
pause
