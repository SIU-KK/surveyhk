import React from 'react';
import { Layout, Row, Col, Menu, Typography, Image } from 'antd';
import { HomeOutlined, CompassOutlined, CalculatorOutlined, AimOutlined, RadiusSettingOutlined, ToolOutlined, MonitorOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './SettlementMonitoringLayout.module.css';

const { Content, Header } = Layout;

const SettlementMonitoringLayout = () => {
  const navigate = useNavigate();

  const goHome = () => {
    navigate('/');
  };

  const renderFeatureSection = (title, description, imageSrc) => (
    <div className={styles.featureItem}>
      <Image
        src={imageSrc}
        alt={title}
        preview={false}
        className={styles.featureImage}
      />
      <div className={styles.featureContent}>
        <h3 className={styles.featureTitle}>{title}</h3>
        <p className={styles.featureDescription}>{description}</p>
      </div>
    </div>
  );

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
      label: '实用工具',
      onClick: () => navigate('/tools')
    },
    {
      key: 'settlement-monitoring',
      icon: <MonitorOutlined />,
      label: '沉降监测系统'
    }
  ];

  const features = [
    {
      title: '数据采集管理',
      description: '支持多种测量数据导入方式，包括手动输入、文件导入等。提供数据预处理、异常值检测等功能，确保数据质量。',
      imageSrc: '/images/data-collection.png'
    },
    {
      title: '沉降分析计算',
      description: '提供沉降量计算、沉降速率分析、沉降趋势预测等功能。支持多种计算模型，满足不同工程需求。',
      imageSrc: '/images/settlement-analysis.png'
    },
    {
      title: '可视化展示',
      description: '通过图表直观展示沉降监测数据，包括沉降曲线、等值线图等。支持数据导出和报告生成。',
      imageSrc: '/images/visualization.png'
    },
    {
      title: '预警管理',
      description: '设置沉降监测预警阈值，实时监控沉降变化。当超过预警值时，系统自动发出警报。',
      imageSrc: '/images/alert-management.png'
    }
  ];

  return (
    <Layout className={styles.container}>
      <Header className={styles.header}>
        <Menu
          theme="dark"
          mode="horizontal"
          items={menuItems}
          selectedKeys={['settlement-monitoring']}
          className={styles.menu}
        />
      </Header>
      <Content>
        <div className={styles.banner}>
          <Typography.Title level={2} className={styles.bannerTitle}>沉降监测系统</Typography.Title>
          <Typography.Paragraph className={styles.bannerDescription}>
            专业的建筑物沉降监测与分析平台，提供全面的数据采集、分析、预警和报告生成功能，
            助力工程建设质量控制和安全管理
          </Typography.Paragraph>
        </div>
        <div className={styles.featureSection}>
          <Row gutter={[48, 48]}>
            {features.map((feature, index) => (
              <Col xs={24} md={12} key={index}>
                {renderFeatureSection(
                  feature.title,
                  feature.description,
                  feature.imageSrc
                )}
              </Col>
            ))}
          </Row>
        </div>
      </Content>
    </Layout>
  );
};

export default SettlementMonitoringLayout;