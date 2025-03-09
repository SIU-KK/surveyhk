import React, { useState, useEffect } from 'react';
import { Layout, Menu, Card, Form, Input, Button, Table, Tabs, Drawer, Radio, message, Space, Row, Col, Divider, Switch, Modal } from 'antd';
import { HomeOutlined, CompassOutlined, CalculatorOutlined, AimOutlined, RadiusSettingOutlined, ToolOutlined, MonitorOutlined, MenuOutlined, DeleteOutlined, PlusOutlined, DownloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './ToolsLayout.module.css';
import * as XLSX from 'xlsx';

const { Content, Header } = Layout;

const ToolsLayout = () => {
  const [calculationType, setCalculationType] = useState('simpleLevel');
  const [arcForm] = Form.useForm();
  const [hypotenuseForm] = Form.useForm();
  const [levelForm] = Form.useForm();
  const [simpleLevelForm] = Form.useForm();
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
  const [simpleLevelResult, setSimpleLevelResult] = useState(null);
  const [levelPoints, setLevelPoints] = useState([]);
  const [isAddPointModalVisible, setIsAddPointModalVisible] = useState(false);
  const [currentPointId, setCurrentPointId] = useState('');
  const [newPointForm] = Form.useForm();
  const [isInputModalVisible, setIsInputModalVisible] = useState(false);
  const [inputFormType, setInputFormType] = useState('bs'); // 'bs' 或 'fs'
  const [isStarted, setIsStarted] = useState(false); // 判断是否已经开始
  const [lastPointType, setLastPointType] = useState(null); // 上一个点的类型 'bs' 或 'fs'
  const [inputForm] = Form.useForm(); // 为输入弹窗创建表单实例

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
      // 如果是移动设备，默认选中简易平水计算
      setCalculationType('simpleLevel');
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
      label: '施工放樣',
      onClick: () => navigate('/construction-layout')
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
      label: '實用工具'
    },
    {
      key: 'settlement-monitoring',
      icon: <MonitorOutlined />,
      label: '沉降監測系統',
      onClick: () => navigate('/settlement-monitoring')
    }
  ];

  // 简易平水计算
  const calculateSimpleLevel = () => {
    simpleLevelForm.validateFields().then(values => {
      const backSight = parseFloat(values.backSight);
      const foreSight = parseFloat(values.foreSight);
      const startHeight = parseFloat(values.startHeight);
      
      if (isNaN(backSight) || isNaN(foreSight) || isNaN(startHeight)) {
        message.error('请输入有效的数值');
        return;
      }
      
      // 计算高程
      const heightDifference = backSight - foreSight;
      const endHeight = startHeight + heightDifference;
      
      setSimpleLevelResult({
        backSight: backSight.toFixed(4),
        foreSight: foreSight.toFixed(4),
        startHeight: startHeight.toFixed(4),
        heightDifference: heightDifference.toFixed(4),
        endHeight: endHeight.toFixed(4)
      });
      
      message.success('计算完成');
    }).catch(err => {
      message.error('请填写所有必填字段');
    });
  };

  // 渲染简易平水表单
  const renderSimpleLevelForm = () => {
    // 添加表单值变化监听
    const handleBenchMarkChange = (value) => {
      simpleLevelForm.setFieldsValue({
        currentId: value
      });
    };

    return (
    <Card title="简易平水计算" className={styles.calculatorCard}>
      <Form
        form={simpleLevelForm}
        {...formLayout}
      >
        <div className={styles.formSection}>
          <h4 className={styles.sectionTitle}>起始点数据</h4>
          <Form.Item
            label="Bench Mark"
            name="benchMark"
            rules={[{ required: true, message: '请输入起始点编号' }]}
          >
            <Input 
              placeholder="输入起始点编号" 
              onChange={(e) => handleBenchMarkChange(e.target.value)}
            />
          </Form.Item>
          
          <Form.Item
            label="Reduced Level"
            name="reducedLevel"
            rules={[{ required: true, message: '请输入起始点高程' }]}
          >
            <Input
              type="number"
              step="any"
              inputMode="decimal"
              placeholder="输入起始点高程"
              suffix="m"
            />
        </Form.Item>
      </div>

        <div className={styles.formSection}>
          <h4 className={styles.sectionTitle}>观测点数据</h4>
          {/* 移除ID和Back-Sight输入框 */}
          
          {/* 保留观测点数据表格 */}
          {(levelPoints.length > 0 || simpleLevelForm.getFieldValue('benchMark')) && (
            <div className={styles.observationTable}>
              <h4 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                已输入的观测点数据
                <Button 
                  type="default" 
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    setLevelPoints([]);
                    simpleLevelForm.setFieldsValue({ backSight: '' });
                    setIsStarted(false);
                    setLastPointType(null);
                  }}
                >
                  清除
                </Button>
              </h4>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>B.S</th>
                    <th>F.S</th>
                    <th>R.L</th>
                  </tr>
                </thead>
                <tbody>
                  {/* 显示第一个点(Bench Mark) */}
                  {simpleLevelForm.getFieldValue('benchMark') && (
                    <tr>
                      <td>{simpleLevelForm.getFieldValue('benchMark')}</td>
                      <td>{simpleLevelForm.getFieldValue('backSight')}</td>
                      <td>-</td>
                      <td>{simpleLevelForm.getFieldValue('reducedLevel')}</td>
                    </tr>
                  )}
                  
                  {/* 显示后续的点 */}
                  {(() => {
                    // 预先计算所有点的高程
                    const rls = [];
                    let startRL = parseFloat(simpleLevelForm.getFieldValue('reducedLevel'));
                    let startBS = simpleLevelForm.getFieldValue('backSight') ? parseFloat(simpleLevelForm.getFieldValue('backSight')) : 0;
                    
                    // 计算每个点的高程
                    levelPoints.forEach((point, idx) => {
                      if (idx === 0) {
                        // 第一个点：RL = 起始点RL + 起始点BS - 第一点FS
                        if (point.foreSight) {
                          rls.push(startRL + startBS - parseFloat(point.foreSight));
                        } else {
                          rls.push(startRL);
                        }
                      } else {
                        // 后续点：RL = 上一点RL + 上一点BS - 当前点FS
                        const prevPoint = levelPoints[idx - 1];
                        const prevRL = rls[idx - 1];
                        
                        if (prevPoint.backSight && point.foreSight) {
                          rls.push(prevRL + parseFloat(prevPoint.backSight) - parseFloat(point.foreSight));
                        } else if (prevPoint.backSight) {
                          rls.push(prevRL + parseFloat(prevPoint.backSight));
                        } else if (point.foreSight) {
                          rls.push(prevRL - parseFloat(point.foreSight));
                        } else {
                          rls.push(prevRL);
                        }
                      }
                    });
                    
                    // 渲染表格行
                    return levelPoints.map((point, index) => (
                      <tr key={index}>
                        <td>{point.id}</td>
                        <td>{point.backSight || '-'}</td>
                        <td>{point.foreSight || '-'}</td>
                        <td>{rls[index].toFixed(4)}</td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className={styles.buttonGroup}>
          {!isStarted ? (
            <Button type="primary" onClick={() => showInputModal()} style={{ marginRight: 8 }}>
              开始
            </Button>
          ) : (
            <Button type="primary" onClick={() => showInputModal()} style={{ marginRight: 8 }}>
              下一点
            </Button>
          )}
          <Button 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={() => {
              // 检查是否有数据可以导出
              if (!isStarted || !simpleLevelForm.getFieldValue('backSight')) {
                message.error('请先开始输入观测点数据');
                return;
              }

              // 预先计算所有点的高程
              const rls = [];
              let startRL = parseFloat(simpleLevelForm.getFieldValue('reducedLevel'));
              let startBS = simpleLevelForm.getFieldValue('backSight') ? parseFloat(simpleLevelForm.getFieldValue('backSight')) : 0;
              
              // 计算每个点的高程
              levelPoints.forEach((point, idx) => {
                if (idx === 0) {
                  // 第一个点：RL = 起始点RL + 起始点BS - 第一点FS
                  if (point.foreSight) {
                    rls.push(startRL + startBS - parseFloat(point.foreSight));
                  } else {
                    rls.push(startRL);
                  }
                } else {
                  // 后续点：RL = 上一点RL + 上一点BS - 当前点FS
                  const prevPoint = levelPoints[idx - 1];
                  const prevRL = rls[idx - 1];
                  
                  if (prevPoint.backSight && point.foreSight) {
                    rls.push(prevRL + parseFloat(prevPoint.backSight) - parseFloat(point.foreSight));
                  } else if (prevPoint.backSight) {
                    rls.push(prevRL + parseFloat(prevPoint.backSight));
                  } else if (point.foreSight) {
                    rls.push(prevRL - parseFloat(point.foreSight));
                  } else {
                    rls.push(prevRL);
                  }
                }
              });
              
              // 构建要导出的数据
              const allPoints = [];
              
              // 添加第一个点（起始点）
              allPoints.push({
                id: simpleLevelForm.getFieldValue('benchMark'),
                backSight: simpleLevelForm.getFieldValue('backSight'),
                foreSight: '-',
                reducedLevel: parseFloat(simpleLevelForm.getFieldValue('reducedLevel')).toFixed(4)
              });
              
              // 添加观测点
              levelPoints.forEach((point, idx) => {
                allPoints.push({
                  id: point.id,
                  backSight: point.backSight || '-',
                  foreSight: point.foreSight || '-',
                  reducedLevel: rls[idx].toFixed(4)
                });
              });
              
              // 创建CSV内容
              // 添加表头
              const header = "ID,B.S,F.S,R.L\n";
              
              // 生成数据行
              const dataRows = allPoints
                .map((p, i) => `${p.id},${p.backSight || '-'},${i === 0 ? '-' : p.foreSight || '-'},${p.reducedLevel}`)
                .join('\n');
              
              // 合并表头和数据
              const csvContent = header + dataRows;
              
              // 完全按照GSI文件下载的方式实现
              let element = document.createElement('a');
              element.setAttribute('href', 'data:application/octet-stream;charset=utf-8,' + encodeURIComponent(csvContent));
              
              // 设置文件名
              const fileName = `平水计算_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`;
              element.setAttribute('download', fileName);
              element.style.display = 'none';
              document.body.appendChild(element);
              element.click();
              document.body.removeChild(element);
              
              message.success(`${fileName} 文件下载成功`);
            }}
            style={{ marginLeft: 8 }}
          >
            下载CSV
          </Button>
        </div>
    </Form>

      <Modal
        title="输入下一观测点"
        visible={isAddPointModalVisible}
        onOk={handleAddPoint}
        onCancel={() => setIsAddPointModalVisible(false)}
        destroyOnClose
      >
        <Form form={newPointForm} layout="vertical">
          <Form.Item
            label="ID"
            name="pointId"
            rules={[{ required: true, message: '请输入观测点编号' }]}
          >
            <Input placeholder="输入观测点编号" />
          </Form.Item>
          
          <Form.Item
            label="Fore-Sight"
            name="foreSight"
            rules={[{ required: true, message: '请输入前视读数' }]}
          >
            <Input
              type="number"
              step="any"
              inputMode="decimal"
              placeholder="输入前视读数"
              suffix="m"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 添加输入弹窗 */}
      <Modal
        title={inputFormType === 'bs' ? "输入后视读数" : "输入前视读数"}
        visible={isInputModalVisible}
        onOk={handleInputSubmit}
        onCancel={() => setIsInputModalVisible(false)}
        destroyOnClose
        className={isMobile ? styles.mobileModal : ''}
        footer={[
          <Button key="next" onClick={() => {
            // 先提交当前输入
            inputForm.validateFields().then(values => {
              // 保存当前输入类型
              const currentType = inputFormType;
              
              // 处理当前输入
              if (currentType === 'bs') {
                // 处理后视读数输入
                if (!isStarted) {
                  // 第一次输入后视读数（第一点）
                  simpleLevelForm.setFieldsValue({
                    backSight: values.backSight
                  });
                  setIsStarted(true);
                  setLastPointType('bs');
                } else {
                  // 添加后视读数到当前点
                  const updatedPoints = [...levelPoints];
                  const lastIndex = updatedPoints.length - 1;
                  
                  if (lastIndex >= 0) {
                    // 更新当前点的后视读数
                    updatedPoints[lastIndex].backSight = values.backSight;
                    setLevelPoints(updatedPoints);
                  }
                  setLastPointType('bs');
                }
                
                // 关闭当前弹窗
                setIsInputModalVisible(false);
                
                // 显示下一个输入弹窗（前视）
                setTimeout(() => {
                  setInputFormType('fs');
                  
                  // 获取上一个点的ID或Bench Mark
                  const lastId = levelPoints.length > 0 
                    ? levelPoints[levelPoints.length - 1].id 
                    : simpleLevelForm.getFieldValue('benchMark');
                  
                  // 生成下一个ID
                  const nextId = generateNextId(lastId);
                  
                  // 重置表单并设置默认ID
                  inputForm.resetFields();
                  inputForm.setFieldsValue({ pointId: nextId });
                  
                  // 显示弹窗
                  setIsInputModalVisible(true);
                }, 100);
              } else {
                // 处理前视读数输入
                if (levelPoints.length === 0 || (levelPoints[levelPoints.length - 1].backSight && levelPoints[levelPoints.length - 1].foreSight)) {
                  // 如果是第一个点或上一个点已有BS和FS，则创建新点
                  const newId = values.pointId || generateNextId(
                    levelPoints.length > 0 
                      ? levelPoints[levelPoints.length - 1].id 
                      : simpleLevelForm.getFieldValue('benchMark')
                  );
                  
                  // 创建新点，只有FS值
                  const newPoint = {
                    id: newId,
                    backSight: null,
                    foreSight: values.foreSight
                  };
                  
                  setLevelPoints(prev => [...prev, newPoint]);
                } else {
                  // 更新当前点的前视读数
                  const updatedPoints = [...levelPoints];
                  const lastIndex = updatedPoints.length - 1;
                  
                  if (lastIndex >= 0) {
                    updatedPoints[lastIndex].foreSight = values.foreSight;
                    setLevelPoints(updatedPoints);
                  }
                }
                setLastPointType('fs');
                
                // 关闭当前弹窗
                setIsInputModalVisible(false);
                
                // 显示下一个输入弹窗（后视）
                setTimeout(() => {
                  setInputFormType('bs');
                  
                  // 重置表单
                  inputForm.resetFields();
                  
                  // 显示弹窗
                  setIsInputModalVisible(true);
                }, 100);
              }
            }).catch(error => {
              console.error('表单验证失败:', error);
              message.error('请填写所有必填字段');
            });
          }}>
            下一点
          </Button>,
          <Button key="submit" type="primary" onClick={handleInputSubmit}>
            确定
          </Button>
        ]}
      >
        <Form form={inputForm} layout="vertical">
          {inputFormType === 'fs' && (
            <Form.Item
              label="ID"
              name="pointId"
              rules={[{ required: true, message: '请输入观测点编号' }]}
            >
              <Input placeholder="输入观测点编号" />
            </Form.Item>
          )}
          
          <Form.Item
            label={inputFormType === 'bs' ? "Back-Sight" : "Fore-Sight"}
            name={inputFormType === 'bs' ? "backSight" : "foreSight"}
            rules={[{ required: true, message: `请输入${inputFormType === 'bs' ? '后' : '前'}视读数` }]}
          >
            <Input
              type="number"
              step="any"
              inputMode="decimal"
              placeholder={`输入${inputFormType === 'bs' ? '后' : '前'}视读数`}
              suffix="m"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 移除计算结果部分 */}
    </Card>
  );
  };

  // 显示添加点的弹窗
  const showAddPointModal = () => {
    const values = simpleLevelForm.getFieldsValue();
    if (!values.currentId || !values.backSight) {
      message.error('请先填写当前观测点的ID和后视读数');
      return;
    }
    setIsAddPointModalVisible(true);
  };

  // 处理添加新的观测点
  const handleAddPoint = () => {
    newPointForm.validateFields().then(values => {
      const currentValues = simpleLevelForm.getFieldsValue();
      
      // 添加当前点到观测点列表，包含前视和后视读数
      setLevelPoints(prev => [...prev, {
        id: currentValues.currentId,
        backSight: currentValues.backSight,
        foreSight: values.foreSight
      }]);

      // 更新表单数据
      simpleLevelForm.setFieldsValue({
        currentId: values.pointId,
        backSight: ''
      });

      // 关闭弹窗并重置表单
      setIsAddPointModalVisible(false);
      newPointForm.resetFields();
    });
  };

  // 处理完成按钮点击
  const handleComplete = () => {
    // 检查是否有数据可以计算
    if (!isStarted || !simpleLevelForm.getFieldValue('backSight')) {
      message.error('请先开始输入观测点数据');
      return;
    }

    const values = simpleLevelForm.getFieldsValue();
    const allPoints = [];
    
    // 添加第一个点（起始点）
    allPoints.push({
      id: values.benchMark,
      backSight: values.backSight,
      foreSight: '-',
      reducedLevel: parseFloat(values.reducedLevel).toFixed(4)
    });
    
    // 预先计算所有点的高程
    const rls = [];
    let startRL = parseFloat(values.reducedLevel);
    let startBS = values.backSight ? parseFloat(values.backSight) : 0;
    
    // 计算每个点的高程
    levelPoints.forEach((point, idx) => {
      if (idx === 0) {
        // 第一个点：RL = 起始点RL + 起始点BS - 第一点FS
        if (point.foreSight) {
          rls.push(startRL + startBS - parseFloat(point.foreSight));
        } else {
          rls.push(startRL);
        }
      } else {
        // 后续点：RL = 上一点RL + 上一点BS - 当前点FS
        const prevPoint = levelPoints[idx - 1];
        const prevRL = rls[idx - 1];
        
        if (prevPoint.backSight && point.foreSight) {
          rls.push(prevRL + parseFloat(prevPoint.backSight) - parseFloat(point.foreSight));
        } else if (prevPoint.backSight) {
          rls.push(prevRL + parseFloat(prevPoint.backSight));
        } else if (point.foreSight) {
          rls.push(prevRL - parseFloat(point.foreSight));
        } else {
          rls.push(prevRL);
        }
      }
    });
    
    // 添加观测点到结果
    levelPoints.forEach((point, idx) => {
      allPoints.push({
        id: point.id,
        backSight: point.backSight || '-',
        foreSight: point.foreSight || '-',
        reducedLevel: rls[idx].toFixed(4)
      });
    });

    setSimpleLevelResult({
      points: allPoints
    });

    message.success('计算完成');
  };

  const calculateArc = () => {
    arcForm.validateFields().then(values => {
      const radius = parseFloat(values.radius);
      const chordLength = parseFloat(values.chordLength);
      
      if (radius <= 0) {
        message.error('半徑必須為正數');
        return;
      }
      
      if (chordLength <= 0) {
        message.error('弦長必須為正數');
        return;
      }
      
      if (chordLength > 2 * radius) {
        message.error('弦長不能大於直徑（2×半徑）');
        return;
      }
      
      // 計算中矢距
      const midOffset = radius - Math.sqrt(radius * radius - Math.pow(chordLength / 2, 2));
      
      // 計算弧長
      const arcLength = 2 * radius * Math.asin(chordLength / (2 * radius));
      
      // 設置結果
      setArcResult({
        radius: radius.toFixed(4),
        chordLength: chordLength.toFixed(4),
        midOffset: midOffset.toFixed(4),
        arcLength: arcLength.toFixed(4)
      });
      
      // 重置四分點結果
      setQuarterResult(null);
      setQuarterCount(0);
      
      message.success('計算完成');
    }).catch(err => {
      message.error('請填寫所有必填字段');
    });
  };

  // 四分法計算
  const calculateQuarterMethod = () => {
    if (!arcResult) {
      message.error('請先計算中拱值');
      return;
    }
    
    const radius = parseFloat(arcResult.radius);
    const chordLength = parseFloat(arcResult.chordLength);
    
    // 計算新的四分點
    const newQuarterCount = quarterCount + 1;
    const quarterChordLength = chordLength / Math.pow(2, newQuarterCount);
    const quarterMidOffset = radius - Math.sqrt(radius * radius - Math.pow(quarterChordLength / 2, 2));
    const distanceFromStart = chordLength / 2 - quarterChordLength / 2;
    
    // 創建或更新四分點結果數組
    const newQuarterResult = quarterResult ? [...quarterResult] : [];
    newQuarterResult.push({
      count: newQuarterCount,
      chordLength: quarterChordLength.toFixed(4),
      midOffset: quarterMidOffset.toFixed(4),
      distanceFromStart: distanceFromStart.toFixed(4)
    });
    
    setQuarterResult(newQuarterResult);
    setQuarterCount(newQuarterCount);
    
    message.success(`第${newQuarterCount}次四分法計算完成`);
    console.log('四分點計算結果:', newQuarterResult);
  };
  
  // 重置四分法計算
  const resetQuarterMethod = () => {
    setQuarterResult(null);
    setQuarterCount(0);
    message.success('四分點已重置');
  };

  // 處理弧長計算輸入變化
  const handleArcInputChange = () => {
    try {
      const values = arcForm.getFieldsValue();
      const radius = parseFloat(values.radius);
      const chordLength = parseFloat(values.chordLength);
      
      console.log('輸入變化:', { radius, chordLength });
      
      // 驗證輸入
      if (!radius || !chordLength || radius <= 0 || chordLength <= 0 || chordLength > 2 * radius) {
        return;
      }
      
      // 計算中矢距
      const midOffset = radius - Math.sqrt(radius * radius - Math.pow(chordLength / 2, 2));
      
      // 計算弧長
      const arcLength = 2 * radius * Math.asin(chordLength / (2 * radius));
      
      // 更新結果
      setArcResult({
        radius: radius.toFixed(4),
        chordLength: chordLength.toFixed(4),
        midOffset: midOffset.toFixed(4),
        arcLength: arcLength.toFixed(4)
      });
      
      console.log('輸入變化後更新結果:', {
        radius: radius.toFixed(4),
        chordLength: chordLength.toFixed(4),
        midOffset: midOffset.toFixed(4),
        arcLength: arcLength.toFixed(4)
      });
    } catch (err) {
      console.log('輸入變化處理錯誤:', err);
    }
  };

  // 斜邊計算
  const calculateHypotenuse = () => {
    hypotenuseForm.validateFields().then(values => {
      const { adjacent, opposite } = values;
      const a = parseFloat(adjacent);
      const b = parseFloat(opposite);
      
      if (a <= 0 || b <= 0) {
        message.error('鄰邊和對邊必須為正數');
        return;
      }
      
      // 計算斜邊長度（勾股定理）
      const hypotenuse = Math.sqrt(a * a + b * b);
      
      // 計算角度（反正切函數）
      // 鄰邊與斜邊的夾角
      const angleRad = Math.atan(b / a);
      const angleDeg = angleRad * (180 / Math.PI);
      
      // 對邊與斜邊的夾角（90度 - 鄰邊與斜邊的夾角）
      const complementaryAngleDeg = 90 - angleDeg;
      
      // 對邊與鄰邊的夾角（直角三角形中為90度）
      const rightAngleDeg = 90;
      
      setHypotenuseResult({
        adjacent: a,
        opposite: b,
        hypotenuse: hypotenuse.toFixed(4),
        angle: angleDeg.toFixed(2),
        complementaryAngle: complementaryAngleDeg.toFixed(2),
        rightAngle: rightAngleDeg
      });
      
      message.success('計算完成');
    }).catch(err => {
      message.error('請填寫所有必填字段');
    });
  };

  // 平水計算
  const calculateLevel = () => {
    levelForm.validateFields().then(values => {
      const { backSightElevation, designElevation, backSight, sideSight } = values;
      const bsElevation = parseFloat(backSightElevation);
      const bs = parseFloat(backSight);
      const ss = parseFloat(sideSight);
      const designElev = parseFloat(designElevation || 0);
      
      if (isNaN(bsElevation) || isNaN(bs) || isNaN(ss)) {
        message.error('請輸入有效的讀數');
        return;
      }
      
      // 計算儀器高
      const instrumentHeight = bsElevation + bs;
      
      // 計算旁視點高程
      const sideSightElevation = instrumentHeight - ss;
      
      // 計算高差（與設計高程的差值）
      const elevationDifference = sideSightElevation - designElev;
      
      // 確定高差方向（上升或下降）
      const elevationDirection = elevationDifference < 0 ? 'up' : 'down';
      
      // 設計點位置固定
      const designPointY = elevationDifference < 0 ? 100 : 180;
      
      // 清空額外旁視點數據
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
      
      message.success('平水計算完成');
    }).catch(err => {
      message.error('請填寫所有必填字段');
    });
  };
  
  // 清除平水計算數據
  const clearLevelData = () => {
    // 重置表單數據
    levelForm.resetFields();
    // 清空計算結果
    setLevelResult(null);
    // 清空額外旁視點數據
    setAdditionalSideSights([]);
    
    message.success('數據已清除');
  };
  
  // 顯示添加旁視點的彈窗
  const showAddSideSightModal = () => {
    // 如果已經有計算結果，則設置默認的設計高程
    if (levelResult) {
      newSideSightForm.setFieldsValue({
        designElevation: levelResult.designElevation
      });
    }
    setIsModalVisible(true);
  };
  
  // 關閉彈窗
  const handleCancel = () => {
    setIsModalVisible(false);
  };
  
  // 添加新的旁視點
  const handleAddSideSight = () => {
    newSideSightForm.validateFields().then(values => {
      const { sideSight, designElevation } = values;
      const ss = parseFloat(sideSight);
      const designElev = parseFloat(designElevation || 0);
      
      if (isNaN(ss) || isNaN(designElev)) {
        message.error('請輸入有效的讀數');
        return;
      }
      
      // 確保已經有主計算結果
      if (!levelResult) {
        message.error('請先進行主計算');
        return;
      }
      
      // 使用主計算的儀器高
      const instrumentHeight = parseFloat(levelResult.instrumentHeight);
      
      // 計算新旁視點高程
      const sideSightElevation = instrumentHeight - ss;
      
      // 計算高差（與設計高程的差值）
      const elevationDifference = sideSightElevation - designElev;
      
      // 確定高差方向（上升或下降）
      const elevationDirection = elevationDifference < 0 ? 'up' : 'down';
      
      // 添加到額外旁視點列表
      const newSideSight = {
        sideSight: ss.toFixed(4),
        designElevation: designElev.toFixed(4),
        sideSightElevation: sideSightElevation.toFixed(4),
        elevationDifference: Math.abs(elevationDifference).toFixed(4),
        elevationDirection: elevationDirection,
        actualDifference: elevationDifference
      };
      
      setAdditionalSideSights([...additionalSideSights, newSideSight]);
      
      // 清空表單並關閉彈窗
      newSideSightForm.resetFields();
      setIsModalVisible(false);
      
      message.success('添加旁視點成功');
    }).catch(err => {
      message.error('請填寫所有必填字段');
    });
  };

  // 水平計算表單
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
        <h4 className={styles.formSectionTitle}>水准測量參數</h4>
        <Form.Item 
          label={<span style={labelStyle}>後視高程 (m)</span>} 
          name="backSightElevation" 
          rules={[{ required: true, message: '請輸入後視高程' }]}
        >
          <Input 
            type="number" 
            step="any" 
            inputMode="decimal" 
            pattern="[0-9]*[.,]?[0-9]*"
          />
          </Form.Item>
        <Form.Item 
          label={<span style={labelStyle}>設計高程 (m)</span>} 
          name="designElevation" 
          rules={[{ required: true, message: '請輸入設計高程' }]}
        >
          <Input 
            type="number" 
            step="any" 
            inputMode="decimal" 
            pattern="[0-9]*[.,]?[0-9]*"
          />
          </Form.Item>
        <Form.Item 
          label={<span style={labelStyle}>後視讀數 (m)</span>} 
          name="backSight" 
          rules={[{ required: true, message: '請輸入後視讀數' }]}
        >
          <Input 
            type="number" 
            step="any" 
            inputMode="decimal" 
            pattern="[0-9]*[.,]?[0-9]*"
          />
        </Form.Item>
        <Form.Item 
          label={<span style={labelStyle}>旁視讀數 (m)</span>} 
          name="sideSight" 
          rules={[{ required: true, message: '請輸入旁視讀數' }]}
        >
          <Input 
            type="number" 
            step="any" 
            inputMode="decimal" 
            pattern="[0-9]*[.,]?[0-9]*"
          />
        </Form.Item>
        
        {/* 水准測量示意圖 */}
        <div className={styles.levelDiagram}>
          <h4 className={styles.diagramTitle}>水准測量示意圖</h4>
          <div className={styles.diagramContent}>
            <svg width="100%" height="240" viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
              {/* 地面線 */}
              <path d="M 20,180 L 380,180" stroke="#8c8c8c" strokeWidth="2" strokeDasharray="5,3" />
              
              {/* 後視點 - 固定在中间位置 */}
              <circle cx="80" cy="140" r="5" fill="#1890ff" />
              <text x="80" y="160" textAnchor="middle" fill="#333">後視點</text>
              
              {/* 旁視點 - 固定在中间位置 */}
              <circle cx="320" cy="140" r="5" fill="#1890ff" />
              <text x="320" y="160" textAnchor="middle" fill="#333">旁視點</text>
              
              {/* 設計點 - 固定位置 */}
              {levelResult ? (
                <>
                  <circle cx="320" cy={levelResult.designPointY} r="5" fill="#faad14" />
                  <text x="320" y={levelResult.designPointY - 10} textAnchor="middle" fill="#faad14">設計點</text>
                </>
              ) : (
                <>
                  <circle cx="320" cy="100" r="5" fill="#faad14" />
                  <text x="320" y="90" textAnchor="middle" fill="#faad14">設計點</text>
                </>
              )}
              
              {/* 儀器 */}
              <rect x="190" y="130" width="20" height="10" fill="#1890ff" />
              <line x1="200" y1="130" x2="200" y2="120" stroke="#1890ff" strokeWidth="2" />
              <circle cx="200" cy="120" r="5" fill="#1890ff" />
              <text x="200" y="160" textAnchor="middle" fill="#333">儀器</text>
              
              {/* 水平視線 */}
              <line x1="50" y1="120" x2="350" y2="120" stroke="#1890ff" strokeWidth="1.5" strokeDasharray="2,1" />
              <text x="200" y="115" textAnchor="middle" fill="#1890ff">水平視線</text>
              
              {/* 後視線 - 水平線 */}
              <line x1="200" y1="120" x2="80" y2="120" stroke="#ff4d4f" strokeWidth="2" />
              <text x="140" y="115" textAnchor="middle" fill="#ff4d4f">後視線</text>
              
              {/* 旁視線 - 水平線 */}
              <line x1="200" y1="120" x2="320" y2="120" stroke="#52c41a" strokeWidth="2" />
              <text x="260" y="115" textAnchor="middle" fill="#52c41a">旁視線</text>
              
              {/* 高差 - 固定位置 */}
              {levelResult ? (
                <>
                  <line x1="320" y1={levelResult.designPointY} x2="320" y2="140" stroke="#722ed1" strokeWidth="2" strokeDasharray="3,2" />
                  <text x="310" y={(levelResult.designPointY + 140) / 2} textAnchor="end" fill="#722ed1">高差</text>
                  
                  {/* 移動方向箭頭 - 動態方向 */}
                  {levelResult.elevationDirection === 'up' ? (
                    <path d="M 320,130 L 315,140 L 325,140 Z" fill="#722ed1" transform="rotate(180 320 135)" />
                  ) : (
                    <path d="M 320,150 L 315,140 L 325,140 Z" fill="#722ed1" />
                  )}
                  <text x="340" y="140" textAnchor="start" fill="#722ed1">移動方向</text>
                </>
              ) : (
                <>
                  <line x1="320" y1="100" x2="320" y2="140" stroke="#722ed1" strokeWidth="2" strokeDasharray="3,2" />
                  <text x="310" y="120" textAnchor="end" fill="#722ed1">高差</text>
                  
                  {/* 默認向上箭頭 */}
                  <path d="M 320,130 L 315,140 L 325,140 Z" fill="#722ed1" transform="rotate(180 320 135)" />
                  <text x="340" y="140" textAnchor="start" fill="#722ed1">移動方向</text>
                </>
              )}
            </svg>
      </div>
          <div className={styles.diagramDescription}>
            <p><strong>簡化水准測量原理：</strong></p>
            <p>1. 儀器建立水平視線，測量後視點和旁視點</p>
            <p>2. 計算得出旁視點實際高程和設計高程之間的高差</p>
            <p>3. 根據高差的正負值，確定旁視點需要移動的方向</p>
            <p>4. 高差的絕對值即為旁視點需要移動的距離</p>
          </div>
        </div>
        
        <div className={styles.levelFormatHint}>
          <p>水准測量說明：</p>
          <p>1. 後視高程：已知點的高程值（單位：米）</p>
          <p>2. 設計高程：設計的目標高程（單位：米）</p>
          <p>3. 後視讀數：在已知高程點上的讀數（單位：米）</p>
          <p>4. 旁視讀數：在待測點上的讀數（單位：米）</p>
          <p>5. 計算結果中的箭頭方向表示旁視點需要移動的方向</p>
        </div>
      </div>
      <div className={styles.buttonGroup}>
        <Button type="primary" size="large" className={styles.submitButton} onClick={calculateLevel}>計算</Button>
        <Button type="default" size="large" className={styles.clearButton} onClick={clearLevelData}>清除數據</Button>
      </div>
      
      {/* 添加旁視點的彈窗 */}
      <Modal
        title="添加旁視點"
        visible={isModalVisible}
        onOk={handleAddSideSight}
        onCancel={handleCancel}
        okText="添加"
        cancelText="取消"
      >
        <Form form={newSideSightForm} layout="vertical">
          <Form.Item 
            label="旁視讀數 (m)" 
            name="sideSight" 
            rules={[{ required: true, message: '請輸入旁視讀數' }]}
          >
            <Input 
              type="number" 
              step="any" 
              inputMode="decimal" 
              pattern="[0-9]*[.,]?[0-9]*"
              placeholder="請輸入新的旁視讀數"
            />
          </Form.Item>
          <Form.Item 
            label="設計高程 (m)" 
            name="designElevation" 
            rules={[{ required: true, message: '請輸入設計高程' }]}
          >
            <Input 
              type="number" 
              step="any" 
              inputMode="decimal" 
              pattern="[0-9]*[.,]?[0-9]*"
              placeholder="請輸入設計高程"
            />
          </Form.Item>
        </Form>
      </Modal>
      
      {levelResult && (
        <div className={styles.resultCard}>
          <h3>平水計算結果</h3>
          <div className={styles.levelResultItem}>
            <Divider orientation="left" className={styles.levelDivider}>
              主計算結果
            </Divider>
            <div className={styles.resultRow}>
              <p><span>後視高程:</span> <span>{levelResult.backSightElevation} m</span></p>
            </div>
            <div className={styles.resultRow}>
              <p><span>後視讀數:</span> <span>{levelResult.backSight} m</span></p>
            </div>
            <div className={styles.resultRow}>
              <p><span>旁視讀數:</span> <span>{levelResult.sideSight} m</span></p>
            </div>
            <div className={styles.resultRow}>
              <p><span>儀器高:</span> <span>{levelResult.instrumentHeight} m</span></p>
            </div>
            <div className={styles.resultRow}>
              <p><span>旁視點高程:</span> <span>{levelResult.sideSightElevation} m</span></p>
            </div>
            <div className={styles.resultRow}>
              <p><span>設計高程:</span> <span>{levelResult.designElevation} m</span></p>
            </div>
            <div className={styles.resultRow}>
              <p>
                <span>高差:</span> 
                <span className={levelResult.elevationDirection === 'up' ? styles.arrowUp : styles.arrowDown}>
                  {levelResult.elevationDirection === 'up' ? '↑' : '↓'} {levelResult.elevationDifference} m
                  {levelResult.elevationDirection === 'up' ? '（旁視需向上移動）' : '（旁視需向下移動）'}
                </span>
              </p>
            </div>
          </div>
          
          {/* 額外旁視點的計算結果 */}
          {additionalSideSights.length > 0 && (
            <>
              {additionalSideSights.map((item, index) => (
                <div className={styles.levelResultItem} key={index}>
                  <Divider orientation="left" className={styles.levelDivider}>
                    額外旁視點 #{index + 1}
                  </Divider>
                  <div className={styles.resultRow}>
                    <p><span>旁視讀數:</span> <span>{item.sideSight} m</span></p>
                  </div>
                  <div className={styles.resultRow}>
                    <p><span>儀器高:</span> <span>{levelResult.instrumentHeight} m</span></p>
                  </div>
                  <div className={styles.resultRow}>
                    <p><span>旁視點高程:</span> <span>{item.sideSightElevation} m</span></p>
                  </div>
                  <div className={styles.resultRow}>
                    <p><span>設計高程:</span> <span>{item.designElevation} m</span></p>
                  </div>
                  <div className={styles.resultRow}>
                    <p>
                      <span>高差:</span> 
                      <span className={item.elevationDirection === 'up' ? styles.arrowUp : styles.arrowDown}>
                        {item.elevationDirection === 'up' ? '↑' : '↓'} {item.elevationDifference} m
                        {item.elevationDirection === 'up' ? '（旁視需向上移動）' : '（旁視需向下移動）'}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </>
          )}
          
          {/* 添加旁視按鈕 - 放在計算結果下方 */}
          <div className={styles.addButtonContainer}>
            <Button 
              type="primary" 
              size="large" 
              className={styles.addButton} 
              onClick={showAddSideSightModal}
            >
              添加旁視
            </Button>
          </div>
        </div>
      )}
    </Form>
  );

  // 角度計算表單
  const renderAngleForm = () => (
    <Form 
      form={angleForm} 
      layout="horizontal"
      {...formLayout}
      className={styles.horizontalForm}
      colon={false}
    >
      <div className={styles.formGroup}>
        <h4 className={styles.formSectionTitle}>角度轉換參數</h4>
        <div className={styles.inputFormatSwitch}>
          <span>輸入格式：</span>
          <Switch
            checked={isDecimalInput}
            onChange={setIsDecimalInput}
            checkedChildren="十進制"
            unCheckedChildren="DD.MMSS"
            className={styles.formatSwitch}
          />
        </div>
        <Form.Item 
          label={<span style={labelStyle}>{isDecimalInput ? "十進制度數" : "DD.MMSS格式角度值"}</span>} 
          name="degrees" 
          rules={[{ required: true, message: '請輸入角度' }]}
        >
          <Input 
            type="number" 
            step="any" 
            inputMode="decimal" 
            pattern="[0-9]*[.,]?[0-9]*"
          />
          </Form.Item>
        <div className={styles.angleFormatHint}>
          <p>當前輸入格式：{isDecimalInput ? '十進制度數' : 'DD.MMSS格式'}</p>
          <p>{isDecimalInput 
            ? '十進制度數示例：45.5（表示45.5度）' 
            : 'DD.MMSS格式示例：45.3030（表示45度30分30秒）'}</p>
          <p>{isDecimalInput 
            ? '將轉換為DD.MMSS格式' 
            : '將轉換為十進制度數'}</p>
      </div>
      </div>
      <div className={styles.buttonGroup}>
        <Button type="primary" size="large" className={styles.submitButton} onClick={calculateAngle}>轉換</Button>
        <Button type="default" size="large" className={styles.clearButton} onClick={() => angleForm.resetFields()}>清除數據</Button>
      </div>
      
      {angleResult && (
        <div className={styles.resultCard}>
          <h3>角度轉換結果</h3>
          <div className={styles.angleResultItem}>
            <Divider orientation="left" className={styles.angleDivider}>
              角度轉換
            </Divider>
            <div className={styles.resultRow}>
              <p><span>輸入格式:</span> <span>{angleResult.inputType}</span></p>
            </div>
            <div className={styles.resultRow}>
              <p><span>輸入值:</span> <span>{angleResult.inputValue}</span></p>
            </div>
            <div className={styles.resultRow}>
              <p><span>轉換格式:</span> <span>{angleResult.outputType}</span></p>
            </div>
            <div className={styles.resultRow}>
              <p><span>轉換結果:</span> <span>{angleResult.outputValue}</span></p>
            </div>
          </div>
        </div>
      )}
    </Form>
  );

  // 面積計算表單
  const renderAreaForm = () => {
    // 添加一行坐標點
    const addPoint = () => {
      const points = areaForm.getFieldValue('points') || [];
      const newPoints = [...points, { point: `P${points.length + 1}`, e: '', n: '' }];
      areaForm.setFieldsValue({ points: newPoints });
    };

    // 刪除一行坐標點
    const removePoint = (index) => {
      const points = areaForm.getFieldValue('points') || [];
      if (points.length <= 3) {
        message.warning('至少需要3個坐標點');
        return;
      }
      const newPoints = points.filter((_, i) => i !== index);
      // 重新編號
      newPoints.forEach((point, i) => {
        point.point = `P${i + 1}`;
      });
      areaForm.setFieldsValue({ points: newPoints });
    };

    // 獲取有效的坐標點
    const getValidPoints = () => {
      const points = areaForm.getFieldValue('points') || [];
      return points.filter(point => 
        point.e && !isNaN(parseFloat(point.e)) && 
        point.n && !isNaN(parseFloat(point.n))
      );
    };

    // 計算坐標範圍，用於繪制示意圖
    const calculateBounds = (points) => {
      if (!points || points.length === 0) return { minE: 0, maxE: 100, minN: 0, maxN: 100 };
      
      const eValues = points.map(p => parseFloat(p.e));
      const nValues = points.map(p => parseFloat(p.n));
      
      const minE = Math.min(...eValues);
      const maxE = Math.max(...eValues);
      const minN = Math.min(...nValues);
      const maxN = Math.max(...nValues);
      
      // 添加一些邊距
      const eMargin = (maxE - minE) * 0.1 || 10;
      const nMargin = (maxN - minN) * 0.1 || 10;
      
      return {
        minE: minE - eMargin,
        maxE: maxE + eMargin,
        minN: minN - nMargin,
        maxN: maxN + nMargin
      };
    };

    // 將坐標轉換為SVG坐標
    const transformToSvgCoords = (point, bounds, svgWidth, svgHeight) => {
      // 注意：SVG坐標系中，y軸是向下的，而北坐標是向上的，所以需要反轉
      const x = ((parseFloat(point.e) - bounds.minE) / (bounds.maxE - bounds.minE)) * svgWidth;
      const y = svgHeight - ((parseFloat(point.n) - bounds.minN) / (bounds.maxN - bounds.minN)) * svgHeight;
      return { x, y };
    };

    // 生成多邊形路徑
    const generatePolygonPath = (points, bounds, svgWidth, svgHeight) => {
      if (!points || points.length < 3) return '';
      
      return points.map((point, index) => {
        const { x, y } = transformToSvgCoords(point, bounds, svgWidth, svgHeight);
        return `${index === 0 ? 'M' : 'L'} ${x},${y}`;
      }).join(' ') + ' Z'; // Z表示閉合路徑
    };

    // 有效的坐標點
    const validPoints = getValidPoints();
    // 計算邊界
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
          // 表單值變化時更新示意圖
          areaForm.validateFields(['points']).catch(() => {});
        }}
      >
      <div className={styles.formGroup}>
          <h4 className={styles.formSectionTitle}>面積計算參數</h4>
          
          {/* 多邊形示意圖 */}
          <div className={styles.areaDiagram}>
            <h4 className={styles.diagramTitle}>多邊形示意圖</h4>
            <div className={styles.diagramContent} style={{ height: '300px', position: 'relative', overflow: 'visible' }}>
              <svg width="100%" height="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} xmlns="http://www.w3.org/2000/svg">
                {/* 坐標軸 */}
                <line x1="0" y1={svgHeight} x2={svgWidth} y2={svgHeight} stroke="#8c8c8c" strokeWidth="1" strokeDasharray="5,3" />
                <line x1="0" y1="0" x2="0" y2={svgHeight} stroke="#8c8c8c" strokeWidth="1" strokeDasharray="5,3" />
                
                {/* 坐標軸標籤 */}
                <text x={svgWidth - 20} y={svgHeight - 5} textAnchor="end" fill="#8c8c8c" fontSize="12">E</text>
                <text x="5" y="15" textAnchor="start" fill="#8c8c8c" fontSize="12">N</text>
                
                {/* 多邊形 */}
                {validPoints.length >= 3 && (
                  <path 
                    d={generatePolygonPath(validPoints, bounds, svgWidth, svgHeight)} 
                    fill="rgba(24, 144, 255, 0.2)" 
                    stroke="#1890ff" 
                    strokeWidth="2"
                  />
                )}
                
                {/* 坐標點 */}
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
                
                {/* 坐標值 */}
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
            <p className={styles.scaleNote}>注：圖示比例僅供參考，非實際比例</p>
          </div>
          
          <div className={styles.tableContainer}>
            <table className={styles.coordinateTable}>
              <thead>
                <tr>
                  <th>點號</th>
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
                              rules={[{ required: true, message: '請輸入點號' }]}
                              noStyle
                            >
                              <Input disabled style={{ width: '100%' }} />
          </Form.Item>
                          </td>
                          <td>
                            <Form.Item
                              {...restField}
                              name={[name, 'e']}
                              rules={[{ required: true, message: '請輸入E坐標' }]}
                              noStyle
                            >
                              <Input 
                                type="number" 
                                step="any" 
                                inputMode="decimal" 
                                pattern="[0-9]*[.,]?[0-9]*"
                                style={{ width: '100%' }}
                                placeholder="E坐標"
                              />
        </Form.Item>
                          </td>
                          <td>
                            <Form.Item
                              {...restField}
                              name={[name, 'n']}
                              rules={[{ required: true, message: '請輸入N坐標' }]}
                              noStyle
                            >
                              <Input 
                                type="number" 
                                step="any" 
                                inputMode="decimal" 
                                pattern="[0-9]*[.,]?[0-9]*"
                                style={{ width: '100%' }}
                                placeholder="N坐標"
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
              添加坐標點
            </Button>
          </div>
        </div>
        <Button type="primary" size="large" className={styles.submitButton} onClick={calculateArea}>計算</Button>

        {areaResult && (
          <div className={styles.resultCard}>
            <Divider className={styles.areaDivider}>計算結果</Divider>
            <div className={styles.areaResultItem}>
              <p>
                <span>多邊形面積：</span>
                <span>{areaResult.area} m²</span>
              </p>
              <p>
                <span>周長：</span>
                <span>{areaResult.perimeter} m</span>
              </p>
              <p>
                <span>坐標點數：</span>
                <span>{areaResult.pointCount} 個</span>
              </p>
            </div>
            <div className={styles.formulaExplanation}>
              <p><strong>計算公式：</strong></p>
              <p>1. 面積 = |∑(Ei×Ni+1 - Ei+1×Ni)| / 2</p>
              <p>2. 周長 = ∑√[(Ei+1-Ei)² + (Ni+1-Ni)²]</p>
              <p>其中：E為東坐標，N為北坐標</p>
            </div>
          </div>
        )}
    </Form>
  );
  };

  // 角度轉換計算
  const calculateAngle = () => {
    angleForm.validateFields().then(values => {
      const { degrees } = values;
      const inputValue = parseFloat(degrees);
      
      if (isNaN(inputValue)) {
        message.error('請輸入有效的角度值');
        return;
      }
      
      let result;
      if (isDecimalInput) {
        // 如果是十進制度數，轉換為DD.MMSS格式
        result = {
          inputType: '十進制度數',
          inputValue: inputValue.toFixed(6),
          outputType: 'DD.MMSS格式',
          outputValue: decimalToDDMMSS(inputValue)
        };
      } else {
        // 如果是DD.MMSS格式，轉換為十進制度數
        // 驗證輸入是否符合DD.MMSS格式
        if (!isValidDDMMSS(inputValue)) {
          message.error('輸入的DD.MMSS格式不正確，分和秒不能超過60');
          return;
        }
        
        result = {
          inputType: 'DD.MMSS格式',
          inputValue: formatDDMMSS(inputValue),
          outputType: '十進制度數',
          outputValue: DDMMSSToDecimal(inputValue).toFixed(6)
        };
      }
      
      setAngleResult(result);
      message.success('角度轉換完成');
    }).catch(err => {
      message.error('請填寫所有必填字段');
    });
  };
  
  // 驗證是否為有效的DD.MMSS格式
  const isValidDDMMSS = (value) => {
    // 獲取小數部分
    const decimalPart = value - Math.floor(value);
    
    // 獲取分部分
    const minutes = Math.floor(decimalPart * 100);
    
    // 獲取秒部分
    const seconds = Math.round((decimalPart * 100 - minutes) * 100);
    
    // 如果分或秒大於等于60，則不是有效的DD.MMSS格式
    return minutes < 60 && seconds < 60;
  };
  
  // 十進制度數轉換為DD.MMSS格式
  const decimalToDDMMSS = (decimal) => {
    // 獲取整數部分（度）
    const degrees = Math.floor(decimal);
    
    // 計算剩余的小數部分（轉換為分）
    const minutesDecimal = (decimal - degrees) * 60;
    
    // 獲取分的整數部分
    const minutes = Math.floor(minutesDecimal);
    
    // 計算秒
    const seconds = Math.round((minutesDecimal - minutes) * 60);
    
    // 處理進位情況
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
    
    // 格式化為DD.MMSS
    return `${adjustedDegrees}.${adjustedMinutes.toString().padStart(2, '0')}${adjustedSeconds.toString().padStart(2, '0')}`;
  };
  
  // DD.MMSS格式轉換為十進制度數
  const DDMMSSToDecimal = (ddmmss) => {
    // 獲取整數部分（度）
    const degrees = Math.floor(ddmmss);
    
    // 獲取小數部分
    const fractional = ddmmss - degrees;
    
    // 將小數部分乘以100，得到分和秒
    const minutesAndSeconds = fractional * 100;
    
    // 獲取分
    const minutes = Math.floor(minutesAndSeconds);
    
    // 獲取秒
    const seconds = Math.round((minutesAndSeconds - minutes) * 100);
    
    // 轉換為十進制度數
    return degrees + minutes / 60 + seconds / 3600;
  };
  
  // 格式化DD.MMSS顯示
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

  // 計算面積
  const calculateArea = () => {
    areaForm.validateFields().then(values => {
      const points = values.points;
      if (points.length < 3) {
        message.error('至少需要3個坐標點才能計算面積');
        return;
      }

      // 使用坐標法計算面積
      let area = 0;
      for (let i = 0; i < points.length; i++) {
        const currentPoint = points[i];
        const nextPoint = points[(i + 1) % points.length];
        area += parseFloat(currentPoint.e) * parseFloat(nextPoint.n) - parseFloat(nextPoint.e) * parseFloat(currentPoint.n);
      }
      area = Math.abs(area) / 2;

      // 計算周長
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

      // 設置結果
      setAreaResult({
        area: area.toFixed(4),
        perimeter: perimeter.toFixed(4),
        pointCount: points.length
      });

      message.success('計算完成');
    }).catch(err => {
      console.log('計算錯誤:', err);
      message.error('請填寫所有必填字段');
    });
  };

  // 处理输入提交
  const handleInputSubmit = () => {
    inputForm.validateFields().then(values => {
      if (inputFormType === 'bs') {
        // 处理后视读数输入
        if (!isStarted) {
          // 第一次输入后视读数（第一点）
          simpleLevelForm.setFieldsValue({
            backSight: values.backSight
          });
          setIsStarted(true);
          setLastPointType('bs');
        } else {
          // 添加后视读数到当前点
          const updatedPoints = [...levelPoints];
          const lastIndex = updatedPoints.length - 1;
          
          if (lastIndex >= 0) {
            // 更新当前点的后视读数
            updatedPoints[lastIndex].backSight = values.backSight;
            setLevelPoints(updatedPoints);
          }
          setLastPointType('bs');
        }
      } else {
        // 处理前视读数输入
        if (levelPoints.length === 0 || (levelPoints[levelPoints.length - 1].backSight && levelPoints[levelPoints.length - 1].foreSight)) {
          // 如果是第一个点或上一个点已有BS和FS，则创建新点
          const newId = values.pointId || generateNextId(
            levelPoints.length > 0 
              ? levelPoints[levelPoints.length - 1].id 
              : simpleLevelForm.getFieldValue('benchMark')
          );
          
          // 创建新点，只有FS值
          const newPoint = {
            id: newId,
            backSight: null,
            foreSight: values.foreSight
          };
          
          setLevelPoints(prev => [...prev, newPoint]);
        } else {
          // 更新当前点的前视读数
          const updatedPoints = [...levelPoints];
          const lastIndex = updatedPoints.length - 1;
          
          if (lastIndex >= 0) {
            updatedPoints[lastIndex].foreSight = values.foreSight;
            setLevelPoints(updatedPoints);
          }
        }
        setLastPointType('fs');
      }
      
      // 关闭弹窗并重置表单
      setIsInputModalVisible(false);
      inputForm.resetFields();
    }).catch(error => {
      console.error('表单验证失败:', error);
      message.error('请填写所有必填字段');
    });
  };

  // 生成下一个ID
  const generateNextId = (lastId) => {
    if (!lastId) return 'P1';
    
    // 尝试从ID中提取数字部分
    const match = lastId.match(/([A-Za-z]+)(\d+)/);
    if (match) {
      const prefix = match[1];
      const number = parseInt(match[2]) + 1;
      return `${prefix}${number}`;
    }
    
    // 如果无法提取，则添加序号
    return `${lastId}1`;
  };

  // 显示输入弹窗
  const showInputModal = () => {
    // 检查起始点数据是否已填写
    const values = simpleLevelForm.getFieldsValue();
    if (!values.benchMark || !values.reducedLevel) {
      message.error('请先填写起始点数据');
      return;
    }

    let nextInputType = 'bs'; // 默认为后视

    // 根据上一个点的状态决定下一步输入什么
    if (!isStarted) {
      // 第一次点击"开始"，输入第一个点的BS
      nextInputType = 'bs';
    } else {
      // 已经开始，根据上一个点的状态决定
      const lastPoint = levelPoints.length > 0 ? levelPoints[levelPoints.length - 1] : null;
      
      if (!lastPoint) {
        // 只有第一个点（Bench Mark），下一步输入FS
        nextInputType = 'fs';
      } else if (lastPoint.foreSight && lastPoint.backSight) {
        // 上一个点已经有BS和FS，创建新点，输入FS
        nextInputType = 'fs';
      } else if (lastPoint.foreSight) {
        // 上一个点只有FS，下一步输入BS
        nextInputType = 'bs';
      } else if (lastPoint.backSight) {
        // 上一个点只有BS，下一步输入FS
        nextInputType = 'fs';
      } else {
        // 默认输入BS
        nextInputType = 'bs';
      }
    }

    // 设置输入类型
    setInputFormType(nextInputType);
    
    // 重置表单
    inputForm.resetFields();
    
    // 如果是前视，提供默认ID
    if (nextInputType === 'fs') {
      // 获取上一个点的ID或Bench Mark
      const lastId = levelPoints.length > 0 
        ? levelPoints[levelPoints.length - 1].id 
        : values.benchMark;
      
      // 生成下一个ID
      const nextId = generateNextId(lastId);
      
      // 设置默认ID
      setTimeout(() => {
        inputForm.setFieldsValue({ pointId: nextId });
      }, 100);
    }
    
    // 在移动设备上优化弹窗体验
    if (isMobile) {
      // 设置弹窗样式，使其在移动设备上更友好
      const modalElement = document.querySelector('.ant-modal');
      if (modalElement) {
        modalElement.style.top = '20%';
        modalElement.style.maxWidth = '95%';
        modalElement.style.margin = '0 auto';
      }
    }
    
    setIsInputModalVisible(true);
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
            onClick={() => showDrawer()}
            className={styles.menuButton}
          />
          <div className={styles.headerTitle}>實用工具</div>
          <div style={{ width: 32 }}></div>
        </div>
      )}
      
      <Drawer
        title="菜單"
        placement="left"
        onClose={() => onCloseDrawer()}
        open={drawerVisible}
        width={280}
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
              <Radio.Button value="simpleLevel">简易平水</Radio.Button>
              <Radio.Button value="arc">中拱計算</Radio.Button>
              <Radio.Button value="hypotenuse">斜邊計算</Radio.Button>
              <Radio.Button value="level">平水快速計算</Radio.Button>
              <Radio.Button value="angle">角度換算</Radio.Button>
              <Radio.Button value="area">面積計算</Radio.Button>
            </Radio.Group>
        </div>
          
          {calculationType === 'simpleLevel' && renderSimpleLevelForm()}
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
                <h4 className={styles.formSectionTitle}>中拱計算參數</h4>
                <Form.Item 
                  label={<span style={labelStyle}>半徑 (m)</span>} 
                    name="radius" 
                    rules={[{ required: true, message: '請輸入半徑' }]}
                  >
                    <Input 
                      type="number" 
                      step="any" 
                      inputMode="decimal" 
                      pattern="[0-9]*[.,]?[0-9]*"
                    />
                  </Form.Item>
                <Form.Item 
                  label={<span style={labelStyle}>弦長 (m)</span>} 
                    name="chordLength" 
                    rules={[{ required: true, message: '請輸入弦長' }]}
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
                <h4 className={styles.diagramTitle}>中拱示意圖</h4>
                <div className={styles.diagramContent} style={{ height: '200px', position: 'relative', overflow: 'visible' }}>
                  <svg width="100%" height="100%" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
                    {/* 地面線 */}
                    <line x1="50" y1="150" x2="350" y2="150" stroke="#8c8c8c" strokeWidth="2" />
                    
                    {/* 弦線 */}
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
                    
                    {/* 弧線 - 動態調整控制點高度 */}
                    <path 
                      d={`M 100,150 Q 200,${arcResult ? Math.max(30, 150 - parseFloat(arcResult.midOffset) * 80) : 50} 300,150`}
                      fill="none" 
                      stroke="#52c41a" 
                      strokeWidth="2"
                    />
                    
                    {/* 四分點標記 */}
                    {quarterResult && quarterResult.map((result, index) => {
                      const quarterChordLength = parseFloat(result.chordLength);
                      const distanceFromStart = parseFloat(result.distanceFromStart);
                      const quarterMidOffset = parseFloat(result.midOffset);
                      
                      // 計算四分點的位置
                      const leftX = 200 - distanceFromStart - quarterChordLength / 2;
                      const rightX = 200 - distanceFromStart + quarterChordLength / 2;
                      const midY = 150 - quarterMidOffset * 40;
                      
                      return (
                        <g key={index}>
                          {/* 四分點左側點 */}
                          <circle 
                            cx={leftX} 
                            cy="150" 
                            r="3" 
                            fill="#ff8c00" 
                            stroke="#fff" 
                            strokeWidth="1"
                          />
                          
                          {/* 四分點右側點 */}
                          <circle 
                            cx={rightX} 
                            cy="150" 
                            r="3" 
                            fill="#ff8c00" 
                            stroke="#fff" 
                            strokeWidth="1"
                          />
                          
                          {/* 四分點弦線 */}
                          <line 
                            x1={leftX} 
                            y1="150" 
                            x2={rightX} 
                            y2="150" 
                            stroke="#ff8c00" 
                            strokeWidth="1.5" 
                            strokeDasharray="3,2"
                          />
                          
                          {/* 四分點中矢距線 */}
                          <line 
                            x1={(leftX + rightX) / 2} 
                            y1="150" 
                            x2={(leftX + rightX) / 2} 
                            y2={midY} 
                            stroke="#ff8c00" 
                            strokeWidth="1.5" 
                            strokeDasharray="3,2"
                          />
                          
                          {/* 四分點標籤 */}
                          <text 
                            x={(leftX + rightX) / 2} 
                            y="165" 
                            textAnchor="middle" 
                            fill="#ff8c00" 
                            fontSize="10"
                          >
                            四分點#{result.count || (index + 1)}
                          </text>
                        </g>
                      );
                    })}
                    
                    {/* 文字標籤 */}
                    <text x="200" y="170" textAnchor="middle" fill="#333" fontSize="14">弦長</text>
                    <text 
                      x="180" 
                      y={arcResult ? Math.max(40, 150 - parseFloat(arcResult.midOffset) * 40 - 10) : 125} 
                      textAnchor="end" 
                      fill="#ff4d4f" 
                      fontSize="14"
                    >
                      中拱
                    </text>
                    <text 
                      x="200" 
                      y={arcResult ? Math.max(20, 150 - parseFloat(arcResult.midOffset) * 80 - 20) : 70} 
                      textAnchor="middle" 
                      fill="#52c41a" 
                      fontSize="14"
                    >
                      弧長
                    </text>
                    
                    {/* 數值標籤 */}
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
                  <p><strong>中拱計算公式：</strong></p>
                  <p>1. 中矢距 = 半徑 - √(半徑² - (弦長/2)²)</p>
                  <p>2. 弧長 = 2 × 半徑 × arcsin(弦長/(2×半徑))</p>
                  <p className={styles.scaleNote}>注：圖示比例僅供參考，非實際比例</p>
                </div>
              </div>
              
              <div className={styles.buttonGroup}>
                <Button type="primary" size="large" className={styles.submitButton} onClick={calculateArc}>計算</Button>
                <Button type="default" size="large" className={styles.clearButton} onClick={() => arcForm.resetFields()}>清除數據</Button>
              </div>
              
              {arcResult && (
                <div className={styles.resultCard}>
                  <h3>中拱計算結果</h3>
                  <div className={styles.arcResultItem}>
                    <Divider orientation="left" className={styles.arcDivider}>
                      弧段計算
                    </Divider>
                    <div className={styles.resultRow}>
                      <p><span>半徑:</span> <span>{arcResult.radius} m</span></p>
                    </div>
                    <div className={styles.resultRow}>
                      <p><span>弦長:</span> <span>{arcResult.chordLength} m</span></p>
                    </div>
                    <div className={styles.resultRow}>
                      <p><span>中矢距:</span> <span>{arcResult.midOffset} m</span></p>
                    </div>
                    <div className={styles.resultRow}>
                      <p><span>弧長:</span> <span>{arcResult.arcLength} m</span></p>
                    </div>
                  </div>
                </div>
              )}
              
              {quarterResult && quarterCount > 0 && (
                <div className={styles.resultCard}>
                  <h3>四分點計算結果</h3>
                  {quarterResult.map((result, index) => (
                    <div className={styles.quarterResultItem} key={index}>
                      <Divider orientation="left" className={styles.quarterDivider}>
                        四分點 #{result.count || (index + 1)}
                      </Divider>
                      <div className={styles.resultRow}>
                        <p><span>距起點:</span> <span>{result.distanceFromStart} m</span></p>
                      </div>
                      <div className={styles.resultRow}>
                        <p><span>弦長:</span> <span>{result.chordLength} m</span></p>
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
                      繼續計算四分點
                    </Button>
                    <Button 
                      type="default" 
                      className={styles.resetButton} 
                      onClick={resetQuarterMethod}
                    >
                      重置四分點
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
                    計算四分點
                  </Button>
                </div>
              )}
            </Form>
          )}
          {calculationType === 'hypotenuse' && (
            <Form form={hypotenuseForm} layout="horizontal" initialValues={{ adjacent: "", opposite: "" }}>
              <div className={styles.formGroup}>
                <h4 className={styles.formSectionTitle}>直角三角形參數</h4>
                <Form.Item 
                  label={<span style={labelStyle}>鄰邊長度 (m)</span>} 
                    name="adjacent" 
                    rules={[{ required: true, message: '請輸入鄰邊長度' }]}
                  >
                    <Input 
                      type="number" 
                      step="any" 
                      inputMode="decimal" 
                      pattern="[0-9]*[.,]?[0-9]*"
                    />
                  </Form.Item>
                <Form.Item 
                  label={<span style={labelStyle}>對邊長度 (m)</span>} 
                    name="opposite" 
                    rules={[{ required: true, message: '請輸入對邊長度' }]}
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
                  <h4 className={styles.diagramTitle}>直角三角形示意圖</h4>
                  <div className={styles.triangleContent}>
                    <svg width="100%" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
                      {/* 三角形 */}
                      <polygon points="50,150 250,150 250,50" fill="none" stroke="#1890ff" strokeWidth="2" />
                      
                      {/* 直角標記 */}
                      <path d="M 240,150 L 240,140 L 250,140" fill="none" stroke="#1890ff" strokeWidth="1.5" />
                      
                      {/* 鄰邊 */}
                      <line x1="50" y1="160" x2="250" y2="160" stroke="#ff4d4f" strokeWidth="1.5" strokeDasharray="5,3" />
                      <text x="150" y="175" textAnchor="middle" fill="#ff4d4f">鄰邊</text>
                      
                      {/* 對邊 */}
                      <line x1="260" y1="150" x2="260" y2="50" stroke="#52c41a" strokeWidth="1.5" strokeDasharray="5,3" />
                      <text x="275" y="100" textAnchor="middle" fill="#52c41a">對邊</text>
                      
                      {/* 斜邊 */}
                      <line x1="40" y1="150" x2="40" y2="50" stroke="#faad14" strokeWidth="1.5" strokeDasharray="5,3" />
                      <line x1="40" y1="50" x2="50" y2="50" stroke="#faad14" strokeWidth="1.5" strokeDasharray="5,3" />
                      <text x="30" y="100" textAnchor="middle" fill="#faad14">斜邊</text>
                      
                      {/* 角度 */}
                      <path d="M 70,150 A 20,20 0 0 1 50,130" fill="none" stroke="#722ed1" strokeWidth="1.5" />
                      <text x="70" y="130" textAnchor="middle" fill="#722ed1">α</text>
                      
                      <path d="M 250,130 A 20,20 0 0 1 230,150" fill="none" stroke="#722ed1" strokeWidth="1.5" />
                      <text x="230" y="130" textAnchor="middle" fill="#722ed1">β</text>
                      
                      <text x="245" y="145" textAnchor="middle" fill="#722ed1">90°</text>
                    </svg>
                  </div>
                  <div className={styles.diagramDescription}>
                    <p><strong>直角三角形計算原理：</strong></p>
                    <p>1. 勾股定理：斜邊² = 鄰邊² + 對邊²</p>
                    <p>2. 角度α = arctan(對邊/鄰邊)</p>
                    <p>3. 角度β = 90° - α</p>
                  </div>
                </div>
                
                <Button type="primary" size="large" className={styles.submitButton} onClick={calculateHypotenuse}>計算</Button>
                
                {hypotenuseResult && (
                  <div className={styles.resultCard}>
                    <h3>斜邊計算結果</h3>
                    <div className={styles.hypotenuseResultItem}>
                      <Divider orientation="left" className={styles.hypotenuseDivider}>
                        三角形計算
                      </Divider>
                      <div className={styles.resultRow}>
                        <p><span>鄰邊長度:</span> <span>{hypotenuseResult.adjacent} m</span></p>
                      </div>
                      <div className={styles.resultRow}>
                        <p><span>對邊長度:</span> <span>{hypotenuseResult.opposite} m</span></p>
                      </div>
                      <div className={styles.resultRow}>
                        <p><span>斜邊長度:</span> <span>{hypotenuseResult.hypotenuse} m</span></p>
                      </div>
                      <div className={styles.resultRow}>
                        <p><span>角度α (鄰邊與斜邊夾角):</span> <span>{hypotenuseResult.angle}°</span></p>
                      </div>
                      <div className={styles.resultRow}>
                        <p><span>角度β (對邊與斜邊夾角):</span> <span>{hypotenuseResult.complementaryAngle}°</span></p>
                      </div>
                      <div className={styles.resultRow}>
                        <p><span>直角 (對邊與鄰邊夾角):</span> <span>{hypotenuseResult.rightAngle}°</span></p>
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