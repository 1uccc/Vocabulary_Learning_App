# 📊 Firestore Indexes - Hướng dẫn tạo

## 🚨 Tại sao cần Indexes?

Firestore yêu cầu tạo indexes cho các query phức tạp (có nhiều điều kiện where + orderBy). 

## ⚡ Cách tạo Indexes nhanh nhất

### Phương pháp 1: Click vào link lỗi (Dễ nhất)

Khi gặp lỗi `failed-precondition`, Firebase sẽ cho link trực tiếp:

1. **Copy link từ error message** (bắt đầu bằng `https://console.firebase.google.com`)
2. **Paste vào browser** và mở
3. **Nhấn "Create Index"** 
4. **Đợi 2-5 phút** để index được tạo
5. **Reload trang web**

### Phương pháp 2: Tạo thủ công

1. Vào **Firebase Console** → **Firestore Database** → **Indexes**
2. Nhấn **"Create Index"**
3. Tạo các indexes sau:

#### Index cho Topics
- **Collection ID**: `topics`
- **Fields**:
  - `userId` - Ascending
  - `createdAt` - Descending
- **Query scope**: Collection

#### Index cho Vocabularies  
- **Collection ID**: `vocabularies`
- **Fields**:
  - `userId` - Ascending
  - `createdAt` - Descending
- **Query scope**: Collection

#### Index cho Learning Sessions
- **Collection ID**: `learningSessions`
- **Fields**:
  - `userId` - Ascending
  - `completedAt` - Ascending
- **Query scope**: Collection

#### Index cho User Progress
- **Collection ID**: `userProgress`
- **Fields**:
  - `userId` - Ascending
  - `vocabularyId` - Ascending
- **Query scope**: Collection

## 🔧 Giải pháp tạm thời (Đã áp dụng)

Code đã được cập nhật để:
- ✅ Sử dụng query đơn giản hơn (chỉ where, không orderBy)
- ✅ Sort dữ liệu ở client-side thay vì server-side
- ✅ Filter sessions ở client-side thay vì dùng where với timestamp

## 📋 Checklist sau khi tạo indexes

- [ ] Topics hiển thị bình thường
- [ ] Vocabularies load được
- [ ] Progress stats hiển thị
- [ ] Không còn error trong console
- [ ] Có thể thêm từ vựng mới

## ⏱️ Thời gian tạo Index

- **Index đơn giản**: 1-2 phút
- **Index phức tạp**: 3-5 phút  
- **Large datasets**: 10-15 phút

## 🚫 Nếu không muốn tạo Indexes

Các queries đã được đơn giản hóa để hoạt động mà không cần indexes phức tạp. App sẽ hoạt động bình thường nhưng:

- Data được sort ở client (chậm hơn 1 chút)
- Filter được làm ở client (tốn bandwidth hơn)

---

**Lưu ý**: Indexes là **miễn phí** và cải thiện hiệu suất đáng kể. Khuyến khích tạo để app chạy tối ưu!