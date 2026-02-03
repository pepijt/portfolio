import * as THREE from 'three';

export function updatePrinterMaterials(printer, newColor, newPrintColor) {
  if (!printer) return;

  // Update screen glow
  const screenGlow = printer.getObjectByName('screenGlow');
  if (screenGlow && screenGlow.material) {
    screenGlow.material.color.setHex(newColor);
  }

  // Update speed button
  const speedButton = printer.getObjectByName('speedButton');
  if (speedButton && speedButton.material) {
    speedButton.material.color.setHex(newColor);
    speedButton.material.emissive.setHex(newColor);
  }

  // Update build surface
  const heatbed = printer.getObjectByName('heatbed');
  if (heatbed) {
    heatbed.traverse((child) => {
      if (child.isMesh && child.material) {
        if (child.material.color && child.geometry.type === 'BoxGeometry') {
          const params = child.geometry.parameters;
          if (params.width === 2.0 && params.depth === 2.0) {
            child.material.color.setHex(newColor);
          }
        }
      }
    });
    // Update pale bed color
    heatbed.children.forEach(child => {
      if (child.isMesh && child.geometry.parameters?.width === 2.1) {
        const paleColor = new THREE.Color(newColor).lerp(new THREE.Color(0xffffff), 0.7);
        child.material.color.copy(paleColor);
      }
    });
  }

  // Update spool/filament
  const spoolGroup = printer.getObjectByName('spoolGroup');
  if (spoolGroup) {
    spoolGroup.traverse((child) => {
      if (child.isMesh && child.material && child.material.color) {
        const colorHex = child.material.color.getHex();
        if (colorHex !== 0x2a2a2a && colorHex !== 0x444444) {
          child.material.color.setHex(newPrintColor);
        }
      }
    });
  }

  // Update tube
  const tubeGroup = printer.getObjectByName('tubeGroup');
  if (tubeGroup) {
    tubeGroup.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.color.setHex(newPrintColor);
      }
    });
  }

  // Update print layers
  const layers = printer.getObjectByName('layers');
  if (layers) {
    layers.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.color.setHex(newPrintColor);
      }
    });
  }

  // Update label blocks - recreate textures
  const label = printer.getObjectByName('label');
  if (label) {
    label.children.forEach((block) => {
      if (block.material && block.userData.char) {
        const mats = Array.isArray(block.material) ? block.material : [block.material];

        mats.forEach((m, idx) => {
          if (idx === 2 && m.map) {
            // Top material with texture - update emissive and recreate texture
            if (m.emissive) {
              m.emissive.setHex(newColor);
            }

            const canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 128;
            const ctx = canvas.getContext('2d');

            const colorHex = '#' + newColor.toString(16).padStart(6, '0');
            ctx.fillStyle = colorHex;
            ctx.fillRect(0, 0, 128, 128);

            ctx.font = 'bold 90px Arial, sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(block.userData.char, 64, 68);

            const newTexture = new THREE.CanvasTexture(canvas);
            newTexture.anisotropy = 8;
            m.map.dispose();
            m.map = newTexture;
            m.needsUpdate = true;
          } else {
            // Side materials - update color and emissive
            if (m.color) {
              m.color.setHex(newColor);
            }
            if (m.emissive) {
              m.emissive.setHex(newColor);
            }
          }
        });
      }
    });
  }

  // Store print color in userData
  printer.userData.printColor = newPrintColor;
}
