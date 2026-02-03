export function updateCameraPosition(camera, cameraRefs) {
  const { rotation, distance, pan } = cameraRefs;
  const radius = distance;
  const theta = rotation.theta;
  const phi = rotation.phi;
  const panX = pan.x;

  camera.position.x = radius * Math.sin(phi) * Math.cos(theta) + panX;
  camera.position.y = radius * Math.cos(phi);
  camera.position.z = radius * Math.sin(phi) * Math.sin(theta);
  camera.lookAt(panX, 0, 0);
}

export function smoothLerp(cameraRefs) {
  const target = cameraRefs.target;
  if (!target) return false;

  const lerpSpeed = 0.08;

  cameraRefs.rotation.theta += (target.theta - cameraRefs.rotation.theta) * lerpSpeed;
  cameraRefs.rotation.phi += (target.phi - cameraRefs.rotation.phi) * lerpSpeed;
  cameraRefs.distance += (target.distance - cameraRefs.distance) * lerpSpeed;
  cameraRefs.pan.x += (target.panX - cameraRefs.pan.x) * lerpSpeed;

  if (Math.abs(target.theta - cameraRefs.rotation.theta) < 0.001 &&
      Math.abs(target.phi - cameraRefs.rotation.phi) < 0.001 &&
      Math.abs(target.distance - cameraRefs.distance) < 0.01 &&
      Math.abs(target.panX - cameraRefs.pan.x) < 0.01) {
    cameraRefs.target = null;
  }

  return true;
}
