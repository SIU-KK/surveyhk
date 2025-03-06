import React from 'react';
import { Form, Input, Card, Button, Row, Col } from 'antd';
import styles from './PointLayoutForm.module.css';

const PointLayoutForm = ({ onCalculate }) => {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    onCalculate(values);
  };

  return (
    <Card title="测站数据输入" className={styles.formCard}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className={styles.form}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Form.Item
              label="测站E坐标"
              name="stationE"
              rules={[{ required: true, message: '请输入测站E坐标' }]}
            >
              <Input
                type="number"
                step="0.0001"
                placeholder="请输入E坐标"
                suffix="m"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item
              label="测站N坐标"
              name="stationN"
              rules={[{ required: true, message: '请输入测站N坐标' }]}
            >
              <Input
                type="number"
                step="0.0001"
                placeholder="请输入N坐标"
                suffix="m"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item
              label="测站高程"
              name="stationRL"
              rules={[{ required: true, message: '请输入测站高程' }]}
            >
              <Input
                type="number"
                step="0.0001"
                placeholder="请输入高程"
                suffix="m"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item
              label="仪器高度"
              name="instrumentHeight"
              rules={[{ required: true, message: '请输入仪器高度' }]}
            >
              <Input
                type="number"
                step="0.0001"
                placeholder="请输入仪器高度"
                suffix="m"
              />
            </Form.Item>
          </Col>
        </Row>
        <div className={styles.buttonContainer}>
          <Button type="primary" htmlType="submit">
            计算
          </Button>
          <Button onClick={() => form.resetFields()}>
            重置
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default PointLayoutForm;