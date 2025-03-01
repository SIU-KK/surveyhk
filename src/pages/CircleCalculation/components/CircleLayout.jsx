import React, { useState } from 'react';
import { Layout, Form, Input, Button, Table, Card, Space, Tabs, Menu } from 'antd';
import { HomeOutlined, CompassOutlined, CalculatorOutlined, AimOutlined, RadiusSettingOutlined, ToolOutlined, MonitorOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './CircleLayout.module.css';

const { Content, Header } = Layout;

const CircleLayout = () => {
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
      label: '圆计算'
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

  const renderThreePointsForm = () => (
    <Form form={form} layout="vertical">
      <div className={styles.formGroup}>
        <Form.Item label="第一点坐标" className={styles.formItem}>
          <Form.Item name="point1Id" rules={[{ required: true, message: '请输入点号' }]}>
            <Input placeholder="点号" />
          </Form.Item>
          <Form.Item name="point1X" rules={[{ required: true, message: '请输入X坐标' }]}>
            <Input placeholder="X坐标" />
          </Form.Item>
          <Form.Item name="point1Y" rules={[{ required: true, message: '请输入Y坐标' }]}>
            <Input placeholder="Y坐标" />
          </Form.Item>
        </Form.Item>
        <Form.Item label="第二点坐标" className={styles.formItem}>
          <Form.Item name="point2Id" rules={[{ required: true, message: '请输入点号' }]}>
            <Input placeholder="点号" />
          </Form.Item>
          <Form.Item name="point2X" rules={[{ required: true, message: '请输入X坐标' }]}>
            <Input placeholder="X坐标" />
          </Form.Item>
          <Form.Item name="point2Y" rules={[{ required: true, message: '请输入Y坐标' }]}>
            <Input placeholder="Y坐标" />
          </Form.Item>
        </Form.Item>
        <Form.Item label="第三点坐标" className={styles.formItem}>
          <Form.Item name="point3Id" rules={[{ required: true, message: '请输入点号' }]}>
            <Input placeholder="点号" />
          </Form.Item>
          <Form.Item name="point3X" rules={[{ required: true, message: '请输入X坐标' }]}>
            <Input placeholder="X坐标" />
          </Form.Item>
          <Form.Item name="point3Y" rules={[{ required: true, message: '请输入Y坐标' }]}>
            <Input placeholder="Y坐标" />
          </Form.Item>
        </Form.Item>
      </div>
      <Button type="primary" size="large" className={styles.submitButton}>计算</Button>
    </Form>
  );

  const renderTwoPointsForm = () => (
    <Form form={form} layout="vertical">
      <div className={styles.formGroup}>
        <Form.Item label="第一点坐标" className={styles.formItem}>
          <Form.Item name="point1Id" rules={[{ required: true, message: '请输入点号' }]}>
            <Input placeholder="点号" />
          </Form.Item>
          <Form.Item name="point1X" rules={[{ required: true, message: '请输入X坐标' }]}>
            <Input placeholder="X坐标" />
          </Form.Item>
          <Form.Item name="point1Y" rules={[{ required: true, message: '请输入Y坐标' }]}>
            <Input placeholder="Y坐标" />
          </Form.Item>
        </Form.Item>
        <Form.Item label="第二点坐标" className={styles.formItem}>
          <Form.Item name="point2Id" rules={[{ required: true, message: '请输入点号' }]}>
            <Input placeholder="点号" />
          </Form.Item>
          <Form.Item name="point2X" rules={[{ required: true, message: '请输入X坐标' }]}>
            <Input placeholder="X坐标" />
          </Form.Item>
          <Form.Item name="point2Y" rules={[{ required: true, message: '请输入Y坐标' }]}>
            <Input placeholder="Y坐标" />
          </Form.Item>
        </Form.Item>
        <Form.Item label="圆参数" className={styles.formItem}>
          <Form.Item name="radius" rules={[{ required: true, message: '请输入半径' }]}>
            <Input placeholder="半径" />
          </Form.Item>
        </Form.Item>
      </div>
      <Button type="primary" size="large" className={styles.submitButton}>计算</Button>
    </Form>
  );

  const renderCenterPointForm = () => (
    <Form form={form} layout="vertical">
      <div className={styles.formGroup}>
        <Form.Item label="圆心坐标" className={styles.formItem}>
          <Form.Item name="centerPointId" rules={[{ required: true, message: '请输入圆心点号' }]}>
            <Input placeholder="圆心点号" />
          </Form.Item>
          <Form.Item name="centerX" rules={[{ required: true, message: '请输入X坐标' }]}>
            <Input placeholder="X坐标" />
          </Form.Item>
          <Form.Item name="centerY" rules={[{ required: true, message: '请输入Y坐标' }]}>
            <Input placeholder="Y坐标" />
          </Form.Item>
        </Form.Item>
        <Form.Item label="圆参数" className={styles.formItem}>
          <Form.Item name="radius" rules={[{ required: true, message: '请输入半径' }]}>
            <Input placeholder="半径" />
          </Form.Item>
          <Form.Item name="pointCount" rules={[{ required: true, message: '请输入计算点数' }]}>
            <Input placeholder="计算点数" />
          </Form.Item>
        </Form.Item>
      </div>
      <Button type="primary" size="large" className={styles.submitButton}>计算</Button>
    </Form>
  );

  const items = [
    {
      key: '1',
      label: '三点求圆心',
      children: (
        <Card title="计算参数" className={styles.card}>
          {renderThreePointsForm()}
        </Card>
      ),
    },
    {
      key: '2',
      label: '两点求圆心',
      children: (
        <Card title="计算参数" className={styles.card}>
          {renderTwoPointsForm()}
        </Card>
      ),
    },
    {
      key: '3',
      label: '圆心求坐标',
      children: (
        <Card title="计算参数" className={styles.card}>
          {renderCenterPointForm()}
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
          selectedKeys={['circle-calculation']}
          className={styles.menu}
        />
      </Header>
      <Content className={styles.content}>
        <div className={styles.banner}>
          <h2 className={styles.bannerTitle}>圆计算</h2>
          <p className={styles.bannerDescription}>
            提供三点求圆心、两点求圆心、圆心求坐标等多种计算方法
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
                { title: '半径', dataIndex: 'radius', key: 'radius' },
                { title: '面积', dataIndex: 'area', key: 'area' },
                { title: '备注', dataIndex: 'remarks', key: 'remarks' },
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

export default CircleLayout;