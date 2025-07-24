import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CalendarPage from './components/CalendarPage/CalendarPage';
import ResultGamePage from './components/ResultGamePage/ResultGamePage';
import ResultStatPage from './components/ResultStatPage/ResultStatPage';
import ResultTournamentPage from './components/ResultTournamentPage/ResultTournamentPage';
import GoodsPage from './components/GoodsPage/GoodsPage';
import CourtAdminPage from './components/CourtAdminPage/CourtAdminPage';
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
        <Route path="/result/stat" element={<ResultStatPage />} />
        <Route path="/result/tournament" element={<ResultTournamentPage />} />
        <Route path="/goods" element={<GoodsPage />} />
        <Route path="/admin/courts" element={<CourtAdminPage />} />
      </Routes>
    </Router>
  );
};

export default App;
