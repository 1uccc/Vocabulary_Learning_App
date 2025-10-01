# 🚨 Firebase Permission Denied - EMERGENCY FIX

## ⚡ CÁCH SỬA NHANH NHẤT (30 giây)

### 🔥 BƯỚC KHẨN CẤP - Apply Test Rules Ngay
**LÀM NGAY ĐỂ APP CHẠY ĐƯỢC:**

1. **Mở Firebase Console**: https://console.firebase.google.com
2. **Chọn project của bạn** (tên project trong .env)
3. **Vào: Firestore Database → Rules**
4. **Xóa tất cả nội dung cũ, paste đoạn này:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // EMERGENCY RULES - Cho phép user đã login truy cập tất cả
    allow read, write: if request.auth != null;
  }
}
```

5. **Nhấn PUBLISH (màu xanh)**
6. **Đợi 10-30 giây**
7. **Reload trang web ← QUAN TRỌNG**

### ✅ Kiểm tra đã fix chưa:
- Màn hình không còn hiện "🔄 Fallback Mode"
- Debug tool hiện: "✅ Firestore connected"

### Bước 2: Tạo Firestore Indexes (Nếu cần)

**Gặp lỗi "failed-precondition"?**
1. Copy link từ error message
2. Paste vào browser và mở
3. Nhấn "Create Index" 
4. Đợi 2-5 phút
5. Reload trang

**Chi tiết**: Xem `/lib/firestore-indexes.md`

### Bước 3: Test với Emergency Tool
- Sử dụng "🔬 Emergency Firestore Test" trong app
- Nhấn "Chạy Emergency Test"
- Xem kết quả để xác nhận đã fix

---

## Bước 1: Kiểm tra Firestore Rules

1. Mở Firebase Console: https://console.firebase.google.com
2. Chọn project của bạn
3. Vào **Firestore Database** > **Rules**
4. Thay thế toàn bộ nội dung bằng rules sau:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read and write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow users to access their own topics
    match /topics/{topicId} {
      allow read, write, delete: if request.auth != null && 
        (resource == null || request.auth.uid == resource.data.userId);
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
      allow list: if request.auth != null;
    }
    
    // Allow users to access their own vocabularies  
    match /vocabularies/{vocabId} {
      allow read, write, delete: if request.auth != null && 
        (resource == null || request.auth.uid == resource.data.userId);
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
      allow list: if request.auth != null;
    }
    
    // Allow users to access their own progress
    match /userProgress/{progressId} {
      allow read, write, delete: if request.auth != null && 
        (resource == null || request.auth.uid == resource.data.userId);
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
      allow list: if request.auth != null;
    }
    
    // Allow users to access their own learning sessions
    match /learningSessions/{sessionId} {
      allow read, write, delete: if request.auth != null && 
        (resource == null || request.auth.uid == resource.data.userId);
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
      allow list: if request.auth != null;
    }
  }
}
```

5. Nhấn **Publish**

## Bước 2: Kiểm tra Firebase Config

Mở `/lib/firebase.ts` và đảm bảo config đúng:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key-here",
  authDomain: "your-project-id.firebaseapp.com", 
  projectId: "your-actual-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## Bước 3: Test với Debug Tool

1. Mở ứng dụng trong browser
2. Tìm hộp "🐛 Firebase Debug" ở trên cùng
3. Nhấn "Kiểm tra Auth" để test connection
4. Xem status auth và token

## Bước 4: Nếu vẫn lỗi

### Test Rules tạm thời (CHẠY ĐỂ TEST)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    allow read, write: if request.auth != null;
  }
}
```

⚠️ **LƯU Ý**: Rules này cho phép tất cả user đã login truy cập mọi data. Chỉ dùng để test!

### Kiểm tra Authentication Settings

1. Firebase Console > **Authentication** > **Sign-in method**  
2. Đảm bảo "Email/Password" đã được **Enable**
3. Kiểm tra **Authorized domains** có localhost

## Bước 5: Restart và Test

```bash
# Dừng dev server
Ctrl + C

# Restart  
npm run dev
```

## Debug Commands

```bash
# Xóa cache và restart
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## ✅ Checklist

- [ ] Firestore Rules đã apply
- [ ] Firebase config đúng project
- [ ] Authentication đã enable Email/Password  
- [ ] Debug tool hiện "✅ Đã đăng nhập"
- [ ] Debug tool hiện "✅ Token hợp lệ"
- [ ] Restart app sau khi apply rules

Nếu tất cả checklist ✅ mà vẫn lỗi, vui lòng share screenshot error để được hỗ trợ thêm!