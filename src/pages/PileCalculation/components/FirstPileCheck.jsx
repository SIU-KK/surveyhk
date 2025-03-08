import React, { useState, useRef } from 'react';
import { Card, Form, Input, Button, Row, Col, message, Typography, Divider, Table } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import styles from './ComponentStyles.module.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const { Link } = Typography;

// 将DD.MMSS格式转换为十进制度
const DMSToDecimal = (dms) => {
  if (!dms) return 0;
  
  const dmsStr = dms.toString();
  const dotIndex = dmsStr.indexOf('.');
  
  if (dotIndex === -1) {
    return parseFloat(dmsStr);
  }
  
  const degrees = parseInt(dmsStr.substring(0, dotIndex));
  const minutesSeconds = dmsStr.substring(dotIndex + 1);
  
  // 确保分秒部分有4位数字
  const paddedMS = minutesSeconds.padEnd(4, '0');
  
  const minutes = parseInt(paddedMS.substring(0, 2));
  const seconds = parseInt(paddedMS.substring(2, 4));
  
  return degrees + minutes / 60 + seconds / 3600;
};

// 将十进制度转换为DD.MMSS格式
const decimalToDMS = (decimal) => {
  const degrees = Math.floor(decimal);
  const minutesDecimal = (decimal - degrees) * 60;
  const minutes = Math.floor(minutesDecimal);
  const seconds = Math.floor((minutesDecimal - minutes) * 60);
  
  return `${degrees.toString().padStart(3, '0')}.${minutes.toString().padStart(2, '0')}${seconds.toString().padStart(2, '0')}`;
};

// 计算方位角差值
const calculateAngleDifference = (angle1, angle2) => {
  const diff = (angle2 - angle1 + 360) % 360;
  return diff > 180 ? 360 - diff : diff;
};

