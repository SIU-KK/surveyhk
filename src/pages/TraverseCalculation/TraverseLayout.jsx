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
      key: '/',
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
      label: '导线计算'
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
      <div className={styles.header}>
        <Menu
          mode="horizontal"
          selectedKeys={['traverse-calculation']}
          className={styles.menu}
          items={menuItems}
        />
      </div>

      {/* 移动版导航 */}
      <div className={styles.mobileHeader}>
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={() => setDrawerVisible(true)}
          className={styles.menuButton}
        />
        <div className={styles.headerTitle}>导线计算</div>
        <div style={{ width: 32 }}></div>
      </div>

      <Drawer
        title="导航菜单"
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={250}
      >
        <Menu
          mode="vertical"
          selectedKeys={['traverse-calculation']}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Drawer>

      <Content className={styles.content}>
        <Card className={styles.mainCard}>
          <div className={styles.calculationTypeContainer}>
            <Radio.Group
              value={calculationType}
              onChange={handleCalculationTypeChange}
              buttonStyle="solid"
              className={styles.calculationTypeSelector}
            >
              <Radio.Button value="closed">闭合导线</Radio.Button>
              <Radio.Button value="connected">附合导线</Radio.Button>
              <Radio.Button value="noOrientation">无定向导线</Radio.Button>
              <Radio.Button value="branch">支导线</Radio.Button>
            </Radio.Group>
          </div>
          
          {renderCalculationComponent()}
        </Card>
      </Content>
    </Layout>
  );
};

export default TraverseLayout; 