import React, { useState, useEffect } from 'react';
import { Layout, Form, Input, Button, Table, Card, Space, Tabs, Menu, Select, Drawer, Radio, Row, Col, Divider, message } from 'antd';
import { HomeOutlined, CompassOutlined, CalculatorOutlined, AimOutlined, RadiusSettingOutlined, ToolOutlined, MonitorOutlined, MenuOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './ConstructionLayout.module.css';
import PointLayoutForm from './PointLayoutForm';

const { Content, Header } = Layout;
const { Option } = Select;
const { TabPane } = Tabs;

const ConstructionLayout = () => {
  const [activeTab, setActiveTab] = useState('point');
  const [pointForm] = Form.useForm();
  const [lineForm] = Form.useForm();
  const [arcForm] = Form.useForm();
  const [curveForm] = Form.useForm();
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
      label: '返回主頁',
      onClick: goHome
    },
    {
      key: 'survey-station',
      icon: <CompassOutlined />,
      label: '香港測量控制站查詢',
      onClick: () => navigate('/survey-station')
    },
    {
      key: 'free-station',
      icon: <CalculatorOutlined />,
      label: '自由設站解算',
      onClick: () => navigate('/free-station')
    },
    {
      key: 'traverse-calculation',
      icon: <AimOutlined />,
      label: '導線計算',
      onClick: () => navigate('/traverse-calculation')
    },
    {
      key: 'construction-layout',
      icon: <RadiusSettingOutlined />,
      label: '施工放樣'
    },
    {
      key: 'pile-calculation',
      icon: <CalculatorOutlined />,
      label: '樁計算',
      onClick: () => navigate('/pile-calculation')
    },
    {
      key: 'batch-calculation',
      icon: <RadiusSettingOutlined />,
      label: '批量計算及轉換',
      onClick: () => navigate('/batch-calculation')
    },
    {
      key: 'tools',
      icon: <ToolOutlined />,
      label: '實用工具',
      onClick: () => navigate('/tools')
    },
    {
      key: 'settlement-monitoring',
      icon: <MonitorOutlined />,
      label: '沉降監測系統',
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

  // 曲线放样计算
  const calculateCurveLayout = (values) => {
    try {
      // 获取输入值
      const radius = parseFloat(values.radius);
      const startAngle = parseFloat(values.startAngle);
      const endAngle = parseFloat(values.endAngle);
      const centerE = parseFloat(values.centerE);
      const centerN = parseFloat(values.centerN);
      const centerH = values.centerH ? parseFloat(values.centerH) : null;
      const stationE = parseFloat(values.stationE);
      const stationN = parseFloat(values.stationN);
      const stationH = values.stationH ? parseFloat(values.stationH) : null;
      const interval = parseFloat(values.interval);
      const ih = values.ih ? parseFloat(values.ih) : 0;
      const th = values.th ? parseFloat(values.th) : 0;

      // 验证输入
      if (isNaN(radius) || isNaN(startAngle) || isNaN(endAngle) || 
          isNaN(centerE) || isNaN(centerN) || isNaN(stationE) || 
          isNaN(stationN) || isNaN(interval)) {
        message.error('請輸入有效的數值');
        return;
      }

      // 确保角度范围正确
      let adjustedStartAngle = startAngle;
      let adjustedEndAngle = endAngle;
      
      // 如果结束角度小于起始角度，添加360度
      if (adjustedEndAngle < adjustedStartAngle) {
        adjustedEndAngle += 360;
      }

      // 计算角度范围
      const angleRange = adjustedEndAngle - adjustedStartAngle;
      
      // 计算点数
      const pointCount = Math.ceil(angleRange / interval) + 1;
      
      // 生成结果数组
      const results = [];
      
      for (let i = 0; i < pointCount; i++) {
        // 计算当前角度
        const currentAngle = adjustedStartAngle + i * interval;
        if (currentAngle > adjustedEndAngle) break;
        
        // 转换为弧度
        const angleRad = currentAngle * Math.PI / 180;
        
        // 计算曲线上的点坐标
        const pointE = centerE + radius * Math.cos(angleRad);
        const pointN = centerN + radius * Math.sin(angleRad);
        const pointH = centerH !== null ? centerH : null;
        
        // 计算从测站到点的方位角
        const dE = pointE - stationE;
        const dN = pointN - stationN;
        const azimuth = Math.atan2(dE, dN) * 180 / Math.PI;
        const azimuthDMS = convertToDDMMSS(azimuth >= 0 ? azimuth : azimuth + 360);
        
        // 计算水平距离
        const horizontalDistance = Math.sqrt(dE * dE + dN * dN);
        
        // 计算高差和斜距
        let heightDifference = null;
        let slopeDistance = null;
        
        if (pointH !== null && stationH !== null) {
          heightDifference = pointH - stationH - ih + th;
          slopeDistance = Math.sqrt(horizontalDistance * horizontalDistance + heightDifference * heightDifference);
        }
        
        // 添加到结果数组
        results.push({
          key: i.toString(),
          pointNumber: i + 1,
          angle: currentAngle.toFixed(4),
          easting: pointE.toFixed(4),
          northing: pointN.toFixed(4),
          height: pointH !== null ? pointH.toFixed(4) : null,
          azimuth: azimuthDMS,
          horizontalDistance: horizontalDistance.toFixed(4),
          heightDifference: heightDifference !== null ? heightDifference.toFixed(4) : null,
          slopeDistance: slopeDistance !== null ? slopeDistance.toFixed(4) : null
        });
      }
      
      // 更新计算结果
      setCalculationResults(results);
      
      // 显示成功消息
      message.success('曲線放樣計算完成');
    } catch (error) {
      console.error('曲線放樣計算錯誤:', error);
      message.error('計算過程中發生錯誤');
    }
  };

  const onFinish = (values) => {
    calculatePointLayout(values);
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    setCalculationResults([]);
    
    // 清空表单
    if (value === 'point') {
      pointForm.resetFields();
    } else if (value === 'line') {
      lineForm.resetFields();
    } else if (value === 'arc') {
      arcForm.resetFields();
    } else if (value === 'curve') {
      curveForm.resetFields();
    }
  };

  const renderPointLayoutForm = () => (
    <Form form={pointForm} layout="vertical" onFinish={calculatePointLayout}>
      <Divider orientation="left">測站數據</Divider>
      <Row gutter={[16, 0]}>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="stationE" label="E坐標" rules={[{ required: true, message: '請輸入測站E坐標' }]}>
            <Input placeholder="E坐標" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="stationN" label="N坐標" rules={[{ required: true, message: '請輸入測站N坐標' }]}>
            <Input placeholder="N坐標" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="stationRL" label="RL高程" rules={[{ required: false }]}>
            <Input placeholder="RL高程（選填）" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="instrumentHeight" label="儀器高度(IH)" rules={[{ required: false }]}>
            <Input placeholder="儀器高度（選填）" />
          </Form.Item>
        </Col>
      </Row>
      
      <Divider orientation="left">放樣點數據</Divider>
      <Row gutter={[16, 0]}>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="pointE" label="E坐標" rules={[{ required: true, message: '請輸入放樣點E坐標' }]}>
            <Input placeholder="E坐標" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="pointN" label="N坐標" rules={[{ required: true, message: '請輸入放樣點N坐標' }]}>
            <Input placeholder="N坐標" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="pointRL" label="RL高程" rules={[{ required: false }]}>
            <Input placeholder="RL高程（選填）" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="prismHeight" label="棱鏡高度(PH)" rules={[{ required: false }]}>
            <Input placeholder="棱鏡高度（選填）" />
          </Form.Item>
        </Col>
      </Row>
      
      <Form.Item>
        <Button type="primary" size="large" className={styles.submitButton} htmlType="submit">計算</Button>
      </Form.Item>
    </Form>
  );

  const renderLineLayoutForm = () => (
    <Form form={lineForm} layout="vertical" onFinish={calculateLineLayout}>
      <Divider orientation="left">起點坐標</Divider>
      <Row gutter={[16, 0]}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="startE" label="E坐標" rules={[{ required: true, message: '請輸入起點E坐標' }]}>
            <Input placeholder="E坐標" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="startN" label="N坐標" rules={[{ required: true, message: '請輸入起點N坐標' }]}>
            <Input placeholder="N坐標" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="startH" label="高程" rules={[{ required: false }]}>
            <Input placeholder="高程（選填）" />
          </Form.Item>
        </Col>
      </Row>
      
      <Divider orientation="left">終點坐標</Divider>
      <Row gutter={[16, 0]}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="endE" label="E坐標" rules={[{ required: true, message: '請輸入終點E坐標' }]}>
            <Input placeholder="E坐標" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="endN" label="N坐標" rules={[{ required: true, message: '請輸入終點N坐標' }]}>
            <Input placeholder="N坐標" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="endH" label="高程" rules={[{ required: false }]}>
            <Input placeholder="高程（選填）" />
          </Form.Item>
        </Col>
      </Row>
      
      <Divider orientation="left">測站數據</Divider>
      <Row gutter={[16, 0]}>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="stationE" label="E坐標" rules={[{ required: true, message: '請輸入測站E坐標' }]}>
            <Input placeholder="E坐標" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="stationN" label="N坐標" rules={[{ required: true, message: '請輸入測站N坐標' }]}>
            <Input placeholder="N坐標" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="stationH" label="高程" rules={[{ required: false }]}>
            <Input placeholder="高程（選填）" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="chainage" label="起始鏈距" rules={[{ required: false }]}>
            <Input placeholder="起始鏈距（選填，默認為0）" />
          </Form.Item>
        </Col>
      </Row>
      
      <Divider orientation="left">平移數據（選填）</Divider>
      <Row gutter={[16, 0]}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="offsetDistance" label="平移距離" rules={[{ required: false }]}>
            <Input placeholder="平移距離（正值向右，負值向左）" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="heightOffset" label="高程平移" rules={[{ required: false }]}>
            <Input placeholder="高程平移（正值向上，負值向下）" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="chainageOffset" label="鏈距平移" rules={[{ required: false }]}>
            <Input placeholder="鏈距平移（正值向前，負值向后）" />
          </Form.Item>
        </Col>
      </Row>
      
      <Form.Item>
        <Button type="primary" size="large" className={styles.submitButton} htmlType="submit">計算</Button>
      </Form.Item>
    </Form>
  );

  const renderArcLayoutForm = () => (
    <Form form={arcForm} layout="vertical" onFinish={calculateArcLayout}>
      <Divider orientation="left">圓弧起點</Divider>
      <Row gutter={[16, 0]}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="startE" label="E坐標" rules={[{ required: true, message: '請輸入起點E坐標' }]}>
            <Input placeholder="E坐標" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="startN" label="N坐標" rules={[{ required: true, message: '請輸入起點N坐標' }]}>
            <Input placeholder="N坐標" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="startH" label="高程" rules={[{ required: false }]}>
            <Input placeholder="高程（選填）" />
          </Form.Item>
        </Col>
      </Row>
      
      <Divider orientation="left">圓弧終點</Divider>
      <Row gutter={[16, 0]}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="endE" label="E坐標" rules={[{ required: true, message: '請輸入終點E坐標' }]}>
            <Input placeholder="E坐標" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="endN" label="N坐標" rules={[{ required: true, message: '請輸入終點N坐標' }]}>
            <Input placeholder="N坐標" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="endH" label="高程" rules={[{ required: false }]}>
            <Input placeholder="高程（選填）" />
          </Form.Item>
        </Col>
      </Row>
      
      <Divider orientation="left">圓弧參數</Divider>
      <Row gutter={[16, 0]}>
        <Col xs={24} sm={12} md={24}>
          <Form.Item 
            name="radius" 
            label="半徑"
            rules={[{ 
              required: true, 
              message: '請輸入半徑（從起點到終點方向看，右側為正值，左側為負值）' 
            }]}
          >
            <Input placeholder="半徑（右側+/左側-）" />
          </Form.Item>
        </Col>
      </Row>
      
      <Divider orientation="left">放樣點坐標</Divider>
      <Row gutter={[16, 0]}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="pointE" label="E坐標" rules={[{ required: true, message: '請輸入放樣點E坐標' }]}>
            <Input placeholder="E坐標" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="pointN" label="N坐標" rules={[{ required: true, message: '請輸入放樣點N坐標' }]}>
            <Input placeholder="N坐標" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="pointH" label="高程" rules={[{ required: false }]}>
            <Input placeholder="高程（選填）" />
          </Form.Item>
        </Col>
      </Row>
      
      <Divider orientation="left">平移數據（選填）</Divider>
      <Row gutter={[16, 0]}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="radiusOffset" label="半徑平移" rules={[{ required: false }]}>
            <Input placeholder="半徑平移（正值向外，負值向內）" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="heightOffset" label="高程平移" rules={[{ required: false }]}>
            <Input placeholder="高程平移（正值向上，負值向下）" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="chainageOffset" label="鏈距平移" rules={[{ required: false }]}>
            <Input placeholder="鏈距平移（正值向前，負值向后）" />
          </Form.Item>
        </Col>
      </Row>
      
      <Form.Item>
        <Button type="primary" size="large" className={styles.submitButton} htmlType="submit">計算</Button>
      </Form.Item>
    </Form>
  );

  const renderCurveLayoutForm = () => (
    <Form form={curveForm} layout="vertical" onFinish={calculateCurveLayout}>
      <Divider orientation="left">曲線參數</Divider>
      <Row gutter={[16, 0]}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="radius" label="半徑" rules={[{ required: true, message: '請輸入曲線半徑' }]}>
            <Input placeholder="半徑" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="startAngle" label="起始角度" rules={[{ required: true, message: '請輸入起始角度' }]}>
            <Input placeholder="起始角度（度）" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="endAngle" label="結束角度" rules={[{ required: true, message: '請輸入結束角度' }]}>
            <Input placeholder="結束角度（度）" />
          </Form.Item>
        </Col>
      </Row>
      
      <Divider orientation="left">圓心坐標</Divider>
      <Row gutter={[16, 0]}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="centerE" label="E坐標" rules={[{ required: true, message: '請輸入圓心E坐標' }]}>
            <Input placeholder="E坐標" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="centerN" label="N坐標" rules={[{ required: true, message: '請輸入圓心N坐標' }]}>
            <Input placeholder="N坐標" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="centerH" label="高程" rules={[{ required: false }]}>
            <Input placeholder="高程（選填）" />
          </Form.Item>
        </Col>
      </Row>
      
      <Divider orientation="left">測站數據</Divider>
      <Row gutter={[16, 0]}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="stationE" label="E坐標" rules={[{ required: true, message: '請輸入測站E坐標' }]}>
            <Input placeholder="E坐標" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="stationN" label="N坐標" rules={[{ required: true, message: '請輸入測站N坐標' }]}>
            <Input placeholder="N坐標" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="stationH" label="高程" rules={[{ required: false }]}>
            <Input placeholder="高程（選填）" />
          </Form.Item>
        </Col>
      </Row>
      
      <Row gutter={[16, 0]}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="interval" label="間隔角度" rules={[{ required: true, message: '請輸入間隔角度' }]}>
            <Input placeholder="間隔角度（度）" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="ih" label="儀器高度(IH)" rules={[{ required: false }]}>
            <Input placeholder="儀器高度（選填）" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="th" label="棱鏡高度(TH)" rules={[{ required: false }]}>
            <Input placeholder="棱鏡高度（選填）" />
          </Form.Item>
        </Col>
      </Row>
      
      <Form.Item>
        <Button type="primary" size="large" className={styles.submitButton} htmlType="submit">計算</Button>
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
        <div className={styles.headerTitle}>施工放樣</div>
        <div style={{ width: 32 }}></div>
      </div>
      
      <Drawer
        title="菜單"
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={280}
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
              <Tabs defaultActiveKey="point" onChange={handleTabChange} className={styles.tabs}>
                <TabPane tab="點放樣" key="point">
                  {renderPointLayoutForm()}
                </TabPane>
                
                <TabPane tab="線放樣" key="line">
                  {renderLineLayoutForm()}
                </TabPane>
                
                <TabPane tab="弧放樣" key="arc">
                  {renderArcLayoutForm()}
                </TabPane>

                <TabPane tab="曲線放樣" key="curve">
                  {renderCurveLayoutForm()}
                </TabPane>
              </Tabs>
            </div>
            
            {calculationResults.length > 0 && (
              <Card 
                title={
                  <div className={styles.resultTitle}>
                    <span>計算結果</span>
                    <span className={styles.resultTime}>{new Date().toLocaleString()}</span>
                  </div>
                } 
                className={styles.resultCard}
              >
                <div className={styles.tableWrapper}>
                  <Table
                    dataSource={calculationResults}
                    columns={activeTab === 'point' ? [
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
                        title: '水平距離(HD)',
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
                        title: '鏈距(C/H)',
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
                          title: '設計高程',
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
                      ...(calculationResults[0]?.centerE && activeTab === 'arc' ? [
                        {
                          title: '圓心E',
                          dataIndex: 'centerE',
                          key: 'centerE',
                          align: 'center'
                        },
                        {
                          title: '圓心N',
                          dataIndex: 'centerN',
                          key: 'centerN',
                          align: 'center'
                        },
                        {
                          title: '半徑',
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