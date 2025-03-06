/**
 * 弧放样计算模块
 * 用于计算圆弧上的放样点坐标
 */

/**
 * 将角度转换为弧度
 * @param {number} degrees - 角度值
 * @returns {number} 弧度值
 */
const degreesToRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * 将弧度转换为角度
 * @param {number} radians - 弧度值
 * @returns {number} 角度值
 */
const radiansToDegrees = (radians) => {
  return radians * (180 / Math.PI);
};

/**
 * 标准化角度到0-360度范围
 * @param {number} angle - 输入角度
 * @returns {number} 标准化后的角度
 */
const normalizeAngle = (angle) => {
  while (angle < 0) angle += 360;
  while (angle >= 360) angle -= 360;
  return angle;
};

/**
 * 计算圆弧上的点坐标
 * @param {number} centerX - 圆心X坐标
 * @param {number} centerY - 圆心Y坐标
 * @param {number} radius - 半径
 * @param {number} angle - 角度（度）
 * @returns {Object} 点坐标
 */
const calculateArcPoint = (centerX, centerY, radius, angle) => {
  const angleRad = degreesToRadians(angle);
  return {
    x: centerX + radius * Math.cos(angleRad),
    y: centerY + radius * Math.sin(angleRad)
  };
};

/**
 * 计算圆弧上的放样点坐标
 * @param {Object} params - 计算参数
 * @param {number} params.centerX - 圆心X坐标
 * @param {number} params.centerY - 圆心Y坐标
 * @param {number} params.radius - 圆弧半径
 * @param {number} params.startAngle - 起始角度（度）
 * @param {number} params.endAngle - 终止角度（度）
 * @param {number} params.interval - 弧长间距
 * @returns {Array<Object>} 放样点坐标数组
 */
export const calculateArcLayout = (params) => {
  const { centerX, centerY, radius, startAngle, endAngle, interval } = params;

  // 标准化角度
  let start = normalizeAngle(startAngle);
  let end = normalizeAngle(endAngle);

  // 计算总弧长
  let angleDiff = end - start;
  if (angleDiff <= 0) angleDiff += 360;
  const arcLength = (Math.PI * radius * angleDiff) / 180;

  // 计算角度间隔
  const angleInterval = (interval * 360) / (2 * Math.PI * radius);

  // 生成放样点
  const layoutPoints = [];
  let currentAngle = start;
  let pointIndex = 1;

  while (true) {
    // 计算当前点坐标
    const point = calculateArcPoint(centerX, centerY, radius, currentAngle);
    
    layoutPoints.push({
      pointId: `A${pointIndex}`,
      x: point.x.toFixed(4),
      y: point.y.toFixed(4),
      angle: currentAngle.toFixed(4)
    });

    // 检查是否到达终点
    if (Math.abs(normalizeAngle(currentAngle - end)) < 0.0001) break;

    // 更新角度和索引
    currentAngle = normalizeAngle(currentAngle + angleInterval);
    if (normalizeAngle(currentAngle - end) > 0 && 
        normalizeAngle(currentAngle - end) < angleInterval) {
      currentAngle = end;
    }
    pointIndex++;
  }

  return layoutPoints;
};