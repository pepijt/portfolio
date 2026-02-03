import * as THREE from 'three';

export function createBambuA1Printer(section, index) {
  const printerGroup = new THREE.Group();
  printerGroup.position.set(section.position.x, section.position.y, section.position.z);

  const whitePlastic = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, metalness: 0.1, roughness: 0.6 });
  const darkGray = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.3, roughness: 0.5 });
  const lightGray = new THREE.MeshStandardMaterial({ color: 0x808080, metalness: 0.5, roughness: 0.4 });
  const aluminum = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.8, roughness: 0.2 });

  // Base
  const base = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.35, 2.4), whitePlastic);
  base.position.y = -1.85;
  base.castShadow = true;
  base.receiveShadow = true;
  printerGroup.add(base);

  const baseAccent = new THREE.Mesh(new THREE.BoxGeometry(2.82, 0.05, 2.42), darkGray);
  baseAccent.position.y = -1.65;
  printerGroup.add(baseAccent);

  // Speed button
  const speedButtonMat = new THREE.MeshStandardMaterial({
    color: section.color,
    metalness: 0.3,
    roughness: 0.4,
    emissive: section.color,
    emissiveIntensity: 0.2
  });
  const speedButton = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 0.05, 32),
    speedButtonMat
  );
  speedButton.position.set(1.2, -1.57, 1.0);
  speedButton.name = 'speedButton';
  speedButton.userData = { isSpeedButton: true, printerIndex: index };
  printerGroup.add(speedButton);

  // Y-axis cover
  const yAxisCover = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.15, 2.3), whitePlastic);
  yAxisCover.position.set(0, -1.55, 0);
  printerGroup.add(yAxisCover);

  // Uprights
  const uprightX = 1.25;
  const uprightZ = -1.05;
  const uprightWidth = 0.25;
  const uprightGeometry = new THREE.BoxGeometry(uprightWidth, 3.4, uprightWidth);
  const leftUpright = new THREE.Mesh(uprightGeometry, aluminum);
  leftUpright.position.set(-uprightX, 0, uprightZ);
  leftUpright.castShadow = true;
  printerGroup.add(leftUpright);

  const rightUpright = new THREE.Mesh(uprightGeometry, aluminum);
  rightUpright.position.set(uprightX, 0, uprightZ);
  rightUpright.castShadow = true;
  printerGroup.add(rightUpright);

  // Lead screws
  const leadScrewGeometry = new THREE.CylinderGeometry(0.025, 0.025, 3.2, 8);
  const leadScrewMaterial = new THREE.MeshStandardMaterial({ color: 0xb8860b, metalness: 0.9, roughness: 0.2 });
  const leftLeadScrew = new THREE.Mesh(leadScrewGeometry, leadScrewMaterial);
  leftLeadScrew.position.set(-uprightX + 0.18, 0, uprightZ);
  printerGroup.add(leftLeadScrew);
  const rightLeadScrew = new THREE.Mesh(leadScrewGeometry, leadScrewMaterial);
  rightLeadScrew.position.set(uprightX - 0.18, 0, uprightZ);
  printerGroup.add(rightLeadScrew);

  // Gantry
  const gantryGroup = new THREE.Group();
  gantryGroup.name = 'gantry';
  const gantryWidth = uprightX * 2;
  const gantryBeam = new THREE.Mesh(new THREE.BoxGeometry(gantryWidth, 0.18, 0.15), aluminum);
  gantryBeam.position.z = uprightZ;
  gantryBeam.castShadow = true;
  gantryGroup.add(gantryBeam);

  const xRail = new THREE.Mesh(new THREE.BoxGeometry(gantryWidth - 0.1, 0.05, 0.06), lightGray);
  xRail.position.z = uprightZ + 0.1;
  gantryGroup.add(xRail);

  const leftEndCap = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.2), darkGray);
  leftEndCap.position.set(-uprightX, 0, uprightZ);
  gantryGroup.add(leftEndCap);
  const rightEndCap = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.2), darkGray);
  rightEndCap.position.set(uprightX, 0, uprightZ);
  gantryGroup.add(rightEndCap);

  const purgeChute = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.08, 0.12), darkGray);
  purgeChute.position.set(-uprightX - 0.18, -0.05, uprightZ + 0.1);
  gantryGroup.add(purgeChute);
  gantryGroup.position.y = 1.2;
  printerGroup.add(gantryGroup);

  // Top beam
  const topBeamY = 1.7;
  const topBeam = new THREE.Mesh(
    new THREE.BoxGeometry(gantryWidth + 0.25, 0.08, 0.08),
    aluminum
  );
  topBeam.position.set(0, topBeamY, uprightZ);
  topBeam.castShadow = true;
  printerGroup.add(topBeam);

  // Toolhead
  const toolheadGroup = new THREE.Group();
  toolheadGroup.name = 'toolhead';

  const carriage = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.12), darkGray);
  carriage.position.z = -0.2;
  toolheadGroup.add(carriage);

  const toolheadArm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.25), darkGray);
  toolheadArm.position.z = -0.08;
  toolheadGroup.add(toolheadArm);

  const toolheadBody = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.4, 0.2), darkGray);
  toolheadBody.position.z = 0;
  toolheadBody.castShadow = true;
  toolheadGroup.add(toolheadBody);

  for (let i = 0; i < 4; i++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 0.18), lightGray);
    fin.position.set(0, 0.25 + i * 0.04, 0);
    toolheadGroup.add(fin);
  }

  const fanDuct = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.12, 0.08), darkGray);
  fanDuct.position.set(0, -0.08, 0.12);
  toolheadGroup.add(fanDuct);

  const nozzle = new THREE.Mesh(
    new THREE.ConeGeometry(0.04, 0.12, 8),
    new THREE.MeshStandardMaterial({ color: 0xd4a017, metalness: 0.95, roughness: 0.1 })
  );
  nozzle.rotation.x = Math.PI;
  nozzle.position.set(0, -0.26, 0);
  nozzle.castShadow = true;
  toolheadGroup.add(nozzle);

  const filamentHub = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.08, 8), darkGray);
  filamentHub.position.set(0, 0.45, 0);
  toolheadGroup.add(filamentHub);

  const toolheadBaseZ = uprightZ + 0.2;
  toolheadGroup.position.set(0, 1.2, toolheadBaseZ);
  printerGroup.add(toolheadGroup);

  // Heatbed
  const heatbedGroup = new THREE.Group();
  heatbedGroup.name = 'heatbed';
  const paleBedColor = new THREE.Color(section.color).lerp(new THREE.Color(0xffffff), 0.7);
  const bedPlatform = new THREE.Mesh(
    new THREE.BoxGeometry(2.1, 0.06, 2.1),
    new THREE.MeshStandardMaterial({ color: paleBedColor, metalness: 0.1, roughness: 0.6 })
  );
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

  // Spool
  const spoolGroup = new THREE.Group();
  spoolGroup.name = 'spoolGroup';
  spoolGroup.userData = { isSpool: true, printerIndex: index };

  const spoolHub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.22, 16),
    darkGray
  );
  spoolHub.rotation.z = Math.PI / 2;
  spoolHub.userData = { isSpool: true, printerIndex: index };
  spoolGroup.add(spoolHub);

  const filamentMat = new THREE.MeshStandardMaterial({
    color: section.printColor,
    metalness: 0.1,
    roughness: 0.6
  });

  for (let r = 0.1; r <= 0.26; r += 0.025) {
    const windingTorus = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.012, 8, 32),
      filamentMat.clone()
    );
    windingTorus.rotation.y = Math.PI / 2;
    windingTorus.userData = { isSpool: true, printerIndex: index };
    spoolGroup.add(windingTorus);
  }

  const lineFilamentMat = new THREE.MeshStandardMaterial({
    color: section.printColor,
    metalness: 0.15,
    roughness: 0.5
  });
  for (let i = -0.08; i <= 0.08; i += 0.02) {
    const windLine = new THREE.Mesh(
      new THREE.CylinderGeometry(0.27, 0.27, 0.008, 24),
      lineFilamentMat
    );
    windLine.rotation.z = Math.PI / 2;
    windLine.position.x = i;
    windLine.userData = { isSpool: true, printerIndex: index };
    spoolGroup.add(windLine);
  }

  const flangeGeo = new THREE.RingGeometry(0.08, 0.3, 24);
  const flangeMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.2, roughness: 0.5, side: THREE.DoubleSide });
  const flange1 = new THREE.Mesh(flangeGeo, flangeMat);
  flange1.rotation.y = Math.PI / 2;
  flange1.position.x = 0.11;
  flange1.userData = { isSpool: true, printerIndex: index };
  spoolGroup.add(flange1);
  const flange2 = new THREE.Mesh(flangeGeo, flangeMat);
  flange2.rotation.y = Math.PI / 2;
  flange2.position.x = -0.11;
  flange2.userData = { isSpool: true, printerIndex: index };
  spoolGroup.add(flange2);

  spoolGroup.position.set(0.4, topBeamY, uprightZ);
  printerGroup.add(spoolGroup);

  // Tube group (populated dynamically during animation)
  const tubeGroup = new THREE.Group();
  tubeGroup.name = 'tubeGroup';
  printerGroup.add(tubeGroup);

  // Print layers
  const layersGroup = new THREE.Group();
  layersGroup.name = 'layers';
  const numLayers = 30;
  const layerHeight = 0.05;
  const stripsPerLayer = 8;
  const printMaterial = new THREE.MeshStandardMaterial({ color: section.printColor, metalness: 0.15, roughness: 0.6 });

  const stripWidth = 1.2;
  const stripDepth = 1.2 / stripsPerLayer;

  for (let i = 0; i < numLayers; i++) {
    const layerGroup = new THREE.Group();
    layerGroup.name = `layer_${i}`;

    for (let s = 0; s < stripsPerLayer; s++) {
      const strip = new THREE.Mesh(
        new THREE.BoxGeometry(stripWidth, layerHeight, stripDepth),
        printMaterial.clone()
      );
      const zPos = (stripDepth / 2) + (s * stripDepth) - (1.2 / 2);
      strip.position.set(0, 0, zPos);
      strip.castShadow = true;
      strip.receiveShadow = true;
      strip.visible = false;
      strip.userData = { stripIndex: s, layerIndex: i, originalWidth: stripWidth };
      layerGroup.add(strip);
    }

    layerGroup.position.y = i * layerHeight;
    layersGroup.add(layerGroup);
  }
  layersGroup.position.y = -1.38;
  printerGroup.add(layersGroup);

  // Screen
  const screen = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.03), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.8, roughness: 0.2 }));
  screen.position.set(0, -1.75, 1.22);
  printerGroup.add(screen);
  const screenGlow = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.3, 0.01), new THREE.MeshBasicMaterial({ color: section.color, transparent: true, opacity: 0.5 }));
  screenGlow.position.set(0, -1.75, 1.24);
  screenGlow.name = 'screenGlow';
  printerGroup.add(screenGlow);

  // Label blocks
  const labelGroup = new THREE.Group();
  labelGroup.name = 'label';

  const text = section.title.toUpperCase();
  const blockSize = 0.28;
  const blockHeight = 0.12;
  const gap = 0.06;
  const totalWidth = text.replace(/ /g, '').length * (blockSize + gap) - gap + (text.split(' ').length - 1) * blockSize * 0.5;
  let currentX = -totalWidth / 2;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === ' ') {
      currentX += blockSize * 0.5;
      continue;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    const colorHex = '#' + section.color.toString(16).padStart(6, '0');
    ctx.fillStyle = colorHex;
    ctx.fillRect(0, 0, 128, 128);

    ctx.font = 'bold 90px Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(char, 64, 68);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 8;

    const sideMaterial = new THREE.MeshStandardMaterial({
      color: section.color,
      emissive: section.color,
      emissiveIntensity: 0.15,
      metalness: 0.1,
      roughness: 0.3
    });
    const topMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      emissive: section.color,
      emissiveIntensity: 0.15,
      metalness: 0.1,
      roughness: 0.3
    });

    const boxGeo = new THREE.BoxGeometry(blockSize, blockHeight, blockSize);
    const box = new THREE.Mesh(boxGeo, [
      sideMaterial, sideMaterial,
      topMaterial, sideMaterial,
      sideMaterial, sideMaterial
    ]);

    box.position.set(currentX + blockSize / 2, -2.08 + blockHeight / 2, 1.9);
    box.castShadow = true;
    box.receiveShadow = true;
    box.userData.char = char;
    box.userData.isLabelBlock = true;
    box.userData.printerIndex = index;
    box.userData.hoverOffset = 0;
    labelGroup.add(box);

    currentX += blockSize + gap;
  }

  printerGroup.add(labelGroup);

  return printerGroup;
}
