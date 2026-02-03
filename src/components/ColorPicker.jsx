import React from 'react';

const ColorPicker = ({ show, colorOptions, onSelectColor, onClose }) => {
  if (!show) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
      />

      {/* Popup */}
      <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Choose Filament Color</h3>

        <div className="grid grid-cols-3 gap-4">
          {colorOptions.map((option) => (
            <button
              key={option.name}
              onClick={() => onSelectColor(option.color, option.printColor)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              {/* Spool visual */}
              <div className="relative w-16 h-16">
                {/* Outer ring (flange) */}
                <div className="absolute inset-0 rounded-full border-4 border-gray-400" />
                {/* Filament color */}
                <div
                  className="absolute inset-2 rounded-full"
                  style={{ backgroundColor: `#${option.printColor.toString(16).padStart(6, '0')}` }}
                />
                {/* Center hub */}
                <div className="absolute inset-[30%] rounded-full bg-gray-600" />
              </div>
              <span className="text-xs text-gray-600 font-medium">{option.name}</span>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ColorPicker;
