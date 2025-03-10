import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "antd";
import CalendarComponent from "./calendar/calendar";
import Dashboard from "./calendar/dashboard/dashboard";
import Login from "./components/login/login"; // You'll need to create this component

const { Content } = Layout;

function App() {
  return (
    <Router>
      <Layout>
        <Content>
          <Routes>
            <Route path="/" element={<CalendarComponent />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </Content>
      </Layout>
    </Router>
  );
}

export default App;
