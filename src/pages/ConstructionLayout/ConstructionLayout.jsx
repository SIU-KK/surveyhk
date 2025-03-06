import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Table, message, Card, Layout, Menu, Drawer, Space } from 'antd';
import { 
  HomeOutlined, 
  CompassOutlined, 
  CalculatorOutlined, 
  AimOutlined, 
  RadiusSettingOutlined, 
  ToolOutlined, 
  MonitorOutlined, 
  MenuOutlined,
  PlusOutlined,
  MinusCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './ConstructionLayout.module.css';

const { Content } = Layout;

const ConstructionLayout = () => {
  const [form] = Form.useForm();
  const [points, setPoints] = useState([{ key: '0' }]);
  const [calculationResult, setCalculationResult] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [deviceType, setDeviceType] = useState('desktop');

  useEffect(() => {
    // 检测设备类型
    const checkDeviceType = () => {
      const width = window.innerWidth;
      if (width <= 768) {
        setDeviceType('mobile');
        setIsMobile(true);
      } else if (width <= 1024) {
        setDeviceType('tablet');
        setIsMobile(false);
      } else {
        setDeviceType('desktop');
        setIsMobile(false);
      }
    };

    // 初始化设置
    checkDeviceType();

    // 添加窗口大小变化监听
    window.addEventListener('resize', checkDeviceType);

    // 清理函数
    return () => {
      window.removeEventListener('resize', checkDeviceType);
    };
  }, []);

  // 定义菜单项
  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '返回主页',
      onClick: () => navigate('/')
    },
    {
      key: 'survey-station',
      icon: <CompassOutlined />,
      label: '香港测量控制站查询',
      onClick: () => navigate('/survey-station')
    },
    {
      key: 'free-station',
      icon: <CalculatorOutlined />,
      label: '自由设站解算',
      onClick: () => navigate('/free-station')
    },
    {
      key: 'traverse-calculation',
      icon: <AimOutlined />,
      label: '导线计算',
      onClick: () => navigate('/traverse-calculation')
    },
    {
      key: 'construction-layout',
      icon: <RadiusSettingOutlined />,
      label: '施工放样'
    },
    {
      key: 'batch-calculation',
      icon: <RadiusSettingOutlined />,
      label: '批量计算及转换',
      onClick: () => navigate('/batch-calculation')
    },
    {
      key: 'tools',
      icon: <ToolOutlined />,
      label: '实用工具',
      onClick: () => navigate('/tools')
    },
    {
      key: 'settlement-monitoring',
      icon: <MonitorOutlined />,
      label: '沉降监测系统',
      onClick: () => navigate('/settlement-monitoring')
    }
  ];

  const handleMenuClick = ({ key }) => {
    if (key === '/') {
      navigate('/');
    } else {
      navigate(`/${key}`);
    }
    setDrawerVisible(false);
  };

  // 重置表单数据
  const handleReset = () => {
    form.resetFields();
    setPoints([{ key: '0' }]);
    setCalculationResult(null);
    message.success('表单已重置');
  };

  // 处理表单值变化
  const handleValuesChange = (changedValues, allValues) => {
    if (changedValues.points) {
      const newPoints = changedValues.points.map((point, index) => ({
        ...point,
        key: index.toString(),
      }));
      setPoints(newPoints);
    }
  };

  // 添加放样点
  const addPoint = () => {
    const newPoint = { key: points.length.toString() };
    const newPoints = [...points, newPoint];
    setPoints(newPoints);
    
    const currentPoints = form.getFieldValue('points') || [];
    const updatedPoints = [...currentPoints, { id: '', e: '', n: '', h: '' }];
    form.setFieldsValue({ points: updatedPoints });
  };

  // 删除放样点
  const removePoint = (index) => {
    if (points.length <= 1) {
      message.warning('至少需要保留一个放样点');
      return;
    }
    
    const newPoints = points.filter((_, i) => i !== index);
    setPoints(newPoints);
    
    const currentPoints = form.getFieldValue('points');
    const updatedPoints = currentPoints.filter((_, i) => i !== index);
    form.setFieldsValue({ points: updatedPoints });
  };

  // 计算放样数据
  const handleCalculate = (values) => {
    try {
      console.log('计算开始，表单数据:', values);
      
      // 获取仪器点坐标
      const stationE = Number(values.station.e);
      const stationN = Number(values.station.n);
      const stationH = Number(values.station.h);
      
      // 计算每个放样点的放样数据
      const calculatedPoints = values.points.map(point => {
        const pointE = Number(point.e);
        const pointN = Number(point.n);
        const pointH = Number(point.h);
        
        // 计算水平距离
        const deltaE = pointE - stationE;
        const deltaN = pointN - stationN;
        const horizontalDistance = Math.sqrt(deltaE * deltaE + deltaN * deltaN);
        
        // 计算方位角
        let azimuth = Math.atan2(deltaE, deltaN) * 180 / Math.PI;
        if (azimuth < 0) {
          azimuth += 360;
        }
        
        // 计算高差和竖直角
        const deltaH = pointH - stationH;
        const verticalAngle = Math.atan2(deltaH, horizontalDistance) * 180 / Math.PI;
        
        // 计算斜距
        const slopeDistance = Math.sqrt(horizontalDistance * horizontalDistance + deltaH * deltaH);
        
        return {
          ...point,
          azimuth: azimuth.toFixed(4),
          horizontalDistance: horizontalDistance.toFixed(4),
          verticalAngle: verticalAngle.toFixed(4),
          slopeDistance: slopeDistance.toFixed(4),
          deltaH: deltaH.toFixed(4)
        };
      });
      
      setCalculationResult({
        station: values.station,
        points: calculatedPoints
      });
      
      message.success('计算完成');
      
    } catch (error) {
      console.error('计算错误:', error);
      message.error('计算过程中发生错误: ' + error.message);
    }
  };

  // 渲染仪器点表单
  const renderStationForm = () => {
    return (
      <div className={styles.stationContainer}>
        <h3 className={styles.sectionTitle}>仪器点</h3>
        <div className={styles.formGrid}>
          <Form.Item label="点号" name={['station', 'id']}>
            <Input placeholder="输入点号" className={styles.inputField} size="large" />
          </Form.Item>
          <Form.Item label="E坐标" name={['station', 'e']} rules={[{ required: true, message: '请输入E坐标' }]}>
            <Input placeholder="输入E坐标" className={styles.inputField} size="large" />
          </Form.Item>
          <Form.Item label="N坐标" name={['station', 'n']} rules={[{ required: true, message: '请输入N坐标' }]}>
            <Input placeholder="输入N坐标" className={styles.inputField} size="large" />
          </Form.Item>
          <Form.Item label="H坐标" name={['station', 'h']} rules={[{ required: true, message: '请输入H坐标' }]}>
            <Input placeholder="输入H坐标" className={styles.inputField} size="large" />
          </Form.Item>
        </div>
      </div>
    );
  };

  // 渲染放样点表格
  const renderPointsTable = () => {
    return (
      <div className={styles.pointsTableContainer}>
        <h3 className={styles.sectionTitle}>放样点</h3>
        <Form.List name="points">
          {(fields, { add, remove }) => (
            <>
              <Table
                dataSource={points}
                pagination={false}
                rowKey="key"
                size="middle"
                className={styles.dataTable}
                columns={[
                  {
                    title: '点号',
                    dataIndex: 'id',
                    key: 'id',
                    render: (_, __, index) => (
                      <Form.Item
                        name={[index, 'id']}
                        rules={[{ required: true, message: '请输入点号' }]}
                        style={{ margin: 0 }}
                      >
                        <Input placeholder="点号" className={styles.inputField} size="large" />
                      </Form.Item>
                    ),
                  },
                  {
                    title: 'E坐标',
                    dataIndex: 'e',
                    key: 'e',
                    render: (_, __, index) => (
                      <Form.Item
                        name={[index, 'e']}
                        rules={[{ required: true, message: '请输入E坐标' }]}
                        style={{ margin: 0 }}
                      >
                        <Input placeholder="E坐标" className={styles.inputField} size="large" />
                      </Form.Item>
                    ),
                  },
                  {
                    title: 'N坐标',
                    dataIndex: 'n',
                    key: 'n',
                    render: (_, __, index) => (
                      <Form.Item
                        name={[index, 'n']}
                        rules={[{ required: true, message: '请输入N坐标' }]}
                        style={{ margin: 0 }}
                      >
                        <Input placeholder="N坐标" className={styles.inputField} size="large" />
                      </Form.Item>
                    ),
                  },
                  {
                    title: 'H坐标',
                    dataIndex: 'h',
                    key: 'h',
                    render: (_, __, index) => (
                      <Form.Item
                        name={[index, 'h']}
                        rules={[{ required: true, message: '请输入H坐标' }]}
                        style={{ margin: 0 }}
                      >
                        <Input placeholder="H坐标" className={styles.inputField} size="large" />
                      </Form.Item>
                    ),
                  },
                  {
                    title: '操作',
                    key: 'action',
                    render: (_, __, index) => (
                      <Button
                        type="text"
                        danger
                        icon={<MinusCircleOutlined />}
                        onClick={() => removePoint(index)}
                      />
                    ),
                  },
                ]}
              />
              <div className={styles.tableActions}>
                <Button
                  type="dashed"
                  onClick={addPoint}
                  icon={<PlusOutlined />}
                  className={styles.addButton}
                  size="large"
                >
                  添加放样点
                </Button>
              </div>
            </>
          )}
        </Form.List>
      </div>
    );
  };

  // 渲染计算结果
  const renderCalculationResult = () => {
    if (!calculationResult) return null;

    const resultColumns = [
      {
        title: '点号',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: '方位角',
        dataIndex: 'azimuth',
        key: 'azimuth',
        render: (text) => `${text}°`,
      },
      {
        title: '水平距离',
        dataIndex: 'horizontalDistance',
        key: 'horizontalDistance',
        render: (text) => `${text} m`,
      },
      {
        title: '竖直角',
        dataIndex: 'verticalAngle',
        key: 'verticalAngle',
        render: (text) => `${text}°`,
      },
      {
        title: '斜距',
        dataIndex: 'slopeDistance',
        key: 'slopeDistance',
        render: (text) => `${text} m`,
      },
      {
        title: '高差',
        dataIndex: 'deltaH',
        key: 'deltaH',
        render: (text) => `${text} m`,
      },
    ];

    return (
      <div className={styles.calculationResult}>
        <div className={styles.stationInfo}>
          <h3 className={styles.sectionTitle}>仪器点信息</h3>
          <div className={styles.infoGrid}>
            <p><strong>点号:</strong> {calculationResult.station.id || '未命名'}</p>
            <p><strong>E:</strong> {calculationResult.station.e} m</p>
            <p><strong>N:</strong> {calculationResult.station.n} m</p>
            <p><strong>H:</strong> {calculationResult.station.h} m</p>
          </div>
        </div>
        <h3 className={styles.sectionTitle}>放样数据</h3>
        <Table
          dataSource={calculationResult.points}
          columns={resultColumns}
          pagination={false}
          rowKey="id"
          size="middle"
          className={styles.resultTable}
          bordered
        />
      </div>
    );
  };

  return (
    <Layout className={styles.layout}>
      {/* 桌面端菜单 */}
      <div className={styles.header}>
        <Menu
          mode="horizontal"
          items={menuItems}
          onClick={handleMenuClick}
          className={styles.menu}
          selectedKeys={['construction-layout']}
        />
      </div>

      {/* 移动端顶部导航 */}
      <div className={styles.mobileHeader}>
        <Button 
          icon={<MenuOutlined />}
          onClick={() => setDrawerVisible(true)}
          type="text"
          className={styles.menuButton}
        />
        <div className={styles.headerTitle}>施工放样</div>
        <div style={{ width: 32 }}></div>
      </div>

      {/* 移动端导航抽屉 */}
      <Drawer
        title="导航菜单"
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={250}
      >
        <Menu
          mode="vertical"
          items={menuItems}
          onClick={handleMenuClick}
          selectedKeys={['construction-layout']}
        />
      </Drawer>

      <Content className={styles.content}>
        <div className={styles.pageContainer}>
          <Card 
            className={styles.mainCard}
            bordered={false}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleCalculate}
              onValuesChange={handleValuesChange}
              initialValues={{
                station: { id: '', e: '', n: '', h: '' },
                points: [{ id: '', e: '', n: '', h: '' }]
              }}
              className={styles.form}
            >
              {renderStationForm()}
              {renderPointsTable()}
              <div className={styles.buttonGroup}>
                <Button type="primary" onClick={() => form.submit()} className={styles.submitButton} size="large" icon={<CalculatorOutlined />}>
                  计算
                </Button>
                <Button onClick={handleReset} className={styles.resetButton} size="large">
                  重置
                </Button>
              </div>
            </Form>
          </Card>

          {calculationResult && (
            <Card 
              className={styles.resultCard}
              bordered={false}
            >
              {renderCalculationResult()}
            </Card>
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default ConstructionLayout; 