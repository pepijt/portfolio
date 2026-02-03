import * as THREE from 'three';

export function createEventHandlers(ctx) {
  const {
    camera, renderer, mountRef,
    cameraRefs, interactionRefs, sceneRefs, printRefs,
    stateSetters, zoomToPrinter
  } = ctx;

  const {
    setHoveredPrinter, setHoveredSpool, setSpoolScreenPos,
    setHoveredBlock, setShowColorPicker, setColorPickerPrinter
  } = stateSetters;

  const dom = renderer.domElement;

  const handleMouseDown = (e) => {
    const rect = mountRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    interactionRefs.raycaster.setFromCamera({ x: mouseX, y: mouseY }, camera);

    // Check if clicking on custom model (only on Projects page)
    if (sceneRefs.currentView === 1 && sceneRefs.customModel && sceneRefs.customModel.visible) {
      const modelIntersects = interactionRefs.raycaster.intersectObject(sceneRefs.customModel, true);
      if (modelIntersects.length > 0) {
        interactionRefs.isDraggingModel = true;
        dom.style.cursor = 'grabbing';
        const intersectPoint = modelIntersects[0].point;
        interactionRefs.dragOffset.copy(sceneRefs.customModel.position).sub(intersectPoint);
        return;
      }
    }

    // Check if clicking on speed button
    const intersects = interactionRefs.raycaster.intersectObjects(sceneRefs.printers, true);
    if (intersects.length > 0) {
      const obj = intersects[0].object;
      if (obj.userData.isSpeedButton) {
        const printerIdx = obj.userData.printerIndex;
        printRefs.speedingUpPrinter = printerIdx;
        printRefs.speeds[printerIdx] = 5;
        if (obj.material) {
          obj.material.emissiveIntensity = 0.8;
        }
        return;
      }
    }

    interactionRefs.mouseDownTime = Date.now();
    interactionRefs.isDragging = false;
    interactionRefs.isPanning = e.shiftKey || e.button === 2;
    interactionRefs.previousMousePosition = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    const rect = mountRef.current.getBoundingClientRect();
    interactionRefs.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    interactionRefs.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    // Handle model dragging
    if (interactionRefs.isDraggingModel && sceneRefs.customModel) {
      interactionRefs.raycaster.setFromCamera(interactionRefs.mouse, camera);
      const intersectPoint = new THREE.Vector3();
      if (interactionRefs.raycaster.ray.intersectPlane(interactionRefs.groundPlane, intersectPoint)) {
        sceneRefs.customModel.position.x = intersectPoint.x + interactionRefs.dragOffset.x;
        sceneRefs.customModel.position.z = intersectPoint.z + interactionRefs.dragOffset.z;
      }
      dom.style.cursor = 'grabbing';
      return;
    }

    const deltaX = e.clientX - interactionRefs.previousMousePosition.x;
    const deltaY = e.clientY - interactionRefs.previousMousePosition.y;
    if (interactionRefs.mouseDownTime > 0 && (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3)) {
      interactionRefs.isDragging = true;
      cameraRefs.target = null;
      if (sceneRefs.currentView === null && (interactionRefs.isPanning || e.shiftKey)) {
        cameraRefs.pan.x -= deltaX * 0.02;
        cameraRefs.pan.x = Math.max(-10, Math.min(10, cameraRefs.pan.x));
        dom.style.cursor = 'move';
      } else {
        cameraRefs.rotation.theta += deltaX * 0.005;
        cameraRefs.rotation.phi -= deltaY * 0.005;
        cameraRefs.rotation.phi = Math.max(0.3, Math.min(Math.PI / 2 - 0.1, cameraRefs.rotation.phi));
        dom.style.cursor = 'grabbing';
      }
      interactionRefs.previousMousePosition = { x: e.clientX, y: e.clientY };
    } else if (interactionRefs.mouseDownTime === 0) {
      interactionRefs.raycaster.setFromCamera(interactionRefs.mouse, camera);

      // Check if hovering over custom model
      if (sceneRefs.currentView === 1 && sceneRefs.customModel && sceneRefs.customModel.visible) {
        const modelIntersects = interactionRefs.raycaster.intersectObject(sceneRefs.customModel, true);
        if (modelIntersects.length > 0) {
          dom.style.cursor = 'grab';
          setHoveredPrinter(null);
          setHoveredSpool(null);
          return;
        }
      }

      // Include both printers and name group in raycast
      const objectsToCheck = [...sceneRefs.printers];
      if (sceneRefs.nameGroup) objectsToCheck.push(sceneRefs.nameGroup);
      const intersects = interactionRefs.raycaster.intersectObjects(objectsToCheck, true);
      if (intersects.length > 0) {
        const obj = intersects[0].object;

        // Name block hover (home view)
        if (sceneRefs.currentView === null && obj.userData.isNameBlock) {
          setHoveredBlock(obj);
          interactionRefs.hoveredBlock = obj;
          setHoveredSpool(null);
          setHoveredPrinter(null);
          dom.style.cursor = 'pointer';
          return;
        }

        // Speed button hover
        if (obj.userData.isSpeedButton) {
          setHoveredSpool(null);
          setHoveredPrinter(null);
          dom.style.cursor = 'pointer';
          return;
        }

        // Spool hover
        if (obj.userData.isSpool) {
          setHoveredSpool(obj.userData.printerIndex);
          setHoveredPrinter(null);
          dom.style.cursor = 'pointer';

          const printerIdx = obj.userData.printerIndex;
          const printer = sceneRefs.printers[printerIdx];
          if (printer) {
            const spoolGroup = printer.getObjectByName('spoolGroup');
            if (spoolGroup) {
              const worldPos = new THREE.Vector3();
              spoolGroup.getWorldPosition(worldPos);
              worldPos.x += 0.5;
              const screenPos = worldPos.clone().project(camera);
              const x = (screenPos.x * 0.5 + 0.5) * rect.width + rect.left;
              const y = (-screenPos.y * 0.5 + 0.5) * rect.height + rect.top;
              setSpoolScreenPos({ x, y });
            }
          }
          return;
        }

        // Label block hover (zoomed in)
        if (sceneRefs.currentView !== null && obj.userData.isLabelBlock) {
          setHoveredBlock(obj);
          interactionRefs.hoveredBlock = obj;
          setHoveredSpool(null);
          dom.style.cursor = 'pointer';
          return;
        }

        // Printer hover (home view)
        if (sceneRefs.currentView === null) {
          let printerObj = obj;
          while (printerObj.parent && printerObj.userData.index === undefined) printerObj = printerObj.parent;
          if (printerObj.userData.index !== undefined) {
            setHoveredPrinter(printerObj.userData.index);
            setHoveredSpool(null);
            dom.style.cursor = 'pointer';
            return;
          }
        }
      }
      setHoveredPrinter(null);
      setHoveredSpool(null);
      setHoveredBlock(null);
      interactionRefs.hoveredBlock = null;
      dom.style.cursor = 'grab';
    }
  };

  const handleMouseUp = () => {
    if (interactionRefs.isDraggingModel) {
      interactionRefs.isDraggingModel = false;
      dom.style.cursor = 'grab';
      return;
    }

    interactionRefs.mouseDownTime = 0;
    interactionRefs.isPanning = false;
    dom.style.cursor = 'grab';

    // Reset speed button
    if (printRefs.speedingUpPrinter !== null) {
      printRefs.speeds[printRefs.speedingUpPrinter] = 1;
      const printer = sceneRefs.printers[printRefs.speedingUpPrinter];
      if (printer) {
        const btn = printer.getObjectByName('speedButton');
        if (btn && btn.material) {
          btn.material.emissiveIntensity = 0.2;
        }
      }
      printRefs.speedingUpPrinter = null;
    }
  };

  const handleMouseLeave = () => {
    interactionRefs.mouseDownTime = 0;
    interactionRefs.isDragging = false;
    interactionRefs.isPanning = false;
    interactionRefs.isDraggingModel = false;

    if (printRefs.speedingUpPrinter !== null) {
      printRefs.speeds[printRefs.speedingUpPrinter] = 1;
      const printer = sceneRefs.printers[printRefs.speedingUpPrinter];
      if (printer) {
        const btn = printer.getObjectByName('speedButton');
        if (btn && btn.material) {
          btn.material.emissiveIntensity = 0.2;
        }
      }
      printRefs.speedingUpPrinter = null;
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    cameraRefs.target = null;
    cameraRefs.distance = Math.max(4, Math.min(30, cameraRefs.distance + e.deltaY * 0.01));
  };

  const handleContextMenu = (e) => { e.preventDefault(); };

  const handleClick = (e) => {
    if (interactionRefs.isDragging || sceneRefs.isTransitioning) return;

    const rect = mountRef.current.getBoundingClientRect();
    interactionRefs.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    interactionRefs.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    interactionRefs.raycaster.setFromCamera(interactionRefs.mouse, camera);
    const intersects = interactionRefs.raycaster.intersectObjects(sceneRefs.printers, true);
    if (intersects.length > 0) {
      const obj = intersects[0].object;

      if (obj.userData.isSpeedButton) return;

      if (obj.userData.isSpool) {
        setColorPickerPrinter(obj.userData.printerIndex);
        setShowColorPicker(true);
        return;
      }

      if (sceneRefs.currentView === null) {
        let printerObj = obj;
        while (printerObj.parent && printerObj.userData.index === undefined) printerObj = printerObj.parent;
        if (printerObj.userData.index !== undefined) {
          zoomToPrinter(printerObj.userData.index);
        }
      }
    }
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      interactionRefs.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      interactionRefs.mouseDownTime = Date.now();
      interactionRefs.isDragging = false;
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      interactionRefs.lastTouchDistance = Math.sqrt(dx * dx + dy * dy);
      interactionRefs.touchStart = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2
      };
    }
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    cameraRefs.target = null;
    if (e.touches.length === 1) {
      const deltaX = e.touches[0].clientX - interactionRefs.previousMousePosition.x;
      const deltaY = e.touches[0].clientY - interactionRefs.previousMousePosition.y;
      if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
        interactionRefs.isDragging = true;
        cameraRefs.rotation.theta += deltaX * 0.008;
        cameraRefs.rotation.phi -= deltaY * 0.008;
        cameraRefs.rotation.phi = Math.max(0.3, Math.min(Math.PI / 2 - 0.1, cameraRefs.rotation.phi));
      }
      interactionRefs.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (interactionRefs.lastTouchDistance > 0) {
        cameraRefs.distance = Math.max(4, Math.min(30, cameraRefs.distance + (interactionRefs.lastTouchDistance - distance) * 0.03));
      }
      interactionRefs.lastTouchDistance = distance;

      if (sceneRefs.currentView === null) {
        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const panDeltaX = midX - interactionRefs.touchStart.x;
        cameraRefs.pan.x -= panDeltaX * 0.01;
        cameraRefs.pan.x = Math.max(-10, Math.min(10, cameraRefs.pan.x));
        interactionRefs.touchStart.x = midX;
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (!interactionRefs.isDragging && e.changedTouches.length === 1 && !sceneRefs.isTransitioning && sceneRefs.currentView === null) {
      const rect = mountRef.current.getBoundingClientRect();
      const touch = e.changedTouches[0];
      interactionRefs.mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      interactionRefs.mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
      interactionRefs.raycaster.setFromCamera(interactionRefs.mouse, camera);
      const intersects = interactionRefs.raycaster.intersectObjects(sceneRefs.printers, true);
      if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj.parent && obj.userData.index === undefined) obj = obj.parent;
        if (obj.userData.index !== undefined) {
          zoomToPrinter(obj.userData.index);
        }
      }
    }
    interactionRefs.mouseDownTime = 0;
    interactionRefs.isDragging = false;
    interactionRefs.lastTouchDistance = 0;
  };

  const handleResize = () => {
    if (!mountRef.current) return;
    camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
  };

  function attach() {
    dom.addEventListener('mousedown', handleMouseDown);
    dom.addEventListener('mousemove', handleMouseMove);
    dom.addEventListener('mouseup', handleMouseUp);
    dom.addEventListener('mouseleave', handleMouseLeave);
    dom.addEventListener('click', handleClick);
    dom.addEventListener('wheel', handleWheel, { passive: false });
    dom.addEventListener('contextmenu', handleContextMenu);
    dom.addEventListener('touchstart', handleTouchStart, { passive: false });
    dom.addEventListener('touchmove', handleTouchMove, { passive: false });
    dom.addEventListener('touchend', handleTouchEnd);
    dom.style.cursor = 'grab';
    window.addEventListener('resize', handleResize);
  }

  function detach() {
    dom.removeEventListener('mousedown', handleMouseDown);
    dom.removeEventListener('mousemove', handleMouseMove);
    dom.removeEventListener('mouseup', handleMouseUp);
    dom.removeEventListener('mouseleave', handleMouseLeave);
    dom.removeEventListener('click', handleClick);
    dom.removeEventListener('wheel', handleWheel);
    dom.removeEventListener('contextmenu', handleContextMenu);
    dom.removeEventListener('touchstart', handleTouchStart);
    dom.removeEventListener('touchmove', handleTouchMove);
    dom.removeEventListener('touchend', handleTouchEnd);
    window.removeEventListener('resize', handleResize);
  }

  return { attach, detach };
}
