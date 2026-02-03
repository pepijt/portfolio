import { TRANSITION_DURATION } from './constants';

const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export function animateTransition(transitionRefs, cameraRefs, sceneRefs, sections, callbacks) {
  if (!transitionRefs.isTransitioning) return false;

  const now = Date.now();
  const elapsed = now - transitionRefs.startTime;
  let progress = Math.min(elapsed / TRANSITION_DURATION, 1);
  progress = easeInOutCubic(progress);

  const { printers, nameGroup, customModel } = sceneRefs;
  const startCam = transitionRefs.startCamera;

  if (transitionRefs.direction === 'in') {
    animateZoomIn(progress, transitionRefs, cameraRefs, printers, nameGroup, customModel, sections, callbacks);
  } else {
    animateZoomOut(progress, transitionRefs, cameraRefs, printers, nameGroup, customModel, sections, callbacks);
  }

  return true;
}

function animateZoomIn(progress, transitionRefs, cameraRefs, printers, nameGroup, customModel, sections, callbacks) {
  const targetIndex = transitionRefs.target;
  const targetX = sections[targetIndex].position.x;
  const startCam = transitionRefs.startCamera;

  // Target camera values for zoomed-in view
  const targetTheta = Math.PI / 2;
  const targetPhi = Math.PI / 2.8;
  const targetDistance = 8;

  // Animate camera
  cameraRefs.rotation.theta = startCam.theta + (targetTheta - startCam.theta) * progress;
  cameraRefs.rotation.phi = startCam.phi + (targetPhi - startCam.phi) * progress;
  cameraRefs.distance = startCam.distance + (targetDistance - startCam.distance) * progress;
  cameraRefs.pan.x = startCam.panX + (targetX - startCam.panX) * progress;

  // Scale down other printers
  const scaleProgress = Math.max(0, 1 - progress * 1.5);
  printers.forEach((printer, idx) => {
    if (idx !== targetIndex) {
      printer.scale.setScalar(scaleProgress);
      if (scaleProgress <= 0.01) {
        printer.visible = false;
      }
    }
  });

  // Animate the target printer's label with creative paths
  const targetPrinter = printers[targetIndex];
  if (targetPrinter) {
    const label = targetPrinter.getObjectByName('label');
    if (label) {
      animateLabelBlocksIn(label, targetIndex, progress);
    }
  }

  // Scale down name
  if (nameGroup) {
    nameGroup.scale.setScalar(scaleProgress);
    if (scaleProgress <= 0.01) {
      nameGroup.visible = false;
    }
  }

  if (progress >= 1) {
    transitionRefs.isTransitioning = false;
    // Ensure hidden
    printers.forEach((printer, idx) => {
      if (idx !== targetIndex) {
        printer.visible = false;
        printer.scale.setScalar(0);
      }
    });
    if (nameGroup) {
      nameGroup.visible = false;
      nameGroup.scale.setScalar(0);
    }
    // Show custom model only on Projects page (index 1)
    if (customModel) {
      customModel.visible = targetIndex === 1;
    }
    callbacks.onZoomInComplete(targetIndex);
  }
}

function animateZoomOut(progress, transitionRefs, cameraRefs, printers, nameGroup, customModel, sections, callbacks) {
  const fromIndex = transitionRefs.currentView;
  const startCam = transitionRefs.startCamera;
  const targetTheta = Math.PI / 2;
  const targetPhi = Math.PI / 3;
  const targetDistance = 14;
  const targetPanX = 0;

  // Animate camera
  cameraRefs.rotation.theta = startCam.theta + (targetTheta - startCam.theta) * progress;
  cameraRefs.rotation.phi = startCam.phi + (targetPhi - startCam.phi) * progress;
  cameraRefs.distance = startCam.distance + (targetDistance - startCam.distance) * progress;
  cameraRefs.pan.x = startCam.panX + (targetPanX - startCam.panX) * progress;

  // Scale up other printers (start at 30% progress)
  const scaleProgress = Math.min(1, Math.max(0, (progress - 0.3) * 1.43));
  printers.forEach((printer, idx) => {
    if (idx !== fromIndex) {
      if (scaleProgress > 0.01) {
        printer.visible = true;
      }
      printer.scale.setScalar(scaleProgress);
    }
  });

  // Animate the current printer's label blocks back down
  if (fromIndex !== null) {
    const fromPrinter = printers[fromIndex];
    if (fromPrinter) {
      const label = fromPrinter.getObjectByName('label');
      if (label) {
        animateLabelBlocksOut(label, fromIndex, progress);
      }
    }
  }

  // Scale up name
  if (nameGroup) {
    if (scaleProgress > 0.01) {
      nameGroup.visible = true;
    }
    nameGroup.scale.setScalar(scaleProgress);
  }

  if (progress >= 1) {
    transitionRefs.isTransitioning = false;
    // Ensure fully visible and scaled
    printers.forEach((printer) => {
      printer.visible = true;
      printer.scale.setScalar(1);
      const label = printer.getObjectByName('label');
      if (label) {
        label.position.set(0, 0, 0);
        label.rotation.set(0, 0, 0);
        label.children.forEach((block) => {
          if (block.userData.originalX !== undefined) {
            block.position.x = block.userData.originalX;
            block.position.y = block.userData.originalY;
            block.position.z = block.userData.originalZ;
          }
          block.rotation.set(0, 0, 0);
          block.userData.hoverOffset = 0;
        });
      }
    });
    if (nameGroup) {
      nameGroup.visible = true;
      nameGroup.scale.setScalar(1);
    }
    if (customModel) {
      customModel.visible = false;
    }
    callbacks.onZoomOutComplete();
  }
}

