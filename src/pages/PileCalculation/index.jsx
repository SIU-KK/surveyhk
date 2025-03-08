import React, { useState } from 'react';
import { Layout, Menu, Drawer, Button, Tabs } from 'antd';
import { HomeOutlined, CompassOutlined, CalculatorOutlined, AimOutlined, RadiusSettingOutlined, ToolOutlined, MonitorOutlined, MenuOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PileLayout from './components/PileLayout';
import FirstPileCheck from './components/FirstPileCheck';
import SecondPileCheck from './components/SecondPileCheck';
import LastPileCheck from './components/LastPileCheck';
import FirstPileCheckPro from './components/FirstPileCheckPro';
import styles from './index.module.css';

const { Content } = Layout;
const { TabPane } = Tabs;

const PileCalculation = () => {
  const navigate = useNavigate();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: '返回主頁',
      onClick: () => navigate('/')
    },
    {
      key: 'survey-station',
      icon: <CompassOutlined />,
      label: '香港測量控制站查詢',
      onClick: () => navigate('/survey-station')
    },
    {
      key: 'free-station',
      icon: <CalculatorOutlined />,
      label: '自由設站解算',
      onClick: () => navigate('/free-station')
    },
    {
      key: 'traverse-calculation',
      icon: <AimOutlined />,
      label: '導線計算',
      onClick: () => navigate('/traverse-calculation')
    },
    {
      key: 'construction-layout',
      icon: <RadiusSettingOutlined />,
      label: '施工放樣',
      onClick: () => navigate('/construction-layout')
    },
    {
      key: 'pile-calculation',
      icon: <CalculatorOutlined />,
      label: '樁計算'
    },
    {
      key: 'batch-calculation',
      icon: <RadiusSettingOutlined />,
      label: '批量計算及轉換',
      onClick: () => navigate('/batch-calculation')
    },
    {
      key: 'tools',
      icon: <ToolOutlined />,
      label: '實用工具',
      onClick: () => navigate('/tools')
    },
    {
      key: 'settlement-monitoring',
      icon: <MonitorOutlined />,
      label: '沉降監測系統',
      onClick: () => navigate('/settlement-monitoring')
    }
  ];

  const handleMenuClick = ({ key }) => {
    navigate(`/${key}`);
    setDrawerVisible(false);
  };

  return (
    <Layout className={styles.container}>
      <Layout.Header className={styles.header}>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={['pile-calculation']}
          className={styles.menu}
          onClick={handleMenuClick}
        >
          {menuItems.map(item => (
            <Menu.Item key={item.key} icon={item.icon}>
              {item.label}
            </Menu.Item>
          ))}
        </Menu>
      </Layout.Header>

      {/* 移動端頂部導航 */}
      <div className={styles.mobileHeader}>
        <Button 
          type="text" 
          icon={<MenuOutlined />} 
          onClick={() => setDrawerVisible(true)}
          className={styles.menuButton}
        />
        <div className={styles.headerTitle}>樁計算</div>
        <div style={{ width: 32 }}></div>
      </div>

      {/* 移動端側邊抽屉菜單 */}
      <Drawer
        title="菜單"
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={280}
      >
        <Menu
          mode="vertical"
          selectedKeys={['pile-calculation']}
          onClick={handleMenuClick}
          style={{ border: 'none' }}
        >
          {menuItems.map(item => (
            <Menu.Item key={item.key} icon={item.icon}>
              {item.label}
            </Menu.Item>
          ))}
        </Menu>
      </Drawer>
      
      <Content className={styles.content}>
        <div className={styles.pageContainer}>
          <Tabs defaultActiveKey="pileLayout" className={styles.tabs}>
            <TabPane tab="樁放樣" key="pileLayout">
              <PileLayout />
            </TabPane>
            <TabPane tab="首樁檢測(簡易版)" key="firstPileCheck">
              <FirstPileCheck />
            </TabPane>
            <TabPane tab="首樁檢測(專業版)" key="firstPileCheckPro">
              <FirstPileCheckPro />
            </TabPane>
            <TabPane tab="中間樁檢測" key="secondPileCheck">
              <SecondPileCheck />
            </TabPane>
            <TabPane tab="尾樁檢測" key="lastPileCheck">
              <LastPileCheck />
            </TabPane>
          </Tabs>
        </div>
      </Content>
    </Layout>
  );
};

export default PileCalculation; 