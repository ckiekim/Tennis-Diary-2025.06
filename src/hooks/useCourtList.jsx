import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../api/firebaseConfig';

const useCourtList = (refreshKey = 0) => {
  const [courts, setCourts] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const snapshot = await getDocs(collection(db, 'court'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => a.name.localeCompare(b.name));
      setCourts(data);
    };
    fetch();
  }, [refreshKey]);

  return courts;
};

export default useCourtList;
