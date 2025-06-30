import { useEffect, useState } from 'react';
import { db } from '../api/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

const useEventDates = (refreshKey = 0) => {
  const [eventDates, setEventDates] = useState([]);

  useEffect(() => {
    const fetchEventDates = async () => {
      const querySnapshot = await getDocs(collection(db, 'events'));
      const dates = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.date) {
          dates.push(data.date);
        }
      });
      setEventDates(dates);
    };

    fetchEventDates();
  }, [refreshKey]);

  return eventDates;
};

export default useEventDates;
