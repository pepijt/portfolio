import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

const PrinterPortfolio = () => {
  const mountRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const printersRef = useRef([]);
  const animationRef = useRef(null);
  const [hoveredPrinter, setHoveredPrinter] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const isDraggingRef = useRef(false);
  const mouseDownTimeRef = useRef(0);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraRotationRef = useRef({ theta: Math.PI / 2, phi: Math.PI / 3 });
  const cameraDistanceRef = useRef(14);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const lastTouchDistanceRef = useRef(0);

  const sections = [
    { id: 'about', title: 'About Me', color: 0x8b5a2b, printColor: 0xf4a460, position: { x: -5, y: 0, z: 0 } },
    { id: 'projects', title: 'Projects', color: 0x2e8b57, printColor: 0x50c878, position: { x: 0, y: 0, z: 0 } },
    { id: 'contact', title: 'Contact', color: 0x4169e1, printColor: 0x6495ed, position: { x: 5, y: 0, z: 0 } }
  ];

  const createBambuA1Printer = useCallback((section, index) => {
    const printerGroup = new THREE.Group();
    printerGroup.position.set(section.position.x, section.position.y, section.position.z);

    // Materials
    const whitePlastic = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, metalness: 0.1, roughness: 0.6 });
    const darkGray = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.3, roughness: 0.5 });
    const lightGray = new THREE.MeshStandardMaterial({ color: 0x808080, metalness: 0.5, roughness: 0.4 });
    const aluminum = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.8, roughness: 0.2 });
    const blackMetal = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.6, roughness: 0.3 });

    // Base
    const base = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.35, 2.4), whitePlastic);
    base.position.y = -1.85;
    base.castShadow = true;
    base.receiveShadow = true;
    printerGroup.add(base);

    const baseAccent = new THREE.Mesh(new THREE.BoxGeometry(2.62, 0.05, 2.42), darkGray);
    baseAccent.position.y = -1.65;
    printerGroup.add(baseAccent);

    // Y-axis rail cover
    const yAxisCover = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.15, 2.3), whitePlastic);
    yAxisCover.position.set(0, -1.55, 0);
    printerGroup.add(yAxisCover);

    // Dual Z uprights
    const uprightGeometry = new THREE.BoxGeometry(0.18, 3.2, 0.18);
    const leftUpright = new THREE.Mesh(uprightGeometry, aluminum);
    leftUpright.position.set(-1.15, 0.05, -1.05);
    leftUpright.castShadow = true;
    printerGroup.add(leftUpright);

    const rightUpright = new THREE.Mesh(uprightGeometry, aluminum);
    rightUpright.position.set(1.15, 0.05, -1.05);
    rightUpright.castShadow = true;
    printerGroup.add(rightUpright);

    // Lead screws
    const leadScrewGeometry = new THREE.CylinderGeometry(0.025, 0.025, 3, 8);
    const leadScrewMaterial = new THREE.MeshStandardMaterial({ color: 0xb8860b, metalness: 0.9, roughness: 0.2 });
    const leftLeadScrew = new THREE.Mesh(leadScrewGeometry, leadScrewMaterial);
    leftLeadScrew.position.set(-1.0, 0.05, -1.05);
    printerGroup.add(leftLeadScrew);
    const rightLeadScrew = new THREE.Mesh(leadScrewGeometry, leadScrewMaterial);
    rightLeadScrew.position.set(1.0, 0.05, -1.05);
    printerGroup.add(rightLeadScrew);

    // Gantry
    const gantryGroup = new THREE.Group();
    gantryGroup.name = 'gantry';
    const gantryBeam = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.15, 0.12), aluminum);
    gantryBeam.castShadow = true;
    gantryGroup.add(gantryBeam);
    const xRail = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.04, 0.06), lightGray);
    xRail.position.z = 0.09;
    gantryGroup.add(xRail);
    const leftEndCap = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.2, 0.18), darkGray);
    leftEndCap.position.set(-1.2, 0, 0);
    gantryGroup.add(leftEndCap);
    const rightEndCap = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.2, 0.18), darkGray);
    rightEndCap.position.set(1.2, 0, 0);
    gantryGroup.add(rightEndCap);
    const purgeChute = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.08, 0.12), darkGray);
    purgeChute.position.set(-1.35, -0.05, 0.1);
    gantryGroup.add(purgeChute);
    gantryGroup.position.y = 1.2;
    printerGroup.add(gantryGroup);

    // Toolhead
    const toolheadGroup = new THREE.Group();
    toolheadGroup.name = 'toolhead';
    const toolheadBody = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.45, 0.3), darkGray);
    toolheadBody.castShadow = true;
    toolheadGroup.add(toolheadBody);
    for (let i = 0; i < 4; i++) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.02, 0.28), lightGray);
      fin.position.y = 0.28 + i * 0.04;
      toolheadGroup.add(fin);
    }
    const fanDuct = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.15, 0.1), darkGray);
    fanDuct.position.set(0, -0.1, 0.2);
    toolheadGroup.add(fanDuct);
    const nozzle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.04, 0.12, 8),
      new THREE.MeshStandardMaterial({ color: 0xd4a017, metalness: 0.95, roughness: 0.1 })
    );
    nozzle.position.y = -0.28;
    nozzle.castShadow = true;
    toolheadGroup.add(nozzle);
    const filamentHub = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.08, 8), darkGray);
    filamentHub.position.y = 0.5;
    toolheadGroup.add(filamentHub);
    toolheadGroup.position.set(0, 1.2, 0.15);
    printerGroup.add(toolheadGroup);

    // Heatbed
    const heatbedGroup = new THREE.Group();
    heatbedGroup.name = 'heatbed';
    const bedPlatform = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.06, 2.1), blackMetal);
    bedPlatform.castShadow = true;
    bedPlatform.receiveShadow = true;
    heatbedGroup.add(bedPlatform);
    const buildSurface = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 0.02, 2.0),
      new THREE.MeshStandardMaterial({ color: section.color, metalness: 0.2, roughness: 0.8 })
    );
    buildSurface.position.y = 0.04;
    buildSurface.receiveShadow = true;
    heatbedGroup.add(buildSurface);
    const gridMaterial = new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.15 });
    for (let i = -0.9; i <= 0.9; i += 0.2) {
      const line1 = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(i, 0.06, -0.95), new THREE.Vector3(i, 0.06, 0.95)]), gridMaterial);
      const line2 = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.95, 0.06, i), new THREE.Vector3(0.95, 0.06, i)]), gridMaterial);
      heatbedGroup.add(line1, line2);
    }
    const wiper = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.05, 0.08), new THREE.MeshStandardMaterial({ color: 0xff6b35, roughness: 0.9 }));
    wiper.position.set(0.85, 0.08, -0.95);
    heatbedGroup.add(wiper);
    heatbedGroup.position.y = -1.45;
    printerGroup.add(heatbedGroup);

    // Spool holder
    const holderArm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.35), whitePlastic);
    holderArm.position.set(0, 1.75, -0.9);
    printerGroup.add(holderArm);
    const spool = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 0.18, 24),
      new THREE.MeshStandardMaterial({ color: section.printColor, metalness: 0.2, roughness: 0.7 })
    );
    spool.rotation.x = Math.PI / 2;
    spool.position.set(0, 1.75, -1.1);
    spool.name = 'spool';
    printerGroup.add(spool);
    const spoolHub = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.2, 16), darkGray);
    spoolHub.rotation.x = Math.PI / 2;
    spoolHub.position.set(0, 1.75, -1.1);
    printerGroup.add(spoolHub);

    // Bowden tube
    const tubePoints = [
      new THREE.Vector3(0, 1.75, -1.0),
      new THREE.Vector3(0.1, 1.6, -0.5),
      new THREE.Vector3(0, 1.45, 0),
      new THREE.Vector3(0, 1.7, 0.15)
    ];
    const tubeCurve = new THREE.CatmullRomCurve3(tubePoints);
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(tubeCurve, 20, 0.015, 8, false),
      new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 })
    );
    printerGroup.add(tube);

    // Printed layers
    const layersGroup = new THREE.Group();
    layersGroup.name = 'layers';
    const numLayers = 30;
    const layerHeight = 0.05;
    const printMaterial = new THREE.MeshStandardMaterial({ color: section.printColor, metalness: 0.15, roughness: 0.6 });
    for (let i = 0; i < numLayers; i++) {
      const layer = new THREE.Mesh(new THREE.BoxGeometry(1.2, layerHeight, 1.2), printMaterial.clone());
      layer.position.y = i * layerHeight;
      layer.castShadow = true;
      layer.receiveShadow = true;
      layer.visible = false;
      layersGroup.add(layer);
    }
    layersGroup.position.y = -1.38;
    printerGroup.add(layersGroup);

    // LCD Screen
    const screen = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.03), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.8, roughness: 0.2 }));
    screen.position.set(0, -1.75, 1.22);
    printerGroup.add(screen);
    const screenGlow = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.3, 0.01), new THREE.MeshBasicMaterial({ color: 0x00aaff, transparent: true, opacity: 0.3 }));
    screenGlow.position.set(0, -1.75, 1.24);
    printerGroup.add(screenGlow);

    // Label
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 128;
    context.font = 'bold 52px -apple-system, BlinkMacSystemFont, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#4a4a4a';
    context.fillText(section.title, canvas.width / 2, canvas.height / 2);
    const texture = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
    sprite.position.set(0, 2.8, 0);
    sprite.scale.set(2.2, 0.55, 1);
    sprite.name = 'label';
    printerGroup.add(sprite);

    return printerGroup;
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5dc);
    scene.fog = new THREE.Fog(0xf5f5dc, 18, 35);

    const camera = new THREE.PerspectiveCamera(55, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting - 3-point setup with soft shadows
    // Ambient for overall base illumination
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    
    // Hemisphere light for natural sky/ground coloring
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xe0d5c5, 0.4);
    scene.add(hemiLight);
    
    // Key light - main light source (front-right)
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.7);
    keyLight.position.set(8, 12, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.left = -15;
    keyLight.shadow.camera.right = 15;
    keyLight.shadow.camera.top = 15;
    keyLight.shadow.camera.bottom = -15;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.radius = 4;
    scene.add(keyLight);
    
    // Fill light - softer light from opposite side (front-left)
    const fillLight = new THREE.DirectionalLight(0xfff5e6, 0.5);
    fillLight.position.set(-8, 8, 6);
    scene.add(fillLight);
    
    // Back/rim light - subtle highlight from behind
    const backLight = new THREE.DirectionalLight(0xe8f0ff, 0.3);
    backLight.position.set(0, 10, -10);
    scene.add(backLight);

    // Ground with softer shadow
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.ShadowMaterial({ opacity: 0.12 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2.1;
    ground.receiveShadow = true;
    scene.add(ground);

    // Create printers
    printersRef.current = [];
    sections.forEach((section, index) => {
      const printer = createBambuA1Printer(section, index);
      printer.userData = { section: section.id, index };
      printersRef.current.push(printer);
      scene.add(printer);
    });

    setIsLoaded(true);

    let time = 0;
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      time += 0.016;

      // Camera
      const radius = cameraDistanceRef.current;
      const theta = cameraRotationRef.current.theta;
      const phi = cameraRotationRef.current.phi;
      camera.position.x = radius * Math.sin(phi) * Math.cos(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.sin(theta);
      camera.lookAt(0, 0, 0);

      // Animate printers
      printersRef.current.forEach((printer, index) => {
        const toolhead = printer.getObjectByName('toolhead');
        const heatbed = printer.getObjectByName('heatbed');
        const gantry = printer.getObjectByName('gantry');
        const layersGroup = printer.getObjectByName('layers');
        const spool = printer.getObjectByName('spool');

        if (toolhead && heatbed && layersGroup && gantry) {
          const cycleTime = time * 0.5 + index * 2;
          const totalLayers = layersGroup.children.length;
          const cycleProgress = (cycleTime % 20) / 20;
          const currentLayer = Math.floor(cycleProgress * totalLayers);
          const layerHeight = 0.05;
          const currentZ = currentLayer * layerHeight;

          // Realistic movement
          const layerTime = (cycleTime * 3) % (Math.PI * 2);
          const infillPass = Math.floor(layerTime / 0.5) % 2;
          const passProgress = (layerTime % 0.5) / 0.5;
          const xAmplitude = 0.8;
          const toolheadX = infillPass === 0 ? -xAmplitude + passProgress * xAmplitude * 2 : xAmplitude - passProgress * xAmplitude * 2;
          const bedY = Math.sin(layerTime * 2) * 0.6;
          const gantryZ = 1.2 + currentZ;

          toolhead.position.x = toolheadX;
          toolhead.position.y = gantryZ;
          heatbed.position.z = bedY;
          gantry.position.y = gantryZ;

          if (spool) spool.rotation.z -= 0.01;

          layersGroup.children.forEach((layer, layerIndex) => {
            if (layerIndex < currentLayer) {
              layer.visible = true;
              layer.scale.set(1, 1, 1);
            } else if (layerIndex === currentLayer) {
              layer.visible = true;
              const layerProgress = (cycleProgress * totalLayers) - currentLayer;
              layer.scale.set(layerProgress, 1, layerProgress);
            } else {
              layer.visible = false;
            }
          });
        }

        if (hoveredPrinter === index) {
          printer.position.y = Math.sin(time * 3) * 0.03;
        } else {
          printer.position.y *= 0.9;
        }

        const label = printer.getObjectByName('label');
        if (label) label.position.y = 2.8 + Math.sin(time * 1.5 + index) * 0.03;
      });

      renderer.render(scene, camera);
    };
    animate();

    // Events
    const handleMouseDown = (e) => { mouseDownTimeRef.current = Date.now(); isDraggingRef.current = false; previousMousePositionRef.current = { x: e.clientX, y: e.clientY }; };
    const handleMouseMove = (e) => {
      const rect = mountRef.current.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;
      if (mouseDownTimeRef.current > 0 && (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3)) {
        isDraggingRef.current = true;
        cameraRotationRef.current.theta += deltaX * 0.005;
        cameraRotationRef.current.phi -= deltaY * 0.005;
        cameraRotationRef.current.phi = Math.max(0.3, Math.min(Math.PI / 2 - 0.1, cameraRotationRef.current.phi));
        previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
        renderer.domElement.style.cursor = 'grabbing';
      } else if (mouseDownTimeRef.current === 0) {
        raycasterRef.current.setFromCamera(mouseRef.current, camera);
        const intersects = raycasterRef.current.intersectObjects(printersRef.current, true);
        if (intersects.length > 0) {
          let obj = intersects[0].object;
          while (obj.parent && obj.userData.index === undefined) obj = obj.parent;
          if (obj.userData.index !== undefined) { setHoveredPrinter(obj.userData.index); renderer.domElement.style.cursor = 'pointer'; return; }
        }
        setHoveredPrinter(null);
        renderer.domElement.style.cursor = 'grab';
      }
    };
    const handleMouseUp = () => { mouseDownTimeRef.current = 0; renderer.domElement.style.cursor = 'grab'; };
    const handleMouseLeave = () => { mouseDownTimeRef.current = 0; isDraggingRef.current = false; };
    const handleWheel = (e) => { e.preventDefault(); cameraDistanceRef.current = Math.max(8, Math.min(25, cameraDistanceRef.current + e.deltaY * 0.01)); };
    const handleClick = (e) => {
      if (isDraggingRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(printersRef.current, true);
      if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj.parent && !obj.userData.section) obj = obj.parent;
        if (obj.userData.section) setSelectedSection(obj.userData.section);
      }
    };
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        mouseDownTimeRef.current = Date.now();
        isDraggingRef.current = false;
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastTouchDistanceRef.current = Math.sqrt(dx * dx + dy * dy);
      }
    };
    const handleTouchMove = (e) => {
      e.preventDefault();
      if (e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - previousMousePositionRef.current.x;
        const deltaY = e.touches[0].clientY - previousMousePositionRef.current.y;
        if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
          isDraggingRef.current = true;
          cameraRotationRef.current.theta += deltaX * 0.008;
          cameraRotationRef.current.phi -= deltaY * 0.008;
          cameraRotationRef.current.phi = Math.max(0.3, Math.min(Math.PI / 2 - 0.1, cameraRotationRef.current.phi));
        }
        previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (lastTouchDistanceRef.current > 0) {
          cameraDistanceRef.current = Math.max(8, Math.min(25, cameraDistanceRef.current + (lastTouchDistanceRef.current - distance) * 0.03));
        }
        lastTouchDistanceRef.current = distance;
      }
    };
    const handleTouchEnd = (e) => {
      if (!isDraggingRef.current && e.changedTouches.length === 1) {
        const rect = mountRef.current.getBoundingClientRect();
        const touch = e.changedTouches[0];
        mouseRef.current.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        mouseRef.current.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
        raycasterRef.current.setFromCamera(mouseRef.current, camera);
        const intersects = raycasterRef.current.intersectObjects(printersRef.current, true);
        if (intersects.length > 0) {
          let obj = intersects[0].object;
          while (obj.parent && !obj.userData.section) obj = obj.parent;
          if (obj.userData.section) setSelectedSection(obj.userData.section);
        }
      }
      mouseDownTimeRef.current = 0;
      isDraggingRef.current = false;
      lastTouchDistanceRef.current = 0;
    };
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handleMouseDown);
    dom.addEventListener('mousemove', handleMouseMove);
    dom.addEventListener('mouseup', handleMouseUp);
    dom.addEventListener('mouseleave', handleMouseLeave);
    dom.addEventListener('click', handleClick);
    dom.addEventListener('wheel', handleWheel, { passive: false });
    dom.addEventListener('touchstart', handleTouchStart, { passive: false });
    dom.addEventListener('touchmove', handleTouchMove, { passive: false });
    dom.addEventListener('touchend', handleTouchEnd);
    dom.style.cursor = 'grab';
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', handleMouseDown);
      dom.removeEventListener('mousemove', handleMouseMove);
      dom.removeEventListener('mouseup', handleMouseUp);
      dom.removeEventListener('mouseleave', handleMouseLeave);
      dom.removeEventListener('click', handleClick);
      dom.removeEventListener('wheel', handleWheel);
      dom.removeEventListener('touchstart', handleTouchStart);
      dom.removeEventListener('touchmove', handleTouchMove);
      dom.removeEventListener('touchend', handleTouchEnd);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (mountRef.current && dom) mountRef.current.removeChild(dom);
      renderer.dispose();
    };
  }, []);

  useEffect(() => {}, [hoveredPrinter]);

  const renderContent = () => {
    if (!selectedSection) return null;
    const sectionData = sections.find(s => s.id === selectedSection);
    const colorHex = '#' + sectionData.color.toString(16).padStart(6, '0');

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-8" onClick={() => setSelectedSection(null)}>
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 p-6 md:p-8 border-b border-gray-200 flex justify-between items-center" style={{ backgroundColor: `${colorHex}15` }}>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: colorHex }}>{sectionData.title}</h2>
            <button onClick={() => setSelectedSection(null)} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 text-2xl">×</button>
          </div>
          <div className="p-6 md:p-8 overflow-y-auto max-h-[calc(90vh-100px)]">
            {selectedSection === 'about' && (
              <div className="space-y-8">
                <p className="text-lg text-gray-700 leading-relaxed">I'm a biomedical engineer passionate about designing innovative medical devices and solutions that improve patient outcomes. With expertise in CAD design, prototyping, and biomechanics, I bridge the gap between engineering and healthcare.</p>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">Skills & Expertise</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['Fusion 360', 'SolidWorks', '3D Printing', 'Prototyping', 'Biomechanics', 'FEA Analysis'].map(skill => (
                      <div key={skill} className="p-4 rounded-xl text-center border-2" style={{ borderColor: `${colorHex}40`, backgroundColor: `${colorHex}08` }}>
                        <span className="text-gray-800 font-medium">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {selectedSection === 'projects' && (
              <div className="space-y-6">
                <p className="text-lg text-gray-700 leading-relaxed mb-6">A selection of medical devices, prosthetics, and biomedical engineering projects.</p>
                <div className="grid gap-5">
                  {[
                    { title: "Prosthetic Knee Joint", description: "Advanced knee prosthesis with biomimetic articulation.", tech: ["CAD", "FEA", "Biomechanics"] },
                    { title: "Surgical Instrument Design", description: "Ergonomic surgical tool for minimally invasive procedures.", tech: ["3D Printing", "Prototyping"] },
                    { title: "Medical Device Housing", description: "Biocompatible enclosure for implantable cardiac device.", tech: ["Materials Science", "Manufacturing"] }
                  ].map((project, idx) => (
                    <div key={idx} className="p-6 rounded-xl border-2" style={{ borderColor: `${colorHex}30` }}>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">{project.title}</h4>
                      <p className="text-gray-600 mb-4">{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {project.tech.map(t => (<span key={t} className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: `${colorHex}20`, color: colorHex }}>{t}</span>))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selectedSection === 'contact' && (
              <div className="space-y-6">
                <p className="text-lg text-gray-700 leading-relaxed">Interested in collaboration or consulting? I'd love to hear from you!</p>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { icon: '📧', title: 'Email', value: 'your.email@example.com' },
                    { icon: '💼', title: 'LinkedIn', value: 'linkedin.com/in/yourname' },
                    { icon: '🐙', title: 'GitHub', value: 'github.com/yourusername' },
                    { icon: '📄', title: 'Resume', value: 'Download CV' }
                  ].map((contact, idx) => (
                    <div key={idx} className="p-5 rounded-xl border-2" style={{ borderColor: `${colorHex}30` }}>
                      <div className="text-3xl mb-2">{contact.icon}</div>
                      <h4 className="font-semibold text-gray-900">{contact.title}</h4>
                      <p style={{ color: colorHex }}>{contact.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-amber-50 to-stone-100">
      <div className={`absolute inset-0 z-40 flex items-center justify-center bg-amber-50 transition-opacity duration-700 ${isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-amber-800 text-lg">Loading...</p>
        </div>
      </div>
      <div ref={mountRef} className="w-full h-full" />
      {hoveredPrinter !== null && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 pointer-events-none z-10">
          <div className="px-5 py-2.5 rounded-full bg-white/90 backdrop-blur shadow-lg border border-gray-200">
            <span className="text-gray-700 font-medium">Click to view {sections[hoveredPrinter].title}</span>
          </div>
        </div>
      )}
      <div className="absolute bottom-6 left-6 right-6 pointer-events-none z-10">
        <div className="flex flex-wrap items-center justify-center gap-4 text-gray-500 text-sm">
          <span className="flex items-center gap-2 bg-white/60 backdrop-blur px-3 py-1.5 rounded-full">🖱️ Drag to rotate</span>
          <span className="flex items-center gap-2 bg-white/60 backdrop-blur px-3 py-1.5 rounded-full">🔍 Scroll to zoom</span>
          <span className="flex items-center gap-2 bg-white/60 backdrop-blur px-3 py-1.5 rounded-full">👆 Click printer to explore</span>
        </div>
      </div>
      {renderContent()}
    </div>
  );
};

export default PrinterPortfolio;
