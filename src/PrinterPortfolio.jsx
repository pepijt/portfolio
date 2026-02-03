import React, { useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { COLOR_OPTIONS, DEFAULT_PRINTER_COLORS } from './three/constants';
import { useThreeScene } from './three/useThreeScene';
import Sidebar from './components/Sidebar';
import BackButton from './components/BackButton';
import AxisIndicator from './components/AxisIndicator';
import ColorPicker from './components/ColorPicker';
import LoadingScreen from './components/LoadingScreen';
import LoginButton from './components/LoginButton';

const PrinterPortfolio = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const mountRef = useRef(null);
  const [hoveredPrinter, setHoveredPrinter] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentView, setCurrentView] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hoveredSpool, setHoveredSpool] = useState(null);
  const [spoolScreenPos, setSpoolScreenPos] = useState({ x: 0, y: 0 });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [colorPickerPrinter, setColorPickerPrinter] = useState(null);
  const [hoveredBlock, setHoveredBlock] = useState(null);
  const [printerColors, setPrinterColors] = useState(DEFAULT_PRINTER_COLORS);

  const { zoomToHome, resetView, changePrinterColor } = useThreeScene({
    mountRef,
    location,
    printerColors,
    setPrinterColors,
    setCurrentView,
    setIsTransitioning,
    setHoveredPrinter,
    setHoveredSpool,
    setSpoolScreenPos,
    setHoveredBlock,
    setShowColorPicker,
    setColorPickerPrinter,
    setIsLoaded
  });

  const resetColors = () => {
    DEFAULT_PRINTER_COLORS.forEach((colors, index) => {
      changePrinterColor(index, colors.color, colors.printColor);
    });
    setPrinterColors([...DEFAULT_PRINTER_COLORS]);
  };

  const isZoomedIn = currentView !== null;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#f5efe4]">
      <Sidebar
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        resetView={resetView}
        resetColors={resetColors}
      />

      <BackButton
        isZoomedIn={isZoomedIn}
        isTransitioning={isTransitioning}
        onBack={zoomToHome}
      />

      <AxisIndicator />

      <LoginButton
        user={user}
        signOut={signOut}
        onLogin={() => navigate('/login')}
        isZoomedIn={isZoomedIn}
      />

      <ColorPicker
        show={showColorPicker}
        colorOptions={COLOR_OPTIONS}
        onSelectColor={(color, printColor) => changePrinterColor(colorPickerPrinter, color, printColor)}
        onClose={() => setShowColorPicker(false)}
      />

      <LoadingScreen isLoaded={isLoaded} />

      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
};

export default PrinterPortfolio;
