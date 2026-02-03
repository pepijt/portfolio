import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const PrinterPortfolio = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const printersRef = useRef([]);
  const [hoveredPrinter, setHoveredPrinter] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const printProgressRef = useRef([0, 0, 0]);
  const isDraggingRef = useRef(false);
  const mouseDownTimeRef = useRef(0);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraRotationRef = useRef({ theta: 0, phi: Math.PI / 3 });
  const cameraDistanceRef = useRef(12);

  const sections = [
    {
      id: 'about',
      color: 0x8b7355,
      printColor: 0xd4a574,
      position: { x: -5, y: 0, z: 0 }
    },
    {
      id: 'projects',
      color: 0x6b8e23,
      printColor: 0x9acd32,
      position: { x: 0, y: 0, z: 0 }
    },
    {
      id: 'contact',
      color: 0x4682b4,
      printColor: 0x87ceeb,
      position: { x: 5, y: 0, z: 0 }
    }
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5dc);
    scene.fog = new THREE.Fog(0xf5f5dc, 15, 30);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 12);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(10, 15, 10);
    mainLight.castShadow = true;
    mainLight.shadow.camera.left = -15;
    mainLight.shadow.camera.right = 15;
    mainLight.shadow.camera.top = 15;
    mainLight.shadow.camera.bottom = -15;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xffe4b5, 0.3);
    fillLight.position.set(-10, 5, -5);
    scene.add(fillLight);

    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.1 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    ground.receiveShadow = true;
    scene.add(ground);

    sections.forEach((section, index) => {
      const printer = create3DPrinter(section, index);
      printer.userData = { section: section.id, index };
      printersRef.current.push(printer);
      scene.add(printer);
    });

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.015;

      // Update camera position based on rotation
      const radius = cameraDistanceRef.current;
      const theta = cameraRotationRef.current.theta;
      const phi = cameraRotationRef.current.phi;
      
      camera.position.x = radius * Math.sin(phi) * Math.cos(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.sin(theta);
      camera.lookAt(0, 0, 0);

      printersRef.current.forEach((printer, index) => {
        const printHead = printer.getObjectByName('printHead');
        const layersGroup = printer.getObjectByName('layers');
        
        if (printHead && layersGroup) {
          printProgressRef.current[index] = (Math.sin(time * 0.4 + index * 2.1) + 1) / 2;
          const progress = printProgressRef.current[index];
          
          const maxHeight = 1.6;
          const currentHeight = progress * maxHeight;
          printHead.position.y = -0.7 + currentHeight;
          
          const sideMoveSpeed = time * 3 + index * 1.5;
          const sideMoveAmount = Math.sin(sideMoveSpeed) * 0.3;
          printHead.position.x = sideMoveAmount;
          
          const depthMove = Math.cos(sideMoveSpeed * 0.7) * 0.15;
          printHead.position.z = depthMove;
          
          const totalLayers = layersGroup.children.length;
          const visibleLayers = Math.floor(progress * totalLayers);
          
          layersGroup.children.forEach((layer, layerIndex) => {
            if (layerIndex < visibleLayers) {
              layer.visible = true;
              layer.scale.set(1, 1, 1);
            } else if (layerIndex === visibleLayers) {
              layer.visible = true;
              const layerProgress = (progress * totalLayers) - visibleLayers;
              layer.scale.set(layerProgress, 1, layerProgress);
            } else {
              layer.visible = false;
            }
          });
        }

        if (hoveredPrinter === index) {
          printer.rotation.y = Math.sin(time * 2) * 0.05;
        } else {
          printer.rotation.y = 0;
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleMouseDown = (event) => {
      mouseDownTimeRef.current = Date.now();
      isDraggingRef.current = false;
      previousMousePositionRef.current = { x: event.clientX, y: event.clientY };
    };

    const handleMouseMove = (event) => {
      const rect = mountRef.current.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Check if mouse has moved significantly to count as dragging
      const deltaX = event.clientX - previousMousePositionRef.current.x;
      const deltaY = event.clientY - previousMousePositionRef.current.y;
      const hasMoved = Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2;

      if (mouseDownTimeRef.current > 0 && hasMoved) {
        isDraggingRef.current = true;
        
        cameraRotationRef.current.theta += deltaX * 0.005;
        cameraRotationRef.current.phi -= deltaY * 0.005;
        cameraRotationRef.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, cameraRotationRef.current.phi));

        previousMousePositionRef.current = { x: event.clientX, y: event.clientY };
        renderer.domElement.style.cursor = 'grabbing';
      } else if (!mouseDownTimeRef.current) {
        // Hover detection for printers only when not clicking
        raycasterRef.current.setFromCamera(mouseRef.current, camera);
        const intersects = raycasterRef.current.intersectObjects(printersRef.current, true);

        if (intersects.length > 0) {
          let obj = intersects[0].object;
          while (obj.parent && !obj.userData.index && obj.userData.index !== 0) {
            obj = obj.parent;
          }
          if (obj.userData.index !== undefined) {
            setHoveredPrinter(obj.userData.index);
            renderer.domElement.style.cursor = 'pointer';
            return;
          }
        }
        setHoveredPrinter(null);
        renderer.domElement.style.cursor = 'grab';
      }
    };

    const handleMouseUp = () => {
      mouseDownTimeRef.current = 0;
      isDraggingRef.current = false;
      renderer.domElement.style.cursor = 'grab';
    };

    const handleWheel = (event) => {
      event.preventDefault();
      cameraDistanceRef.current += event.deltaY * 0.01;
      cameraDistanceRef.current = Math.max(8, Math.min(20, cameraDistanceRef.current));
    };

    const handleClick = (event) => {
      // Only open modal if user didn't drag (was a true click)
      if (isDraggingRef.current) {
        return;
      }
      
      const rect = mountRef.current.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(printersRef.current, true);

      if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj.parent && !obj.userData.section) {
          obj = obj.parent;
        }
        if (obj.userData.section) {
          setSelectedSection(obj.userData.section);
        }
      }
    };

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('click', handleClick);
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: false });
    renderer.domElement.style.cursor = 'grab';
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('click', handleClick);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [hoveredPrinter]);

  const create3DPrinter = (section, index) => {
    const printerGroup = new THREE.Group();
    printerGroup.position.set(section.position.x, section.position.y, section.position.z);

    const baseHousingGeometry = new THREE.BoxGeometry(2.2, 0.6, 2.2);
    const baseHousingMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xe8e8e8, 
      metalness: 0.3, 
      roughness: 0.6 
    });
    const baseHousing = new THREE.Mesh(baseHousingGeometry, baseHousingMaterial);
    baseHousing.position.y = -1.7;
    baseHousing.castShadow = true;
    printerGroup.add(baseHousing);

    const panelGeometry = new THREE.BoxGeometry(0.4, 0.35, 0.05);
    const panelMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1a1a1a, 
      metalness: 0.8, 
      roughness: 0.2 
    });
    const panel = new THREE.Mesh(panelGeometry, panelMaterial);
    panel.position.set(0, -1.7, 1.13);
    printerGroup.add(panel);

    const columnGeometry = new THREE.BoxGeometry(0.25, 3.5, 0.25);
    const columnMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xd0d0d0, 
      metalness: 0.4, 
      roughness: 0.5 
    });
    const column = new THREE.Mesh(columnGeometry, columnMaterial);
    column.position.set(0, 0.05, -0.9);
    column.castShadow = true;
    printerGroup.add(column);

    const gantryBeamGeometry = new THREE.BoxGeometry(0.15, 0.15, 2);
    const gantryBeamMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xb0b0b0, 
      metalness: 0.5, 
      roughness: 0.4 
    });
    const gantryBeam = new THREE.Mesh(gantryBeamGeometry, gantryBeamMaterial);
    gantryBeam.position.set(0, 1.3, 0);
    gantryBeam.castShadow = true;
    printerGroup.add(gantryBeam);

    const carriageGeometry = new THREE.BoxGeometry(0.3, 0.25, 0.3);
    const carriageMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x404040, 
      metalness: 0.6, 
      roughness: 0.3 
    });
    const carriage = new THREE.Mesh(carriageGeometry, carriageMaterial);
    carriage.position.set(0, 1.3, 0);
    carriage.castShadow = true;
    printerGroup.add(carriage);

    const bedPlatformGeometry = new THREE.BoxGeometry(1.8, 0.08, 1.8);
    const bedPlatformMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2a2a2a, 
      metalness: 0.7, 
      roughness: 0.2 
    });
    const bedPlatform = new THREE.Mesh(bedPlatformGeometry, bedPlatformMaterial);
    bedPlatform.position.y = -1.35;
    bedPlatform.castShadow = true;
    bedPlatform.receiveShadow = true;
    printerGroup.add(bedPlatform);

    const buildSurfaceGeometry = new THREE.BoxGeometry(1.7, 0.02, 1.7);
    const buildSurfaceMaterial = new THREE.MeshStandardMaterial({ 
      color: section.color, 
      metalness: 0.3, 
      roughness: 0.7 
    });
    const buildSurface = new THREE.Mesh(buildSurfaceGeometry, buildSurfaceMaterial);
    buildSurface.position.y = -1.26;
    buildSurface.receiveShadow = true;
    printerGroup.add(buildSurface);

    const printHeadGroup = new THREE.Group();
    printHeadGroup.name = 'printHead';
    
    const headHousingGeometry = new THREE.BoxGeometry(0.35, 0.35, 0.35);
    const headHousingMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2a2a2a, 
      metalness: 0.6, 
      roughness: 0.3 
    });
    const headHousing = new THREE.Mesh(headHousingGeometry, headHousingMaterial);
    headHousing.castShadow = true;
    printHeadGroup.add(headHousing);

    const finGeometry = new THREE.BoxGeometry(0.28, 0.15, 0.28);
    const finMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x606060, 
      metalness: 0.8, 
      roughness: 0.2 
    });
    const fin = new THREE.Mesh(finGeometry, finMaterial);
    fin.position.y = 0.25;
    printHeadGroup.add(fin);

    const nozzleGeometry = new THREE.CylinderGeometry(0.04, 0.07, 0.35, 8);
    const nozzleMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xd4a017, 
      metalness: 0.9, 
      roughness: 0.1 
    });
    const nozzle = new THREE.Mesh(nozzleGeometry, nozzleMaterial);
    nozzle.position.y = -0.35;
    nozzle.castShadow = true;
    printHeadGroup.add(nozzle);

    const fanGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.08);
    const fanMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1a1a1a, 
      metalness: 0.4, 
      roughness: 0.6 
    });
    const fan = new THREE.Mesh(fanGeometry, fanMaterial);
    fan.position.set(0.25, -0.1, 0);
    printHeadGroup.add(fan);

    printHeadGroup.position.y = 0.5;
    printerGroup.add(printHeadGroup);

    const layersGroup = new THREE.Group();
    layersGroup.name = 'layers';
    layersGroup.position.y = -1.25;
    
    const numLayers = 20;
    const layerHeight = 0.08;
    const printedMaterial = new THREE.MeshStandardMaterial({ 
      color: section.printColor, 
      metalness: 0.2, 
      roughness: 0.6 
    });

    for (let i = 0; i < numLayers; i++) {
      let layerGeometry;
      
      if (section.id === 'about') {
        // Person silhouette - head and shoulders
        const progress = i / numLayers;
        if (progress < 0.4) {
          // Shoulders - wider at bottom
          const width = 0.6 - (progress * 0.3);
          layerGeometry = new THREE.BoxGeometry(width, layerHeight, 0.25);
        } else if (progress < 0.5) {
          // Neck - narrow
          layerGeometry = new THREE.CylinderGeometry(0.15, 0.15, layerHeight, 8);
        } else {
          // Head - sphere-like
          const headProgress = (progress - 0.5) / 0.5;
          const radius = 0.25 * Math.sin(headProgress * Math.PI);
          layerGeometry = new THREE.CylinderGeometry(radius, radius, layerHeight, 12);
        }
      } else if (section.id === 'projects') {
        // Medical cross / plus sign
        const mainBar = new THREE.BoxGeometry(0.15, layerHeight, 0.6);
        const crossBar = new THREE.BoxGeometry(0.6, layerHeight, 0.15);
        
        // Merge geometries to create a cross
        const mainMesh = new THREE.Mesh(mainBar);
        const crossMesh = new THREE.Mesh(crossBar);
        mainMesh.updateMatrix();
        crossMesh.updateMatrix();
        
        layerGeometry = new THREE.BufferGeometry();
        const positions = [];
        const mainPositions = mainBar.attributes.position.array;
        const crossPositions = crossBar.attributes.position.array;
        
        for (let j = 0; j < mainPositions.length; j++) {
          positions.push(mainPositions[j]);
        }
        for (let j = 0; j < crossPositions.length; j++) {
          positions.push(crossPositions[j]);
        }
        
        layerGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        layerGeometry.computeVertexNormals();
      } else {
        // Envelope - message/letter shape
        const progress = i / numLayers;
        if (progress < 0.1) {
          // Bottom of envelope
          layerGeometry = new THREE.BoxGeometry(0.6, layerHeight, 0.4);
        } else if (progress < 0.6) {
          // Main body
          layerGeometry = new THREE.BoxGeometry(0.6, layerHeight, 0.4);
        } else {
          // Top flap - triangular taper
          const flapProgress = (progress - 0.6) / 0.4;
          const width = 0.6 * (1 - flapProgress * 0.5);
          layerGeometry = new THREE.BoxGeometry(width, layerHeight, 0.4);
        }
      }
      
      const layer = new THREE.Mesh(layerGeometry, printedMaterial.clone());
      layer.position.y = i * layerHeight;
      layer.castShadow = true;
      layer.visible = false;
      layersGroup.add(layer);
    }
    
    printerGroup.add(layersGroup);

    return printerGroup;
  };

  const renderContent = () => {
    if (!selectedSection) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
           onClick={() => setSelectedSection(null)}>
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
             onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
            <h2 className="text-3xl font-bold text-gray-900 capitalize">{selectedSection}</h2>
            <button 
              onClick={() => setSelectedSection(null)}
              className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
            >
              ×
            </button>
          </div>
          
          <div className="p-8">
            {selectedSection === 'about' && (
              <div className="space-y-6">
                <p className="text-lg text-gray-700 leading-relaxed">
                  I'm a biomedical engineer passionate about designing innovative medical devices 
                  and solutions that improve patient outcomes. With expertise in CAD design, 
                  prototyping, and biomechanics, I bridge the gap between engineering and healthcare.
                </p>
                
                <div className="mt-8">
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">Skills & Expertise</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {['Fusion 360', 'SolidWorks', '3D Printing', 'Prototyping', 'Biomechanics', 'FEA Analysis'].map(skill => (
                      <div key={skill} className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                        <span className="text-gray-800 font-medium">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedSection === 'projects' && (
              <div className="space-y-6">
                <p className="text-lg text-gray-700 leading-relaxed mb-8">
                  Explore my portfolio of medical devices, prosthetics, and biomedical engineering projects.
                </p>
                
                <div className="grid gap-6">
                  {[
                    {
                      title: "Prosthetic Knee Joint",
                      description: "Advanced knee prosthesis with biomimetic articulation",
                      tech: ["CAD", "FEA", "Biomechanics"]
                    },
                    {
                      title: "Surgical Instrument Design",
                      description: "Ergonomic surgical tool for minimally invasive procedures",
                      tech: ["3D Printing", "Prototyping", "User Testing"]
                    },
                    {
                      title: "Medical Device Housing",
                      description: "Biocompatible enclosure for implantable device",
                      tech: ["Materials Science", "Manufacturing"]
                    }
                  ].map((project, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">{project.title}</h4>
                      <p className="text-gray-600 mb-4">{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {project.tech.map(t => (
                          <span key={t} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedSection === 'contact' && (
              <div className="space-y-6">
                <p className="text-lg text-gray-700 leading-relaxed mb-8">
                  Interested in collaboration, consulting, or just want to connect? I'd love to hear from you!
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <div className="text-3xl mb-3">📧</div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Email</h4>
                    <a href="mailto:your.email@example.com" className="text-blue-600 hover:text-blue-700">
                      your.email@example.com
                    </a>
                  </div>
                  
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <div className="text-3xl mb-3">💼</div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">LinkedIn</h4>
                    <a href="#" className="text-blue-600 hover:text-blue-700">
                      linkedin.com/in/yourname
                    </a>
                  </div>
                  
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <div className="text-3xl mb-3">🐙</div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">GitHub</h4>
                    <a href="#" className="text-blue-600 hover:text-blue-700">
                      github.com/yourusername
                    </a>
                  </div>
                  
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <div className="text-3xl mb-3">📄</div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Resume</h4>
                    <a href="#" className="text-blue-600 hover:text-blue-700">
                      Download CV
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-amber-50 to-stone-100">
      <div ref={mountRef} className="w-full h-full" />
      {renderContent()}
    </div>
  );
};

export default PrinterPortfolio;

