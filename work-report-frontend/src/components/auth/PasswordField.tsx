import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { AuthField } from './AuthField';

interface PasswordFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
  helperText?: string;
  optional?: boolean;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  error,
  helperText,
  optional = false,
  ...inputProps
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthField
      label={label}
      error={error}
      helperText={helperText}
      optional={optional}
      type={showPassword ? 'text' : 'password'}
      icon={Lock}
      rightElement={
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          tabIndex={-1}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      }
      {...inputProps}
    />
  );
};
