import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../api/firebaseConfig';
import dayjs from 'dayjs';

export default function useMonthlyExpenses(uid) {
  const [monthlyData, setMonthlyData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!uid) return;

      const oneYearAgo = dayjs().subtract(1, 'year').format('YYYY-MM-DD');

      const eventsQuery = query(
        collection(db, 'events'),
        where('participantUids', 'array-contains', uid),
        where('date', '>=', oneYearAgo)
      );
      const goodsQuery = query(
        collection(db, 'goods'),
        where('uid', '==', uid),
        where('date', '>=', oneYearAgo)
      );

      const [eventsSnapshot, goodsSnapshot] = await Promise.all([
        getDocs(eventsQuery),
        getDocs(goodsQuery),
      ]);

      const allExpenses = [];
      eventsSnapshot.forEach(doc => allExpenses.push(doc.data()));
      goodsSnapshot.forEach(doc => allExpenses.push({ ...doc.data(), type: '용품' }));

      // --- 🚀 데이터 가공 로직 (핵심 수정) ---
      const processedData = {};
      const processedRecurringIds = new Set(); // 처리된 recurringId 기록 (중복 방지)
      const recurringIdFirstDate = {}; // 각 recurringId의 첫 등장 날짜 기록

      // 1. (사전 처리) 모든 반복 일정의 첫 등장 날짜를 찾습니다.
      allExpenses.forEach(expense => {
        if (expense.recurringId) {
          const currentFirstDate = recurringIdFirstDate[expense.recurringId];
          if (!currentFirstDate || dayjs(expense.date).isBefore(currentFirstDate)) {
            recurringIdFirstDate[expense.recurringId] = dayjs(expense.date);
          }
        }
      });

      // 2. 비용을 월별로 집계합니다.
      allExpenses.forEach(expense => {
        const price = parseInt(expense.price, 10) || 0;
        if (!price || !expense.date) return;
        
        const type = expense.type;
        const recurringId = expense.recurringId;

        // '레슨' 또는 '정모'이면서 recurringId가 있는 경우
        if ((type === '레슨' || type === '정모') && recurringId) {
          // 아직 처리되지 않은 recurringId일 때만 비용을 추가합니다.
          if (!processedRecurringIds.has(recurringId)) {
            const firstDate = recurringIdFirstDate[recurringId];
            const monthKey = firstDate.format('YYYY년 M월');

            if (!processedData[monthKey]) {
              processedData[monthKey] = { '게임': 0, '레슨': 0, '정모': 0, '용품': 0, '대회': 0 };
            }
            processedData[monthKey][type] += price;
            
            processedRecurringIds.add(recurringId); // 처리 완료로 기록
          }
        } 
        // 그 외 '게임', '용품', '대회' 등 일회성 비용
        else {
          const expenseDate = dayjs(expense.date);
          const monthKey = expenseDate.format('YYYY년 M월');

          if (!processedData[monthKey]) {
            processedData[monthKey] = { '게임': 0, '레슨': 0, '정모': 0, '용품': 0, '대회': 0 };
          }
          if (processedData[monthKey][type] !== undefined) {
            processedData[monthKey][type] += price;
          }
        }
      });

      setMonthlyData(processedData);
      setLoading(false);
    };

    fetchExpenses();
  }, [uid]);

  return { monthlyData, loading };
}