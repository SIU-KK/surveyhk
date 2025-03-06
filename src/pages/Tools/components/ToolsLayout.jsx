import React, { useState, useEffect } from 'react';
import { Layout, Menu, Card, Form, Input, Button, Table, Tabs, Drawer } from 'antd';
import { HomeOutlined, CompassOutlined, CalculatorOutlined, AimOutlined, RadiusSettingOutlined, ToolOutlined, MonitorOutlined, MenuOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './ToolsLayout.module.css';

const { Content, Header } = Layout;

const ToolsLayout = () => {
  const [activeTab, setActiveTab] = useState('arc');
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const goHome = () => {
    navigate('/');
  };

  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: '返回主页',
      onClick: goHome
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
      key: 'tools',
      icon: <ToolOutlined />,
      label: '实用工具'
    },
    {
      key: 'settlement-monitoring',
      icon: <MonitorOutlined />,
      label: '沉降监测系统',
      onClick: () => navigate('/settlement-monitoring')
    }
  ];

  const renderArcForm = () => (
    <Form form={form} layout="vertical">
      <div className={styles.formGroup}>
        <Form.Item label="弧线参数" className={styles.formItem}>
          <Form.Item name="radius" rules={[{ required: true, message: '请输入半径' }]}>
            <Input placeholder="半径" />
          </Form.Item>
          <Form.Item name="length" rules={[{ required: true, message: '请输入弧长' }]}>
            <Input placeholder="弧长" />
          </Form.Item>
        </Form.Item>
      </div>
      <Button type="primary" size="large" className={styles.submitButton}>计算</Button>
    </Form>
  );

  const renderHypotenuseForm = () => (
    <Form form={form} layout="vertical">
      <div className={styles.formGroup}>
        <Form.Item label="直角三角形参数" className={styles.formItem}>
          <Form.Item name="adjacent" rules={[{ required: true, message: '请输入邻边' }]}>
            <Input placeholder="邻边" />
          </Form.Item>
          <Form.Item name="opposite" rules={[{ required: true, message: '请输入对边' }]}>
            <Input placeholder="对边" />
          </Form.Item>
        </Form.Item>
      </div>
      <Button type="primary" size="large" className={styles.submitButton}>计算</Button>
    </Form>
  );

  const renderLevelForm = () => (
    <Form form={form} layout="vertical">
      <div className={styles.formGroup}>
        <Form.Item label="水准测量参数" className={styles.formItem}>
          <Form.Item name="backSight" rules={[{ required: true, message: '请输入后视读数' }]}>
            <Input placeholder="后视读数" />
          </Form.Item>
          <Form.Item name="foreSight" rules={[{ required: true, message: '请输入前视读数' }]}>
            <Input placeholder="前视读数" />
          </Form.Item>
        </Form.Item>
      </div>
      <Button type="primary" size="large" className={styles.submitButton}>计算</Button>
    </Form>
  );

  const renderAngleForm = () => (
    <Form form={form} layout="vertical">
      <div className={styles.formGroup}>
        <Form.Item label="角度转换参数" className={styles.formItem}>
          <Form.Item name="degrees" rules={[{ required: true, message: '请输入角度' }]}>
            <Input placeholder="角度值" />
          </Form.Item>
        </Form.Item>
      </div>
      <Button type="primary" size="large" className={styles.submitButton}>转换</Button>
    </Form>
  );

  const renderAreaForm = () => (
    <Form form={form} layout="vertical">
      <div className={styles.formGroup}>
        <Form.Item label="面积计算参数" className={styles.formItem}>
          <Form.Item name="length" rules={[{ required: true, message: '请输入长度' }]}>
            <Input placeholder="长度" />
          </Form.Item>
          <Form.Item name="width" rules={[{ required: true, message: '请输入宽度' }]}>
            <Input placeholder="宽度" />
          </Form.Item>
        </Form.Item>
      </div>
      <Button type="primary" size="large" className={styles.submitButton}>计算</Button>
    </Form>
  );

  const showDrawer = () => {
    setDrawerVisible(true);
  };

  const onCloseDrawer = () => {
    setDrawerVisible(false);
  };

  const handleMenuClick = (item) => {
    if (item.key !== 'tools') {
      onCloseDrawer();
    }
  };

  return (
    <Layout className={styles.layout}>
      <Header className={styles.header}>
        <div className={styles.menu}>
          <Menu mode="horizontal" defaultSelectedKeys={['tools']} items={menuItems} />
        </div>
      </Header>
      
      {isMobile && (
        <div className={styles.mobileHeader}>
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={showDrawer}
            className={styles.menuButton}
          />
          <div className={styles.headerTitle}>实用工具</div>
          <div style={{ width: 32 }}></div>
        </div>
      )}
      
      <Drawer
        title="导航菜单"
        placement="left"
        onClose={onCloseDrawer}
        open={drawerVisible}
        width={250}
      >
        <Menu
          mode="vertical"
          defaultSelectedKeys={['tools']}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Drawer>
      
      <Content className={styles.content}>
        <Card className={styles.mainCard} title="实用工具">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'arc',
                label: '弧长计算',
                children: renderArcForm()
              },
              {
                key: 'hypotenuse',
                label: '斜边计算',
                children: renderHypotenuseForm()
              },
              {
                key: 'level',
                label: '平水快速计算',
                children: renderLevelForm()
              },
              {
                key: 'angle',
                label: '角度转换',
                children: renderAngleForm()
              },
              {
                key: 'area',
                label: '面积计算',
                children: renderAreaForm()
              }
            ]}
          />
        </Card>
      </Content>
    </Layout>
  );
};

export default ToolsLayout;