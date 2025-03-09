import React, {useState} from 'react';
import {Button, Card, Col, Divider, Form, Input, message, Row, Space, Upload, Table} from 'antd';
import {DownloadOutlined, MinusCircleOutlined, PlusOutlined, UploadOutlined} from '@ant-design/icons';
import styles from '../BatchLayout.module.css';
import * as XLSX from "xlsx/xlsx.mjs";
import {FieldMap} from "../../tools/fieldMap.js";


const DirectionInverse = () => {
    const [form] = Form.useForm();
    const [stationForm] = Form.useForm();
    const [stationData, setStationData] = useState({
        stationN: '',
        stationE: '',
        stationRL: '',
        stationIH: '',
    });

    const [pointList, setPointList] = useState([
        {id: 1, point: '', n: '', e: '', rl: '', ph: '', remarks: ''}
    ]);
    
    // 获取当前日期，格式为YYMMDD
    const getCurrentDate = () => {
        const now = new Date();
        const year = String(now.getFullYear()).slice(-2); // 获取年份的后两位
        const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需要+1，并确保两位数
        const day = String(now.getDate()).padStart(2, '0'); // 确保日期是两位数
        return `${year}${month}${day}`;
    };
    
    // 添加文件名状态，默认为当天日期
    const [fileName, setFileName] = useState(getCurrentDate());
    
    // 添加计算结果状态
    const [calculationResults, setCalculationResults] = useState([]);
    const [showResults, setShowResults] = useState(false);

    // 处理测站数据变化
    const handleStationChange = (field, value) => {
        setStationData({
            ...stationData,
            [field]: value
        });
    };

    // 处理表单提交
    const handleSubmit = () => {
        // 校验测站数据数据填写规范
        if (!stationData.stationE || !stationData.stationN || !stationData.stationRL || !stationData.stationIH) {
            message.error('请填写测站数据!')
            return
        }
        if (isNaN(+stationData.stationE) || isNaN(+stationData.stationN) || isNaN(+stationData.stationRL) || isNaN(+stationData.stationIH)) {
            message.error('测站数据请填写数字！')
            return
        }
        // 校验点位数据是否规范
        const pointsVal = form.getFieldValue('points')
        let msg = `请核对：`
        let rowErr = false
        pointsVal.map((row, index) => {
            if (!row?.point || !row?.e || !row?.n || !row?.rl || !row?.ph) {
                msg += `${index + 1}行 有未填内容;`
                rowErr = true
            }
            if (isNaN(+row.e) || isNaN(+row.n) || isNaN(+row.rl) || isNaN(+row.ph)) {
                msg += `${index + 1}行 有非数字内容；`
                rowErr = true
            }
        })
        if (!rowErr) {
            message.info('正在为您生成结果...')
            
            // 生成GSI数据和计算值，但不立即导出
            const results = pointsVal.map((row, index) => {
                // 计算坐标差
                const kv = +row.e - +stationData.stationE;  // E方向差值
                const jv = +row.n - +stationData.stationN;  // N方向差值
                
                // 计算水平距离
                const hd = Math.sqrt((jv ** 2) + (kv ** 2));
                
                // 计算高度差
                const heightDiff = (+row.rl + +row.ph) - (+stationData.stationRL + +stationData.stationIH);
                
                // 计算斜距
                const sd = Math.sqrt((hd ** 2) + (heightDiff ** 2));
                
                // 计算方位角（BRG）- 从北方向顺时针测量
                let brg = Math.atan2(kv, jv) * 180 / Math.PI;
                if (brg < 0) brg += 360;  // 确保方位角在0-360度之间
                
                // 计算垂直角（VA）- 从天顶向下测量
                const va = 90 - Math.atan(heightDiff / hd) * 180 / Math.PI;
                
                // 生成GSI数据
                const gsiData = genGsi({...row, prismConstant: row.prismConstant || "0"}, index);
                
                // 返回包含原始数据、计算结果和GSI结果的对象
                return {
                    key: index,
                    ...row,
                    brg: convertToDDMMSS(brg) + '°',
                    va: convertToDDMMSS(va) + '°',
                    sd: sd.toFixed(3) + 'm',
                    hd: hd.toFixed(3) + 'm',
                    gsiData: gsiData
                };
            });
            
            // 设置计算结果
            setCalculationResults(results);
            setShowResults(true);
            message.success('计算完成，请查看结果');
        } else {
            message.error(msg, 10000)
        }
    };

    // 处理Excel导入
    const handleImport = (file) => {
        message.info("正在读取文件，请稍等...");
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = event.target?.result;
                const workbook = XLSX.read(data, {type: "array"});
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet, {header: 0, range: 0});
                let jsonData = [];
                if (json.length > 0) {
                    jsonData = json.map(item => {
                        const {
                            "point": point,
                            "E坐标": e,
                            "N坐标": n,
                            "RL高程": rl,
                            "PH棱镜高": ph,
                            ...rest
                        } = item;
                        return {
                            point,
                            e,
                            n,
                            rl,
                            ph,
                            ...rest,
                        };
                    });
                }
                form.setFieldValue('points', jsonData);
                message.success("文件读取成功");
            } catch (error) {
                console.error('解析Excel文件失败:', error);
                message.error("解析Excel文件失败，请检查文件格式");
            }
        };
        reader.onerror = () => {
            message.error("读取文件失败，请重试");
        };
        reader.readAsArrayBuffer(file);
        return false; // 阻止自动上传
    }

    const downloadTemplate = () => {
        const a = document.createElement("a");
        a.href = "resources/ENH TO BRE VA SD Import Template.xlsx";
        a.setAttribute("download", "ENH TO BRE VA SD Import Template.xlsx");
        a.click();
        message.success("正在下载模板...");
    };

    const exportGsi = (text) => {
        let element = document.createElement('a');
        element.setAttribute('href', 'data:application/octet-stream;charset=utf-8,' + encodeURIComponent(text));
        // 使用用户输入的文件名，如果为空则使用当前日期作为默认名称
        const safeFileName = fileName.trim() || getCurrentDate();
        element.setAttribute('download', `${safeFileName}.gsi`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        message.success(`${safeFileName}.gsi 文件下载成功`);
    }
    
    // 导出所有结果的GSI数据
    const handleExportAllGsi = () => {
        if (calculationResults.length === 0) {
            message.error("没有可导出的数据");
            return;
        }
        
        const gsiText = calculationResults.map(result => result.gsiData).join('\n');
        exportGsi(gsiText);
    };

    // 将十进制度数转换为DD.MMSS格式（度.分秒）
    const convertToDDMMSS = (decimalDegrees) => {
        // 确保角度为正值
        let angle = decimalDegrees;
        if (angle < 0) angle += 360;
        
        // 提取度数部分（整数部分）
        const degrees = Math.floor(angle);
        
        // 计算分钟部分（小数部分 × 60）
        const minutesDecimal = (angle - degrees) * 60;
        const minutes = Math.floor(minutesDecimal);
        
        // 计算秒部分（分钟小数部分 × 60）并四舍五入
        const seconds = Math.round((minutesDecimal - minutes) * 60);
        
        // 组合为DD.MMSS格式，确保分和秒是两位数
        const MM = minutes.toString().padStart(2, '0');
        const SS = seconds.toString().padStart(2, '0');
        
        return `${degrees}.${MM}${SS}`;
    };

    // 生成一行GSI数据
    const genGsi = ({point, e, n, rl, ph, prismConstant = "0"}, index) => {
        // 生成序号，从1开始，格式为 110001, 110002 等
        const rowNumber = `11000${index + 1}`.slice(-6);
        
        // 点位名称补位
        const pointLong = `000000${point}`;
        const pointStr = pointLong.slice(-6);  // 使用6位
        
        let gsiArr = [];
        // 正确的GSI格式: 行号+点位名称
        gsiArr.push(`${rowNumber}+${pointStr}`);
        
        // 计算坐标差和方位角
        const kv = +e - +stationData.stationE;
        const jv = +n - +stationData.stationN;
        
        // 计算水平距离
        const hv = Math.sqrt((jv ** 2) + (kv ** 2));
        
        // 计算高度差
        const heightDiff = (+rl + +ph) - (+stationData.stationRL + +stationData.stationIH);
        
        // 计算BRG和VA
        const lv = Math.atan(kv / (jv || 1)) * 180 / Math.PI;
        const mv = jv < 0 ? lv + 180 : lv;
        const nv = kv < 0 ? mv + 360 : mv;
        const brg = nv > 360 ? nv - 360 : nv;
        
        // 格式化BRG为GSI格式
        const iv = Math.floor(brg) + (Math.floor((brg - Math.floor(brg)) * 60)) / 100 + (Math.floor((((brg - Math.floor(brg)) * 60) - Math.floor((brg - Math.floor(brg)) * 60)) * 60)) / 10000;
        const yv = `0000${Math.round(iv * 10000)}`;
        const zv = yv.slice(-7);
        gsiArr.push(`${FieldMap.Beg}${zv}0`);
        
        // 计算VA
        const tv = Math.atan(heightDiff / hv) * 180 / Math.PI;
        const sv = tv > 0 ? 90 - tv : tv;
        const va = sv < 0 ? 90 - sv : sv;
        
        // 格式化VA为GSI格式
        const pv = Math.floor(va) + (Math.floor((va - Math.floor(va)) * 60)) / 100 + (Math.floor((((va - Math.floor(va)) * 60) - Math.floor((va - Math.floor(va)) * 60)) * 60)) / 10000;
        const aav = `0000${Math.round(pv * 10000)}`;
        const abv = aav.slice(-7);
        gsiArr.push(`${FieldMap.va}${abv}0`);
        
        // 计算SD
        const sd = Math.sqrt((hv ** 2) + (heightDiff ** 2));
        
        // 格式化SD为GSI格式
        const acv = `0000${Math.round(sd * 1000)}`;
        const adv = acv.slice(-8);
        gsiArr.push(`${FieldMap.sd}${adv}`);
        
        // 添加棱镜参数，确保格式为 51....+0000+034
        const pcValue = `000${+prismConstant}`.slice(-3);  // 确保棱镜参数是三位数
        gsiArr.push(`51....+0000+${pcValue}`);  // 固定前缀为 51....+0000+
        
        // 添加PH和IH
        const phValue = `0000${Math.round(+ph * 1000)}`.slice(-8);
        gsiArr.push(`${FieldMap.ph}${phValue}`);
        
        const ihValue = `0000${Math.round(+stationData.stationIH * 1000)}`.slice(-8);
        gsiArr.push(`${FieldMap.ih}${ihValue}`);
        
        const gsiData = gsiArr.join(' ');
        
        return gsiData;
    }

    // 定义结果表格的列
    const resultColumns = [
        {
            title: '点名',
            dataIndex: 'point',
            key: 'point',
        },
        {
            title: 'E坐标',
            dataIndex: 'e',
            key: 'e',
        },
        {
            title: 'N坐标',
            dataIndex: 'n',
            key: 'n',
        },
        {
            title: 'RL高程',
            dataIndex: 'rl',
            key: 'rl',
        },
        {
            title: 'PH棱镜高',
            dataIndex: 'ph',
            key: 'ph',
        },
        {
            title: '方位角(BRG)',
            dataIndex: 'brg',
            key: 'brg',
        },
        {
            title: '垂直角(VA)',
            dataIndex: 'va',
            key: 'va',
        },
        {
            title: '斜距(SD)',
            dataIndex: 'sd',
            key: 'sd',
        },
        {
            title: '水平距离(HD)',
            dataIndex: 'hd',
            key: 'hd',
        },
        {
            title: 'GSI数据',
            dataIndex: 'gsiData',
            key: 'gsiData',
            ellipsis: true,
        }
    ];

    return (
        <div className={styles.directionInverseContainer}>
            <Card
                className={styles.stationCard}
                title="文件名"
                style={{width: '100%', marginBottom: '16px'}}
            >
                <Input
                    placeholder="输入文件名（默认为当天日期YYMMDD）"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    style={{width: '100%'}}
                />
            </Card>
            
            <Card
                className={styles.stationCard}
                title="测站数据"
                style={{width: '100%'}}
            >
                <Form form={stationForm} layout="horizontal" style={{width: '100%'}}>
                    <Row gutter={24} style={{width: '100%'}}>
                        <Col xs={24} sm={12} md={6} lg={6}>
                            <Form.Item label="E坐标" required>
                                <Input
                                    type="number"
                                    pattern="[0-9]*\.[0-9]*"
                                    inputMode="decimal"
                                    placeholder="输入测站E坐标"
                                    value={stationData.stationE}
                                    onChange={(e) => handleStationChange('stationE', e.target.value)}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={6}>
                            <Form.Item label="N坐标" required>
                                <Input
                                    type="number"
                                    pattern="[0-9]*\.[0-9]*"
                                    inputMode="decimal"
                                    placeholder="输入测站N坐标"
                                    value={stationData.stationN}
                                    onChange={(e) => handleStationChange('stationN', e.target.value)}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={6}>
                            <Form.Item label="RL高程" required>
                                <Input
                                    placeholder="输入高程（可选）"
                                    value={stationData.stationRL}
                                    onChange={(e) => handleStationChange('stationRL', e.target.value)}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={6}>
                            <Form.Item label="IH仪器高" required>
                                <Input
                                    type="number"
                                    pattern="[0-9]*\.[0-9]*"
                                    inputMode="decimal"
                                    placeholder="输入仪器高"
                                    value={stationData.stationIH}
                                    onChange={(e) => handleStationChange('stationIH', e.target.value)}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Card>

            <Card
                className={styles.pointDataCard}
                title={
                    <div
                        style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%'}}>
                        <span>点位数据</span>
                        <Space>
                            <Upload
                                beforeUpload={handleImport}
                                showUploadList={false}
                            >
                                <Button icon={<UploadOutlined/>}>
                                    导入Excel
                                </Button>
                            </Upload>
                            <Button icon={<DownloadOutlined/>} onClick={() => downloadTemplate()}>下载模板</Button>
                        </Space>
                    </div>
                }
                style={{width: '100%'}}
            >
                <div className={styles.pointDataHeader}>
                    <Row gutter={16} style={{width: '100%', textAlign: 'center', fontWeight: 'bold'}}>
                        <Col xs={24} sm={12} md={3} lg={3}>Point</Col>
                        <Col xs={24} sm={12} md={4} lg={4}>E坐标</Col>
                        <Col xs={24} sm={12} md={4} lg={4}>N坐标</Col>
                        <Col xs={24} sm={12} md={3} lg={3}>RL高程</Col>
                        <Col xs={24} sm={12} md={3} lg={3}>PH棱镜高</Col>
                        <Col xs={24} sm={12} md={3} lg={3}>棱镜参数</Col>
                        <Col xs={24} sm={12} md={3} lg={3}>备注</Col>
                        <Col span={1}>操作</Col>
                    </Row>
                </div>
                <Divider style={{margin: '8px 0 16px 0'}}/>

                <Form
                    form={form}
                    name="pointDataForm"
                    className={styles.pointDataForm}
                    style={{width: '100%'}}
                >
                    <Form.List
                        name="points"
                        initialValue={[{}]}
                    >
                        {(fields, {add, remove}) => (
                            <>
                                {fields.map(({key, name, ...restField}, index) => (
                                    <div key={key} className={styles.pointItem}>
                                        <Row gutter={16} align="middle" style={{width: '100%'}}>
                                            <Col xs={24} sm={12} md={3} lg={3}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'point']}
                                                >
                                                    <Input placeholder="输入点名"/>
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={12} md={4} lg={4}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'e']}
                                                    rules={[{required: true, message: '请输入E坐标'}]}
                                                >
                                                    <Input 
                                                        type="number"
                                                        pattern="[0-9]*\.[0-9]*"
                                                        inputMode="decimal"
                                                        placeholder="输入E坐标"
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={12} md={4} lg={4}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'n']}
                                                    rules={[{required: true, message: '请输入N坐标'}]}
                                                >
                                                    <Input 
                                                        type="number"
                                                        pattern="[0-9]*\.[0-9]*"
                                                        inputMode="decimal"
                                                        placeholder="输入N坐标"
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={12} md={3} lg={3}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'rl']}
                                                >
                                                    <Input 
                                                        placeholder="输入高程（可选）"
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={12} md={3} lg={3}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'ph']}
                                                >
                                                    <Input 
                                                        placeholder="输入棱镜高（可选）"
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={12} md={3} lg={3}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'prismConstant']}
                                                    initialValue="0"
                                                >
                                                    <Input 
                                                        type="number" 
                                                        pattern="[0-9]*\.[0-9]*"
                                                        inputMode="decimal"
                                                        placeholder="棱镜参数"
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={12} md={3} lg={3}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'remarks']}
                                                >
                                                    <Input placeholder="输入备注（可选）"/>
                                                </Form.Item>
                                            </Col>
                                            <Col span={1}>
                                                {fields.length > 1 && (
                                                    <MinusCircleOutlined
                                                        className={styles.deleteIcon}
                                                        onClick={() => remove(name)}
                                                    />
                                                )}
                                            </Col>
                                        </Row>
                                        {index < fields.length - 1 && <Divider style={{margin: '8px 0'}}/>}
                                    </div>
                                ))}
                                <Form.Item style={{marginTop: 16}}>
                                    <Button
                                        type="dashed"
                                        onClick={() => add()}
                                        icon={<PlusOutlined/>}
                                        style={{width: '100%'}}
                                    >
                                        添加点位
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                </Form>
            </Card>

            <div className={styles.actionButtons}>
                <Button type="primary" size="large" onClick={handleSubmit}>
                    计算坐标
                </Button>
            </div>
            
            {/* 计算结果区域 */}
            {showResults && (
                <Card
                    className={styles.resultsCard}
                    title="计算结果"
                    style={{width: '100%', marginTop: '20px'}}
                    extra={
                        <Button 
                            type="primary" 
                            icon={<DownloadOutlined/>} 
                            onClick={handleExportAllGsi}
                        >
                            导出GSI文件
                        </Button>
                    }
                >
                    <Table
                        columns={resultColumns}
                        dataSource={calculationResults}
                        pagination={false}
                        scroll={{ x: true }}
                        style={{ overflowX: 'auto' }}
                    />
                </Card>
            )}
        </div>
    );
};

export default DirectionInverse;
