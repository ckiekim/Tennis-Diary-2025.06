import { useState, useEffect } from 'react';
import { auth, db } from '../api/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default function useResultsWithPhoto(refreshKey = 0) {
  const [list, setList] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setList([]);
      return;
    }

    const fetch = async () => {
      const [evSnap, courtSnap] = await Promise.all([
        getDocs(query(collection(db, 'events'), where('uid', '==', user.uid))),
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
  }, [refreshKey]);

  return list;
}
