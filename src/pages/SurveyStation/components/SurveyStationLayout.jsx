import React, { useState } from 'react';
import { Layout, Card, Row, Col, Menu, Button, Drawer } from 'antd';
import { HomeOutlined, CompassOutlined, CalculatorOutlined, AimOutlined, RadiusSettingOutlined, ToolOutlined, MonitorOutlined, ArrowRightOutlined, MenuOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './SurveyStationLayout.module.css';

const { Content } = Layout;

const SurveyStationLayout = () => {
  const navigate = useNavigate();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '返回主頁',
      onClick: () => navigate('/')
    },
    {
      key: 'survey-station',
      icon: <CompassOutlined />,
      label: '香港測量控制站查詢'
    },
    {
      key: 'free-station',
      icon: <CalculatorOutlined />,
      label: '自由設站解算'
    },
    {
      key: 'traverse-calculation',
      icon: <AimOutlined />,
      label: '導線計算'
    },
    {
      key: 'construction-layout',
      icon: <RadiusSettingOutlined />,
      label: '施工放樣'
    },
    {
      key: 'pile-calculation',
      icon: <CalculatorOutlined />,
      label: '樁計算'
    },
    {
      key: 'circle-calculation',
      icon: <RadiusSettingOutlined />,
      label: '批量計算及轉換'
    },
    {
      key: 'tools',
      icon: <ToolOutlined />,
      label: '實用工具'
    },
    {
      key: 'settlement-monitoring',
      icon: <MonitorOutlined />,
      label: '沉降监测系统'
    }
  ];

  const handleMenuClick = ({ key }) => {
    navigate(`/${key}`);
    setDrawerVisible(false);
  };

  const features = [
    {
      title: '测量站编号查询',
      description: '快速查询香港测量控制站的详细信息，包括站点编号、位置坐标等基础数据',
      url: 'https://www.geodetic.gov.hk/tc/gi/control_station.asp',
      icon: <CompassOutlined />,
      color: '#4C84FF'
    },
    {
      title: '平面控制网',
      description: '查询香港平面控制网的位置信息，支持地图可视化展示',
      url: 'https://www.map.gov.hk/gm/map/search/gss',
      icon: <AimOutlined />,
      color: '#00C48C'
    },
    {
      title: '高程控制网',
      description: '获取香港高程控制网的相关数据，支持高程基准点查询',
      url: 'https://www.map.gov.hk/gm/map/search/gss',
      icon: <RadiusSettingOutlined />,
      color: '#FF6B6B'
    },
    {
      title: '卫星定位',
      description: '查询香港卫星定位网络信息，实时获取定位数据',
      url: 'https://www.geodetic.gov.hk/tc/satref/satref.htm',
      icon: <MonitorOutlined />,
      color: '#7A6FFF'
    },
    {
      title: '土地记录资料',
      description: '查询香港土地记录相关资料，支持多维度检索',
      url: 'https://www.hkmapservice.gov.hk/OneStopSystem/map-search?locale=zh_hk',
      icon: <ToolOutlined />,
      color: '#FF9F43'
    }
  ];

  return (
    <Layout className={styles.container}>
      {/* 桌面端顶部导航 */}
      <Layout.Header className={styles.header}>
        <Menu
          mode="horizontal"
          selectedKeys={['survey-station']}
          onClick={handleMenuClick}
          className={styles.menu}
          theme="dark"
        >
          {menuItems.map(item => (
            <Menu.Item key={item.key} icon={item.icon}>
              {item.label}
            </Menu.Item>
          ))}
        </Menu>
      </Layout.Header>

      {/* 移动端顶部导航 */}
      <div className={styles.mobileHeader}>
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={() => setDrawerVisible(true)}
          className={styles.menuButton}
        />
        <div className={styles.headerTitle}>香港測量控制站查詢</div>
        <div style={{ width: 32 }}></div>
      </div>

      {/* 移动端侧边抽屉菜单 */}
      <Drawer
        title="菜單"
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={280}
      >
        <Menu
          mode="vertical"
          selectedKeys={['survey-station']}
          onClick={handleMenuClick}
          style={{ border: 'none' }}
          theme="light"
        >
          {menuItems.map(item => (
            <Menu.Item key={item.key} icon={item.icon}>
              {item.label}
            </Menu.Item>
          ))}
        </Menu>
      </Drawer>
      
      <Content className={styles.contentContainer}>
        <div className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              香港测量控制站
              <span className={styles.heroHighlight}>查询系统</span>
            </h1>
            <p className={styles.heroDescription}>
              专业的测量工程解决方案，为您提供精确的数据支持和全面的查询服务
            </p>
          </div>
        </div>

        <div className={styles.mainContent}>
          <Row gutter={[32, 32]} className={styles.featureSection}>
            {features.map((feature, index) => (
              <Col xs={24} sm={12} md={8} key={index}>
                <Card 
                  className={styles.featureCard}
                  onClick={() => window.open(feature.url, '_blank')}
                >
                  <div className={styles.featureIcon} style={{ color: feature.color }}>
                    {feature.icon}
                  </div>
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  <p className={styles.featureDescription}>{feature.description}</p>
                  <div className={styles.featureAction}>
                    <span>访问资源</span>
                    <ArrowRightOutlined className={styles.featureActionIcon} />
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </Content>
    </Layout>
  );
};

export default SurveyStationLayout;