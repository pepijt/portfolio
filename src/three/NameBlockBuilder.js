import * as THREE from 'three';
import { NAME_COLOR } from './constants';

export function createNameBlocks(text = 'JOYCE TING', color = NAME_COLOR) {
  const nameGroup = new THREE.Group();
  const nameBlockSize = 0.4;
  const nameBlockDepth = 0.15;
  const nameGap = 0.08;

  const nameChars = text.replace(/ /g, '').length;
  const spaceCount = (text.match(/ /g) || []).length;
  const totalNameWidth = nameChars * (nameBlockSize + nameGap) - nameGap + spaceCount * nameBlockSize * 0.6;
  let nameCurrentX = -totalNameWidth / 2;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === ' ') {
      nameCurrentX += nameBlockSize * 0.6;
      continue;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    const colorHex = '#' + color.toString(16).padStart(6, '0');
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
      color: color,
      emissive: color,
      emissiveIntensity: 0.3,
      metalness: 0.1,
      roughness: 0.3,
      transparent: true
    });
    const frontMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      emissive: color,
      emissiveIntensity: 0.3,
      metalness: 0.1,
      roughness: 0.3,
      transparent: true
    });

    const boxGeo = new THREE.BoxGeometry(nameBlockSize, nameBlockSize, nameBlockDepth);
    const box = new THREE.Mesh(boxGeo, [
      sideMaterial, sideMaterial.clone(),
      sideMaterial.clone(), sideMaterial.clone(),
      frontMaterial, sideMaterial.clone()
    ]);

    box.position.set(nameCurrentX + nameBlockSize / 2, 0, 0);
    box.castShadow = true;
    box.receiveShadow = true;
    box.userData.isNameBlock = true;
    box.userData.originalY = 0;
    box.userData.hoverOffset = 0;
    nameGroup.add(box);

    nameCurrentX += nameBlockSize + nameGap;
  }

  nameGroup.position.set(0, 3.2, -1);

  return nameGroup;
}
