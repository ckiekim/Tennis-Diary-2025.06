import { useEffect, useState } from 'react';
import { db } from '../api/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

const useSourceList = (refreshKey = 0) => {
  const [sourceList, setSourceList] = useState([]);

  useEffect(() => {
    const fetchSources = async () => {
      const snapshot = await getDocs(collection(db, 'events'));
      const sources = snapshot.docs
        .map(doc => doc.data().source)
        .filter(src => !!src);

      const uniqueSources = [...new Set(sources)];
      setSourceList(uniqueSources);
    };

    fetchSources();
  }, [refreshKey]);

  return sourceList;
};

export default useSourceList;
