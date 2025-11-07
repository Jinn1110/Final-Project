import React from "react";

const Button = ({ children, className }) => {
  return (
    <button
      className={`
      text-[#04BA76] 
      font-light 
      bg-transparent 
      px-6 py-2 
      rounded-full 
      border border-[#04BA76] 
      transition-colors duration-300 
      hover:bg-[#04BA76] 
      hover:text-white
      ${className}  /* cho phép truyền thêm class từ ngoài */
    `}
    >
      {children}
    </button>
  );
};

export default Button;
