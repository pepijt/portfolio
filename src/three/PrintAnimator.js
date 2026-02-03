import * as THREE from 'three';

export function animatePrinters(printers, printRefs, deltaTime) {
  const { speeds, progress } = printRefs;

  printers.forEach((printer, index) => {
    if (!printer.visible) return;

    const toolhead = printer.getObjectByName('toolhead');
    const gantry = printer.getObjectByName('gantry');
    const layersGroup = printer.getObjectByName('layers');
    const spoolGroup = printer.getObjectByName('spoolGroup');
    const tubeGroup = printer.getObjectByName('tubeGroup');
    const heatbed = printer.getObjectByName('heatbed');

    if (toolhead && layersGroup && gantry && heatbed) {
      // Accumulate progress with individual speed multiplier
      const speedMultiplier = speeds[index];
      progress[index] += deltaTime * 0.35 * speedMultiplier;

      const cycleTime = progress[index] + index * 2;
      const totalLayers = layersGroup.children.length;
      const printCycleDuration = 30;
      const cycleProgress = (cycleTime % printCycleDuration) / printCycleDuration;
      const currentLayer = Math.floor(cycleProgress * totalLayers);
      const layerHeight = 0.05;

      const layersBaseY = -1.38;
      const topOfCurrentLayer = layersBaseY + (currentLayer + 1) * layerHeight;
      const nozzleLength = 0.28;
      const toolheadY = topOfCurrentLayer + nozzleLength;

      const currentLayerGroup = layersGroup.children[currentLayer];
      const stripsInLayer = currentLayerGroup ? currentLayerGroup.children.length : 8;
      const passesPerLayer = stripsInLayer;

      const layerLocalProgress = (cycleProgress * totalLayers) - currentLayer;
      const passProgress = (layerLocalProgress * passesPerLayer) % 1;
      const currentPass = Math.floor(layerLocalProgress * passesPerLayer) % passesPerLayer;
      const globalPass = currentLayer * passesPerLayer + currentPass;

      const easeInOut = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const smoothProgress = easeInOut(passProgress);

      const printSize = 1.2;
      const xAmplitude = printSize / 2;

      let toolheadX;
      if (globalPass % 2 === 0) {
        toolheadX = -xAmplitude + smoothProgress * xAmplitude * 2;
      } else {
        toolheadX = xAmplitude - smoothProgress * xAmplitude * 2;
      }

      const toolheadFixedZ = -0.85;

      const stripDepth = printSize / passesPerLayer;
      const currentStripZ = (stripDepth / 2) + (currentPass * stripDepth) - 0.6;
      const nextStripZ = (stripDepth / 2) + ((currentPass + 1) * stripDepth) - 0.6;
      const stripLocalZ = currentStripZ + (nextStripZ - currentStripZ) * smoothProgress * 0.5;
      const bedZOffset = toolheadFixedZ - stripLocalZ;

      toolhead.position.x = toolheadX;
      toolhead.position.z = toolheadFixedZ;
      toolhead.position.y = toolheadY;
      gantry.position.y = toolheadY;

      heatbed.position.z = bedZOffset;
      layersGroup.position.z = bedZOffset;

      if (spoolGroup) {
        spoolGroup.rotation.x -= 0.012 * speeds[index];
      }

      // Recreate tube geometry each frame
      if (tubeGroup) {
        while (tubeGroup.children.length > 0) {
          const child = tubeGroup.children[0];
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
          tubeGroup.remove(child);
        }

        const spoolX = 0.4;
        const spoolY = 1.7;
        const spoolZ = -1.05;
        const spoolOuterRadius = 0.27;

        const filamentStartX = spoolX;
        const filamentStartY = spoolY - spoolOuterRadius;
        const filamentStartZ = spoolZ;

        const toolheadTopY = toolheadY + 0.45;
        const toolheadTopX = toolheadX;
        const toolheadTopZ = toolheadFixedZ;

        const tubePoints = [
          new THREE.Vector3(filamentStartX, filamentStartY + 0.02, filamentStartZ),
          new THREE.Vector3(filamentStartX, filamentStartY - 0.05, filamentStartZ),
          new THREE.Vector3(filamentStartX, filamentStartY - 0.18, filamentStartZ + 0.12),
          new THREE.Vector3(toolheadTopX + 0.1, toolheadTopY + 0.4, toolheadTopZ - 0.15),
          new THREE.Vector3(toolheadTopX + 0.02, toolheadTopY + 0.1, toolheadTopZ - 0.03),
          new THREE.Vector3(toolheadTopX, toolheadTopY, toolheadTopZ)
        ];
        const tubeCurve = new THREE.CatmullRomCurve3(tubePoints);
        const tubeGeo = new THREE.TubeGeometry(tubeCurve, 64, 0.018, 8, false);
        const tubeMat = new THREE.MeshStandardMaterial({
          color: printer.userData.printColor,
          metalness: 0.1,
          roughness: 0.5
        });
        const tube = new THREE.Mesh(tubeGeo, tubeMat);
        tubeGroup.add(tube);
      }

      // Animate layer strips
      layersGroup.children.forEach((layerGroup, layerIndex) => {
        const stripsInThisLayer = layerGroup.children.length;
        if (layerIndex < currentLayer) {
          layerGroup.children.forEach(strip => {
            strip.visible = true;
            strip.scale.x = 1;
            strip.position.x = 0;
          });
        } else if (layerIndex === currentLayer) {
          const currentStrip = Math.floor(layerLocalProgress * stripsInThisLayer);
          const stripProgress = (layerLocalProgress * stripsInThisLayer) % 1;
          const smoothStripProgress = easeInOut(stripProgress);

          layerGroup.children.forEach((strip, stripIndex) => {
            const stripGlobalPass = layerIndex * stripsInThisLayer + stripIndex;

            if (stripIndex < currentStrip) {
              strip.visible = true;
              strip.scale.x = 1;
              strip.position.x = 0;
            } else if (stripIndex === currentStrip) {
              strip.visible = true;
              const isLeftToRight = stripGlobalPass % 2 === 0;
              const depositProgress = Math.max(0.02, smoothStripProgress);

              strip.scale.x = depositProgress;
              const originalWidth = strip.userData.originalWidth || 1.2;
              if (isLeftToRight) {
                strip.position.x = -(originalWidth / 2) * (1 - depositProgress);
              } else {
                strip.position.x = (originalWidth / 2) * (1 - depositProgress);
              }
            } else {
              strip.visible = false;
            }
          });
        } else {
          layerGroup.children.forEach(strip => {
            strip.visible = false;
          });
        }
      });
    }
  });
}
