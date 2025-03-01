import React, { useState } from 'react';
import { Layout, Menu, Card, Form, Input, Button, Table, Tabs } from 'antd';
import { HomeOutlined, CompassOutlined, CalculatorOutlined, AimOutlined, RadiusSettingOutlined, ToolOutlined, MonitorOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './ToolsLayout.module.css';

const { Content, Header } = Layout;

const ToolsLayout = () => {
  const [activeTab, setActiveTab] = useState('arc');
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
      label: '圆计算',
      onClick: () => navigate('/circle-calculation')
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

  const items = [
    {
      key: 'arc',
      label: '弧线中拱',
      children: (
        <Card title="计算参数" className={styles.card}>
          {renderArcForm()}
        </Card>
      ),
    },
    {
      key: 'hypotenuse',
      label: '斜边快速计算',
      children: (
        <Card title="计算参数" className={styles.card}>
          {renderHypotenuseForm()}
        </Card>
      ),
    },
    {
      key: 'level',
      label: '平水快速计算',
      children: (
        <Card title="计算参数" className={styles.card}>
          {renderLevelForm()}
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
          selectedKeys={['tools']}
          className={styles.menu}
        />
      </Header>
      <Content className={styles.content}>
        <div className={styles.banner}>
          <h2 className={styles.bannerTitle}>实用工具</h2>
          <p className={styles.bannerDescription}>
            提供弧线中拱计算、斜边快速计算、平水快速计算等实用工具
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
                { title: '参数', dataIndex: 'parameter', key: 'parameter' },
                { title: '数值', dataIndex: 'value', key: 'value' },
                { title: '单位', dataIndex: 'unit', key: 'unit' },
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

export default ToolsLayout;