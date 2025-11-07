"use client";

import { useState } from "react";

export function DropdownMenu({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block">
      {children.map((child) =>
        child.type === DropdownMenuTrigger
          ? {
              ...child,
              props: { ...child.props, onClick: () => setOpen(!open) },
            }
          : child.type === DropdownMenuContent
          ? open
            ? child
            : null
          : child
      )}
    </div>
  );
}

export function DropdownMenuTrigger({ asChild, children, onClick }) {
  return <div onClick={onClick}>{children}</div>;
}

export function DropdownMenuContent({ children, className = "" }) {
  return (
    <div
      className={`absolute top-full left-0 mt-2 min-w-48 rounded-md shadow-lg z-50 ${className}`}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({ children, onClick, className = "" }) {
  return (
    <div
      onClick={onClick}
      className={`px-4 py-2 cursor-pointer hover:bg-slate-700 ${className}`}
    >
      {children}
    </div>
  );
}
