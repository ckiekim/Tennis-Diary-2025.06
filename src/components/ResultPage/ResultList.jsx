import { Stack, Typography, } from '@mui/material';
import useResultsWithPhoto from '../../hooks/useResultsWithPhoto';
import ResultCard from './ResultCard';

export default function ResultList() {
  const results = useResultsWithPhoto();

  return (
    <>
      <Typography variant="h5" sx={{ textAlign: 'center', mb: 2 }}>
        🎾 테니스 다이어리
      </Typography>

      <Stack spacing={1}>
        {results.map(item => <ResultCard key={item.id} item={item} />)}
      </Stack>
    </>
  );
}