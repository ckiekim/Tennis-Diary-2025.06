import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../api/firebaseConfig'; 

const holidayCache = new Map(); // 연도별 캐시

const useHolidays = (year) => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHolidaysFromFirestore = async () => {
      if (holidayCache.has(year)) {
        setHolidays(holidayCache.get(year));
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const docRef = doc(db, 'holidays', String(year));
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const holidayData = docSnap.data().items || [];
          holidayCache.set(year, holidayData);
          setHolidays(holidayData);
        } else {
          console.log(`No holiday data found for year: ${year}`);
          setHolidays([]); // 데이터가 없는 경우 빈 배열로 설정
        }
      } catch (err) {
        console.error("Firestore에서 공휴일 정보 조회 실패:", err);
        setError("공휴일 정보를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchHolidaysFromFirestore();
  }, [year]);

  return { holidays, loading, error };
};

export default useHolidays;