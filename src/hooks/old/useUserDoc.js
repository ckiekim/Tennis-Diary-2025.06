import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../api/firebaseConfig';

const useUserDoc = (uid, refreshKey = 0) => {
  const [docData, setDocData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const docRef = doc(db, 'users', uid);

    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setDocData({ uid: snapshot.id, ...snapshot.data() });
      } else {
        setDocData(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching document:", error);
      setDocData(null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [uid, refreshKey]);

  return { docData, loading };
};

export default useUserDoc;
