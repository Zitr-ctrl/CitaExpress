import { type InputHTMLAttributes, forwardRef, useState } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  showPasswordToggle?: boolean;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, className = '', showPasswordToggle, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordType = type === 'password';

    return (
      <div>
        <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            type={isPasswordType && showPassword ? 'text' : type}
            className={`
              w-full px-4 py-3 pr-11 rounded-lg border transition-colors
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white
              placeholder-gray-400 dark:placeholder-gray-500
              focus:ring-2 focus:ring-indigo-500 focus:border-transparent
              disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed
              ${error
                ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-600'
              }
              ${className}
            `}
            {...props}
          />
          {showPasswordToggle && isPasswordType && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                  <line x1="2" x2="22" y1="2" y2="22" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
