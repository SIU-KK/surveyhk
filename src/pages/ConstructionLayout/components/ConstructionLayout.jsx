import React, { useState } from 'react';
import { Layout, Form, Input, Button, Table, Card, Space, Tabs, Menu, Select, Drawer } from 'antd';
import { HomeOutlined, CompassOutlined, CalculatorOutlined, AimOutlined, RadiusSettingOutlined, ToolOutlined, MonitorOutlined, MenuOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './ConstructionLayout.module.css';
import PointLayoutForm from './PointLayoutForm';

const { Content, Header } = Layout;
const { Option } = Select;

const ConstructionLayout = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [pointForm] = Form.useForm();
  const [lineForm] = Form.useForm();
  const [arcForm] = Form.useForm();
  const navigate = useNavigate();
  const [calculationResults, setCalculationResults] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [menuVisible, setMenuVisible] = useState(false);

  // 添加响应式监听
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const goHome = () => {
    navigate('/');
  };

  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: '返回主页',
      onClick: goHome
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
      key: 'circle-calculation',
      icon: <RadiusSettingOutlined />,
      label: '圆计算',
      onClick: () => navigate('/circle-calculation')
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

  // 将十进制角度转换为度分秒格式（DD.MMSS）
  const convertToDDMMSS = (decimalDegrees) => {
    const degrees = Math.floor(Math.abs(decimalDegrees));
    const minutesDecimal = (Math.abs(decimalDegrees) - degrees) * 60;
    const minutes = Math.floor(minutesDecimal);
    const seconds = Math.round((minutesDecimal - minutes) * 60);
    
    const sign = decimalDegrees < 0 ? '-' : '';
    return `${sign}${degrees.toString().padStart(3, '0')}.${minutes.toString().padStart(2, '0')}${seconds.toString().padStart(2, '0')}`;
  };

  const calculatePointLayout = (values) => {
    const {
      stationE, stationN, stationRL, instrumentHeight,
      pointE, pointN, pointRL, prismHeight
    } = values;

    // 计算水平距离 (HD)
    const deltaE = pointE - stationE;
    const deltaN = pointN - stationN;
    const horizontalDistance = Math.sqrt(deltaE * deltaE + deltaN * deltaN);

    // 计算方位角 (BRE)
    let angle = Math.atan(deltaE / deltaN) * 180 / Math.PI;
    
    // 根据象限判断方位角
    if (deltaN < 0) {
      angle += 180;
    }
    if (deltaE < 0 && angle <= 0) {
      angle += 360;
    }
    if (angle > 360) {
      angle -= 360;
    }

    // 转换为度分秒格式
    const degrees = Math.floor(angle);
    const minutes = Math.floor((angle - degrees) * 60);
    const seconds = Math.floor(((angle - degrees) * 60 - minutes) * 60);
    
    // BRE格式：度.分秒
    const bre = degrees + (minutes / 100) + (seconds / 10000);

    // 检查是否有高程相关数据
    const hasHeightData = stationRL && instrumentHeight && pointRL && prismHeight;

    let result = {
      key: '1',
      bearing: bre.toFixed(4),                           // 方位角
      horizontalDistance: horizontalDistance.toFixed(4),  // 水平距离
    };

    // 如果有高程数据，则计算垂直角和斜距
    if (hasHeightData) {
      const stationHeight = parseFloat(stationRL) + parseFloat(instrumentHeight);
      const targetHeight = parseFloat(pointRL) + parseFloat(prismHeight);
      
      let verticalAngle = Math.atan((targetHeight - stationHeight) / horizontalDistance) * 180 / Math.PI;
      verticalAngle = verticalAngle > 0 ? 90 - verticalAngle : verticalAngle;
      verticalAngle = verticalAngle < 0 ? 90 + (-verticalAngle) : verticalAngle;
      verticalAngle = verticalAngle === 0 ? 90 + verticalAngle : verticalAngle;

      const vaDegrees = Math.floor(verticalAngle);
      const vaMinutes = Math.floor((verticalAngle - vaDegrees) * 60);
      const vaSeconds = Math.floor(((verticalAngle - vaDegrees) * 60 - vaMinutes) * 60);
      const va = vaDegrees + (vaMinutes / 100) + (vaSeconds / 10000);

      const slopeDistance = Math.sqrt(horizontalDistance * horizontalDistance + Math.pow(targetHeight - stationHeight, 2));

      result.verticalAngle = va.toFixed(4);
      result.slopeDistance = slopeDistance.toFixed(4);
    }

    setCalculationResults([result]);
  };

  const calculateLineLayout = (values) => {
    const {
      startE, startN, startH,
      endE, endN, endH,
      pointE, pointN, pointH
    } = values;

    // 转换为数值类型
    const sE = parseFloat(startE);
    const sN = parseFloat(startN);
    const eE = parseFloat(endE);
    const eN = parseFloat(endN);
    const pE = parseFloat(pointE);
    const pN = parseFloat(pointN);

    // 计算线段方向向量
    const lineVectorE = eE - sE;
    const lineVectorN = eN - sN;
    const lineLength = Math.sqrt(lineVectorE * lineVectorE + lineVectorN * lineVectorN);

    // 计算点到起点的向量
    const pointVectorE = pE - sE;
    const pointVectorN = pN - sN;

    // 计算链距(C/H) - 点在线段上的投影距离
    const chainageRatio = (lineVectorE * pointVectorE + lineVectorN * pointVectorN) / (lineLength * lineLength);
    const chainage = chainageRatio * lineLength;

    // 计算偏距(O/S) - 点到线的垂直距离
    const offset = (lineVectorE * pointVectorN - lineVectorN * pointVectorE) / lineLength;

    // 计算高程差(Level)
    let levelDifference = null;
    let designHeight = null;
    const hasHeightData = startH && endH && pointH;

    if (hasHeightData) {
      // 计算线段的高程差和斜度
      const heightDifference = parseFloat(endH) - parseFloat(startH);
      // 根据链距比例计算设计高程
      designHeight = parseFloat(startH) + (chainageRatio * heightDifference);
      // 计算高程差 = 设计高程 - 放样点高程
      levelDifference = designHeight - parseFloat(pointH);
    }

    const result = {
      key: '1',
      chainage: chainage.toFixed(4),
      offset: offset.toFixed(4)
    };

    if (hasHeightData) {
      result.designHeight = designHeight.toFixed(4);
      result.level = levelDifference.toFixed(4);
    }

    setCalculationResults([result]);
  };

  const calculateArcLayout = (values) => {
    const {
      startE, startN, startH,
      endE, endN, endH,
      radius,
      pointE, pointN, pointH
    } = values;

    // 转换为数值类型
    const sE = parseFloat(startE);
    const sN = parseFloat(startN);
    const eE = parseFloat(endE);
    const eN = parseFloat(endN);
    const pE = parseFloat(pointE);
    const pN = parseFloat(pointN);
    const R = parseFloat(radius);

    // 计算圆弧参数
    const chordE = eE - sE;  // 弦向量E分量
    const chordN = eN - sN;  // 弦向量N分量
    const chordLength = Math.sqrt(chordE * chordE + chordN * chordN);  // 弦长
    
    // 计算圆心角（弧度）
    const centralAngle = 2 * Math.asin(chordLength / (2 * Math.abs(R)));
    
    // 计算圆心坐标
    const halfChord = chordLength / 2;
    const sagitta = Math.abs(R) * (1 - Math.cos(centralAngle / 2));  // 弓高
    const centerDistance = Math.sqrt(R * R - halfChord * halfChord);  // 圆心到弦的距离
    
    // 计算单位向量
    const unitChordE = chordE / chordLength;
    const unitChordN = chordN / chordLength;
    
    // 计算垂直于弦的单位向量（顺时针旋转90度）
    const unitPerpE = -unitChordN;
    const unitPerpN = unitChordE;
    
    // 根据半径的正负确定圆心位置
    const sign = R >= 0 ? 1 : -1;
    const centerE = sE + chordE/2 + sign * centerDistance * unitPerpE;
    const centerN = sN + chordN/2 + sign * centerDistance * unitPerpN;

    // 计算放样点到圆心的向量
    const pointVectorE = pE - centerE;
    const pointVectorN = pN - centerN;
    const pointRadius = Math.sqrt(pointVectorE * pointVectorE + pointVectorN * pointVectorN);
    
    // 计算偏距 (O/S) - 点到圆弧的径向距离
    const offset = pointRadius - Math.abs(R);

    // 计算链距 (C/H) - 沿圆弧的距离
    // 计算起点到放样点的角度
    const startAngle = Math.atan2(sN - centerN, sE - centerE);
    const pointAngle = Math.atan2(pN - centerN, pE - centerE);
    
    // 调整角度确保正确的方向
    let angleDiff = pointAngle - startAngle;
    if (R < 0) {
      if (angleDiff > 0) angleDiff -= 2 * Math.PI;
    } else {
      if (angleDiff < 0) angleDiff += 2 * Math.PI;
    }
    
    const chainage = Math.abs(R) * Math.abs(angleDiff);

    // 计算设计高程和高程差
    let designHeight = null;
    let levelDifference = null;
    const hasHeightData = startH && endH && pointH;

    if (hasHeightData) {
      const arcLength = Math.abs(R * centralAngle);
      const heightDifference = parseFloat(endH) - parseFloat(startH);
      const chainageRatio = chainage / arcLength;
      designHeight = parseFloat(startH) + (chainageRatio * heightDifference);
      levelDifference = designHeight - parseFloat(pointH);
    }

    const result = {
      key: '1',
      chainage: chainage.toFixed(4),
      offset: offset.toFixed(4)
    };

    if (hasHeightData) {
      result.designHeight = designHeight.toFixed(4);
      result.level = levelDifference.toFixed(4);
    }

    setCalculationResults([result]);
  };

  const onFinish = (values) => {
    calculatePointLayout(values);
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    // 只有在切换到不同标签页时才重置表单和清除结果
    if (key !== activeTab) {
      setCalculationResults([]);
      // 重置当前激活的表单
      switch(key) {
        case '1':
          pointForm.resetFields();
          break;
        case '2':
          lineForm.resetFields();
          break;
        case '3':
          arcForm.resetFields();
          break;
      }
    }
  };

  const renderPointLayoutForm = () => (
    <Form form={pointForm} layout="vertical" onFinish={calculatePointLayout}>
      <div className={styles.formGroup}>
        <Form.Item label="测站数据" className={styles.formItem}>
          <Form.Item name="stationE" rules={[{ required: true, message: '请输入测站E坐标' }]}>
            <Input placeholder="E坐标" />
          </Form.Item>
          <Form.Item name="stationN" rules={[{ required: true, message: '请输入测站N坐标' }]}>
            <Input placeholder="N坐标" />
          </Form.Item>
          <Form.Item name="stationRL" rules={[{ required: false }]}>
            <Input placeholder="RL高程（选填）" />
          </Form.Item>
          <Form.Item name="instrumentHeight" rules={[{ required: false }]}>
            <Input placeholder="仪器高度(IH)（选填）" />
          </Form.Item>
        </Form.Item>
        <Form.Item label="放样点数据" className={styles.formItem}>
          <Form.Item name="pointE" rules={[{ required: true, message: '请输入放样点E坐标' }]}>
            <Input placeholder="E坐标" />
          </Form.Item>
          <Form.Item name="pointN" rules={[{ required: true, message: '请输入放样点N坐标' }]}>
            <Input placeholder="N坐标" />
          </Form.Item>
          <Form.Item name="pointRL" rules={[{ required: false }]}>
            <Input placeholder="RL高程（选填）" />
          </Form.Item>
          <Form.Item name="prismHeight" rules={[{ required: false }]}>
            <Input placeholder="棱镜高度(PH)（选填）" />
          </Form.Item>
        </Form.Item>
      </div>
      <Button type="primary" size="large" className={styles.submitButton} htmlType="submit">计算</Button>
    </Form>
  );

  const renderLineLayoutForm = () => (
    <Form form={lineForm} layout="vertical" onFinish={calculateLineLayout}>
      <div className={styles.formGroup}>
        <Form.Item label="起点坐标" className={styles.formItem}>
          <Form.Item name="startE" rules={[{ required: true, message: '请输入起点E坐标' }]}>
            <Input placeholder="E坐标" />
          </Form.Item>
          <Form.Item name="startN" rules={[{ required: true, message: '请输入起点N坐标' }]}>
            <Input placeholder="N坐标" />
          </Form.Item>
          <Form.Item name="startH" rules={[{ required: false }]}>
            <Input placeholder="高程（选填）" />
          </Form.Item>
        </Form.Item>
        <Form.Item label="终点坐标" className={styles.formItem}>
          <Form.Item name="endE" rules={[{ required: true, message: '请输入终点E坐标' }]}>
            <Input placeholder="E坐标" />
          </Form.Item>
          <Form.Item name="endN" rules={[{ required: true, message: '请输入终点N坐标' }]}>
            <Input placeholder="N坐标" />
          </Form.Item>
          <Form.Item name="endH" rules={[{ required: false }]}>
            <Input placeholder="高程（选填）" />
          </Form.Item>
        </Form.Item>
        <Form.Item label="放样点坐标" className={styles.formItem}>
          <Form.Item name="pointE" rules={[{ required: true, message: '请输入放样点E坐标' }]}>
            <Input placeholder="E坐标" />
          </Form.Item>
          <Form.Item name="pointN" rules={[{ required: true, message: '请输入放样点N坐标' }]}>
            <Input placeholder="N坐标" />
          </Form.Item>
          <Form.Item name="pointH" rules={[{ required: false }]}>
            <Input placeholder="高程（选填）" />
          </Form.Item>
        </Form.Item>
      </div>
      <Button type="primary" size="large" className={styles.submitButton} htmlType="submit">计算</Button>
    </Form>
  );

  const renderArcLayoutForm = () => (
    <Form form={arcForm} layout="vertical" onFinish={calculateArcLayout}>
      <div className={styles.formGroup}>
        <Form.Item label="圆弧起点" className={styles.formItem}>
          <Form.Item name="startE" rules={[{ required: true, message: '请输入起点E坐标' }]}>
            <Input placeholder="E坐标" />
          </Form.Item>
          <Form.Item name="startN" rules={[{ required: true, message: '请输入起点N坐标' }]}>
            <Input placeholder="N坐标" />
          </Form.Item>
          <Form.Item name="startH" rules={[{ required: false }]}>
            <Input placeholder="高程（选填）" />
          </Form.Item>
        </Form.Item>
        <Form.Item label="圆弧终点" className={styles.formItem}>
          <Form.Item name="endE" rules={[{ required: true, message: '请输入终点E坐标' }]}>
            <Input placeholder="E坐标" />
          </Form.Item>
          <Form.Item name="endN" rules={[{ required: true, message: '请输入终点N坐标' }]}>
            <Input placeholder="N坐标" />
          </Form.Item>
          <Form.Item name="endH" rules={[{ required: false }]}>
            <Input placeholder="高程（选填）" />
          </Form.Item>
        </Form.Item>
        <Form.Item label="圆弧参数" className={styles.formItem}>
          <Form.Item 
            name="radius" 
            rules={[{ 
              required: true, 
              message: '请输入半径（正值表示圆心在右侧，负值表示圆心在左侧）' 
            }]}
          >
            <Input placeholder="半径（+/-）" />
          </Form.Item>
        </Form.Item>
        <Form.Item label="放样点坐标" className={styles.formItem}>
          <Form.Item name="pointE" rules={[{ required: true, message: '请输入放样点E坐标' }]}>
            <Input placeholder="E坐标" />
          </Form.Item>
          <Form.Item name="pointN" rules={[{ required: true, message: '请输入放样点N坐标' }]}>
            <Input placeholder="N坐标" />
          </Form.Item>
          <Form.Item name="pointH" rules={[{ required: false }]}>
            <Input placeholder="高程（选填）" />
          </Form.Item>
        </Form.Item>
      </div>
      <Button type="primary" size="large" className={styles.submitButton} htmlType="submit">计算</Button>
    </Form>
  );

  const items = [
    {
      key: '1',
      label: '点放样',
      children: (
        <Card title="计算参数" className={styles.card}>
          {renderPointLayoutForm()}
        </Card>
      ),
    },
    {
      key: '2',
      label: '线放样',
      children: (
        <Card title="计算参数" className={styles.card}>
          {renderLineLayoutForm()}
        </Card>
      ),
    },
    {
      key: '3',
      label: '弧放样',
      children: (
        <Card title="计算参数" className={styles.card}>
          {renderArcLayoutForm()}
        </Card>
      ),
    },
  ];

  return (
    <Layout className={styles.container}>
      <Header className={styles.header}>
        {isMobile ? (
          <>
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMenuVisible(true)}
              className={styles.menuButton}
            />
            <Drawer
              title="导航菜单"
              placement="left"
              onClose={() => setMenuVisible(false)}
              visible={menuVisible}
              bodyStyle={{ padding: 0 }}
            >
              <Menu
                theme="light"
                mode="inline"
                items={menuItems}
                selectedKeys={['construction-layout']}
                className={styles.drawerMenu}
                onClick={() => setMenuVisible(false)}
              />
            </Drawer>
          </>
        ) : (
          <Menu
            theme="light"
            mode="horizontal"
            items={menuItems}
            selectedKeys={['construction-layout']}
            className={styles.menu}
          />
        )}
      </Header>
      <Content className={styles.content}>
        <div className={`${styles.banner} ${isMobile ? styles.mobileBanner : ''}`}>
          <h1 className={styles.bannerTitle}>施工放样计算</h1>
          <p className={styles.bannerDescription}>
            专业的施工放样计算工具，支持点、线、弧等多种放样方式
          </p>
        </div>
        <div className={`${styles.mainContent} ${isMobile ? styles.mobileContent : ''}`}>
          <Card className={`${styles.mainCard} ${isMobile ? styles.mobileCard : ''}`}>
            <Tabs 
              activeKey={activeTab} 
              onChange={handleTabChange}
              items={items}
              className={`${styles.customTabs} ${isMobile ? styles.mobileTabs : ''}`}
            />
            {calculationResults.length > 0 && (
              <Card 
                title={
                  <div className={styles.resultTitle}>
                    <span>计算结果</span>
                    <span className={styles.resultTime}>{new Date().toLocaleString()}</span>
                  </div>
                } 
                className={`${styles.resultCard} ${isMobile ? styles.mobileResultCard : ''}`}
              >
                <div className={styles.tableWrapper}>
                  <Table
                    dataSource={calculationResults}
                    columns={activeTab === '1' ? [
                      {
                        title: '方位角(BRE)',
                        dataIndex: 'bearing',
                        key: 'bearing',
                        align: 'center'
                      },
                      ...(calculationResults[0]?.verticalAngle ? [{
                        title: '垂直角(VA)',
                        dataIndex: 'verticalAngle',
                        key: 'verticalAngle',
                        align: 'center'
                      }] : []),
                      {
                        title: '水平距离(HD)',
                        dataIndex: 'horizontalDistance',
                        key: 'horizontalDistance',
                        align: 'center',
                        render: (text) => `${text}m`
                      },
                      ...(calculationResults[0]?.slopeDistance ? [{
                        title: '斜距(SD)',
                        dataIndex: 'slopeDistance',
                        key: 'slopeDistance',
                        align: 'center',
                        render: (text) => `${text}m`
                      }] : [])
                    ] : [
                      {
                        title: '链距(C/H)',
                        dataIndex: 'chainage',
                        key: 'chainage',
                        align: 'center',
                        render: (text) => `${text}m`
                      },
                      {
                        title: '偏距(O/S)',
                        dataIndex: 'offset',
                        key: 'offset',
                        align: 'center',
                        render: (text) => `${text}m`
                      },
                      ...(calculationResults[0]?.designHeight ? [
                        {
                          title: '设计高程',
                          dataIndex: 'designHeight',
                          key: 'designHeight',
                          align: 'center',
                          render: (text) => `${text}m`
                        },
                        {
                          title: '高程差',
                          dataIndex: 'level',
                          key: 'level',
                          align: 'center',
                          render: (text) => (
                            <span>
                              {parseFloat(text) === 0 ? '±' : parseFloat(text) > 0 ? '↑' : '↓'} {Math.abs(parseFloat(text)).toFixed(4)}m
                            </span>
                          )
                        }
                      ] : [])
                    ]}
                    pagination={false}
                    bordered
                  />
                </div>
              </Card>
            )}
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default ConstructionLayout;