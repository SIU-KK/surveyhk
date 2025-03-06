import React from 'react';
import { Form, Input, Button } from 'antd';
import styles from '../BatchLayout.module.css';

const DirectionCalc = ({ form }) => {
  return (
    <Form form={form} layout="vertical">
      <Form.Item
        label="起始点 E坐标"
        name="stationE"
        rules={[{ required: true, message: '请输入E坐标' }]}
      >
        <Input placeholder="输入E坐标" />
      </Form.Item>
      <Form.Item
        label="起始点 N坐标"
        name="stationN"
        rules={[{ required: true, message: '请输入N坐标' }]}
      >
        <Input placeholder="输入N坐标" />
      </Form.Item>
      <Form.Item
        label="GSI文件数据"
        name="gsiData"
        rules={[{ required: true, message: '请输入GSI数据' }]}
      >
        <Input.TextArea rows={6} placeholder="输入GSI格式数据" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          计算坐标
        </Button>
      </Form.Item>
    </Form>
  );
};

export default DirectionCalc; 