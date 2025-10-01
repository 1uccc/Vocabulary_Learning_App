# Hướng Dẫn Cài Đặt Ứng Dụng Học Từ Vựng trên Windows

## 📋 Yêu Cầu Hệ Thống

### 1. Cài đặt Node.js
- Tải về Node.js phiên bản LTS (≥18.0.0) từ: https://nodejs.org/
- Chọn phiên bản "LTS" (khuyên dùng)
- Chạy file installer và làm theo hướng dẫn
- Khởi động lại Command Prompt sau khi cài đặt

### 2. Kiểm tra cài đặt
Mở Command Prompt (cmd) hoặc PowerShell và chạy:
```bash
node --version
npm --version
```
Nếu hiển thị số phiên bản thì đã cài đặt thành công.

## 🚀 Cài Đặt Ứng Dụng

### Bước 1: Chuẩn bị code
1. Tải code về máy (từ GitHub, ZIP file, v.v.)
2. Giải nén vào thư mục bạn muốn (ví dụ: `C:\vocabulary-app`)

### Bước 2: Mở Command Prompt
1. Nhấn `Windows + R`, gõ `cmd`, nhấn Enter
2. Hoặc mở PowerShell từ Start Menu
3. Di chuyển đến thư mục ứng dụng:
```bash
cd C:\vocabulary-app
```

### Bước 3: Cài đặt dependencies
```bash
npm install
```
Quá trình này sẽ mất 2-5 phút tùy vào tốc độ internet.

### Bước 4: Chạy ứng dụng
```bash
npm run dev
```

### Bước 5: Mở trình duyệt
- Ứng dụng sẽ chạy tại: http://localhost:5173
- Tự động mở trình duyệt hoặc copy link vào trình duyệt

## 🔥 Cài Đặt Firebase (Tùy chọn)

Ứng dụng hiện đang chạy với **Fallback Mode** (không cần Firebase). Để sử dụng Firebase thật:

### Bước 1: Tạo Firebase Project
1. Truy cập: https://console.firebase.google.com/
2. Đăng nhập bằng tài khoản Google
3. Tạo project mới
4. Bật Authentication (Email/Password)
5. Tạo Firestore Database

### Bước 2: Lấy Firebase Config
1. Vào Project Settings → General
2. Cuộn xuống "Your apps" → chọn Web app
3. Copy Firebase config object

### Bước 3: Tạo file .env
Tạo file `.env` trong thư mục gốc với nội dung:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456
```

### Bước 4: Apply Firestore Rules
1. Copy nội dung từ file `/firestore.rules`
2. Paste vào Firebase Console → Firestore → Rules
3. Publish rules

### Bước 5: Khởi động lại ứng dụng
```bash
# Dừng ứng dụng (Ctrl + C)
# Chạy lại
npm run dev
```

## 🛠️ Troubleshooting - Xử Lý Lỗi

### Lỗi "node không được nhận dạng"
**Nguyên nhân:** Node.js chưa được cài đặt hoặc chưa được thêm vào PATH
**Giải pháp:**
1. Cài đặt lại Node.js từ nodejs.org
2. Khởi động lại Command Prompt
3. Kiểm tra lại với `node --version`

### Lỗi "npm install thất bại"
**Nguyên nhân:** Vấn đề network hoặc quyền truy cập
**Giải pháp:**
```bash
# Xóa cache npm
npm cache clean --force

# Cài đặt lại
npm install

# Hoặc sử dụng yarn
npm install -g yarn
yarn install
```

### Lỗi "Port 5173 đã được sử dụng"
**Giải pháp:**
```bash
# Chạy trên port khác
npm run dev -- --port 3000
```

### Lỗi Firebase Permission Denied
**Nguyên nhân:** Firestore rules chưa được apply đúng
**Giải pháp:**
1. Kiểm tra Firestore Rules trong Firebase Console
2. Apply rules từ file `/firestore.rules`
3. Đảm bảo Authentication đã được bật

### Ứng dụng không load được
**Kiểm tra:**
1. Console trong trình duyệt có lỗi gì không (F12)
2. Firewall/Antivirus có chặn không
3. Thử trình duyệt khác (Chrome, Firefox)

## 📱 Kiểm Tra Responsive Design

Ứng dụng được thiết kế cho mobile-first:

1. Mở Developer Tools (F12)
2. Chọn Device Toolbar (Ctrl + Shift + M)
3. Chọn kích thước mobile (iPhone, Android)
4. Test các tính năng

## 🔧 Các Lệnh Hữu Ích

```bash
# Chạy development server
npm run dev

# Build cho production
npm run build

# Preview production build
npm run preview

# Kiểm tra lỗi TypeScript
npm run type-check

# Format code
npm run format
```

## 📞 Hỗ Trợ

Nếu gặp vấn đề:

1. **Kiểm tra logs:** Xem messages trong Command Prompt
2. **Browser Console:** Mở F12 → Console tab
3. **Network tab:** Kiểm tra API calls có thành công không
4. **Firebase Console:** Kiểm tra Authentication và Firestore

### Debug Tools trong App
Ứng dụng có sẵn debug tools:
- **FirebaseDebugger**: Hiển thị trạng thái kết nối Firebase
- **EmergencyFirestoreTest**: Test kết nối Firestore
- **Fallback Mode**: Chạy offline khi Firebase không khả dụng

## 🎯 Tính Năng Chính

- ✅ **Dashboard**: Hiển thị tiến độ học tập
- ✅ **Quản lý từ vựng**: Thêm, sửa, xóa từ vựng
- ✅ **Flashcard**: Học từ vựng qua thẻ ghi nhớ
- ✅ **Quiz**: Làm bài kiểm tra
- ✅ **Tiến độ**: Theo dõi kết quả học tập
- ✅ **Mobile-first**: Giao diện tối ưu cho di động
- ✅ **Offline mode**: Hoạt động không cần internet

---

**Lưu ý:** Ứng dụng sẽ hoạt động ngay cả khi không có Firebase. Dữ liệu sẽ được lưu tạm thời trong browser và sẽ mất khi refresh page.