import React from 'react';

/**
 * Reusable Card component for layout blocks and user interfaces.
 */
export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 dark:backdrop-blur-xl ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div
      className={`flex flex-col space-y-1.5 p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3
      className={`text-xl font-bold tracking-tight font-outfit text-gray-900 dark:text-white ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '', ...props }) {
  return (
    <p
      className={`text-sm text-gray-500 dark:text-gray-400 font-sans ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div
      className={`flex items-center p-6 pt-0 border-t border-gray-50 dark:border-white/10 mt-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
