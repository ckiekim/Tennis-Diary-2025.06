import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../api/firebaseConfig';

/**
 * 특정 문서를 실시간으로 구독(listening)하는 훅입니다.
 * 문서에 변경이 생기면 자동으로 데이터를 업데이트합니다.
 * @param {string} collectionName - 컬렉션 이름
 * @param {string} docId - 문서 ID
 */
export default function useSnapshotDocument(collectionName, docId) {
  const [docData, setDocData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!collectionName || !docId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const docRef = doc(db, collectionName, docId);

    // onSnapshot으로 실시간 구독 시작
    const unsubscribe = onSnapshot(docRef, 
      (doc) => {
        if (doc.exists()) {
          setDocData({ id: doc.id, ...doc.data() });
        } else {
          setDocData(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("문서 실시간 구독 실패:", err);
        setError(err);
        setLoading(false);
      }
    );

    // 컴포넌트가 사라질 때 구독을 중지하여 메모리 누수를 방지합니다.
    return () => unsubscribe();

  }, [collectionName, docId]);

  return { docData, loading, error };
}