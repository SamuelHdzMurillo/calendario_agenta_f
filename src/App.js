

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/login/login';
import Calendar from './calendar/calendar';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/" element={<Navigate to="/calendar" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
