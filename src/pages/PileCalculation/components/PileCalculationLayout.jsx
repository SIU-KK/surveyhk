import React, { useState } from 'react';
import { Card, Form, Input, Button, Radio, Row, Col, Table, message } from 'antd';
import styles from './ComponentStyles.module.css';

const PileCalculationLayout = () => {
  const [calculationType, setCalculationType] = useState('single');
  const [form] = Form.useForm();
  const [calculationResults, setCalculationResults] = useState([]);

  const handleCalculationTypeChange = (e) => {
    setCalculationType(e.target.value);
    form.resetFields();
    setCalculationResults([]);
  };

  const onFinish = (values) => {
    try {
      let results = [];
      
      if (calculationType === 'single') {
        // 单桩计算
        const { pileLength, pileWidth, pileHeight, concreteGrade } = values;
        
        // 计算桩体积
        const volume = pileLength * pileWidth * pileHeight;
        
        // 计算混凝土用量（加上5%的损耗）
        const concreteVolume = volume * 1.05;
        
        // 计算钢筋用量（假设每立方米混凝土需要100kg钢筋）
        const steelWeight = concreteVolume * 100;
        
        results = [
          {
            key: '1',
            item: '桩体积',
            value: volume.toFixed(2),
            unit: 'm³'
          },
          {
            key: '2',
            item: '混凝土用量',
            value: concreteVolume.toFixed(2),
            unit: 'm³'
          },
          {
            key: '3',
            item: '钢筋用量',
            value: steelWeight.toFixed(2),
            unit: 'kg'
          },
          {
            key: '4',
            item: '混凝土等级',
            value: concreteGrade,
            unit: ''
          }
        ];
      } else {
        // 群桩计算
        const { pileLength, pileWidth, pileHeight, pileCount, concreteGrade, spacing } = values;
        
        // 计算单桩体积
        const singleVolume = pileLength * pileWidth * pileHeight;
        
        // 计算总体积
        const totalVolume = singleVolume * pileCount;
        
        // 计算混凝土用量（加上5%的损耗）
        const concreteVolume = totalVolume * 1.05;
        
        // 计算钢筋用量（假设每立方米混凝土需要100kg钢筋）
        const steelWeight = concreteVolume * 100;
        
        // 计算占地面积（简化计算，假设为矩形排列）
        const rows = Math.ceil(Math.sqrt(pileCount));
        const cols = Math.ceil(pileCount / rows);
        const area = (rows - 1) * spacing * (cols - 1) * spacing;
        
        results = [
          {
            key: '1',
            item: '桩数量',
            value: pileCount,
            unit: '根'
          },
          {
            key: '2',
            item: '单桩体积',
            value: singleVolume.toFixed(2),
            unit: 'm³'
          },
          {
            key: '3',
            item: '总体积',
            value: totalVolume.toFixed(2),
            unit: 'm³'
          },
          {
            key: '4',
            item: '混凝土用量',
            value: concreteVolume.toFixed(2),
            unit: 'm³'
          },
          {
            key: '5',
            item: '钢筋用量',
            value: steelWeight.toFixed(2),
            unit: 'kg'
          },
          {
            key: '6',
            item: '占地面积',
            value: area.toFixed(2),
            unit: 'm²'
          },
          {
            key: '7',
            item: '混凝土等级',
            value: concreteGrade,
            unit: ''
          }
        ];
      }
      
      setCalculationResults(results);
      message.success('计算完成');
    } catch (error) {
      message.error('计算出错：' + error.message);
    }
  };

  const renderSinglePileForm = () => (
    <Form
      form={form}
      onFinish={onFinish}
      layout="vertical"
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="桩长"
            name="pileLength"
            rules={[{ required: true, message: '请输入桩长' }]}
          >
            <Input type="number" step="0.01" addonAfter="m" placeholder="输入桩长" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="桩宽"
            name="pileWidth"
            rules={[{ required: true, message: '请输入桩宽' }]}
          >
            <Input type="number" step="0.01" addonAfter="m" placeholder="输入桩宽" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="桩高"
            name="pileHeight"
            rules={[{ required: true, message: '请输入桩高' }]}
          >
            <Input type="number" step="0.01" addonAfter="m" placeholder="输入桩高" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="混凝土等级"
            name="concreteGrade"
            rules={[{ required: true, message: '请选择混凝土等级' }]}
          >
            <Radio.Group>
              <Radio value="C20">C20</Radio>
              <Radio value="C25">C25</Radio>
              <Radio value="C30">C30</Radio>
              <Radio value="C35">C35</Radio>
            </Radio.Group>
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

  const renderGroupPileForm = () => (
    <Form
      form={form}
      onFinish={onFinish}
      layout="vertical"
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="桩长"
            name="pileLength"
            rules={[{ required: true, message: '请输入桩长' }]}
          >
            <Input type="number" step="0.01" addonAfter="m" placeholder="输入桩长" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="桩宽"
            name="pileWidth"
            rules={[{ required: true, message: '请输入桩宽' }]}
          >
            <Input type="number" step="0.01" addonAfter="m" placeholder="输入桩宽" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="桩高"
            name="pileHeight"
            rules={[{ required: true, message: '请输入桩高' }]}
          >
            <Input type="number" step="0.01" addonAfter="m" placeholder="输入桩高" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="桩数量"
            name="pileCount"
            rules={[{ required: true, message: '请输入桩数量' }]}
          >
            <Input type="number" min="1" step="1" placeholder="输入桩数量" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="桩间距"
            name="spacing"
            rules={[{ required: true, message: '请输入桩间距' }]}
          >
            <Input type="number" step="0.01" addonAfter="m" placeholder="输入桩间距" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="混凝土等级"
            name="concreteGrade"
            rules={[{ required: true, message: '请选择混凝土等级' }]}
          >
            <Radio.Group>
              <Radio value="C20">C20</Radio>
              <Radio value="C25">C25</Radio>
              <Radio value="C30">C30</Radio>
              <Radio value="C35">C35</Radio>
            </Radio.Group>
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
            value={calculationType} 
            onChange={handleCalculationTypeChange}
            buttonStyle="solid"
            className={styles.modeSelector}
          >
            <Radio.Button value="single">单桩计算</Radio.Button>
            <Radio.Button value="group">群桩计算</Radio.Button>
          </Radio.Group>
        </div>
        
        <Card title="计算参数" className={styles.card}>
          {calculationType === 'single' ? renderSinglePileForm() : renderGroupPileForm()}
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

export default PileCalculationLayout; 