// import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthState from './hooks/useAuthState';
import useAdminCheck from './hooks/useAdminCheck';
import CalendarPage from './pages/Calendar/CalendarPage';
import LoginPage from './pages/Home/LoginPage';
import ResultGamePage from './pages/ResultGame/ResultGamePage';
import ResultDetailPage from './pages/ResultDetail/ResultDetailPage';
import ResultStatPage from './pages/ResultStat/ResultStatPage';
import ResultTournamentPage from './pages/ResultTournament/ResultTournamentPage';
import GoodsPage from './pages/Goods/GoodsPage';
import CourtAdminPage from './pages/CourtAdmin/CourtAdminPage';
import UserAdminPage from './pages/UserAdmin/UserAdminPage';
import MorePage from './pages/More/MorePage';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

const App = () => {
  dayjs.locale('ko');
  const { user, loading } = useAuthState();
  const { isAdmin } = useAdminCheck();

  // useEffect(() => {
  //   if (window.Kakao && !window.Kakao.isInitialized()) {
  //     window.Kakao.init(process.env.REACT_APP_KAKAO_JAVASCRIPT_KEY);  // 복사한 JavaScript 키
  //   }
  // }, []);

  if (loading) return <div>로딩 중...</div>; 

  return (
    <Router>
      <Routes>
        {/* 홈화면: 로그인 상태면 /calendar로 리다이렉트 */}
        <Route path="/" element={ user ? <Navigate to="/calendar" replace /> : <LoginPage /> } />
        {/* 로그인해야 접근 가능한 페이지 */}
        <Route path="/calendar" element={ user ? <CalendarPage /> : <Navigate to="/" replace /> } />
        <Route path="/result/game" element={ user ? <ResultGamePage /> : <Navigate to="/" replace /> } />
        <Route path="/result/:id" element={ user ? <ResultDetailPage /> : <Navigate to="/" replace /> } />
        <Route path="/result/stat" element={ user ? <ResultStatPage /> : <Navigate to="/" replace /> } />
        <Route path="/result/tournament" element={ user ? <ResultTournamentPage /> : <Navigate to="/" replace /> } />
        <Route path="/goods" element={ user ? <GoodsPage /> : <Navigate to="/" replace /> } />
        <Route path="/more" element={ user ? <MorePage /> : <Navigate to="/" replace /> } />
        {/* 관리자만 접근 가능한 페이지 */}
        <Route path="/admin/courts" element={ isAdmin ? <CourtAdminPage /> : <Navigate to="/" replace /> } />
        <Route path="/admin/users" element={ isAdmin ? <UserAdminPage /> : <Navigate to="/" replace /> } />
      </Routes>
    </Router>
  );
};

export default App;
