import React from 'react';
import { Row, Col, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  CompassOutlined,
  CalculatorOutlined,
  AimOutlined,
  RadiusSettingOutlined,
  ToolOutlined,
  MonitorOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import styles from './Home.module.css';

const features = [
  {
    icon: <CompassOutlined style={{ fontSize: '32px' }} />,
    title: '香港测量控制站查询',
    description: '查询香港测量控制站信息，包括测量站编号、控制网等',
    path: '/survey-station',
    color: '#4C84FF'
  },
  {
    icon: <CalculatorOutlined style={{ fontSize: '32px' }} />,
    title: '自由设站解算',
    description: '支持多种自由设站解算方法，快速准确',
    path: '/free-station',
    color: '#00C48C'
  },
  {
    icon: <AimOutlined style={{ fontSize: '32px' }} />,
    title: '导线计算',
    description: '提供闭合导线和附和导线计算，保证数据准确',
    path: '/traverse-calculation',
    color: '#FF6B6B'
  },
  {
    icon: <RadiusSettingOutlined style={{ fontSize: '32px' }} />,
    title: '施工放样',
    description: '支持点、线、弧等放样方式，适应各类场景',
    path: '/construction-layout',
    color: '#7A6FFF'
  },
  {
    icon: <RadiusSettingOutlined style={{ fontSize: '32px' }} />,
    title: '批量计算及转换',
    description: '支持多种计算方法和数据转换功能',
    path: '/circle-calculation',
    color: '#FF9F43'
  },
  {
    icon: <ToolOutlined style={{ fontSize: '32px' }} />,
    title: '实用工具',
    description: '提供多种实用计算工具，提高工作效率',
    path: '/tools',
    color: '#1E90FF'
  },
  {
    icon: <MonitorOutlined style={{ fontSize: '32px' }} />,
    title: '沉降监测系统',
    description: '专业沉降监测方案，实时掌握沉降数据',
    path: '/settlement-monitoring',
    color: '#45AAF2'
  }
];

const Home = () => {
  const navigate = useNavigate();
  
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            测量工程
            <span className={styles.heroHighlight}>计算系统</span>
          </h1>
          <p className={styles.heroDescription}>
            专业的测量工程解决方案，为您提供精确的计算工具和全面的数据支持
          </p>
          <button 
            className={styles.heroButton}
            onClick={() => navigate('/survey-station')}
          >
            立即使用
            <ArrowRightOutlined className={styles.heroButtonIcon} />
          </button>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.sectionTitle}>
          <h2>功能模块</h2>
          <p>提供全面的测量工程计算工具，助力项目高效完成</p>
        </div>
        
        <Row gutter={[24, 24]} className={styles.featureSection}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} md={8} lg={6} key={index}>
              <Card 
                className={styles.featureCard}
                onClick={() => navigate(feature.path)}
              >
                <div className={styles.featureIcon} style={{ color: feature.color }}>
                  {feature.icon}
                </div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
                <div className={styles.featureAction}>
                  <span>开始使用</span>
                  <ArrowRightOutlined className={styles.featureActionIcon} />
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLinks}>
            <a href="/about">关于我们</a>
            <a href="/contact">联系我们</a>
            <a href="/privacy">隐私政策</a>
            <a href="/terms">使用条款</a>
          </div>
          <div className={styles.copyright}>
            © {new Date().getFullYear()} 测量工程计算系统. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;