import { BrowserRouter, Routes, Route } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

import AuthGuard from './components/AuthGuard';
import AdminGuard from './components/AdminGuard';
import SchedulePage from './pages/Schedule/SchedulePage';
import LoginPage from './pages/Home/LoginPage';
import KakaoCallback from './pages/Home/KakaoCallback';
import NotFoundError from './pages/Home/NotFoundError';
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

const App = () => {
  dayjs.locale('ko');

  return (
    <BrowserRouter>
      <Routes>
        {/* 로그인이 필요 없는 페이지 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/kakao/callback" element={<KakaoCallback />} />

        {/* 로그인이 필요한 페이지들을 AuthGuard로 감싸기 */}
        <Route element={<AuthGuard />}>
          <Route path="/" element={<SchedulePage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/result/game" element={<ResultGamePage />} />
          <Route path="/result/game/:id" element={<GameDetailPage />} />
          <Route path="/result/stat" element={<ResultStatPage />} />
          <Route path="/result/tournament" element={<ResultTournamentPage />} />
          <Route path="/result/tournament/:id" element={<TournamentDetailPage />} />
          <Route path="/goods" element={<GoodsPage />} />
          <Route path="/goods/:id" element={<GoodsDetailPage />} />
          <Route path="/more/mileageInfo" element={<MileageInfoPage />} />
          <Route path="/more/appInfo" element={<AppInfoPage />} />
          <Route path="/more/agreement" element={<AgreementPage />} />
          <Route path="/more/installGuide" element={<PwaInstallGuidePage />} />
          <Route path="/setting" element={<UserSettingPage />} />
        </Route>

        {/* 관리자만 접근 가능한 페이지 */}
        <Route element={<AdminGuard />}>
          <Route path="/admin/courts" element={<CourtAdminPage />} />
          <Route path="/admin/users" element={<UserAdminPage />} />
          <Route path="/admin/user/:uid" element={<UserDetailPage />} />
        </Route>
        
        {/* 일치하는 라우트가 없을 경우 */}
        <Route path="*" element={<NotFoundError />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
