import React from 'react';
import PropTypes from 'prop-types';

export const Input = ({
  className = '',
  size = 'md',
  variant = 'default',
  ...props
}) => {
  const sizeStyles = {
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-2',
    lg: 'text-lg px-4 py-3',
  };

  const variantStyles = {
    default: 'border border-gray-300 dark:border-white/10 bg-white dark:bg-zinc-900 text-black dark:text-white',
    transparent: 'bg-transparent border border-white/20 text-white placeholder-white/60',
  };

  const focusStyles = 'focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all';

  return (
    <input
      className={`
        w-full rounded-md ${focusStyles}
        ${variantStyles[variant] || variantStyles.default}
        ${sizeStyles[size] || sizeStyles.md}
        ${className}
      `}
      {...props}
    />
  );
};

Input.propTypes = {
  className: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['default', 'transparent']),
};
