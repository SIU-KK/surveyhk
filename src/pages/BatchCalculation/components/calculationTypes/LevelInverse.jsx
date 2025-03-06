import React from 'react';
import { Form, Input, Button } from 'antd';
import styles from '../BatchLayout.module.css';

const LevelInverse = ({ form }) => {
  return (
    <Form form={form} layout="vertical">
      <Form.Item
        label="起始点高程"
        name="benchmarkElevation"
        rules={[{ required: true, message: '请输入起始点高程' }]}
      >
        <Input placeholder="输入起始点高程" />
      </Form.Item>
      <Form.Item
        label="仪器高"
        name="instrumentHeight"
      >
        <Input placeholder="输入仪器高" />
      </Form.Item>
      <Form.Item
        label="批量数据"
        name="levelBatchData"
      >
        <Input.TextArea rows={6} placeholder="输入批量高程数据，每行一组，格式：点号,高程" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          生成GSI文件
        </Button>
      </Form.Item>
    </Form>
  );
};

export default LevelInverse; 