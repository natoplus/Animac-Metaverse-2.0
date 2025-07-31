import React from 'react';
import PropTypes from 'prop-types';

export const Textarea = ({
  className = '',
  size = 'md',
  variant = 'default',
  rounded = 'md',
  rows = 4,
  ...props
}) => {
  const sizeStyles = {
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-2',
    lg: 'text-lg px-4 py-3',
  };

  const variantStyles = {
    default:
      'border border-gray-300 dark:border-white/10 bg-white dark:bg-zinc-900 text-black dark:text-white placeholder-gray-400 dark:placeholder-white/40',
    transparent:
      'bg-transparent border border-white/20 text-white placeholder-white/60',
  };

  const roundedStyles = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  const focusStyles =
    'focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all';

  return (
    <textarea
      rows={rows}
      className={`
        w-full resize-none ${focusStyles}
        ${variantStyles[variant] || variantStyles.default}
        ${sizeStyles[size] || sizeStyles.md}
        ${roundedStyles[rounded] || roundedStyles.md}
        ${className}
      `}
      {...props}
    />
  );
};

Textarea.propTypes = {
  className: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['default', 'transparent']),
  rounded: PropTypes.oneOf(['sm', 'md', 'lg', 'full']),
  rows: PropTypes.number,
};
