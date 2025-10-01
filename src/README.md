# 📚 Ứng dụng Học Từ Vựng

Ứng dụng học từ vựng hiện đại với giao diện di động, hỗ trợ Flashcard, Quiz và theo dõi tiến độ học tập.

## ✨ Tính năng chính

- 🎯 **Dashboard thông minh**: Hiển thị tiến độ học tập và mục tiêu hàng ngày
- 📝 **Quản lý từ vựng**: Thêm, sửa, xóa từ vựng theo chủ đề
- 🧠 **Flashcard**: Học từ vựng hiệu quả với hệ thống lật thẻ
- 🎮 **Quiz trắc nghiệm**: Kiểm tra kiến thức với câu hỏi 4 đáp án
- 📊 **Theo dõi tiến độ**: Thống kê chi tiết và phân tích hiệu suất học tập
- 🎨 **Giao diện đẹp**: Thiết kế theo chuẩn Material Design với màu xanh dương/vàng chanh

## 🛠️ Công nghệ sử dụng

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Database**: Firebase Mock Service
- **State Management**: React Hooks

## 📋 Yêu cầu hệ thống

- Node.js >= 18.0.0
- npm >= 9.0.0 hoặc yarn >= 1.22.0

## 🚀 Hướng dẫn cài đặt

### Bước 1: Cài đặt Node.js

Tải và cài đặt Node.js từ [nodejs.org](https://nodejs.org/)

Kiểm tra phiên bản:
\`\`\`bash
node --version
npm --version
\`\`\`

### Bước 2: Clone/Download project

**Cách 1: Download ZIP**
1. Download file ZIP từ Figma Make
2. Giải nén vào thư mục bạn muốn

**Cách 2: Copy files**
1. Tạo thư mục mới cho project:
\`\`\`bash
mkdir vocabulary-learning-app
cd vocabulary-learning-app
\`\`\`
2. Copy tất cả files từ Figma Make vào thư mục này

### Bước 3: Cài đặt dependencies

\`\`\`bash
npm install
\`\`\`

Hoặc nếu bạn dùng yarn:
\`\`\`bash
yarn install
\`\`\`

### Bước 4: Chạy ứng dụng

\`\`\`bash
npm run dev
\`\`\`

Hoặc với yarn:
\`\`\`bash
yarn dev
\`\`\`

### Bước 5: Mở ứng dụng

Mở trình duyệt và truy cập: http://localhost:3000

## 📁 Cấu trúc thư mục

\`\`\`
vocabulary-learning-app/
├── components/                 # React components
│   ├── ui/                    # shadcn/ui components
│   ├── FirebaseService.tsx    # Mock Firebase service
│   ├── MobileHeader.tsx       # Header component
│   ├── MobileTabBar.tsx       # Navigation tabs
│   ├── DashboardView.tsx      # Dashboard page
│   ├── MobileVocabularyView.tsx # Vocabulary management
│   ├── MobileFlashcardView.tsx  # Flashcard learning
│   ├── MobileQuizView.tsx       # Quiz testing
│   └── MobileProgressView.tsx   # Progress tracking
├── styles/
│   └── globals.css            # Global styles & Tailwind config
├── App.tsx                    # Main app component
├── main.tsx                   # App entry point
├── index.html                 # HTML template
├── package.json               # Project dependencies
├── vite.config.ts            # Vite configuration
└── tsconfig.json             # TypeScript configuration
\`\`\`

## 🎯 Cách sử dụng

### 1. Thêm từ vựng mới
- Vào tab "Từ vựng" (Book icon)
- Nhấn nút "Thêm" ở góc phải
- Điền thông tin từ vựng, nghĩa, ví dụ
- Chọn chủ đề hoặc tạo chủ đề mới

### 2. Học với Flashcard
- Vào tab "Flashcard" (Brain icon)
- Chọn chủ đề muốn học
- Đọc từ vựng, suy nghĩ về nghĩa
- Nhấn "Xem nghĩa" để kiểm tra
- Đánh giá "Đã nhớ" hoặc "Chưa nhớ"

### 3. Làm Quiz
- Vào tab "Quiz" (Trophy icon)
- Chọn chủ đề
- Trả lời các câu hỏi trắc nghiệm
- Xem kết quả và thống kê

### 4. Theo dõi tiến độ
- Vào tab "Tiến độ" (Chart icon)
- Xem thống kê tổng quan
- Theo dõi tiến độ từng chủ đề
- Nhận lời khuyên cải thiện

## 🔧 Commands hữu ích

\`\`\`bash
# Chạy development server
npm run dev

# Build cho production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
\`\`\`

## 🎨 Customization

### Thay đổi màu sắc
Chỉnh sửa file \`styles/globals.css\` để thay đổi color theme:

\`\`\`css
:root {
  --primary: #2563eb;        /* Màu xanh dương chính */
  --accent: #eab308;         /* Màu vàng chanh */
  --background: #ffffff;     /* Màu nền */
  /* ... */
}
\`\`\`

### Thêm tính năng mới
- Tạo component mới trong thư mục \`components/\`
- Import và sử dụng trong \`App.tsx\`
- Cập nhật navigation trong \`MobileTabBar.tsx\`

## 🐛 Troubleshooting

### Lỗi "Cannot find module"
\`\`\`bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install
\`\`\`

### Port 3000 đã được sử dụng
Thay đổi port trong \`vite.config.ts\`:
\`\`\`ts
server: {
  port: 3001, // Đổi thành port khác
}
\`\`\`

### Lỗi TypeScript
Kiểm tra file \`tsconfig.json\` và đảm bảo tất cả dependencies đã được cài đặt.

## 📞 Hỗ trợ

Nếu gặp vấn đề trong quá trình cài đặt hoặc sử dụng, bạn có thể:
1. Kiểm tra console của trình duyệt để xem lỗi chi tiết
2. Đảm bảo tất cả dependencies đã được cài đặt đúng
3. Restart development server bằng Ctrl+C rồi \`npm run dev\` lại

## 🚨 LỖI FIREBASE - HƯỚNG DẪN SỬA

### 🔥 Permission Denied
1. 📖 Xem `/lib/firebase-quick-fix.md` để sửa từng bước
2. 🔄 Apply Firestore rules từ `/firestore-test.rules`
3. 🐛 Sử dụng debug tool trong app để kiểm tra

### 📊 Failed Precondition (Index Required)
1. 🔗 Click vào link trong error message 
2. ⏱️ Nhấn "Create Index" và đợi 2-5 phút
3. 📋 Xem chi tiết trong `/lib/firestore-indexes.md`

### ⚙️ Lỗi khác
**Dialog warnings**: Đã sửa với React.forwardRef

## 📄 License

MIT License - Sử dụng tự do cho mục đích học tập và phát triển.

---

**Happy Learning! 🎓**