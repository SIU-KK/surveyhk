import React, { useState } from 'react';
import { Layout, Form, Input, Button, Table, Card, Space, Select, Tabs, Menu } from 'antd';
import { HomeOutlined, CompassOutlined, CalculatorOutlined, AimOutlined, RadiusSettingOutlined, ToolOutlined, MonitorOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './TraverseLayout.module.css';

const { Content, Header } = Layout;
const { Option } = Select;

const TraverseLayout = () => {
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
      label: '导线计算'
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

  const renderClosedTraverseForm = () => (
    <Form form={form} layout="vertical" onFinish={handleCalculate}>
      <div className={styles.formGroup}>
        <Form.Item label="起始点" className={styles.formItem}>
          <Form.Item name="startPointId" rules={[{ required: true, message: '请输入点号' }]}>
            <Input placeholder="点号" />
          </Form.Item>
          <Form.Item name="startPointX" rules={[{ required: true, message: '请输入X坐标' }]}>
            <Input placeholder="X坐标" />
          </Form.Item>
          <Form.Item name="startPointY" rules={[{ required: true, message: '请输入Y坐标' }]}>
            <Input placeholder="Y坐标" />
          </Form.Item>
        </Form.Item>
        <Form.Item label="终点" className={styles.formItem}>
          <Form.Item name="endPointId" rules={[{ required: true, message: '请输入点号' }]}>
            <Input placeholder="点号" />
          </Form.Item>
          <Form.Item name="endPointX" rules={[{ required: true, message: '请输入X坐标' }]}>
            <Input placeholder="X坐标" />
          </Form.Item>
          <Form.Item name="endPointY" rules={[{ required: true, message: '请输入Y坐标' }]}>
            <Input placeholder="Y坐标" />
          </Form.Item>
        </Form.Item>
        <Form.Item label="测站数据" className={styles.formItem}>
          <Form.Item name="stationCount" rules={[{ required: true, message: '请输入测站数量' }]}>
            <Input placeholder="测站数量" />
          </Form.Item>
          <Form.Item name="observationAngle" rules={[{ required: true, message: '请输入观测角' }]}>
            <Input placeholder="观测角" />
          </Form.Item>
          <Form.Item name="distance" rules={[{ required: true, message: '请输入距离' }]}>
            <Input placeholder="距离" />
          </Form.Item>
        </Form.Item>
      </div>
      <Button type="primary" htmlType="submit" className={styles.submitButton} size="large">计算</Button>
    </Form>
  );

  const renderAttachedTraverseForm = () => (
    <Form form={form} layout="vertical" onFinish={handleCalculate}>
      <div className={styles.formGroup}>
        <Form.Item label="起始点" className={styles.formItem}>
          <Form.Item name="startPointId" rules={[{ required: true, message: '请输入点号' }]}>
            <Input placeholder="点号" />
          </Form.Item>
          <Form.Item name="startPointX" rules={[{ required: true, message: '请输入X坐标' }]}>
            <Input placeholder="X坐标" />
          </Form.Item>
          <Form.Item name="startPointY" rules={[{ required: true, message: '请输入Y坐标' }]}>
            <Input placeholder="Y坐标" />
          </Form.Item>
        </Form.Item>
        <Form.Item label="终点" className={styles.formItem}>
          <Form.Item name="endPointId" rules={[{ required: true, message: '请输入点号' }]}>
            <Input placeholder="点号" />
          </Form.Item>
          <Form.Item name="endPointX" rules={[{ required: true, message: '请输入X坐标' }]}>
            <Input placeholder="X坐标" />
          </Form.Item>
          <Form.Item name="endPointY" rules={[{ required: true, message: '请输入Y坐标' }]}>
            <Input placeholder="Y坐标" />
          </Form.Item>
        </Form.Item>
        <Form.Item label="测站数据" className={styles.formItem}>
          <Form.Item name="stationCount" rules={[{ required: true, message: '请输入测站数量' }]}>
            <Input placeholder="测站数量" />
          </Form.Item>
          <Form.Item name="observationAngle" rules={[{ required: true, message: '请输入观测角' }]}>
            <Input placeholder="观测角" />
          </Form.Item>
          <Form.Item name="distance" rules={[{ required: true, message: '请输入距离' }]}>
            <Input placeholder="距离" />
          </Form.Item>
        </Form.Item>
      </div>
      <Button type="primary" htmlType="submit" className={styles.submitButton} size="large">计算</Button>
    </Form>
  );

  const items = [
    {
      key: '1',
      label: '闭合导线',
      children: (
        <Card title="计算参数" className={styles.card}>
          {renderClosedTraverseForm()}
        </Card>
      ),
    },
    {
      key: '2',
      label: '附和导线',
      children: (
        <Card title="计算参数" className={styles.card}>
          {renderAttachedTraverseForm()}
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
          selectedKeys={['traverse-calculation']}
          className={styles.menu}
        />
      </Header>
      <Content className={styles.content}>
        <div className={styles.banner}>
          <h2 className={styles.bannerTitle}>导线计算</h2>
          <p className={styles.bannerDescription}>
            提供闭合导线和附和导线计算功能，快速准确计算导线点坐标
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
                { title: '角度闭合差', dataIndex: 'angleClosure', key: 'angleClosure' },
                { title: '坐标闭合差', dataIndex: 'coordinateClosure', key: 'coordinateClosure' },
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

export default TraverseLayout;