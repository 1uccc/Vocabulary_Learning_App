import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { useAuth } from "./AuthContext";
import { doc, setDoc, getDoc, collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";

export function EmergencyFirestoreTest() {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runEmergencyTest = async () => {
    if (!user) {
      addResult('❌ User not authenticated');
      return;
    }

    setTesting(true);
    setTestResults([]);
    addResult('🚀 Starting emergency Firestore test...');

    try {
      // Test 1: Simple document write
      addResult('📝 Test 1: Writing test document...');
      const testDocRef = doc(db, 'emergencyTest', user.uid);
      await setDoc(testDocRef, {
        message: 'Emergency test',
        userId: user.uid,
        timestamp: new Date()
      });
      addResult('✅ Test 1: Write successful');

      // Test 2: Read the document back
      addResult('📖 Test 2: Reading test document...');
      const docSnap = await getDoc(testDocRef);
      if (docSnap.exists()) {
        addResult('✅ Test 2: Read successful');
      } else {
        addResult('❌ Test 2: Document not found');
      }

      // Test 3: Try to create a topic (real use case)
      addResult('📝 Test 3: Creating test topic...');
      const topicRef = await addDoc(collection(db, 'topics'), {
        name: 'Emergency Test Topic',
        description: 'Test topic for debugging',
        color: '#2563eb',
        userId: user.uid,
        createdAt: new Date()
      });
      addResult(`✅ Test 3: Topic created with ID: ${topicRef.id}`);

      // Test 4: Query topics by user
      addResult('📖 Test 4: Querying topics...');
      const topicsQuery = query(
        collection(db, 'topics'),
        where('userId', '==', user.uid)
      );
      const topicsSnapshot = await getDocs(topicsQuery);
      addResult(`✅ Test 4: Found ${topicsSnapshot.docs.length} topics`);

      addResult('🎉 ALL TESTS PASSED! Firestore is working correctly.');
      addResult('✨ Your Firebase setup is correct. The app should work now.');

    } catch (error: any) {
      addResult(`❌ Test failed: ${error.code} - ${error.message}`);
      
      if (error.code === 'permission-denied') {
        addResult('🚨 SOLUTION: Apply the test rules from /firestore-test.rules to Firebase Console');
        addResult('📋 Steps: Firebase Console → Firestore Database → Rules → Copy/Paste → Publish');
      }
    } finally {
      setTesting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card className="mx-4 my-2 border-blue-200 bg-blue-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          🔬 Emergency Firestore Test
          <Badge variant="secondary" className="text-xs">Debug Tool</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Alert>
          <AlertDescription className="text-sm">
            <strong>Công cụ này sẽ test trực tiếp Firestore để xác định vấn đề permission denied.</strong><br/>
            🎯 Chạy test này sau khi apply rules để verify connection.
          </AlertDescription>
        </Alert>

        <Button 
          onClick={runEmergencyTest} 
          disabled={testing}
          className="w-full"
          variant={testResults.length > 0 ? "outline" : "default"}
        >
          {testing ? 'Đang test...' : 'Chạy Emergency Test'}
        </Button>

        {testResults.length > 0 && (
          <div className="bg-black text-green-400 p-3 rounded text-xs font-mono max-h-48 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index}>{result}</div>
            ))}
          </div>
        )}

        {testResults.some(r => r.includes('ALL TESTS PASSED')) && (
          <Alert className="border-green-300 bg-green-100">
            <AlertDescription className="text-sm">
              ✅ <strong>Firestore hoạt động bình thường!</strong><br/>
              Bạn có thể ẩn debug tools này và sử dụng app bình thường.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}