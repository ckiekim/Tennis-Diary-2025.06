import { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

const API_ENDPOINT = 'https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo';
const API_KEY = process.env.REACT_APP_HOLIDAY_API_KEY; 

// API 응답 데이터를 캐시하여 중복 요청을 방지합니다.
const holidayCache = new Map();

const useHolidays = (year, month) => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHolidays = async () => {
      // 📌 dayjs 월은 0부터 시작하므로 +1 해줍니다.
      const formattedMonth = (month + 1).toString().padStart(2, '0');
      const cacheKey = `${year}-${formattedMonth}`;

      if (holidayCache.has(cacheKey)) {
        setHolidays(holidayCache.get(cacheKey));
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data } = await axios.get(API_ENDPOINT, {
          params: {
            solYear: year,
            solMonth: formattedMonth,
            ServiceKey: decodeURIComponent(API_KEY),
            _type: 'json',
          },
        });
        // console.log('API 응답 데이터:', JSON.stringify(data, null, 2));
        
        const items = data?.response?.body?.items?.item || [];
        // API 결과가 단일 객체일 수 있으므로 배열로 변환합니다.
        const holidayData = Array.isArray(items) ? items : [items]; 
        
        const holidayMap = holidayData.map(item => ({
          date: dayjs(item.locdate.toString()).format('YYYY-MM-DD'),
          name: item.dateName,
        }));

        holidayCache.set(cacheKey, holidayMap);
        setHolidays(holidayMap);
      } catch (err) {
        console.error("공휴일 정보 조회 실패:", err);
        setError("공휴일 정보를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchHolidays();
  }, [year, month]);

  return { holidays, loading, error };
};

export default useHolidays;