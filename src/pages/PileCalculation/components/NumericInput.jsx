import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, message } from 'antd';
import { CheckOutlined, MinusOutlined, CopyOutlined } from '@ant-design/icons';
import styles from './NumericInput.module.css';

const NumericInput = ({ 
  value, 
  onChange, 
  placeholder, 
  allowNegative = true,
  allowDecimal = true,
  ...props 
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const inputRef = useRef(null);
  const pasteTextAreaRef = useRef(null);

  // 创建和清理 textarea 用于粘贴
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
    if (value !== undefined) {
      setInputValue(value);
    }
  }, [value]);

  // 验证数值格式
  const validateValue = (value) => {
    // 移除所有空白字符
    const cleanValue = value.replace(/\s+/g, '');
    
    // 验证是否为有效数字
    if (allowDecimal) {
      // 允许小数点的情况
      return /^-?\d*\.?\d*$/.test(cleanValue);
    } else {
      // 不允许小数点的情况
      return /^-?\d*$/.test(cleanValue);
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    if (validateValue(newValue)) {
      setInputValue(newValue);
      if (onChange) {
        onChange(newValue);
      }
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

  return (
    <div className={styles.inputWrapper}>
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        inputMode="decimal"
        type="text"
        pattern={allowDecimal ? "[0-9]*[.,]?[0-9]*" : "[0-9]*"}
        {...props}
      />
    </div>
  );
};

export default NumericInput; 