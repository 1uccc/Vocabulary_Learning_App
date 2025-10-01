# 🚀 Quick Start - Chạy Ngay Trong 3 Phút

## ⚡ Cách Nhanh Nhất

### 1. Mở Command Prompt
- Nhấn `Windows + R` → gõ `cmd` → Enter
- Hoặc tìm "Command Prompt" trong Start Menu

### 2. Kiểm tra Node.js
```bash
node --version
```
- **Nếu có version** → Chuyển bước 3
- **Nếu lỗi** → Tải Node.js tại: https://nodejs.org (chọn LTS)

### 3. Vào thư mục ứng dụng
```bash
cd C:\đường-dẫn-đến-vocabulary-app
```

### 4. Cài đặt và chạy
```bash
npm install
npm run dev
```

### 5. Mở trình duyệt
Truy cập: http://localhost:5173

## 🎉 Xong!

Ứng dụng sẽ chạy ở chế độ **Fallback Mode** (không cần Firebase):
- ✅ Đăng nhập demo
- ✅ Tất cả tính năng hoạt động
- ⚠️ Dữ liệu không lưu trữ lâu dài

## 🔧 Nếu Gặp Lỗi

### "node không được nhận dạng"
```bash
# Cài Node.js từ nodejs.org
# Khởi động lại Command Prompt
```

### "npm install lỗi"
```bash
npm cache clean --force
npm install
```

### "Port đã sử dụng"
```bash
npm run dev -- --port 3000
```

## 📱 Test Mobile View
1. Nhấn F12 trong trình duyệt
2. Nhấn icon mobile (Ctrl + Shift + M)
3. Chọn iPhone/Android size

---
**💡 Tip:** Để setup Firebase thật, xem file `HUONG-DAN-CAI-DAT.md`