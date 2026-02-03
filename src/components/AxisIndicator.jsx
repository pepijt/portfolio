import React from 'react';

const AxisIndicator = () => {
  return (
    <div className="absolute bottom-4 left-4 z-50 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-2">
      <svg width="60" height="60" viewBox="0 0 60 60">
        {/* Origin point */}
        <circle cx="20" cy="40" r="2" fill="#666" />

        {/* X axis (red) - points right */}
        <line x1="20" y1="40" x2="55" y2="40" stroke="#ef4444" strokeWidth="2" />
        <polygon points="55,40 50,37 50,43" fill="#ef4444" />
        <text x="52" y="52" fontSize="10" fontWeight="bold" fill="#ef4444">X</text>

        {/* Y axis (green) - points up */}
        <line x1="20" y1="40" x2="20" y2="5" stroke="#22c55e" strokeWidth="2" />
        <polygon points="20,5 17,10 23,10" fill="#22c55e" />
        <text x="8" y="12" fontSize="10" fontWeight="bold" fill="#22c55e">Y</text>

        {/* Z axis (blue) - points towards camera (diagonal for perspective) */}
        <line x1="20" y1="40" x2="5" y2="55" stroke="#3b82f6" strokeWidth="2" />
        <polygon points="5,55 11,52 8,49" fill="#3b82f6" />
        <text x="2" y="48" fontSize="10" fontWeight="bold" fill="#3b82f6">Z</text>
      </svg>
      <div className="text-[8px] text-gray-500 text-center -mt-1">+Z = towards you</div>
    </div>
  );
};

export default AxisIndicator;
