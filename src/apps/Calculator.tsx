import { useState, useEffect, useCallback } from 'react';

export const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputNumber = useCallback((num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  }, [display, waitingForOperand]);

  const inputDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  }, [display, waitingForOperand]);

  const clear = useCallback(() => {
    setDisplay('0');
    setExpression('');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  }, []);

  const clearEntry = useCallback(() => {
    setDisplay('0');
  }, []);

  const backspace = useCallback(() => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  }, [display]);

  const performOperation = useCallback((nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setExpression(`${display} ${nextOperation}`);
    setWaitingForOperand(true);
    setOperation(nextOperation);
  }, [display, previousValue, operation]);

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : 0;
      case '%': return a % b;
      default: return b;
    }
  };

  const performCalculation = useCallback(() => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setExpression(`${previousValue} ${operation} ${inputValue} =`);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  }, [display, previousValue, operation]);

  const performUnary = useCallback((func: (n: number) => number, symbol: string) => {
    const value = parseFloat(display);
    const result = func(value);
    setExpression(`${symbol}(${display})`);
    setDisplay(String(result));
    setWaitingForOperand(true);
  }, [display]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') inputNumber(e.key);
      if (e.key === '.') inputDecimal();
      if (e.key === 'Backspace') backspace();
      if (e.key === 'Escape') clear();
      if (e.key === 'Enter' || e.key === '=') performCalculation();
      if (e.key === '+') performOperation('+');
      if (e.key === '-') performOperation('-');
      if (e.key === '*') performOperation('×');
      if (e.key === '/') performOperation('÷');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputNumber, inputDecimal, backspace, clear, performCalculation, performOperation]);

  const Button: React.FC<{
    label: string;
    onClick: () => void;
    className?: string;
    colSpan?: number;
  }> = ({ label, onClick, className = '', colSpan = 1 }) => (
    <button
      onClick={onClick}
      className={`h-14 text-lg font-medium rounded transition-all active:scale-95 ${className}`}
      style={{ gridColumn: `span ${colSpan}` }}
    >
      {label}
    </button>
  );

  return (
    <div className="h-full flex flex-col bg-[#1a1a28]">
      {/* Display */}
      <div className="p-6 pb-4">
        <div className="text-right text-gray-400 text-sm h-6 mb-1">{expression}</div>
        <div className="text-right text-white text-5xl font-light tracking-tight overflow-hidden">
          {display}
        </div>
      </div>

      {/* Keypad */}
      <div className="flex-1 p-3 grid grid-cols-4 gap-1.5">
        {/* Row 1 */}
        <Button label="%" onClick={() => performOperation('%')} className="bg-[#2a2a3d] text-blue-300 hover:bg-[#3a3a4d]" />
        <Button label="CE" onClick={clearEntry} className="bg-[#2a2a3d] text-blue-300 hover:bg-[#3a3a4d]" />
        <Button label="C" onClick={clear} className="bg-[#2a2a3d] text-blue-300 hover:bg-[#3a3a4d]" />
        <Button label="⌫" onClick={backspace} className="bg-[#2a2a3d] text-blue-300 hover:bg-[#3a3a4d]" />

        {/* Row 2 */}
        <Button label="1/x" onClick={() => performUnary((n) => 1 / n, '1/')} className="bg-[#2a2a3d] text-blue-300 hover:bg-[#3a3a4d]" />
        <Button label="x²" onClick={() => performUnary((n) => n * n, 'sqr')} className="bg-[#2a2a3d] text-blue-300 hover:bg-[#3a3a4d]" />
        <Button label="√" onClick={() => performUnary(Math.sqrt, '√')} className="bg-[#2a2a3d] text-blue-300 hover:bg-[#3a3a4d]" />
        <Button label="÷" onClick={() => performOperation('÷')} className="bg-[#2a2a3d] text-blue-300 hover:bg-[#3a3a4d]" />

        {/* Row 3 */}
        <Button label="7" onClick={() => inputNumber('7')} className="bg-[#333347] text-white hover:bg-[#434357]" />
        <Button label="8" onClick={() => inputNumber('8')} className="bg-[#333347] text-white hover:bg-[#434357]" />
        <Button label="9" onClick={() => inputNumber('9')} className="bg-[#333347] text-white hover:bg-[#434357]" />
        <Button label="×" onClick={() => performOperation('×')} className="bg-[#2a2a3d] text-blue-300 hover:bg-[#3a3a4d]" />

        {/* Row 4 */}
        <Button label="4" onClick={() => inputNumber('4')} className="bg-[#333347] text-white hover:bg-[#434357]" />
        <Button label="5" onClick={() => inputNumber('5')} className="bg-[#333347] text-white hover:bg-[#434357]" />
        <Button label="6" onClick={() => inputNumber('6')} className="bg-[#333347] text-white hover:bg-[#434357]" />
        <Button label="-" onClick={() => performOperation('-')} className="bg-[#2a2a3d] text-blue-300 hover:bg-[#3a3a4d]" />

        {/* Row 5 */}
        <Button label="1" onClick={() => inputNumber('1')} className="bg-[#333347] text-white hover:bg-[#434357]" />
        <Button label="2" onClick={() => inputNumber('2')} className="bg-[#333347] text-white hover:bg-[#434357]" />
        <Button label="3" onClick={() => inputNumber('3')} className="bg-[#333347] text-white hover:bg-[#434357]" />
        <Button label="+" onClick={() => performOperation('+')} className="bg-[#2a2a3d] text-blue-300 hover:bg-[#3a3a4d]" />

        {/* Row 6 */}
        <Button label="±" onClick={() => performUnary((n) => -n, 'negate')} className="bg-[#333347] text-white hover:bg-[#434357]" />
        <Button label="0" onClick={() => inputNumber('0')} className="bg-[#333347] text-white hover:bg-[#434357]" />
        <Button label="." onClick={inputDecimal} className="bg-[#333347] text-white hover:bg-[#434357]" />
        <Button label="=" onClick={performCalculation} className="bg-[#0078d4] text-white hover:bg-[#1084d8]" />
      </div>
    </div>
  );
};
