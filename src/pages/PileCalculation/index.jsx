import React, { useState } from 'react';
import { Layout, Menu, Drawer, Button, Tabs } from 'antd';
import { HomeOutlined, CompassOutlined, CalculatorOutlined, AimOutlined, RadiusSettingOutlined, ToolOutlined, MonitorOutlined, MenuOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PileLayout from './components/PileLayout';
import FirstPileCheck from './components/FirstPileCheck';
import SecondPileCheck from './components/SecondPileCheck';
import LastPileCheck from './components/LastPileCheck';
import PileCalculationLayout from './components/PileCalculationLayout';
import styles from './components/PileCalculationLayout.module.css';

const { Content, Header } = Layout;
const { TabPane } = Tabs;

const PileCalculation = () => {
  const navigate = useNavigate();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: '返回主页',
      onClick: () => navigate('/')
    },
    {
      key: 'survey-station',
      icon: <CompassOutlined />,
      label: '香港测量控制站查询',
      onClick: () => navigate('/survey-station')
    },
    {
      key: 'free-station',
      icon: <CalculatorOutlined />,
      label: '自由设站解算',
      onClick: () => navigate('/free-station')
    },
    {
      key: 'traverse-calculation',
      icon: <AimOutlined />,
      label: '导线计算',
      onClick: () => navigate('/traverse-calculation')
    },
    {
      key: 'construction-layout',
      icon: <RadiusSettingOutlined />,
      label: '施工放样',
      onClick: () => navigate('/construction-layout')
    },
    {
      key: 'batch-calculation',
      icon: <RadiusSettingOutlined />,
      label: '批量计算及转换',
      onClick: () => navigate('/batch-calculation')
    },
    {
      key: 'pile-calculation',
      icon: <CalculatorOutlined />,
      label: '桩计算',
    },
    {
      key: 'tools',
      icon: <ToolOutlined />,
      label: '实用工具',
      onClick: () => navigate('/tools')
    },
    {
      key: 'settlement-monitoring',
      icon: <MonitorOutlined />,
      label: '沉降监测系统',
      onClick: () => navigate('/settlement-monitoring')
    }
  ];

  return (
    <Layout className={styles.container}>
      <Header className={styles.header}>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={['pile-calculation']}
          className={styles.menu}
        >
          {menuItems.map(item => (
            <Menu.Item key={item.key} icon={item.icon} onClick={item.onClick}>
              {item.label}
            </Menu.Item>
          ))}
        </Menu>
      </Header>
      
      <div className={styles.mobileHeader}>
        <Button 
          type="text" 
          icon={<MenuOutlined />} 
          onClick={() => setDrawerVisible(true)}
          className={styles.menuButton}
        />
        <div className={styles.headerTitle}>桩计算</div>
        <div style={{ width: 32 }}></div>
      </div>
      
      <Drawer
        title="菜单"
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        bodyStyle={{ padding: 0 }}
      >
        <Menu
          mode="vertical"
          selectedKeys={['pile-calculation']}
          theme="light"
          style={{ border: 'none' }}
        >
          {menuItems.map(item => (
            <Menu.Item key={item.key} icon={item.icon} onClick={item.onClick}>
              {item.label}
            </Menu.Item>
          ))}
        </Menu>
      </Drawer>
      
      <Content className={styles.content}>
        <div className={styles.pageContainer}>
          <Tabs defaultActiveKey="pileLayout" className={styles.tabs}>
            <TabPane tab="桩放样" key="pileLayout">
              <PileLayout />
            </TabPane>
            <TabPane tab="头桩检查" key="firstPileCheck">
              <FirstPileCheck />
            </TabPane>
            <TabPane tab="二桩检查" key="secondPileCheck">
              <SecondPileCheck />
            </TabPane>
            <TabPane tab="尾桩检查" key="lastPileCheck">
              <LastPileCheck />
            </TabPane>
            <TabPane tab="材料计算" key="materialCalculation">
              <div className={styles.customComponent}>
                <PileCalculationLayout />
              </div>
            </TabPane>
          </Tabs>
        </div>
      </Content>
    </Layout>
  );
};

export default PileCalculation; 