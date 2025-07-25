import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CalendarPage from './components/Calendar/CalendarPage';
import ResultGamePage from './components/ResultGame/ResultGamePage';
import ResultDetailPage from './components/ResultGame/ResultDetailPage';
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

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/calendar" />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/result/game" element={<ResultGamePage />} />
        <Route path="/result/:id" element={<ResultDetailPage />} />
        <Route path="/result/stat" element={<ResultStatPage />} />
        <Route path="/result/tournament" element={<ResultTournamentPage />} />
        <Route path="/goods" element={<GoodsPage />} />
        <Route path="/admin/courts" element={<CourtAdminPage />} />
        <Route path="/admin/users" element={<UserAdminPage />} />
        <Route path="/more" element={<MorePage />} />
      </Routes>
    </Router>
  );
};

export default App;
