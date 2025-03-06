/**
 * 点放样计算模块
 * 用于计算从测站点到目标点的放样参数
 */

/**
 * 计算两点之间的水平距离
 * @param {number} deltaE - E坐标差值
 * @param {number} deltaN - N坐标差值
 * @returns {number} 水平距离
 */
const calculateHorizontalDistance = (deltaE, deltaN) => {
  return Math.sqrt(deltaE * deltaE + deltaN * deltaN);
};

/**
 * 计算方位角（BRE）
 * @param {number} deltaE - E坐标差值
 * @param {number} deltaN - N坐标差值
 * @returns {number} 方位角（度）
 */
const calculateBearing = (deltaE, deltaN) => {
  let bearing = Math.atan2(deltaE, deltaN) * (180 / Math.PI);
  if (bearing < 0) bearing += 360;
  return bearing;
};

/**
 * 计算垂直角（V.A）
 * @param {number} heightDifference - 高差
 * @param {number} horizontalDistance - 水平距离
 * @returns {number} 垂直角（度）
 */
const calculateVerticalAngle = (heightDifference, horizontalDistance) => {
  return Math.atan2(heightDifference, horizontalDistance) * (180 / Math.PI);
};

/**
 * 计算斜距（S.D）
 * @param {number} horizontalDistance - 水平距离
 * @param {number} heightDifference - 高差
 * @returns {number} 斜距
 */
const calculateSlopeDistance = (horizontalDistance, heightDifference) => {
  return Math.sqrt(horizontalDistance * horizontalDistance + heightDifference * heightDifference);
};

/**
 * 计算点放样参数
 * @param {Object} params - 计算参数
 * @param {number} params.stationE - 测站E坐标
 * @param {number} params.stationN - 测站N坐标
 * @param {number} params.stationRL - 测站高程
 * @param {number} params.instrumentHeight - 仪器高度
 * @param {number} params.pointE - 放样点E坐标
 * @param {number} params.pointN - 放样点N坐标
 * @param {number} params.pointRL - 放样点高程
 * @param {number} params.prismHeight - 棱镜高度
 * @returns {Object} 计算结果
 */
export const calculatePointLayout = (params) => {
  const {
    stationE, stationN, stationRL, instrumentHeight,
    pointE, pointN, pointRL, prismHeight
  } = params;

  // 计算坐标差值
  const deltaE = pointE - stationE;
  const deltaN = pointN - stationN;

  // 计算水平距离
  const horizontalDistance = calculateHorizontalDistance(deltaE, deltaN);

  // 计算方位角
  const bearing = calculateBearing(deltaE, deltaN);

  // 计算高差
  const heightDifference = (pointRL - stationRL) + (prismHeight - instrumentHeight);

  // 计算垂直角
  const verticalAngle = calculateVerticalAngle(heightDifference, horizontalDistance);

  // 计算斜距
  const slopeDistance = calculateSlopeDistance(horizontalDistance, heightDifference);

  return {
    bearing: bearing.toFixed(4),
    verticalAngle: verticalAngle.toFixed(4),
    horizontalDistance: horizontalDistance.toFixed(4),
    slopeDistance: slopeDistance.toFixed(4)
  };
};