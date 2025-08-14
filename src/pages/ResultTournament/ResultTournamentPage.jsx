import { Stack } from '@mui/material';
import MainLayout from '../../components/MainLayout';
import useTournaments from '../../hooks/useTournaments'; // 대회 데이터를 가져오는 커스텀 훅 (생성 필요)
import TournamentCard from './TournamentCard';

const ResultTournamentPage = () => {
  const tournaments = useTournaments();

  return (
    <MainLayout title='대회 결과'>
      <Stack spacing={1}>
        {tournaments.map(item => 
          <TournamentCard key={item.id} item={item} />
        )}
      </Stack>
    </MainLayout>
  );
};

export default ResultTournamentPage;