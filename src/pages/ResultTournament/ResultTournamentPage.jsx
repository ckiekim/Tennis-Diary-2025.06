import MainLayout from '../../components/MainLayout';
import TournamentList from './TournamentList';

const ResultTournamentPage = () => {
  return (
    <MainLayout title='대회 결과'>
      <TournamentList />
    </MainLayout>
  );
};

export default ResultTournamentPage;