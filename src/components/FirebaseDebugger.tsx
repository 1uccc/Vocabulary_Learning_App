import { useAuth } from "./AuthContext";
import { auth, db } from "../lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { useState } from "react";
import { doc, setDoc, getDoc, collection, addDoc } from "firebase/firestore";

export function FirebaseDebugger() {
  const { user } = useAuth();
  const [authStatus, setAuthStatus] = useState<string>('');
  const [tokenStatus, setTokenStatus] = useState<string>('');
  const [firestoreStatus, setFirestoreStatus] = useState<string>('');
  const [configStatus, setConfigStatus] = useState<string>('');
  const [testing, setTesting] = useState(false);

  const checkAuthStatus = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        setAuthStatus(`✅ Đã đăng nhập: ${currentUser.email}`);
        
        // Check token
        const token = await currentUser.getIdToken();
        setTokenStatus(`✅ Token hợp lệ: ${token.substring(0, 20)}...`);
      } else {
        setAuthStatus('❌ Chưa đăng nhập');
        setTokenStatus('❌ Không có token');
      }
    } catch (error) {
      setAuthStatus('❌ Lỗi kiểm tra auth');
      setTokenStatus(`❌ Lỗi token: ${error}`);
    }
  };

  const checkFirebaseConfig = () => {
    try {
      const config = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'your-api-key-here',
        authDomain: auth.app.options.authDomain,
        projectId: auth.app.options.projectId,
      };
      
      if (config.apiKey === 'your-api-key-here' || !config.projectId) {
        setConfigStatus('❌ Firebase config chưa được cập nhật');
      } else {
        setConfigStatus(`✅ Config OK: ${config.projectId}`);
      }
    } catch (error) {
      setConfigStatus(`❌ Lỗi config: ${error}`);
    }
  };

  const testFirestore = async () => {
    if (!user) {
      setFirestoreStatus('❌ Cần đăng nhập trước');
      return;
    }

    setTesting(true);
    try {
      // Test write
      const testDoc = doc(db, 'test', user.uid);
      await setDoc(testDoc, {
        message: 'test',
        timestamp: new Date(),
        userId: user.uid
      });
      
      // Test read
      const readDoc = await getDoc(testDoc);
      if (readDoc.exists()) {
        setFirestoreStatus('✅ Firestore hoạt động bình thường');
      } else {
        setFirestoreStatus('❌ Không thể đọc data');
      }
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        setFirestoreStatus('❌ PERMISSION DENIED - Firestore rules chưa được apply');
      } else {
        setFirestoreStatus(`❌ Lỗi Firestore: ${error.message}`);
      }
    } finally {
      setTesting(false);
    }
  };

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <Card className="mx-4 my-2 border-red-200 bg-red-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          🚨 Firebase Debug - Lỗi Permission Denied
          <Badge variant="destructive" className="text-xs">CRITICAL</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Alert className="border-red-300 bg-red-100">
          <AlertDescription className="text-xs">
            <strong>🆘 SỬA NGAY:</strong><br/>
            1. Mở: <strong>Firebase Console → Firestore → Rules</strong><br/>
            2. Paste rules từ <code>/firestore-test.rules</code><br/>
            3. Click <strong>PUBLISH</strong> → Reload page<br/>
            📋 Chi tiết: <code>/FIREBASE-EMERGENCY-FIX.md</code>
          </AlertDescription>
        </Alert>

        <div className="text-xs space-y-1">
          <div><strong>Auth User:</strong> {user ? `✅ ${user.email}` : '❌ Null'}</div>
          <div><strong>User ID:</strong> {user?.uid || 'N/A'}</div>
          {authStatus && <div><strong>Auth Status:</strong> {authStatus}</div>}
          {tokenStatus && <div><strong>Token Status:</strong> {tokenStatus}</div>}
          {configStatus && <div><strong>Config Status:</strong> {configStatus}</div>}
          {firestoreStatus && <div><strong>Firestore Status:</strong> {firestoreStatus}</div>}
        </div>
        
        <div className="flex gap-1 flex-wrap">
          <Button onClick={checkAuthStatus} size="sm" variant="outline" className="text-xs h-6">
            Check Auth
          </Button>
          <Button onClick={checkFirebaseConfig} size="sm" variant="outline" className="text-xs h-6">
            Check Config
          </Button>
          <Button 
            onClick={testFirestore} 
            size="sm" 
            variant="outline" 
            className="text-xs h-6"
            disabled={testing || !user}
          >
            {testing ? 'Testing...' : 'Test Firestore'}
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground border-t pt-2">
          <strong>Quick Fix:</strong>
          <ol className="list-decimal list-inside mt-1 space-y-1">
            <li>Apply rules từ <code>/firestore-test.rules</code></li>
            <li>Tạo indexes nếu gặp lỗi "failed-precondition"</li>
            <li>Reload page sau khi fix</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}