import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthState from './hooks/useAuthState';
import CalendarPage from './components/Calendar/CalendarPage';
import LoginPage from './components/Home/LoginPage';
import ResultGamePage from './components/ResultGame/ResultGamePage';
import ResultDetailPage from './components/ResultDetail/ResultDetailPage';
import ResultStatPage from './components/ResultStat/ResultStatPage';
import ResultTournamentPage from './components/ResultTournament/ResultTournamentPage';
import GoodsPage from './components/Goods/GoodsPage';
import CourtAdminPage from './components/CourtAdmin/CourtAdminPage';
import UserAdminPage from './components/UserAdmin/UserAdminPage';
import MorePage from './components/More/MorePage';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

const App = () => {
  dayjs.locale('ko');
  const { user, loading } = useAuthState();

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
        <Route path="/admin/courts" element={ user ? <CourtAdminPage /> : <Navigate to="/" replace /> } />
        <Route path="/admin/users" element={ user ? <UserAdminPage /> : <Navigate to="/" replace /> } />
        <Route path="/more" element={ user ? <MorePage /> : <Navigate to="/" replace /> } />
        {/* <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/result/game" element={<ResultGamePage />} />
        <Route path="/result/:id" element={<ResultDetailPage />} />
        <Route path="/result/stat" element={<ResultStatPage />} />
        <Route path="/result/tournament" element={<ResultTournamentPage />} />
        <Route path="/goods" element={<GoodsPage />} />
        <Route path="/admin/courts" element={<CourtAdminPage />} />
        <Route path="/admin/users" element={<UserAdminPage />} />
        <Route path="/more" element={<MorePage />} /> */}
      </Routes>
    </Router>
  );
};

export default App;
