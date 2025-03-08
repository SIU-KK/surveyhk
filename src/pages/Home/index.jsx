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
    title: '香港測量控制站查詢',
    description: '查詢香港測量控制站信息，包括測量站編號、控制網等',
    path: '/survey-station',
    color: '#4C84FF'
  },
  {
    icon: <CalculatorOutlined style={{ fontSize: '32px' }} />,
    title: '自由設站解算',
    description: '支持多種自由設站解算方法，快速準確',
    path: '/free-station',
    color: '#00C48C'
  },
  {
    icon: <AimOutlined style={{ fontSize: '32px' }} />,
    title: '導線計算',
    description: '提供閉合導線和附和導線計算，保證數據準確',
    path: '/traverse-calculation',
    color: '#FF6B6B'
  },
  {
    icon: <RadiusSettingOutlined style={{ fontSize: '32px' }} />,
    title: '施工放樣',
    description: '支持點、線、弧等放樣方式，適應各類場景',
    path: '/construction-layout',
    color: '#7A6FFF'
  },
  {
    icon: <CalculatorOutlined style={{ fontSize: '32px' }} />,
    title: '樁計算',
    description: '提供樁放樣、頭樁檢查、二樁檢查、尾樁檢查及材料計算功能',
    path: '/pile-calculation',
    color: '#FF9F43'
  },
  {
    icon: <RadiusSettingOutlined style={{ fontSize: '32px' }} />,
    title: '批量計算及轉換',
    description: '支持多種計算方法和數據轉換功能',
    path: '/batch-calculation',
    color: '#FF9F43'
  },
  {
    icon: <ToolOutlined style={{ fontSize: '32px' }} />,
    title: '實用工具',
    description: '提供多種實用計算工具，提高工作效率',
    path: '/tools',
    color: '#1E90FF'
  },
  {
    icon: <MonitorOutlined style={{ fontSize: '32px' }} />,
    title: '沉降監測系統',
    description: '專業沉降監測方案，實時掌握沉降數據',
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
            測量工程
            <span className={styles.heroHighlight}>計算系統</span>
          </h1>
          <p className={styles.heroDescription}>
            專業的測量工程解決方案，為您提供精確的計算工具和全面的數據支持
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
          <h2>功能模塊</h2>
          <p>提供全面的測量工程計算工具，助力項目高效完成</p>
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
                  <span>開始使用</span>
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
            <a href="/about">關於我們</a>
            <a href="/contact">聯繫我們</a>
            <a href="/privacy">隱私政策</a>
            <a href="/terms">使用條款</a>
          </div>
          <div className={styles.copyright}>
            © {new Date().getFullYear()} 測量工程計算系統. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;