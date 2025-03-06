import React from 'react';
import { Layout } from 'antd';
import styles from './PageLayout.module.css';

const { Content } = Layout;

const PageLayout = ({ children, title, description }) => {
  return (
    <Layout className={styles.layout}>
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>{title}</h1>
          {description && <p className={styles.pageDescription}>{description}</p>}
        </div>
      </div>
      <Content className={styles.content}>
        <div className={styles.contentWrapper}>
          {children}
        </div>
      </Content>
    </Layout>
  );
};

export default PageLayout; 