import { createFPVCamera } from './FPVCamera.js';

// Parameters for createFPVCamera
const gltfPath = 'model.gltf';
const movementSpeed = 0.1;
const rotationSpeed = 0.003;
const minRotationX = -45;
const maxRotationX = 40;
const positionRangeX = { min: -5, max: 8 };
const positionRangeZ = { min: -8, max: 9.5 };

// Create the first-person camera with debugging
createFPVCamera(gltfPath, movementSpeed, rotationSpeed, minRotationX, maxRotationX, positionRangeX, positionRangeZ);

// Disable touchmove default behavior to prevent webpage scrolling
document.addEventListener('touchmove', function (event) {
  event.preventDefault();
}, { passive: false });

