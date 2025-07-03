import React from 'react';
import { Box, Stack, Typography, } from '@mui/material';
import useResultsWithPhoto from '../../hooks/useResultsWithPhoto';
import BottomNav from '../BottomNav';
import ResultCard from './ResultCard';

const ResultPage = () => {
  const results = useResultsWithPhoto();

  return (
    <>
      <Box sx={{ padding: 2, paddingBottom: '80px' }}>
        <Typography variant="h5" sx={{ textAlign: 'center', mb: 2 }}>
          🎾 테니스 다이어리
        </Typography>

        <Stack spacing={2}>
          {results.map(item => <ResultCard key={item.id} item={item} />)}
        </Stack>
      </Box>
      <BottomNav />
    </>
  );
};

export default ResultPage;