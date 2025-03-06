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
  const [deviceType, setDeviceType] = useState('desktop');
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    // 检测设备类型
    const checkDeviceType = () => {
      const width = window.innerWidth;
      if (width <= 768) {
        setDeviceType('mobile');
        setIsMobile(true);
      } else if (width <= 1024) {
        setDeviceType('tablet');
        setIsMobile(false);
      } else {
        setDeviceType('desktop');
        setIsMobile(false);
      }
    };

    // 初始化设置
    checkDeviceType();

    // 添加窗口大小变化监听
    window.addEventListener('resize', checkDeviceType);

    // 清理函数
    return () => {
      window.removeEventListener('resize', checkDeviceType);
    };
  }, []);

  // 根据URL路径设置计算类型
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('direction-inverse')) {
      setCalculationType('direction-inverse');
    } else if (path.includes('direction-calc')) {
      setCalculationType('direction-calc');
    } else if (path.includes('level-calc')) {
      setCalculationType('level-calc');
    } else if (path.includes('level-inverse')) {
      setCalculationType('level-inverse');
    }
  }, [location.pathname]);

  // 处理菜单点击
  const handleMenuClick = (e) => {
    navigate(`/${e.key}`);
  };

  // 处理计算类型切换
  const handleCalculationTypeChange = (e) => {
    const value = e.target.value;
    setCalculationType(value);
    form.resetFields();
    
    // 根据计算类型更新URL
    navigate(`/batch-calculation/${value}`);
  };

  // 打开抽屉菜单
  const showDrawer = () => {
    setDrawerVisible(true);
  };

  // 关闭抽屉菜单
  const onCloseDrawer = () => {
    setDrawerVisible(false);
  };

  // 渲染计算类型选择器
  const renderCalculationTypeSelector = () => {
    return (
      <Radio.Group value={calculationType} onChange={handleCalculationTypeChange} className={styles.calculationTypeSelector}>
        <Radio.Button value="direction-inverse">ENH TO BRE VA SD</Radio.Button>
        <Radio.Button value="direction-calc">BRE VA SD TO ENH</Radio.Button>
        <Radio.Button value="level-calc">平水计算</Radio.Button>
        <Radio.Button value="level-inverse">平水反算</Radio.Button>
      </Radio.Group>
    );
  };

  // 渲染当前选择的计算类型对应的表单
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
        return null;
    }
  };

  // 移动端菜单项
  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: '首页'
    },
    {
      key: 'survey-station',
      icon: <CompassOutlined />,
      label: '香港测量控制站查询'
    },
    {
      key: 'free-station',
      icon: <CalculatorOutlined />,
      label: '自由设站解算'
    },
    {
      key: 'traverse-calculation',
      icon: <AimOutlined />,
      label: '导线计算'
    },
    {
      key: 'construction-layout',
      icon: <RadiusSettingOutlined />,
      label: '施工放样'
    },
    {
      key: 'batch-calculation',
      icon: <RadiusSettingOutlined />,
      label: '批量计算及转换'
    },
    {
      key: 'tools',
      icon: <ToolOutlined />,
      label: '实用工具'
    },
    {
      key: 'settlement-monitoring',
      icon: <MonitorOutlined />,
      label: '沉降监测系统'
    }
  ];

  return (
    <Layout className={styles.layout}>
      {/* 移动端头部 */}
      {isMobile && (
        <div className={styles.mobileHeader}>
          <Button
            className={styles.menuButton}
            type="text"
            icon={<MenuOutlined />}
            onClick={showDrawer}
          />
          <div className={styles.headerTitle}>批量计算及转换</div>
        </div>
      )}

      {/* 移动端抽屉菜单 */}
      <Drawer
        title="菜单"
        placement="left"
        closable={true}
        onClose={onCloseDrawer}
        visible={drawerVisible}
        width={250}
      >
        <Menu
          mode="vertical"
          items={menuItems}
          onClick={(e) => {
            handleMenuClick(e);
            onCloseDrawer();
          }}
        />
      </Drawer>

      {/* 桌面端头部 */}
      {!isMobile && (
        <Layout.Header className={styles.header}>
          <div className={styles.menu}>
            <Menu
              mode="horizontal"
              items={menuItems}
              onClick={handleMenuClick}
              selectedKeys={['batch-calculation']}
            />
          </div>
        </Layout.Header>
      )}

      {/* 内容区域 */}
      <Content className={styles.content}>
        <Card className={styles.mainCard}>
          <div className={styles.calculationTypeContainer}>
            {renderCalculationTypeSelector()}
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