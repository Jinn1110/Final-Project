import { forwardRef } from "react";

const Button = forwardRef(({ className = "", ...props }, ref) => (
  <button
    ref={ref}
    className={`px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors ${className}`}
    {...props}
  />
));

Button.displayName = "Button";

export { Button };
