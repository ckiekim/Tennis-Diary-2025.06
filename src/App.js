import { BrowserRouter, Routes, Route } from 'react-router-dom';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import 'dayjs/locale/ko';

import AuthGuard from './components/AuthGuard';
import AdminGuard from './components/AdminGuard';
import SchedulePage from './pages/Schedule/SchedulePage';
import LoginPage from './pages/Home/LoginPage';
import KakaoCallback from './pages/Home/KakaoCallback';
import NotFoundError from './pages/Home/NotFoundError';
import ClubGuidePage from './pages/Guide/ClubGuidePage';
import ResultGamePage from './pages/ResultGame/ResultGamePage';
import GameDetailPage from './pages/ResultGame/GameDetailPage';
import ResultStatPage from './pages/ResultStat/ResultStatPage';
import ResultTournamentPage from './pages/ResultTournament/ResultTournamentPage';
import TournamentDetailPage from './pages/ResultTournament/TournamentDetailPage';
import GoodsPage from './pages/Goods/GoodsPage';
import GoodsDetailPage from './pages/Goods/GoodsDetailPage';
import CourtAdminPage from './pages/CourtAdmin/CourtAdminPage';
import UserAdminPage from './pages/UserAdmin/UserAdminPage';
import UserDetailPage from './pages/UserAdmin/UserDetailPage';
import UserSettingPage from './pages/UserSetting/UserSettingPage';
import MileageInfoPage from './pages/More/MileageInfoPage';
import AppInfoPage from './pages/More/AppInfoPage';
import AgreementPage from './pages/More/AgreementPage';
import PwaInstallGuidePage from './pages/More/PwaInstallGuidePage';
import AdvertisementPage from './pages/More/AdvertisementPage';
import ClubsPage from './pages/Clubs/ClubsPage';
import ClubDetailPage from './pages/Clubs/ClubDetailPage';
import PostDetailPage from './pages/Clubs/PostDetailPage';
import ExpensePage from './pages/Expense/ExpensePage';
import MeritPage from './pages/Guide/MeritPage';
import InstallGuidePage from './pages/Guide/InstallGuidePage';
import ProfileGuidePage from './pages/Guide/ProfileGuidePage';
import ScheduleGuidePage from './pages/Guide/ScheduleGuidePage';
import ResultGuidePage from './pages/Guide/ResultGuidePage';
import GoodsGuidePage from './pages/Guide/GoodsGuidePage';
import ExpenseGuidePage from './pages/Guide/ExpenseGuidePage';

const App = () => {
  dayjs.extend(isSameOrAfter);
  dayjs.locale('ko');

  return (
    <BrowserRouter>
      <Routes>
        {/* 로그인이 필요 없는 페이지 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/kakao/callback" element={<KakaoCallback />} />
        <Route path="/guide/merit" element={<MeritPage />} />
        <Route path="/guide/1" element={<InstallGuidePage />} />
        <Route path="/guide/2" element={<ProfileGuidePage />} />
        <Route path="/guide/3" element={<ScheduleGuidePage />} />
        <Route path="/guide/4" element={<ResultGuidePage />} />
        <Route path="/guide/5" element={<ClubGuidePage />} />
        <Route path="/guide/6" element={<GoodsGuidePage />} />
        <Route path="/guide/7" element={<ExpenseGuidePage />} />

        {/* 로그인이 필요한 페이지들을 AuthGuard로 감싸기 */}
        <Route element={<AuthGuard />}>
          <Route path="/" element={<SchedulePage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/result/game" element={<ResultGamePage />} />
          <Route path="/result/game/:id" element={<GameDetailPage />} />
          <Route path="/result/stat" element={<ResultStatPage />} />
          <Route path="/result/tournament" element={<ResultTournamentPage />} />
          <Route path="/result/tournament/:id" element={<TournamentDetailPage />} />
          <Route path="/tools/goods" element={<GoodsPage />} />
          <Route path="/tools/goods/:id" element={<GoodsDetailPage />} />
          <Route path="/tools/expense" element={<ExpensePage />} />
          <Route path="/more/advertise" element={<AdvertisementPage />} />
          <Route path="/more/mileageInfo" element={<MileageInfoPage />} />
          <Route path="/more/appInfo" element={<AppInfoPage />} />
          <Route path="/more/agreement" element={<AgreementPage />} />
          <Route path="/more/installGuide" element={<PwaInstallGuidePage />} />
          <Route path="/clubs" element={<ClubsPage />} />
          <Route path="/clubs/:clubId" element={<ClubDetailPage />} />
          <Route path="/clubs/:clubId/posts/:postId" element={<PostDetailPage />} />
          <Route path="/setting" element={<UserSettingPage />} />
        </Route>

        {/* 관리자만 접근 가능한 페이지 */}
        <Route element={<AdminGuard />}>
          <Route path="/tools/courts" element={<CourtAdminPage />} />
          <Route path="/tools/users" element={<UserAdminPage />} />
          <Route path="/tools/user/:uid" element={<UserDetailPage />} />
        </Route>
        
        {/* 일치하는 라우트가 없을 경우 */}
        <Route path="*" element={<NotFoundError />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
