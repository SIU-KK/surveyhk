import React, { useState, useEffect } from 'react';
import { Button, Row, Col, Drawer } from 'antd';
import { 
  DeleteOutlined, 
  CheckOutlined,
  MinusOutlined
} from '@ant-design/icons';
import styles from './NumericKeyboard.module.css';

// 创建一个全局事件总线
export const keyboardEventBus = {
  listeners: {},
  subscribe: function(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
  },
  publish: function(event, data) {
    if (!this.listeners[event]) {
      return;
    }
    this.listeners[event].forEach(callback => callback(data));
  }
};

// 全局键盘状态
let currentInputId = null;
let currentValue = '';
let currentCallback = null;
let currentConfirmCallback = null;
let currentAllowNegative = true;
let currentAllowDecimal = true;

const GlobalNumericKeyboard = () => {
  const [visible, setVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [allowNegative, setAllowNegative] = useState(true);
  const [allowDecimal, setAllowDecimal] = useState(true);

  useEffect(() => {
    // 订阅显示键盘事件
    const showSubscription = keyboardEventBus.subscribe('showKeyboard', (data) => {
      console.log('showKeyboard event received:', data);
      currentInputId = data.inputId;
      currentValue = data.value || '';
      currentCallback = data.onChange;
      currentConfirmCallback = data.onConfirm;
      currentAllowNegative = data.allowNegative !== undefined ? data.allowNegative : true;
      currentAllowDecimal = data.allowDecimal !== undefined ? data.allowDecimal : true;
      
      setInputValue(currentValue);
      setAllowNegative(currentAllowNegative);
      setAllowDecimal(currentAllowDecimal);
      setVisible(true);
    });

    // 订阅隐藏键盘事件
    const hideSubscription = keyboardEventBus.subscribe('hideKeyboard', () => {
      console.log('hideKeyboard event received');
      setVisible(false);
    });

    console.log('GlobalNumericKeyboard mounted, event listeners registered');

    return () => {
      showSubscription();
      hideSubscription();
      console.log('GlobalNumericKeyboard unmounted, event listeners removed');
    };
  }, []);

  const handleKeyPress = (key) => {
    let newValue = inputValue;

    if (key === 'clear') {
      newValue = '';
    } else if (key === 'delete') {
      newValue = newValue.slice(0, -1);
    } else if (key === '-') {
      if (allowNegative) {
        if (newValue.startsWith('-')) {
          newValue = newValue.substring(1);
        } else {
          newValue = '-' + newValue;
        }
      }
    } else if (key === '.') {
      if (allowDecimal && !newValue.includes('.')) {
        newValue = newValue + '.';
      }
    } else {
      // 数字键
      newValue = newValue + key;
    }

    setInputValue(newValue);
    if (currentCallback) {
      currentCallback(newValue);
    }
    // 发布键盘输入事件
    keyboardEventBus.publish('keyboardChange', { value: newValue, inputId: currentInputId });
  };

  const handleClose = () => {
    setVisible(false);
  };

  const handleConfirm = () => {
    if (currentConfirmCallback) {
      currentConfirmCallback(inputValue);
    }
    // 发布键盘确认事件
    keyboardEventBus.publish('keyboardConfirm', { value: inputValue, inputId: currentInputId });
    setVisible(false);
  };

  return (
    <Drawer
      placement="bottom"
      onClose={handleClose}
      open={visible}
      height={320}
      closable={false}
      contentWrapperStyle={{ 
        borderTopLeftRadius: '16px', 
        borderTopRightRadius: '16px',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
      className={styles.keyboardDrawer}
      maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
    >
      <div className={styles.keyboard}>
        {/* 顶部功能按钮行 */}
        <div className={styles.topRow}>
          <Button 
            className={styles.clearButton} 
            onClick={() => handleKeyPress('clear')}
          >
            清除
          </Button>
          <Button 
            className={styles.confirmButton} 
            type="primary"
            onClick={handleConfirm}
            icon={<CheckOutlined />}
          >
            确认
          </Button>
        </div>

        {/* 数字键盘行 */}
        <Row gutter={[8, 8]} className={styles.keyboardRow}>
          <Col span={8}>
            <Button 
              className={styles.keyButton} 
              onClick={() => handleKeyPress('1')}
            >
              1
            </Button>
          </Col>
          <Col span={8}>
            <Button 
              className={styles.keyButton} 
              onClick={() => handleKeyPress('2')}
            >
              2
            </Button>
          </Col>
          <Col span={8}>
            <Button 
              className={styles.keyButton} 
              onClick={() => handleKeyPress('3')}
            >
              3
            </Button>
          </Col>
        </Row>

        <Row gutter={[8, 8]} className={styles.keyboardRow}>
          <Col span={8}>
            <Button 
              className={styles.keyButton} 
              onClick={() => handleKeyPress('4')}
            >
              4
            </Button>
          </Col>
          <Col span={8}>
            <Button 
              className={styles.keyButton} 
              onClick={() => handleKeyPress('5')}
            >
              5
            </Button>
          </Col>
          <Col span={8}>
            <Button 
              className={styles.keyButton} 
              onClick={() => handleKeyPress('6')}
            >
              6
            </Button>
          </Col>
        </Row>

        <Row gutter={[8, 8]} className={styles.keyboardRow}>
          <Col span={8}>
            <Button 
              className={styles.keyButton} 
              onClick={() => handleKeyPress('7')}
            >
              7
            </Button>
          </Col>
          <Col span={8}>
            <Button 
              className={styles.keyButton} 
              onClick={() => handleKeyPress('8')}
            >
              8
            </Button>
          </Col>
          <Col span={8}>
            <Button 
              className={styles.keyButton} 
              onClick={() => handleKeyPress('9')}
            >
              9
            </Button>
          </Col>
        </Row>

        <Row gutter={[8, 8]} className={styles.keyboardRow}>
          <Col span={8}>
            <Button 
              className={styles.keyButton} 
              onClick={() => handleKeyPress('.')}
              disabled={!allowDecimal}
            >
              .
            </Button>
          </Col>
          <Col span={8}>
            <Button 
              className={styles.keyButton} 
              onClick={() => handleKeyPress('0')}
            >
              0
            </Button>
          </Col>
          <Col span={8}>
            <Button 
              className={styles.keyButton} 
              onClick={() => handleKeyPress('delete')}
              icon={<DeleteOutlined />}
            />
          </Col>
        </Row>

        <Row gutter={[8, 8]} className={styles.keyboardRow}>
          <Col span={24}>
            <Button 
              className={`${styles.keyButton} ${styles.minusButton}`}
              onClick={() => handleKeyPress('-')}
              disabled={!allowNegative}
              icon={<MinusOutlined />}
            >
              负号
            </Button>
          </Col>
        </Row>
      </div>
    </Drawer>
  );
};

export default GlobalNumericKeyboard; 