@echo off
echo.
echo ================================================================
echo            🚨 FIREBASE PERMISSION DENIED - AUTO FIX
echo ================================================================
echo.
echo 🎯 CÁCH SỬA LỖI (Copy đoạn code bên dưới):
echo.
echo 1. Mở: https://console.firebase.google.com
echo 2. Chọn project của bạn
echo 3. Vào: Firestore Database → Rules
echo 4. Xóa hết nội dung cũ, paste đoạn này:
echo.
echo ----------------------------------------------------------------
echo rules_version = '2';
echo service cloud.firestore {
echo   match /databases/{database}/documents {
echo     allow read, write: if request.auth != null;
echo   }
echo }
echo ----------------------------------------------------------------
echo.
echo 5. Nhấn PUBLISH
echo 6. Reload trang web
echo.
echo ✅ Done? App sẽ chạy bình thường!
echo.
echo 📋 Chi tiết: /FIREBASE-EMERGENCY-FIX.md
echo.
pause