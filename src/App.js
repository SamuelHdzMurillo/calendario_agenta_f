

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import CalendarComponent from './calendar/calendar';
import Dashboard from './calendar/dashboard/dashboard';

const { Header, Content } = Layout;

function App() {
  return (
    <Router>
      <Layout>
        <Header>
          <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']}>
            <Menu.Item key="1">
              <Link to="/">Calendar</Link>
            </Menu.Item>
            <Menu.Item key="2">
              <Link to="/dashboard">Dashboard</Link>
            </Menu.Item>
          </Menu>
        </Header>
        <Content style={{ padding: '0 50px', marginTop: 20 }}>
          <Routes>
            <Route path="/" element={<CalendarComponent />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </Content>
      </Layout>
    </Router>
  );
}

export default App;
