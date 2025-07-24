import { Typography } from '@mui/material';
import MainLayout from '../MainLayout';

const ResultTournamentPage = () => {
  return (
    <MainLayout title='🎾 테니스 대회 결과'>
      <Typography marginTop={10} variant="body1" color="text.secondary">
        대회 결과 페이지는 추후 확정 예정입니다.
      </Typography>
    </MainLayout>
  );
};

export default ResultTournamentPage;