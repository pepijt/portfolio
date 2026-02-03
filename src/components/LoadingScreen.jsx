import React from 'react';

const LoadingScreen = ({ isLoaded }) => {
  return (
    <div className={`absolute inset-0 z-40 flex items-center justify-center bg-[#f5efe4] transition-opacity duration-700 ${isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mb-4 mx-auto"></div>
        <p className="text-amber-800 text-lg">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
