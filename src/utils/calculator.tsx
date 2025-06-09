import React, { useState } from "react";
import { X } from "lucide-react";
import { CalculatorModalProps } from "@/interfaces/interface";

const CalculatorModal: React.FC<CalculatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [input, setInput] = useState<string>("0");
  const [previousInput, setPreviousInput] = useState<string>("");
  const [operation, setOperation] = useState<string | null>(null);
  const [overwrite, setOverwrite] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleNumberInput = (number: string) => {
    if (input === "0" || overwrite) {
      setInput(number);
      setOverwrite(false);
    } else {
      setInput(`${input}${number}`);
    }
  };

  const handleDecimal = () => {
    if (overwrite) {
      setInput("0.");
      setOverwrite(false);
      return;
    }

    if (!input.includes(".")) {
      setInput(`${input}.`);
    }
  };

  const handleOperation = (op: string) => {
    if (input === "0" && previousInput === "") return;

    if (previousInput === "") {
      setPreviousInput(input);
    } else {
      const result = calculate();
      setPreviousInput(result);
    }

    setOperation(op);
    setOverwrite(true);
  };

  const calculate = (): string => {
    if (!operation || previousInput === "") return input;

    const prev = parseFloat(previousInput);
    const current = parseFloat(input);

    let result = 0;
    switch (operation) {
      case "+":
        result = prev + current;
        break;
      case "-":
        result = prev - current;
        break;
      case "×":
        result = prev * current;
        break;
      case "÷":
        result = prev / current;
        break;
      default:
        return input;
    }

    return result.toString();
  };

  const handleEquals = () => {
    if (operation === null) return;

    const result = calculate();
    setInput(result);
    setPreviousInput("");
    setOperation(null);
    setOverwrite(true);
  };

  const handleClear = () => {
    setInput("0");
    setPreviousInput("");
    setOperation(null);
    setOverwrite(true);
  };

  //   const handleDelete = () => {
  //     if (input.length === 1 || (input.length === 2 && input.startsWith("-"))) {
  //       setInput("0");
  //     } else {
  //       setInput(input.slice(0, -1));
  //     }
  //   };

  const handlePercentage = () => {
    const value = parseFloat(input);
    setInput((value / 100).toString());
  };

  const handlePlusMinus = () => {
    setInput(input.startsWith("-") ? input.slice(1) : `-${input}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
        <div className="flex justify-between items-center bg-gradient-to-r from-orange-500 to-amber-600 p-4 text-white">
          <h3 className="text-xl font-bold">Quick Calculator</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-orange-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 bg-gray-50">
          <div className="text-right text-gray-500 text-sm h-6">
            {previousInput} {operation}
          </div>
          <div className="text-right text-3xl font-bold mb-4 overflow-x-auto">
            {input}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 p-4">
          <button
            onClick={handleClear}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-lg transition"
          >
            AC
          </button>
          <button
            onClick={handlePlusMinus}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-lg transition"
          >
            +/-
          </button>
          <button
            onClick={handlePercentage}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-lg transition"
          >
            %
          </button>
          <button
            onClick={() => handleOperation("÷")}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-lg transition"
          >
            ÷
          </button>

          {[7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberInput(num.toString())}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-lg transition"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handleOperation("×")}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-lg transition"
          >
            ×
          </button>

          {[4, 5, 6].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberInput(num.toString())}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-lg transition"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handleOperation("-")}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-lg transition"
          >
            -
          </button>

          {[1, 2, 3].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberInput(num.toString())}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-lg transition"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handleOperation("+")}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-lg transition"
          >
            +
          </button>

          <button
            onClick={() => handleNumberInput("0")}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-lg col-span-2 transition"
          >
            0
          </button>
          <button
            onClick={handleDecimal}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-lg transition"
          >
            .
          </button>
          <button
            onClick={handleEquals}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-lg transition"
          >
            =
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalculatorModal;
