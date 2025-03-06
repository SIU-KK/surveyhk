import React, { useState, useEffect } from 'react';
import { Layout, Form, Input, Button, Table, Card, Space, Tabs, Menu, Drawer } from 'antd';
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
import { useNavigate } from 'react-router-dom';
import styles from './CircleLayout.module.css';

const { Content } = Layout;

const CircleLayout = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [form] = Form.useForm();
  const navigate = useNavigate();
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
      key: 'circle-calculation',
      icon: <RadiusSettingOutlined />,
      label: '批量计算及转换'
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
    if (key === '/') {
      navigate('/');
    } else {
      navigate(`/${key}`);
    }
    setDrawerVisible(false);
  };

  const renderThreePointsForm = () => (
    <Form form={form} layout="vertical" className={styles.calculationForm}>
      <div className={styles.formGrid}>
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>第一点坐标</h3>
          <Form.Item name="point1Id" label="点号" rules={[{ required: true, message: '请输入点号' }]}>
            <Input placeholder="点号" className={styles.inputField} size="large" />
          </Form.Item>
          <Form.Item name="point1X" label="X坐标" rules={[{ required: true, message: '请输入X坐标' }]}>
            <Input placeholder="X坐标" className={styles.inputField} size="large" />
          </Form.Item>
          <Form.Item name="point1Y" label="Y坐标" rules={[{ required: true, message: '请输入Y坐标' }]}>
            <Input placeholder="Y坐标" className={styles.inputField} size="large" />
          </Form.Item>
        </div>
        
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>第二点坐标</h3>
          <Form.Item name="point2Id" label="点号" rules={[{ required: true, message: '请输入点号' }]}>
            <Input placeholder="点号" className={styles.inputField} size="large" />
          </Form.Item>
          <Form.Item name="point2X" label="X坐标" rules={[{ required: true, message: '请输入X坐标' }]}>
            <Input placeholder="X坐标" className={styles.inputField} size="large" />
          </Form.Item>
          <Form.Item name="point2Y" label="Y坐标" rules={[{ required: true, message: '请输入Y坐标' }]}>
            <Input placeholder="Y坐标" className={styles.inputField} size="large" />
          </Form.Item>
        </div>
        
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>第三点坐标</h3>
          <Form.Item name="point3Id" label="点号" rules={[{ required: true, message: '请输入点号' }]}>
            <Input placeholder="点号" className={styles.inputField} size="large" />
          </Form.Item>
          <Form.Item name="point3X" label="X坐标" rules={[{ required: true, message: '请输入X坐标' }]}>
            <Input placeholder="X坐标" className={styles.inputField} size="large" />
          </Form.Item>
          <Form.Item name="point3Y" label="Y坐标" rules={[{ required: true, message: '请输入Y坐标' }]}>
            <Input placeholder="Y坐标" className={styles.inputField} size="large" />
          </Form.Item>
        </div>
      </div>
      <div className={styles.buttonGroup}>
        <Button type="primary" size="large" className={styles.submitButton} icon={<CalculatorOutlined />}>计算</Button>
        <Button size="large" className={styles.resetButton}>重置</Button>
      </div>
    </Form>
  );

  const renderTwoPointsForm = () => (
    <Form form={form} layout="vertical" className={styles.calculationForm}>
      <div className={styles.formGrid}>
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>第一点坐标</h3>
          <Form.Item name="point1Id" label="点号" rules={[{ required: true, message: '请输入点号' }]}>
            <Input placeholder="点号" className={styles.inputField} size="large" />
          </Form.Item>
          <Form.Item name="point1X" label="X坐标" rules={[{ required: true, message: '请输入X坐标' }]}>
            <Input placeholder="X坐标" className={styles.inputField} size="large" />
          </Form.Item>
          <Form.Item name="point1Y" label="Y坐标" rules={[{ required: true, message: '请输入Y坐标' }]}>
            <Input placeholder="Y坐标" className={styles.inputField} size="large" />
          </Form.Item>
        </div>
        
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>第二点坐标</h3>
          <Form.Item name="point2Id" label="点号" rules={[{ required: true, message: '请输入点号' }]}>
            <Input placeholder="点号" className={styles.inputField} size="large" />
          </Form.Item>
          <Form.Item name="point2X" label="X坐标" rules={[{ required: true, message: '请输入X坐标' }]}>
            <Input placeholder="X坐标" className={styles.inputField} size="large" />
          </Form.Item>
          <Form.Item name="point2Y" label="Y坐标" rules={[{ required: true, message: '请输入Y坐标' }]}>
            <Input placeholder="Y坐标" className={styles.inputField} size="large" />
          </Form.Item>
        </div>
        
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>圆参数</h3>
          <Form.Item name="radius" label="半径" rules={[{ required: true, message: '请输入半径' }]}>
            <Input placeholder="半径" className={styles.inputField} size="large" />
          </Form.Item>
        </div>
      </div>
      <div className={styles.buttonGroup}>
        <Button type="primary" size="large" className={styles.submitButton} icon={<CalculatorOutlined />}>计算</Button>
        <Button size="large" className={styles.resetButton}>重置</Button>
      </div>
    </Form>
  );

  const renderCenterPointForm = () => (
    <Form form={form} layout="vertical" className={styles.calculationForm}>
      <div className={styles.formGrid}>
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>圆心坐标</h3>
          <Form.Item name="centerPointId" label="圆心点号" rules={[{ required: true, message: '请输入圆心点号' }]}>
            <Input placeholder="圆心点号" className={styles.inputField} size="large" />
          </Form.Item>
          <Form.Item name="centerX" label="X坐标" rules={[{ required: true, message: '请输入X坐标' }]}>
            <Input placeholder="X坐标" className={styles.inputField} size="large" />
          </Form.Item>
          <Form.Item name="centerY" label="Y坐标" rules={[{ required: true, message: '请输入Y坐标' }]}>
            <Input placeholder="Y坐标" className={styles.inputField} size="large" />
          </Form.Item>
        </div>
        
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>圆参数</h3>
          <Form.Item name="radius" label="半径" rules={[{ required: true, message: '请输入半径' }]}>
            <Input placeholder="半径" className={styles.inputField} size="large" />
          </Form.Item>
          <Form.Item name="pointCount" label="计算点数" rules={[{ required: true, message: '请输入计算点数' }]}>
            <Input placeholder="计算点数" className={styles.inputField} size="large" />
          </Form.Item>
        </div>
      </div>
      <div className={styles.buttonGroup}>
        <Button type="primary" size="large" className={styles.submitButton} icon={<CalculatorOutlined />}>计算</Button>
        <Button size="large" className={styles.resetButton}>重置</Button>
      </div>
    </Form>
  );

  const items = [
    {
      key: '1',
      label: <span className={styles.tabLabel}>三点求圆心</span>,
      children: (
        <Card className={styles.card} bordered={false}>
          {renderThreePointsForm()}
        </Card>
      ),
    },
    {
      key: '2',
      label: <span className={styles.tabLabel}>两点求圆心</span>,
      children: (
        <Card className={styles.card} bordered={false}>
          {renderTwoPointsForm()}
        </Card>
      ),
    },
    {
      key: '3',
      label: <span className={styles.tabLabel}>圆心求坐标</span>,
      children: (
        <Card className={styles.card} bordered={false}>
          {renderCenterPointForm()}
        </Card>
      ),
    },
  ];

  return (
    <Layout className={styles.layout}>
      {/* 桌面端菜单 */}
      <div className={styles.header}>
        <Menu
          mode="horizontal"
          items={menuItems}
          onClick={handleMenuClick}
          className={styles.menu}
          selectedKeys={['circle-calculation']}
        />
      </div>

      {/* 移动端顶部导航 */}
      <div className={styles.mobileHeader}>
        <Button 
          icon={<MenuOutlined />}
          onClick={() => setDrawerVisible(true)}
          type="text"
          className={styles.menuButton}
        />
        <span className={styles.headerTitle}>批量计算及转换</span>
        <Button 
          icon={<HomeOutlined />} 
          onClick={() => navigate('/')}
          type="link"
        />
      </div>

      {/* 移动端导航抽屉 */}
      <Drawer
        title="导航菜单"
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        styles={{ body: { padding: 0 } }}
      >
        <Menu
          mode="vertical"
          items={menuItems}
          onClick={handleMenuClick}
          selectedKeys={['circle-calculation']}
          style={{ border: 'none' }}
        />
      </Drawer>

      <Content className={styles.content}>
        <div className={styles.pageContainer}>
          <div className={styles.mainContent}>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={items}
              type="card"
              className={styles.tabs}
              tabBarStyle={{ marginBottom: 0 }}
              tabBarGutter={8}
              size="large"
            />
            <Card className={`${styles.card} ${styles.resultCard}`} bordered={false}>
              <h3 className={styles.sectionTitle}>计算结果</h3>
              <Table
                columns={[
                  { title: '点号', dataIndex: 'pointId', key: 'pointId' },
                  { title: 'X坐标', dataIndex: 'x', key: 'x' },
                  { title: 'Y坐标', dataIndex: 'y', key: 'y' },
                  { title: '半径', dataIndex: 'radius', key: 'radius' },
                  { title: '面积', dataIndex: 'area', key: 'area' },
                  { title: '备注', dataIndex: 'remarks', key: 'remarks' },
                ]}
                dataSource={[]}
                className={styles.resultTable}
                size="middle"
                pagination={false}
                bordered
              />
            </Card>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default CircleLayout;