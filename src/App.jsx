import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import FreeStationLayout from './pages/FreeStation/components/FreeStationLayout';
import TraverseLayout from './pages/TraverseCalculation/TraverseLayout';
import styles from './App.module.css';

const { Header, Content } = Layout;

const App = () => {
  const menuItems = [
    {
      key: 'freeStation',
      label: <Link to="/free-station">自由设站解算</Link>
    },
    {
      key: 'traverse',
      label: <Link to="/traverse">导线计算</Link>
    }
  ];

  return (
    <Router>
      <Layout className={styles.layout}>
        <Header className={styles.header}>
          <Menu
            mode="horizontal"
            items={menuItems}
            className={styles.menu}
          />
        </Header>
        <Content className={styles.content}>
          <Routes>
            <Route path="/free-station" element={<FreeStationLayout />} />
            <Route path="/traverse" element={<TraverseLayout />} />
            <Route path="/" element={<FreeStationLayout />} />
          </Routes>
        </Content>
      </Layout>
    </Router>
  );
};

export default App; 