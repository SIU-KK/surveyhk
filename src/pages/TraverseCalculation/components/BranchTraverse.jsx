import React, { useState } from 'react';
import { Form, Input, Button, Table, message, Typography, Card, InputNumber, Space, Divider } from 'antd';
import { PlusOutlined, MinusCircleOutlined, CalculatorOutlined } from '@ant-design/icons';
import styles from './BranchTraverse.module.css';

const { Title, Text } = Typography;

const BranchTraverse = () => {
  const [form] = Form.useForm();
  const [stations, setStations] = useState([{ key: '0' }]);
  const [calculationResult, setCalculationResult] = useState(null);

  // 重置表单数据
  const handleReset = () => {
    form.resetFields();
    setStations([{ key: '0' }]);
    setCalculationResult(null);
    message.success('表单已重置');
  };

  // 添加测站
  const addStation = () => {
    const newStation = { key: stations.length.toString() };
    const newStations = [...stations, newStation];
    setStations(newStations);
    
    const currentStations = form.getFieldValue('stations') || [];
    const updatedStations = [...currentStations, { stationName: '', angle: '', distance: '' }];
    form.setFieldsValue({ stations: updatedStations });
  };

  // 删除测站
  const removeStation = (index) => {
    if (stations.length <= 1) {
      message.warning('至少需要保留一个测站');
      return;
    }
    
    const newStations = stations.filter((_, i) => i !== index);
    setStations(newStations);
    
    const currentStations = form.getFieldValue('stations') || [];
    const updatedStations = currentStations.filter((_, i) => i !== index);
    form.setFieldsValue({ stations: updatedStations });
  };

  // 计算支导线
  const handleCalculate = (values) => {
    try {
      // 获取起始点坐标和方位角
      const startX = parseFloat(values.startX);
      const startY = parseFloat(values.startY);
      const startAzimuth = parseFloat(values.startAzimuth);
      
      if (isNaN(startX) || isNaN(startY) || isNaN(startAzimuth)) {
        message.error('请输入有效的起始点坐标和方位角');
        return;
      }
      
      // 处理测站数据
      const stationData = values.stations || [];
      if (stationData.length === 0) {
        message.error('请至少添加一个测站');
        return;
      }
      
      // 计算结果数组
      const results = [];
      let currentX = startX;
      let currentY = startY;
      let currentAzimuth = startAzimuth;
      let totalDistance = 0;
      
      // 计算每个测站的坐标
      stationData.forEach((station, index) => {
        const distance = parseFloat(station.distance);
        const angle = parseFloat(station.angle);
        
        if (isNaN(distance) || isNaN(angle)) {
          throw new Error(`测站 ${index + 1} 的数据无效`);
        }
        
        // 计算新的方位角（度）
        let newAzimuth = currentAzimuth + angle;
        // 确保方位角在 0-360 度范围内
        while (newAzimuth < 0) newAzimuth += 360;
        while (newAzimuth >= 360) newAzimuth -= 360;
        
        // 计算新的坐标
        const radians = newAzimuth * Math.PI / 180;
        const deltaX = distance * Math.sin(radians);
        const deltaY = distance * Math.cos(radians);
        
        const newX = currentX + deltaX;
        const newY = currentY + deltaY;
        
        totalDistance += distance;
        
        // 添加到结果数组
        results.push({
          key: index.toString(),
          station: station.stationName || `测站${index + 1}`,
          azimuth: newAzimuth.toFixed(4),
          distance: distance.toFixed(3),
          x: newX.toFixed(3),
          y: newY.toFixed(3),
          deltaX: deltaX.toFixed(3),
          deltaY: deltaY.toFixed(3)
        });
        
        // 更新当前位置和方位角
        currentX = newX;
        currentY = newY;
        currentAzimuth = newAzimuth;
      });
      
      // 设置计算结果
      setCalculationResult({
        stations: results,
        totalDistance: totalDistance.toFixed(3),
        finalX: currentX.toFixed(3),
        finalY: currentY.toFixed(3),
        finalAzimuth: currentAzimuth.toFixed(4)
      });
      
      message.success('计算完成');
      
      // 滚动到结果区域
      setTimeout(() => {
        const resultElement = document.getElementById('calculation-result');
        if (resultElement) {
          resultElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      
    } catch (error) {
      message.error(`计算错误: ${error.message}`);
    }
  };

  // 渲染起始点表单
  const renderStartPointForm = () => {
    return (
      <Card className={styles.formCard}>
        <Title level={4}>起始点数据</Title>
        <Form.Item
          label="X 坐标"
          name="startX"
          rules={[{ required: true, message: '请输入起始点 X 坐标' }]}
        >
          <Input placeholder="输入 X 坐标" />
        </Form.Item>
        <Form.Item
          label="Y 坐标"
          name="startY"
          rules={[{ required: true, message: '请输入起始点 Y 坐标' }]}
        >
          <Input placeholder="输入 Y 坐标" />
        </Form.Item>
        <Form.Item
          label="起始方位角"
          name="startAzimuth"
          rules={[{ required: true, message: '请输入起始方位角' }]}
        >
          <Input placeholder="输入方位角（度）" />
        </Form.Item>
      </Card>
    );
  };

  // 渲染测站表格
  const renderStationTable = () => {
    return (
      <div className={styles.stationTableContainer}>
        <Title level={4}>测站数据</Title>
        <div className={styles.stationTable}>
          <div className={styles.tableHeader}>
            <div className={styles.stationCell}>测站</div>
            <div className={styles.stationCell}>转角</div>
            <div className={styles.stationCell}>距离</div>
            <div className={styles.stationCell}>操作</div>
          </div>
          <Form.List name="stations">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }, index) => (
                  <div key={key} className={styles.tableRow}>
                    <Form.Item
                      {...restField}
                      name={[name, 'stationName']}
                      className={styles.stationCell}
                    >
                      <Input placeholder="测站名" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'angle']}
                      className={styles.stationCell}
                      rules={[{ required: true, message: '请输入转角' }]}
                    >
                      <Input placeholder="转角（度）" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'distance']}
                      className={styles.stationCell}
                      rules={[{ required: true, message: '请输入距离' }]}
                    >
                      <Input placeholder="距离" />
                    </Form.Item>
                    <div className={styles.stationCell}>
                      <MinusCircleOutlined
                        onClick={() => removeStation(index)}
                        className={styles.removeButton}
                      />
                    </div>
                  </div>
                ))}
                <Button
                  type="dashed"
                  onClick={addStation}
                  block
                  icon={<PlusOutlined />}
                  className={styles.addButton}
                >
                  添加测站
                </Button>
              </>
            )}
          </Form.List>
        </div>
      </div>
    );
  };

  // 渲染计算结果
  const renderCalculationResult = () => {
    if (!calculationResult) return null;

    const columns = [
      {
        title: '测站',
        dataIndex: 'station',
        key: 'station',
      },
      {
        title: '方位角',
        dataIndex: 'azimuth',
        key: 'azimuth',
      },
      {
        title: '距离',
        dataIndex: 'distance',
        key: 'distance',
      },
      {
        title: 'ΔX',
        dataIndex: 'deltaX',
        key: 'deltaX',
      },
      {
        title: 'ΔY',
        dataIndex: 'deltaY',
        key: 'deltaY',
      },
      {
        title: 'X 坐标',
        dataIndex: 'x',
        key: 'x',
      },
      {
        title: 'Y 坐标',
        dataIndex: 'y',
        key: 'y',
      },
    ];

    return (
      <div id="calculation-result" className={styles.resultContainer}>
        <Title level={4}>计算结果</Title>
        <Table
          dataSource={calculationResult.stations}
          columns={columns}
          pagination={false}
          className={styles.resultTable}
          bordered
        />
        <div className={styles.summaryContainer}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>总距离:</span>
            <span className={styles.summaryValue}>{calculationResult.totalDistance} m</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>终点 X 坐标:</span>
            <span className={styles.summaryValue}>{calculationResult.finalX}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>终点 Y 坐标:</span>
            <span className={styles.summaryValue}>{calculationResult.finalY}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>终点方位角:</span>
            <span className={styles.summaryValue}>{calculationResult.finalAzimuth}°</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <Form
        form={form}
        name="branchTraverseForm"
        onFinish={handleCalculate}
        layout="vertical"
        className={styles.form}
      >
        {renderStartPointForm()}
        {renderStationTable()}
        
        <div className={styles.buttonContainer}>
          <Button type="primary" htmlType="submit" className={styles.submitButton} icon={<CalculatorOutlined />}>
            计算
          </Button>
          <Button onClick={handleReset} className={styles.resetButton}>
            重置
          </Button>
        </div>
      </Form>
      
      {renderCalculationResult()}
    </div>
  );
};

export default BranchTraverse; 