const FirstPileCheck = () => {
  const [form] = Form.useForm();
  const [calculationResults, setCalculationResults] = useState({});
  const [svgPath, setSvgPath] = useState('');
  const resultCardRef = useRef(null);
  const planCardRef = useRef(null);

  const generatePileSvg = (topE, topN, bottomE, bottomN, cutOffE, cutOffN, pileE, pileN, refBearingDecimal, topOS, topCH, bottomOS, bottomCH, cutOffOS, cutOffCH) => {
    // 画布大小和中心点
    const svgWidth = 450;
    const svgHeight = 450;
    const centerX = svgWidth / 2;
    const centerY = svgHeight / 2;
    
    // 计算方位角的弧度值（确保有默认值）
    const refBearingRad = ((refBearingDecimal || 0) * Math.PI / 180);
    
    // 解析输入值
    const topOSNum = parseFloat(topOS) || 0;
    const topCHNum = parseFloat(topCH) || 0;
    const bottomOSNum = parseFloat(bottomOS) || 0;
    const bottomCHNum = parseFloat(bottomCH) || 0;
    const cutOffOSNum = parseFloat(cutOffOS) || 0;
    const cutOffCHNum = parseFloat(cutOffCH) || 0;
    
    // 找出最大偏移值
    const maxOffsetOS = Math.max(
      Math.abs(topOSNum),
      Math.abs(bottomOSNum),
      Math.abs(cutOffOSNum)
    );
    
    const maxOffsetCH = Math.max(
      Math.abs(topCHNum),
      Math.abs(bottomCHNum),
      Math.abs(cutOffCHNum)
    );
    
    const maxOffset = Math.max(maxOffsetOS, maxOffsetCH, 0.005); // 至少有最小值
    
    // 根据最大偏移值设置缩放比例
    let scaleFactor;
    if (maxOffset < 0.01) {
      scaleFactor = 10000; // 对于极小偏移，使用极大缩放
    } else if (maxOffset < 0.05) {
      scaleFactor = 5000;  // 对于很小偏移，使用大缩放
    } else if (maxOffset < 0.1) {
      scaleFactor = 2000;  // 对于小偏移，使用中等缩放
    } else if (maxOffset < 1.0) {
      scaleFactor = 500;   // 对于一般偏移，使用常规缩放
    } else {
      scaleFactor = 200;   // 对于大偏移，使用小缩放
    }
    
    // 根据最大偏移值调整圆的大小，使其不会太大也不会太小
    let circleScale;
    if (maxOffset < 0.01) {
      circleScale = 0.3;  // 极小偏移，圆很小
    } else if (maxOffset < 0.05) {
      circleScale = 0.5;  // 很小偏移，圆较小
    } else if (maxOffset < 0.1) {
      circleScale = 0.7;  // 小偏移，圆中等
    } else if (maxOffset < 1.0) {
      circleScale = 1.0;  // 一般偏移，圆标准大小
    } else {
      circleScale = 1.2;  // 大偏移，圆较大
    }
    
    // 设计桩位固定在中心
    const pilePoint = { x: centerX, y: centerY };
    
    // 桩顶位置根据O/S和C/H值计算
    // O/S: 负向左，正向右
    // C/H: 正向上，负向下
    const topPoint = { 
      x: centerX + topOSNum * scaleFactor,
      y: centerY - topCHNum * scaleFactor  // 减号是因为SVG坐标系Y轴向下
    };
    
    // 桩底位置
    const bottomPoint = { 
      x: centerX + bottomOSNum * scaleFactor,
      y: centerY - bottomCHNum * scaleFactor
    };
    
    // 切断面位置
    const cutOffPoint = { 
      x: centerX + cutOffOSNum * scaleFactor,
      y: centerY - cutOffCHNum * scaleFactor
    };
    
    // 确定坐标轴的范围，确保能够显示所有点
    // 根据缩放后的最大点位计算需要的坐标轴长度
    const scaledMaxOffset = maxOffset * scaleFactor;
    const axisLength = Math.max(scaledMaxOffset * 1.5, 150); // 至少150像素长
    
    // 坐标轴 - 固定方向，CH向上，OS向右
    const osAxisStartX = centerX - axisLength;
    const osAxisStartY = centerY;
    const osAxisEndX = centerX + axisLength;
    const osAxisEndY = centerY;
    
    const chAxisStartX = centerX;
    const chAxisStartY = centerY + axisLength;
    const chAxisEndX = centerX;
    const chAxisEndY = centerY - axisLength;
    
    // 固定的圆半径 - 基于缩放和最大偏移调整
    const baseRadius = 100;  // 增加基础半径，原值为60
    const designCircleRadius = 150;  // 设计桩位圆
    const pileCircleRadius = 150;    // 桩顶/桩底圆
    
    // 计算北方位角箭头点位
    const northX = centerX + axisLength - 40;
    const northY = centerY - axisLength + 40;
    
    // 正北指向标记 - 逆时针旋转REF.BRG度
    const northArrowAngle = -refBearingRad; // 负号表示逆时针
    const northArrowX = northX;
    const northArrowY = northY;
    const northArrowEndX = northArrowX + Math.sin(northArrowAngle) * 30;
    const northArrowEndY = northArrowY - Math.cos(northArrowAngle) * 30;
    
    // 箭头三角形点 - 确保三角形指向线的方向
    const arrowSize = 8;
    // 计算箭头线的方向向量
    const arrowDirX = northArrowEndX - northArrowX;
    const arrowDirY = northArrowEndY - northArrowY;
    // 计算箭头线的角度（弧度）
    const arrowDir = Math.atan2(arrowDirY, arrowDirX);
    // 箭头点位于线的末端，并指向线的反方向
    const arrowPoint1X = northArrowEndX;
    const arrowPoint1Y = northArrowEndY;
    const arrowPoint2X = northArrowEndX - arrowSize * Math.cos(arrowDir - Math.PI/6);
    const arrowPoint2Y = northArrowEndY - arrowSize * Math.sin(arrowDir - Math.PI/6);
    const arrowPoint3X = northArrowEndX - arrowSize * Math.cos(arrowDir + Math.PI/6);
    const arrowPoint3Y = northArrowEndY - arrowSize * Math.sin(arrowDir + Math.PI/6);
    
    // 添加偏移范围标注，但改为显示桩号
    const pileNoText = `Pile No.: ${calculationResults?.pileNo || ''}`;
    
    // 确定是否显示坐标辅助线
    const showOffsetLines = true; // 总是显示偏移线
    
    // 画点和连线
    return `
      <svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
        <!-- 背景网格 -->
        <rect x="0" y="0" width="${svgWidth}" height="${svgHeight}" fill="#f9f9f9" />
        
        <!-- 桩号标签（替代原来的偏移范围提示） -->
        <text 
          x="${centerX}" 
          y="25" 
          text-anchor="middle" 
          fill="#555555" 
          font-size="14"
          font-weight="bold"
        >${pileNoText}</text>
        
        <!-- 坐标轴 - 固定方向 -->
        <!-- OS轴（水平） -->
        <line 
          x1="${osAxisStartX}" 
          y1="${osAxisStartY}" 
          x2="${osAxisEndX}" 
          y2="${osAxisEndY}" 
          stroke="#888888" 
          stroke-dasharray="3,3" 
          stroke-width="1" 
        />
        
        <!-- CH轴（垂直） -->
        <line 
          x1="${chAxisStartX}" 
          y1="${chAxisStartY}" 
          x2="${chAxisEndX}" 
          y2="${chAxisEndY}" 
          stroke="#888888" 
          stroke-dasharray="3,3" 
          stroke-width="1" 
        />
        
        <!-- 坐标轴标签 - 添加回CH和OS标签 -->
        <text 
          x="${osAxisEndX + 10}" 
          y="${osAxisEndY + 5}" 
          fill="#888888" 
          font-size="12"
        >OS</text>
        
        <text 
          x="${chAxisEndX + 5}" 
          y="${chAxisEndY + 10}" 
          fill="#888888" 
          font-size="12"
        >CH</text>
        
        <!-- 坐标轴刻度 -->
        <line x1="${centerX}" y1="${centerY - 5}" x2="${centerX}" y2="${centerY + 5}" stroke="#888888" stroke-width="2" />
        <line x1="${centerX - 5}" y1="${centerY}" x2="${centerX + 5}" y2="${centerY}" stroke="#888888" stroke-width="2" />
        <text x="${centerX - 5}" y="${centerY + 15}" text-anchor="middle" fill="#888888" font-size="10">(0,0)</text>
        
        <!-- 正北指向箭头 - 保留箭头但移除北偏角标签 -->
        <line 
          x1="${northArrowX}" 
          y1="${northArrowY}" 
          x2="${northArrowEndX}" 
          y2="${northArrowEndY}" 
          stroke="#FF0000" 
          stroke-width="2" 
        />
        <polygon 
          points="${arrowPoint1X},${arrowPoint1Y} ${arrowPoint2X},${arrowPoint2Y} ${arrowPoint3X},${arrowPoint3Y}" 
          fill="#FF0000" 
        />
        <text 
          x="${northArrowEndX - 15}" 
          y="${northArrowEndY - 10}" 
          fill="#FF0000" 
          font-size="12"
          font-weight="bold"
        >北</text>
        
        <!-- 设计桩位圆 - 放大 -->
        <circle 
          cx="${pilePoint.x}" 
          cy="${pilePoint.y}" 
          r="${designCircleRadius}" 
          fill="none" 
          stroke="red" 
          stroke-width="1.5"
          stroke-dasharray="5,3"
          opacity="0.7"
        />
        
        <!-- 桩顶圆 - 放大 -->
        <circle 
          cx="${topPoint.x}" 
          cy="${topPoint.y}" 
          r="${pileCircleRadius}" 
          fill="none" 
          stroke="blue" 
          stroke-width="1.5"
          opacity="0.7"
        />
        
        <!-- 桩底圆 - 放大 -->
        <circle 
          cx="${bottomPoint.x}" 
          cy="${bottomPoint.y}" 
          r="${pileCircleRadius}" 
          fill="none" 
          stroke="purple" 
          stroke-width="1.5"
          opacity="0.7"
        />
        
        <!-- 桩中心竖直线 -->
        <line 
          x1="${topPoint.x}" 
          y1="${topPoint.y}" 
          x2="${bottomPoint.x}" 
          y2="${bottomPoint.y}" 
          stroke="#444444" 
          stroke-width="2" 
        />
        
        <!-- 切断面水平线 -->
        <line 
          x1="${cutOffPoint.x - 30}" 
          y1="${cutOffPoint.y}" 
          x2="${cutOffPoint.x + 30}" 
          y2="${cutOffPoint.y}" 
          stroke="#00aa00" 
          stroke-width="2" 
          stroke-dasharray="5,3" 
        />
        
        <!-- 设计桩位点 -->
        <circle 
          cx="${pilePoint.x}" 
          cy="${pilePoint.y}" 
          r="6" 
          fill="red" 
        />
        
        <!-- 桩顶点 -->
        <circle 
          cx="${topPoint.x}" 
          cy="${topPoint.y}" 
          r="6" 
          fill="blue" 
        />
        
        <!-- 桩底点 -->
        <circle 
          cx="${bottomPoint.x}" 
          cy="${bottomPoint.y}" 
          r="6" 
          fill="purple" 
        />
        
        <!-- 切断面点 -->
        <circle 
          cx="${cutOffPoint.x}" 
          cy="${cutOffPoint.y}" 
          r="6" 
          fill="green" 
        />
        
        ${showOffsetLines ? `
        <!-- 桩顶偏移线 - 显示O/S和C/H，删除标签 -->
        <!-- O/S线 (水平) -->
        <line 
          x1="${centerX}" 
          y1="${topPoint.y}" 
          x2="${topPoint.x}" 
          y2="${topPoint.y}" 
          stroke="#00aa00" 
          stroke-width="1.5" 
          stroke-dasharray="5,3" 
        />
        <!-- C/H线 (垂直) -->
        <line 
          x1="${centerX}" 
          y1="${centerY}" 
          x2="${centerX}" 
          y2="${topPoint.y}" 
          stroke="#0000aa" 
          stroke-width="1.5" 
          stroke-dasharray="5,3" 
        />
        
        <!-- 桩顶到设计点的直线距离 -->
        <line 
          x1="${centerX}" 
          y1="${centerY}" 
          x2="${topPoint.x}" 
          y2="${topPoint.y}" 
          stroke="#ff6600" 
          stroke-width="1" 
          stroke-dasharray="2,2" 
        />
        ` : ''}
        
        <!-- 图例 - 修改标签文本 -->
        <rect x="10" y="10" width="180" height="120" fill="white" opacity="0.8" rx="5" />
        
        <circle cx="25" cy="30" r="6" fill="red" />
        <text x="40" y="34" fill="black" font-size="12" font-weight="bold">${calculationResults?.pileNo || 'PPA043'}</text>
        
        <circle cx="25" cy="55" r="6" fill="blue" />
        <text x="40" y="59" fill="black" font-size="12" font-weight="bold">Pile Top</text>
        
        <circle cx="25" cy="80" r="6" fill="purple" />
        <text x="40" y="84" fill="black" font-size="12" font-weight="bold">pile bottom</text>
        
        <circle cx="25" cy="105" r="6" fill="green" />
        <text x="40" y="109" fill="black" font-size="12" font-weight="bold">Cut-off</text>
      </svg>
    `;
  };
  
  const handleDownloadPDF = async () => {
    if (!calculationResults || Object.keys(calculationResults).length === 0) {
      message.error('无计算结果可下载');
      return;
    }
    
    message.loading({ content: '正在生成PDF...', key: 'pdfLoading' });
    
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // 设置字体和标题
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      
      // 计算标题和内容位置
      const titleMargin = 15; // 标题左边距
      const titleY1 = 15; // 第一部分标题位置
      
      // 添加第一部分标题和分隔线
      pdf.text('Cal. Result', titleMargin, titleY1);
      pdf.setLineWidth(0.5);
      pdf.line(titleMargin, titleY1 + 2, pdfWidth - titleMargin, titleY1 + 2);
      
      // 添加日期和桩号
      pdf.setFontSize(12);
      const currentDate = new Date().toISOString().split('T')[0];
      const pileNo = calculationResults.pileNo || 'Unknown';
      pdf.text(`Date: ${currentDate}`, pdfWidth - titleMargin, titleY1, { align: 'right' });
      pdf.text(`Pile No.: ${pileNo}`, pdfWidth - titleMargin, titleY1 + 8, { align: 'right' });
      
      // 捕获计算结果卡片
      let currentY = titleY1 + 10; // 从标题下方开始
      
      if (resultCardRef.current) {
        const resultCanvas = await html2canvas(resultCardRef.current, {
          scale: 2,
          useCORS: true,
          logging: false
        });
        
        const resultImgData = resultCanvas.toDataURL('image/png');
        const resultImgWidth = pdfWidth - 30;
        const resultImgHeight = (resultCanvas.height * resultImgWidth) / resultCanvas.width;
        
        pdf.addImage(resultImgData, 'PNG', 15, currentY, resultImgWidth, resultImgHeight);
        currentY += resultImgHeight + 20; // 更新Y坐标位置，留出20mm间距
      }
      
      // 添加第二部分标题(Ref. Plan)，确保它显示在正确位置
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text('Ref. Plan', titleMargin, currentY);
      pdf.setLineWidth(0.5);
      pdf.line(titleMargin, currentY + 2, pdfWidth - titleMargin, currentY + 2);
      
      // 捕获图表卡片，但不添加"桩检查示意图"标题
      if (planCardRef.current && svgPath) {
        const planCanvas = await html2canvas(planCardRef.current.querySelector('.' + styles.svgContainer), {
          scale: 2,
          useCORS: true,
          logging: false
        });
        
        const planImgData = planCanvas.toDataURL('image/png');
        const planImgWidth = pdfWidth - 30;
        const planImgHeight = (planCanvas.height * planImgWidth) / planCanvas.width;
        
        // 图表显示在Ref. Plan标题下方
        pdf.addImage(planImgData, 'PNG', 15, currentY + 10, planImgWidth, planImgHeight);
      }
      
      // 保存PDF
      pdf.save(`Pile_Check_${calculationResults.pileNo || 'Result'}.pdf`);
      message.success({ content: 'PDF生成成功!', key: 'pdfLoading' });
    } catch (error) {
      console.error('PDF生成错误:', error);
      message.error({ content: 'PDF生成失败，请重试!', key: 'pdfLoading' });
    }
  };

  const onFinish = (values) => {
    try {
      // 获取基本数据
      const { 
        stationE, stationN, 
        pileNo, pileE, pileN, pileCutOffLevel, pileDiameter, refBearing,
        topLeftBearing, topRightBearing, topHzDist, topRL,
        bottomLeftBearing, bottomRightBearing, bottomHzDist, bottomRL,
        ratioTolerance
      } = values;
      
      // 确保所有输入值为数字
      const stationENum = parseFloat(stationE);
      const stationNNum = parseFloat(stationN);
      const pileENum = parseFloat(pileE);
      const pileNNum = parseFloat(pileN);
      const pileCutOffLevelNum = parseFloat(pileCutOffLevel);
      const pileDiameterNum = parseFloat(pileDiameter);
      const topHzDistNum = parseFloat(topHzDist);
      const topRLNum = parseFloat(topRL);
      const bottomHzDistNum = parseFloat(bottomHzDist);
      const bottomRLNum = parseFloat(bottomRL);
      const ratioToleranceNum = parseFloat(ratioTolerance);
      
      console.log("Form values:", values); // 添加日志，查看表单值
      
      // 转换参考方位角为十进制度
      const refBearingDecimal = DMSToDecimal(refBearing);
      
      // 计算桩顶部的设置角度
      const topLeftBearingDecimal = DMSToDecimal(topLeftBearing);
      const topRightBearingDecimal = DMSToDecimal(topRightBearing);
      let topSetAngleDecimal = (topLeftBearingDecimal + topRightBearingDecimal) / 2;
      if (Math.abs(topRightBearingDecimal - topLeftBearingDecimal) > 180) {
        topSetAngleDecimal = (topSetAngleDecimal + 180) % 360;
      }
      const topSetAngle = decimalToDMS(topSetAngleDecimal);
      
      // 计算桩底部的设置角度
      const bottomLeftBearingDecimal = DMSToDecimal(bottomLeftBearing);
      const bottomRightBearingDecimal = DMSToDecimal(bottomRightBearing);
      let bottomSetAngleDecimal = (bottomLeftBearingDecimal + bottomRightBearingDecimal) / 2;
      if (Math.abs(bottomRightBearingDecimal - bottomLeftBearingDecimal) > 180) {
        bottomSetAngleDecimal = (bottomSetAngleDecimal + 180) % 360;
      }
      const bottomSetAngle = decimalToDMS(bottomSetAngleDecimal);
      
      // 按照新公式计算桩顶部
      // 1. 计算角度差 G = RightBearing - SetAngle
      const topG = topRightBearingDecimal - topSetAngleDecimal;
      const topGRad = topG * Math.PI / 180;
      
      // 2. 计算半径 D = (sin(G) * Hz_Dist) / (1 - sin(G))
      const topD = (Math.sin(topGRad) * topHzDistNum) / (1 - Math.sin(topGRad));
      const topRadius = Math.abs(topD); // 确保半径为正值
      const topDiameter = topRadius * 2;
      
      // 3. 计算中心点坐标
      // CL_East = sin(CL_HA) * (Hz_Dist + D) + East_0
      // CL_North = cos(CL_HA) * (Hz_Dist + D) + North_0
      const topSetAngleRad = topSetAngleDecimal * Math.PI / 180;
      const topE = Math.sin(topSetAngleRad) * (topHzDistNum + topD) + stationENum;
      const topN = Math.cos(topSetAngleRad) * (topHzDistNum + topD) + stationNNum;
      
      // 按照新公式计算桩底部
      // 1. 计算角度差 G = RightBearing - SetAngle
      const bottomG = bottomRightBearingDecimal - bottomSetAngleDecimal;
      const bottomGRad = bottomG * Math.PI / 180;
      
      // 2. 计算半径 D = (sin(G) * Hz_Dist) / (1 - sin(G))
      const bottomD = (Math.sin(bottomGRad) * bottomHzDistNum) / (1 - Math.sin(bottomGRad));
      const bottomRadius = Math.abs(bottomD); // 确保半径为正值
      const bottomDiameter = bottomRadius * 2;
      
      // 3. 计算中心点坐标
      // CL_East = sin(CL_HA) * (Hz_Dist + D) + East_0
      // CL_North = cos(CL_HA) * (Hz_Dist + D) + North_0
      const bottomSetAngleRad = bottomSetAngleDecimal * Math.PI / 180;
      const bottomE = Math.sin(bottomSetAngleRad) * (bottomHzDistNum + bottomD) + stationENum;
      const bottomN = Math.cos(bottomSetAngleRad) * (bottomHzDistNum + bottomD) + stationNNum;
      
      // 计算切断面坐标 - 使用桩顶中心到桩底中心的投射方位线
      // 1. 计算投射方位 - 从桩顶到桩底的向量
      const projectionVectorE = bottomE - topE;
      const projectionVectorN = bottomN - topN;
      const projectionLength = Math.sqrt(projectionVectorE * projectionVectorE + projectionVectorN * projectionVectorN);
      
      // 2. 计算投射方位角（用于记录）
      const projectionBearing = Math.atan2(projectionVectorE, projectionVectorN) * 180 / Math.PI;
      const formattedProjectionBearing = decimalToDMS(projectionBearing >= 0 ? projectionBearing : projectionBearing + 360);
      
      // 3. 计算高程差
      const elevationDiff = topRLNum - bottomRLNum;
      
      // 4. 计算Cut Off Level在投射线上的比例位置
      // 无论高程是否在范围内，都按照线性投射计算，不限制在0-1之间
      const cutOffProjectionRatio = (topRLNum - pileCutOffLevelNum) / (topRLNum - bottomRLNum);
      
      // 添加调试信息
      console.log("===== 调试信息 =====");
      console.log("桩顶坐标:", { E: topE, N: topN, RL: topRLNum });
      console.log("桩底坐标:", { E: bottomE, N: bottomN, RL: bottomRLNum });
      console.log("切断面高程:", pileCutOffLevelNum);
      console.log("高程差:", elevationDiff);
      console.log("投射比例:", cutOffProjectionRatio);
      
      // 5. 计算设计位置上的切断面点（理论位置，即设计桩位置上的切断面点）
      const designCutOffE = pileENum;
      const designCutOffN = pileNNum;
      
      // 6. 计算实际测量的桩顶到桩底的偏移向量
      const measuredTopToBottomVectorE = bottomE - topE;
      const measuredTopToBottomVectorN = bottomN - topN;
      
      // 7. 根据高程比例计算从桩顶到切断面的理论偏移量
      // 直接使用计算得到的比例，不进行范围限制
      const idealOffsetE = cutOffProjectionRatio * measuredTopToBottomVectorE;
      const idealOffsetN = cutOffProjectionRatio * measuredTopToBottomVectorN;
      
      // 8. 计算切断面实际坐标（桩顶坐标 + 投射偏移量）
      // 直接使用投射公式，不做边界检查
      const cutOffE = topE + idealOffsetE;
      const cutOffN = topN + idealOffsetN;
      
      console.log("桩顶到桩底向量:", { dE: measuredTopToBottomVectorE, dN: measuredTopToBottomVectorN });
      console.log("切断面偏移量:", { dE: idealOffsetE, dN: idealOffsetN });
      console.log("最终切断面坐标:", { E: cutOffE, N: cutOffN });
      
      // 9. 计算切断面相对于设计位置的偏移量
      const cutOffDeltaE = cutOffE - designCutOffE;
      const cutOffDeltaN = cutOffN - designCutOffN;
      const cutOffLinear = Math.sqrt(cutOffDeltaE * cutOffDeltaE + cutOffDeltaN * cutOffDeltaN);
      
      // 10. 使用与桩顶相同的半径
      const cutOffRadius = topRadius;
      const cutOffDiameter = topDiameter;
      
      // 计算桩顶部的偏移量
      const topDeltaE = topE - pileENum;
      const topDeltaN = topN - pileNNum;
      const topLinear = Math.sqrt(topDeltaE * topDeltaE + topDeltaN * topDeltaN);
      
      // 计算桩底部的偏移量
      const bottomDeltaE = bottomE - pileENum;
      const bottomDeltaN = bottomN - pileNNum;
      const bottomLinear = Math.sqrt(bottomDeltaE * bottomDeltaE + bottomDeltaN * bottomDeltaN);
      
      // 计算垂直度
      const verticalityHD = Math.sqrt(Math.pow(topE - bottomE, 2) + Math.pow(topN - bottomN, 2));
      const verticalityVD = Math.abs(topRLNum - bottomRLNum);
      const verticalityRatio = verticalityVD > 0 ? verticalityHD / verticalityVD : 0;
      
      // 修改BRG计算方式 - 从桩顶中心到套管底部中心的方位角
      // atan2参数顺序是(y, x)，但方位角计算时我们需要(E, N)，对应(x, y)
      // 因此用(topE - bottomE)表示x差值，(topN - bottomN)表示y差值
      // 注意：方位角以北为0°，顺时针增加，因此需要调整计算结果
      const verticalityBRG = Math.atan2(bottomE - topE, bottomN - topN) * 180 / Math.PI;
      const verticalityBRGFormatted = decimalToDMS(verticalityBRG >= 0 ? verticalityBRG : verticalityBRG + 360);
      
      // 判断垂直度是否合格（使用用户输入的容差值）
      let verticalityResult;
      if (isNaN(verticalityRatio)) {
        verticalityResult = "";
      } else if (isNaN(ratioToleranceNum)) {
        // 如果没有输入容差值，使用默认值0.01判断
        verticalityResult = verticalityRatio < 0.01 ? "PASS" : "Out Of Tolerance";
      } else {
        // 修正判断逻辑：用户输入的是比例的分母（如200表示1:200），需要转换为小数进行比较
        const toleranceValue = 1 / ratioToleranceNum;
        // 如果计算的垂直度比例大于容差值，则判断为不合格
        verticalityResult = verticalityRatio < toleranceValue ? "PASS" : "Out Of Tolerance";
        console.log("垂直度判断:", { 
          verticalityRatio, 
          userInputTolerance: ratioToleranceNum, 
          convertedTolerance: toleranceValue, 
          result: verticalityResult 
        });
      }
      
      // 计算桩顶部的O/S和C/H（使用参考方位角）
      const refBearingRad = refBearingDecimal * Math.PI / 180;
      const topDeltaX = topE - pileENum;
      const topDeltaY = topN - pileNNum;
      const topOS = topDeltaX * Math.cos(refBearingRad) - topDeltaY * Math.sin(refBearingRad);
      const topCH = topDeltaX * Math.sin(refBearingRad) + topDeltaY * Math.cos(refBearingRad);
      
      // 计算桩底部的O/S和C/H（使用参考方位角）
      const bottomDeltaX = bottomE - pileENum;
      const bottomDeltaY = bottomN - pileNNum;
      const bottomOS = bottomDeltaX * Math.cos(refBearingRad) - bottomDeltaY * Math.sin(refBearingRad);
      const bottomCH = bottomDeltaX * Math.sin(refBearingRad) + bottomDeltaY * Math.cos(refBearingRad);
      
      // 计算切断面的O/S和C/H（使用参考方位角）
      const cutOffDeltaX = cutOffE - pileENum;
      const cutOffDeltaY = cutOffN - pileNNum;
      const cutOffOS = cutOffDeltaX * Math.cos(refBearingRad) - cutOffDeltaY * Math.sin(refBearingRad);
      const cutOffCH = cutOffDeltaX * Math.sin(refBearingRad) + cutOffDeltaY * Math.cos(refBearingRad);
      
      // 保存计算结果
      const results = {
        // 基本数据
        stationE: stationENum,
        stationN: stationNNum,
        pileNo,
        pileE: pileENum,
        pileN: pileNNum,
        pileCutOffLevel: pileCutOffLevelNum,
        pileDiameter: pileDiameterNum,
        refBearing,
        refBearingDecimal,
        ratioTolerance: ratioToleranceNum,
        
        // 桩顶部数据
        topLeftBearing,
        topRightBearing,
        topSetAngle,
        topHzDist: topHzDistNum,
        topRL: topRLNum,
        topG,
        topD,
        topE,
        topN,
        topRadius,
        topDiameter,
        topOS,
        topCH,
        topLinear,
        
        // 桩底部数据
        bottomLeftBearing,
        bottomRightBearing,
        bottomSetAngle,
        bottomHzDist: bottomHzDistNum,
        bottomRL: bottomRLNum,
        bottomG,
        bottomD,
        bottomE,
        bottomN,
        bottomRadius,
        bottomDiameter,
        bottomOS,
        bottomCH,
        bottomLinear,
        
        // 切断面数据
        cutOffE,
        cutOffN,
        cutOffRL: pileCutOffLevelNum,
        cutOffRadius,
        cutOffDiameter,
        cutOffOS,
        cutOffCH,
        cutOffLinear,
        
        // 垂直度数据
        verticalityBRG: verticalityBRGFormatted,
        verticalityHD,
        verticalityVD,
        verticalityRatio,
        verticalityResult
      };
      
      console.log("Calculation results:", results); // 添加日志，查看计算结果
      
      // 生成示意图
      const svgPathData = generatePileSvg(
        topE, 
        topN, 
        bottomE, 
        bottomN, 
        cutOffE, 
        cutOffN, 
        pileENum, 
        pileNNum,
        refBearingDecimal,
        topOS,
        topCH,
        bottomOS,
        bottomCH,
        cutOffOS,
        cutOffCH
      );
      setSvgPath(svgPathData);
      
      setCalculationResults(results);
      message.success('计算完成');
    } catch (error) {
      console.error('计算错误:', error);
      message.error('计算过程中发生错误');
    }
  };

  const renderForm = () => (
    <Form
      form={form}
      onFinish={onFinish}
      layout="vertical"
    >
      <Divider orientation="left">Station Data</Divider>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Station Co-ords:</div>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Easting"
            name="stationE"
            rules={[{ required: true, message: '请输入测站E坐标' }]}
          >
            <Input type="number" step="0.001" placeholder="输入测站E坐标" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Northing"
            name="stationN"
            rules={[{ required: true, message: '请输入测站N坐标' }]}
          >
            <Input type="number" step="0.001" placeholder="输入测站N坐标" />
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">Pile Data</Divider>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Pile No."
            name="pileNo"
            rules={[{ required: true, message: '请输入桩号' }]}
          >
            <Input placeholder="输入桩号" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Easting"
            name="pileE"
            rules={[{ required: true, message: '请输入桩E坐标' }]}
          >
            <Input type="number" step="0.001" placeholder="输入桩E坐标" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Northing"
            name="pileN"
            rules={[{ required: true, message: '请输入桩N坐标' }]}
          >
            <Input type="number" step="0.001" placeholder="输入桩N坐标" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Cut-off level"
            name="pileCutOffLevel"
            rules={[{ required: true, message: '请输入桩切断面高程' }]}
          >
            <Input type="number" step="0.001" placeholder="输入桩切断面高程" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Diameter (mm)"
            name="pileDiameter"
            rules={[{ required: true, message: '请输入桩直径' }]}
          >
            <Input type="number" step="1" placeholder="输入桩直径(mm)" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Ref. Bearing"
            name="refBearing"
            rules={[{ required: true, message: '请输入参考方位角' }]}
          >
            <Input placeholder="输入参考方位角(DD.MMSS)" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Ratio Tolerance"
            name="ratioTolerance"
          >
            <Input type="number" step="0.001" placeholder="输入容差比例(例如: 0.01)" />
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">One Point Circle Fix</Divider>
      <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Input Data (Pile Top)</div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Left Bearing (DD.MMSS)"
            name="topLeftBearing"
            rules={[{ required: true, message: '请输入左方位角' }]}
          >
            <Input placeholder="输入左方位角" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Right Bearing (DD.MMSS)"
            name="topRightBearing"
            rules={[{ required: true, message: '请输入右方位角' }]}
          >
            <Input placeholder="输入右方位角" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Set Angle"
            shouldUpdate={(prevValues, currentValues) => 
              prevValues.topLeftBearing !== currentValues.topLeftBearing || 
              prevValues.topRightBearing !== currentValues.topRightBearing
            }
          >
            {({ getFieldValue }) => {
              const leftBearing = getFieldValue('topLeftBearing');
              const rightBearing = getFieldValue('topRightBearing');
              
              if (!leftBearing || !rightBearing) {
                return <Input disabled placeholder="自动计算" />;
              }
              
              const leftBearingDecimal = DMSToDecimal(leftBearing);
              const rightBearingDecimal = DMSToDecimal(rightBearing);
              let setAngleDecimal = (leftBearingDecimal + rightBearingDecimal) / 2;
              
              if (Math.abs(rightBearingDecimal - leftBearingDecimal) > 180) {
                setAngleDecimal = (setAngleDecimal + 180) % 360;
              }
              
              const setAngle = decimalToDMS(setAngleDecimal);
              
              return <Input disabled value={setAngle} />;
            }}
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Hz Dist"
            name="topHzDist"
            rules={[{ required: true, message: '请输入水平距离' }]}
          >
            <Input type="number" step="0.001" placeholder="输入水平距离" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="RL"
            name="topRL"
            rules={[{ required: true, message: '请输入高程' }]}
          >
            <Input type="number" step="0.001" placeholder="输入高程" />
          </Form.Item>
        </Col>
      </Row>

      <div style={{ fontWeight: 'bold', marginBottom: '8px', marginTop: '16px' }}>Input Data (Pile Bottom)</div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Left Bearing (DD.MMSS)"
            name="bottomLeftBearing"
            rules={[{ required: true, message: '请输入左方位角' }]}
          >
            <Input placeholder="输入左方位角" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Right Bearing (DD.MMSS)"
            name="bottomRightBearing"
            rules={[{ required: true, message: '请输入右方位角' }]}
          >
            <Input placeholder="输入右方位角" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Set Angle"
            shouldUpdate={(prevValues, currentValues) => 
              prevValues.bottomLeftBearing !== currentValues.bottomLeftBearing || 
              prevValues.bottomRightBearing !== currentValues.bottomRightBearing
            }
          >
            {({ getFieldValue }) => {
              const leftBearing = getFieldValue('bottomLeftBearing');
              const rightBearing = getFieldValue('bottomRightBearing');
              
              if (!leftBearing || !rightBearing) {
                return <Input disabled placeholder="自动计算" />;
              }
              
              const leftBearingDecimal = DMSToDecimal(leftBearing);
              const rightBearingDecimal = DMSToDecimal(rightBearing);
              let setAngleDecimal = (leftBearingDecimal + rightBearingDecimal) / 2;
              
              if (Math.abs(rightBearingDecimal - leftBearingDecimal) > 180) {
                setAngleDecimal = (setAngleDecimal + 180) % 360;
              }
              
              const setAngle = decimalToDMS(setAngleDecimal);
              
              return <Input disabled value={setAngle} />;
            }}
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Hz Dist"
            name="bottomHzDist"
            rules={[{ required: true, message: '请输入水平距离' }]}
          >
            <Input type="number" step="0.001" placeholder="输入水平距离" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="RL"
            name="bottomRL"
            rules={[{ required: true, message: '请输入高程' }]}
          >
            <Input type="number" step="0.001" placeholder="输入高程" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item style={{ marginTop: '16px' }}>
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
        {calculationResults && Object.keys(calculationResults).length > 0 && (
          <Button 
            type="primary" 
            icon={<DownloadOutlined />} 
            onClick={handleDownloadPDF}
            style={{ marginLeft: 8 }}
          >
            下载PDF
          </Button>
        )}
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
          <div style={{ fontWeight: 'bold', fontSize: '16px', borderBottom: '1px solid #f0f0f0', paddingBottom: '8px', marginBottom: '12px' }}>
            Pile Data
          </div>
          <div style={{ marginBottom: '10px', display: 'flex' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold', display: 'inline-block', width: '100px' }}>Pile No.: </span>
              <span>{calculationResults.pileNo || '-'}</span>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold', display: 'inline-block', width: '100px' }}>Ref. Bearing: </span>
              <span>{calculationResults.refBearing || '-'}</span>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold', display: 'inline-block', width: '100px' }}>Diameter: </span>
              <span>{calculationResults.pileDiameter || '-'} mm</span>
            </div>
          </div>
          <div style={{ marginBottom: '10px', display: 'flex' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold', display: 'inline-block', width: '100px' }}>Easting: </span>
              <span>{typeof calculationResults.pileE === 'number' ? calculationResults.pileE.toFixed(3) : '-'}</span>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold', display: 'inline-block', width: '100px' }}>Northing: </span>
              <span>{typeof calculationResults.pileN === 'number' ? calculationResults.pileN.toFixed(3) : '-'}</span>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold', display: 'inline-block', width: '100px' }}>Cut-Off Level: </span>
              <span>{typeof calculationResults.pileCutOffLevel === 'number' ? calculationResults.pileCutOffLevel.toFixed(3) : '-'}</span>
            </div>
          </div>
          
          {/* 添加 Station Co-ords 信息 */}
          <div style={{ marginTop: '15px', marginBottom: '10px' }}>
            <div style={{ fontWeight: 'bold', borderBottom: '1px solid #f0f0f0', paddingBottom: '5px', marginBottom: '10px' }}>
              Station Co-ords:
            </div>
            <div style={{ display: 'flex' }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 'bold', display: 'inline-block', width: '100px' }}>E: </span>
                <span>{typeof calculationResults.stationE === 'number' ? calculationResults.stationE.toFixed(3) : '-'}</span>
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 'bold', display: 'inline-block', width: '100px' }}>N: </span>
                <span>{typeof calculationResults.stationN === 'number' ? calculationResults.stationN.toFixed(3) : '-'}</span>
              </div>
              <div style={{ flex: 1 }}></div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px', borderBottom: '1px solid #f0f0f0', paddingBottom: '8px', marginBottom: '12px' }}>
            Pile Top Centre
          </div>
          <div style={{ marginBottom: '10px', display: 'flex' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold', display: 'inline-block', width: '100px' }}>Easting: </span>
              <span>{typeof calculationResults.topE === 'number' ? calculationResults.topE.toFixed(3) : '-'}</span>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold', display: 'inline-block', width: '100px' }}>Northing: </span>
              <span>{typeof calculationResults.topN === 'number' ? calculationResults.topN.toFixed(3) : '-'}</span>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold', display: 'inline-block', width: '100px' }}>RL: </span>
              <span>{typeof calculationResults.topRL === 'number' ? calculationResults.topRL.toFixed(3) : '-'}</span>
            </div>
          </div>
          
          {/* 添加 Set Angle 和 Hz Dist 信息 */}
          <div style={{ marginBottom: '10px', display: 'flex' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold', display: 'inline-block', width: '100px' }}>Set Angle: </span>
              <span>{calculationResults.topSetAngle || '-'}</span>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold', display: 'inline-block', width: '100px' }}>Hz Dist: </span>
              <span>{typeof calculationResults.topHzDist === 'number' ? calculationResults.topHzDist.toFixed(3) : '-'} m</span>
            </div>
            <div style={{ flex: 1 }}></div>
          </div>
          
          <div style={{ marginBottom: '10px', display: 'flex' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold', display: 'inline-block', width: '100px' }}>Radius: </span>
              <span>{typeof calculationResults.topRadius === 'number' ? calculationResults.topRadius.toFixed(3) : '-'} m</span>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold', display: 'inline-block', width: '100px' }}>Diameter: </span>
              <span>{typeof calculationResults.topDiameter === 'number' ? calculationResults.topDiameter.toFixed(3) : '-'} m</span>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold', display: 'inline-block', width: '100px' }}>Linear: </span>
              <span>{typeof calculationResults.topLinear === 'number' ? calculationResults.topLinear.toFixed(3) : '-'} m</span>
            </div>
          </div>
          <div style={{ marginBottom: '10px', display: 'flex' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold', display: 'inline-block', width: '100px' }}>O/S: </span>
              <span>{typeof calculationResults.topOS === 'number' ? calculationResults.topOS.toFixed(3) : '-'} m</span>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold', display: 'inline-block', width: '100px' }}>C/H: </span>
              <span>{typeof calculationResults.topCH === 'number' ? calculationResults.topCH.toFixed(3) : '-'} m</span>
            </div>
            <div style={{ flex: 1 }}></div>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px', borderBottom: '1px solid #f0f0f0', paddingBottom: '8px', marginBottom: '12px' }}>
            Pile Bottom Centre
          </div>
          <div style={{ marginBottom: '10px', display: 'flex' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold', display: 'inline-block', width: '100px' }}>Easting: </span>
              <span>{typeof calculationResults.bottomE === 'number' ? calculationResults.bottomE.toFixed(3) : '-'}</span>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold', display: 'inline-block', width: '100px' }}>Northing: </span>
              <span>{typeof calculationResults.bottomN === 'number' ? calculationResults.bottomN.toFixed(3) : '-'}</span>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold', display: 'inline-block', width: '100px' }}>RL: </span>
              <span>{typeof calculationResults.bottomRL === 'number' ? calculationResults.bottomRL.toFixed(3) : '-'}</span>
            </div>
          </div>
          
          {/* 添加 Set Angle 信息 */}
          <div style={{ marginBottom: '10px', display: 'flex' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold', display: 'inline-block', width: '100px' }}>Set Angle: </span>
              <span>{calculationResults.bottomSetAngle || '-'}</span>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold', display: 'inline-block', width: '100px' }}>Hz Dist: </span>
              <span>{typeof calculationResults.bottomHzDist === 'number' ? calculationResults.bottomHzDist.toFixed(3) : '-'} m</span>
            </div>
            <div style={{ flex: 1 }}></div>
          </div>
          
          <div style={{ marginBottom: '10px', display: 'flex' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold', display: 'inline-block', width: '100px' }}>Radius: </span>
              <span>{typeof calculationResults.bottomRadius === 'number' ? calculationResults.bottomRadius.toFixed(3) : '-'} m</span>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold', display: 'inline-block', width: '100px' }}>Diameter: </span>
              <span>{typeof calculationResults.bottomDiameter === 'number' ? calculationResults.bottomDiameter.toFixed(3) : '-'} m</span>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold', display: 'inline-block', width: '100px' }}>Linear: </span>
              <span>{typeof calculationResults.bottomLinear === 'number' ? calculationResults.bottomLinear.toFixed(3) : '-'} m</span>
            </div>
          </div>
          <div style={{ marginBottom: '10px', display: 'flex' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold', display: 'inline-block', width: '100px' }}>O/S: </span>
              <span>{typeof calculationResults.bottomOS === 'number' ? calculationResults.bottomOS.toFixed(3) : '-'} m</span>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold', display: 'inline-block', width: '100px' }}>C/H: </span>
              <span>{typeof calculationResults.bottomCH === 'number' ? calculationResults.bottomCH.toFixed(3) : '-'} m</span>
            </div>
            <div style={{ flex: 1 }}></div>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px', borderBottom: '1px solid #f0f0f0', paddingBottom: '8px', marginBottom: '12px' }}>
            Cut Off Level
          </div>
          <div style={{ marginBottom: '10px', display: 'flex' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold', display: 'inline-block', width: '100px' }}>Easting: </span>
              <span>{typeof calculationResults.cutOffE === 'number' ? calculationResults.cutOffE.toFixed(3) : '-'}</span>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold', display: 'inline-block', width: '100px' }}>Northing: </span>
              <span>{typeof calculationResults.cutOffN === 'number' ? calculationResults.cutOffN.toFixed(3) : '-'}</span>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold', display: 'inline-block', width: '100px' }}>RL: </span>
              <span>{typeof calculationResults.cutOffRL === 'number' ? calculationResults.cutOffRL.toFixed(3) : '-'}</span>
            </div>
          </div>
          <div style={{ marginBottom: '10px', display: 'flex' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold', display: 'inline-block', width: '100px' }}>Radius: </span>
              <span>{typeof calculationResults.cutOffRadius === 'number' ? calculationResults.cutOffRadius.toFixed(3) : '-'} m</span>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold', display: 'inline-block', width: '100px' }}>Diameter: </span>
              <span>{typeof calculationResults.cutOffDiameter === 'number' ? calculationResults.cutOffDiameter.toFixed(3) : '-'} m</span>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold', display: 'inline-block', width: '100px' }}>Linear: </span>
              <span>{typeof calculationResults.cutOffLinear === 'number' ? calculationResults.cutOffLinear.toFixed(3) : '-'} m</span>
            </div>
          </div>
          <div style={{ marginBottom: '10px', display: 'flex' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold', display: 'inline-block', width: '100px' }}>O/S: </span>
              <span>{typeof calculationResults.cutOffOS === 'number' ? calculationResults.cutOffOS.toFixed(3) : '-'} m</span>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold', display: 'inline-block', width: '100px' }}>C/H: </span>
              <span>{typeof calculationResults.cutOffCH === 'number' ? calculationResults.cutOffCH.toFixed(3) : '-'} m</span>
            </div>
            <div style={{ flex: 1 }}></div>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px', borderBottom: '1px solid #f0f0f0', paddingBottom: '8px', marginBottom: '12px' }}>
            Verticality
          </div>
          <div style={{ marginBottom: '10px', display: 'flex' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold', display: 'inline-block', width: '100px' }}>BRG: </span>
              <span>{calculationResults.verticalityBRG || '-'}</span>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold', display: 'inline-block', width: '100px' }}>HD: </span>
              <span>{typeof calculationResults.verticalityHD === 'number' ? calculationResults.verticalityHD.toFixed(3) : '-'} m</span>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold', display: 'inline-block', width: '100px' }}>VD: </span>
              <span>{typeof calculationResults.verticalityVD === 'number' ? calculationResults.verticalityVD.toFixed(3) : '-'} m</span>
            </div>
          </div>
          <div style={{ marginBottom: '10px', display: 'flex' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold', display: 'inline-block', width: '100px' }}>Ratio: </span>
              <span>{typeof calculationResults.verticalityRatio === 'number' ? `1:${(1/calculationResults.verticalityRatio).toFixed(0)}` : '-'}</span>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold', display: 'inline-block', width: '100px' }}>Result: </span>
              <span style={{ color: calculationResults.verticalityResult === 'PASS' ? 'green' : 'red', fontWeight: 'bold' }}>
                {calculationResults.verticalityResult || '-'}
              </span>
            </div>
            <div style={{ flex: 1 }}></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <Card 
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>头桩检查（简单版）</span>
            <Link 
              onClick={() => {
                const tabsElement = document.querySelector('.ant-tabs-nav-list');
                if (tabsElement) {
                  const tabNodes = tabsElement.childNodes;
                  // 查找头桩检查(专业版)的选项卡并点击
                  for (let i = 0; i < tabNodes.length; i++) {
                    if (tabNodes[i].textContent.includes('头桩检查(专业版)')) {
                      tabNodes[i].click();
                      break;
                    }
                  }
                }
              }}
              style={{ fontSize: '14px' }}
            >
              切换到专业版 &gt;
            </Link>
          </div>
        } 
        className={styles.formCard}
      >
        {renderForm()}
      </Card>
      
      {calculationResults && Object.keys(calculationResults).length > 0 && (
        <>
          <Card
            className={styles.resultCard}
            ref={resultCardRef}
          >
            {renderCalculationResults()}
          </Card>
          
          {svgPath && (
            <Card
              className={styles.resultCard}
              title="桩检查示意图"
              ref={planCardRef}
              style={{ marginTop: '16px' }}
            >
              <div className={styles.svgContainer} dangerouslySetInnerHTML={{ __html: svgPath }}></div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default FirstPileCheck; 