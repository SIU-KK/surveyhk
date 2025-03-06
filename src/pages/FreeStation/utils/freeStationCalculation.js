// DD.MMSS 格式转换为十进制度数
const DMSToDecimal = (dms) => {
  const parts = dms.toString().split('.');
  const degrees = parseInt(parts[0]);
  let minutes = 0;
  let seconds = 0;
  
  if (parts[1]) {
    const mmss = parts[1].padEnd(4, '0');
    minutes = parseInt(mmss.substring(0, 2));
    seconds = parseInt(mmss.substring(2, 4));
  }

  if (minutes >= 60 || seconds >= 60) {
    throw new Error('无效的角度格式：分或秒超过60');
  }

  return degrees + minutes / 60 + seconds / 3600;
};

// 角度转弧度
const toRadians = (degrees) => degrees * Math.PI / 180;

// 弧度转角度
const toDegrees = (radians) => radians * 180 / Math.PI;

// 计算cot值
const calculateCot = (angle) => {
  return 1 / Math.tan(toRadians(angle));
};

// 计算tan值
const calculateTan = (angle) => {
  return Math.tan(toRadians(angle));
};

// 计算方位角（以正南为0度，顺时针为正）
const calculateAzimuth = (startE, startN, endE, endN) => {
  const deltaE = endE - startE;
  const deltaN = endN - startN;
  // 先计算以正北为0度的方位角
  let azimuth = toDegrees(Math.atan2(deltaE, deltaN));
  if (azimuth < 0) {
    azimuth += 360;
  }
  // 转换为以正南为0度的方位角
  azimuth = (azimuth + 180) % 360;
  return azimuth;
};

// 2BRE + 1 Distance 计算
export const calculate2BRE1D = (data) => {
  try {
    // 解构输入数据
    const {
      point1_E: Ea, point1_N: Na, point1_BRE: angleA,  // A点坐标和观测角
      point2_E: Eb, point2_N: Nb, point2_H: Hb,        // B点坐标和高程
      point2_BRE: angleB, point2_VA: VA, point2_SD: SD,// B点观测数据
      point2_PH: PH, instrumentHeight: IH               // 仪器高和棱镜高
    } = data;

    // 转换为数值
    const EaNum = parseFloat(Ea);
    const NaNum = parseFloat(Na);
    const EbNum = parseFloat(Eb);
    const NbNum = parseFloat(Nb);
    const SD_num = parseFloat(SD);

    // 转换角度为十进制度
    const BRE_A = DMSToDecimal(angleA);  // A点方位角读数
    const BRE_B = DMSToDecimal(angleB);  // B点方位角读数
    const zenithAngle = DMSToDecimal(VA);

    // 1. 计算已知点A到B的实际方位角（以正南为0度）
    const azimuthAB = calculateAzimuth(EaNum, NaNum, EbNum, NbNum);
    
    // 2. 计算定向角改正数（使用A点观测值）
    const orientation = ((azimuthAB - BRE_A + 360) % 360);

    // 3. 计算观测方位角（加入定向改正数）
    const actualAzimuthA = (BRE_A + orientation) % 360;
    const actualAzimuthB = (BRE_B + orientation) % 360;

    // 4. 计算水平距离
    const horizontalDistance = SD_num * Math.sin(toRadians(zenithAngle));

    // 5. 从B点反算测站坐标（使用正南为0度的坐标系）
    const azimuthRad = toRadians(actualAzimuthB);  // 不需要加180度，因为我们需要的是从测站点到B点的方位角
    // 计算坐标增量
    const deltaE = -horizontalDistance * Math.sin(azimuthRad);  // 添加负号因为是从B点到测站点
    const deltaN = -horizontalDistance * Math.cos(azimuthRad);  // 添加负号因为是从B点到测站点
    
    // 计算测站点坐标
    const Ep = EbNum + deltaE;
    const Np = NbNum + deltaN;

    // 添加调试信息
    console.log('Debug info:', {
      horizontalDistance,
      azimuthDeg: actualAzimuthB,
      azimuthRad: azimuthRad,
      deltaE: deltaE,
      deltaN: deltaN,
      Ep: Ep,
      Np: Np
    });

    // 6. 计算高程
    const heightDiff = SD_num * Math.cos(toRadians(zenithAngle));
    const Hp = parseFloat(Hb) - heightDiff + parseFloat(PH) - parseFloat(IH);

    // 7. 计算精度检核
    // 计算测站点到A点和B点的方位角
    const azimuthToA = calculateAzimuth(Ep, Np, EaNum, NaNum);
    const azimuthToB = calculateAzimuth(Ep, Np, EbNum, NbNum);

    // 计算实际观测夹角（从观测方位角计算）
    let observedAngle = (BRE_B - BRE_A + 360) % 360;
    if (observedAngle > 180) {
        observedAngle = 360 - observedAngle;
    }
    
    // 计算由坐标反算的夹角
    let computedAngle = (azimuthToB - azimuthToA + 360) % 360;
    if (computedAngle > 180) {
        computedAngle = 360 - computedAngle;
    }

    // 计算到A点和B点的距离
    const distanceToA = Math.sqrt(
      Math.pow(Ep - EaNum, 2) + Math.pow(Np - NaNum, 2)
    );
    const distanceToB = Math.sqrt(
      Math.pow(Ep - EbNum, 2) + Math.pow(Np - NbNum, 2)
    );

    return {
      station: {
        E: Ep.toFixed(3),
        N: Np.toFixed(3),
        H: Hp.toFixed(3)
      },
      orientation: orientation.toFixed(4),
      precision: {
        horizontal: Math.abs(horizontalDistance - distanceToB).toFixed(3),
        angleCheck: Math.abs(observedAngle - computedAngle).toFixed(4),
        distanceToA: distanceToA.toFixed(3),
        distanceToB: distanceToB.toFixed(3)
      },
      debug: {
        azimuthAB: actualAzimuthA.toFixed(4),
        azimuthToA: azimuthToA.toFixed(4),
        azimuthToB: azimuthToB.toFixed(4),
        observedAngle: observedAngle.toFixed(4),
        computedAngle: computedAngle.toFixed(4),
        horizontalDistance: horizontalDistance.toFixed(3),
        heightDiff: heightDiff.toFixed(3)
      }
    };
  } catch (error) {
    console.error('计算错误:', error);
    throw new Error('计算过程中出现错误，请检查输入数据格式是否正确（角度应为DD.MMSS格式）');
  }
};

