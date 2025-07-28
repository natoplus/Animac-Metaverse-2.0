import React from 'react';

export const Button = ({ children, className = '', variant = 'default', size = 'md', ...props }) => {
  const baseStyles = 'rounded-md font-semibold transition-all';
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
  };
  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-5 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
