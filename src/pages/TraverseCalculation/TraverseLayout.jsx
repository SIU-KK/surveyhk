import React, { useState, useEffect } from 'react';
import { Layout, Menu, Drawer, Button, Card, Radio } from 'antd';
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
import ClosedTraverse from './components/ClosedTraverse';
import ConnectedTraverse from './components/ConnectedTraverse';
import NoOrientationTraverse from './components/NoOrientationTraverse';
import BranchTraverse from './components/BranchTraverse';
import styles from './TraverseLayout.module.css';

const { Content } = Layout;

const TraverseLayout = () => {
  const navigate = useNavigate();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [calculationType, setCalculationType] = useState('closed'); // 默认为闭合导线

  useEffect(() => {
    // 检测设备类型
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

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
      label: '導線計算'
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
      label: '沉降監測系統',
      onClick: () => navigate('/settlement-monitoring')
    }
  ];

  const handleMenuClick = ({ key }) => {
    navigate(`/${key}`);
    setDrawerVisible(false);
  };

  // 处理计算类型变化
  const handleCalculationTypeChange = (e) => {
    setCalculationType(e.target.value);
  };

  // 根据计算类型渲染不同的组件
  const renderCalculationComponent = () => {
    switch (calculationType) {
      case 'closed':
        return <ClosedTraverse />;
      case 'connected':
        return <ConnectedTraverse />;
      case 'noOrientation':
        return <NoOrientationTraverse />;
      case 'branch':
        return <BranchTraverse />;
      default:
        return <ClosedTraverse />;
    }
  };

  return (
    <Layout className={styles.layout}>
      {/* 桌面版导航 */}
      <Layout.Header className={styles.header}>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={['traverse-calculation']}
          className={styles.menu}
        >
          {menuItems.map(item => (
            <Menu.Item key={item.key} icon={item.icon} onClick={item.onClick}>
              {item.label}
            </Menu.Item>
          ))}
        </Menu>
      </Layout.Header>

      {/* 移动版导航 */}
      <div className={styles.mobileHeader}>
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={() => setDrawerVisible(true)}
          className={styles.menuButton}
        />
        <div className={styles.headerTitle}>導線計算</div>
        <div style={{ width: 32 }}></div>
      </div>

      <Drawer
        title="菜單"
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={280}
      >
        <Menu
          mode="vertical"
          selectedKeys={['traverse-calculation']}
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
        <Card className={styles.mainCard}>
          <div className={styles.calculationTypeContainer}>
            <Radio.Group
              className={styles.calculationTypeGroup}
              onChange={handleCalculationTypeChange}
              value={calculationType}
            >
              <Radio.Button value="closed" className={styles.calculationTypeButton}>
                閉合導線
              </Radio.Button>
              <Radio.Button value="connected" className={styles.calculationTypeButton}>
                附和導線
              </Radio.Button>
              <Radio.Button value="branch" className={styles.calculationTypeButton}>
                支導線
              </Radio.Button>
              <Radio.Button value="orientation" className={styles.calculationTypeButton}>
                無定向導線
              </Radio.Button>
            </Radio.Group>
          </div>
          
          {renderCalculationComponent()}
        </Card>
      </Content>
    </Layout>
  );
};

export default TraverseLayout; 