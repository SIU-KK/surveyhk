import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, message } from 'antd';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';
import styles from './NumericInput.module.css';

const NumericInput = ({ value, onChange, placeholder, inputMode = 'decimal', pattern, type = 'text', ...props }) => {
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const inputRef = useRef(null);
  const keyboardRef = useRef(null);
  const pasteTextAreaRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // 创建和清理 textarea
  useEffect(() => {
    const textarea = document.createElement('textarea');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    document.body.appendChild(textarea);
    pasteTextAreaRef.current = textarea;

    return () => {
      if (pasteTextAreaRef.current && document.body.contains(pasteTextAreaRef.current)) {
        document.body.removeChild(pasteTextAreaRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // 检测是否为移动设备
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    };
    setIsMobile(checkMobile());
  }, []);

  // 验证数值格式
  const validateValue = (value) => {
    // 移除所有空白字符
    const cleanValue = value.replace(/\s+/g, '');

    // 如果有指定的pattern，优先使用pattern验证
    if (pattern) {
      const regex = new RegExp(pattern);
      if (regex.test(cleanValue)) {
        // 对于角度格式（DD.MMSS）进行额外验证
        if (pattern === '\\d{1,3}\\.\\d{4}') {
          const parts = cleanValue.split('.');
          if (parts.length === 2) {
            const minutes = parseInt(parts[1].substring(0, 2));
            const seconds = parseInt(parts[1].substring(2, 4));
            return minutes < 60 && seconds < 60;
          }
        }
        return true;
      }
      return false;
    }

    // 如果没有pattern，验证是否为有效数字
    return !isNaN(cleanValue) && cleanValue.length > 0;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (keyboardRef.current && !keyboardRef.current.contains(event.target) && 
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowKeyboard(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const cleanText = text.replace(/\s+/g, '');
      
      if (validateValue(cleanText)) {
        setInputValue(cleanText);
        if (onChange) {
          onChange(cleanText);
        }
        message.success('已粘贴');
      } else {
        message.error('无效的数值格式');
      }
    } catch (error) {
      // 如果 Clipboard API 失败，尝试使用 execCommand
      try {
        if (pasteTextAreaRef.current) {
          pasteTextAreaRef.current.value = '';
          pasteTextAreaRef.current.focus();
          document.execCommand('paste');
          const text = pasteTextAreaRef.current.value;
          const cleanText = text.replace(/\s+/g, '');
          
          if (validateValue(cleanText)) {
            setInputValue(cleanText);
            if (onChange) {
              onChange(cleanText);
            }
            message.success('已粘贴');
          } else {
            message.error('无效的数值格式');
          }
        }
      } catch (fallbackError) {
        message.error('粘贴失败，请手动输入');
      }
      
      // 恢复输入框焦点
      inputRef.current?.focus();
    }
  };

  const handleKeyClick = (key) => {
    let newValue = inputValue || '';
    if (key === 'backspace') {
      newValue = newValue.slice(0, -1);
    } else if (key === 'clear') {
      newValue = '';
    } else if (key === '.') {
      if (!newValue.includes('.')) {
        newValue += key;
      }
    } else if (key === 'paste') {
      handlePaste();
      return;
    } else if (key === 'done') {
      setShowKeyboard(false);
      return;
    } else {
      newValue += key;
    }

    setInputValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleInputClick = () => {
    if (isMobile) {
      setShowKeyboard(true);
    }
  };

  const renderKeyboard = () => {
    const keys = [
      ['7', '8', '9'],
      ['4', '5', '6'],
      ['1', '2', '3'],
      ['.', '0', 'backspace']
    ];

    return (
      <div className={styles.keyboard}>
        <div className={styles.keyboardHeader}>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            className={styles.doneButton}
            onClick={() => handleKeyClick('done')}
          >
            完成
          </Button>
          <Button 
            type="text" 
            icon={<CopyOutlined />}
            className={styles.pasteButton}
            onClick={() => handleKeyClick('paste')}
          >
            粘贴
          </Button>
          <Button 
            type="text" 
            className={styles.clearButton}
            onClick={() => handleKeyClick('clear')}
          >
            清除
          </Button>
        </div>
        <div className={styles.keyboardGrid}>
          {keys.map((row, rowIndex) => (
            <div key={rowIndex} className={styles.keyboardRow}>
              {row.map((key) => (
                <button
                  key={key}
                  className={`${styles.key} ${key === 'backspace' ? styles.backspace : ''}`}
                  onClick={() => handleKeyClick(key)}
                >
                  {key === 'backspace' ? '←' : key}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.inputWrapper}>
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleInputClick}
        placeholder={placeholder}
        readOnly={isMobile}
        inputMode={inputMode}
        pattern={pattern}
        type={type}
        {...props}
      />
      {isMobile && showKeyboard && (
        <div className={styles.keyboardWrapper}>
          {renderKeyboard()}
        </div>
      )}
    </div>
  );
};

export default NumericInput; 