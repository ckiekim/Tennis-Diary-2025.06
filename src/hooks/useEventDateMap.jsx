import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { db } from '../api/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';

const useEventDateMap = (refreshKey = 0) => {
  const [eventDateMap, setEventDateMap] = useState({});
  const auth = getAuth();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setEventDateMap({});
      return;
    }

    const fetchEventDates = async () => {
      const q = query(collection(db, 'events'), where('uid', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const map = {};

      querySnapshot.forEach((doc) => {
        const event = doc.data();
        if (event.date) {
          if (!map[event.date])
            map[event.date] = [];
          map[event.date].push(event.type);
        }
      });
      setEventDateMap(map);
    };

    fetchEventDates();
  }, [auth.currentUser, refreshKey]);

  return eventDateMap;
};

export default useEventDateMap;