import React from 'react';
import { Box, CircularProgress, Divider, Typography } from '@mui/material';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts';
import useAuthState from '../../hooks/useAuthState';
import MainLayout from '../../components/MainLayout';
import useResultStats from '../../hooks/useResultStats';

const ResultStatPage = () => {
  const { user } = useAuthState();
  const { eventStats, monthStats, loading } = useResultStats(user?.uid);

  if (loading) {
    return (
      <MainLayout title='게임 통계'>
        <Box p={2} display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
          <Typography ml={2}>통계 데이터를 불러오는 중입니다...</Typography>
        </Box>
      </MainLayout>
    );
  }

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