// 2BRE + 2 Distance 计算
export function calculate2BRE2D(values) {
  try {
    // 解析第一个已知点数据
    const E1 = parseFloat(values.point1_E);
    const N1 = parseFloat(values.point1_N);
    const H1 = parseFloat(values.point1_H);
    const BRG1 = DMSToDecimal(values.obs1_BRG);
    const VA1 = DMSToDecimal(values.obs1_VA);
    const SD1 = parseFloat(values.obs1_SD);
    const PH1 = parseFloat(values.obs1_PH);

    // 解析第二个已知点数据
    const E2 = parseFloat(values.point2_E);
    const N2 = parseFloat(values.point2_N);
    const H2 = parseFloat(values.point2_H);
    const BRG2 = DMSToDecimal(values.obs2_BRG);
    const VA2 = DMSToDecimal(values.obs2_VA);
    const SD2 = parseFloat(values.obs2_SD);
    const PH2 = parseFloat(values.obs2_PH);

    const IH = parseFloat(values.instrumentHeight);

    // 1. 计算已知点1到2的实际方位角（以正南为0度）
    const azimuth12 = calculateAzimuth(E1, N1, E2, N2);
    
    // 2. 计算定向角改正数（使用点1的观测值）
    const orientation = ((azimuth12 - BRG1 + 360) % 360);

    // 3. 计算观测方位角（加入定向改正数）
    const actualAzimuth1 = (BRG1 + orientation) % 360;
    const actualAzimuth2 = (BRG2 + orientation) % 360;

    // 4. 计算两个水平距离
    const HD1 = SD1 * Math.sin(toRadians(VA1));
    const HD2 = SD2 * Math.sin(toRadians(VA2));

    // 5. 计算测站坐标（使用两个距离观测）
    const azimuthRad1 = toRadians(actualAzimuth1);
    const azimuthRad2 = toRadians(actualAzimuth2);

    // 计算从两个已知点到测站的坐标增量
    const deltaE1 = -HD1 * Math.sin(azimuthRad1);
    const deltaN1 = -HD1 * Math.cos(azimuthRad1);
    const deltaE2 = -HD2 * Math.sin(azimuthRad2);
    const deltaN2 = -HD2 * Math.cos(azimuthRad2);

    // 分别计算从两个已知点得到的测站坐标
    const E_from1 = E1 + deltaE1;
    const N_from1 = N1 + deltaN1;
    const E_from2 = E2 + deltaE2;
    const N_from2 = N2 + deltaN2;

    // 使用权重计算最终坐标（距离越短权重越大）
    const weight1 = 1 / HD1;
    const weight2 = 1 / HD2;
    const totalWeight = weight1 + weight2;

    const Ep = (E_from1 * weight1 + E_from2 * weight2) / totalWeight;
    const Np = (N_from1 * weight1 + N_from2 * weight2) / totalWeight;

    // 6. 计算高程
    const heightDiff1 = SD1 * Math.cos(toRadians(VA1));
    const heightDiff2 = SD2 * Math.cos(toRadians(VA2));
    const H_from1 = H1 - heightDiff1 + PH1 - IH;
    const H_from2 = H2 - heightDiff2 + PH2 - IH;
    const Hp = (H_from1 * weight1 + H_from2 * weight2) / totalWeight;

    // 7. 计算精度检核
    // 计算E和N坐标的差值
    const deltaE = Math.abs(E_from1 - E_from2);
    const deltaN = Math.abs(N_from1 - N_from2);

    // 计算测站点到两个已知点的方位角
    const azimuthToPoint1 = calculateAzimuth(Ep, Np, E1, N1);
    const azimuthToPoint2 = calculateAzimuth(Ep, Np, E2, N2);

    // 计算观测夹角和由坐标反算的夹角
    let observedAngle = (BRG2 - BRG1 + 360) % 360;
    if (observedAngle > 180) observedAngle = 360 - observedAngle;

    let computedAngle = (azimuthToPoint2 - azimuthToPoint1 + 360) % 360;
    if (computedAngle > 180) computedAngle = 360 - computedAngle;

    // 计算到两个已知点的距离
    const distanceToPoint1 = Math.sqrt(
      Math.pow(Ep - E1, 2) + Math.pow(Np - N1, 2)
    );
    const distanceToPoint2 = Math.sqrt(
      Math.pow(Ep - E2, 2) + Math.pow(Np - N2, 2)
    );

    return {
      station: {
        E: Ep.toFixed(3),
        N: Np.toFixed(3),
        H: Hp.toFixed(3)
      },
      orientation: orientation.toFixed(4),
      precision: {
        deltaE: deltaE.toFixed(3),  // E坐标差值
        deltaN: deltaN.toFixed(3),  // N坐标差值
        angleCheck: Math.abs(observedAngle - computedAngle).toFixed(4),
        distanceToPoint1: distanceToPoint1.toFixed(3),
        distanceToPoint2: distanceToPoint2.toFixed(3)
      },
      debug: {
        E_from1: E_from1.toFixed(3),
        N_from1: N_from1.toFixed(3),
        E_from2: E_from2.toFixed(3),
        N_from2: N_from2.toFixed(3),
        azimuth12: azimuth12.toFixed(4),
        actualAzimuth1: actualAzimuth1.toFixed(4),
        actualAzimuth2: actualAzimuth2.toFixed(4),
        HD1: HD1.toFixed(3),
        HD2: HD2.toFixed(3)
      }
    };
  } catch (error) {
    console.error('Calculation error:', error);
    throw new Error('计算过程中出现错误，请检查输入数据');
  }
}

