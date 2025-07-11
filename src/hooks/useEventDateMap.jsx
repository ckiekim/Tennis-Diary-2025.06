import { useEffect, useState } from 'react';
import { db } from '../api/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

const useEventDateMap = (refreshKey = 0) => {
  const [eventDateMap, setEventDateMap] = useState({});

  useEffect(() => {
    const fetchEventDates = async () => {
      const querySnapshot = await getDocs(collection(db, 'events'));
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
  }, [refreshKey]);

  return eventDateMap;
};

export default useEventDateMap;