import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { db } from '../api/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import dayjs from 'dayjs';

const useScheduleByDate = (selectedDate, refreshKey = 0) => {
  const [schedules, setSchedules] = useState([]);
  const auth = getAuth();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setSchedules([]);
      return;
    }

    const fetchSchedules = async () => {
      if (!selectedDate) return;

      const formattedDate = dayjs(selectedDate).format('YYYY-MM-DD');
      const q = query(
        collection(db, 'events'),
        where('uid', '==', user.uid),
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
  }, [auth.currentUser, selectedDate, refreshKey]);

  return schedules;
};

export default useScheduleByDate;
