import React from 'react';

/**
 * Reusable Input field for forms and search bars in the Parqify Design System.
 * Supports labels, helper text, error messages, and leading icons.
 */
export default function Input({
  label,
  error,
  helperText,
  className = '',
  id,
  type = 'text',
  icon,
  ...props
}) {
  return (
    <div className="flex flex-col space-y-1.5 w-full">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-semibold text-gray-700 dark:text-gray-300 font-sans"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {icon && (
          <div className="absolute left-3 text-gray-400 dark:text-gray-500 pointer-events-none flex items-center justify-center">
            {icon}
          </div>
        )}
        <input
          id={id}
          type={type}
          className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-all duration-200 focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${icon ? 'pl-10' : ''}
            ${
              error
                ? 'border-red-500 focus:ring-red-200 focus:border-red-500 dark:border-red-800'
                : 'border-gray-200 hover:border-gray-300 focus:ring-brand-maroon-100 focus:border-brand-maroon-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:ring-brand-maroon-950 dark:focus:border-brand-maroon-700'
            }
            ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs font-semibold text-red-600 dark:text-red-400 font-sans">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p className="text-xs text-gray-500 dark:text-gray-400 font-sans">
          {helperText}
        </p>
      )}
    </div>
  );
}
