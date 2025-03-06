import React from 'react';
import { Form, Input, Button } from 'antd';
import styles from '../BatchLayout.module.css';

const LevelCalc = ({ form }) => {
  return (
    <Form form={form} layout="vertical">
      <Form.Item
        label="起始点高程"
        name="startElevation"
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
        label="GSI文件数据"
        name="levelGsiData"
        rules={[{ required: true, message: '请输入GSI数据' }]}
      >
        <Input.TextArea rows={6} placeholder="输入GSI格式数据" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          计算高程
        </Button>
      </Form.Item>
    </Form>
  );
};

export default LevelCalc; 