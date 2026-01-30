import React, { useState } from 'react';
import EyeIcon from './icons/EyeIcon';
import EyeOffIcon from './icons/EyeOffIcon';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, id, type = 'text', ...props }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPasswordField = type === 'password';

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  return (
    <div className="relative">
      <input
        id={id}
        type={isPasswordField ? (isPasswordVisible ? 'text' : 'password') : type}
        className="block w-full px-1 py-3 bg-transparent border-0 border-b-2 border-gray-600/50 text-white placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-emerald-500 transition-colors duration-300 peer"
        placeholder=" "
        {...props}
      />
      <label
        htmlFor={id}
        className="absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-gray-800/80 px-2 peer-focus:px-2 peer-focus:text-emerald-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
      >
        {label}
      </label>
      {isPasswordField && (
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
          aria-label={isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      )}
    </div>
  );
};

export default InputField;