function animateLabelBlocksIn(label, targetIndex, progress) {
  const finalOffsetY = 4.6;
  const finalOffsetZ = -2.4;

  label.children.forEach((block, i) => {
    const totalBlocks = label.children.length;

    // Store original positions if not stored yet
    if (block.userData.originalX === undefined) {
      block.userData.originalX = block.position.x;
      block.userData.originalY = block.position.y;
      block.userData.originalZ = block.position.z;
    }

    let arcX = 0, arcY = 0, arcZ = 0;
    let t = progress;

    if (targetIndex === 0) {
      // ABOUT ME: Domino flip
      const staggerDelay = i * 0.06;
      t = Math.max(0, Math.min(1, (progress - staggerDelay) / (1 - staggerDelay)));
      const flipPhase = Math.sin(t * Math.PI);
      arcZ = flipPhase * 1.8;
      arcY = flipPhase * 0.5;
      arcX = 0;
    } else if (targetIndex === 1) {
      // PROJECTS: Typewriter sweep
      const staggerDelay = i * 0.05;
      t = Math.max(0, Math.min(1, (progress - staggerDelay) / (1 - staggerDelay)));
      const swingPhase = Math.sin(t * Math.PI);
      arcX = swingPhase * (1.2 - i * 0.1);
      arcY = swingPhase * (0.8 + (i % 2) * 0.4);
      arcZ = swingPhase * 0.6;
    } else {
      // CONTACT: Fountain burst
      const staggerDelay = (totalBlocks - 1 - i) * 0.03;
      t = Math.max(0, Math.min(1, (progress - staggerDelay) / (1 - staggerDelay)));
      const burstPhase = Math.sin(t * Math.PI);
      const spreadAngle = (i - totalBlocks / 2) * 0.3;
      arcX = burstPhase * Math.sin(spreadAngle) * 1.5;
      arcY = burstPhase * 1.8 * (1 - Math.abs(i - totalBlocks / 2) / totalBlocks);
      arcZ = burstPhase * (0.8 + Math.cos(spreadAngle) * 0.6);
    }

    block.position.x = block.userData.originalX + arcX;
    block.position.y = block.userData.originalY + t * finalOffsetY + arcY;
    block.position.z = block.userData.originalZ + t * finalOffsetZ + arcZ;

    block.rotation.x = t * (Math.PI / 2);
    block.rotation.y = 0;
    block.rotation.z = 0;
  });
}

function animateLabelBlocksOut(label, fromIndex, progress) {
  const finalOffsetY = 4.6;
  const finalOffsetZ = -2.4;

  label.children.forEach((block, i) => {
    const totalBlocks = label.children.length;

    let arcX = 0, arcY = 0, arcZ = 0;
    let reverseT = 1 - progress;

    if (fromIndex === 0) {
      // ABOUT ME: Domino flip - reverse
      const reverseI = totalBlocks - 1 - i;
      const staggerDelay = reverseI * 0.06;
      const t = Math.max(0, Math.min(1, (progress - staggerDelay) / (1 - staggerDelay)));
      reverseT = 1 - t;
      const flipPhase = Math.sin(reverseT * Math.PI);
      arcZ = flipPhase * 1.8;
      arcY = flipPhase * 0.5;
      arcX = 0;
    } else if (fromIndex === 1) {
      // PROJECTS: Typewriter sweep - reverse
      const reverseI = totalBlocks - 1 - i;
      const staggerDelay = reverseI * 0.05;
      const t = Math.max(0, Math.min(1, (progress - staggerDelay) / (1 - staggerDelay)));
      reverseT = 1 - t;
      const swingPhase = Math.sin(reverseT * Math.PI);
      arcX = swingPhase * (1.2 - i * 0.1);
      arcY = swingPhase * (0.8 + (i % 2) * 0.4);
      arcZ = swingPhase * 0.6;
    } else {
      // CONTACT: Fountain burst - reverse
      const staggerDelay = i * 0.03;
      const t = Math.max(0, Math.min(1, (progress - staggerDelay) / (1 - staggerDelay)));
      reverseT = 1 - t;
      const burstPhase = Math.sin(reverseT * Math.PI);
      const spreadAngle = (i - totalBlocks / 2) * 0.3;
      arcX = burstPhase * Math.sin(spreadAngle) * 1.5;
      arcY = burstPhase * 1.8 * (1 - Math.abs(i - totalBlocks / 2) / totalBlocks);
      arcZ = burstPhase * (0.8 + Math.cos(spreadAngle) * 0.6);
    }

    if (block.userData.originalX !== undefined) {
      block.position.x = block.userData.originalX + arcX;
      block.position.y = block.userData.originalY + reverseT * finalOffsetY + arcY;
      block.position.z = block.userData.originalZ + reverseT * finalOffsetZ + arcZ;
    }

    block.rotation.x = reverseT * (Math.PI / 2);
    block.rotation.y = 0;
    block.rotation.z = 0;
  });
}
