import React, { useState, useRef, useEffect } from 'react';
import { Layout, Card, Row, Col, Form, Input, Button, Select, Table, Space, Divider, message, Radio, Menu, Drawer } from 'antd';
import { useNavigate } from 'react-router-dom';
import { HomeOutlined, CompassOutlined, CalculatorOutlined, AimOutlined, RadiusSettingOutlined, ToolOutlined, MonitorOutlined, MenuOutlined, CopyOutlined } from '@ant-design/icons';
import { calculate2BRE1D, calculate2BRE2D, calculate3BRE3D } from '../utils/freeStationCalculation';
import NumericInput from './NumericInput';
import styles from './FreeStationLayout.module.css';

const { Content } = Layout;
const { Option } = Select;

const FreeStationLayout = () => {
  const navigate = useNavigate();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [calculationType, setCalculationType] = useState('2BRE1D');
  const [results, setResults] = useState(null);
  const [copyTrigger, setCopyTrigger] = useState(0);
  const scrollPositionRef = useRef(0);
  const textAreaRef = useRef(null);

  useEffect(() => {
    if (copyTrigger > 0) {
      window.scrollTo(0, scrollPositionRef.current);
    }
  }, [copyTrigger]);

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
      label: '自由设站解算'
    },
    {
      key: 'traverse-calculation',
      icon: <AimOutlined />,
      label: '导线计算'
    },
    {
      key: 'construction-layout',
      icon: <RadiusSettingOutlined />,
      label: '施工放样'
    },
    {
      key: 'circle-calculation',
      icon: <RadiusSettingOutlined />,
      label: '圆计算'
    },
    {
      key: 'tools',
      icon: <ToolOutlined />,
      label: '实用工具'
    },
    {
      key: 'settlement-monitoring',
      icon: <MonitorOutlined />,
      label: '沉降监测系统'
    }
  ];

  const handleMenuClick = ({ key }) => {
    navigate(`/${key}`);
    setDrawerVisible(false);
  };

  const calculationTypes = [
    { key: '2bre1d', label: '2BRE + 1 Distance' },
    { key: '2bre2d', label: '2BRE + 2 Distance' },
    { key: '3bre3d', label: '3BRE + 3 Distance' }
  ];

  const [form] = Form.useForm();

  const validateDDMMSS = (_, value) => {
    if (!value) {
      return Promise.reject('请输入角度值');
    }
    const pattern = /^\d{1,3}\.\d{4}$/;
    if (!pattern.test(value)) {
      return Promise.reject('角度格式应为DD.MMSS');
    }
    const parts = value.split('.');
    const minutes = parseInt(parts[1].substring(0, 2));
    const seconds = parseInt(parts[1].substring(2, 4));
    if (minutes >= 60 || seconds >= 60) {
      return Promise.reject('分或秒不能大于等于60');
    }
    return Promise.resolve();
  };

  const onFinish = (values) => {
    try {
      const results = calculationType === '2BRE1D' 
        ? calculate2BRE1D(values)
        : calculationType === '2BRE2D'
        ? calculate2BRE2D(values)
        : calculate3BRE3D(values);
      setResults(results);
    } catch (error) {
      message.error(error.message);
    }
  };

  const renderCalculationTypeSelector = () => {
    return (
      <Radio.Group value={calculationType} onChange={(e) => setCalculationType(e.target.value)}>
        <Radio.Button value="2BRE1D">2BRE + 1Distance</Radio.Button>
        <Radio.Button value="2BRE2D">2BRE + 2Distance</Radio.Button>
        <Radio.Button value="3BRE3D">3BRE + 3Distance</Radio.Button>
      </Radio.Group>
    );
  };

  const render2BRE1DInputs = () => {
    return (
      <>
        <Divider>仪器参数</Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="仪器高" name="instrumentHeight" rules={[{ required: true }]}>
              <NumericInput 
                placeholder="输入仪器高"
                inputMode="decimal"
              />
            </Form.Item>
          </Col>
        </Row>
        <Divider>已知点1</Divider>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Form.Item
              label="E"
              name={['knownPoint1', 'e']}
              rules={[{ required: true, message: '请输入E值' }]}
            >
              <NumericInput placeholder="请输入E值" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="N"
              name={['knownPoint1', 'n']}
              rules={[{ required: true, message: '请输入N值' }]}
            >
              <NumericInput placeholder="请输入N值" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="H"
              name={['knownPoint1', 'h']}
              rules={[{ required: true, message: '请输入H值' }]}
            >
              <NumericInput placeholder="请输入H值" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="BRG"
              name={['observation1', 'brg']}
              rules={[{ required: true, message: '请输入BRG值' }]}
            >
              <NumericInput placeholder="DD.MMSS" pattern="\d{1,3}\.\d{4}" />
            </Form.Item>
          </Col>
        </Row>
        <Divider>已知点2</Divider>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Form.Item
              label="E"
              name={['knownPoint2', 'e']}
              rules={[{ required: true, message: '请输入E值' }]}
            >
              <NumericInput placeholder="请输入E值" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="N"
              name={['knownPoint2', 'n']}
              rules={[{ required: true, message: '请输入N值' }]}
            >
              <NumericInput placeholder="请输入N值" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="H"
              name={['knownPoint2', 'h']}
              rules={[{ required: true, message: '请输入H值' }]}
            >
              <NumericInput placeholder="请输入H值" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="BRG"
              name={['observation2', 'brg']}
              rules={[{ required: true, message: '请输入BRG值' }]}
            >
              <NumericInput placeholder="DD.MMSS" pattern="\d{1,3}\.\d{4}" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="VA"
              name={['observation2', 'va']}
              rules={[{ required: true, message: '请输入VA值' }]}
            >
              <NumericInput placeholder="DD.MMSS" pattern="\d{1,3}\.\d{4}" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="SD"
              name={['observation2', 'sd']}
              rules={[{ required: true, message: '请输入SD值' }]}
            >
              <NumericInput placeholder="请输入SD值" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="PH"
              name={['observation2', 'ph']}
              rules={[{ required: true, message: '请输入PH值' }]}
            >
              <NumericInput placeholder="请输入PH值" />
            </Form.Item>
          </Col>
        </Row>
      </>
    );
  };

  const render2BRE2DInputs = () => {
    return (
      <>
        <Divider>仪器参数</Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="仪器高" name="instrumentHeight" rules={[{ required: true }]}>
              <NumericInput 
                placeholder="输入仪器高"
                inputMode="decimal"
              />
            </Form.Item>
          </Col>
        </Row>
        <Divider>已知点1</Divider>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Form.Item
              label="E"
              name={['knownPoint1', 'e']}
              rules={[{ required: true, message: '请输入E值' }]}
            >
              <NumericInput placeholder="请输入E值" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="N"
              name={['knownPoint1', 'n']}
              rules={[{ required: true, message: '请输入N值' }]}
            >
              <NumericInput placeholder="请输入N值" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="H"
              name={['knownPoint1', 'h']}
              rules={[{ required: true, message: '请输入H值' }]}
            >
              <NumericInput placeholder="请输入H值" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="BRG"
              name={['observation1', 'brg']}
              rules={[{ required: true, message: '请输入BRG值' }]}
            >
              <NumericInput placeholder="DD.MMSS" pattern="\d{1,3}\.\d{4}" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="VA"
              name={['observation1', 'va']}
              rules={[{ required: true, message: '请输入VA值' }]}
            >
              <NumericInput placeholder="DD.MMSS" pattern="\d{1,3}\.\d{4}" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="SD"
              name={['observation1', 'sd']}
              rules={[{ required: true, message: '请输入SD值' }]}
            >
              <NumericInput placeholder="请输入SD值" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="PH"
              name={['observation1', 'ph']}
              rules={[{ required: true, message: '请输入PH值' }]}
            >
              <NumericInput placeholder="请输入PH值" />
            </Form.Item>
          </Col>
        </Row>
        <Divider>已知点2</Divider>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Form.Item
              label="E"
              name={['knownPoint2', 'e']}
              rules={[{ required: true, message: '请输入E值' }]}
            >
              <NumericInput placeholder="请输入E值" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="N"
              name={['knownPoint2', 'n']}
              rules={[{ required: true, message: '请输入N值' }]}
            >
              <NumericInput placeholder="请输入N值" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="H"
              name={['knownPoint2', 'h']}
              rules={[{ required: true, message: '请输入H值' }]}
            >
              <NumericInput placeholder="请输入H值" />
            </Form.Item>
          </Col>
        </Row>
        <Divider>观测值2</Divider>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Form.Item
              label="BRG"
              name={['observation2', 'brg']}
              rules={[{ required: true, message: '请输入BRG值' }]}
            >
              <NumericInput placeholder="DD.MMSS" pattern="\d{1,3}\.\d{4}" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="VA"
              name={['observation2', 'va']}
              rules={[{ required: true, message: '请输入VA值' }]}
            >
              <NumericInput placeholder="DD.MMSS" pattern="\d{1,3}\.\d{4}" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="SD"
              name={['observation2', 'sd']}
              rules={[{ required: true, message: '请输入SD值' }]}
            >
              <NumericInput placeholder="请输入SD值" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="PH"
              name={['observation2', 'ph']}
              rules={[{ required: true, message: '请输入PH值' }]}
            >
              <NumericInput placeholder="请输入PH值" />
            </Form.Item>
          </Col>
        </Row>
      </>
    );
  };

  const renderInputForm = () => {
    const renderCoordinateInputs = (pointNum) => (
      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Form.Item label={`已知点${pointNum} E`} name={`point${pointNum}_E`} rules={[{ required: true }]}>
            <NumericInput 
              placeholder="输入E坐标" 
              inputMode="decimal"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item label={`已知点${pointNum} N`} name={`point${pointNum}_N`} rules={[{ required: true }]}>
            <NumericInput 
              placeholder="输入N坐标"
              inputMode="decimal"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item label={`已知点${pointNum} H`} name={`point${pointNum}_H`} rules={[{ required: true }]}>
            <NumericInput 
              placeholder="输入H坐标"
              inputMode="decimal"
            />
          </Form.Item>
        </Col>
      </Row>
    );

    const renderObservationInputs = (pointNum, isObs = true) => (
      <Row gutter={16}>
        <Col xs={24} sm={6}>
          <Form.Item 
            label={`${isObs ? '观测' : '已知'}点${pointNum} BRG`} 
            name={`${isObs ? 'obs' : 'point'}${pointNum}_BRG`}
            rules={[
              { required: true },
              { validator: validateDDMMSS }
            ]}
          >
            <NumericInput 
              placeholder="输入方位角 (DD.MMSS)"
              pattern="\d{1,3}\.\d{4}"
              inputMode="decimal"
              type="text"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={6}>
          <Form.Item 
            label={`${isObs ? '观测' : '已知'}点${pointNum} VA`} 
            name={`${isObs ? 'obs' : 'point'}${pointNum}_VA`}
            rules={[
              { required: true },
              { validator: validateDDMMSS }
            ]}
          >
            <NumericInput 
              placeholder="输入天顶角 (DD.MMSS)"
              pattern="\d{1,3}\.\d{4}"
              inputMode="decimal"
              type="text"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={6}>
          <Form.Item label={`${isObs ? '观测' : '已知'}点${pointNum} SD`} name={`${isObs ? 'obs' : 'point'}${pointNum}_SD`} rules={[{ required: true }]}>
            <NumericInput 
              placeholder="输入斜距"
              inputMode="decimal"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={6}>
          <Form.Item label={`${isObs ? '观测' : '已知'}点${pointNum} PH`} name={`${isObs ? 'obs' : 'point'}${pointNum}_PH`} rules={[{ required: true }]}>
            <NumericInput 
              placeholder="输入棱镜高"
              inputMode="decimal"
            />
          </Form.Item>
        </Col>
      </Row>
    );

    if (calculationType === '3BRE3D') {
      return (
        <Form form={form} layout="vertical">
          <Divider>仪器参数</Divider>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item label="仪器高" name="instrumentHeight" rules={[{ required: true }]}>
                <NumericInput 
                  placeholder="输入仪器高"
                  inputMode="decimal"
                />
              </Form.Item>
            </Col>
          </Row>
          {[1, 2, 3].map(pointNum => (
            <React.Fragment key={pointNum}>
              <Divider>已知点{pointNum}</Divider>
              {renderCoordinateInputs(pointNum)}
              {renderObservationInputs(pointNum)}
            </React.Fragment>
          ))}
        </Form>
      );
    } else if (calculationType === '2BRE1D') {
      return (
        <Form form={form} layout="vertical">
          {render2BRE1DInputs()}
        </Form>
      );
    } else {
      return (
        <Form form={form} layout="vertical">
          <Divider>仪器参数</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="仪器高" name="instrumentHeight" rules={[{ required: true }]}>
                <NumericInput 
                  placeholder="输入仪器高"
                  inputMode="decimal"
                />
              </Form.Item>
            </Col>
          </Row>
          <Divider>已知点1</Divider>
          {render2BRE2DInputs()}
        </Form>
      );
    }
  };

  const handleCalculate = async () => {
    try {
      const values = await form.validateFields();
      let result;

      console.log('原始表单数据:', values);

      switch (calculationType) {
        case '2BRE1D':
          // 转换2BRE1D的数据格式
          const data2BRE1D = {
            point1_E: values.knownPoint1?.e,
            point1_N: values.knownPoint1?.n,
            point1_H: values.knownPoint1?.h,
            point1_BRE: values.observation1?.brg,
            
            point2_E: values.knownPoint2?.e,
            point2_N: values.knownPoint2?.n,
            point2_H: values.knownPoint2?.h,
            point2_BRE: values.observation2?.brg,
            point2_VA: values.observation2?.va,
            point2_SD: values.observation2?.sd,
            point2_PH: values.observation2?.ph,
            
            instrumentHeight: values.instrumentHeight
          };
          console.log('转换后的2BRE1D数据:', data2BRE1D);
          result = calculate2BRE1D(data2BRE1D);
          break;

        case '2BRE2D':
          // 转换2BRE2D的数据格式
          const data2BRE2D = {
            point1_E: values.knownPoint1?.e,
            point1_N: values.knownPoint1?.n,
            point1_H: values.knownPoint1?.h,
            obs1_BRG: values.observation1?.brg,
            obs1_VA: values.observation1?.va,
            obs1_SD: values.observation1?.sd,
            obs1_PH: values.observation1?.ph,
            
            point2_E: values.knownPoint2?.e,
            point2_N: values.knownPoint2?.n,
            point2_H: values.knownPoint2?.h,
            obs2_BRG: values.observation2?.brg,
            obs2_VA: values.observation2?.va,
            obs2_SD: values.observation2?.sd,
            obs2_PH: values.observation2?.ph,
            
            instrumentHeight: values.instrumentHeight
          };
          console.log('转换后的2BRE2D数据:', data2BRE2D);
          result = calculate2BRE2D(data2BRE2D);
          break;

        case '3BRE3D':
          result = calculate3BRE3D(values);
          break;
      }
      
      setResults(result);
    } catch (error) {
      console.error('计算错误:', error);
      if (error.errorFields) {
        message.error('请检查输入数据格式是否正确（角度应为DD.MMSS格式）');
      } else {
        message.error(error.message);
      }
    }
  };

  const copyToClipboard = async (text, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      await navigator.clipboard.writeText(text);
      message.success('已复制到剪贴板');
    } catch (err) {
      message.error('复制失败，请手动复制');
    }
  };

  const ResultItem = ({ label, value, unit = '', showCopyButton = false }) => (
    <div className={styles.resultItem}>
      <span className={styles.resultLabel}>{label}:</span>
      <span className={styles.resultValue}>
        {value} {unit}
        {showCopyButton && (
          <Button
            type="text"
            icon={<CopyOutlined />}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              copyToClipboard(value, e);
            }}
            className={styles.copyButton}
          />
        )}
      </span>
    </div>
  );

  const ResultCard = ({ title, data }) => {
    const formatData = () => {
      return title + '\n' + Object.entries(data)
        .map(([key, value]) => `${value.label}:${value.value} ${value.unit}`)
        .join('\n');
    };

    return (
      <Card 
        title={
          <div className={styles.cardTitle}>
            <span>{title}</span>
            <Button
              type="text"
              icon={<CopyOutlined />}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                copyToClipboard(formatData(), e);
              }}
              className={styles.cardCopyButton}
            />
          </div>
        }
        bordered={false}
      >
        {Object.entries(data).map(([key, value]) => (
          <ResultItem 
            key={key}
            label={value.label}
            value={value.value}
            unit={value.unit}
          />
        ))}
      </Card>
    );
  };

  const renderPrecisionResults = () => {
    if (!results || !results.precision) return null;

    if (calculationType === '3BRE3D') {
      return (
        <>
          <Col span={24}>
            <h4>最大坐标差值</h4>
            <Row gutter={16}>
              <Col span={8}>
                <ResultItem label="E最大差值" value={results.precision.maxDeltaE} unit="m" />
              </Col>
              <Col span={8}>
                <ResultItem label="N最大差值" value={results.precision.maxDeltaN} unit="m" />
              </Col>
              <Col span={8}>
                <ResultItem label="H最大差值" value={results.precision.maxDeltaH} unit="m" />
              </Col>
            </Row>
          </Col>
          {[1, 2, 3].map(pointNum => {
            const pointData = results.precision[`point${pointNum}`];
            if (!pointData) return null;
            
            return (
              <Col span={24} key={pointNum}>
                <h4>已知点{pointNum}精度</h4>
                <Row gutter={16}>
                  <Col span={6}>
                    <ResultItem label="E差值" value={pointData.deltaE} unit="m" />
                  </Col>
                  <Col span={6}>
                    <ResultItem label="N差值" value={pointData.deltaN} unit="m" />
                  </Col>
                  <Col span={6}>
                    <ResultItem label="H差值" value={pointData.deltaH} unit="m" />
                  </Col>
                  <Col span={6}>
                    <ResultItem label="距离差" value={pointData.distanceDiff} unit="m" />
                  </Col>
                </Row>
              </Col>
            );
          })}
        </>
      );
    } else if (calculationType === '2BRE2D') {
      return (
        <Row gutter={16}>
          <Col span={12}>
            <ResultItem label="E坐标差值" value={results.precision.deltaE} unit="m" />
          </Col>
          <Col span={12}>
            <ResultItem label="N坐标差值" value={results.precision.deltaN} unit="m" />
          </Col>
          <Col span={12}>
            <ResultItem label="到已知点1距离" value={results.precision.distanceToPoint1} unit="m" />
          </Col>
          <Col span={12}>
            <ResultItem label="到已知点2距离" value={results.precision.distanceToPoint2} unit="m" />
          </Col>
        </Row>
      );
    } else {
      return (
        <Row gutter={16}>
          <Col span={12}>
            <ResultItem label="水平误差" value={results.precision.horizontal} unit="m" />
          </Col>
          <Col span={12}>
            <ResultItem label="角度检核" value={results.precision.angleCheck} unit="°" />
          </Col>
        </Row>
      );
    }
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
          selectedKeys={['free-station']}
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
        <span className={styles.headerTitle}>自由测站计算</span>
        <Button 
          icon={<HomeOutlined />} 
          onClick={() => navigate('/')}
          type="link"
        />
      </div>

      {/* 移动端导航抽屉 */}
      <Drawer
        title="导航菜单"
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        bodyStyle={{ padding: 0 }}
      >
        <Menu
          mode="vertical"
          items={menuItems}
          onClick={handleMenuClick}
          selectedKeys={['free-station']}
          style={{ border: 'none' }}
        />
      </Drawer>

      <Content className={styles.content}>
        <Card title="计算参数设置" className={styles.mainCard}>
          {renderCalculationTypeSelector()}
          {renderInputForm()}
          <Button type="primary" onClick={handleCalculate}>
            计算
          </Button>
        </Card>

        {results && (
          <Card title="计算结果" className={styles.resultCard}>
            <Row gutter={[24, 24]}>
              <Col span={8}>
                <ResultCard 
                  title="测站坐标"
                  data={{
                    E: { label: 'E', value: results.station.E, unit: 'm' },
                    N: { label: 'N', value: results.station.N, unit: 'm' },
                    H: { label: 'H', value: results.station.H, unit: 'm' },
                    orientation: { label: '定向角', value: results.orientation, unit: '°' }
                  }}
                />
              </Col>

              {calculationType === '3BRE3D' ? (
                <>
                  <Col span={8}>
                    <ResultCard 
                      title="整体精度"
                      data={{
                        maxDeltaE: { label: 'E最大差值', value: results.precision.maxDeltaE, unit: 'm' },
                        maxDeltaN: { label: 'N最大差值', value: results.precision.maxDeltaN, unit: 'm' },
                        maxDeltaH: { label: 'H最大差值', value: results.precision.maxDeltaH, unit: 'm' }
                      }}
                    />
                  </Col>
                  {[1, 2, 3].map(pointNum => {
                    const pointData = results.precision[`point${pointNum}`];
                    if (!pointData) return null;
                    
                    return (
                      <Col span={8} key={pointNum}>
                        <ResultCard 
                          title={`已知点${pointNum}精度`}
                          data={{
                            deltaE: { label: 'E差值', value: pointData.deltaE, unit: 'm' },
                            deltaN: { label: 'N差值', value: pointData.deltaN, unit: 'm' },
                            deltaH: { label: 'H差值', value: pointData.deltaH, unit: 'm' },
                            distanceDiff: { label: '距离差', value: pointData.distanceDiff, unit: 'm' }
                          }}
                        />
                      </Col>
                    );
                  })}
                </>
              ) : calculationType === '2BRE2D' ? (
                <Col span={16}>
                  <ResultCard 
                    title="精度检核"
                    data={{
                      deltaE: { label: 'E坐标差值', value: results.precision.deltaE, unit: 'm' },
                      deltaN: { label: 'N坐标差值', value: results.precision.deltaN, unit: 'm' },
                      distanceToPoint1: { label: '到已知点1距离', value: results.precision.distanceToPoint1, unit: 'm' },
                      distanceToPoint2: { label: '到已知点2距离', value: results.precision.distanceToPoint2, unit: 'm' }
                    }}
                  />
                </Col>
              ) : (
                <Col span={16}>
                  <ResultCard 
                    title="精度检核"
                    data={{
                      horizontal: { label: '水平误差', value: results.precision.horizontal, unit: 'm' },
                      angleCheck: { label: '角度检核', value: results.precision.angleCheck, unit: '°' }
                    }}
                  />
                </Col>
              )}
            </Row>
          </Card>
        )}
      </Content>
    </Layout>
  );
};

export default FreeStationLayout;