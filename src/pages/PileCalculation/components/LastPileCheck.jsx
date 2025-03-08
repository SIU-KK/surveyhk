import React, { useState } from 'react';
import { Card, Form, Input, Button, Radio, Row, Col, Table, message } from 'antd';
import styles from './ComponentStyles.module.css';

const LastPileCheck = () => {
  const [form] = Form.useForm();
  const [mode, setMode] = useState('simple'); // 'simple' 或 'professional'
  const [calculationResults, setCalculationResults] = useState([]);

  const handleModeChange = (e) => {
    setMode(e.target.value);
    form.resetFields();
    setCalculationResults([]);
  };

  const onFinish = (values) => {
    try {
      let results = [];
      
      if (mode === 'simple') {
        // 简易尾桩检查计算
        const { designX, designY, actualX, actualY } = values;
        
        // 计算偏差
        const deltaX = actualX - designX;
        const deltaY = actualY - designY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        results = [
          {
            key: '1',
            item: 'X坐标偏差',
            value: deltaX.toFixed(3),
            unit: 'm'
          },
          {
            key: '2',
            item: 'Y坐标偏差',
            value: deltaY.toFixed(3),
            unit: 'm'
          },
          {
            key: '3',
            item: '平面距离偏差',
            value: distance.toFixed(3),
            unit: 'm'
          },
          {
            key: '4',
            item: '设计坐标',
            value: `(${designX}, ${designY})`,
            unit: ''
          },
          {
            key: '5',
            item: '实测坐标',
            value: `(${actualX}, ${actualY})`,
            unit: ''
          }
        ];
      } else {
        // 专业尾桩检查计算
        const { 
          designX, 
          designY, 
          designZ,
          actualX, 
          actualY, 
          actualZ,
          pileNumber,
          designBearing,
          actualBearing
        } = values;
        
        // 计算偏差
        const deltaX = actualX - designX;
        const deltaY = actualY - designY;
        const deltaZ = actualZ - designZ;
        const horizontalDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const spatialDistance = Math.sqrt(horizontalDistance * horizontalDistance + deltaZ * deltaZ);
        
        // 计算方向角偏差
        const bearingDeviation = actualBearing - designBearing;
        
        results = [
          {
            key: '1',
            item: '桩号',
            value: pileNumber,
            unit: ''
          },
          {
            key: '2',
            item: 'X坐标偏差',
            value: deltaX.toFixed(3),
            unit: 'm'
          },
          {
            key: '3',
            item: 'Y坐标偏差',
            value: deltaY.toFixed(3),
            unit: 'm'
          },
          {
            key: '4',
            item: 'Z坐标偏差',
            value: deltaZ.toFixed(3),
            unit: 'm'
          },
          {
            key: '5',
            item: '平面距离偏差',
            value: horizontalDistance.toFixed(3),
            unit: 'm'
          },
          {
            key: '6',
            item: '空间距离偏差',
            value: spatialDistance.toFixed(3),
            unit: 'm'
          },
          {
            key: '7',
            item: '方位角偏差',
            value: bearingDeviation.toFixed(2),
            unit: '°'
          },
          {
            key: '8',
            item: '设计坐标',
            value: `(${designX}, ${designY}, ${designZ})`,
            unit: ''
          },
          {
            key: '9',
            item: '实测坐标',
            value: `(${actualX}, ${actualY}, ${actualZ})`,
            unit: ''
          }
        ];
      }
      
      setCalculationResults(results);
      message.success('尾桩检查计算完成');
    } catch (error) {
      message.error('计算出错：' + error.message);
    }
  };

  const renderSimpleForm = () => (
    <Form
      form={form}
      onFinish={onFinish}
      layout="vertical"
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="设计X坐标"
            name="designX"
            rules={[{ required: true, message: '请输入设计X坐标' }]}
          >
            <Input type="number" step="0.001" placeholder="输入设计X坐标" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="设计Y坐标"
            name="designY"
            rules={[{ required: true, message: '请输入设计Y坐标' }]}
          >
            <Input type="number" step="0.001" placeholder="输入设计Y坐标" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="实测X坐标"
            name="actualX"
            rules={[{ required: true, message: '请输入实测X坐标' }]}
          >
            <Input type="number" step="0.001" placeholder="输入实测X坐标" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="实测Y坐标"
            name="actualY"
            rules={[{ required: true, message: '请输入实测Y坐标' }]}
          >
            <Input type="number" step="0.001" placeholder="输入实测Y坐标" />
          </Form.Item>
        </Col>
      </Row>
      
      <Form.Item>
        <Button type="primary" htmlType="submit">
          计算
        </Button>
        <Button 
          style={{ marginLeft: 8 }} 
          onClick={() => {
            form.resetFields();
            setCalculationResults([]);
          }}
        >
          重置
        </Button>
      </Form.Item>
    </Form>
  );

  const renderProfessionalForm = () => (
    <Form
      form={form}
      onFinish={onFinish}
      layout="vertical"
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="桩号"
            name="pileNumber"
            rules={[{ required: true, message: '请输入桩号' }]}
          >
            <Input placeholder="输入桩号" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="设计方位角(°)"
            name="designBearing"
            rules={[{ required: true, message: '请输入设计方位角' }]}
          >
            <Input type="number" step="0.01" placeholder="输入设计方位角" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="实测方位角(°)"
            name="actualBearing"
            rules={[{ required: true, message: '请输入实测方位角' }]}
          >
            <Input type="number" step="0.01" placeholder="输入实测方位角" />
          </Form.Item>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="设计X坐标"
            name="designX"
            rules={[{ required: true, message: '请输入设计X坐标' }]}
          >
            <Input type="number" step="0.001" placeholder="输入设计X坐标" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="设计Y坐标"
            name="designY"
            rules={[{ required: true, message: '请输入设计Y坐标' }]}
          >
            <Input type="number" step="0.001" placeholder="输入设计Y坐标" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="设计Z坐标"
            name="designZ"
            rules={[{ required: true, message: '请输入设计Z坐标' }]}
          >
            <Input type="number" step="0.001" placeholder="输入设计Z坐标" />
          </Form.Item>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="实测X坐标"
            name="actualX"
            rules={[{ required: true, message: '请输入实测X坐标' }]}
          >
            <Input type="number" step="0.001" placeholder="输入实测X坐标" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="实测Y坐标"
            name="actualY"
            rules={[{ required: true, message: '请输入实测Y坐标' }]}
          >
            <Input type="number" step="0.001" placeholder="输入实测Y坐标" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="实测Z坐标"
            name="actualZ"
            rules={[{ required: true, message: '请输入实测Z坐标' }]}
          >
            <Input type="number" step="0.001" placeholder="输入实测Z坐标" />
          </Form.Item>
        </Col>
      </Row>
      
      <Form.Item>
        <Button type="primary" htmlType="submit">
          计算
        </Button>
        <Button 
          style={{ marginLeft: 8 }} 
          onClick={() => {
            form.resetFields();
            setCalculationResults([]);
          }}
        >
          重置
        </Button>
      </Form.Item>
    </Form>
  );

  const columns = [
    {
      title: '项目',
      dataIndex: 'item',
      key: 'item',
    },
    {
      title: '数值',
      dataIndex: 'value',
      key: 'value',
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
    },
  ];

  return (
    <div>
      <Card className={styles.mainCard}>
        <div className={styles.modeContainer}>
          <Radio.Group 
            value={mode} 
            onChange={handleModeChange}
            buttonStyle="solid"
            className={styles.modeSelector}
          >
            <Radio.Button value="simple">简易模式</Radio.Button>
            <Radio.Button value="professional">专业模式</Radio.Button>
          </Radio.Group>
        </div>
        
        <Card title="尾桩检查计算参数" className={styles.card}>
          {mode === 'simple' ? renderSimpleForm() : renderProfessionalForm()}
        </Card>
        
        {calculationResults.length > 0 && (
          <Card 
            title="计算结果" 
            className={styles.resultCard}
            style={{ marginTop: 16 }}
          >
            <Table 
              dataSource={calculationResults} 
              columns={columns} 
              pagination={false}
              bordered
            />
          </Card>
        )}
      </Card>
    </div>
  );
};

export default LastPileCheck; 