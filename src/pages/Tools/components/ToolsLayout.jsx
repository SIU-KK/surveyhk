import React, { useState, useEffect } from 'react';
import { Layout, Menu, Card, Form, Input, Button, Table, Tabs, Drawer, Radio, message, Space, Row, Col, Divider, Switch, Modal } from 'antd';
import { HomeOutlined, CompassOutlined, CalculatorOutlined, AimOutlined, RadiusSettingOutlined, ToolOutlined, MonitorOutlined, MenuOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './ToolsLayout.module.css';

const { Content, Header } = Layout;

const ToolsLayout = () => {
  const [calculationType, setCalculationType] = useState('arc');
  const [arcForm] = Form.useForm();
  const [hypotenuseForm] = Form.useForm();
  const [levelForm] = Form.useForm();
  const [angleForm] = Form.useForm();
  const [areaForm] = Form.useForm();
  const [newSideSightForm] = Form.useForm();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [arcResult, setArcResult] = useState(null);
  const [quarterResult, setQuarterResult] = useState(null);
  const [quarterCount, setQuarterCount] = useState(0);
  const [hypotenuseResult, setHypotenuseResult] = useState(null);
  const [angleResult, setAngleResult] = useState(null);
  const [isDecimalInput, setIsDecimalInput] = useState(true);
  const [levelResult, setLevelResult] = useState(null);
  const [additionalSideSights, setAdditionalSideSights] = useState([]);
  const [areaResult, setAreaResult] = useState(null);

  const labelStyle = {
    textAlign: 'left',
    display: 'block'
  };

  // 设置表单布局
  const formLayout = {
    labelAlign: 'left',
    labelCol: { flex: '120px' },
    wrapperCol: { flex: 'auto' }
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // 检查是否为移动设备
    if (isMobile) {
      // 如果是移动设备，默认选中第一个计算类型
      setCalculationType('arc');
    }
  }, [isMobile]);

  // 初始化时计算一次
  useEffect(() => {
    // 延迟执行，确保表单已加载
    const timer = setTimeout(() => {
      // 初始计算
      try {
        const r = 100;
        const c = 20;
        
        const halfChord = c / 2;
        const h = r - Math.sqrt(r * r - halfChord * halfChord);
        
        setArcResult({
          radius: r,
          chordLength: c,
          midOffset: h.toFixed(4)
        });
      } catch (error) {
        // 忽略错误
      }
    }, 300);
    return () => clearTimeout(timer);
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
      label: '施工放样',
      onClick: () => navigate('/construction-layout')
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
      label: '实用工具'
    },
    {
      key: 'settlement-monitoring',
      icon: <MonitorOutlined />,
      label: '沉降监测系统',
      onClick: () => navigate('/settlement-monitoring')
    }
  ];

  const calculateArc = () => {
    arcForm.validateFields().then(values => {
      const radius = parseFloat(values.radius);
      const chordLength = parseFloat(values.chordLength);
      
      if (radius <= 0) {
        message.error('半径必须为正数');
        return;
      }
      
      if (chordLength <= 0) {
        message.error('弦长必须为正数');
        return;
      }
      
      if (chordLength > 2 * radius) {
        message.error('弦长不能大于直径（2×半径）');
        return;
      }
      
      // 计算中矢距
      const midOffset = radius - Math.sqrt(radius * radius - Math.pow(chordLength / 2, 2));
      
      // 计算弧长
      const arcLength = 2 * radius * Math.asin(chordLength / (2 * radius));
      
      // 设置结果
      setArcResult({
        radius: radius.toFixed(4),
        chordLength: chordLength.toFixed(4),
        midOffset: midOffset.toFixed(4),
        arcLength: arcLength.toFixed(4)
      });
      
      // 重置四分点结果
      setQuarterResult(null);
      setQuarterCount(0);
      
      message.success('计算完成');
    }).catch(err => {
      message.error('请填写所有必填字段');
    });
  };

  // 四分法计算
  const calculateQuarterMethod = () => {
    if (!arcResult) {
      message.error('请先计算中拱值');
      return;
    }
    
    const radius = parseFloat(arcResult.radius);
    const chordLength = parseFloat(arcResult.chordLength);
    
    // 计算新的四分点
    const newQuarterCount = quarterCount + 1;
    const quarterChordLength = chordLength / Math.pow(2, newQuarterCount);
    const quarterMidOffset = radius - Math.sqrt(radius * radius - Math.pow(quarterChordLength / 2, 2));
    const distanceFromStart = chordLength / 2 - quarterChordLength / 2;
    
    // 创建或更新四分点结果数组
    const newQuarterResult = quarterResult ? [...quarterResult] : [];
    newQuarterResult.push({
      count: newQuarterCount,
      chordLength: quarterChordLength.toFixed(4),
      midOffset: quarterMidOffset.toFixed(4),
      distanceFromStart: distanceFromStart.toFixed(4)
    });
    
    setQuarterResult(newQuarterResult);
    setQuarterCount(newQuarterCount);
    
    message.success(`第${newQuarterCount}次四分法计算完成`);
    console.log('四分点计算结果:', newQuarterResult);
  };
  
  // 重置四分法计算
  const resetQuarterMethod = () => {
    setQuarterResult(null);
    setQuarterCount(0);
    message.success('四分点已重置');
  };

  // 处理弧长计算输入变化
  const handleArcInputChange = () => {
    try {
      const values = arcForm.getFieldsValue();
      const radius = parseFloat(values.radius);
      const chordLength = parseFloat(values.chordLength);
      
      console.log('输入变化:', { radius, chordLength });
      
      // 验证输入
      if (!radius || !chordLength || radius <= 0 || chordLength <= 0 || chordLength > 2 * radius) {
        return;
      }
      
      // 计算中矢距
      const midOffset = radius - Math.sqrt(radius * radius - Math.pow(chordLength / 2, 2));
      
      // 计算弧长
      const arcLength = 2 * radius * Math.asin(chordLength / (2 * radius));
      
      // 更新结果
      setArcResult({
        radius: radius.toFixed(4),
        chordLength: chordLength.toFixed(4),
        midOffset: midOffset.toFixed(4),
        arcLength: arcLength.toFixed(4)
      });
      
      console.log('输入变化后更新结果:', {
        radius: radius.toFixed(4),
        chordLength: chordLength.toFixed(4),
        midOffset: midOffset.toFixed(4),
        arcLength: arcLength.toFixed(4)
      });
    } catch (err) {
      console.log('输入变化处理错误:', err);
    }
  };

  // 斜边计算
  const calculateHypotenuse = () => {
    hypotenuseForm.validateFields().then(values => {
      const { adjacent, opposite } = values;
      const a = parseFloat(adjacent);
      const b = parseFloat(opposite);
      
      if (a <= 0 || b <= 0) {
        message.error('邻边和对边必须为正数');
        return;
      }
      
      // 计算斜边长度（勾股定理）
      const hypotenuse = Math.sqrt(a * a + b * b);
      
      // 计算角度（反正切函数）
      // 邻边与斜边的夹角
      const angleRad = Math.atan(b / a);
      const angleDeg = angleRad * (180 / Math.PI);
      
      // 对边与斜边的夹角（90度 - 邻边与斜边的夹角）
      const complementaryAngleDeg = 90 - angleDeg;
      
      // 对边与邻边的夹角（直角三角形中为90度）
      const rightAngleDeg = 90;
      
      setHypotenuseResult({
        adjacent: a,
        opposite: b,
        hypotenuse: hypotenuse.toFixed(4),
        angle: angleDeg.toFixed(2),
        complementaryAngle: complementaryAngleDeg.toFixed(2),
        rightAngle: rightAngleDeg
      });
      
      message.success('计算完成');
    }).catch(err => {
      message.error('请填写所有必填字段');
    });
  };

  // 平水计算
  const calculateLevel = () => {
    levelForm.validateFields().then(values => {
      const { backSightElevation, designElevation, backSight, sideSight } = values;
      const bsElevation = parseFloat(backSightElevation);
      const bs = parseFloat(backSight);
      const ss = parseFloat(sideSight);
      const designElev = parseFloat(designElevation || 0);
      
      if (isNaN(bsElevation) || isNaN(bs) || isNaN(ss)) {
        message.error('请输入有效的读数');
        return;
      }
      
      // 计算仪器高
      const instrumentHeight = bsElevation + bs;
      
      // 计算旁视点高程
      const sideSightElevation = instrumentHeight - ss;
      
      // 计算高差（与设计高程的差值）
      const elevationDifference = sideSightElevation - designElev;
      
      // 确定高差方向（上升或下降）
      const elevationDirection = elevationDifference < 0 ? 'up' : 'down';
      
      // 设计点位置固定
      const designPointY = elevationDifference < 0 ? 100 : 180;
      
      // 清空额外旁视点数据
      setAdditionalSideSights([]);
      
      setLevelResult({
        backSightElevation: bsElevation.toFixed(4),
        backSight: bs.toFixed(4),
        sideSight: ss.toFixed(4),
        instrumentHeight: instrumentHeight.toFixed(4),
        sideSightElevation: sideSightElevation.toFixed(4),
        designElevation: designElev.toFixed(4),
        elevationDifference: Math.abs(elevationDifference).toFixed(4),
        elevationDirection: elevationDirection,
        designPointY: designPointY,
        actualDifference: elevationDifference
      });
      
      message.success('平水计算完成');
    }).catch(err => {
      message.error('请填写所有必填字段');
    });
  };
  
  // 清除平水计算数据
  const clearLevelData = () => {
    // 重置表单数据
    levelForm.resetFields();
    // 清空计算结果
    setLevelResult(null);
    // 清空额外旁视点数据
    setAdditionalSideSights([]);
    
    message.success('数据已清除');
  };
  
  // 显示添加旁视点的弹窗
  const showAddSideSightModal = () => {
    // 如果已经有计算结果，则设置默认的设计高程
    if (levelResult) {
      newSideSightForm.setFieldsValue({
        designElevation: levelResult.designElevation
      });
    }
    setIsModalVisible(true);
  };
  
  // 关闭弹窗
  const handleCancel = () => {
    setIsModalVisible(false);
  };
  
  // 添加新的旁视点
  const handleAddSideSight = () => {
    newSideSightForm.validateFields().then(values => {
      const { sideSight, designElevation } = values;
      const ss = parseFloat(sideSight);
      const designElev = parseFloat(designElevation || 0);
      
      if (isNaN(ss) || isNaN(designElev)) {
        message.error('请输入有效的读数');
        return;
      }
      
      // 确保已经有主计算结果
      if (!levelResult) {
        message.error('请先进行主计算');
        return;
      }
      
      // 使用主计算的仪器高
      const instrumentHeight = parseFloat(levelResult.instrumentHeight);
      
      // 计算新旁视点高程
      const sideSightElevation = instrumentHeight - ss;
      
      // 计算高差（与设计高程的差值）
      const elevationDifference = sideSightElevation - designElev;
      
      // 确定高差方向（上升或下降）
      const elevationDirection = elevationDifference < 0 ? 'up' : 'down';
      
      // 添加到额外旁视点列表
      const newSideSight = {
        sideSight: ss.toFixed(4),
        designElevation: designElev.toFixed(4),
        sideSightElevation: sideSightElevation.toFixed(4),
        elevationDifference: Math.abs(elevationDifference).toFixed(4),
        elevationDirection: elevationDirection,
        actualDifference: elevationDifference
      };
      
      setAdditionalSideSights([...additionalSideSights, newSideSight]);
      
      // 清空表单并关闭弹窗
      newSideSightForm.resetFields();
      setIsModalVisible(false);
      
      message.success('添加旁视点成功');
    }).catch(err => {
      message.error('请填写所有必填字段');
    });
  };

  // 水平计算表单
  const renderLevelForm = () => (
    <Form 
      form={levelForm} 
      layout="horizontal" 
      initialValues={{ backSightElevation: "0", designElevation: "0" }}
      {...formLayout}
      className={styles.horizontalForm}
      colon={false}
    >
      <div className={styles.formGroup}>
        <h4 className={styles.formSectionTitle}>水准测量参数</h4>
        <Form.Item 
          label={<span style={labelStyle}>后视高程 (m)</span>} 
          name="backSightElevation" 
          rules={[{ required: true, message: '请输入后视高程' }]}
        >
          <Input 
            type="number" 
            step="any" 
            inputMode="decimal" 
            pattern="[0-9]*[.,]?[0-9]*"
          />
        </Form.Item>
        <Form.Item 
          label={<span style={labelStyle}>设计高程 (m)</span>} 
          name="designElevation" 
          rules={[{ required: true, message: '请输入设计高程' }]}
        >
          <Input 
            type="number" 
            step="any" 
            inputMode="decimal" 
            pattern="[0-9]*[.,]?[0-9]*"
          />
        </Form.Item>
        <Form.Item 
          label={<span style={labelStyle}>后视读数 (m)</span>} 
          name="backSight" 
          rules={[{ required: true, message: '请输入后视读数' }]}
        >
          <Input 
            type="number" 
            step="any" 
            inputMode="decimal" 
            pattern="[0-9]*[.,]?[0-9]*"
          />
        </Form.Item>
        <Form.Item 
          label={<span style={labelStyle}>旁视读数 (m)</span>} 
          name="sideSight" 
          rules={[{ required: true, message: '请输入旁视读数' }]}
        >
          <Input 
            type="number" 
            step="any" 
            inputMode="decimal" 
            pattern="[0-9]*[.,]?[0-9]*"
          />
        </Form.Item>
        
        {/* 水准测量示意图 */}
        <div className={styles.levelDiagram}>
          <h4 className={styles.diagramTitle}>水准测量示意图</h4>
          <div className={styles.diagramContent}>
            <svg width="100%" height="240" viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
              {/* 地面线 */}
              <path d="M 20,180 L 380,180" stroke="#8c8c8c" strokeWidth="2" strokeDasharray="5,3" />
              
              {/* 后视点 - 固定在中间位置 */}
              <circle cx="80" cy="140" r="5" fill="#1890ff" />
              <text x="80" y="160" textAnchor="middle" fill="#333">后视点</text>
              
              {/* 旁视点 - 固定在中间位置 */}
              <circle cx="320" cy="140" r="5" fill="#1890ff" />
              <text x="320" y="160" textAnchor="middle" fill="#333">旁视点</text>
              
              {/* 设计点 - 固定位置 */}
              {levelResult ? (
                <>
                  <circle cx="320" cy={levelResult.designPointY} r="5" fill="#faad14" />
                  <text x="320" y={levelResult.designPointY - 10} textAnchor="middle" fill="#faad14">设计点</text>
                </>
              ) : (
                <>
                  <circle cx="320" cy="100" r="5" fill="#faad14" />
                  <text x="320" y="90" textAnchor="middle" fill="#faad14">设计点</text>
                </>
              )}
              
              {/* 仪器 */}
              <rect x="190" y="130" width="20" height="10" fill="#1890ff" />
              <line x1="200" y1="130" x2="200" y2="120" stroke="#1890ff" strokeWidth="2" />
              <circle cx="200" cy="120" r="5" fill="#1890ff" />
              <text x="200" y="160" textAnchor="middle" fill="#333">仪器</text>
              
              {/* 水平视线 */}
              <line x1="50" y1="120" x2="350" y2="120" stroke="#1890ff" strokeWidth="1.5" strokeDasharray="2,1" />
              <text x="200" y="115" textAnchor="middle" fill="#1890ff">水平视线</text>
              
              {/* 后视线 - 水平线 */}
              <line x1="200" y1="120" x2="80" y2="120" stroke="#ff4d4f" strokeWidth="2" />
              <text x="140" y="115" textAnchor="middle" fill="#ff4d4f">后视线</text>
              
              {/* 旁视线 - 水平线 */}
              <line x1="200" y1="120" x2="320" y2="120" stroke="#52c41a" strokeWidth="2" />
              <text x="260" y="115" textAnchor="middle" fill="#52c41a">旁视线</text>
              
              {/* 高差 - 固定位置 */}
              {levelResult ? (
                <>
                  <line x1="320" y1={levelResult.designPointY} x2="320" y2="140" stroke="#722ed1" strokeWidth="2" strokeDasharray="3,2" />
                  <text x="310" y={(levelResult.designPointY + 140) / 2} textAnchor="end" fill="#722ed1">高差</text>
                  
                  {/* 移动方向箭头 - 动态方向 */}
                  {levelResult.elevationDirection === 'up' ? (
                    <path d="M 320,130 L 315,140 L 325,140 Z" fill="#722ed1" transform="rotate(180 320 135)" />
                  ) : (
                    <path d="M 320,150 L 315,140 L 325,140 Z" fill="#722ed1" />
                  )}
                  <text x="340" y="140" textAnchor="start" fill="#722ed1">移动方向</text>
                </>
              ) : (
                <>
                  <line x1="320" y1="100" x2="320" y2="140" stroke="#722ed1" strokeWidth="2" strokeDasharray="3,2" />
                  <text x="310" y="120" textAnchor="end" fill="#722ed1">高差</text>
                  
                  {/* 默认向上箭头 */}
                  <path d="M 320,130 L 315,140 L 325,140 Z" fill="#722ed1" transform="rotate(180 320 135)" />
                  <text x="340" y="140" textAnchor="start" fill="#722ed1">移动方向</text>
                </>
              )}
            </svg>
          </div>
          <div className={styles.diagramDescription}>
            <p><strong>简化水准测量原理：</strong></p>
            <p>1. 仪器建立水平视线，测量后视点和旁视点</p>
            <p>2. 计算得出旁视点实际高程和设计高程之间的高差</p>
            <p>3. 根据高差的正负值，确定旁视点需要移动的方向</p>
            <p>4. 高差的绝对值即为旁视点需要移动的距离</p>
          </div>
        </div>
        
        <div className={styles.levelFormatHint}>
          <p>水准测量说明：</p>
          <p>1. 后视高程：已知点的高程值（单位：米）</p>
          <p>2. 设计高程：设计的目标高程（单位：米）</p>
          <p>3. 后视读数：在已知高程点上的读数（单位：米）</p>
          <p>4. 旁视读数：在待测点上的读数（单位：米）</p>
          <p>5. 计算结果中的箭头方向表示旁视点需要移动的方向</p>
        </div>
      </div>
      <div className={styles.buttonGroup}>
        <Button type="primary" size="large" className={styles.submitButton} onClick={calculateLevel}>计算</Button>
        <Button type="default" size="large" className={styles.clearButton} onClick={clearLevelData}>清除数据</Button>
      </div>
      
      {/* 添加旁视点的弹窗 */}
      <Modal
        title="添加旁视点"
        visible={isModalVisible}
        onOk={handleAddSideSight}
        onCancel={handleCancel}
        okText="添加"
        cancelText="取消"
      >
        <Form form={newSideSightForm} layout="vertical">
          <Form.Item 
            label="旁视读数 (m)" 
            name="sideSight" 
            rules={[{ required: true, message: '请输入旁视读数' }]}
          >
            <Input 
              type="number" 
              step="any" 
              inputMode="decimal" 
              pattern="[0-9]*[.,]?[0-9]*"
              placeholder="请输入新的旁视读数"
            />
          </Form.Item>
          <Form.Item 
            label="设计高程 (m)" 
            name="designElevation" 
            rules={[{ required: true, message: '请输入设计高程' }]}
          >
            <Input 
              type="number" 
              step="any" 
              inputMode="decimal" 
              pattern="[0-9]*[.,]?[0-9]*"
              placeholder="请输入设计高程"
            />
          </Form.Item>
        </Form>
      </Modal>
      
      {levelResult && (
        <div className={styles.resultCard}>
          <h3>平水计算结果</h3>
          <div className={styles.levelResultItem}>
            <Divider orientation="left" className={styles.levelDivider}>
              主计算结果
            </Divider>
            <div className={styles.resultRow}>
              <p><span>后视高程:</span> <span>{levelResult.backSightElevation} m</span></p>
            </div>
            <div className={styles.resultRow}>
              <p><span>后视读数:</span> <span>{levelResult.backSight} m</span></p>
            </div>
            <div className={styles.resultRow}>
              <p><span>旁视读数:</span> <span>{levelResult.sideSight} m</span></p>
            </div>
            <div className={styles.resultRow}>
              <p><span>仪器高:</span> <span>{levelResult.instrumentHeight} m</span></p>
            </div>
            <div className={styles.resultRow}>
              <p><span>旁视点高程:</span> <span>{levelResult.sideSightElevation} m</span></p>
            </div>
            <div className={styles.resultRow}>
              <p><span>设计高程:</span> <span>{levelResult.designElevation} m</span></p>
            </div>
            <div className={styles.resultRow}>
              <p>
                <span>高差:</span> 
                <span className={levelResult.elevationDirection === 'up' ? styles.arrowUp : styles.arrowDown}>
                  {levelResult.elevationDirection === 'up' ? '↑' : '↓'} {levelResult.elevationDifference} m
                  {levelResult.elevationDirection === 'up' ? '（旁视需向上移动）' : '（旁视需向下移动）'}
                </span>
              </p>
            </div>
          </div>
          
          {/* 额外旁视点的计算结果 */}
          {additionalSideSights.length > 0 && (
            <>
              {additionalSideSights.map((item, index) => (
                <div className={styles.levelResultItem} key={index}>
                  <Divider orientation="left" className={styles.levelDivider}>
                    额外旁视点 #{index + 1}
                  </Divider>
                  <div className={styles.resultRow}>
                    <p><span>旁视读数:</span> <span>{item.sideSight} m</span></p>
                  </div>
                  <div className={styles.resultRow}>
                    <p><span>仪器高:</span> <span>{levelResult.instrumentHeight} m</span></p>
                  </div>
                  <div className={styles.resultRow}>
                    <p><span>旁视点高程:</span> <span>{item.sideSightElevation} m</span></p>
                  </div>
                  <div className={styles.resultRow}>
                    <p><span>设计高程:</span> <span>{item.designElevation} m</span></p>
                  </div>
                  <div className={styles.resultRow}>
                    <p>
                      <span>高差:</span> 
                      <span className={item.elevationDirection === 'up' ? styles.arrowUp : styles.arrowDown}>
                        {item.elevationDirection === 'up' ? '↑' : '↓'} {item.elevationDifference} m
                        {item.elevationDirection === 'up' ? '（旁视需向上移动）' : '（旁视需向下移动）'}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </>
          )}
          
          {/* 添加旁视按钮 - 放在计算结果下方 */}
          <div className={styles.addButtonContainer}>
            <Button 
              type="primary" 
              size="large" 
              className={styles.addButton} 
              onClick={showAddSideSightModal}
            >
              添加旁视
            </Button>
          </div>
        </div>
      )}
    </Form>
  );

  // 角度计算表单
  const renderAngleForm = () => (
    <Form 
      form={angleForm} 
      layout="horizontal"
      {...formLayout}
      className={styles.horizontalForm}
      colon={false}
    >
      <div className={styles.formGroup}>
        <h4 className={styles.formSectionTitle}>角度转换参数</h4>
        <div className={styles.inputFormatSwitch}>
          <span>输入格式：</span>
          <Switch
            checked={isDecimalInput}
            onChange={setIsDecimalInput}
            checkedChildren="十进制"
            unCheckedChildren="DD.MMSS"
            className={styles.formatSwitch}
          />
        </div>
        <Form.Item 
          label={<span style={labelStyle}>{isDecimalInput ? "十进制角度值" : "DD.MMSS格式角度值"}</span>} 
          name="degrees" 
          rules={[{ required: true, message: '请输入角度' }]}
        >
          <Input 
            type="number" 
            step="any" 
            inputMode="decimal" 
            pattern="[0-9]*[.,]?[0-9]*"
          />
        </Form.Item>
        <div className={styles.angleFormatHint}>
          <p>当前输入格式：{isDecimalInput ? '十进制度数' : 'DD.MMSS格式'}</p>
          <p>{isDecimalInput 
            ? '十进制度数示例：45.5（表示45.5度）' 
            : 'DD.MMSS格式示例：45.3030（表示45度30分30秒）'}</p>
          <p>{isDecimalInput 
            ? '将转换为DD.MMSS格式' 
            : '将转换为十进制度数'}</p>
        </div>
      </div>
      <div className={styles.buttonGroup}>
        <Button type="primary" size="large" className={styles.submitButton} onClick={calculateAngle}>转换</Button>
        <Button type="default" size="large" className={styles.clearButton} onClick={() => angleForm.resetFields()}>清除数据</Button>
      </div>
      
      {angleResult && (
        <div className={styles.resultCard}>
          <h3>角度转换结果</h3>
          <div className={styles.angleResultItem}>
            <Divider orientation="left" className={styles.angleDivider}>
              角度转换
            </Divider>
            <div className={styles.resultRow}>
              <p><span>输入格式:</span> <span>{angleResult.inputType}</span></p>
            </div>
            <div className={styles.resultRow}>
              <p><span>输入值:</span> <span>{angleResult.inputValue}</span></p>
            </div>
            <div className={styles.resultRow}>
              <p><span>转换格式:</span> <span>{angleResult.outputType}</span></p>
            </div>
            <div className={styles.resultRow}>
              <p><span>转换结果:</span> <span>{angleResult.outputValue}</span></p>
            </div>
          </div>
        </div>
      )}
    </Form>
  );

  // 面积计算表单
  const renderAreaForm = () => {
    // 添加一行坐标点
    const addPoint = () => {
      const points = areaForm.getFieldValue('points') || [];
      const newPoints = [...points, { point: `P${points.length + 1}`, e: '', n: '' }];
      areaForm.setFieldsValue({ points: newPoints });
    };

    // 删除一行坐标点
    const removePoint = (index) => {
      const points = areaForm.getFieldValue('points') || [];
      if (points.length <= 3) {
        message.warning('至少需要3个坐标点');
        return;
      }
      const newPoints = points.filter((_, i) => i !== index);
      // 重新编号
      newPoints.forEach((point, i) => {
        point.point = `P${i + 1}`;
      });
      areaForm.setFieldsValue({ points: newPoints });
    };

    // 获取有效的坐标点
    const getValidPoints = () => {
      const points = areaForm.getFieldValue('points') || [];
      return points.filter(point => 
        point.e && !isNaN(parseFloat(point.e)) && 
        point.n && !isNaN(parseFloat(point.n))
      );
    };

    // 计算坐标范围，用于绘制示意图
    const calculateBounds = (points) => {
      if (!points || points.length === 0) return { minE: 0, maxE: 100, minN: 0, maxN: 100 };
      
      const eValues = points.map(p => parseFloat(p.e));
      const nValues = points.map(p => parseFloat(p.n));
      
      const minE = Math.min(...eValues);
      const maxE = Math.max(...eValues);
      const minN = Math.min(...nValues);
      const maxN = Math.max(...nValues);
      
      // 添加一些边距
      const eMargin = (maxE - minE) * 0.1 || 10;
      const nMargin = (maxN - minN) * 0.1 || 10;
      
      return {
        minE: minE - eMargin,
        maxE: maxE + eMargin,
        minN: minN - nMargin,
        maxN: maxN + nMargin
      };
    };

    // 将坐标转换为SVG坐标
    const transformToSvgCoords = (point, bounds, svgWidth, svgHeight) => {
      // 注意：SVG坐标系中，y轴是向下的，而北坐标是向上的，所以需要反转
      const x = ((parseFloat(point.e) - bounds.minE) / (bounds.maxE - bounds.minE)) * svgWidth;
      const y = svgHeight - ((parseFloat(point.n) - bounds.minN) / (bounds.maxN - bounds.minN)) * svgHeight;
      return { x, y };
    };

    // 生成多边形路径
    const generatePolygonPath = (points, bounds, svgWidth, svgHeight) => {
      if (!points || points.length < 3) return '';
      
      return points.map((point, index) => {
        const { x, y } = transformToSvgCoords(point, bounds, svgWidth, svgHeight);
        return `${index === 0 ? 'M' : 'L'} ${x},${y}`;
      }).join(' ') + ' Z'; // Z表示闭合路径
    };

    // 有效的坐标点
    const validPoints = getValidPoints();
    // 计算边界
    const bounds = calculateBounds(validPoints);
    // SVG尺寸
    const svgWidth = 400;
    const svgHeight = 300;

    return (
      <Form 
        form={areaForm} 
        layout="vertical"
        className={styles.horizontalForm}
        initialValues={{
          points: [
            { point: 'P1', e: '', n: '' },
            { point: 'P2', e: '', n: '' },
            { point: 'P3', e: '', n: '' }
          ]
        }}
        onValuesChange={() => {
          // 表单值变化时更新示意图
          areaForm.validateFields(['points']).catch(() => {});
        }}
      >
        <div className={styles.formGroup}>
          <h4 className={styles.formSectionTitle}>面积计算参数</h4>
          
          {/* 多边形示意图 */}
          <div className={styles.areaDiagram}>
            <h4 className={styles.diagramTitle}>多边形示意图</h4>
            <div className={styles.diagramContent} style={{ height: '300px', position: 'relative', overflow: 'visible' }}>
              <svg width="100%" height="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} xmlns="http://www.w3.org/2000/svg">
                {/* 坐标轴 */}
                <line x1="0" y1={svgHeight} x2={svgWidth} y2={svgHeight} stroke="#8c8c8c" strokeWidth="1" strokeDasharray="5,3" />
                <line x1="0" y1="0" x2="0" y2={svgHeight} stroke="#8c8c8c" strokeWidth="1" strokeDasharray="5,3" />
                
                {/* 坐标轴标签 */}
                <text x={svgWidth - 20} y={svgHeight - 5} textAnchor="end" fill="#8c8c8c" fontSize="12">E</text>
                <text x="5" y="15" textAnchor="start" fill="#8c8c8c" fontSize="12">N</text>
                
                {/* 多边形 */}
                {validPoints.length >= 3 && (
                  <path 
                    d={generatePolygonPath(validPoints, bounds, svgWidth, svgHeight)} 
                    fill="rgba(24, 144, 255, 0.2)" 
                    stroke="#1890ff" 
                    strokeWidth="2"
                  />
                )}
                
                {/* 坐标点 */}
                {validPoints.map((point, index) => {
                  const { x, y } = transformToSvgCoords(point, bounds, svgWidth, svgHeight);
                  return (
                    <g key={index}>
                      <circle 
                        cx={x} 
                        cy={y} 
                        r="5" 
                        fill="#1890ff" 
                        stroke="#fff" 
                        strokeWidth="2"
                      />
                      <text 
                        x={x} 
                        y={y - 10} 
                        textAnchor="middle" 
                        fill="#333" 
                        fontSize="12"
                      >
                        {point.point}
                      </text>
                    </g>
                  );
                })}
                
                {/* 坐标值 */}
                {validPoints.length > 0 && (
                  <>
                    <text x="5" y={svgHeight - 5} textAnchor="start" fill="#8c8c8c" fontSize="10">
                      {bounds.minE.toFixed(1)}
                    </text>
                    <text x={svgWidth - 5} y={svgHeight - 5} textAnchor="end" fill="#8c8c8c" fontSize="10">
                      {bounds.maxE.toFixed(1)}
                    </text>
                    <text x="5" y="30" textAnchor="start" fill="#8c8c8c" fontSize="10">
                      {bounds.maxN.toFixed(1)}
                    </text>
                    <text x="5" y={svgHeight - 20} textAnchor="start" fill="#8c8c8c" fontSize="10">
                      {bounds.minN.toFixed(1)}
                    </text>
                  </>
                )}
              </svg>
            </div>
            <p className={styles.scaleNote}>注：图示比例仅供参考，非实际比例</p>
          </div>
          
          <div className={styles.tableContainer}>
            <table className={styles.coordinateTable}>
              <thead>
                <tr>
                  <th>点号</th>
                  <th>E (m)</th>
                  <th>N (m)</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <Form.List name="points">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <tr key={key}>
                          <td>
                            <Form.Item
                              {...restField}
                              name={[name, 'point']}
                              rules={[{ required: true, message: '请输入点号' }]}
                              noStyle
                            >
                              <Input disabled style={{ width: '100%' }} />
                            </Form.Item>
                          </td>
                          <td>
                            <Form.Item
                              {...restField}
                              name={[name, 'e']}
                              rules={[{ required: true, message: '请输入E坐标' }]}
                              noStyle
                            >
                              <Input 
                                type="number" 
                                step="any" 
                                inputMode="decimal" 
                                pattern="[0-9]*[.,]?[0-9]*"
                                style={{ width: '100%' }}
                                placeholder="E坐标"
                              />
                            </Form.Item>
                          </td>
                          <td>
                            <Form.Item
                              {...restField}
                              name={[name, 'n']}
                              rules={[{ required: true, message: '请输入N坐标' }]}
                              noStyle
                            >
                              <Input 
                                type="number" 
                                step="any" 
                                inputMode="decimal" 
                                pattern="[0-9]*[.,]?[0-9]*"
                                style={{ width: '100%' }}
                                placeholder="N坐标"
                              />
                            </Form.Item>
                          </td>
                          <td>
                            <Button 
                              type="text" 
                              danger 
                              onClick={() => removePoint(name)}
                              icon={<DeleteOutlined />}
                            />
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                </Form.List>
              </tbody>
            </table>
          </div>
          <div className={styles.addButtonContainer}>
            <Button 
              type="dashed" 
              onClick={addPoint} 
              className={styles.addButton}
              icon={<PlusOutlined />}
            >
              添加坐标点
            </Button>
          </div>
        </div>
        <Button type="primary" size="large" className={styles.submitButton} onClick={calculateArea}>计算</Button>

        {areaResult && (
          <div className={styles.resultCard}>
            <Divider className={styles.areaDivider}>计算结果</Divider>
            <div className={styles.areaResultItem}>
              <p>
                <span>多边形面积：</span>
                <span>{areaResult.area} m²</span>
              </p>
              <p>
                <span>周长：</span>
                <span>{areaResult.perimeter} m</span>
              </p>
              <p>
                <span>坐标点数：</span>
                <span>{areaResult.pointCount} 个</span>
              </p>
            </div>
            <div className={styles.formulaExplanation}>
              <p><strong>计算公式：</strong></p>
              <p>1. 面积 = |∑(Ei×Ni+1 - Ei+1×Ni)| / 2</p>
              <p>2. 周长 = ∑√[(Ei+1-Ei)² + (Ni+1-Ni)²]</p>
              <p>其中：E为东坐标，N为北坐标</p>
            </div>
          </div>
        )}
      </Form>
    );
  };

  // 角度转换计算
  const calculateAngle = () => {
    angleForm.validateFields().then(values => {
      const { degrees } = values;
      const inputValue = parseFloat(degrees);
      
      if (isNaN(inputValue)) {
        message.error('请输入有效的角度值');
        return;
      }
      
      let result;
      if (isDecimalInput) {
        // 如果是十进制度数，转换为DD.MMSS格式
        result = {
          inputType: '十进制度数',
          inputValue: inputValue.toFixed(6),
          outputType: 'DD.MMSS格式',
          outputValue: decimalToDDMMSS(inputValue)
        };
      } else {
        // 如果是DD.MMSS格式，转换为十进制度数
        // 验证输入是否符合DD.MMSS格式
        if (!isValidDDMMSS(inputValue)) {
          message.error('输入的DD.MMSS格式不正确，分和秒不能超过60');
          return;
        }
        
        result = {
          inputType: 'DD.MMSS格式',
          inputValue: formatDDMMSS(inputValue),
          outputType: '十进制度数',
          outputValue: DDMMSSToDecimal(inputValue).toFixed(6)
        };
      }
      
      setAngleResult(result);
      message.success('角度转换完成');
    }).catch(err => {
      message.error('请填写所有必填字段');
    });
  };
  
  // 验证是否为有效的DD.MMSS格式
  const isValidDDMMSS = (value) => {
    // 获取小数部分
    const decimalPart = value - Math.floor(value);
    
    // 获取分部分
    const minutes = Math.floor(decimalPart * 100);
    
    // 获取秒部分
    const seconds = Math.round((decimalPart * 100 - minutes) * 100);
    
    // 如果分或秒大于等于60，则不是有效的DD.MMSS格式
    return minutes < 60 && seconds < 60;
  };
  
  // 十进制度数转换为DD.MMSS格式
  const decimalToDDMMSS = (decimal) => {
    // 获取整数部分（度）
    const degrees = Math.floor(decimal);
    
    // 计算剩余的小数部分（转换为分）
    const minutesDecimal = (decimal - degrees) * 60;
    
    // 获取分的整数部分
    const minutes = Math.floor(minutesDecimal);
    
    // 计算秒
    const seconds = Math.round((minutesDecimal - minutes) * 60);
    
    // 处理进位情况
    let adjustedMinutes = minutes;
    let adjustedSeconds = seconds;
    let adjustedDegrees = degrees;
    
    if (adjustedSeconds >= 60) {
      adjustedSeconds = 0;
      adjustedMinutes += 1;
    }
    
    if (adjustedMinutes >= 60) {
      adjustedMinutes = 0;
      adjustedDegrees += 1;
    }
    
    // 格式化为DD.MMSS
    return `${adjustedDegrees}.${adjustedMinutes.toString().padStart(2, '0')}${adjustedSeconds.toString().padStart(2, '0')}`;
  };
  
  // DD.MMSS格式转换为十进制度数
  const DDMMSSToDecimal = (ddmmss) => {
    // 获取整数部分（度）
    const degrees = Math.floor(ddmmss);
    
    // 获取小数部分
    const fractional = ddmmss - degrees;
    
    // 将小数部分乘以100，得到分和秒
    const minutesAndSeconds = fractional * 100;
    
    // 获取分
    const minutes = Math.floor(minutesAndSeconds);
    
    // 获取秒
    const seconds = Math.round((minutesAndSeconds - minutes) * 100);
    
    // 转换为十进制度数
    return degrees + minutes / 60 + seconds / 3600;
  };
  
  // 格式化DD.MMSS显示
  const formatDDMMSS = (ddmmss) => {
    const degrees = Math.floor(ddmmss);
    const fractional = ddmmss - degrees;
    const minutesAndSeconds = fractional * 100;
    const minutes = Math.floor(minutesAndSeconds);
    const seconds = Math.round((minutesAndSeconds - minutes) * 100);
    
    return `${degrees}° ${minutes.toString().padStart(2, '0')}' ${seconds.toString().padStart(2, '0')}"`;
  };

  const showDrawer = () => {
    setDrawerVisible(true);
  };

  const onCloseDrawer = () => {
    setDrawerVisible(false);
  };

  const handleMenuClick = (item) => {
    if (item.key !== 'tools') {
      onCloseDrawer();
    }
  };

  // 计算面积
  const calculateArea = () => {
    areaForm.validateFields().then(values => {
      const points = values.points;
      if (points.length < 3) {
        message.error('至少需要3个坐标点才能计算面积');
        return;
      }

      // 使用坐标法计算面积
      let area = 0;
      for (let i = 0; i < points.length; i++) {
        const currentPoint = points[i];
        const nextPoint = points[(i + 1) % points.length];
        area += parseFloat(currentPoint.e) * parseFloat(nextPoint.n) - parseFloat(nextPoint.e) * parseFloat(currentPoint.n);
      }
      area = Math.abs(area) / 2;

      // 计算周长
      let perimeter = 0;
      for (let i = 0; i < points.length; i++) {
        const currentPoint = points[i];
        const nextPoint = points[(i + 1) % points.length];
        const distance = Math.sqrt(
          Math.pow(parseFloat(nextPoint.e) - parseFloat(currentPoint.e), 2) +
          Math.pow(parseFloat(nextPoint.n) - parseFloat(currentPoint.n), 2)
        );
        perimeter += distance;
      }

      // 设置结果
      setAreaResult({
        area: area.toFixed(4),
        perimeter: perimeter.toFixed(4),
        pointCount: points.length
      });

      message.success('计算完成');
    }).catch(err => {
      console.log('计算错误:', err);
      message.error('请填写所有必填字段');
    });
  };

  return (
    <Layout className={styles.layout}>
      {!isMobile && (
        <Header className={styles.header}>
          <div className={styles.menu}>
            <Menu mode="horizontal" theme="dark" defaultSelectedKeys={['tools']} items={menuItems} onClick={handleMenuClick} />
          </div>
        </Header>
      )}
      
      {isMobile && (
        <div className={styles.mobileHeader}>
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={showDrawer}
            className={styles.menuButton}
          />
          <div className={styles.headerTitle}>实用工具</div>
          <div style={{ width: 32 }}></div>
        </div>
      )}
      
      <Drawer
        title="导航菜单"
        placement="left"
        onClose={onCloseDrawer}
        open={drawerVisible}
        width={250}
      >
        <Menu
          mode="vertical"
          theme="dark"
          defaultSelectedKeys={['tools']}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Drawer>
      
      <Content className={styles.content}>
        <Card className={styles.mainCard}>
          <div className={styles.calculationTypeContainer}>
            <Radio.Group
              value={calculationType}
              onChange={(e) => setCalculationType(e.target.value)}
              buttonStyle="solid"
              className={styles.calculationTypeSelector}
            >
              <Radio.Button value="arc">中拱计算</Radio.Button>
              <Radio.Button value="hypotenuse">斜边计算</Radio.Button>
              <Radio.Button value="level">平水快速计算</Radio.Button>
              <Radio.Button value="angle">角度转换</Radio.Button>
              <Radio.Button value="area">面积计算</Radio.Button>
            </Radio.Group>
          </div>
          
          {calculationType === 'arc' && (
            <Form 
              form={arcForm} 
              layout="horizontal" 
              {...formLayout}
              className={styles.horizontalForm}
              colon={false}
              onValuesChange={handleArcInputChange} 
              initialValues={{ radius: "100", chordLength: "20" }}
            >
              <div className={styles.formGroup}>
                <h4 className={styles.formSectionTitle}>中拱计算参数</h4>
                <Form.Item 
                  label={<span style={labelStyle}>半径 (m)</span>} 
                    name="radius" 
                    rules={[{ required: true, message: '请输入半径' }]}
                  >
                    <Input 
                      type="number" 
                      step="any" 
                      inputMode="decimal" 
                      pattern="[0-9]*[.,]?[0-9]*"
                    />
                  </Form.Item>
                <Form.Item 
                  label={<span style={labelStyle}>弦长 (m)</span>} 
                    name="chordLength" 
                    rules={[{ required: true, message: '请输入弦长' }]}
                  >
                    <Input 
                      type="number" 
                      step="any" 
                      inputMode="decimal" 
                      pattern="[0-9]*[.,]?[0-9]*"
                    />
                  </Form.Item>
              </div>
              
              <div className={styles.arcDiagram}>
                <h4 className={styles.diagramTitle}>中拱示意图</h4>
                <div className={styles.diagramContent} style={{ height: '200px', position: 'relative', overflow: 'visible' }}>
                  <svg width="100%" height="100%" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
                    {/* 地面线 */}
                    <line x1="50" y1="150" x2="350" y2="150" stroke="#8c8c8c" strokeWidth="2" />
                    
                    {/* 弦线 */}
                    <line x1="100" y1="150" x2="300" y2="150" stroke="#1890ff" strokeWidth="2" />
                    
                    {/* 中矢距 */}
                    <line 
                      x1="200" 
                      y1="150" 
                      x2="200" 
                      y2={arcResult ? Math.max(50, 150 - parseFloat(arcResult.midOffset) * 40) : 100} 
                      stroke="#ff4d4f" 
                      strokeWidth="2" 
                      strokeDasharray="5,3" 
                    />
                    
                    {/* 弧线 - 动态调整控制点高度 */}
                    <path 
                      d={`M 100,150 Q 200,${arcResult ? Math.max(30, 150 - parseFloat(arcResult.midOffset) * 80) : 50} 300,150`}
                      fill="none" 
                      stroke="#52c41a" 
                      strokeWidth="2"
                    />
                    
                    {/* 四分点标记 */}
                    {quarterResult && quarterResult.map((result, index) => {
                      const quarterChordLength = parseFloat(result.chordLength);
                      const distanceFromStart = parseFloat(result.distanceFromStart);
                      const quarterMidOffset = parseFloat(result.midOffset);
                      
                      // 计算四分点的位置
                      const leftX = 200 - distanceFromStart - quarterChordLength / 2;
                      const rightX = 200 - distanceFromStart + quarterChordLength / 2;
                      const midY = 150 - quarterMidOffset * 40;
                      
                      return (
                        <g key={index}>
                          {/* 四分点左侧点 */}
                          <circle 
                            cx={leftX} 
                            cy="150" 
                            r="3" 
                            fill="#ff8c00" 
                            stroke="#fff" 
                            strokeWidth="1"
                          />
                          
                          {/* 四分点右侧点 */}
                          <circle 
                            cx={rightX} 
                            cy="150" 
                            r="3" 
                            fill="#ff8c00" 
                            stroke="#fff" 
                            strokeWidth="1"
                          />
                          
                          {/* 四分点弦线 */}
                          <line 
                            x1={leftX} 
                            y1="150" 
                            x2={rightX} 
                            y2="150" 
                            stroke="#ff8c00" 
                            strokeWidth="1.5" 
                            strokeDasharray="3,2"
                          />
                          
                          {/* 四分点中矢距线 */}
                          <line 
                            x1={(leftX + rightX) / 2} 
                            y1="150" 
                            x2={(leftX + rightX) / 2} 
                            y2={midY} 
                            stroke="#ff8c00" 
                            strokeWidth="1.5" 
                            strokeDasharray="3,2"
                          />
                          
                          {/* 四分点标签 */}
                          <text 
                            x={(leftX + rightX) / 2} 
                            y="165" 
                            textAnchor="middle" 
                            fill="#ff8c00" 
                            fontSize="10"
                          >
                            四分点#{result.count || (index + 1)}
                          </text>
                        </g>
                      );
                    })}
                    
                    {/* 文字标签 */}
                    <text x="200" y="170" textAnchor="middle" fill="#333" fontSize="14">弦长</text>
                    <text 
                      x="180" 
                      y={arcResult ? Math.max(40, 150 - parseFloat(arcResult.midOffset) * 40 - 10) : 125} 
                      textAnchor="end" 
                      fill="#ff4d4f" 
                      fontSize="14"
                    >
                      中矢距
                    </text>
                    <text 
                      x="200" 
                      y={arcResult ? Math.max(20, 150 - parseFloat(arcResult.midOffset) * 80 - 20) : 70} 
                      textAnchor="middle" 
                      fill="#52c41a" 
                      fontSize="14"
                    >
                      弧长
                    </text>
                    
                    {/* 数值标签 */}
                    {arcResult && (
                      <>
                        <text x="200" y="185" textAnchor="middle" fill="#1890ff" fontSize="14">
                          {arcResult.chordLength} m
                        </text>
                        <text 
                          x="160" 
                          y={Math.max(40, 150 - parseFloat(arcResult.midOffset) * 40 - 10)} 
                          textAnchor="end" 
                          fill="#ff4d4f" 
                          fontSize="14"
                        >
                          {arcResult.midOffset} m
                        </text>
                        <text 
                          x="200" 
                          y={Math.max(20, 150 - parseFloat(arcResult.midOffset) * 80 - 40)} 
                          textAnchor="middle" 
                          fill="#52c41a" 
                          fontSize="14"
                        >
                          {arcResult.arcLength} m
                        </text>
                      </>
                    )}
                  </svg>
                </div>
                <div className={styles.diagramDescription}>
                  <p><strong>中拱计算公式：</strong></p>
                  <p>1. 中矢距 = 半径 - √(半径² - (弦长/2)²)</p>
                  <p>2. 弧长 = 2 × 半径 × arcsin(弦长/(2×半径))</p>
                  <p className={styles.scaleNote}>注：图示比例仅供参考，非实际比例</p>
                </div>
              </div>
              
              <div className={styles.buttonGroup}>
                <Button type="primary" size="large" className={styles.submitButton} onClick={calculateArc}>计算</Button>
                <Button type="default" size="large" className={styles.clearButton} onClick={() => arcForm.resetFields()}>清除数据</Button>
              </div>
              
              {arcResult && (
                <div className={styles.resultCard}>
                  <h3>中拱计算结果</h3>
                  <div className={styles.arcResultItem}>
                    <Divider orientation="left" className={styles.arcDivider}>
                      弧段计算
                    </Divider>
                    <div className={styles.resultRow}>
                      <p><span>半径:</span> <span>{arcResult.radius} m</span></p>
                    </div>
                    <div className={styles.resultRow}>
                      <p><span>弦长:</span> <span>{arcResult.chordLength} m</span></p>
                    </div>
                    <div className={styles.resultRow}>
                      <p><span>中矢距:</span> <span>{arcResult.midOffset} m</span></p>
                    </div>
                    <div className={styles.resultRow}>
                      <p><span>弧长:</span> <span>{arcResult.arcLength} m</span></p>
                    </div>
                  </div>
                </div>
              )}
              
              {quarterResult && quarterCount > 0 && (
                <div className={styles.resultCard}>
                  <h3>四分点计算结果</h3>
                  {quarterResult.map((result, index) => (
                    <div className={styles.quarterResultItem} key={index}>
                      <Divider orientation="left" className={styles.quarterDivider}>
                        四分点 #{result.count || (index + 1)}
                      </Divider>
                      <div className={styles.resultRow}>
                        <p><span>距起点:</span> <span>{result.distanceFromStart} m</span></p>
                      </div>
                      <div className={styles.resultRow}>
                        <p><span>弦长:</span> <span>{result.chordLength} m</span></p>
                      </div>
                      <div className={styles.resultRow}>
                        <p><span>中矢距:</span> <span>{result.midOffset} m</span></p>
                      </div>
                    </div>
                  ))}
                  <div className={styles.buttonRow}>
                    <Button 
                      type="primary" 
                      className={styles.quarterButton} 
                      onClick={calculateQuarterMethod}
                    >
                      继续计算四分点
                    </Button>
                    <Button 
                      type="default" 
                      className={styles.resetButton} 
                      onClick={resetQuarterMethod}
                    >
                      重置四分点
                    </Button>
                  </div>
                </div>
              )}
              
              {!quarterResult && (
                <div className={styles.buttonRow}>
                  <Button 
                    type="primary" 
                    className={styles.quarterButton} 
                    onClick={calculateQuarterMethod}
                    disabled={!arcResult}
                  >
                    计算四分点
                  </Button>
                </div>
              )}
            </Form>
          )}
          {calculationType === 'hypotenuse' && (
            <Form form={hypotenuseForm} layout="horizontal" initialValues={{ adjacent: "", opposite: "" }}>
              <div className={styles.formGroup}>
                <h4 className={styles.formSectionTitle}>直角三角形参数</h4>
                <Form.Item 
                  label={<span style={labelStyle}>邻边长度 (m)</span>} 
                    name="adjacent" 
                    rules={[{ required: true, message: '请输入邻边长度' }]}
                  >
                    <Input 
                      type="number" 
                      step="any" 
                      inputMode="decimal" 
                      pattern="[0-9]*[.,]?[0-9]*"
                    />
                  </Form.Item>
                <Form.Item 
                  label={<span style={labelStyle}>对边长度 (m)</span>} 
                    name="opposite" 
                    rules={[{ required: true, message: '请输入对边长度' }]}
                  >
                    <Input 
                      type="number" 
                      step="any" 
                      inputMode="decimal" 
                      pattern="[0-9]*[.,]?[0-9]*"
                    />
                  </Form.Item>
                </div>
                
                <div className={styles.triangleDiagram}>
                  <h4 className={styles.diagramTitle}>直角三角形示意图</h4>
                  <div className={styles.triangleContent}>
                    <svg width="100%" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
                      {/* 三角形 */}
                      <polygon points="50,150 250,150 250,50" fill="none" stroke="#1890ff" strokeWidth="2" />
                      
                      {/* 直角标记 */}
                      <path d="M 240,150 L 240,140 L 250,140" fill="none" stroke="#1890ff" strokeWidth="1.5" />
                      
                      {/* 邻边 */}
                      <line x1="50" y1="160" x2="250" y2="160" stroke="#ff4d4f" strokeWidth="1.5" strokeDasharray="5,3" />
                      <text x="150" y="175" textAnchor="middle" fill="#ff4d4f">邻边</text>
                      
                      {/* 对边 */}
                      <line x1="260" y1="150" x2="260" y2="50" stroke="#52c41a" strokeWidth="1.5" strokeDasharray="5,3" />
                      <text x="275" y="100" textAnchor="middle" fill="#52c41a">对边</text>
                      
                      {/* 斜边 */}
                      <line x1="40" y1="150" x2="40" y2="50" stroke="#faad14" strokeWidth="1.5" strokeDasharray="5,3" />
                      <line x1="40" y1="50" x2="50" y2="50" stroke="#faad14" strokeWidth="1.5" strokeDasharray="5,3" />
                      <text x="30" y="100" textAnchor="middle" fill="#faad14">斜边</text>
                      
                      {/* 角度 */}
                      <path d="M 70,150 A 20,20 0 0 1 50,130" fill="none" stroke="#722ed1" strokeWidth="1.5" />
                      <text x="70" y="130" textAnchor="middle" fill="#722ed1">α</text>
                      
                      <path d="M 250,130 A 20,20 0 0 1 230,150" fill="none" stroke="#722ed1" strokeWidth="1.5" />
                      <text x="230" y="130" textAnchor="middle" fill="#722ed1">β</text>
                      
                      <text x="245" y="145" textAnchor="middle" fill="#722ed1">90°</text>
                    </svg>
                  </div>
                  <div className={styles.diagramDescription}>
                    <p><strong>直角三角形计算原理：</strong></p>
                    <p>1. 勾股定理：斜边² = 邻边² + 对边²</p>
                    <p>2. 角度α = arctan(对边/邻边)</p>
                    <p>3. 角度β = 90° - α</p>
                  </div>
                </div>
                
                <Button type="primary" size="large" className={styles.submitButton} onClick={calculateHypotenuse}>计算</Button>
                
                {hypotenuseResult && (
                  <div className={styles.resultCard}>
                    <h3>斜边计算结果</h3>
                    <div className={styles.hypotenuseResultItem}>
                      <Divider orientation="left" className={styles.hypotenuseDivider}>
                        三角形计算
                      </Divider>
                      <div className={styles.resultRow}>
                        <p><span>邻边长度:</span> <span>{hypotenuseResult.adjacent} m</span></p>
                      </div>
                      <div className={styles.resultRow}>
                        <p><span>对边长度:</span> <span>{hypotenuseResult.opposite} m</span></p>
                      </div>
                      <div className={styles.resultRow}>
                        <p><span>斜边长度:</span> <span>{hypotenuseResult.hypotenuse} m</span></p>
                      </div>
                      <div className={styles.resultRow}>
                        <p><span>角度α (邻边与斜边夹角):</span> <span>{hypotenuseResult.angle}°</span></p>
                      </div>
                      <div className={styles.resultRow}>
                        <p><span>角度β (对边与斜边夹角):</span> <span>{hypotenuseResult.complementaryAngle}°</span></p>
                      </div>
                      <div className={styles.resultRow}>
                        <p><span>直角 (对边与邻边夹角):</span> <span>{hypotenuseResult.rightAngle}°</span></p>
                      </div>
                    </div>
                  </div>
                )}
              </Form>
            )}
            {calculationType === 'level' && renderLevelForm()}
            {calculationType === 'angle' && renderAngleForm()}
            {calculationType === 'area' && renderAreaForm()}
          </Card>
        </Content>
      </Layout>
    );
  };

export default ToolsLayout;