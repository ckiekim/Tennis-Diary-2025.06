import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import useResultsWithPhoto from '../../hooks/useResultsWithPhoto';
import MainLayout from '../../components/MainLayout';
import GameCard from './GameCard';

const ResultGamePage = () => {
  const results = useResultsWithPhoto();

  return (
    <MainLayout title='게임 결과'>
      { !results || results.length === 0 ? (
        <Box textAlign="center" mt={4}>
          <Typography>게임 결과가 없습니다.</Typography>
        </Box>
      ) : (
        <Stack spacing={1}>
          {results.map(item => 
            <GameCard key={item.id} item={item} />
          )}
        </Stack>
      )}
    </MainLayout>
  );

};

export default ResultGamePage;