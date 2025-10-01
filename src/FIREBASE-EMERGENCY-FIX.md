# 🚨 FIREBASE LỖI PERMISSION DENIED

## 🆘 CỨU KHẨN CẤP - Làm ngay để app chạy (30 giây)

### Lỗi gì?
- App hiển thị "🔄 Fallback Mode"
- Console báo "Permission Denied"
- Firebase Debug hiện đỏ "❌ Permission denied"

### Nguyên nhân:
- **Firestore Security Rules chưa được cấu hình** trong Firebase Console

---

## ⚡ SỬA LỖI NGAY (COPY-PASTE)

### BƯỚC 1: Apply Emergency Rules

1. **Mở link này**: https://console.firebase.google.com
2. **Chọn project** (tìm tên project trong file `.env`)
3. **Click**: `Firestore Database` → `Rules`
4. **Xóa hết**, **paste đoạn này**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    allow read, write: if request.auth != null;
  }
}
```

5. **Nhấn nút `PUBLISH`** (màu xanh)
6. **Đợi 10-30 giây**

### BƯỚC 2: Test
1. **Reload trang web** (F5 hoặc Ctrl+R)
2. **Kiểm tra**: 
   - Không còn "🔄 Fallback Mode"
   - Firebase Debug hiện "✅ Connected"

---

## 🔍 Nếu vẫn lỗi

### Check 1: Firebase Config
Mở `.env` file, đảm bảo có đủ thông tin:
```
VITE_FIREBASE_API_KEY=your-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
...
```

### Check 2: Authentication
1. Firebase Console → **Authentication** → **Sign-in method**
2. Đảm bảo **Email/Password** = **Enabled**

### Check 3: Indexes (nếu báo "failed-precondition")
1. Copy link từ error message
2. Mở link đó trong browser 
3. Nhấn "Create Index"
4. Đợi 2-5 phút

---

## ⚠️ LƯU Ý QUAN TRỌNG

**Rules trên chỉ để TEST!** 

Sau khi app chạy ổn, thay bằng rules an toàn hơn từ file `/firestore.rules`

---

## 🆘 Vẫn không được?

1. **Restart dev server**: 
   ```bash
   Ctrl+C
   npm run dev
   ```

2. **Xóa cache**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run dev
   ```

3. **Screenshot lỗi** và hỏi lại với chi tiết hơn.

---

## ✅ SUCCESS CHECKLIST

- [ ] Firebase Console → Rules đã publish
- [ ] Không còn "Fallback Mode" 
- [ ] Debug tool hiện "✅ Connected"
- [ ] App tạo được data mới
- [ ] Auth hoạt động bình thường

🎉 **Nếu tất cả ✅ → App đã chạy hoàn toàn!**