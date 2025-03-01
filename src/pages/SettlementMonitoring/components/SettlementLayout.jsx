import React from 'react';
import { Layout, Menu, Typography, Card, Row, Col } from 'antd';
import styles from './SettlementLayout.module.css';

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

const SettlementLayout = () => {
  return (
    <Layout className={styles.container}>
      <Header className={styles.header}>
        <Menu mode="horizontal" className={styles.menu}>
          <Menu.Item key="home">首页</Menu.Item>
          <Menu.Item key="data">数据管理</Menu.Item>
          <Menu.Item key="analysis">变形分析</Menu.Item>
          <Menu.Item key="report">监测报告</Menu.Item>
        </Menu>
      </Header>

      <div className={styles.banner}>
        <Title level={2} className={styles.bannerTitle}>
          沉降监测系统
        </Title>
        <Paragraph className={styles.bannerDescription}>
          专业的建筑物沉降监测与分析平台
        </Paragraph>
      </div>

      <Content className={styles.content}>
        <div className={styles.mainContent}>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} lg={8}>
              <Card className={styles.card} title="数据采集管理">
                <Paragraph>
                  支持多种测量数据导入方式，包括手动输入、文件导入等。提供数据预处理、异常值检测等功能，确保数据质量。
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card className={styles.card} title="沉降分析计算">
                <Paragraph>
                  提供沉降量计算、沉降速率分析、沉降趋势预测等功能。支持多种计算模型，满足不同工程需求。
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card className={styles.card} title="可视化展示">
                <Paragraph>
                  通过图表直观展示沉降监测数据，包括沉降曲线、等值线图等。支持数据导出和报告生成。
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card className={styles.card} title="预警管理">
                <Paragraph>
                  设置沉降监测预警阈值，实时监控沉降变化。当超过预警值时，系统自动发出警报。
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card className={styles.card} title="历史数据查询">
                <Paragraph>
                  提供灵活的历史数据查询功能，支持多条件筛选和时间序列分析，便于追踪沉降发展过程。
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card className={styles.card} title="报告生成">
                <Paragraph>
                  自动生成标准化的监测报告，包含数据分析结果、图表展示和评估建议，提高工作效率。
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>
    </Layout>
  );
};

export default SettlementLayout;