@echo off
echo Rebuilding app with new architecture disabled...
echo.
cd android
gradlew.bat clean assembleDebug
cd ..
echo.
echo Done! Now run: npx react-native run-android
pause
