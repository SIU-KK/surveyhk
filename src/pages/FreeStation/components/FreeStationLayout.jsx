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
      key: 'home',
      icon: <HomeOutlined />,
      label: '返回主頁',
      onClick: () => navigate('/')
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
      label: '自由設站解算'
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
      return Promise.reject('請輸入角度值');
    }
    const pattern = /^\d{1,3}\.\d{4}$/;
    if (!pattern.test(value)) {
      return Promise.reject('角度格式應為DD.MMSS');
    }
    const parts = value.split('.');
    const minutes = parseInt(parts[1].substring(0, 2));
    const seconds = parseInt(parts[1].substring(2, 4));
    if (minutes >= 60 || seconds >= 60) {
      return Promise.reject('分或秒不能大於等於60');
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
      <div className={styles.calculationTypeContainer}>
        <Radio.Group
          onChange={(e) => setCalculationType(e.target.value)}
          value={calculationType}
          className={styles.calculationTypeSelector}
        >
          <Radio.Button value="2BRE1D">雙角+單距計算</Radio.Button>
          <Radio.Button value="2BRE2D">雙角+雙距計算</Radio.Button>
          <Radio.Button value="3BRE3D">三角+三距計算</Radio.Button>
        </Radio.Group>
      </div>
    );
  };

  const render2BRE1DInputs = () => {
    return (
      <>
        <Divider>儀器參數</Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="儀器高" name="instrumentHeight" rules={[{ required: true }]}>
              <NumericInput 
                placeholder="輸入儀器高"
                inputMode="decimal"
              />
            </Form.Item>
          </Col>
        </Row>
        <Divider>已知點1</Divider>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Form.Item
              label="E"
              name={['knownPoint1', 'e']}
              rules={[{ required: true, message: '請輸入E值' }]}
            >
              <NumericInput placeholder="請輸入E值" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="N"
              name={['knownPoint1', 'n']}
              rules={[{ required: true, message: '請輸入N值' }]}
            >
              <NumericInput placeholder="請輸入N值" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="H"
              name={['knownPoint1', 'h']}
              rules={[{ required: true, message: '請輸入H值' }]}
            >
              <NumericInput placeholder="請輸入H值" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="BRG"
              name={['observation1', 'brg']}
              rules={[{ required: true, message: '請輸入BRG值' }]}
            >
              <NumericInput placeholder="DD.MMSS" pattern="\d{1,3}\.\d{4}" />
            </Form.Item>
          </Col>
        </Row>
        <Divider>已知點2</Divider>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Form.Item
              label="E"
              name={['knownPoint2', 'e']}
              rules={[{ required: true, message: '請輸入E值' }]}
            >
              <NumericInput placeholder="請輸入E值" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="N"
              name={['knownPoint2', 'n']}
              rules={[{ required: true, message: '請輸入N值' }]}
            >
              <NumericInput placeholder="請輸入N值" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="H"
              name={['knownPoint2', 'h']}
              rules={[{ required: true, message: '請輸入H值' }]}
            >
              <NumericInput placeholder="請輸入H值" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="BRG"
              name={['observation2', 'brg']}
              rules={[{ required: true, message: '請輸入BRG值' }]}
            >
              <NumericInput placeholder="DD.MMSS" pattern="\d{1,3}\.\d{4}" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="VA"
              name={['observation2', 'va']}
              rules={[{ required: true, message: '請輸入VA值' }]}
            >
              <NumericInput placeholder="DD.MMSS" pattern="\d{1,3}\.\d{4}" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="SD"
              name={['observation2', 'sd']}
              rules={[{ required: true, message: '請輸入SD值' }]}
            >
              <NumericInput placeholder="請輸入SD值" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="PH"
              name={['observation2', 'ph']}
              rules={[{ required: true, message: '請輸入PH值' }]}
            >
              <NumericInput placeholder="請輸入PH值" />
            </Form.Item>
          </Col>
        </Row>
      </>
    );
  };

  const render2BRE2DInputs = () => {
    return (
      <>
        <Divider>儀器參數</Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="儀器高" name="instrumentHeight" rules={[{ required: true }]}>
              <NumericInput 
                placeholder="輸入儀器高"
                inputMode="decimal"
              />
            </Form.Item>
          </Col>
        </Row>
        <Divider>已知點1</Divider>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Form.Item
              label="E"
              name={['knownPoint1', 'e']}
              rules={[{ required: true, message: '請輸入E值' }]}
            >
              <NumericInput placeholder="請輸入E值" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="N"
              name={['knownPoint1', 'n']}
              rules={[{ required: true, message: '請輸入N值' }]}
            >
              <NumericInput placeholder="請輸入N值" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="H"
              name={['knownPoint1', 'h']}
              rules={[{ required: true, message: '請輸入H值' }]}
            >
              <NumericInput placeholder="請輸入H值" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="BRG"
              name={['observation1', 'brg']}
              rules={[{ required: true, message: '請輸入BRG值' }]}
            >
              <NumericInput placeholder="DD.MMSS" pattern="\d{1,3}\.\d{4}" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="VA"
              name={['observation1', 'va']}
              rules={[{ required: true, message: '請輸入VA值' }]}
            >
              <NumericInput placeholder="DD.MMSS" pattern="\d{1,3}\.\d{4}" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="SD"
              name={['observation1', 'sd']}
              rules={[{ required: true, message: '請輸入SD值' }]}
            >
              <NumericInput placeholder="請輸入SD值" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="PH"
              name={['observation1', 'ph']}
              rules={[{ required: true, message: '請輸入PH值' }]}
            >
              <NumericInput placeholder="請輸入PH值" />
            </Form.Item>
          </Col>
        </Row>
        <Divider>已知點2</Divider>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Form.Item
              label="E"
              name={['knownPoint2', 'e']}
              rules={[{ required: true, message: '請輸入E值' }]}
            >
              <NumericInput placeholder="請輸入E值" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="N"
              name={['knownPoint2', 'n']}
              rules={[{ required: true, message: '請輸入N值' }]}
            >
              <NumericInput placeholder="請輸入N值" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="H"
              name={['knownPoint2', 'h']}
              rules={[{ required: true, message: '請輸入H值' }]}
            >
              <NumericInput placeholder="請輸入H值" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="BRG"
              name={['observation2', 'brg']}
              rules={[{ required: true, message: '請輸入BRG值' }]}
            >
              <NumericInput placeholder="DD.MMSS" pattern="\d{1,3}\.\d{4}" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="VA"
              name={['observation2', 'va']}
              rules={[{ required: true, message: '請輸入VA值' }]}
            >
              <NumericInput placeholder="DD.MMSS" pattern="\d{1,3}\.\d{4}" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="SD"
              name={['observation2', 'sd']}
              rules={[{ required: true, message: '請輸入SD值' }]}
            >
              <NumericInput placeholder="請輸入SD值" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="PH"
              name={['observation2', 'ph']}
              rules={[{ required: true, message: '請輸入PH值' }]}
            >
              <NumericInput placeholder="請輸入PH值" />
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
          <Form.Item label={`已知點${pointNum} E`} name={`point${pointNum}_E`} rules={[{ required: true }]}>
            <NumericInput 
              placeholder="輸入E坐標" 
              inputMode="decimal"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item label={`已知點${pointNum} N`} name={`point${pointNum}_N`} rules={[{ required: true }]}>
            <NumericInput 
              placeholder="輸入N坐標"
              inputMode="decimal"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item label={`已知點${pointNum} H`} name={`point${pointNum}_H`} rules={[{ required: true }]}>
            <NumericInput 
              placeholder="輸入H坐標"
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
            label={`${isObs ? '觀測' : '已知'}點${pointNum} BRG`} 
            name={`${isObs ? 'obs' : 'point'}${pointNum}_BRG`}
            rules={[
              { required: true },
              { validator: validateDDMMSS }
            ]}
          >
            <NumericInput 
              placeholder="輸入方位角 (DD.MMSS)"
              pattern="\d{1,3}\.\d{4}"
              inputMode="decimal"
              type="text"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={6}>
          <Form.Item 
            label={`${isObs ? '觀測' : '已知'}點${pointNum} VA`} 
            name={`${isObs ? 'obs' : 'point'}${pointNum}_VA`}
            rules={[
              { required: true },
              { validator: validateDDMMSS }
            ]}
          >
            <NumericInput 
              placeholder="輸入天頂角 (DD.MMSS)"
              pattern="\d{1,3}\.\d{4}"
              inputMode="decimal"
              type="text"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={6}>
          <Form.Item label={`${isObs ? '觀測' : '已知'}點${pointNum} SD`} name={`${isObs ? 'obs' : 'point'}${pointNum}_SD`} rules={[{ required: true }]}>
            <NumericInput 
              placeholder="輸入斜距"
              inputMode="decimal"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={6}>
          <Form.Item label={`${isObs ? '觀測' : '已知'}點${pointNum} PH`} name={`${isObs ? 'obs' : 'point'}${pointNum}_PH`} rules={[{ required: true }]}>
            <NumericInput 
              placeholder="輸入棱鏡高"
              inputMode="decimal"
            />
          </Form.Item>
        </Col>
      </Row>
    );

    if (calculationType === '3BRE3D') {
      return (
        <Form form={form} layout="vertical">
          <Divider>儀器參數</Divider>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item label="儀器高" name="instrumentHeight" rules={[{ required: true }]}>
                <NumericInput 
                  placeholder="輸入儀器高"
                  inputMode="decimal"
                />
              </Form.Item>
            </Col>
          </Row>
          {[1, 2, 3].map(pointNum => (
            <React.Fragment key={pointNum}>
              <Divider>已知點{pointNum}</Divider>
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
          {render2BRE2DInputs()}
        </Form>
      );
    }
  };

  const handleCalculate = async () => {
    try {
      const values = await form.validateFields();
      let result;

      console.log('原始表單數據:', values);

      switch (calculationType) {
        case '2BRE1D':
          // 轉換2BRE1D的數據格式
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
          console.log('轉換後的2BRE1D數據:', data2BRE1D);
          result = calculate2BRE1D(data2BRE1D);
          break;

        case '2BRE2D':
          // 轉換2BRE2D的數據格式
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
          console.log('轉換後的2BRE2D數據:', data2BRE2D);
          result = calculate2BRE2D(data2BRE2D);
          break;

        case '3BRE3D':
          result = calculate3BRE3D(values);
          break;
      }
      
      setResults(result);
    } catch (error) {
      console.error('計算錯誤:', error);
      if (error.errorFields) {
        message.error('請檢查輸入數據格式是否正確（角度應為DD.MMSS格式）');
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
      message.success('已複製到剪貼板');
    } catch (err) {
      message.error('複製失敗，請手動複製');
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
            <h4>最大坐標差值</h4>
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
                <h4>已知點{pointNum}精度</h4>
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
                    <ResultItem label="距離差" value={pointData.distanceDiff} unit="m" />
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
            <ResultItem label="E坐標差值" value={results.precision.deltaE} unit="m" />
          </Col>
          <Col span={12}>
            <ResultItem label="N坐標差值" value={results.precision.deltaN} unit="m" />
          </Col>
          <Col span={12}>
            <ResultItem label="到已知點1距離" value={results.precision.distanceToPoint1} unit="m" />
          </Col>
          <Col span={12}>
            <ResultItem label="到已知點2距離" value={results.precision.distanceToPoint2} unit="m" />
          </Col>
        </Row>
      );
    } else {
      return (
        <Row gutter={16}>
          <Col span={12}>
            <ResultItem label="水平誤差" value={results.precision.horizontal} unit="m" />
          </Col>
          <Col span={12}>
            <ResultItem label="角度檢核" value={results.precision.angleCheck} unit="°" />
          </Col>
        </Row>
      );
    }
  };

  return (
    <Layout className={styles.layout}>
      {/* 桌面端菜單 */}
      <Layout.Header className={styles.header}>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={['free-station']}
          onClick={handleMenuClick}
          className={styles.menu}
        >
          {menuItems.map(item => (
            <Menu.Item key={item.key} icon={item.icon}>
              {item.label}
            </Menu.Item>
          ))}
        </Menu>
      </Layout.Header>

      {/* 移動端頂部導航 */}
      <div className={styles.mobileHeader}>
        <Button 
          type="text" 
          icon={<MenuOutlined />} 
          onClick={() => setDrawerVisible(true)}
          className={styles.menuButton}
        />
        <div className={styles.headerTitle}>自由設站解算</div>
        <div style={{ width: 32 }}></div>
      </div>

      {/* 移動端側邊抽屉菜單 */}
      <Drawer
        title="菜單"
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={280}
      >
        <Menu
          mode="vertical"
          selectedKeys={['free-station']}
          onClick={handleMenuClick}
          style={{ border: 'none' }}
          theme="light"
        >
          {menuItems.map(item => (
            <Menu.Item key={item.key} icon={item.icon}>
              {item.label}
            </Menu.Item>
          ))}
        </Menu>
      </Drawer>

      <Content className={styles.content}>
        <Card title="計算參數設置" className={styles.mainCard}>
          {renderCalculationTypeSelector()}
          {renderInputForm()}
          <Button type="primary" onClick={handleCalculate}>
            計算
          </Button>
        </Card>

        {results && (
          <Card title="計算結果" className={styles.resultCard}>
            <Row gutter={[24, 24]}>
              <Col span={8}>
                <ResultCard 
                  title="測站坐標"
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
                      title="整體精度"
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
                          title={`已知點${pointNum}精度`}
                          data={{
                            deltaE: { label: 'E差值', value: pointData.deltaE, unit: 'm' },
                            deltaN: { label: 'N差值', value: pointData.deltaN, unit: 'm' },
                            deltaH: { label: 'H差值', value: pointData.deltaH, unit: 'm' },
                            distanceDiff: { label: '距離差', value: pointData.distanceDiff, unit: 'm' }
                          }}
                        />
                      </Col>
                    );
                  })}
                </>
              ) : calculationType === '2BRE2D' ? (
                <Col span={16}>
                  <ResultCard 
                    title="精度檢核"
                    data={{
                      deltaE: { label: 'E坐標差值', value: results.precision.deltaE, unit: 'm' },
                      deltaN: { label: 'N坐標差值', value: results.precision.deltaN, unit: 'm' },
                      distanceToPoint1: { label: '到已知點1距離', value: results.precision.distanceToPoint1, unit: 'm' },
                      distanceToPoint2: { label: '到已知點2距離', value: results.precision.distanceToPoint2, unit: 'm' }
                    }}
                  />
                </Col>
              ) : (
                <Col span={16}>
                  <ResultCard 
                    title="精度檢核"
                    data={{
                      horizontal: { label: '水平誤差', value: results.precision.horizontal, unit: 'm' },
                      angleCheck: { label: '角度檢核', value: results.precision.angleCheck, unit: '°' }
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