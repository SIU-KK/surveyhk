import React, { useState, useEffect } from 'react';
import { Layout, Form, Radio, Menu, Drawer, Button, Card } from 'antd';
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
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  DirectionInverse, 
  DirectionCalc, 
  LevelCalc, 
  LevelInverse 
} from './calculationTypes';
import styles from './BatchLayout.module.css';

const { Content } = Layout;

const BatchLayout = () => {
  const [calculationType, setCalculationType] = useState('direction-inverse');
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

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
      label: '批量計算及轉換'
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

  // 渲染计算表单
  const renderCalculationForm = () => {
    switch (calculationType) {
      case 'direction-inverse':
        return <DirectionInverse form={form} />;
      case 'direction-calc':
        return <DirectionCalc form={form} />;
      case 'level-calc':
        return <LevelCalc form={form} />;
      case 'level-inverse':
        return <LevelInverse form={form} />;
      default:
        return <DirectionInverse form={form} />;
    }
  };

  return (
    <Layout className={styles.layout}>
      {/* 桌面版导航 */}
      <Layout.Header className={styles.header}>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={['batch-calculation']}
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
        <div className={styles.headerTitle}>批量計算及轉換</div>
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
          selectedKeys={['batch-calculation']}
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
              <Radio.Button value="direction-inverse" className={styles.calculationTypeButton}>
                ENH TO BRE VA SD
              </Radio.Button>
              <Radio.Button value="direction-calc" className={styles.calculationTypeButton}>
                BRE VA SD TO ENH
              </Radio.Button>
              <Radio.Button value="level-calc" className={styles.calculationTypeButton}>
                平水計算
              </Radio.Button>
              <Radio.Button value="level-inverse" className={styles.calculationTypeButton}>
                平水反算
              </Radio.Button>
            </Radio.Group>
          </div>
          
          <div className={styles.formContainer}>
            {renderCalculationForm()}
          </div>
        </Card>
      </Content>
    </Layout>
  );
};

export default BatchLayout; 