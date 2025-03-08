import React, { useState } from 'react';
import { Layout, Row, Col, Menu, Typography, Button, Drawer, Card, Divider, Avatar, Statistic, Tag, Space } from 'antd';
import { 
  HomeOutlined, 
  CompassOutlined, 
  CalculatorOutlined, 
  AimOutlined, 
  RadiusSettingOutlined, 
  ToolOutlined, 
  MonitorOutlined, 
  MenuOutlined,
  UserOutlined,
  TeamOutlined,
  ProjectOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
  UploadOutlined,
  SearchOutlined,
  DownloadOutlined,
  EnvironmentOutlined,
  LineChartOutlined,
  FileTextOutlined,
  SettingOutlined,
  BellOutlined,
  SafetyOutlined,
  LoginOutlined,
  UserAddOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './SettlementMonitoringLayout.module.css';

const { Content, Header } = Layout;
const { Title, Paragraph, Text } = Typography;

const SettlementMonitoringLayout = () => {
  const navigate = useNavigate();
  const [drawerVisible, setDrawerVisible] = useState(false);

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
      label: '实用工具',
      onClick: () => navigate('/tools')
    },
    {
      key: 'settlement-monitoring',
      icon: <MonitorOutlined />,
      label: '沉降监测系统'
    }
  ];

  // 主要功能模块
  const mainFeatures = [
    {
      title: '用户权限管理',
      icon: <TeamOutlined className={styles.featureIcon} />,
      description: '支持多角色权限管理，包括管理员、项目负责人和普通用户，确保数据安全与访问控制',
      items: [
        { icon: <UserAddOutlined />, text: '用户注册/登录' },
        { icon: <SafetyOutlined />, text: '权限控制' }
      ]
    },
    {
      title: '沉降点管理',
      icon: <EnvironmentOutlined className={styles.featureIcon} />,
      description: '全面的沉降点管理功能，支持多种方式添加、编辑和删除监测点位',
      items: [
        { icon: <ProjectOutlined />, text: '我的项目' },
        { icon: <AppstoreOutlined />, text: '点位分类' },
        { icon: <UploadOutlined />, text: 'CSV导入' }
      ]
    },
    {
      title: '数据管理',
      icon: <DatabaseOutlined className={styles.featureIcon} />,
      description: '高效的数据管理系统，支持数据上传、查询和导出，满足各类数据处理需求',
      items: [
        { icon: <UploadOutlined />, text: '数据上传' },
        { icon: <SearchOutlined />, text: '数据查询' },
        { icon: <DownloadOutlined />, text: '数据导出' }
      ]
    },
    {
      title: '可视化展示',
      icon: <LineChartOutlined className={styles.featureIcon} />,
      description: '直观的数据可视化功能，包括地图展示、趋势图分析和专业报表生成',
      items: [
        { icon: <EnvironmentOutlined />, text: '地图展示' },
        { icon: <LineChartOutlined />, text: '趋势分析' },
        { icon: <FileTextOutlined />, text: '报表生成' }
      ]
    },
    {
      title: '系统设置',
      icon: <SettingOutlined className={styles.featureIcon} />,
      description: '灵活的系统设置选项，包括点位类型管理、通知提醒和数据备份功能',
      items: [
        { icon: <AppstoreOutlined />, text: '类型管理' },
        { icon: <BellOutlined />, text: '通知提醒' },
        { icon: <SafetyOutlined />, text: '数据备份' }
      ]
    }
  ];

  // 系统统计数据（模拟数据）
  const statistics = [
    { title: '项目总数', value: 128, suffix: '个' },
    { title: '监测点位', value: 3562, suffix: '个' },
    { title: '数据记录', value: 156842, suffix: '条' },
    { title: '活跃用户', value: 286, suffix: '人' }
  ];

  return (
    <Layout className={styles.container}>
      <Header className={styles.header}>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={['settlement-monitoring']}
          className={styles.menu}
        >
          {menuItems.map(item => (
            <Menu.Item key={item.key} icon={item.icon} onClick={item.onClick}>
              {item.label}
            </Menu.Item>
          ))}
        </Menu>
      </Header>
      
      <div className={styles.mobileHeader}>
        <Button 
          type="text" 
          icon={<MenuOutlined />} 
          onClick={() => setDrawerVisible(true)}
          className={styles.menuButton}
        />
        <div className={styles.headerTitle}>沉降监测系统</div>
        <div style={{ width: 32 }}></div>
      </div>
      
      <Drawer
        title="菜单"
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        bodyStyle={{ padding: 0 }}
      >
        <Menu
          mode="vertical"
          selectedKeys={['settlement-monitoring']}
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
        {/* 顶部横幅 */}
        <div className={styles.heroBanner}>
          <div className={styles.heroContent}>
            <Title level={1} className={styles.heroTitle}>
              专业沉降监测系统
            </Title>
            <Paragraph className={styles.heroDescription}>
              全面的建筑物沉降监测解决方案，提供数据采集、分析、预警和报告生成功能，
              助力工程建设质量控制和安全管理
            </Paragraph>
            <Space size="large" className={styles.heroButtons}>
              <Button type="primary" size="large" icon={<UserAddOutlined />}>
                注册账号
              </Button>
              <Button size="large" icon={<LoginOutlined />}>
                立即登录
              </Button>
            </Space>
          </div>
          <div className={styles.heroOverlay}></div>
        </div>

        {/* 系统统计 */}
        <div className={styles.statisticsSection}>
          <Row gutter={[24, 24]}>
            {statistics.map((stat, index) => (
              <Col xs={12} sm={6} key={index}>
                <Card className={styles.statisticCard}>
                  <Statistic 
                    title={stat.title}
                    value={stat.value}
                    suffix={stat.suffix}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* 主要功能介绍 */}
        <div className={styles.featuresSection}>
          <Title level={2} className={styles.sectionTitle}>
            系统功能
            <div className={styles.titleUnderline}></div>
          </Title>
          
          <Row gutter={[24, 24]}>
            {mainFeatures.map((feature, index) => (
              <Col xs={24} sm={12} lg={8} key={index}>
                <Card className={styles.featureCard} hoverable>
                  <div className={styles.featureCardHeader}>
                    {React.cloneElement(feature.icon, { className: styles.featureCardIcon })}
                    <Title level={4} className={styles.featureCardTitle}>
                      {feature.title}
                    </Title>
                  </div>
                  <Paragraph className={styles.featureCardDescription}>
                    {feature.description}
                  </Paragraph>
                  <Divider className={styles.featureDivider} />
                  <div className={styles.featureItemList}>
                    {feature.items.map((item, idx) => (
                      <div key={idx} className={styles.featureItem}>
                        {item.icon}
                        <Text className={styles.featureItemText}>{item.text}</Text>
                      </div>
                    ))}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* 系统优势 */}
        <div className={styles.advantagesSection}>
          <Title level={2} className={styles.sectionTitle}>
            系统优势
            <div className={styles.titleUnderline}></div>
          </Title>
          
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Card className={styles.advantageCard}>
                <Title level={3} className={styles.advantageTitle}>
                  <SafetyOutlined className={styles.advantageIcon} /> 数据安全可靠
                </Title>
                <Paragraph className={styles.advantageDescription}>
                  采用先进的数据加密技术和定期备份机制，确保监测数据的安全性和可靠性。
                  多层次权限管理，保障数据访问安全。
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card className={styles.advantageCard}>
                <Title level={3} className={styles.advantageTitle}>
                  <LineChartOutlined className={styles.advantageIcon} /> 智能分析预警
                </Title>
                <Paragraph className={styles.advantageDescription}>
                  内置智能分析算法，自动识别异常沉降趋势，提前预警潜在风险。
                  支持多种预警方式，包括邮件、短信和系统通知。
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card className={styles.advantageCard}>
                <Title level={3} className={styles.advantageTitle}>
                  <AppstoreOutlined className={styles.advantageIcon} /> 灵活扩展定制
                </Title>
                <Paragraph className={styles.advantageDescription}>
                  模块化设计，支持功能扩展和定制开发，满足不同项目的特殊需求。
                  开放API接口，便于与其他系统集成。
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card className={styles.advantageCard}>
                <Title level={3} className={styles.advantageTitle}>
                  <TeamOutlined className={styles.advantageIcon} /> 协同工作效率
                </Title>
                <Paragraph className={styles.advantageDescription}>
                  支持多用户协同工作，提高团队效率。实时数据同步，确保所有用户获取最新信息。
                  完善的操作日志，便于追踪和管理。
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>

        {/* 底部行动号召 */}
        <div className={styles.ctaSection}>
          <Card className={styles.ctaCard}>
            <Title level={2} className={styles.ctaTitle}>
              立即开始使用沉降监测系统
            </Title>
            <Paragraph className={styles.ctaDescription}>
              注册账号，体验专业的沉降监测解决方案，提升工程质量管理水平
            </Paragraph>
            <div className={styles.ctaButtons}>
              <Button type="primary" size="large" icon={<UserAddOutlined />}>
                免费注册
              </Button>
              <Button size="large">
                了解更多
              </Button>
            </div>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default SettlementMonitoringLayout;