import React from 'react';

const BackButton = ({ isZoomedIn, isTransitioning, onBack }) => {
  return (
    <button
      onClick={onBack}
      className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-50 text-sm text-gray-600 hover:text-gray-900 transition-colors ${isZoomedIn && !isTransitioning ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      Back
    </button>
  );
};

export default BackButton;
