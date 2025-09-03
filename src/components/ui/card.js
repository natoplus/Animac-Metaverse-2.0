import React from 'react';
import PropTypes from 'prop-types';

export const Card = ({
  children,
  className = '',
  variant = 'default',
  shadow = 'md',
  rounded = 'lg',
  bordered = true,
  glow = false,
}) => {
  const baseStyles = 'transition-all';

  const variantStyles = {
    default: `bg-black text-white dark:bg-black dark:text-white`,
    glow: `bg-black bg-opacity-30 dark:bg-opacity-50 backdrop-blur-sm ${
      glow ? 'shadow-[0_0_15px_rgba(255,255,255,0.1)] dark:shadow-[0_0_15px_rgba(255,255,255,0.05)]' : ''
    } text-white`,
  };

  const borderStyles = bordered
    ? 'border border-gray-800 dark:border-white/20'
    : 'border-none';
  const roundedStyle = `rounded-${rounded}`;
  const shadowStyle =
    shadow === 'none'
      ? ''
      : `shadow-${shadow} dark:shadow-[0_0_10px_rgba(255,255,255,0.05)]`;

  return (
    <div
      className={`
        ${baseStyles}
        ${variantStyles[variant] || variantStyles.default}
        ${roundedStyle}
        ${shadowStyle}
        ${borderStyles}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'glow']),
  shadow: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'none']),
  rounded: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', '2xl']),
  bordered: PropTypes.bool,
  glow: PropTypes.bool,
};

export const CardContent = ({ children, className = '', padding = '4' }) => {
  return (
    <div
      className={`p-${padding} bg-black dark:bg-black text-white ${className}`}
    >
      {children}
    </div>
  );
};

CardContent.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  padding: PropTypes.oneOf(['2', '4', '6', '8']),
};
