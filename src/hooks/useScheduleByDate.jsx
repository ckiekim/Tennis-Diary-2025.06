import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../api/firebaseConfig';
import dayjs from 'dayjs';

const useScheduleByDate = (selectedDate) => {
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    const fetchSchedules = async () => {
      if (!selectedDate) return;

      const formattedDate = dayjs(selectedDate).format('YYYY-MM-DD');
      const q = query(
        collection(db, 'events'),
        where('date', '==', formattedDate)
      );
      const querySnapshot = await getDocs(q);

      const result = [];
      querySnapshot.forEach((doc) => {
        result.push({ id: doc.id, ...doc.data() });
      });

      setSchedules(result);
    };

    fetchSchedules();
  }, [selectedDate]);

  return schedules;
};

export default useScheduleByDate;
