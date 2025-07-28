import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../api/firebaseConfig';

const useEventDoc = (collectionName, docId, refreshKey=0) => {
  const [docData, setDocData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!collectionName || !docId) return;

    const fetchData = async () => {
      try {
        const ref = doc(db, collectionName, docId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setDocData({ id: snap.id, ...snap.data() });
        } else {
          setDocData(null);
        }
      } catch (err) {
        console.error('Firestore 읽기 오류:', err);
        setDocData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [collectionName, docId, refreshKey]);

  return { docData, loading };
};

export default useEventDoc;
