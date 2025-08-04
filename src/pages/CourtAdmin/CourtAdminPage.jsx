import MainLayout from '../../components/MainLayout';
import CourtList from './CourtList';

export default function CourtAdminPage() {
  return (
	  <MainLayout title='코트 관리'>
		  <CourtList />
	  </MainLayout>
	);
}