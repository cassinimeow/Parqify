import React from 'react';

/**
 * Reusable Button component for the Parqify Design System.
 * Supports primary, secondary, outline, ghost, and danger variants.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variants = {
    primary: 'bg-brand-maroon-800 text-white hover:bg-brand-maroon-700 active:bg-brand-maroon-900 focus:ring-brand-maroon-800 shadow-md hover:shadow-lg dark:bg-brand-maroon-700 dark:hover:bg-brand-maroon-600',
    secondary: 'bg-brand-gold-600 text-brand-gold-950 hover:bg-brand-gold-500 active:bg-brand-gold-700 focus:ring-brand-gold-600 shadow-md hover:shadow-lg dark:bg-brand-gold-500 dark:text-black dark:hover:bg-brand-gold-400',
    outline: 'border border-brand-maroon-800 text-brand-maroon-800 hover:bg-brand-maroon-50/50 focus:ring-brand-maroon-800 dark:border-brand-maroon-500 dark:text-brand-maroon-400 dark:hover:bg-brand-maroon-950/20',
    ghost: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-300 dark:text-gray-300 dark:hover:bg-zinc-800/80 dark:hover:text-white',
    danger: 'bg-red-600 text-white hover:bg-red-500 active:bg-red-700 focus:ring-red-500 shadow-md hover:shadow-lg dark:bg-red-700 dark:hover:bg-red-600',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs font-semibold tracking-wide',
    md: 'px-5 py-2.5 text-sm font-semibold tracking-wide',
    lg: 'px-6 py-3 text-base font-semibold tracking-wide',
  };

  const currentVariant = variants[variant] || variants.primary;
  const currentSize = sizes[size] || sizes.md;

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${currentVariant} ${currentSize} ${className}`}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
