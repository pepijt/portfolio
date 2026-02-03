import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { SECTIONS, DEFAULT_CAMERA, ZOOMED_CAMERA } from './constants';
import { createScene } from './SceneManager';
import { createBambuA1Printer } from './PrinterBuilder';
import { createNameBlocks } from './NameBlockBuilder';
import { loadSTLModel } from './ModelLoader';
import { updatePrinterMaterials } from './PrinterColorManager';
import { updateCameraPosition, smoothLerp } from './CameraController';
import { animateTransition } from './TransitionAnimator';
import { animatePrinters } from './PrintAnimator';
import { animateLabelHover, animateNameHover } from './HoverAnimator';
import { createEventHandlers } from './EventHandlers';

export function useThreeScene({
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
}) {
  // Grouped refs for domain-specific state
  const cameraRefs = useRef({
    rotation: { theta: DEFAULT_CAMERA.theta, phi: DEFAULT_CAMERA.phi },
    distance: DEFAULT_CAMERA.distance,
    pan: { x: DEFAULT_CAMERA.panX, y: 0 },
    target: null
  });

  const transitionRefs = useRef({
    isTransitioning: false,
    target: null,
    direction: 'in',
    startTime: 0,
    startCamera: { theta: 0, phi: 0, distance: 0, panX: 0 },
    currentView: null
  });

  const interactionRefs = useRef({
    isDragging: false,
    mouseDownTime: 0,
    previousMousePosition: { x: 0, y: 0 },
    isPanning: false,
    mouse: new THREE.Vector2(),
    raycaster: new THREE.Raycaster(),
    isDraggingModel: false,
    groundPlane: new THREE.Plane(new THREE.Vector3(0, 1, 0), 2.1),
    dragOffset: new THREE.Vector3(),
    hoveredBlock: null,
    touchStart: { x: 0, y: 0 },
    lastTouchDistance: 0
  });

  const sceneRefs = useRef({
    printers: [],
    nameGroup: null,
    customModel: null,
    camera: null,
    renderer: null,
    animation: null,
    currentView: null,
    isTransitioning: false
  });

  const printRefs = useRef({
    speeds: [1, 1, 1],
    progress: [5, 5, 5],
    lastTime: -1,
    speedingUpPrinter: null
  });

  // Current view ref for synchronous access
  const currentViewRef = useRef(null);

  const zoomToPrinter = useCallback((index) => {
    if (transitionRefs.current.isTransitioning) return;

    transitionRefs.current.isTransitioning = true;
    transitionRefs.current.target = index;
    transitionRefs.current.direction = 'in';
    transitionRefs.current.startTime = Date.now();
    transitionRefs.current.startCamera = {
      theta: cameraRefs.current.rotation.theta,
      phi: cameraRefs.current.rotation.phi,
      distance: cameraRefs.current.distance,
      panX: cameraRefs.current.pan.x
    };

    sceneRefs.current.isTransitioning = true;
    setIsTransitioning(true);
  }, [setIsTransitioning]);

  const zoomToHome = useCallback(() => {
    if (transitionRefs.current.isTransitioning) return;

    transitionRefs.current.isTransitioning = true;
    transitionRefs.current.direction = 'out';
    transitionRefs.current.startTime = Date.now();
    transitionRefs.current.currentView = currentViewRef.current;
    transitionRefs.current.startCamera = {
      theta: cameraRefs.current.rotation.theta,
      phi: cameraRefs.current.rotation.phi,
      distance: cameraRefs.current.distance,
      panX: cameraRefs.current.pan.x
    };

    // Clear hovered block
    setHoveredBlock(null);
    interactionRefs.current.hoveredBlock = null;

    sceneRefs.current.isTransitioning = true;
    setIsTransitioning(true);
  }, [setIsTransitioning, setHoveredBlock]);

  const resetView = useCallback(() => {
    const cv = currentViewRef.current;
    const targetX = cv !== null ? SECTIONS[cv].position.x : 0;
    cameraRefs.current.target = {
      theta: Math.PI / 2,
      phi: cv !== null ? ZOOMED_CAMERA.phi : DEFAULT_CAMERA.phi,
      distance: cv !== null ? ZOOMED_CAMERA.distance : DEFAULT_CAMERA.distance,
      panX: targetX
    };
  }, []);

  const changePrinterColor = useCallback((printerIndex, newColor, newPrintColor) => {
    const printer = sceneRefs.current.printers[printerIndex];
    if (!printer) return;

    updatePrinterMaterials(printer, newColor, newPrintColor);

    setPrinterColors(prev => {
      const updated = [...prev];
      updated[printerIndex] = { color: newColor, printColor: newPrintColor };
      return updated;
    });

    setShowColorPicker(false);
  }, [setPrinterColors, setShowColorPicker]);

  // Set initial view from URL
  useEffect(() => {
    const path = location.pathname;
    let initView = null;
    if (path === '/about') initView = 0;
    else if (path === '/projects') initView = 1;
    else if (path === '/contact') initView = 2;

    if (initView !== null) {
      currentViewRef.current = initView;
      sceneRefs.current.currentView = initView;
      setCurrentView(initView);
      cameraRefs.current.distance = ZOOMED_CAMERA.distance;
      cameraRefs.current.rotation.phi = ZOOMED_CAMERA.phi;
      cameraRefs.current.pan.x = SECTIONS[initView].position.x;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Main scene setup
  useEffect(() => {
    if (!mountRef.current) return;

    const { scene, camera, renderer, dispose } = createScene(mountRef.current);
    sceneRefs.current.camera = camera;
    sceneRefs.current.renderer = renderer;

    // Create printers
    sceneRefs.current.printers = [];
    SECTIONS.forEach((section, index) => {
      const printer = createBambuA1Printer(section, index);
      printer.userData = { section: section.id, index, printColor: section.printColor };
      sceneRefs.current.printers.push(printer);
      scene.add(printer);
    });

    // Hide non-active printers if starting on a subpage
    const initView = currentViewRef.current;
    if (initView !== null) {
      sceneRefs.current.printers.forEach((printer, idx) => {
        if (idx !== initView) {
          printer.visible = false;
        }
      });
    }

    // Load custom STL model
    loadSTLModel('/models/car.stl', {
      color: 0xffd54f,
      targetSize: 1.5,
      position: { x: 2.5, y: 0, z: 0.5 }
    }).then((model) => {
      model.visible = currentViewRef.current === 1;
      sceneRefs.current.customModel = model;
      scene.add(model);
    }).catch((error) => {
      console.log('Could not load STL model:', error);
    });

    // Create name blocks
    const nameGroup = createNameBlocks();
    if (initView !== null) nameGroup.visible = false;
    sceneRefs.current.nameGroup = nameGroup;
    scene.add(nameGroup);

    // Animation loop
    let time = 0;
    let frameCount = 0;

    const animate = () => {
      sceneRefs.current.animation = requestAnimationFrame(animate);
      time += 0.016;

      frameCount++;
      if (frameCount === 3) {
        setIsLoaded(true);
      }

      // Transition animations
      const didTransition = animateTransition(
        transitionRefs.current,
        cameraRefs.current,
        sceneRefs.current,
        SECTIONS,
        {
          onZoomInComplete: (targetIndex) => {
            setIsTransitioning(false);
            sceneRefs.current.isTransitioning = false;
            currentViewRef.current = targetIndex;
            sceneRefs.current.currentView = targetIndex;
            setCurrentView(targetIndex);
            window.history.pushState({}, '', `/${SECTIONS[targetIndex].id}`);
          },
          onZoomOutComplete: () => {
            setIsTransitioning(false);
            sceneRefs.current.isTransitioning = false;
            currentViewRef.current = null;
            sceneRefs.current.currentView = null;
            setCurrentView(null);
            window.history.pushState({}, '', '/');
          }
        }
      );

      // Smooth camera lerp (only when not transitioning)
      if (!didTransition) {
        smoothLerp(cameraRefs.current);
      }

      // Update camera position
      updateCameraPosition(camera, cameraRefs.current);

      // Hover animations
      animateLabelHover(
        sceneRefs.current.printers,
        currentViewRef.current,
        transitionRefs.current.isTransitioning,
        interactionRefs.current.hoveredBlock
      );
      animateNameHover(
        sceneRefs.current.nameGroup,
        currentViewRef.current,
        transitionRefs.current.isTransitioning,
        interactionRefs.current.hoveredBlock
      );

      // Print animations
      const deltaTime = printRefs.current.lastTime >= 0 ? time - printRefs.current.lastTime : 0;
      printRefs.current.lastTime = time;
      animatePrinters(sceneRefs.current.printers, printRefs.current, deltaTime);

      renderer.render(scene, camera);
    };
    animate();

    // Event handlers
    const events = createEventHandlers({
      camera,
      renderer,
      mountRef,
      cameraRefs: cameraRefs.current,
      interactionRefs: interactionRefs.current,
      sceneRefs: sceneRefs.current,
      printRefs: printRefs.current,
      stateSetters: {
        setHoveredPrinter,
        setHoveredSpool,
        setSpoolScreenPos,
        setHoveredBlock: (block) => {
          setHoveredBlock(block);
          interactionRefs.current.hoveredBlock = block;
        },
        setShowColorPicker,
        setColorPickerPrinter
      },
      zoomToPrinter
    });
    events.attach();

    return () => {
      events.detach();
      if (sceneRefs.current.animation) {
        cancelAnimationFrame(sceneRefs.current.animation);
      }
      dispose();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    zoomToPrinter,
    zoomToHome,
    resetView,
    changePrinterColor
  };
}
