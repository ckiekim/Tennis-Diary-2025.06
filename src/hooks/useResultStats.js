import { useEffect, useState } from 'react';
import { collection, collectionGroup, getDocs, query, where } from 'firebase/firestore';
import { db } from '../api/firebaseConfig';
import parseResult from '../utils/parseResult';

const useResultStats = (uid) => {
  const [eventStats, setEventStats] = useState({});
  const [monthStats, setMonthStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }
    
    const fetchData = async () => {
      setLoading(true);
      try {
        // 단계 1: 사용자가 '참여한' 모든 '게임'과 '정모' 이벤트를 가져와 Map으로 만듦
        const eventsQuery = query(
          collection(db, 'events'), 
          where('type', 'in', ['게임', '정모']), // '게임'과 '정모' 모두 포함
          where('participantUids', 'array-contains', uid) // 내가 참여한 모든 일정
        );
        
        const eventsSnapshot = await getDocs(eventsQuery);
        const eventsMap = new Map();
        eventsSnapshot.forEach(doc => {
          eventsMap.set(doc.id, doc.data());
        });

        // 단계 2: 컬렉션 그룹 쿼리로 사용자의 모든 event_results를 한 번에 가져오
        const resultsQuery = query(collectionGroup(db, 'event_results'), where('uid', '==', uid));
        const resultsSnapshot = await getDocs(resultsQuery);

        const eventData = {};
        const monthData = {};

        // 단계 3: 가져온 결과들을 순회하며 통계를 집계
        resultsSnapshot.forEach(doc => {
          const resultDocData = doc.data();
          const parentEvent = eventsMap.get(resultDocData.eventId);
          
          // eventsMap에 해당 이벤트가 없으면(내가 참여하지 않았거나, 타입이 게임/정모가 아니면) 건너뜀
          if (!parentEvent || !parentEvent.date) return;
          
          const { result } = resultDocData;
          const { date } = parentEvent;

          if (!result) return;
          const parsedResults = parseResult(result);

          parsedResults.forEach(parsed => {
            const { eventType, win, draw, loss } = parsed;

            // 종목별 통계
            if (!eventData[eventType]) {
              eventData[eventType] = { win: 0, draw: 0, loss: 0 };
            }
            eventData[eventType].win += win;
            eventData[eventType].draw += draw;
            eventData[eventType].loss += loss;

            // 월별 통계
            const monthKey = date.split('-').slice(0, 2).join('-');
            if (!monthData[monthKey]) {
              monthData[monthKey] = { win: 0, draw: 0, loss: 0 };
            }
            monthData[monthKey].win += win;
            monthData[monthKey].draw += draw;
            monthData[monthKey].loss += loss;
          });
        });

        // 승률 계산
        const processedMonthData = {};
        for (const [month, { win, draw, loss }] of Object.entries(monthData)) {
          const total = win + draw + loss;
          processedMonthData[month] = {
            win, draw, loss,
            winRate: total > 0 ? (win / total) * 100 : 0,
          };
        }

        setEventStats(eventData);
        setMonthStats(processedMonthData);

      } catch (error) {
        console.error("Failed to fetch result stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [uid]);

  return { eventStats, monthStats, loading };
};

export default useResultStats;