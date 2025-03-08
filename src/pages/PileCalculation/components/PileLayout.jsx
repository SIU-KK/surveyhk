import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Input, Button, Radio, Row, Col, Table, message, Tabs, Select, Divider, Tooltip, Typography } from 'antd';
import { DownloadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import styles from './ComponentStyles.module.css';
import NumericInput from './NumericInput';

const { TabPane } = Tabs;
const { Option } = Select;

const PileLayout = ({ mode = 'simple' }) => {
  const [form] = Form.useForm();
  const [calculationResults, setCalculationResults] = useState({});
  const [svgPath, setSvgPath] = useState('');
  const resultCardRef = useRef(null);
  const planCardRef = useRef(null);
  const [direction, setDirection] = useState('forward');

  const handleDirectionChange = (value) => {
    setDirection(value);
  };

  const generateSvgPath = (pileX, pileY, settingX, settingY, offset, chord, azimuth) => {
    // 画布大小和中心点
    const svgWidth = 350;
    const svgHeight = 350;
    const centerX = svgWidth / 2;
    const centerY = svgHeight / 2;
    
    // 桩点为中心点
    const pX = centerX;
    const pY = centerY;
    
    // 计算方位角的弧度值
    const azimuthRad = azimuth * Math.PI / 180;
    
    // 计算O/S和C/H的绝对最大值，用于缩放
    const maxAbsValue = Math.max(Math.abs(offset), Math.abs(chord), 0.001); // 避免除以0
    
    // 根据偏移值大小确定缩放系数
    let scaleOS;
    
    if (maxAbsValue > 1.0) {
      scaleOS = 50;
    } else if (maxAbsValue > 0.5) {
      scaleOS = 100;
    } else if (maxAbsValue > 0.1) {
      scaleOS = 300;
    } else if (maxAbsValue > 0.05) {
      scaleOS = 600;
    } else {
      scaleOS = 1000;
    }
    
    const scaleCH = scaleOS;
    
    // 计算放样点坐标
    const sX = centerX + offset * scaleOS;
    const sY = centerY - chord * scaleCH;
    
    // 计算偏移点的位置
    const oX = centerX + offset * scaleOS;
    const oY = centerY;
    
    // 固定的圆半径
    const circleRadius = 100;
    
    // 确保使用chord的实际值
    const axisBuffer = 1.2;
    const minAxisLength = 120;
    
    let leftAxisLength = Math.max(Math.abs(Math.min(0, offset)) * scaleOS * axisBuffer, minAxisLength);
    let rightAxisLength = Math.max(Math.abs(Math.max(0, offset)) * scaleOS * axisBuffer, minAxisLength);
    let upAxisLength = Math.max(Math.abs(Math.max(0, chord)) * scaleCH * axisBuffer, minAxisLength);
    let downAxisLength = Math.max(Math.abs(Math.min(0, chord)) * scaleCH * axisBuffer, minAxisLength);
    
    // 坐标轴
    const xAxisStartX = centerX - leftAxisLength;
    const xAxisStartY = centerY;
    const xAxisEndX = centerX + rightAxisLength;
    const xAxisEndY = centerY;
    const yAxisStartX = centerX;
    const yAxisStartY = centerY + downAxisLength;
    const yAxisEndX = centerX;
    const yAxisEndY = centerY - upAxisLength;
    
    // 计算北方指示箭头的位置（固定在右上角）
    const northX = centerX + 80;
    const northY = centerY - 80;
    
    // 根据方向设置类型确定北方指向
    let northArrowAngle;
    if (mode === 'professional') {
      if (direction === 'north') {
        // 正北方向，箭头指向正上方
        northArrowAngle = -Math.PI/2;
      } else if (direction === 'azimuth') {
        // 方位角方式，箭头根据输入的方位角确定
        northArrowAngle = azimuthRad - Math.PI/2;
      } else if (direction === 'endPoint') {
        // 终点坐标方式，箭头根据计算的方位角确定
        northArrowAngle = azimuthRad - Math.PI/2;
      }
    } else {
      // 简易模式保持原有逻辑
      northArrowAngle = azimuthRad - Math.PI/2;
    }
    
    const northEndX = northX + Math.cos(northArrowAngle) * 20;
    const northEndY = northY + Math.sin(northArrowAngle) * 20;
    
    // 计算北方箭头三角形的点
    const arrowSize = 5;
    const arrowPoint1X = northEndX + Math.cos(northArrowAngle) * arrowSize;
    const arrowPoint1Y = northEndY + Math.sin(northArrowAngle) * arrowSize;
    const arrowPoint2X = northEndX + Math.cos(northArrowAngle + 2.5) * arrowSize;
    const arrowPoint2Y = northEndY + Math.sin(northArrowAngle + 2.5) * arrowSize;
    const arrowPoint3X = northEndX + Math.cos(northArrowAngle - 2.5) * arrowSize;
    const arrowPoint3Y = northEndY + Math.sin(northArrowAngle - 2.5) * arrowSize;
    
    // 添加坐标系原点标记
    const originMark = `
      <circle cx="${centerX}" cy="${centerY}" r="2" fill="#888888" />
    `;
    
    // 特别标记O/S和C/H的值
    const osTickMark = `
      <line x1="${oX}" y1="${centerY - 5}" x2="${oX}" y2="${centerY + 5}" stroke="#00aa00" stroke-width="2" />
      <text x="${oX}" y="${centerY + 35}" text-anchor="middle" fill="#00aa00" font-size="11" font-weight="bold">O/S: ${offset.toFixed(4)}</text>
    `;
    
    const chTickMark = `
      <line x1="${centerX - 5}" y1="${sY}" x2="${centerX + 5}" y2="${sY}" stroke="#0000aa" stroke-width="2" />
      <text x="${centerX + 40}" y="${sY + 5}" text-anchor="start" fill="#0000aa" font-size="11" font-weight="bold">C/H: ${chord.toFixed(4)}</text>
    `;
    
    return `
      <svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
        <!-- 背景网格 -->
        <rect x="0" y="0" width="${svgWidth}" height="${svgHeight}" fill="#f9f9f9" />
        
        <!-- XY坐标轴 -->
        <line x1="${xAxisStartX}" y1="${xAxisStartY}" x2="${xAxisEndX}" y2="${xAxisEndY}" stroke="#888888" stroke-dasharray="3,3" stroke-width="1" />
        <line x1="${yAxisStartX}" y1="${yAxisStartY}" x2="${yAxisEndX}" y2="${yAxisEndY}" stroke="#888888" stroke-dasharray="3,3" stroke-width="1" />
        <text x="${xAxisEndX + 5}" y="${xAxisEndY + 5}" fill="#888888" font-size="12">X (O/S)</text>
        <text x="${yAxisEndX + 5}" y="${yAxisEndY + 5}" fill="#888888" font-size="12">Y (C/H)</text>
        
        <!-- 坐标系原点标记 -->
        ${originMark}
        
        <!-- O/S和C/H标记 -->
        ${osTickMark}
        ${chTickMark}
        
        <!-- 方位角标注，仅在简易模式下显示 -->
        ${mode === 'simple' ? `<text x="${centerX - 50}" y="${centerY - 130}" fill="black" font-size="12">Ref.Bre.: ${azimuth.toFixed(2)}°</text>` : ''}
        
        <!-- 正北方向 -->
        <line x1="${northX}" y1="${northY}" x2="${northEndX}" y2="${northEndY}" stroke="#444444" stroke-width="1.5" />
        <polygon points="${arrowPoint1X},${arrowPoint1Y} ${arrowPoint2X},${arrowPoint2Y} ${arrowPoint3X},${arrowPoint3Y}" fill="#444444" />
        <text x="${northX + 10}" y="${northY}" fill="#444444" font-size="12">N</text>
        
        <!-- 桩位圆 -->
        <circle cx="${pX}" cy="${pY}" r="${circleRadius}" fill="none" stroke="red" stroke-width="1.5" opacity="0.7" />
        
        <!-- 放样点圆 -->
        <circle cx="${sX}" cy="${sY}" r="${circleRadius}" fill="none" stroke="blue" stroke-width="1.5" opacity="0.7" />
        
        <!-- 桩点 -->
        <circle cx="${pX}" cy="${pY}" r="5" fill="red" />
        
        <!-- 放样点 -->
        <circle cx="${sX}" cy="${sY}" r="5" fill="blue" />
        
        <!-- 连接线 -->
        <line x1="${pX}" y1="${pY}" x2="${sX}" y2="${sY}" stroke="black" stroke-width="1.5" />
        
        <!-- O/S和C/H线 - 保留线，不显示偏移点 -->
        <line x1="${pX}" y1="${pY}" x2="${oX}" y2="${oY}" stroke="black" stroke-dasharray="3,2" stroke-width="1" />
        <line x1="${oX}" y1="${oY}" x2="${sX}" y2="${sY}" stroke="black" stroke-dasharray="3,2" stroke-width="1" />
        
        <!-- 图例 -->
        <circle cx="30" cy="320" r="5" fill="red" />
        <text x="45" y="324" fill="black" font-size="12">Designed Coor</text>
        
        <circle cx="170" cy="320" r="5" fill="blue" />
        <text x="185" y="324" fill="black" font-size="12">Checked Coor</text>
      </svg>
    `;
  };

  // 添加度分秒转换函数
  const decimalToDMS = (decimal) => {
    // 确保值为正数
    let value = Math.abs(decimal);
    
    // 获取度
    const degrees = Math.floor(value);
    
    // 获取剩余的分钟部分
    value = (value - degrees) * 60;
    const minutes = Math.floor(value);
    
    // 获取剩余的秒部分
    value = (value - minutes) * 60;
    const seconds = Math.round(value);
    
    // 格式化为ddd.mmss
    return `${degrees.toString().padStart(3, '0')}.${minutes.toString().padStart(2, '0')}${seconds.toString().padStart(2, '0')}`;
  };

  // 添加度分秒转十进制度的函数
  const DMSToDecimal = (dms) => {
    // 处理 DD.MMSS 格式
    const degrees = Math.floor(dms);
    const minutesAndSeconds = (dms - degrees) * 100;
    const minutes = Math.floor(minutesAndSeconds);
    const seconds = Math.round((minutesAndSeconds - minutes) * 100);
    
    // 转换为十进制度
    return degrees + minutes / 60 + seconds / 3600;
  };

  // 修改计算坐标的辅助函数
  const calculateCoordinates = (stationE, stationN, stationH, instrumentHeight, breDMS, vaDMS, sd, ph) => {
    // 将度分秒转换为十进制度
    const breDecimal = DMSToDecimal(breDMS);
    const vaDecimal = DMSToDecimal(vaDMS);
    
    // 转换为弧度
    const breRad = (breDecimal * Math.PI) / 180;
    const vaRad = (vaDecimal * Math.PI) / 180;
    
    // 计算水平距离分量
    const horizontalDistance = Math.abs(Math.sin(vaRad) * sd);
    
    // 计算E和N的增量
    const deltaE = Math.sin(breRad) * horizontalDistance;
    const deltaN = Math.cos(breRad) * horizontalDistance;
    
    // 计算高程增量
    const deltaH = Math.cos(vaRad) * sd;
    
    // 计算最终坐标
    const finalE = stationE + deltaE;
    const finalN = stationN + deltaN;
    const finalH = stationH + instrumentHeight + deltaH - ph;
    
    return { E: finalE, N: finalN, H: finalH };
  };

  // 添加计算真实方位角的函数
  const calculateTrueBearing = (stationE, stationN, pointE, pointN) => {
    // 计算坐标差值
    const deltaE = pointE - stationE;  // deltaE = 0
    const deltaN = pointN - stationN;  // deltaN = 10
    
    // 计算方位角（使用atan2确保正确的象限）
    let bearing = Math.atan2(deltaE, deltaN) * 180 / Math.PI;
    
    // 确保方位角为正值且在0-360度之间
    if (bearing < 0) {
      bearing += 360;
    }
    
    // 转换为度分秒格式 (ddd.mmss)
    const degrees = Math.floor(bearing);
    const minutes = Math.floor((bearing - degrees) * 60);
    const seconds = Math.round(((bearing - degrees) * 60 - minutes) * 60);
    
    // 返回格式化的方位角字符串 (ddd.mmss)
    return `${degrees.toString().padStart(3, '0')}.${minutes.toString().padStart(2, '0')}${seconds.toString().padStart(2, '0')}`;
  };

  // 添加计算角度差的函数
  const calculateAngleDifference = (trueBearing1, trueBearing2, bre1, bre2) => {
    // 将 DD.MMSS 格式的角度转换为十进制度
    const tb1 = DMSToDecimal(parseFloat(trueBearing1));
    const bre1Decimal = DMSToDecimal(parseFloat(bre1));
    
    if (!trueBearing2 || !bre2) {
      // 只有一个后视点时
      const diff = bre1Decimal - tb1;
      // 将结果转换回 DD.MMSS 格式
      return decimalToDMS(Math.abs(diff));  // 使用绝对值
    } else {
      // 有两个后视点时
      const tb2 = DMSToDecimal(parseFloat(trueBearing2));
      const bre2Decimal = DMSToDecimal(parseFloat(bre2));
      const diff = (bre1Decimal + bre2Decimal) - (tb1 + tb2);
      // 将结果转换回 DD.MMSS 格式
      return decimalToDMS(Math.abs(diff));  // 使用绝对值
    }
  };

  const onFinish = (values) => {
    try {
      // 提取表单数据
      const {
        pileNo, pileE, pileN, directionType, endE, endN, azimuth,
        settingE, settingN, settingH
      } = values;
      
      // 确保必要的数据存在
      if (!pileE || !pileN || !settingE || !settingN) {
        message.error('请填写必要的坐标信息');
        return;
      }
      
      // 转换为数值
      const pileEVal = parseFloat(pileE);
      const pileNVal = parseFloat(pileN);
      const settingEVal = parseFloat(settingE);
      const settingNVal = parseFloat(settingN);
      
      // 计算桩点到放样点的向量
      const diffE = settingEVal - pileEVal;
      const diffN = settingNVal - pileNVal;
      
      // 计算水平距离
      const horizontalDistance = Math.sqrt(diffE * diffE + diffN * diffN);
      
      // 计算方位角
      let breDecimal;
      
      if (directionType === 'north') {
        // 正北方向
        breDecimal = 0;
      } else if (directionType === 'azimuth') {
        // 使用输入的方位角
        breDecimal = DMSToDecimal(parseFloat(azimuth));
      } else if (directionType === 'endPoint') {
        // 使用终点坐标计算方位角
        const endEVal = parseFloat(endE);
        const endNVal = parseFloat(endN);
        
        // 计算桩点到终点的向量
        const lineVectorE = endEVal - pileEVal;
        const lineVectorN = endNVal - pileNVal;
        
        // 计算方位角
        breDecimal = Math.atan2(lineVectorE, lineVectorN) * 180 / Math.PI;
        if (breDecimal < 0) {
          breDecimal += 360;
        }
      }
      
      // 计算放样点相对于桩点的方位角
      let settingBRE = Math.atan2(diffE, diffN) * 180 / Math.PI;
      if (settingBRE < 0) {
        settingBRE += 360;
      }
      
      // 计算角度差
      let angleDifference = settingBRE - breDecimal;
      if (angleDifference > 180) {
        angleDifference -= 360;
      } else if (angleDifference < -180) {
        angleDifference += 360;
      }
      
      // 计算偏移距离
      const offsetDistance = horizontalDistance * Math.sin(angleDifference * Math.PI / 180);
      const chordDistance = horizontalDistance * Math.cos(angleDifference * Math.PI / 180);
      
      // 计算高程差（如果有高程数据）
      let heightDifference = null;
      if (settingH) {
        const settingHVal = parseFloat(settingH);
        heightDifference = settingHVal - (values.pileH ? parseFloat(values.pileH) : 0);
      }
      
      // 格式化结果
      const calculationResult = {
        pileNo,
        pileE: pileEVal,
        pileN: pileNVal,
        settingE: settingEVal,
        settingN: settingNVal,
        horizontalDistance: horizontalDistance,
        refBearing: decimalToDMS(breDecimal),
        settingBearing: decimalToDMS(settingBRE),
        angleDifference: angleDifference,
        offsetDistance: offsetDistance,
        chordDistance: chordDistance,
        // 添加用于显示的差值（毫米）
        diffE: (settingEVal - pileEVal) * 1000,
        diffN: (settingNVal - pileNVal) * 1000,
        resultantMm: Math.sqrt(Math.pow((settingEVal - pileEVal) * 1000, 2) + Math.pow((settingNVal - pileNVal) * 1000, 2))
      };
      
      // 添加高程差（如果有）
      if (heightDifference !== null) {
        calculationResult.heightDifference = heightDifference;
        calculationResult.settingGL = parseFloat(settingH);
      }
      
      // 添加方位角（如果使用方位角模式）
      if (directionType === 'azimuth') {
        calculationResult.azimuth = azimuth;
      }
      
      // 生成示意图
      const svgData = generateSvgPath(pileEVal, pileNVal, settingEVal, settingNVal, diffE/1000, diffN/1000, breDecimal);
      setSvgPath(svgData);
      
      setCalculationResults(calculationResult);
      message.success('计算完成');
      
    } catch (error) {
      console.error('计算错误:', error);
      message.error('计算出错：' + error.message);
    }
  };

  // 生成PDF的函数
  const handleDownloadPDF = async () => {
    try {
      message.loading({ content: '正在生成PDF...', key: 'pdfLoading' });
      
      // 创建一个临时容器来渲染结果，以便于捕获完整的内容
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '1000px'; // 固定宽度，模拟桌面视图
      document.body.appendChild(tempContainer);
      
      // 克隆结果卡片内容
      const resultClone = resultCardRef.current.cloneNode(true);
      resultClone.style.padding = '20px';
      resultClone.style.background = 'white';
      resultClone.style.boxShadow = 'none';
      resultClone.style.width = '100%';
      tempContainer.appendChild(resultClone);
      
      // 如果有SVG图，也克隆它
      if (planCardRef.current) {
        const planClone = planCardRef.current.cloneNode(true);
        planClone.style.padding = '20px';
        planClone.style.background = 'white';
        planClone.style.boxShadow = 'none';
        planClone.style.width = '100%';
        tempContainer.appendChild(planClone);
      }
      
      // 使用html2canvas捕获临时容器内容
      const canvas = await html2canvas(tempContainer, {
        scale: 2, // 提高清晰度
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      // 移除临时容器
      document.body.removeChild(tempContainer);
      
      // 创建PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // 计算PDF页面尺寸和图像尺寸
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;
      
      // 添加图像到PDF
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      // 添加页脚
      const today = new Date();
      const dateStr = today.toLocaleDateString();
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`生成日期: ${dateStr}`, 10, pdfHeight - 10);
      
      // 保存PDF
      const pileNo = form.getFieldValue('pileNo') || '未命名';
      pdf.save(`桩计算结果_${pileNo}_${dateStr.replace(/\//g, '-')}.pdf`);
      
      message.success({ content: 'PDF生成成功', key: 'pdfLoading' });
    } catch (error) {
      console.error('PDF生成错误:', error);
      message.error({ content: 'PDF生成失败', key: 'pdfLoading' });
    }
  };

  const renderSimpleForm = () => (
    <Form
      form={form}
      onFinish={onFinish}
      layout="vertical"
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item
            label="桩号 (Pile No.)"
            name="pileNo"
            rules={[{ required: true, message: '请输入桩号' }]}
          >
            <Input 
              placeholder="输入桩号" 
              inputMode="text"
            />
          </Form.Item>
        </Col>
      </Row>
      
      <Divider orientation="left">桩坐标 (Pile coor.)</Divider>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item
            label="桩E坐标"
            name="pileE"
            rules={[{ required: true, message: '请输入桩E坐标' }]}
          >
            <Input 
              placeholder="输入桩E坐标" 
              inputMode="decimal"
              type="text"
              pattern="[0-9]*[.,]?[0-9]*"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item
            label="桩N坐标"
            name="pileN"
            rules={[{ required: true, message: '请输入桩N坐标' }]}
          >
            <Input 
              placeholder="输入桩N坐标" 
              inputMode="decimal"
              type="text"
              pattern="[0-9]*[.,]?[0-9]*"
            />
          </Form.Item>
        </Col>
      </Row>
      
      <Divider orientation="left">方向设置</Divider>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item
            label="方向类型"
            name="directionType"
            initialValue={direction}
          >
            <Select onChange={handleDirectionChange}>
              <Option value="endPoint">结束点坐标</Option>
              <Option value="azimuth">方位角</Option>
              <Option value="north">正北方向</Option>
            </Select>
          </Form.Item>
        </Col>
        
        {direction === 'endPoint' && (
          <>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="终点E坐标"
                name="endE"
                rules={[{ required: true, message: '请输入终点E坐标' }]}
              >
                <Input 
                  placeholder="输入终点E坐标" 
                  inputMode="decimal"
                  type="text"
                  pattern="[0-9]*[.,]?[0-9]*"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="终点N坐标"
                name="endN"
                rules={[{ required: true, message: '请输入终点N坐标' }]}
              >
                <Input 
                  placeholder="输入终点N坐标" 
                  inputMode="decimal"
                  type="text"
                  pattern="[0-9]*[.,]?[0-9]*"
                />
              </Form.Item>
            </Col>
          </>
        )}
        
        {direction === 'azimuth' && (
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="方位角(°)"
              name="azimuth"
              rules={[{ required: true, message: '请输入方位角' }]}
            >
              <Input 
                placeholder="输入方位角 (ddd.mmss)" 
                inputMode="decimal"
                type="text"
                pattern="[0-9]*[.,]?[0-9]*"
              />
            </Form.Item>
          </Col>
        )}
      </Row>
      
      <Divider orientation="left">放样点 (Setting out point)</Divider>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item
            label="放样点E坐标"
            name="settingE"
            rules={[{ required: true, message: '请输入放样点E坐标' }]}
          >
            <Input 
              placeholder="输入放样点E坐标" 
              inputMode="decimal"
              type="text"
              pattern="[0-9]*[.,]?[0-9]*"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item
            label="放样点N坐标"
            name="settingN"
            rules={[{ required: true, message: '请输入放样点N坐标' }]}
          >
            <Input 
              placeholder="输入放样点N坐标" 
              inputMode="decimal"
              type="text"
              pattern="[0-9]*[.,]?[0-9]*"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item
            label="放样点地面高程"
            name="settingH"
          >
            <Input 
              placeholder="输入放样点地面高程" 
              inputMode="text"
            />
          </Form.Item>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              计算
            </Button>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item>
            <Button onClick={() => form.resetFields()} block>
              重置
            </Button>
          </Form.Item>
        </Col>
        {Object.keys(calculationResults).length > 0 && (
          <Col xs={24} sm={12} md={8}>
            <Form.Item>
              <Button 
                type="default" 
                onClick={handleDownloadPDF} 
                icon={<DownloadOutlined />}
                block
              >
                下载PDF
              </Button>
            </Form.Item>
          </Col>
        )}
      </Row>
    </Form>
  );

  const renderProfessionalForm = () => (
    <Form
      form={form}
      onFinish={onFinish}
      layout="vertical"
    >
      <Divider orientation="left">项目信息</Divider>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Job title"
            name="jobTitle"
          >
            <Input 
              placeholder="输入Job title" 
              inputMode="text"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Job No."
            name="jobNo"
          >
            <Input 
              placeholder="输入Job No." 
              inputMode="text"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Form No."
            name="formNo"
          >
            <Input 
              placeholder="输入Form No." 
              inputMode="text"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Pile No."
            name="pileNo"
            rules={[{ required: true, message: '请输入桩号' }]}
          >
            <Input 
              placeholder="输入桩号" 
              inputMode="text"
            />
          </Form.Item>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Surveyed by"
            name="surveyedBy"
          >
            <Input 
              placeholder="输入Surveyed by" 
              inputMode="text"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Instrument"
            name="instrument"
          >
            <Input 
              placeholder="输入Instrument" 
              inputMode="text"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Survey Date"
            name="surveyDate"
          >
            <Input type="date" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="S/N:"
            name="serialNumber"
          >
            <Input 
              placeholder="输入序列号" 
              inputMode="text"
            />
          </Form.Item>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Survey Job:"
            name="surveyJob"
          >
            <Input 
              placeholder="输入Survey Job" 
              inputMode="text"
            />
          </Form.Item>
        </Col>
      </Row>
      
      <Divider orientation="left">桩信息</Divider>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Pile Diameter (mm)"
            name="pileDiameter"
          >
            <Input 
              placeholder="输入桩直径" 
              inputMode="decimal"
              type="text"
              pattern="[0-9]*[.,]?[0-9]*"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Pile Type"
            name="pileType"
          >
            <Input 
              placeholder="输入桩类型" 
              inputMode="text"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Easting (m)"
            name="pileE"
            rules={[{ required: true, message: '请输入桩E坐标' }]}
          >
            <Input 
              placeholder="输入桩E坐标" 
              inputMode="decimal"
              type="text"
              pattern="[0-9]*[.,]?[0-9]*"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Northing (m)"
            name="pileN"
            rules={[{ required: true, message: '请输入桩N坐标' }]}
          >
            <Input 
              placeholder="输入桩N坐标" 
              inputMode="decimal"
              type="text"
              pattern="[0-9]*[.,]?[0-9]*"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item
            label="桩切断面高程"
            name="pileZ"
            rules={[{ required: true, message: '请输入桩切断面高程' }]}
          >
            <Input 
              placeholder="输入桩切断面高程" 
              inputMode="text"
            />
          </Form.Item>
        </Col>
      </Row>
      
      <Divider orientation="left">Ref. Bearing 设置</Divider>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item
            label="Ref. Bearing 方式"
            name="directionType"
            initialValue={direction}
          >
            <Select onChange={handleDirectionChange}>
              <Option value="north">正北方向</Option>
              <Option value="azimuth">输入方位角</Option>
              <Option value="endPoint">输入终点坐标</Option>
            </Select>
          </Form.Item>
        </Col>
        
        {direction === 'endPoint' && (
          <>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="终点E坐标"
                name="endE"
                rules={[{ required: true, message: '请输入终点E坐标' }]}
              >
                <Input 
                  placeholder="输入终点E坐标" 
                  inputMode="decimal"
                  type="text"
                  pattern="[0-9]*[.,]?[0-9]*"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="终点N坐标"
                name="endN"
                rules={[{ required: true, message: '请输入终点N坐标' }]}
              >
                <Input 
                  placeholder="输入终点N坐标" 
                  inputMode="decimal"
                  type="text"
                  pattern="[0-9]*[.,]?[0-9]*"
                />
              </Form.Item>
            </Col>
          </>
        )}
        
        {direction === 'azimuth' && (
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="方位角(DD.MMSS)"
              name="azimuth"
              rules={[{ required: true, message: '请输入方位角' }]}
            >
              <Input 
                placeholder="输入方位角(例如: 045.3030)" 
                inputMode="decimal"
                type="text"
                pattern="[0-9]*[.,]?[0-9]*"
              />
            </Form.Item>
          </Col>
        )}
      </Row>
      
      <Divider orientation="left">Setting out point</Divider>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={24}>
          <Card title="Station Point" size="small">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={4}>
                <Form.Item
                  label="ID"
                  name="stationId"
                  rules={[{ required: true, message: '请输入站点ID' }]}
                >
                  <Input 
                    placeholder="输入站点ID" 
                    inputMode="text"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={5}>
                <Form.Item
                  label="E坐标"
                  name="stationE"
                  rules={[{ required: true, message: '请输入E坐标' }]}
                >
                  <Input 
                    placeholder="输入E坐标" 
                    inputMode="decimal"
                    type="text"
                    pattern="[0-9]*[.,]?[0-9]*"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={5}>
                <Form.Item
                  label="N坐标"
                  name="stationN"
                  rules={[{ required: true, message: '请输入N坐标' }]}
                >
                  <Input 
                    placeholder="输入N坐标" 
                    inputMode="decimal"
                    type="text"
                    pattern="[0-9]*[.,]?[0-9]*"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={5}>
                <Form.Item
                  label="高程"
                  name="stationH"
                  rules={[{ required: true, message: '请输入高程' }]}
                >
                  <Input 
                    placeholder="输入高程" 
                    inputMode="text"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={5}>
                <Form.Item
                  label="仪器高"
                  name="instrumentHeight"
                  rules={[{ required: true, message: '请输入仪器高' }]}
                >
                  <Input 
                    placeholder="输入仪器高" 
                    inputMode="decimal"
                    type="text"
                    pattern="[0-9]*[.,]?[0-9]*"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col xs={24} sm={24}>
          <Card title="Back sight Point" size="small">
            <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>点1 (必填):</div>
            
            <div style={{ marginBottom: '8px', paddingLeft: '8px' }}>控制点坐标:</div>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={5}>
                <Form.Item
                  label="ID"
                  name="backsightId1"
                  rules={[{ required: true, message: '请输入后视点1 ID' }]}
                >
                  <Input 
                    placeholder="输入后视点ID" 
                    inputMode="text"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={5}>
                <Form.Item
                  label="后视点E坐标"
                  name="backsightE1"
                  rules={[{ required: true, message: '请输入后视点E坐标' }]}
                >
                  <Input 
                    placeholder="输入E坐标" 
                    inputMode="decimal"
                    type="text"
                    pattern="[0-9]*[.,]?[0-9]*"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={5}>
                <Form.Item
                  label="后视点N坐标"
                  name="backsightN1"
                  rules={[{ required: true, message: '请输入后视点N坐标' }]}
                >
                  <Input 
                    placeholder="输入N坐标" 
                    inputMode="decimal"
                    type="text"
                    pattern="[0-9]*[.,]?[0-9]*"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={5}>
                <Form.Item
                  label="后视点高程"
                  name="backsightH1"
                  rules={[{ required: true, message: '请输入后视点高程' }]}
                >
                  <Input 
                    placeholder="输入H高程" 
                    inputMode="text"
                  />
                </Form.Item>
              </Col>
            </Row>
            
            <div style={{ marginBottom: '8px', paddingLeft: '8px', marginTop: '16px' }}>观测数据:</div>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={5}>
                <Form.Item
                  label="ID"
                  name="obsId1"
                  rules={[{ required: true, message: '请输入观测ID' }]}
                >
                  <Input 
                    placeholder="输入观测ID" 
                    inputMode="text"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={5}>
                <Form.Item
                  label="BRE"
                  name="obsBRE1"
                  rules={[{ required: true, message: '请输入BRE' }]}
                >
                  <Input 
                    placeholder="输入BRE" 
                    inputMode="decimal"
                    type="text"
                    pattern="[0-9]*[.,]?[0-9]*"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={5}>
                <Form.Item
                  label="VA"
                  name="obsVA1"
                  rules={[{ required: true, message: '请输入VA' }]}
                >
                  <Input 
                    placeholder="输入VA" 
                    inputMode="decimal"
                    type="text"
                    pattern="[0-9]*[.,]?[0-9]*"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={5}>
                <Form.Item
                  label="SD"
                  name="obsSD1"
                  rules={[{ required: true, message: '请输入SD' }]}
                >
                  <Input 
                    placeholder="输入SD" 
                    inputMode="decimal"
                    type="text"
                    pattern="[0-9]*[.,]?[0-9]*"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={4}>
                <Form.Item
                  label="P.H"
                  name="obsPH1"
                  rules={[{ required: true, message: '请输入P.H' }]}
                >
                  <Input 
                    placeholder="输入P.H" 
                    inputMode="decimal"
                    type="text"
                    pattern="[0-9]*[.,]?[0-9]*"
                  />
                </Form.Item>
              </Col>
            </Row>
            
            <div style={{ marginBottom: '10px', marginTop: '20px', fontWeight: 'bold' }}>点2 (选填):</div>
            
            <div style={{ marginBottom: '8px', paddingLeft: '8px' }}>控制点坐标:</div>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={5}>
                <Form.Item
                  label="ID"
                  name="backsightId2"
                >
                  <Input 
                    placeholder="输入后视点ID" 
                    inputMode="text"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={5}>
                <Form.Item
                  label="后视点E坐标"
                  name="backsightE2"
                >
                  <Input 
                    placeholder="输入E坐标" 
                    inputMode="decimal"
                    type="text"
                    pattern="[0-9]*[.,]?[0-9]*"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={5}>
                <Form.Item
                  label="后视点N坐标"
                  name="backsightN2"
                >
                  <Input 
                    placeholder="输入N坐标" 
                    inputMode="decimal"
                    type="text"
                    pattern="[0-9]*[.,]?[0-9]*"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={5}>
                <Form.Item
                  label="后视点高程"
                  name="backsightH2"
                >
                  <Input 
                    placeholder="输入H高程" 
                    inputMode="text"
                  />
                </Form.Item>
              </Col>
            </Row>
            
            <div style={{ marginBottom: '8px', paddingLeft: '8px', marginTop: '16px' }}>观测数据:</div>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={5}>
                <Form.Item
                  label="ID"
                  name="obsId2"
                >
                  <Input 
                    placeholder="输入观测ID" 
                    inputMode="text"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={5}>
                <Form.Item
                  label="BRE"
                  name="obsBRE2"
                >
                  <Input 
                    placeholder="输入BRE" 
                    inputMode="decimal"
                    type="text"
                    pattern="[0-9]*[.,]?[0-9]*"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={5}>
                <Form.Item
                  label="VA"
                  name="obsVA2"
                >
                  <Input 
                    placeholder="输入VA" 
                    inputMode="decimal"
                    type="text"
                    pattern="[0-9]*[.,]?[0-9]*"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={5}>
                <Form.Item
                  label="SD"
                  name="obsSD2"
                >
                  <Input 
                    placeholder="输入SD" 
                    inputMode="decimal"
                    type="text"
                    pattern="[0-9]*[.,]?[0-9]*"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={4}>
                <Form.Item
                  label="P.H"
                  name="obsPH2"
                >
                  <Input 
                    placeholder="输入P.H" 
                    inputMode="decimal"
                    type="text"
                    pattern="[0-9]*[.,]?[0-9]*"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col xs={24} sm={24}>
          <Card title="Setting out data" size="small">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  label="BRE"
                  name="settingBRE"
                  rules={[{ required: true, message: '请输入BRE' }]}
                >
                  <Input 
                    placeholder="输入BRE" 
                    inputMode="decimal"
                    type="text"
                    pattern="[0-9]*[.,]?[0-9]*"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  label="VA"
                  name="settingVA"
                  rules={[{ required: true, message: '请输入VA' }]}
                >
                  <Input 
                    placeholder="输入VA" 
                    inputMode="decimal"
                    type="text"
                    pattern="[0-9]*[.,]?[0-9]*"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  label="SD"
                  name="settingSD"
                  rules={[{ required: true, message: '请输入SD' }]}
                >
                  <Input 
                    placeholder="输入SD" 
                    inputMode="decimal"
                    type="text"
                    pattern="[0-9]*[.,]?[0-9]*"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  label="P.H"
                  name="settingPH"
                  rules={[{ required: true, message: '请输入P.H' }]}
                >
                  <Input 
                    placeholder="输入P.H" 
                    inputMode="decimal"
                    type="text"
                    pattern="[0-9]*[.,]?[0-9]*"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col xs={24} sm={8} md={8}>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              计算
            </Button>
          </Form.Item>
        </Col>
        <Col xs={24} sm={8} md={8}>
          <Form.Item>
            <Button 
              onClick={() => {
                form.resetFields();
                setCalculationResults({});
                setSvgPath('');
              }} 
              block
            >
              重置
            </Button>
          </Form.Item>
        </Col>
        {Object.keys(calculationResults).length > 0 && (
          <Col xs={24} sm={8} md={8}>
            <Form.Item>
              <Button 
                type="default" 
                onClick={handleDownloadPDF} 
                icon={<DownloadOutlined />}
                block
              >
                下载PDF
              </Button>
            </Form.Item>
          </Col>
        )}
      </Row>
    </Form>
  );

  const columns = [
    {
      title: '项目',
      dataIndex: 'item',
      key: 'item',
    },
    {
      title: '数值',
      dataIndex: 'value',
      key: 'value',
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
    },
  ];

  const renderCalculationResults = () => {
    if (mode === 'simple') {
      return (
        <div className={styles.resultContent}>
          <div style={{ marginBottom: '10px' }}>
            <span style={{ fontWeight: 'bold' }}>Pile No.: </span>
            <span>{calculationResults.pileNo || '-'}</span>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <span style={{ fontWeight: 'bold' }}>G.L: </span>
            <span>{typeof calculationResults.settingGL === 'number' ? calculationResults.settingGL.toFixed(3) : '-'}</span>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <span style={{ fontWeight: 'bold' }}>Ref. Bearing: </span>
            <span>{direction === 'azimuth' ? calculationResults.azimuth : 
                  direction === 'north' ? '000.0000' : 
                  calculationResults.refBearing || '-'}</span>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <span style={{ fontWeight: 'bold' }}>Pile coor.: </span>
            <span>E: {typeof calculationResults.pileE === 'number' ? calculationResults.pileE.toFixed(3) : '-'}</span>
            <span style={{ marginLeft: '20px' }}>N: {typeof calculationResults.pileN === 'number' ? calculationResults.pileN.toFixed(3) : '-'}</span>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <span style={{ fontWeight: 'bold' }}>Setting out point: </span>
            <span>E: {typeof calculationResults.settingE === 'number' ? calculationResults.settingE.toFixed(3) : '-'}</span>
            <span style={{ marginLeft: '20px' }}>N: {typeof calculationResults.settingN === 'number' ? calculationResults.settingN.toFixed(3) : '-'}</span>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <span style={{ fontWeight: 'bold' }}>Difference (mm): </span>
            <span>E: {typeof calculationResults.diffE === 'number' ? calculationResults.diffE.toFixed(0) : '-'}</span>
            <span style={{ marginLeft: '20px' }}>N: {typeof calculationResults.diffN === 'number' ? calculationResults.diffN.toFixed(0) : '-'}</span>
            <span style={{ marginLeft: '20px' }}>Resultant: {typeof calculationResults.resultantMm === 'number' ? calculationResults.resultantMm.toFixed(0) : '-'}</span>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <span style={{ fontWeight: 'bold' }}>Shift (mm): </span>
            <span>O/S: {typeof calculationResults.offsetDistance === 'number' ? (calculationResults.offsetDistance * 1000).toFixed(0) : '-'}</span>
            <span style={{ marginLeft: '20px' }}>C/H: {typeof calculationResults.chordDistance === 'number' ? (calculationResults.chordDistance * 1000).toFixed(0) : '-'}</span>
            <span style={{ marginLeft: '20px' }}>Resultant: {
              typeof calculationResults.offsetDistance === 'number' && typeof calculationResults.chordDistance === 'number' 
                ? (Math.sqrt(Math.pow(calculationResults.offsetDistance * 1000, 2) + Math.pow(calculationResults.chordDistance * 1000, 2))).toFixed(0) 
                : '-'
            }</span>
          </div>
        </div>
      );
    } else {
      return (
        <div className={styles.resultsContainer}>
          <div className={styles.resultSection}>
            <div className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '20px', fontSize: '16px', fontWeight: 'bold' }}>
              CALCULATION RESULT
            </div>
            
            {/* Job Data Section */}
            <div className={styles.jobDataSection}>
              <div style={{ borderBottom: '1px solid #000', marginBottom: '10px', paddingBottom: '5px' }}>
                <span style={{ fontWeight: 'bold' }}>Job Data</span>
                <div style={{ float: 'right' }}>
                  {new Date().toLocaleDateString()}
                </div>
              </div>

              {/* Job Data 内容 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                <div>
                  <span style={{ fontWeight: 'bold' }}>Job Title: </span>
                  <span>{calculationResults.jobTitle || '-'}</span>
                </div>
                <div>
                  <span style={{ fontWeight: 'bold' }}>Job No.: </span>
                  <span>{calculationResults.jobNo || '-'}</span>
                </div>
                <div>
                  <span style={{ fontWeight: 'bold' }}>Form No.: </span>
                  <span>{calculationResults.formNo || '-'}</span>
                </div>
                <div>
                  <span style={{ fontWeight: 'bold' }}>Survey Job: </span>
                  <span>{calculationResults.surveyJob || '-'}</span>
                </div>
                <div>
                  <span style={{ fontWeight: 'bold' }}>Surveyed by: </span>
                  <span>{calculationResults.surveyedBy || '-'}</span>
                </div>
                <div>
                  <span style={{ fontWeight: 'bold' }}>Instrument: </span>
                  <span>{calculationResults.instrument || '-'}</span>
                </div>
                <div>
                  <span style={{ fontWeight: 'bold' }}>Survey Date: </span>
                  <span>{calculationResults.surveyDate || '-'}</span>
                </div>
                <div>
                  <span style={{ fontWeight: 'bold' }}>S/N: </span>
                  <span>{calculationResults.serialNumber || '-'}</span>
                </div>
              </div>

              {/* 添加一条分隔线 */}
              <div style={{ borderBottom: '1px solid #000', margin: '20px 0' }}></div>

              {/* Pile Data Section */}
              <div className={styles.pileDataSection}>
                <div style={{ borderBottom: '1px solid #000', marginBottom: '10px', paddingBottom: '5px' }}>
                  <span style={{ fontWeight: 'bold' }}>Pile Data</span>
                </div>
                
                {/* 第一行：基本信息 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                  <div>
                    <span style={{ fontWeight: 'bold' }}>Pile No.: </span>
                    <span>{calculationResults.pileNo || '-'}</span>
                  </div>
                  <div>
                    <span style={{ fontWeight: 'bold' }}>Pile Diameter (mm): </span>
                    <span>{calculationResults.pileDiameter || '-'}</span>
                  </div>
                  <div>
                    <span style={{ fontWeight: 'bold' }}>Pile Type: </span>
                    <span>{calculationResults.pileType || '-'}</span>
                  </div>
                  <div>
                    <span style={{ fontWeight: 'bold' }}>Ref. Bearing: </span>
                    <span>{mode === 'simple' ? 
                      (direction === 'azimuth' ? decimalToDMS(parseFloat(calculationResults.azimuth)) : 
                      direction === 'north' ? '000.0000' : 
                      calculationResults.refBearing) || '-' : 
                      (direction === 'azimuth' ? calculationResults.azimuth : 
                      direction === 'north' ? '000.0000' : 
                      calculationResults.refBearing) || '-'}</span>
                  </div>
                </div>
                
                {/* 坐标信息 */}
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ marginBottom: '10px', display: 'grid', gridTemplateColumns: '200px 120px 120px auto', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold' }}>Designed Coordinates: </span>
                    <span style={{ paddingLeft: '8px' }}>E: {calculationResults.pileE?.toFixed(3) || '-'}</span>
                    <span style={{ paddingLeft: '8px' }}>N: {calculationResults.pileN?.toFixed(3) || '-'}</span>
                    <span>Ref. Bearing (ddd.mmss): {calculationResults.refBearing || '-'}</span>
                  </div>
                  
                  <div style={{ marginBottom: '10px', display: 'grid', gridTemplateColumns: '200px 120px 120px auto', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold' }}>Checked Coordinates: </span>
                    <span style={{ paddingLeft: '8px' }}>E: {calculationResults.settingE?.toFixed(3) || '-'}</span>
                    <span style={{ paddingLeft: '8px' }}>N: {calculationResults.settingN?.toFixed(3) || '-'}</span>
                    <span>G.L: {calculationResults.settingH?.toFixed(3) || '-'}</span>
                  </div>
                  
                  <div style={{ marginBottom: '10px', display: 'grid', gridTemplateColumns: '200px 120px 120px auto', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold' }}>Difference (mm): </span>
                    <span style={{ paddingLeft: '8px' }}>E: {calculationResults.diffE?.toFixed(0) || '-'}</span>
                    <span style={{ paddingLeft: '8px' }}>N: {calculationResults.diffN?.toFixed(0) || '-'}</span>
                    <span>Resultant: {calculationResults.resultantMm?.toFixed(0) || '-'}</span>
                  </div>

                  <div style={{ marginBottom: '10px', display: 'grid', gridTemplateColumns: '200px 120px 120px auto', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold' }}>Shift (mm): </span>
                    <span style={{ paddingLeft: '8px' }}>O/S: {(() => {
                      // 获取设计坐标和检测坐标
                      const pileE = calculationResults.pileE;
                      const pileN = calculationResults.pileN;
                      const settingE = calculationResults.settingE;
                      const settingN = calculationResults.settingN;
                      
                      // 获取参考方位角（转换为十进制度）
                      let refBearing;
                      if (mode === 'simple') {
                        if (direction === 'azimuth') {
                          refBearing = DMSToDecimal(parseFloat(calculationResults.azimuth));
                        } else if (direction === 'north') {
                          refBearing = 0;
                        } else {
                          refBearing = DMSToDecimal(parseFloat(calculationResults.refBearing));
                        }
                      } else {
                        if (direction === 'azimuth') {
                          refBearing = DMSToDecimal(parseFloat(calculationResults.azimuth));
                        } else if (direction === 'north') {
                          refBearing = 0;
                        } else {
                          refBearing = DMSToDecimal(parseFloat(calculationResults.refBearing));
                        }
                      }
                      
                      // 计算坐标差值
                      const dx = settingE - pileE;
                      const dy = settingN - pileN;
                      
                      // 转换为弧度
                      const radBearing = refBearing * Math.PI / 180;
                      
                      // 计算垂距（O/S）- 转换为毫米
                      const offsetDistance = (dx * Math.cos(radBearing) - dy * Math.sin(radBearing)) * 1000;
                      
                      return offsetDistance.toFixed(0);
                    })() || '-'}</span>
                    <span style={{ paddingLeft: '8px' }}>C/H: {(() => {
                      // 获取设计坐标和检测坐标
                      const pileE = calculationResults.pileE;
                      const pileN = calculationResults.pileN;
                      const settingE = calculationResults.settingE;
                      const settingN = calculationResults.settingN;
                      
                      // 获取参考方位角（转换为十进制度）
                      let refBearing;
                      if (mode === 'simple') {
                        if (direction === 'azimuth') {
                          refBearing = DMSToDecimal(parseFloat(calculationResults.azimuth));
                        } else if (direction === 'north') {
                          refBearing = 0;
                        } else {
                          refBearing = DMSToDecimal(parseFloat(calculationResults.refBearing));
                        }
                      } else {
                        if (direction === 'azimuth') {
                          refBearing = DMSToDecimal(parseFloat(calculationResults.azimuth));
                        } else if (direction === 'north') {
                          refBearing = 0;
                        } else {
                          refBearing = DMSToDecimal(parseFloat(calculationResults.refBearing));
                        }
                      }
                      
                      // 计算坐标差值
                      const dx = settingE - pileE;
                      const dy = settingN - pileN;
                      
                      // 转换为弧度
                      const radBearing = refBearing * Math.PI / 180;
                      
                      // 计算切距（C/H）- 转换为毫米
                      const chordDistance = (dx * Math.sin(radBearing) + dy * Math.cos(radBearing)) * 1000;
                      
                      return chordDistance.toFixed(0);
                    })() || '-'}</span>
                    <span>Resultant: {(() => {
                      // 获取设计坐标和检测坐标
                      const pileE = calculationResults.pileE;
                      const pileN = calculationResults.pileN;
                      const settingE = calculationResults.settingE;
                      const settingN = calculationResults.settingN;
                      
                      // 计算总位移（毫米）
                      const dx = (settingE - pileE) * 1000;
                      const dy = (settingN - pileN) * 1000;
                      const resultant = Math.sqrt(dx * dx + dy * dy);
                      
                      return resultant.toFixed(0);
                    })() || '-'}</span>
                  </div>
                  
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                    (根据放样数据计算: BRE: {calculationResults.settingBRE || '-'}°, 
                    VA: {calculationResults.settingVA || '-'}°, 
                    SD: {calculationResults.settingSD || '-'}m)
                  </div>
                </div>
              </div>
              
              {/* 添加一条分隔线 */}
              <div style={{ borderBottom: '1px solid #000', margin: '20px 0' }}></div>
              
              {/* Setting Out Section */}
              <div className={styles.settingOutSection}>
                <div style={{ borderBottom: '1px solid #000', marginBottom: '10px', paddingBottom: '5px' }}>
                  <span style={{ fontWeight: 'bold' }}>Setting Out</span>
                </div>
                
                {/* Station Data */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr', gap: '10px', alignItems: 'center' }}>
                    <div></div>
                    <div>E</div>
                    <div>N</div>
                    <div>H</div>
                    <div>IH</div>
                    <div>HI(H+IH)</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr', gap: '10px', alignItems: 'center' }}>
                    <div>Station</div>
                    <div>{calculationResults.stationE?.toFixed(3) || '-'}</div>
                    <div>{calculationResults.stationN?.toFixed(3) || '-'}</div>
                    <div>{calculationResults.stationH?.toFixed(3) || '-'}</div>
                    <div>{calculationResults.instrumentHeight?.toFixed(3) || '-'}</div>
                    <div>{(calculationResults.stationH + calculationResults.instrumentHeight)?.toFixed(3) || '-'}</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
                    <div>Back sight Point 1</div>
                    <div>{calculationResults.backsightE1?.toFixed(3) || '-'}</div>
                    <div>{calculationResults.backsightN1?.toFixed(3) || '-'}</div>
                    <div>{calculationResults.backsightH1?.toFixed(3) || '-'}</div>
                    <div>-</div>
                    <div>-</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr', gap: '10px', alignItems: 'center' }}>
                    <div>Back sight Point 2</div>
                    <div>{calculationResults.backsightE2?.toFixed(3) || '-'}</div>
                    <div>{calculationResults.backsightN2?.toFixed(3) || '-'}</div>
                    <div>{calculationResults.backsightH2?.toFixed(3) || '-'}</div>
                    <div>-</div>
                    <div>-</div>
                  </div>
                </div>
                
                {/* Back sight Points */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 2fr', gap: '10px', alignItems: 'center' }}>
                    <div>Back sight Point 1</div>
                    <div>BRE</div>
                    <div>VA</div>
                    <div>SD</div>
                    <div>PH</div>
                    <div>True Brg.</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 2fr', gap: '10px', alignItems: 'center' }}>
                    <div>{calculationResults.backsightId1 ? calculationResults.backsightId1.replace('2', '') : '-'}</div>
                    <div>{calculationResults.obsBRE1?.toFixed(4) || '-'}</div>
                    <div>{calculationResults.obsVA1?.toFixed(4) || '-'}</div>
                    <div>{calculationResults.obsSD1?.toFixed(3) || '-'}</div>
                    <div>{calculationResults.obsPH1?.toFixed(3) || '-'}</div>
                    <div>{calculationResults.trueBearing1 || '-'}</div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 2fr', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
                    <div>Back sight Point 2</div>
                    <div>BRE</div>
                    <div>VA</div>
                    <div>SD</div>
                    <div>PH</div>
                    <div>True Brg.</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 2fr', gap: '10px', alignItems: 'center' }}>
                    <div>{calculationResults.backsightId2 || '-'}</div>
                    <div>{calculationResults.obsBRE2?.toFixed(4) || '-'}</div>
                    <div>{calculationResults.obsVA2?.toFixed(4) || '-'}</div>
                    <div>{calculationResults.obsSD2?.toFixed(3) || '-'}</div>
                    <div>{calculationResults.obsPH2?.toFixed(3) || '-'}</div>
                    <div>{calculationResults.trueBearing2 || '-'}</div>
                  </div>
                </div>
                
                {/* Angle Difference */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontWeight: 'bold' }}>
                    Ang. Diff. = {calculationResults.angleDifference || '-'}
                  </div>
                </div>
                
                {/* Setting Out Point */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 2fr', gap: '10px', alignItems: 'center' }}>
                    <div>Setting Out Point</div>
                    <div>BRE</div>
                    <div>VA</div>
                    <div>SD</div>
                    <div>PH</div>
                    <div></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 2fr', gap: '10px', alignItems: 'center' }}>
                    <div>{calculationResults.pileNo || '-'}</div>
                    <div>{calculationResults.settingBRE?.toFixed(4) || '-'}</div>
                    <div>{calculationResults.settingVA?.toFixed(4) || '-'}</div>
                    <div>{calculationResults.settingSD?.toFixed(3) || '-'}</div>
                    <div>{calculationResults.settingPH?.toFixed(3) || '-'}</div>
                    <div></div>
                  </div>
                </div>
              </div>
              
              {/* 添加一条分隔线 */}
              <div style={{ borderBottom: '1px solid #000', margin: '20px 0' }}></div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <Tabs defaultActiveKey={mode} className={styles.tabs}>
          <TabPane tab="简单模式" key="simple">
            {renderSimpleForm()}
          </TabPane>
          <TabPane tab="专业模式" key="professional">
            {renderProfessionalForm()}
          </TabPane>
        </Tabs>
        
        {Object.keys(calculationResults).length > 0 && (
          <>
            <div 
              className={styles.resultSection}
              style={{ marginTop: 16 }}
              ref={resultCardRef}
            >
              {renderCalculationResults()}
            </div>
            
            {svgPath && (
              <div 
                className={styles.svgSection}
                style={{ marginTop: 16 }}
                ref={planCardRef}
              >
                <div className={styles.svgContainer} dangerouslySetInnerHTML={{ __html: svgPath }}></div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PileLayout; 