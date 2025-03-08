import React, { useState, useRef } from 'react';
import { Card, Form, Input, Button, Radio, Row, Col, Table, message, Typography, Divider } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import styles from './ComponentStyles.module.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import NumericInput from './NumericInput';

const SecondPileCheck = () => {
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
        // 简易二桩检查计算
        const { 
          designStartX, 
          designStartY, 
          designEndX, 
          designEndY,
          actualStartX, 
          actualStartY, 
          actualEndX, 
          actualEndY 
        } = values;
        
        // 计算设计距离
        const designDx = designEndX - designStartX;
        const designDy = designEndY - designStartY;
        const designDistance = Math.sqrt(designDx * designDx + designDy * designDy);
        
        // 计算实测距离
        const actualDx = actualEndX - actualStartX;
        const actualDy = actualEndY - actualStartY;
        const actualDistance = Math.sqrt(actualDx * actualDx + actualDy * actualDy);
        
        // 计算方向角
        const designBearing = Math.atan2(designDy, designDx) * 180 / Math.PI;
        const actualBearing = Math.atan2(actualDy, actualDx) * 180 / Math.PI;
        
        // 计算偏差
        const distanceDeviation = actualDistance - designDistance;
        const bearingDeviation = actualBearing - designBearing;
        
        results = [
          {
            key: '1',
            item: '设计距离',
            value: designDistance.toFixed(3),
            unit: 'm'
          },
          {
            key: '2',
            item: '实测距离',
            value: actualDistance.toFixed(3),
            unit: 'm'
          },
          {
            key: '3',
            item: '距离偏差',
            value: distanceDeviation.toFixed(3),
            unit: 'm'
          },
          {
            key: '4',
            item: '设计方位角',
            value: designBearing.toFixed(2),
            unit: '°'
          },
          {
            key: '5',
            item: '实测方位角',
            value: actualBearing.toFixed(2),
            unit: '°'
          },
          {
            key: '6',
            item: '方位角偏差',
            value: bearingDeviation.toFixed(2),
            unit: '°'
          }
        ];
      } else {
        // 专业二桩检查计算
        const { 
          pileStartNumber,
          pileEndNumber,
          designStartX, 
          designStartY, 
          designStartZ,
          designEndX, 
          designEndY, 
          designEndZ,
          actualStartX, 
          actualStartY, 
          actualStartZ,
          actualEndX, 
          actualEndY, 
          actualEndZ
        } = values;
        
        // 计算设计水平距离和空间距离
        const designDx = designEndX - designStartX;
        const designDy = designEndY - designStartY;
        const designDz = designEndZ - designStartZ;
        const designHorizontalDistance = Math.sqrt(designDx * designDx + designDy * designDy);
        const designSpatialDistance = Math.sqrt(designHorizontalDistance * designHorizontalDistance + designDz * designDz);
        
        // 计算实测水平距离和空间距离
        const actualDx = actualEndX - actualStartX;
        const actualDy = actualEndY - actualStartY;
        const actualDz = actualEndZ - actualStartZ;
        const actualHorizontalDistance = Math.sqrt(actualDx * actualDx + actualDy * actualDy);
        const actualSpatialDistance = Math.sqrt(actualHorizontalDistance * actualHorizontalDistance + actualDz * actualDz);
        
        // 计算方向角
        const designBearing = Math.atan2(designDy, designDx) * 180 / Math.PI;
        const actualBearing = Math.atan2(actualDy, actualDx) * 180 / Math.PI;
        
        // 计算坡度
        const designSlope = designDz / designHorizontalDistance * 100; // 百分比坡度
        const actualSlope = actualDz / actualHorizontalDistance * 100; // 百分比坡度
        
        // 计算偏差
        const horizontalDistanceDeviation = actualHorizontalDistance - designHorizontalDistance;
        const spatialDistanceDeviation = actualSpatialDistance - designSpatialDistance;
        const bearingDeviation = actualBearing - designBearing;
        const slopeDeviation = actualSlope - designSlope;
        
        results = [
          {
            key: '1',
            item: '起始桩号',
            value: pileStartNumber,
            unit: ''
          },
          {
            key: '2',
            item: '终止桩号',
            value: pileEndNumber,
            unit: ''
          },
          {
            key: '3',
            item: '设计水平距离',
            value: designHorizontalDistance.toFixed(3),
            unit: 'm'
          },
          {
            key: '4',
            item: '实测水平距离',
            value: actualHorizontalDistance.toFixed(3),
            unit: 'm'
          },
          {
            key: '5',
            item: '水平距离偏差',
            value: horizontalDistanceDeviation.toFixed(3),
            unit: 'm'
          },
          {
            key: '6',
            item: '设计空间距离',
            value: designSpatialDistance.toFixed(3),
            unit: 'm'
          },
          {
            key: '7',
            item: '实测空间距离',
            value: actualSpatialDistance.toFixed(3),
            unit: 'm'
          },
          {
            key: '8',
            item: '空间距离偏差',
            value: spatialDistanceDeviation.toFixed(3),
            unit: 'm'
          },
          {
            key: '9',
            item: '设计方位角',
            value: designBearing.toFixed(2),
            unit: '°'
          },
          {
            key: '10',
            item: '实测方位角',
            value: actualBearing.toFixed(2),
            unit: '°'
          },
          {
            key: '11',
            item: '方位角偏差',
            value: bearingDeviation.toFixed(2),
            unit: '°'
          },
          {
            key: '12',
            item: '设计坡度',
            value: designSlope.toFixed(2),
            unit: '%'
          },
          {
            key: '13',
            item: '实测坡度',
            value: actualSlope.toFixed(2),
            unit: '%'
          },
          {
            key: '14',
            item: '坡度偏差',
            value: slopeDeviation.toFixed(2),
            unit: '%'
          }
        ];
      }
      
      setCalculationResults(results);
      message.success('二桩检查计算完成');
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
        <Col xs={24}>
          <h3>设计坐标</h3>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="设计起点X坐标"
            name="designStartX"
            rules={[{ required: true, message: '请输入设计起点X坐标' }]}
          >
            <NumericInput 
              placeholder="输入设计起点X坐标" 
              allowNegative={true}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="设计起点Y坐标"
            name="designStartY"
            rules={[{ required: true, message: '请输入设计起点Y坐标' }]}
          >
            <NumericInput 
              placeholder="输入设计起点Y坐标" 
              allowNegative={true}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="设计终点X坐标"
            name="designEndX"
            rules={[{ required: true, message: '请输入设计终点X坐标' }]}
          >
            <NumericInput 
              placeholder="输入设计终点X坐标" 
              allowNegative={true}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="设计终点Y坐标"
            name="designEndY"
            rules={[{ required: true, message: '请输入设计终点Y坐标' }]}
          >
            <NumericInput 
              placeholder="输入设计终点Y坐标" 
              allowNegative={true}
            />
          </Form.Item>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <h3>实测坐标</h3>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="实测起点X坐标"
            name="actualStartX"
            rules={[{ required: true, message: '请输入实测起点X坐标' }]}
          >
            <NumericInput 
              placeholder="输入实测起点X坐标" 
              allowNegative={true}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="实测起点Y坐标"
            name="actualStartY"
            rules={[{ required: true, message: '请输入实测起点Y坐标' }]}
          >
            <NumericInput 
              placeholder="输入实测起点Y坐标" 
              allowNegative={true}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="实测终点X坐标"
            name="actualEndX"
            rules={[{ required: true, message: '请输入实测终点X坐标' }]}
          >
            <NumericInput 
              placeholder="输入实测终点X坐标" 
              allowNegative={true}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="实测终点Y坐标"
            name="actualEndY"
            rules={[{ required: true, message: '请输入实测终点Y坐标' }]}
          >
            <NumericInput 
              placeholder="输入实测终点Y坐标" 
              allowNegative={true}
            />
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
            label="起始桩号"
            name="pileStartNumber"
            rules={[{ required: true, message: '请输入起始桩号' }]}
          >
            <Input 
              placeholder="输入起始桩号" 
              inputMode="text"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="终止桩号"
            name="pileEndNumber"
            rules={[{ required: true, message: '请输入终止桩号' }]}
          >
            <Input 
              placeholder="输入终止桩号" 
              inputMode="text"
            />
          </Form.Item>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <h3>设计坐标</h3>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="设计起点X坐标"
            name="designStartX"
            rules={[{ required: true, message: '请输入设计起点X坐标' }]}
          >
            <NumericInput 
              placeholder="输入设计起点X坐标" 
              allowNegative={true}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="设计起点Y坐标"
            name="designStartY"
            rules={[{ required: true, message: '请输入设计起点Y坐标' }]}
          >
            <NumericInput 
              placeholder="输入设计起点Y坐标" 
              allowNegative={true}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="设计起点Z坐标"
            name="designStartZ"
            rules={[{ required: true, message: '请输入设计起点Z坐标' }]}
          >
            <NumericInput 
              placeholder="输入设计起点Z坐标" 
              allowNegative={true}
            />
          </Form.Item>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="设计终点X坐标"
            name="designEndX"
            rules={[{ required: true, message: '请输入设计终点X坐标' }]}
          >
            <NumericInput 
              placeholder="输入设计终点X坐标" 
              allowNegative={true}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="设计终点Y坐标"
            name="designEndY"
            rules={[{ required: true, message: '请输入设计终点Y坐标' }]}
          >
            <NumericInput 
              placeholder="输入设计终点Y坐标" 
              allowNegative={true}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="设计终点Z坐标"
            name="designEndZ"
            rules={[{ required: true, message: '请输入设计终点Z坐标' }]}
          >
            <NumericInput 
              placeholder="输入设计终点Z坐标" 
              allowNegative={true}
            />
          </Form.Item>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <h3>实测坐标</h3>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="实测起点X坐标"
            name="actualStartX"
            rules={[{ required: true, message: '请输入实测起点X坐标' }]}
          >
            <NumericInput 
              placeholder="输入实测起点X坐标" 
              allowNegative={true}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="实测起点Y坐标"
            name="actualStartY"
            rules={[{ required: true, message: '请输入实测起点Y坐标' }]}
          >
            <NumericInput 
              placeholder="输入实测起点Y坐标" 
              allowNegative={true}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="实测起点Z坐标"
            name="actualStartZ"
            rules={[{ required: true, message: '请输入实测起点Z坐标' }]}
          >
            <NumericInput 
              placeholder="输入实测起点Z坐标" 
              allowNegative={true}
            />
          </Form.Item>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="实测终点X坐标"
            name="actualEndX"
            rules={[{ required: true, message: '请输入实测终点X坐标' }]}
          >
            <NumericInput 
              placeholder="输入实测终点X坐标" 
              allowNegative={true}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="实测终点Y坐标"
            name="actualEndY"
            rules={[{ required: true, message: '请输入实测终点Y坐标' }]}
          >
            <NumericInput 
              placeholder="输入实测终点Y坐标" 
              allowNegative={true}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="实测终点Z坐标"
            name="actualEndZ"
            rules={[{ required: true, message: '请输入实测终点Z坐标' }]}
          >
            <NumericInput 
              placeholder="输入实测终点Z坐标" 
              allowNegative={true}
            />
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
        <div className={styles.calculationTypeContainer}>
          <Radio.Group 
            value={mode} 
            onChange={handleModeChange}
            buttonStyle="solid"
            className={styles.calculationTypeSelector}
          >
            <Radio.Button value="simple">简易模式</Radio.Button>
            <Radio.Button value="professional">专业模式</Radio.Button>
          </Radio.Group>
        </div>
        
        <Card title="桩检查计算参数" className={styles.card}>
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

export default SecondPileCheck; 