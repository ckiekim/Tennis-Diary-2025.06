import { useEffect, useState } from 'react';
import { db } from '../api/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

const useEventDates = (refreshKey = 0) => {
  const [eventDateMap, setEventDateMap] = useState({});

  useEffect(() => {
    const fetchEventDates = async () => {
      const querySnapshot = await getDocs(collection(db, 'events'));
      const countMap = {};

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.date) {
          countMap[data.date] = (countMap[data.date] || 0) + 1;
        }
      });
      setEventDateMap(countMap);
    };

    fetchEventDates();
  }, [refreshKey]);

  return eventDateMap;
};

export default useEventDates;
