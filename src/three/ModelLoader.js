import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export function loadSTLModel(url, { color = 0xffd54f, targetSize = 1.5, position = { x: 2.5, y: 0, z: 0.5 } } = {}) {
  return new Promise((resolve, reject) => {
    const loader = new STLLoader();
    loader.load(
      url,
      (geometry) => {
        geometry.computeBoundingBox();
        geometry.center();

        const material = new THREE.MeshStandardMaterial({
          color,
          metalness: 0.15,
          roughness: 0.6
        });

        const model = new THREE.Mesh(geometry, material);

        // Scale to fit target size
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = targetSize / maxDim;
        model.scale.set(scale, scale, scale);

        // Position on ground
        const scaledBox = new THREE.Box3().setFromObject(model);
        const groundY = -2.1;
        const modelBottomY = scaledBox.min.y;
        const yOffset = groundY - modelBottomY;

        model.position.set(position.x, yOffset, position.z);

        model.castShadow = true;
        model.receiveShadow = true;

        resolve(model);
      },
      undefined,
      (error) => {
        reject(error);
      }
    );
  });
}
