import React from 'react';

const Sidebar = ({ showSidebar, setShowSidebar, resetView, resetColors }) => {
  return (
    <>
      {/* Hamburger menu button */}
      <button
        onClick={() => setShowSidebar(true)}
        className="absolute top-4 left-4 z-50 p-2 text-gray-600 hover:text-gray-900 transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar panel */}
      <div className={`fixed top-0 left-0 h-full w-72 bg-white/95 backdrop-blur-sm shadow-lg z-[60] transform transition-transform duration-300 ${showSidebar ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          {/* Close button */}
          <button
            onClick={() => setShowSidebar(false)}
            className="absolute top-4 right-4 p-1 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 className="text-lg font-semibold text-gray-800 mb-6">Tips to navigate the page</h2>

          {/* Navigation Instructions */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Navigation</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-3">
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Drag</kbd>
                <span>Rotate view</span>
              </div>
              <div className="flex items-center gap-3">
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Shift + Drag</kbd>
                <span>Pan view</span>
              </div>
              <div className="flex items-center gap-3">
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Scroll</kbd>
                <span>Zoom in/out</span>
              </div>
            </div>
          </div>

          {/* Interaction Instructions */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Interactions</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-3">
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Click Printer</kbd>
                <span>View section</span>
              </div>
              <div className="flex items-center gap-3">
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Click Spool</kbd>
                <span>Change color</span>
              </div>
              <div className="flex items-center gap-3">
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Hold Button</kbd>
                <span>Speed up print</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => { resetView(); setShowSidebar(false); }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset View
              </button>
              <button
                onClick={() => { resetColors(); setShowSidebar(false); }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                Reset Colors
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/20 z-[55]"
          onClick={() => setShowSidebar(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
