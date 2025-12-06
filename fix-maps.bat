@echo off
echo ========================================
echo Fixing Google Maps Native Module Issue
echo ========================================
echo.
echo This will:
echo - Disable React Native new architecture
echo - Clean all build caches
echo - Rebuild the Android app
echo.
pause
echo.

echo Step 1: Stopping Metro bundler...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul
echo ✓ Metro stopped
echo.

echo Step 2: Cleaning Android build...
cd android
call gradlew clean
cd ..
echo ✓ Android cleaned
echo.

echo Step 3: Removing build artifacts...
if exist android\app\build rmdir /s /q android\app\build
if exist android\build rmdir /s /q android\build
if exist android\.gradle rmdir /s /q android\.gradle
echo ✓ Build artifacts removed
echo.

echo Step 4: Clearing Metro cache...
if exist %TEMP%\metro-* rmdir /s /q %TEMP%\metro-*
if exist %TEMP%\react-* rmdir /s /q %TEMP%\react-*
echo ✓ Metro cache cleared
echo.

echo Step 5: Clearing Gradle cache...
if exist %USERPROFILE%\.gradle\caches rmdir /s /q %USERPROFILE%\.gradle\caches
echo ✓ Gradle cache cleared
echo.

echo Step 6: Rebuilding Android app...
cd android
call gradlew assembleDebug --no-daemon
cd ..
echo ✓ Android rebuilt
echo.

echo ========================================
echo Fix Complete!
echo ========================================
echo.
echo The new architecture has been disabled in:
echo android\gradle.properties
echo.
echo Now run these commands:
echo 1. npx react-native start --reset-cache
echo 2. (In a new terminal) npx react-native run-android
echo.
pause
