/**
 * 线放样计算模块
 * 用于计算线段上的放样点坐标
 */

/**
 * 计算两点之间的方位角
 * @param {number} startX - 起点X坐标
 * @param {number} startY - 起点Y坐标
 * @param {number} endX - 终点X坐标
 * @param {number} endY - 终点Y坐标
 * @returns {number} 方位角（度）
 */
const calculateAzimuth = (startX, startY, endX, endY) => {
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  let azimuth = Math.atan2(deltaX, deltaY) * (180 / Math.PI);
  if (azimuth < 0) azimuth += 360;
  return azimuth;
};

/**
 * 计算两点之间的距离
 * @param {number} startX - 起点X坐标
 * @param {number} startY - 起点Y坐标
 * @param {number} endX - 终点X坐标
 * @param {number} endY - 终点Y坐标
 * @returns {number} 距离
 */
const calculateDistance = (startX, startY, endX, endY) => {
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
};

/**
 * 计算线段上的放样点坐标
 * @param {Object} params - 计算参数
 * @param {number} params.startX - 起点X坐标
 * @param {number} params.startY - 起点Y坐标
 * @param {number} params.endX - 终点X坐标
 * @param {number} params.endY - 终点Y坐标
 * @param {number} params.interval - 放样间距
 * @returns {Array<Object>} 放样点坐标数组
 */
export const calculateLineLayout = (params) => {
  const { startX, startY, endX, endY, interval } = params;

  // 计算总距离和方位角
  const totalDistance = calculateDistance(startX, startY, endX, endY);
  const azimuth = calculateAzimuth(startX, startY, endX, endY);
  const azimuthRad = azimuth * (Math.PI / 180);

  // 计算分段数
  const segments = Math.floor(totalDistance / interval);

  // 生成放样点
  const layoutPoints = [];
  for (let i = 0; i <= segments; i++) {
    const distance = i * interval;
    const x = startX + distance * Math.sin(azimuthRad);
    const y = startY + distance * Math.cos(azimuthRad);

    layoutPoints.push({
      pointId: `L${i + 1}`,
      x: x.toFixed(4),
      y: y.toFixed(4),
      distance: distance.toFixed(4)
    });
  }

  // 添加终点（如果不是整数倍间距）
  if (totalDistance % interval !== 0) {
    layoutPoints.push({
      pointId: 'END',
      x: endX.toFixed(4),
      y: endY.toFixed(4),
      distance: totalDistance.toFixed(4)
    });
  }

  return layoutPoints;
};