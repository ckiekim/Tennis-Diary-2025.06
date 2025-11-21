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
  const eventChartData = Object.entries(eventStats).map(([event, stats]) => {
    const total = (stats.win || 0) + (stats.loss || 0);
    const winRate = total > 0 ? ((stats.win / total) * 100) : 0;
    return {
      event,
      ...stats,
      winRate: Number(winRate.toFixed(1)), // 승률을 소수점 한 자리까지 계산
    };
  });

  const monthChartData = Object.entries(monthStats).map(([month, stats]) => ({
    month,
    winRate: Number(stats.winRate.toFixed(1)),
  })).sort((a, b) => a.month.localeCompare(b.month)); // 날짜 순 정렬

  // 종목별 전적의 전체 승률을 계산
  const totalWin = Object.values(eventStats).reduce((acc, curr) => acc + (curr.win || 0), 0);
  // const totalDraw = Object.values(eventStats).reduce((acc, curr) => acc + (curr.draw || 0), 0);
  const totalLoss = Object.values(eventStats).reduce((acc, curr) => acc + (curr.loss || 0), 0);
  const totalGames = totalWin + totalLoss;
  const overallWinRate = totalGames > 0 ? ((totalWin / totalGames) * 100).toFixed(1) : '0.0';

  const CustomLegend = () => {
    return (
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', paddingBottom: 8 }}>
        <span><span style={{ backgroundColor: '#4caf50', width: 12, height: 12, display: 'inline-block', marginRight: 4 }}></span>승</span>
        <span><span style={{ backgroundColor: '#ff9800', width: 12, height: 12, display: 'inline-block', marginRight: 4 }}></span>무</span>
        <span><span style={{ backgroundColor: '#f44336', width: 12, height: 12, display: 'inline-block', marginRight: 4 }}></span>패</span>
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        <span>승률: {overallWinRate}%</span>
      </div>
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // payload[0].payload는 해당 종목의 모든 데이터(win, draw, loss, winRate)를 포함합니다.
      const data = payload[0].payload; 
      
      return (
        <Box sx={{ 
          p: 1, 
          border: '1px solid #ccc', 
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '4px'
        }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{label}</Typography>
          <Typography color="#4caf50">승: {data.win || 0}</Typography>
          <Typography color="#ff9800">무: {data.draw || 0}</Typography>
          <Typography color="#f44336">패: {data.loss || 0}</Typography>
          <Divider sx={{ my: 0.5 }} />
          <Typography variant="subtitle2">승률: {data.winRate}%</Typography>
        </Box>
      );
    }

    return null;
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
            <Tooltip content={<CustomTooltip />} />
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