import MainLayout from '../MainLayout';
import CourtList from './CourtList';

export default function CourtAdminPage() {
  return (
	  <MainLayout title='🎾 테니스 코트 관리'>
		  <CourtList />
	  </MainLayout>
	);
}