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
    default: `bg-white dark:bg-zinc-900`,
    glow: `bg-black bg-opacity-30 backdrop-blur-sm border border-white/10 ${
      glow ? 'shadow-[0_0_10px_rgba(255,255,255,0.1)]' : ''
    }`,
  };

  const borderStyles = bordered ? 'border border-gray-200 dark:border-white/10' : 'border-none';
  const roundedStyle = `rounded-${rounded}`;
  const shadowStyle = `shadow-${shadow}`;

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
    <div className={`p-${padding} ${className}`}>
      {children}
    </div>
  );
};

CardContent.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  padding: PropTypes.oneOf(['2', '4', '6', '8']),
};
