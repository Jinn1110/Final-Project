"use client";

import React from "react";
import { Maximize2, Download, MoreVertical } from "lucide-react";

export default function ChartPanel({ title, children, className = "" }) {
  return (
    <div
      className={`bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden group ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-950/50">
        <h3 className="text-sm font-semibold text-neutral-100">{title}</h3>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1 hover:bg-neutral-800 rounded">
            <Maximize2 size={14} className="text-neutral-400" />
          </button>
          <button className="p-1 hover:bg-neutral-800 rounded">
            <Download size={14} className="text-neutral-400" />
          </button>
          <button className="p-1 hover:bg-neutral-800 rounded">
            <MoreVertical size={14} className="text-neutral-400" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">{children}</div>
    </div>
  );
}
