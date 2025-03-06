import React, { useState } from 'react';
import { Form, Input, Button, Space, Upload, Row, Col, Card, Divider, message } from 'antd';
import { PlusOutlined, DeleteOutlined, UploadOutlined, MinusCircleOutlined } from '@ant-design/icons';
import styles from '../BatchLayout.module.css';

const DirectionInverse = ({ form }) => {
  const [stationData, setStationData] = useState({
    stationN: '',
    stationE: '',
    stationRL: '',
    stationIH: '',
  });

  const [pointList, setPointList] = useState([
    { id: 1, point: '', n: '', e: '', rl: '', ph: '', remarks: '' }
  ]);

  // 处理测站数据变化
  const handleStationChange = (field, value) => {
    setStationData({
      ...stationData,
      [field]: value
    });
  };

  // 处理表单提交
  const handleSubmit = () => {
    // 这里可以处理数据提交逻辑
    console.log('测站数据:', stationData);
    console.log('点位数据:', pointList);
    message.success('数据已处理，准备生成GSI文件');
  };

  // 处理Excel导入
  const handleImport = (file) => {
    // 这里可以添加Excel导入逻辑
    message.info('Excel导入功能正在开发中');
    return false; // 阻止默认上传行为
  };

  return (
    <div className={styles.directionInverseContainer}>
      <Card 
        className={styles.stationCard} 
        title="测站数据" 
        bordered={true}
        style={{ width: '100%' }}
      >
        <Form layout="horizontal" style={{ width: '100%' }}>
          <Row gutter={24} style={{ width: '100%' }}>
            <Col xs={24} sm={12} md={6} lg={6}>
              <Form.Item label="N坐标" required>
                <Input
                  placeholder="输入测站N坐标"
                  value={stationData.stationN}
                  onChange={(e) => handleStationChange('stationN', e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6} lg={6}>
              <Form.Item label="E坐标" required>
                <Input
                  placeholder="输入测站E坐标"
                  value={stationData.stationE}
                  onChange={(e) => handleStationChange('stationE', e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6} lg={6}>
              <Form.Item label="RL高程">
                <Input
                  placeholder="输入测站高程（可选）"
                  value={stationData.stationRL}
                  onChange={(e) => handleStationChange('stationRL', e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6} lg={6}>
              <Form.Item label="IH仪器高">
                <Input
                  placeholder="输入仪器高（可选）"
                  value={stationData.stationIH}
                  onChange={(e) => handleStationChange('stationIH', e.target.value)}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card 
        className={styles.pointDataCard} 
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <span>点位数据</span>
            <Space>
              <Upload 
                beforeUpload={handleImport}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />}>
                  导入Excel
                </Button>
              </Upload>
            </Space>
          </div>
        }
        bordered={true}
        style={{ width: '100%' }}
      >
        <div className={styles.pointDataHeader}>
          <Row gutter={16} style={{ width: '100%', textAlign: 'center', fontWeight: 'bold' }}>
            <Col xs={24} sm={12} md={3} lg={3}>Point</Col>
            <Col xs={24} sm={12} md={4} lg={4}>N坐标</Col>
            <Col xs={24} sm={12} md={4} lg={4}>E坐标</Col>
            <Col xs={24} sm={12} md={3} lg={3}>RL高程</Col>
            <Col xs={24} sm={12} md={3} lg={3}>PH棱镜高</Col>
            <Col xs={24} sm={12} md={6} lg={6}>备注</Col>
            <Col span={1}>操作</Col>
          </Row>
        </div>
        <Divider style={{ margin: '8px 0 16px 0' }} />
        
        <Form 
          name="pointDataForm"
          className={styles.pointDataForm}
          style={{ width: '100%' }}
        >
          <Form.List
            name="points"
            initialValue={[{}]}
          >
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }, index) => (
                  <div key={key} className={styles.pointItem}>
                    <Row gutter={16} align="middle" style={{ width: '100%' }}>
                      <Col xs={24} sm={12} md={3} lg={3}>
                        <Form.Item
                          {...restField}
                          name={[name, 'point']}
                        >
                          <Input placeholder="输入点名" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={4} lg={4}>
                        <Form.Item
                          {...restField}
                          name={[name, 'n']}
                          rules={[{ required: true, message: '请输入N坐标' }]}
                        >
                          <Input placeholder="输入N坐标" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={4} lg={4}>
                        <Form.Item
                          {...restField}
                          name={[name, 'e']}
                          rules={[{ required: true, message: '请输入E坐标' }]}
                        >
                          <Input placeholder="输入E坐标" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={3} lg={3}>
                        <Form.Item
                          {...restField}
                          name={[name, 'rl']}
                        >
                          <Input placeholder="输入高程（可选）" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={3} lg={3}>
                        <Form.Item
                          {...restField}
                          name={[name, 'ph']}
                        >
                          <Input placeholder="输入棱镜高（可选）" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={6} lg={6}>
                        <Form.Item
                          {...restField}
                          name={[name, 'remarks']}
                        >
                          <Input placeholder="输入备注（可选）" />
                        </Form.Item>
                      </Col>
                      <Col span={1}>
                        {fields.length > 1 && (
                          <MinusCircleOutlined
                            className={styles.deleteIcon}
                            onClick={() => remove(name)}
                          />
                        )}
                      </Col>
                    </Row>
                    {index < fields.length - 1 && <Divider style={{ margin: '8px 0' }} />}
                  </div>
                ))}
                <Form.Item style={{ marginTop: 16 }}>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    icon={<PlusOutlined />}
                    style={{ width: '100%' }}
                  >
                    添加点位
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Card>

      <div className={styles.actionButtons}>
        <Button type="primary" size="large" onClick={handleSubmit}>
          计算并生成GSI文件
        </Button>
      </div>
    </div>
  );
};

export default DirectionInverse; 