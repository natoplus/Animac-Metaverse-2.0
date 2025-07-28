import React from 'react';

export const Textarea = ({ className = '', ...props }) => {
  return (
    <textarea
      className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-400 resize-none ${className}`}
      {...props}
    />
  );
};
