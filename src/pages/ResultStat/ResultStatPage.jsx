import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../api/firebaseConfig';
import { Box, Typography, Divider } from '@mui/material';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts';
import useAuthState from '../../hooks/useAuthState';
import MainLayout from '../../components/MainLayout';
import parseResult from '../../utils/parseResult';

const ResultStatPage = () => {
  const [eventStats, setEventStats] = useState({});
  const [monthStats, setMonthStats] = useState({});
  const { user } = useAuthState();

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      const q = query(collection(db, 'events'), where('type', '==', '게임'), where('uid', '==', user.uid));
      const snapshot = await getDocs(q);
      const eventData = {};
      const monthData = {};

      snapshot.forEach(doc => {
        const { result, date } = doc.data();
        if (!result || !date) return;
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
          const monthKey = date.split('-').slice(0, 2).join('-'); // YYYY-MM
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
    };

    fetchData();
  }, [user]);

  // 그래프용 데이터 변환
  const eventChartData = Object.entries(eventStats).map(([event, stats]) => ({
    event,
    ...stats,
  }));

  const monthChartData = Object.entries(monthStats).map(([month, stats]) => ({
    month,
    winRate: Number(stats.winRate.toFixed(1)),
  })).sort((a, b) => a.month.localeCompare(b.month)); // 날짜 순 정렬

  const CustomLegend = () => {
    return (
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', paddingBottom: 8 }}>
        <span><span style={{ backgroundColor: '#4caf50', width: 12, height: 12, display: 'inline-block', marginRight: 4 }}></span>승</span>
        <span><span style={{ backgroundColor: '#ff9800', width: 12, height: 12, display: 'inline-block', marginRight: 4 }}></span>무</span>
        <span><span style={{ backgroundColor: '#f44336', width: 12, height: 12, display: 'inline-block', marginRight: 4 }}></span>패</span>
      </div>
    );
  };

  return (
    <MainLayout title='게임 통계'>
      <Box p={2}>
        <Typography variant="h6" gutterBottom>📊 종목별 전적</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={eventChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="event" />
            <YAxis />
            <Tooltip />
            <Legend content={<CustomLegend />} />
            <Bar dataKey="win" fill="#4caf50" name="승" />
            <Bar dataKey="draw" fill="#ff9800" name="무" />
            <Bar dataKey="loss" fill="#f44336" name="패" />
          </BarChart>
        </ResponsiveContainer>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>📈 월별 승률</Typography>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={monthChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[0, 100]} unit="%" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="winRate" stroke="#3f51b5" name="승률" />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </MainLayout>
  );
};

export default ResultStatPage;