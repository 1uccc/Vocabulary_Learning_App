@echo off
echo ========================================
echo    Vocabulary App - Windows Installer
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js không được tìm thấy!
    echo.
    echo 📥 Vui lòng tải và cài đặt Node.js từ:
    echo    https://nodejs.org/
    echo.
    echo 💡 Chọn phiên bản LTS và khởi động lại Command Prompt sau khi cài đặt
    pause
    exit /b 1
)

echo ✅ Node.js đã được cài đặt
node --version
echo.

REM Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm không khả dụng!
    echo 🔄 Vui lòng cài đặt lại Node.js
    pause
    exit /b 1
)

echo ✅ npm đã sẵn sàng
npm --version
echo.

echo 📦 Bắt đầu cài đặt dependencies...
echo ⏳ Quá trình này có thể mất 2-5 phút...
echo.

npm install

if %errorlevel% neq 0 (
    echo.
    echo ❌ Cài đặt thất bại!
    echo.
    echo 🔧 Thử các giải pháp sau:
    echo    1. npm cache clean --force
    echo    2. npm install
    echo    3. Kiểm tra kết nối internet
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Cài đặt thành công!
echo.
echo 🚀 Khởi động ứng dụng...
echo 🌐 Ứng dụng sẽ mở tại: http://localhost:5173
echo.
echo 💡 Để dừng ứng dụng, nhấn Ctrl + C
echo.

start http://localhost:5173
npm run dev

pause