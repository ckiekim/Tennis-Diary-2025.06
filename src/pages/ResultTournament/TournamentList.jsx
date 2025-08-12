import { Stack } from '@mui/material';
import useTournaments from '../../hooks/useTournaments'; // 대회 데이터를 가져오는 커스텀 훅 (생성 필요)
import TournamentCard from './TournamentCard';

export default function TournamentList() {
  // 'type'이 '대회'인 데이터를 필터링하는 로직이 포함된 커스텀 훅을 사용해야 합니다.
  const tournaments = useTournaments();

  return (
    <Stack spacing={1}>
      {tournaments.map(item => 
        <TournamentCard key={item.id} item={item} />
      )}
    </Stack>
  );
}