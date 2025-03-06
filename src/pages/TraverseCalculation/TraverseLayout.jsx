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
      return window.innerWidth <= 768;
    };

    const handleResize = () => {
      setIsMobile(checkIfMobile());
    };

    // 初始化设置
    setIsMobile(checkIfMobile());

    // 添加窗口大小变化监听
    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 定义菜单项
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

  return (
    <Layout className={styles.container}>
      <Layout.Header className={styles.header}>
        {isMobile ? (
          <>
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setDrawerVisible(true)}
              className={styles.menuButton}
            />
            <div className={styles.headerTitle}>导线计算</div>
            <Drawer
              title="导航菜单"
              placement="left"
              onClose={() => setDrawerVisible(false)}
              open={drawerVisible}
              bodyStyle={{ padding: 0 }}
            >
              <Menu
                theme="light"
                mode="inline"
                items={menuItems}
                selectedKeys={['traverse-calculation']}
                className={styles.drawerMenu}
                onClick={() => setDrawerVisible(false)}
              />
            </Drawer>
          </>
        ) : (
          <Menu
            theme="light"
            mode="horizontal"
            items={menuItems}
            selectedKeys={['traverse-calculation']}
            className={styles.menu}
          />
        )}
      </Layout.Header>
      <Layout.Content className={styles.content}>
        <div className={`${styles.mainContent} ${isMobile ? styles.mobileContent : ''}`}>
          <Card className={`${styles.mainCard} ${isMobile ? styles.mobileCard : ''}`}>
            {/* 计算方式切换按钮 */}
            <div className={styles.calculationTypeContainer}>
              <Radio.Group 
                value={calculationType} 
                onChange={handleCalculationTypeChange}
                className={styles.calculationTypeGroup}
              >
                <Radio.Button value="closed">闭合导线</Radio.Button>
                <Radio.Button value="connected">附合导线</Radio.Button>
                <Radio.Button value="noOrientation">无定向导线</Radio.Button>
                <Radio.Button value="branch">支导线</Radio.Button>
              </Radio.Group>
            </div>
            
            {calculationType === 'closed' && <ClosedTraverse />}
            {calculationType === 'connected' && <ConnectedTraverse />}
            {calculationType === 'noOrientation' && <NoOrientationTraverse />}
            {calculationType === 'branch' && <BranchTraverse />}
          </Card>
        </div>
      </Layout.Content>
    </Layout>
  );
};

export default TraverseLayout; 