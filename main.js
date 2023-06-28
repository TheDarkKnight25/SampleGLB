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


// FOR DISPLAYING CAMERA POSITION AND ROTATION
//reateFPVCamera(gltfPath, movementSpeed, rotationSpeed, minRotationX, maxRotationX, positionRangeX, positionRangeZ, debugCallback);
// // Display rotation and position values
// const displayContainer = document.createElement('div');
// displayContainer.style.position = 'absolute';
// displayContainer.style.top = '10px';
// displayContainer.style.left = '10px';
// displayContainer.style.color = 'white';
// displayContainer.style.fontFamily = 'Arial';
// displayContainer.style.fontSize = '12px';
// document.body.appendChild(displayContainer);

// const rotationDisplay = document.createElement('div');
// rotationDisplay.textContent = 'Camera Rotation (X, Y, Z): ';
// displayContainer.appendChild(rotationDisplay);

// const positionDisplay = document.createElement('div');
// positionDisplay.textContent = 'Camera Position (X, Y, Z): ';
// displayContainer.appendChild(positionDisplay);

// // Callback function for debugging camera position and rotation
// function debugCallback({ rotation, position }) {
//   rotationDisplay.textContent = `Camera Rotation (X, Y, Z): ${rotation.x.toFixed(2)}°, ${rotation.y.toFixed(2)}°, ${rotation.z.toFixed(2)}°`;
//   positionDisplay.textContent = `Camera Position (X, Y, Z): ${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)}`;
// }
