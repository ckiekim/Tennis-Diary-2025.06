import { Stack } from '@mui/material';
import useResultsWithPhoto from '../../hooks/useResultsWithPhoto';
import ResultCard from './ResultCard';

export default function ResultList() {
  const results = useResultsWithPhoto();

  return (
    <Stack spacing={1}>
      {results.map(item => 
        <ResultCard key={item.id} item={item} />
      )}
    </Stack>
  );
}