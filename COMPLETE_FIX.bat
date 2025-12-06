@echo off
echo ========================================
echo COMPLETE GOOGLE MAPS FIX
echo ========================================
echo.
echo This will:
echo 1. Uninstall the app from device
echo 2. Clean all build caches
echo 3. Rebuild with legacy bridge (no Fabric)
echo.
pause

echo Uninstalling app...
adb uninstall com.pokeexplorer
echo.

echo Cleaning Android build...
cd android
call gradlew.bat clean
cd ..
echo.

echo Removing build directories...
rmdir /s /q android\app\build 2>nul
rmdir /s /q android\build 2>nul
rmdir /s /q android\.gradle 2>nul
echo.

echo Building APK...
cd android
call gradlew.bat assembleDebug
cd ..
echo.

echo ========================================
echo COMPLETE! Now run:
echo npx react-native run-android
echo ========================================
pause
