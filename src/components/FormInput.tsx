import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  helperText,
  type = 'text',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password';

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-apple-text mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type={isPasswordField && showPassword ? 'text' : type}
          className={`input-field ${
            error
              ? 'border-apple-red focus:ring-apple-red/20 focus:border-apple-red'
              : ''
          }`}
          {...props}
        />
        {isPasswordField && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-apple-text-secondary hover:text-apple-text"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="text-apple-red text-xs mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
      {helperText && <p className="text-apple-text-secondary text-xs mt-1">{helperText}</p>}
    </div>
  );
};
