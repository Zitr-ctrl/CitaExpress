import { type InputHTMLAttributes, forwardRef } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div>
        <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 rounded-lg border transition-colors
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
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
