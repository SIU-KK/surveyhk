import React, { useState } from 'react';
import { Card, Form, Input, Button, Select, Row, Col, Table, message, Divider, Tooltip, Typography } from 'antd';
import { InfoCircleOutlined, DownloadOutlined } from '@ant-design/icons';
import styles from './ComponentStyles.module.css';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const { Option } = Select;
const { Link } = Typography;

const FirstPileCheckPro = () => {
  const [form] = Form.useForm();
  const [calculationResults, setCalculationResults] = useState({});
  const [resultCardRef, setResultCardRef] = useState(React.createRef());

  const onFinish = (values) => {
    try {
      // 专业版头桩检查计算
      const {
        pileNo,
        pileType,
        pileDiameter,
        designX,
        designY,
        designZ,
        actualX,
        actualY,
        actualZ,
        tolerance
      } = values;
      
      // 计算偏差
      const deltaX = actualX - designX;
      const deltaY = actualY - designY;
      const deltaZ = actualZ - designZ;
      const horizontalDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const totalDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
      
      // 判断是否在允许范围内
      const withinTolerance = horizontalDistance <= tolerance;
      
      // 计算偏移角度
      const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
      const bearing = (angle >= 0 ? angle : 360 + angle).toFixed(2);
      
      // 保存计算结果
      const results = {
        pileNo,
        pileType,
        pileDiameter,
        designX,
        designY,
        designZ,
        actualX,
        actualY,
        actualZ,
        deltaX,
        deltaY,
        deltaZ,
        horizontalDistance,
        totalDistance,
        bearing,
        tolerance,
        withinTolerance
      };
      
      setCalculationResults(results);
      message.success('计算完成');
    } catch (error) {
      console.error('计算错误:', error);
      message.error('计算过程中发生错误');
    }
  };

  const handleDownloadPDF = async () => {
    // 确保结果已经计算
    if (!calculationResults || Object.keys(calculationResults).length === 0) {
      message.warning('请先进行计算后再下载PDF');
      return;
    }
    
    message.loading({ content: '正在生成PDF...', key: 'pdfLoading' });
    
    try {
      // 创建PDF实例
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // 获取PDF页面尺寸
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // 设置标题字体和大小
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      
      // 添加标题和分隔线
      const titleMargin = 15;
      const titleY = 15;
      
      // 添加标题
      pdf.text('头桩检查报告', titleMargin, titleY);
      
      // 添加分隔线
      pdf.setLineWidth(0.5);
      pdf.line(titleMargin, titleY + 2, pdfWidth - titleMargin, titleY + 2);
      
      // 捕获计算结果卡片
      if (resultCardRef.current) {
        const resultCanvas = await html2canvas(resultCardRef.current, {
          scale: 2,
          useCORS: true,
          logging: false
        });
        
        const resultImgData = resultCanvas.toDataURL('image/png');
        const imgWidth = resultCanvas.width;
        const imgHeight = resultCanvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, (pdfHeight - 30) / imgHeight);
        
        // 放在标题下方
        pdf.addImage(resultImgData, 'PNG', (pdfWidth - imgWidth * ratio) / 2, titleY + 10, imgWidth * ratio, imgHeight * ratio);
      }
      
      // 获取桩号和当前日期
      const pileNo = calculationResults.pileNo || 'Unknown';
      const currentDate = new Date().toISOString().split('T')[0];
      
      // 保存PDF
      pdf.save(`头桩检查_${pileNo}_${currentDate}.pdf`);
      message.success({ content: 'PDF已生成并下载', key: 'pdfLoading' });
    } catch (error) {
      console.error('PDF生成错误:', error);
      message.error({ content: 'PDF生成失败', key: 'pdfLoading' });
    }
  };

  const renderForm = () => (
    <Form
      form={form}
      onFinish={onFinish}
      layout="vertical"
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item
            label="桩号"
            name="pileNo"
            rules={[{ required: true, message: '请输入桩号' }]}
          >
            <Input placeholder="输入桩号" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item
            label="桩类型"
            name="pileType"
          >
            <Input placeholder="输入桩类型" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item
            label="桩直径(mm)"
            name="pileDiameter"
            rules={[{ required: true, message: '请输入桩直径' }]}
          >
            <Input type="number" step="1" placeholder="输入桩直径" />
          </Form.Item>
        </Col>
      </Row>
      
      <Divider orientation="left">设计坐标</Divider>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item
            label="X坐标"
            name="designX"
            rules={[{ required: true, message: '请输入设计X坐标' }]}
          >
            <Input type="number" step="0.001" placeholder="输入设计X坐标" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item
            label="Y坐标"
            name="designY"
            rules={[{ required: true, message: '请输入设计Y坐标' }]}
          >
            <Input type="number" step="0.001" placeholder="输入设计Y坐标" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item
            label="Z坐标"
            name="designZ"
            rules={[{ required: true, message: '请输入设计Z坐标' }]}
          >
            <Input type="number" step="0.001" placeholder="输入设计Z坐标" />
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">实际坐标</Divider>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item
            label="X坐标"
            name="actualX"
            rules={[{ required: true, message: '请输入实际X坐标' }]}
          >
            <Input type="number" step="0.001" placeholder="输入实际X坐标" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item
            label="Y坐标"
            name="actualY"
            rules={[{ required: true, message: '请输入实际Y坐标' }]}
          >
            <Input type="number" step="0.001" placeholder="输入实际Y坐标" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item
            label="Z坐标"
            name="actualZ"
            rules={[{ required: true, message: '请输入实际Z坐标' }]}
          >
            <Input type="number" step="0.001" placeholder="输入实际Z坐标" />
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">允许偏差</Divider>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item
            label="允许偏差(mm)"
            name="tolerance"
            initialValue={50}
            rules={[{ required: true, message: '请输入允许偏差' }]}
          >
            <Input type="number" step="1" placeholder="输入允许偏差" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          计算
        </Button>
        <Button 
          style={{ marginLeft: 8 }} 
          onClick={() => {
            form.resetFields();
            setCalculationResults({});
          }}
        >
          重置
        </Button>
        <Button 
          type="primary" 
          icon={<DownloadOutlined />} 
          style={{ marginLeft: 8 }}
          onClick={handleDownloadPDF}
        >
          下载PDF
        </Button>
      </Form.Item>
    </Form>
  );

  const renderCalculationResults = () => {
    if (!calculationResults || Object.keys(calculationResults).length === 0) {
      return null;
    }

    return (
      <div className={styles.resultContent}>
        <div style={{ marginBottom: '20px' }}>
          <h3>桩信息</h3>
          <Row gutter={[16, 8]}>
            <Col xs={24} sm={8}>
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>桩号:</span>
                <span className={styles.resultValue}>{calculationResults.pileNo}</span>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>桩类型:</span>
                <span className={styles.resultValue}>{calculationResults.pileType || '-'}</span>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>桩直径:</span>
                <span className={styles.resultValue}>{calculationResults.pileDiameter} mm</span>
              </div>
            </Col>
          </Row>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>坐标信息</h3>
          <Row gutter={[16, 8]}>
            <Col xs={24} sm={12}>
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>设计坐标:</span>
                <span className={styles.resultValue}>
                  X: {calculationResults.designX.toFixed(3)}, 
                  Y: {calculationResults.designY.toFixed(3)}, 
                  Z: {calculationResults.designZ.toFixed(3)}
                </span>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>实际坐标:</span>
                <span className={styles.resultValue}>
                  X: {calculationResults.actualX.toFixed(3)}, 
                  Y: {calculationResults.actualY.toFixed(3)}, 
                  Z: {calculationResults.actualZ.toFixed(3)}
                </span>
              </div>
            </Col>
          </Row>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>偏差分析</h3>
          <Row gutter={[16, 8]}>
            <Col xs={24} sm={8}>
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>X偏差:</span>
                <span className={styles.resultValue}>{calculationResults.deltaX.toFixed(3)} m ({(calculationResults.deltaX * 1000).toFixed(0)} mm)</span>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Y偏差:</span>
                <span className={styles.resultValue}>{calculationResults.deltaY.toFixed(3)} m ({(calculationResults.deltaY * 1000).toFixed(0)} mm)</span>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Z偏差:</span>
                <span className={styles.resultValue}>{calculationResults.deltaZ.toFixed(3)} m ({(calculationResults.deltaZ * 1000).toFixed(0)} mm)</span>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>水平偏差:</span>
                <span className={styles.resultValue}>{calculationResults.horizontalDistance.toFixed(3)} m ({(calculationResults.horizontalDistance * 1000).toFixed(0)} mm)</span>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>总偏差:</span>
                <span className={styles.resultValue}>{calculationResults.totalDistance.toFixed(3)} m ({(calculationResults.totalDistance * 1000).toFixed(0)} mm)</span>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>偏移方位角:</span>
                <span className={styles.resultValue}>{calculationResults.bearing}°</span>
              </div>
            </Col>
          </Row>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>结论</h3>
          <Row gutter={[16, 8]}>
            <Col xs={24}>
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>允许偏差:</span>
                <span className={styles.resultValue}>{calculationResults.tolerance} mm</span>
              </div>
            </Col>
            <Col xs={24}>
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>检查结果:</span>
                <span className={styles.resultValue} style={{ color: calculationResults.withinTolerance ? 'green' : 'red', fontWeight: 'bold' }}>
                  {calculationResults.withinTolerance ? '合格' : '不合格'}
                </span>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <Card 
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>头桩检查（专业版）</span>
            <Link 
              onClick={() => {
                const tabsElement = document.querySelector('.ant-tabs-nav-list');
                if (tabsElement) {
                  const tabNodes = tabsElement.childNodes;
                  // 查找头桩检查(简单版)的选项卡并点击
                  for (let i = 0; i < tabNodes.length; i++) {
                    if (tabNodes[i].textContent.includes('头桩检查(简单版)')) {
                      tabNodes[i].click();
                      break;
                    }
                  }
                }
              }}
              style={{ fontSize: '14px' }}
            >
              返回简单版 &gt;
            </Link>
          </div>
        }
        className={styles.formCard}
      >
        {renderForm()}
      </Card>
      
      {Object.keys(calculationResults).length > 0 && (
        <Card 
          title="计算结果" 
          className={styles.resultCard} 
          style={{ marginTop: 16 }}
          ref={resultCardRef}
        >
          {renderCalculationResults()}
        </Card>
      )}
    </div>
  );
};

export default FirstPileCheckPro; 