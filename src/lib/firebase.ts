import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Cấu hình Firebase - Thay thế bằng config của bạn
const firebaseConfig = {
  apiKey: "AIzaSyB6HCabv_80pDYHbGnYiAqOGNAvn6mRkc8",
  authDomain: "vocabulary-learning-app-33fb5.firebaseapp.com",
  projectId: "vocabulary-learning-app-33fb5",
  storageBucket:
    "vocabulary-learning-app-33fb5.firebasestorage.app",
  messagingSenderId: "22541409709",
  appId: "1:22541409709:web:64bf8161ecc07730a1d524",
  measurementId: "G-CGWK47ZL23",
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo các service
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;