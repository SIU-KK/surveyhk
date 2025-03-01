import React from 'react';
import { Layout, Menu } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  CompassOutlined,
  CalculatorOutlined,
  AimOutlined,
  RadiusSettingOutlined,
  ToolOutlined,
  MonitorOutlined
} from '@ant-design/icons';

const { Header, Content, Sider } = Layout;

const AppLayout = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      key: 'survey-station',
      icon: <CompassOutlined />,
      label: '香港测量控制站查询',
      children: [
        { key: 'survey-station/id', label: '以大地測量站編號查詢' },
        { key: 'survey-station/plane', label: '平面控制網' },
        { key: 'survey-station/elevation', label: '高程控制網' },
        { key: 'survey-station/satellite', label: '衞星定位' },
        { key: 'survey-station/land', label: '土地記錄資料查询购买' }
      ]
    },
    {
      key: 'free-station',
      icon: <CalculatorOutlined />,
      label: '自由设站解算',
      children: [
        { key: 'free-station/2a1d', label: '双角+单距计算' },
        { key: 'free-station/2a2d', label: '双角+双距计算' },
        { key: 'free-station/3a3d', label: '三角+三距计算' }
      ]
    },
    {
      key: 'traverse-calculation',
      icon: <AimOutlined />,
      label: '导线计算',
      children: [
        { key: 'traverse-calculation/closed', label: '闭合导线' },
        { key: 'traverse-calculation/attached', label: '附和导线' }
      ]
    },
    {
      key: 'construction-layout',
      icon: <RadiusSettingOutlined />,
      label: '施工放样',
      children: [
        { key: 'construction-layout/point', label: '点' },
        { key: 'construction-layout/line', label: '线' },
        { key: 'construction-layout/arc', label: '弧' }
      ]
    },
    {
      key: 'circle-calculation',
      icon: <RadiusSettingOutlined />,
      label: '圆计算',
      children: [
        { key: 'circle-calculation/3points', label: '三点求圆心' },
        { key: 'circle-calculation/2points', label: '两点求圆心' },
        { key: 'circle-calculation/center', label: '圆心求坐标' }
      ]
    },
    {
      key: 'tools',
      icon: <ToolOutlined />,
      label: '实用工具',
      children: [
        { key: 'tools/arc', label: '弧线中拱' },
        { key: 'tools/hypotenuse', label: '斜边快速计算' },
        { key: 'tools/level', label: '平水快速计算' }
      ]
    },
    {
      key: 'settlement-monitoring',
      icon: <MonitorOutlined />,
      label: '沉降监测系统',
      children: [
        { key: 'settlement-monitoring/external', label: '外部链接' }
      ]
    }
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content>
        <Outlet />
      </Content>
    </Layout>
  );
};

export default AppLayout;