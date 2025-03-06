import React, { useState } from 'react';
import { Form, Input, Button, Table, message, Typography, Card, InputNumber, Space, Divider } from 'antd';
import { PlusOutlined, MinusCircleOutlined, CalculatorOutlined } from '@ant-design/icons';
import styles from './ConnectedTraverse.module.css';

const { Title, Text } = Typography;

const ConnectedTraverse = () => {
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
    const updatedStations = [...currentStations, { stationName: '', backSight: '', backAngle: '', backDistance: '', foreSight: '', foreAngle: '', foreDistance: '' }];
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

  // 计算附合导线
  const handleCalculate = (values) => {
    try {
      // 获取起始点和终点的坐标
      const startX = parseFloat(values.startX);
      const startY = parseFloat(values.startY);
      const endX = parseFloat(values.endX);
      const endY = parseFloat(values.endY);
      
      // 获取起始方位角和终点方位角
      const startAzimuth = parseFloat(values.startAzimuth);
      const endAzimuth = parseFloat(values.endAzimuth);
      
      if (isNaN(startX) || isNaN(startY) || isNaN(endX) || isNaN(endY) || isNaN(startAzimuth) || isNaN(endAzimuth)) {
        message.error('请输入有效的控制点坐标和方位角');
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
      let totalAngle = 0;
      
      // 计算每个测站的坐标
      stationData.forEach((station, index) => {
        const foreDistance = parseFloat(station.foreDistance);
        const foreAngle = parseFloat(station.foreAngle);
        
        if (isNaN(foreDistance) || isNaN(foreAngle)) {
          throw new Error(`测站 ${index + 1} 的数据无效`);
        }
        
        totalAngle += foreAngle;
        
        // 计算新的方位角（度）
        let newAzimuth = currentAzimuth + foreAngle;
        // 确保方位角在 0-360 度范围内
        while (newAzimuth < 0) newAzimuth += 360;
        while (newAzimuth >= 360) newAzimuth -= 360;
        
        // 计算新的坐标
        const radians = newAzimuth * Math.PI / 180;
        const deltaX = foreDistance * Math.sin(radians);
        const deltaY = foreDistance * Math.cos(radians);
        
        const newX = currentX + deltaX;
        const newY = currentY + deltaY;
        
        totalDistance += foreDistance;
        
        // 添加到结果数组
        results.push({
          key: index.toString(),
          station: station.stationName || `测站${index + 1}`,
          azimuth: newAzimuth.toFixed(4),
          distance: foreDistance.toFixed(3),
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
      
      // 计算闭合差
      const closureX = endX - currentX;
      const closureY = endY - currentY;
      const closureDistance = Math.sqrt(closureX * closureX + closureY * closureY);
      const closureRatio = totalDistance > 0 ? (closureDistance / totalDistance) : 0;
      
      // 计算方位角闭合差
      let azimuthClosure = endAzimuth - currentAzimuth;
      while (azimuthClosure < -180) azimuthClosure += 360;
      while (azimuthClosure > 180) azimuthClosure -= 360;
      
      // 计算角度改正数
      const angleCorrection = azimuthClosure / stationData.length;
      
      // 计算坐标改正数
      const distanceCorrection = {
        x: closureX / totalDistance,
        y: closureY / totalDistance
      };
      
      // 应用改正数，计算调整后的坐标
      let adjustedX = startX;
      let adjustedY = startY;
      let adjustedAzimuth = startAzimuth;
      let accumulatedDistance = 0;
      
      const adjustedResults = results.map((result, index) => {
        const station = stationData[index];
        const distance = parseFloat(station.foreDistance);
        
        // 应用角度改正
        const correctedAngle = parseFloat(station.foreAngle) + angleCorrection * (index + 1);
        
        // 计算调整后的方位角
        let newAzimuth = adjustedAzimuth + correctedAngle;
        while (newAzimuth < 0) newAzimuth += 360;
        while (newAzimuth >= 360) newAzimuth -= 360;
        
        // 计算调整后的坐标增量
        const radians = newAzimuth * Math.PI / 180;
        const deltaX = distance * Math.sin(radians);
        const deltaY = distance * Math.cos(radians);
        
        // 应用距离改正
        const correctedDeltaX = deltaX + distance * distanceCorrection.x;
        const correctedDeltaY = deltaY + distance * distanceCorrection.y;
        
        // 计算调整后的坐标
        adjustedX += correctedDeltaX;
        adjustedY += correctedDeltaY;
        
        // 更新方位角
        adjustedAzimuth = newAzimuth;
        accumulatedDistance += distance;
        
        return {
          ...result,
          adjustedAzimuth: newAzimuth.toFixed(4),
          adjustedX: adjustedX.toFixed(3),
          adjustedY: adjustedY.toFixed(3),
          correctedDeltaX: correctedDeltaX.toFixed(3),
          correctedDeltaY: correctedDeltaY.toFixed(3)
        };
      });
      
      // 设置计算结果
      setCalculationResult({
        stations: adjustedResults,
        totalDistance: totalDistance.toFixed(3),
        closureX: closureX.toFixed(3),
        closureY: closureY.toFixed(3),
        closureDistance: closureDistance.toFixed(3),
        closureRatio: (closureRatio * 10000).toFixed(1),
        azimuthClosure: azimuthClosure.toFixed(4),
        angleCorrection: angleCorrection.toFixed(4),
        distanceCorrectionX: distanceCorrection.x.toFixed(6),
        distanceCorrectionY: distanceCorrection.y.toFixed(6)
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

  // 渲染控制点表单
  const renderControlPointForm = () => {
    return (
      <Card className={styles.formCard}>
        <Title level={4}>控制点数据</Title>
        <div className={styles.controlPointsContainer}>
          <div className={styles.controlPointForm}>
            <Title level={5} className={styles.controlPointTitle}>起始控制点</Title>
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
          </div>
          
          <div className={styles.controlPointForm}>
            <Title level={5} className={styles.controlPointTitle}>终点控制点</Title>
            <Form.Item
              label="X 坐标"
              name="endX"
              rules={[{ required: true, message: '请输入终点 X 坐标' }]}
            >
              <Input placeholder="输入 X 坐标" />
            </Form.Item>
            <Form.Item
              label="Y 坐标"
              name="endY"
              rules={[{ required: true, message: '请输入终点 Y 坐标' }]}
            >
              <Input placeholder="输入 Y 坐标" />
            </Form.Item>
            <Form.Item
              label="终点方位角"
              name="endAzimuth"
              rules={[{ required: true, message: '请输入终点方位角' }]}
            >
              <Input placeholder="输入方位角（度）" />
            </Form.Item>
          </div>
        </div>
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
            <div className={styles.stationCell}>后视点</div>
            <div className={styles.stationCell}>后视角</div>
            <div className={styles.stationCell}>后视距离</div>
            <div className={styles.stationCell}>前视点</div>
            <div className={styles.stationCell}>前视角</div>
            <div className={styles.stationCell}>前视距离</div>
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
                      name={[name, 'backSight']}
                      className={styles.stationCell}
                    >
                      <Input placeholder="后视点" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'backAngle']}
                      className={styles.stationCell}
                    >
                      <Input placeholder="角度" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'backDistance']}
                      className={styles.stationCell}
                    >
                      <Input placeholder="距离" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'foreSight']}
                      className={styles.stationCell}
                    >
                      <Input placeholder="前视点" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'foreAngle']}
                      className={styles.stationCell}
                      rules={[{ required: true, message: '请输入角度' }]}
                    >
                      <Input placeholder="角度" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'foreDistance']}
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
        title: '调整前方位角',
        dataIndex: 'azimuth',
        key: 'azimuth',
      },
      {
        title: '调整后方位角',
        dataIndex: 'adjustedAzimuth',
        key: 'adjustedAzimuth',
      },
      {
        title: '距离',
        dataIndex: 'distance',
        key: 'distance',
      },
      {
        title: '调整前ΔX',
        dataIndex: 'deltaX',
        key: 'deltaX',
      },
      {
        title: '调整前ΔY',
        dataIndex: 'deltaY',
        key: 'deltaY',
      },
      {
        title: '调整后ΔX',
        dataIndex: 'correctedDeltaX',
        key: 'correctedDeltaX',
      },
      {
        title: '调整后ΔY',
        dataIndex: 'correctedDeltaY',
        key: 'correctedDeltaY',
      },
      {
        title: '调整后X坐标',
        dataIndex: 'adjustedX',
        key: 'adjustedX',
      },
      {
        title: '调整后Y坐标',
        dataIndex: 'adjustedY',
        key: 'adjustedY',
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
          scroll={{ x: true }}
        />
        <div className={styles.summaryContainer}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>总距离:</span>
            <span className={styles.summaryValue}>{calculationResult.totalDistance} m</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>X 闭合差:</span>
            <span className={styles.summaryValue}>{calculationResult.closureX} m</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Y 闭合差:</span>
            <span className={styles.summaryValue}>{calculationResult.closureY} m</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>总闭合差:</span>
            <span className={styles.summaryValue}>{calculationResult.closureDistance} m</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>闭合比例:</span>
            <span className={styles.summaryValue}>1/{calculationResult.closureRatio}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>方位角闭合差:</span>
            <span className={styles.summaryValue}>{calculationResult.azimuthClosure}°</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>角度改正数:</span>
            <span className={styles.summaryValue}>{calculationResult.angleCorrection}°/站</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>X坐标改正系数:</span>
            <span className={styles.summaryValue}>{calculationResult.distanceCorrectionX}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Y坐标改正系数:</span>
            <span className={styles.summaryValue}>{calculationResult.distanceCorrectionY}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <Form
        form={form}
        name="connectedTraverseForm"
        onFinish={handleCalculate}
        layout="vertical"
        className={styles.form}
      >
        {renderControlPointForm()}
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

export default ConnectedTraverse; 