// 3BRE + 3 Distance 计算
export function calculate3BRE3D(values) {
  try {
    // 解析三个已知点的数据
    const points = [
      {
        E: parseFloat(values.point1_E),
        N: parseFloat(values.point1_N),
        H: parseFloat(values.point1_H),
        BRG: DMSToDecimal(values.obs1_BRG),
        VA: DMSToDecimal(values.obs1_VA),
        SD: parseFloat(values.obs1_SD),
        PH: parseFloat(values.obs1_PH)
      },
      {
        E: parseFloat(values.point2_E),
        N: parseFloat(values.point2_N),
        H: parseFloat(values.point2_H),
        BRG: DMSToDecimal(values.obs2_BRG),
        VA: DMSToDecimal(values.obs2_VA),
        SD: parseFloat(values.obs2_SD),
        PH: parseFloat(values.obs2_PH)
      },
      {
        E: parseFloat(values.point3_E),
        N: parseFloat(values.point3_N),
        H: parseFloat(values.point3_H),
        BRG: DMSToDecimal(values.obs3_BRG),
        VA: DMSToDecimal(values.obs3_VA),
        SD: parseFloat(values.obs3_SD),
        PH: parseFloat(values.obs3_PH)
      }
    ];

    const IH = parseFloat(values.instrumentHeight);

    // 1. 计算已知点1到2的实际方位角（以正南为0度）
    const azimuth12 = calculateAzimuth(points[0].E, points[0].N, points[1].E, points[1].N);
    
    // 2. 计算定向角改正数（使用点1的观测值）
    const orientation = ((azimuth12 - points[0].BRG + 360) % 360);

    // 3. 计算每个点的观测方位角（加入定向改正数）
    const actualAzimuths = points.map(point => (point.BRG + orientation) % 360);

    // 4. 计算每个点的水平距离
    const horizontalDistances = points.map(point => 
      point.SD * Math.sin(toRadians(point.VA))
    );

    // 5. 计算从每个已知点到测站的坐标
    const stationCoords = points.map((point, i) => {
      const azimuthRad = toRadians(actualAzimuths[i]);
      const HD = horizontalDistances[i];
      
      // 计算坐标增量
      const deltaE = -HD * Math.sin(azimuthRad);
      const deltaN = -HD * Math.cos(azimuthRad);
      
      // 计算高程差
      const heightDiff = point.SD * Math.cos(toRadians(point.VA));
      const H = point.H - heightDiff + point.PH - IH;

      return {
        E: point.E + deltaE,
        N: point.N + deltaN,
        H: H,
        HD: HD
      };
    });

    // 6. 使用权重计算最终坐标（距离越短权重越大）
    const weights = horizontalDistances.map(hd => 1 / hd);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    const Ep = stationCoords.reduce((sum, coord, i) => 
      sum + coord.E * weights[i], 0) / totalWeight;
    const Np = stationCoords.reduce((sum, coord, i) => 
      sum + coord.N * weights[i], 0) / totalWeight;
    const Hp = stationCoords.reduce((sum, coord, i) => 
      sum + coord.H * weights[i], 0) / totalWeight;

    // 7. 计算精度检核
    // 计算各点坐标差值
    const coordDiffs = stationCoords.map((coord, i) => ({
      deltaE: Math.abs(coord.E - Ep),
      deltaN: Math.abs(coord.N - Np),
      deltaH: Math.abs(coord.H - Hp)
    }));

    // 计算最大差值
    const maxDiffs = {
      E: Math.max(...coordDiffs.map(diff => diff.deltaE)),
      N: Math.max(...coordDiffs.map(diff => diff.deltaN)),
      H: Math.max(...coordDiffs.map(diff => diff.deltaH))
    };

    // 计算到各已知点的距离
    const distances = points.map((point, i) => ({
      computed: Math.sqrt(
        Math.pow(Ep - point.E, 2) + Math.pow(Np - point.N, 2)
      ),
      measured: horizontalDistances[i]
    }));

    // 计算角度检核
    const computedAzimuths = points.map(point => 
      calculateAzimuth(Ep, Np, point.E, point.N)
    );

    return {
      station: {
        E: Ep.toFixed(3),
        N: Np.toFixed(3),
        H: Hp.toFixed(3)
      },
      orientation: orientation.toFixed(4),
      precision: {
        maxDeltaE: maxDiffs.E.toFixed(3),
        maxDeltaN: maxDiffs.N.toFixed(3),
        maxDeltaH: maxDiffs.H.toFixed(3),
        point1: {
          deltaE: coordDiffs[0].deltaE.toFixed(3),
          deltaN: coordDiffs[0].deltaN.toFixed(3),
          deltaH: coordDiffs[0].deltaH.toFixed(3),
          distanceDiff: Math.abs(distances[0].computed - distances[0].measured).toFixed(3)
        },
        point2: {
          deltaE: coordDiffs[1].deltaE.toFixed(3),
          deltaN: coordDiffs[1].deltaN.toFixed(3),
          deltaH: coordDiffs[1].deltaH.toFixed(3),
          distanceDiff: Math.abs(distances[1].computed - distances[1].measured).toFixed(3)
        },
        point3: {
          deltaE: coordDiffs[2].deltaE.toFixed(3),
          deltaN: coordDiffs[2].deltaN.toFixed(3),
          deltaH: coordDiffs[2].deltaH.toFixed(3),
          distanceDiff: Math.abs(distances[2].computed - distances[2].measured).toFixed(3)
        }
      },
      debug: {
        actualAzimuths: actualAzimuths.map(az => az.toFixed(4)),
        computedAzimuths: computedAzimuths.map(az => az.toFixed(4)),
        horizontalDistances: horizontalDistances.map(hd => hd.toFixed(3)),
        weights: weights.map(w => w.toFixed(6))
      }
    };
  } catch (error) {
    console.error('Calculation error:', error);
    throw new Error('计算过程中出现错误，请检查输入数据');
  }
}

// 计算定向角函数
function calculateOrientation(E1, N1, E2, N2, BRG1, BRG2) {
  const azimuth1 = Math.atan2(E1 - E2, N1 - N2) * 180 / Math.PI;
  const orientation1 = BRG1 - azimuth1;
  const orientation2 = BRG2 - azimuth1;
  return (orientation1 + orientation2) / 2;
} 