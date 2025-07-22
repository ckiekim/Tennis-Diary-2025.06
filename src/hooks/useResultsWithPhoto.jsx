import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../api/firebaseConfig';

export default function useResultsWithPhoto() {
  const [list, setList] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const [evSnap, courtSnap] = await Promise.all([
        getDocs(collection(db, 'events')),
        getDocs(collection(db, 'courts')),
      ]);
      const courtMap = {};
      courtSnap.forEach(d => {
        const { name, photo } = d.data();
        courtMap[name] = photo || '';
      });
      const results = [];
      evSnap.forEach(d => {
        const data = d.data();
        if (data.result) {
          results.push({
            id: d.id,
            ...data,
            photo: courtMap[data.place] || '',
          });
        }
      });
      results.sort((a, b) => (a.date < b.date ? 1 : -1));
      setList(results);
    };
    fetch();
  }, []);
  return list;
}
