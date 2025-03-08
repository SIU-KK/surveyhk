import React, { useState } from 'react';
import styles from './SettlementLayout.module.css';
import { Layout, Menu, Button, Drawer } from 'antd';
import { useNavigate } from 'react-router-dom';
import { 
  HomeOutlined, 
  CompassOutlined, 
  CalculatorOutlined, 
  AimOutlined, 
  RadiusSettingOutlined, 
  ToolOutlined, 
  MonitorOutlined, 
  MenuOutlined 
} from '@ant-design/icons';

const { Sider, Content } = Layout;

const SettlementLayout = () => {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  
  const showDrawer = () => {
    setVisible(true);
  };
  
  const onCloseDrawer = () => {
    setVisible(false);
  };
  
  const goHome = () => {
    navigate('/');
  };

  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: '返回主頁',
      onClick: goHome
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
      label: '樁計算',
      onClick: () => navigate('/pile-calculation')
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
      label: '沉降監測系統'
    }
  ];

  return (
    <Layout className={styles.layout}>
      {/* 桌面端侧边导航 */}
      <Sider
        className={styles.sider}
        breakpoint="lg"
        collapsedWidth="0"
        trigger={null}
      >
        <div className={styles.logo}>沉降監測系統</div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['settlement-monitoring']}
          items={menuItems}
        />
      </Sider>
      
      {/* 移动端顶部导航 */}
      <div className={styles.mobileHeader}>
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={showDrawer}
          className={styles.menuButton}
        />
        <div className={styles.headerTitle}>沉降監測系統</div>
        <div style={{ width: 32 }}></div>
      </div>

      {/* 移动端侧边抽屉菜单 */}
      <Drawer
        title="菜單"
        placement="left"
        onClose={onCloseDrawer}
        open={visible}
        width={280}
      >
        <Menu
          mode="inline"
          defaultSelectedKeys={['settlement-monitoring']}
          items={menuItems}
        />
      </Drawer>
      
      <Content className={styles.content}>
        {/* 内容区域 */}
        <div className={styles.contentInner}>
          <h1>沉降監測系統</h1>
          <p>歡迎使用沉降監測系統，此功能正在開發中...</p>
        </div>
      </Content>
    </Layout>
  );
};

export default SettlementLayout; 