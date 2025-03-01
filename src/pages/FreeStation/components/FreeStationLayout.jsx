import React, { useState } from 'react';
import { Layout, Form, Input, Button, Table, Card, Space, Tabs, Menu } from 'antd';
import { HomeOutlined, CompassOutlined, CalculatorOutlined, AimOutlined, RadiusSettingOutlined, ToolOutlined, MonitorOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './FreeStationLayout.module.css';

const { Content, Header } = Layout;

const FreeStationLayout = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [form] = Form.useForm();
  const navigate = useNavigate();

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
      label: '自由设站解算'
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
      label: '圆计算',
      onClick: () => navigate('/circle-calculation')
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

  const handleCalculate = (values) => {
    console.log('计算参数:', values);
    // TODO: 实现计算逻辑
  };

  const renderSingleStationForm = () => (
    <Form form={form} layout="vertical" onFinish={handleCalculate}>
      <div className={styles.formGroup}>
        <Form.Item label="已知点1" className={styles.formItem}>
          <Form.Item name="knownPoint1E" rules={[{ required: true, message: '请输入E坐标' }]}>
            <Input placeholder="E坐标" />
          </Form.Item>
          <Form.Item name="knownPoint1N" rules={[{ required: true, message: '请输入N坐标' }]}>
            <Input placeholder="N坐标" />
          </Form.Item>
        </Form.Item>
        <Form.Item label="已知点2" className={styles.formItem}>
          <Form.Item name="knownPoint2E" rules={[{ required: true, message: '请输入E坐标' }]}>
            <Input placeholder="E坐标" />
          </Form.Item>
          <Form.Item name="knownPoint2N" rules={[{ required: true, message: '请输入N坐标' }]}>
            <Input placeholder="N坐标" />
          </Form.Item>
          <Form.Item name="knownPoint2H" rules={[{ required: true, message: '请输入R.L' }]}>
            <Input placeholder="R.L" />
          </Form.Item>
        </Form.Item>
        <Form.Item label="观测数据" className={styles.formItem}>
          <Form.Item name="instrumentHeight" rules={[{ required: true, message: '请输入仪器高度' }]}>
            <Input placeholder="仪器高度" />
          </Form.Item>
          <Form.Item name="observation1Azimuth" rules={[{ required: true, message: '请输入方位角(DD.MMSS)' }]}>
            <Input placeholder="方位角1(DD.MMSS)" />
          </Form.Item>
          <Form.Item name="observation2Azimuth" rules={[{ required: true, message: '请输入方位角(DD.MMSS)' }]}>
            <Input placeholder="方位角2(DD.MMSS)" />
          </Form.Item>
          <Form.Item name="observation2VerticalAngle" rules={[{ required: true, message: '请输入垂直角(DD.MMSS)' }]}>
            <Input placeholder="垂直角(DD.MMSS)" />
          </Form.Item>
          <Form.Item name="observation2SlopeDistance" rules={[{ required: true, message: '请输入斜距' }]}>
            <Input placeholder="斜距" />
          </Form.Item>
          <Form.Item name="prismHeight" rules={[{ required: true, message: '请输入棱镜高度' }]}>
            <Input placeholder="棱镜高度" />
          </Form.Item>
        </Form.Item>
      </div>
      <Button type="primary" htmlType="submit" className={styles.submitButton} size="large">计算</Button>
    </Form>
  );

  const renderDoubleStationForm = () => (
    <Form form={form} layout="vertical" onFinish={handleCalculate}>
      <div className={styles.formGroup}>
        <Form.Item label="第一已知点" style={{ minWidth: 200 }}>
          <Form.Item name="knownPoint1Id" rules={[{ required: true, message: '请输入已知点号' }]}>
            <Input placeholder="已知点号" />
          </Form.Item>
          <Form.Item name="knownPoint1X" rules={[{ required: true, message: '请输入X坐标' }]}>
            <Input placeholder="X坐标" />
          </Form.Item>
          <Form.Item name="knownPoint1Y" rules={[{ required: true, message: '请输入Y坐标' }]}>
            <Input placeholder="Y坐标" />
          </Form.Item>
        </Form.Item>
        <Form.Item label="第二已知点" style={{ minWidth: 200 }}>
          <Form.Item name="knownPoint2Id" rules={[{ required: true, message: '请输入已知点号' }]}>
            <Input placeholder="已知点号" />
          </Form.Item>
          <Form.Item name="knownPoint2X" rules={[{ required: true, message: '请输入X坐标' }]}>
            <Input placeholder="X坐标" />
          </Form.Item>
          <Form.Item name="knownPoint2Y" rules={[{ required: true, message: '请输入Y坐标' }]}>
            <Input placeholder="Y坐标" />
          </Form.Item>
        </Form.Item>
        <Form.Item label="观测数据" style={{ minWidth: 200 }}>
          <Form.Item name="horizontalAngle1" rules={[{ required: true, message: '请输入水平角1' }]}>
            <Input placeholder="水平角1" />
          </Form.Item>
          <Form.Item name="horizontalAngle2" rules={[{ required: true, message: '请输入水平角2' }]}>
            <Input placeholder="水平角2" />
          </Form.Item>
          <Form.Item name="slopeDistance" rules={[{ required: true, message: '请输入斜距' }]}>
            <Input placeholder="斜距" />
          </Form.Item>
        </Form.Item>
      </div>
      <Button type="primary" htmlType="submit" className={styles.submitButton} size="large">计算</Button>
    </Form>
  );

  const renderTripleStationForm = () => (
    <Form form={form} layout="vertical" onFinish={handleCalculate}>
      <div className={styles.formGroup}>
        <Form.Item label="第一已知点" style={{ minWidth: 200 }}>
          <Form.Item name="knownPoint1Id" rules={[{ required: true, message: '请输入已知点号' }]}>
            <Input placeholder="已知点号" />
          </Form.Item>
          <Form.Item name="knownPoint1X" rules={[{ required: true, message: '请输入X坐标' }]}>
            <Input placeholder="X坐标" />
          </Form.Item>
          <Form.Item name="knownPoint1Y" rules={[{ required: true, message: '请输入Y坐标' }]}>
            <Input placeholder="Y坐标" />
          </Form.Item>
        </Form.Item>
        <Form.Item label="第二已知点" style={{ minWidth: 200 }}>
          <Form.Item name="knownPoint2Id" rules={[{ required: true, message: '请输入已知点号' }]}>
            <Input placeholder="已知点号" />
          </Form.Item>
          <Form.Item name="knownPoint2X" rules={[{ required: true, message: '请输入X坐标' }]}>
            <Input placeholder="X坐标" />
          </Form.Item>
          <Form.Item name="knownPoint2Y" rules={[{ required: true, message: '请输入Y坐标' }]}>
            <Input placeholder="Y坐标" />
          </Form.Item>
        </Form.Item>
        <Form.Item label="第三已知点" style={{ minWidth: 200 }}>
          <Form.Item name="knownPoint3Id" rules={[{ required: true, message: '请输入已知点号' }]}>
            <Input placeholder="已知点号" />
          </Form.Item>
          <Form.Item name="knownPoint3X" rules={[{ required: true, message: '请输入X坐标' }]}>
            <Input placeholder="X坐标" />
          </Form.Item>
          <Form.Item name="knownPoint3Y" rules={[{ required: true, message: '请输入Y坐标' }]}>
            <Input placeholder="Y坐标" />
          </Form.Item>
        </Form.Item>
        <Form.Item label="观测数据" style={{ minWidth: 200 }}>
          <Form.Item name="horizontalAngle1" rules={[{ required: true, message: '请输入水平角1' }]}>
            <Input placeholder="水平角1" />
          </Form.Item>
          <Form.Item name="horizontalAngle2" rules={[{ required: true, message: '请输入水平角2' }]}>
            <Input placeholder="水平角2" />
          </Form.Item>
          <Form.Item name="horizontalAngle3" rules={[{ required: true, message: '请输入水平角3' }]}>
            <Input placeholder="水平角3" />
          </Form.Item>
        </Form.Item>
      </div>
      <Button type="primary" htmlType="submit" className={styles.submitButton} size="large">计算</Button>
    </Form>
  );

  const items = [
    {
      key: '1',
      label: '单站后方交会',
      children: (
        <Card title="计算参数" className={styles.card}>
          {renderSingleStationForm()}
        </Card>
      ),
    },
    {
      key: '2',
      label: '双站后方交会',
      children: (
        <Card title="计算参数" className={styles.card}>
          {renderDoubleStationForm()}
        </Card>
      ),
    },
    {
      key: '3',
      label: '三站后方交会',
      children: (
        <Card title="计算参数" className={styles.card}>
          {renderTripleStationForm()}
        </Card>
      ),
    },
  ];

  return (
    <Layout className={styles.container}>
      <Header className={styles.header}>
        <Menu
          theme="dark"
          mode="horizontal"
          items={menuItems}
          selectedKeys={['free-station']}
          className={styles.menu}
        />
      </Header>
      <Content className={styles.content}>
        <div className={styles.banner}>
          <h2 className={styles.bannerTitle}>自由设站解算</h2>
          <p className={styles.bannerDescription}>
            提供单站、双站、三站后方交会解算功能，快速准确计算测站坐标
          </p>
        </div>
        <div className={styles.mainContent}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={items}
            type="card"
            className={styles.tabs}
          />
          <Card title="计算结果" className={`${styles.card} ${styles.resultSection}`}>
            <Table
              columns={[
                { title: '点号', dataIndex: 'pointId', key: 'pointId' },
                { title: 'X坐标', dataIndex: 'x', key: 'x' },
                { title: 'Y坐标', dataIndex: 'y', key: 'y' },
                { title: '高程', dataIndex: 'elevation', key: 'elevation' },
                { title: '精度评估', dataIndex: 'accuracy', key: 'accuracy' },
              ]}
              dataSource={[]}
              className={styles.table}
            />
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default FreeStationLayout;