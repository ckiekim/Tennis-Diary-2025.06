import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../api/firebaseConfig';
import { Box, Typography, Divider, Grid, Paper } from '@mui/material';
import MainLayout from '../MainLayout';
import dayjs from 'dayjs';
import parseResult from '../../utils/parseResult';

const ResultStatPage = () => {
  const [byEvent, setByEvent] = useState({});
  const [byMonth, setByMonth] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, 'events'));
      const eventStats = {};
      const monthStats = {};

      snapshot.forEach(doc => {
        const data = doc.data();
        if (!data.result || !data.date) return;

        const { event, win, draw, loss } = parseResult(data.result);
        const month = dayjs(data.date).format('YYYY-MM');

        // 종목별 통계 누적
        if (!eventStats[event]) eventStats[event] = { win: 0, draw: 0, loss: 0 };
        eventStats[event].win += win;
        eventStats[event].draw += draw;
        eventStats[event].loss += loss;

        // 월별 통계 누적
        if (!monthStats[month]) monthStats[month] = { win: 0, draw: 0, loss: 0 };
        monthStats[month].win += win;
        monthStats[month].draw += draw;
        monthStats[month].loss += loss;
      });

      setByEvent(eventStats);
      setByMonth(monthStats);
    };

    fetchData();
  }, []);

  const renderStats = (title, stats) => (
    <Box my={2}>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <Divider />
      <Grid container spacing={1} mt={1}>
        {Object.entries(stats).map(([key, { win, draw, loss }]) => {
          const total = win + draw + loss;
          const rate = total ? ((win + 0.5 * draw) / total * 100).toFixed(1) : '0.0';
          return (
            <Grid item xs={12} sm={6} md={4} key={key}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1">{key}</Typography>
                <Typography variant="body2">
                  전적: {win}승 {draw}무 {loss}패
                </Typography>
                <Typography variant="body2">
                  승률: {rate}%
                </Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );

  return (
    <MainLayout title='🎾 게임 통계'>
      <Box p={2}>
        {renderStats('종목별 전적 및 승률', byEvent)}
        {renderStats('월별 전적 및 승률', byMonth)}
      </Box>
    </MainLayout>
  );
};

export default ResultStatPage;