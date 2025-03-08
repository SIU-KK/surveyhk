import React, { useState, useEffect } from 'react';
import { Layout, Form, Input, Button, Table, Card, Space, Tabs, Menu, Select, Drawer, Radio, Row, Col, Divider } from 'antd';
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
  const [drawerVisible, setDrawerVisible] = useState(false);

  // 添加响应式监听
  useEffect(() => {
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
      stationE, stationN, stationH,
      chainage: initialChainage = "0",
      offsetDistance,
      heightOffset,
      chainageOffset
    } = values;

    // 转换为数值类型
    const sE = parseFloat(startE);
    const sN = parseFloat(startN);
    const eE = parseFloat(endE);
    const eN = parseFloat(endN);
    const stE = parseFloat(stationE);
    const stN = parseFloat(stationN);
    const initialCH = parseFloat(initialChainage) || 0;
    
    // 平移数据（如果有）
    const offsetDist = offsetDistance ? parseFloat(offsetDistance) : 0;
    const heightOffsetVal = heightOffset ? parseFloat(heightOffset) : 0;
    const chainageOffsetVal = chainageOffset ? parseFloat(chainageOffset) : 0;

    // 计算线段方向向量
    const lineVectorE = eE - sE;
    const lineVectorN = eN - sN;
    const lineLength = Math.sqrt(lineVectorE * lineVectorE + lineVectorN * lineVectorN);
    
    // 单位方向向量
    const unitVectorE = lineVectorE / lineLength;
    const unitVectorN = lineVectorN / lineLength;
    
    // 垂直于线段的单位向量（顺时针旋转90度）
    const perpVectorE = unitVectorN;
    const perpVectorN = -unitVectorE;

    // 计算测站到起点的向量
    const stationVectorE = stE - sE;
    const stationVectorN = stN - sN;

    // 计算链距(C/H) - 测站在线段上的投影距离
    const projectionDistance = (unitVectorE * stationVectorE + unitVectorN * stationVectorN);
    // 应用链距平移
    const chainage = initialCH + projectionDistance + chainageOffsetVal;

    // 计算偏距(O/S) - 测站到线的垂直距离
    // 正值表示测站在线的右侧，负值表示在左侧
    const rawOffset = (lineVectorE * stationVectorN - lineVectorN * stationVectorE) / lineLength;
    // 应用平移距离
    const offset = rawOffset + offsetDist;

    // 计算设计高程和高程差
    let designHeight = null;
    let levelDifference = null;
    const hasHeightData = startH && endH && stationH;

    if (hasHeightData) {
      const sH = parseFloat(startH);
      const eH = parseFloat(endH);
      const stH = parseFloat(stationH);
      
      // 计算线段的高程差和斜度
      const heightDifference = eH - sH;
      const slope = heightDifference / lineLength;
      
      // 根据投影距离计算设计高程
      const rawDesignHeight = sH + (projectionDistance * slope);
      // 应用高程平移
      designHeight = rawDesignHeight + heightOffsetVal;
      
      // 计算高程差 = 设计高程 - 测站高程
      levelDifference = designHeight - stH;
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
      pointE, pointN, pointH,
      radiusOffset,
      heightOffset,
      chainageOffset
    } = values;

    // 转换为数值类型
    const sE = parseFloat(startE);
    const sN = parseFloat(startN);
    const eE = parseFloat(endE);
    const eN = parseFloat(endN);
    const pE = parseFloat(pointE);
    const pN = parseFloat(pointN);
    const R = parseFloat(radius);
    
    // 平移数据（如果有）
    const radiusOffsetVal = radiusOffset ? parseFloat(radiusOffset) : 0;
    const heightOffsetVal = heightOffset ? parseFloat(heightOffset) : 0;
    const chainageOffsetVal = chainageOffset ? parseFloat(chainageOffset) : 0;
    
    // 应用半径平移
    const adjustedRadius = R + radiusOffsetVal;

    // 计算圆弧参数
    const chordE = eE - sE;  // 弦向量E分量
    const chordN = eN - sN;  // 弦向量N分量
    const chordLength = Math.sqrt(chordE * chordE + chordN * chordN);  // 弦长
    
    // 计算圆心角（弧度）
    const centralAngle = 2 * Math.asin(chordLength / (2 * Math.abs(adjustedRadius)));
    
    // 计算圆心坐标
    const halfChord = chordLength / 2;
    const sagitta = Math.abs(adjustedRadius) * (1 - Math.cos(centralAngle / 2));  // 弓高
    const centerDistance = Math.sqrt(adjustedRadius * adjustedRadius - halfChord * halfChord);  // 圆心到弦的距离
    
    // 计算单位向量
    const unitChordE = chordE / chordLength;
    const unitChordN = chordN / chordLength;
    
    // 计算垂直于弦的单位向量（从起点到终点方向看，右侧为正，左侧为负）
    // 顺时针旋转90度得到的向量指向右侧
    const unitPerpE = unitChordN;
    const unitPerpN = -unitChordE;
    
    // 根据半径的正负确定圆心位置
    // 正值表示圆心在起点到终点方向的右侧，负值表示在左侧
    const sign = adjustedRadius >= 0 ? 1 : -1;
    const centerE = sE + chordE/2 + sign * centerDistance * unitPerpE;
    const centerN = sN + chordN/2 + sign * centerDistance * unitPerpN;

    // 计算放样点到圆心的向量
    const pointVectorE = pE - centerE;
    const pointVectorN = pN - centerN;
    const pointRadius = Math.sqrt(pointVectorE * pointVectorE + pointVectorN * pointVectorN);
    
    // 计算偏距 (O/S) - 点到圆弧的径向距离
    const offset = pointRadius - Math.abs(adjustedRadius);

    // 计算链距 (C/H) - 沿圆弧的距离
    // 计算起点到放样点的角度
    const startAngle = Math.atan2(sN - centerN, sE - centerE);
    const pointAngle = Math.atan2(pN - centerN, pE - centerE);
    
    // 调整角度确保正确的方向
    let angleDiff = pointAngle - startAngle;
    if (adjustedRadius < 0) {
      if (angleDiff > 0) angleDiff -= 2 * Math.PI;
    } else {
      if (angleDiff < 0) angleDiff += 2 * Math.PI;
    }
    
    // 计算链距并应用链距平移
    const rawChainage = Math.abs(adjustedRadius) * Math.abs(angleDiff);
    const chainage = rawChainage + chainageOffsetVal;

    // 计算设计高程和高程差
    let designHeight = null;
    let levelDifference = null;
    const hasHeightData = startH && endH && pointH;

    if (hasHeightData) {
      const arcLength = Math.abs(adjustedRadius * centralAngle);
      const heightDifference = parseFloat(endH) - parseFloat(startH);
      const chainageRatio = rawChainage / arcLength;
      // 计算设计高程并应用高程平移
      const rawDesignHeight = parseFloat(startH) + (chainageRatio * heightDifference);
      designHeight = rawDesignHeight + heightOffsetVal;
      levelDifference = designHeight - parseFloat(pointH);
    }

    const result = {
      key: '1',
      chainage: chainage.toFixed(4),
      offset: offset.toFixed(4),
      centerE: centerE.toFixed(4),
      centerN: centerN.toFixed(4),
      radius: Math.abs(adjustedRadius).toFixed(4)
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

  const handleTabChange = (value) => {
    setActiveTab(value);
    // 只有在切换到不同标签页时才重置表单和清除结果
    if (value !== activeTab) {
      setCalculationResults([]);
      // 重置当前激活的表单
      switch(value) {
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
      <Divider orientation="left">测站数据</Divider>
      <Row gutter={[16, 0]}>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="stationE" label="E坐标" rules={[{ required: true, message: '请输入测站E坐标' }]}>
            <Input placeholder="E坐标" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="stationN" label="N坐标" rules={[{ required: true, message: '请输入测站N坐标' }]}>
            <Input placeholder="N坐标" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="stationRL" label="RL高程" rules={[{ required: false }]}>
            <Input placeholder="RL高程（选填）" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="instrumentHeight" label="仪器高度(IH)" rules={[{ required: false }]}>
            <Input placeholder="仪器高度（选填）" />
          </Form.Item>
        </Col>
      </Row>
      
      <Divider orientation="left">放样点数据</Divider>
      <Row gutter={[16, 0]}>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="pointE" label="E坐标" rules={[{ required: true, message: '请输入放样点E坐标' }]}>
            <Input placeholder="E坐标" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="pointN" label="N坐标" rules={[{ required: true, message: '请输入放样点N坐标' }]}>
            <Input placeholder="N坐标" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="pointRL" label="RL高程" rules={[{ required: false }]}>
            <Input placeholder="RL高程（选填）" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="prismHeight" label="棱镜高度(PH)" rules={[{ required: false }]}>
            <Input placeholder="棱镜高度（选填）" />
          </Form.Item>
        </Col>
      </Row>
      
      <Form.Item>
        <Button type="primary" size="large" className={styles.submitButton} htmlType="submit">计算</Button>
      </Form.Item>
    </Form>
  );

  const renderLineLayoutForm = () => (
    <Form form={lineForm} layout="vertical" onFinish={calculateLineLayout}>
      <Divider orientation="left">起点坐标</Divider>
      <Row gutter={[16, 0]}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="startE" label="E坐标" rules={[{ required: true, message: '请输入起点E坐标' }]}>
            <Input placeholder="E坐标" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="startN" label="N坐标" rules={[{ required: true, message: '请输入起点N坐标' }]}>
            <Input placeholder="N坐标" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="startH" label="高程" rules={[{ required: false }]}>
            <Input placeholder="高程（选填）" />
          </Form.Item>
        </Col>
      </Row>
      
      <Divider orientation="left">终点坐标</Divider>
      <Row gutter={[16, 0]}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="endE" label="E坐标" rules={[{ required: true, message: '请输入终点E坐标' }]}>
            <Input placeholder="E坐标" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="endN" label="N坐标" rules={[{ required: true, message: '请输入终点N坐标' }]}>
            <Input placeholder="N坐标" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="endH" label="高程" rules={[{ required: false }]}>
            <Input placeholder="高程（选填）" />
          </Form.Item>
        </Col>
      </Row>
      
      <Divider orientation="left">测站数据</Divider>
      <Row gutter={[16, 0]}>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="stationE" label="E坐标" rules={[{ required: true, message: '请输入测站E坐标' }]}>
            <Input placeholder="E坐标" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="stationN" label="N坐标" rules={[{ required: true, message: '请输入测站N坐标' }]}>
            <Input placeholder="N坐标" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="stationH" label="高程" rules={[{ required: false }]}>
            <Input placeholder="高程（选填）" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="chainage" label="起始链距" rules={[{ required: false }]}>
            <Input placeholder="起始链距（选填，默认为0）" />
          </Form.Item>
        </Col>
      </Row>
      
      <Divider orientation="left">平移数据（选填）</Divider>
      <Row gutter={[16, 0]}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="offsetDistance" label="平移距离" rules={[{ required: false }]}>
            <Input placeholder="平移距离（正值向右，负值向左）" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="heightOffset" label="高程平移" rules={[{ required: false }]}>
            <Input placeholder="高程平移（正值向上，负值向下）" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="chainageOffset" label="链距平移" rules={[{ required: false }]}>
            <Input placeholder="链距平移（正值向前，负值向后）" />
          </Form.Item>
        </Col>
      </Row>
      
      <Form.Item>
        <Button type="primary" size="large" className={styles.submitButton} htmlType="submit">计算</Button>
      </Form.Item>
    </Form>
  );

  const renderArcLayoutForm = () => (
    <Form form={arcForm} layout="vertical" onFinish={calculateArcLayout}>
      <Divider orientation="left">圆弧起点</Divider>
      <Row gutter={[16, 0]}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="startE" label="E坐标" rules={[{ required: true, message: '请输入起点E坐标' }]}>
            <Input placeholder="E坐标" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="startN" label="N坐标" rules={[{ required: true, message: '请输入起点N坐标' }]}>
            <Input placeholder="N坐标" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="startH" label="高程" rules={[{ required: false }]}>
            <Input placeholder="高程（选填）" />
          </Form.Item>
        </Col>
      </Row>
      
      <Divider orientation="left">圆弧终点</Divider>
      <Row gutter={[16, 0]}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="endE" label="E坐标" rules={[{ required: true, message: '请输入终点E坐标' }]}>
            <Input placeholder="E坐标" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="endN" label="N坐标" rules={[{ required: true, message: '请输入终点N坐标' }]}>
            <Input placeholder="N坐标" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="endH" label="高程" rules={[{ required: false }]}>
            <Input placeholder="高程（选填）" />
          </Form.Item>
        </Col>
      </Row>
      
      <Divider orientation="left">圆弧参数</Divider>
      <Row gutter={[16, 0]}>
        <Col xs={24} sm={12} md={24}>
          <Form.Item 
            name="radius" 
            label="半径"
            rules={[{ 
              required: true, 
              message: '请输入半径（从起点到终点方向看，右侧为正值，左侧为负值）' 
            }]}
          >
            <Input placeholder="半径（右侧+/左侧-）" />
          </Form.Item>
        </Col>
      </Row>
      
      <Divider orientation="left">放样点坐标</Divider>
      <Row gutter={[16, 0]}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="pointE" label="E坐标" rules={[{ required: true, message: '请输入放样点E坐标' }]}>
            <Input placeholder="E坐标" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="pointN" label="N坐标" rules={[{ required: true, message: '请输入放样点N坐标' }]}>
            <Input placeholder="N坐标" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="pointH" label="高程" rules={[{ required: false }]}>
            <Input placeholder="高程（选填）" />
          </Form.Item>
        </Col>
      </Row>
      
      <Divider orientation="left">平移数据（选填）</Divider>
      <Row gutter={[16, 0]}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="radiusOffset" label="半径平移" rules={[{ required: false }]}>
            <Input placeholder="半径平移（正值向外，负值向内）" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="heightOffset" label="高程平移" rules={[{ required: false }]}>
            <Input placeholder="高程平移（正值向上，负值向下）" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="chainageOffset" label="链距平移" rules={[{ required: false }]}>
            <Input placeholder="链距平移（正值向前，负值向后）" />
          </Form.Item>
        </Col>
      </Row>
      
      <Form.Item>
        <Button type="primary" size="large" className={styles.submitButton} htmlType="submit">计算</Button>
      </Form.Item>
    </Form>
  );

  const renderCurveLayoutForm = () => (
    <Form form={curveForm} layout="vertical" onFinish={calculateCurveLayout}>
      <Divider orientation="left">曲线参数</Divider>
      <Row gutter={[16, 0]}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="radius" label="半径" rules={[{ required: true, message: '请输入曲线半径' }]}>
            <Input placeholder="半径" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="startAngle" label="起始角度" rules={[{ required: true, message: '请输入起始角度' }]}>
            <Input placeholder="起始角度（度）" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="endAngle" label="结束角度" rules={[{ required: true, message: '请输入结束角度' }]}>
            <Input placeholder="结束角度（度）" />
          </Form.Item>
        </Col>
      </Row>
      
      <Divider orientation="left">圆心坐标</Divider>
      <Row gutter={[16, 0]}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="centerE" label="E坐标" rules={[{ required: true, message: '请输入圆心E坐标' }]}>
            <Input placeholder="E坐标" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="centerN" label="N坐标" rules={[{ required: true, message: '请输入圆心N坐标' }]}>
            <Input placeholder="N坐标" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="centerH" label="高程" rules={[{ required: false }]}>
            <Input placeholder="高程（选填）" />
          </Form.Item>
        </Col>
      </Row>
      
      <Divider orientation="left">测站数据</Divider>
      <Row gutter={[16, 0]}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="stationE" label="E坐标" rules={[{ required: true, message: '请输入测站E坐标' }]}>
            <Input placeholder="E坐标" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="stationN" label="N坐标" rules={[{ required: true, message: '请输入测站N坐标' }]}>
            <Input placeholder="N坐标" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="stationH" label="高程" rules={[{ required: false }]}>
            <Input placeholder="高程（选填）" />
          </Form.Item>
        </Col>
      </Row>
      
      <Row gutter={[16, 0]}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="interval" label="间隔角度" rules={[{ required: true, message: '请输入间隔角度' }]}>
            <Input placeholder="间隔角度（度）" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="ih" label="仪器高度(IH)" rules={[{ required: false }]}>
            <Input placeholder="仪器高度（选填）" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="th" label="棱镜高度(TH)" rules={[{ required: false }]}>
            <Input placeholder="棱镜高度（选填）" />
          </Form.Item>
        </Col>
      </Row>
      
      <Form.Item>
        <Button type="primary" size="large" className={styles.submitButton} htmlType="submit">计算</Button>
      </Form.Item>
    </Form>
  );

  return (
    <Layout className={styles.container}>
      <Header className={styles.header}>
        <Menu
          theme="dark"
          mode="horizontal"
          items={menuItems}
          selectedKeys={['construction-layout']}
          className={styles.menu}
        />
      </Header>
      
      <div className={styles.mobileHeader}>
        <Button 
          type="text" 
          icon={<MenuOutlined />} 
          onClick={() => setDrawerVisible(true)}
          className={styles.menuButton}
        />
        <div className={styles.headerTitle}>施工放样</div>
        <div style={{ width: 32 }}></div>
      </div>
      
      <Drawer
        title="菜单"
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        bodyStyle={{ padding: 0 }}
      >
        <Menu
          mode="vertical"
          items={menuItems}
          selectedKeys={['construction-layout']}
          style={{ border: 'none' }}
        />
      </Drawer>
      
      <Content className={styles.content}>
        <div className={styles.pageContainer}>
          <Card className={styles.mainCard}>
            <div className={styles.calculationTypeContainer}>
              <Radio.Group 
                value={activeTab} 
                onChange={(e) => handleTabChange(e.target.value)}
                buttonStyle="solid"
                className={styles.calculationTypeSelector}
              >
                <Radio.Button value="1">点放样</Radio.Button>
                <Radio.Button value="2">线放样</Radio.Button>
                <Radio.Button value="3">弧放样</Radio.Button>
              </Radio.Group>
            </div>
            
            {activeTab === '1' && (
              <Card title="计算参数" className={styles.card}>
                {renderPointLayoutForm()}
              </Card>
            )}
            {activeTab === '2' && (
              <Card title="计算参数" className={styles.card}>
                {renderLineLayoutForm()}
              </Card>
            )}
            {activeTab === '3' && (
              <Card title="计算参数" className={styles.card}>
                {renderArcLayoutForm()}
              </Card>
            )}
            
            {calculationResults.length > 0 && (
              <Card 
                title={
                  <div className={styles.resultTitle}>
                    <span>计算结果</span>
                    <span className={styles.resultTime}>{new Date().toLocaleString()}</span>
                  </div>
                } 
                className={styles.resultCard}
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
                      ] : []),
                      ...(calculationResults[0]?.centerE && activeTab === '3' ? [
                        {
                          title: '圆心E',
                          dataIndex: 'centerE',
                          key: 'centerE',
                          align: 'center'
                        },
                        {
                          title: '圆心N',
                          dataIndex: 'centerN',
                          key: 'centerN',
                          align: 'center'
                        },
                        {
                          title: '半径',
                          dataIndex: 'radius',
                          key: 'radius',
                          align: 'center',
                          render: (text) => `${text}m`
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