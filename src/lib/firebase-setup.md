# 🔥 Hướng dẫn cài đặt Firebase

> **🚨 GẶP LỖI PERMISSION DENIED?** Xem ngay file `/lib/firebase-quick-fix.md` để sửa nhanh!

## 1. Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Nhấn "Add project" (Thêm dự án)
3. Nhập tên project: `vocabulary-learning-app`
4. Chọn "Continue" và làm theo hướng dẫn
5. Tạo project

## 2. Cài đặt Authentication

1. Trong Firebase Console, chọn "Authentication" từ menu bên trái
2. Nhấn "Get started"
3. Chọn tab "Sign-in method"
4. Bật "Email/Password":
   - Nhấn vào Email/Password
   - Bật "Enable"
   - Nhấn "Save"

## 3. Cài đặt Firestore Database

1. Chọn "Firestore Database" từ menu bên trái
2. Nhấn "Create database"
3. Chọn "Start in test mode" (cho development)
4. Chọn location gần nhất (ví dụ: asia-southeast1)
5. Nhấn "Done"

## 4. Cài đặt Storage (Tùy chọn)

1. Chọn "Storage" từ menu bên trái
2. Nhấn "Get started"
3. Chọn "Start in test mode"
4. Chọn location
5. Nhấn "Done"

## 5. Lấy Firebase Config

1. Trong Firebase Console, nhấn vào ⚙️ "Project settings"
2. Cuộn xuống phần "Your apps"
3. Nhấn biểu tượng Web `</>`
4. Nhập app nickname: `vocabulary-app`
5. Nhấn "Register app"
6. Copy đoạn config JavaScript

## 6. Cập nhật cấu hình trong code

Mở file `/lib/firebase.ts` và thay thế config:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id", 
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-actual-app-id"
};
```

## 7. Cấu hình Firestore Security Rules

Trong Firebase Console > Firestore Database > Rules, thay thế bằng rules từ file `/firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can access their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can access their own topics
    match /topics/{topicId} {
      allow read, write: if request.auth != null && 
        (resource == null || request.auth.uid == resource.data.userId);
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Users can access their own vocabularies
    match /vocabularies/{vocabId} {
      allow read, write: if request.auth != null && 
        (resource == null || request.auth.uid == resource.data.userId);
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Users can access their own progress
    match /userProgress/{progressId} {
      allow read, write: if request.auth != null && 
        (resource == null || request.auth.uid == resource.data.userId);
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Users can access their own learning sessions
    match /learningSessions/{sessionId} {
      allow read, write: if request.auth != null && 
        (resource == null || request.auth.uid == resource.data.userId);
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
  }
}
```

**Lưu ý quan trọng:** Rules này cho phép tạo documents mới bằng cách kiểm tra `resource == null` (document chưa tồn tại) hoặc `request.resource.data.userId` (data trong request tạo mới).

## 8. Test kết nối

1. Chạy ứng dụng: `npm run dev`
2. Thử tạo tài khoản mới
3. Đăng nhập và kiểm tra

## ❗ Lưu ý bảo mật

- **Không commit** file cấu hình Firebase có chứa API keys thật
- Trong production, sử dụng environment variables
- Cập nhật Firestore rules để bảo mật hơn
- Bật reCAPTCHA cho Authentication nếu cần

## 🔧 Environment Variables (Production)

Tạo file `.env.local`:

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

Và cập nhật `/lib/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```