import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CalendarPage from './pages/CalendarPage';
import ResultPage from './pages/ResultPage';
import StatPage from './pages/StatPage';
import './CalendarOverride.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/calendar" />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/stat" element={<StatPage />} />
      </Routes>
    </Router>
  );
};

export default App;
