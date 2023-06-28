import * as THREE from 'three';
import { GLTFLoader } from './three.js/examples/jsm/loaders/GLTFLoader.js';

// Init
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2, 0); // Adjust the camera height by modifying the Y position

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Load the glTF model
const loader = new GLTFLoader();
loader.load(
  'model.gltf',
  function (gltf) {
    scene.add(gltf.scene);

    // Optional: Set initial position, rotation, or scale of the model
    gltf.scene.position.set(0, 0, 0);
    gltf.scene.rotation.set(0, 0, 0);
    gltf.scene.scale.set(1, 1, 1);

    // Start the animation loop
    renderer.setAnimationLoop(animation);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

// Add event listeners for mouse and touch movements
let isDragging = false;
let previousMousePosition = {
  x: 0,
  y: 0
};

const touchStart = { x: 0, y: 0 };

document.addEventListener('mousedown', function (event) {
  isDragging = true;
});

document.addEventListener('mouseup', function (event) {
  isDragging = false;
});

document.addEventListener('mousemove', function (event) {
  handleMouseMovement(event.offsetX, event.offsetY);
});

document.addEventListener('touchstart', function (event) {
  isDragging = true;
  touchStart.x = event.touches[0].clientX;
  touchStart.y = event.touches[0].clientY;
});

document.addEventListener('touchend', function (event) {
  isDragging = false;
});

document.addEventListener('touchmove', function (event) {
  const touchX = event.touches[0].clientX;
  const touchY = event.touches[0].clientY;

  const deltaMove = {
    x: touchX - touchStart.x,
    y: touchY - touchStart.y
  };

  handleMouseMovement(touchX, touchY, deltaMove);

  touchStart.x = touchX;
  touchStart.y = touchY;
});

// Handle mouse and touch movement
function handleMouseMovement(x, y, deltaMove) {
  if (isDragging) {
    const delta = deltaMove || {
      x: x - previousMousePosition.x,
      y: y - previousMousePosition.y
    };

    const rotationSpeed = 0.003;
    const deltaQuaternionX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -delta.y * rotationSpeed);
    const deltaQuaternionY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -delta.x * rotationSpeed);

    // Remove the z component of the deltaQuaternionX and deltaQuaternionY to disable roll rotation
    deltaQuaternionX.z = 0;
    deltaQuaternionY.z = 0;

    const newCameraQuaternion = camera.quaternion.clone();
    newCameraQuaternion.premultiply(deltaQuaternionY).multiply(deltaQuaternionX);

    const euler = new THREE.Euler().setFromQuaternion(newCameraQuaternion, 'YXZ');
    const minRotationX = THREE.MathUtils.degToRad(-45);
    const maxRotationX = THREE.MathUtils.degToRad(40);

    if (euler.x < minRotationX) {
      euler.x = minRotationX;
    } else if (euler.x > maxRotationX) {
      euler.x = maxRotationX;
    }

    newCameraQuaternion.setFromEuler(euler);

    camera.quaternion.copy(newCameraQuaternion);

    // Update camera direction vector based on the new rotation
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(camera.quaternion);
    camera.lookAt(camera.position.clone().add(direction));
  }

  previousMousePosition = {
    x: x,
    y: y
  };
}

// Movement variables
const movementSpeed = 0.1;
const movementKeys = {
  KeyW: false,
  KeyA: false,
  KeyS: false,
  KeyD: false
};

// Add event listeners for keydown and keyup events
document.addEventListener('keydown', function (event) {
  handleMovement(event.code, true);
});

document.addEventListener('keyup', function (event) {
  handleMovement(event.code, false);
});

// Handle movement based on key input
function handleMovement(keyCode, isPressed) {
  switch (keyCode) {
    case 'KeyW':
      movementKeys.KeyW = isPressed;
      break;
    case 'KeyA':
      movementKeys.KeyA = isPressed;
      break;
    case 'KeyS':
      movementKeys.KeyS = isPressed;
      break;
    case 'KeyD':
      movementKeys.KeyD = isPressed;
      break;
    default:
      break;
  }
}

// Display rotation and position values
const displayContainer = document.createElement('div');
displayContainer.style.position = 'absolute';
displayContainer.style.top = '10px';
displayContainer.style.left = '10px';
displayContainer.style.color = 'white';
displayContainer.style.fontFamily = 'Arial';
displayContainer.style.fontSize = '12px';
document.body.appendChild(displayContainer);

const rotationDisplay = document.createElement('div');
rotationDisplay.textContent = 'Camera Rotation (X, Y, Z): ';
displayContainer.appendChild(rotationDisplay);

const positionDisplay = document.createElement('div');
positionDisplay.textContent = 'Camera Position (X, Y, Z): ';
displayContainer.appendChild(positionDisplay);

// Animation loop
function animation(time) {
  // Handle camera movement
  const movementVector = new THREE.Vector3();

  if (movementKeys.KeyW) {
    movementVector.z -= movementSpeed;
  }

  if (movementKeys.KeyA) {
    movementVector.x -= movementSpeed;
  }

  if (movementKeys.KeyS) {
    movementVector.z += movementSpeed;
  }

  if (movementKeys.KeyD) {
    movementVector.x += movementSpeed;
  }

  // Apply rotation around Y-axis to the movement vector
  const rotation = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
  const rotationY = THREE.MathUtils.radToDeg(rotation.y);
  movementVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotation.y);

  // Apply movement vector while clamping the camera position within the specified ranges
  const clampedX = THREE.MathUtils.clamp(camera.position.x + movementVector.x, -5, 8);
  const clampedZ = THREE.MathUtils.clamp(camera.position.z + movementVector.z, -8, 9.5);
  camera.position.set(clampedX, camera.position.y, clampedZ);

  // Update rotation and position display
  const rotationX = THREE.MathUtils.radToDeg(rotation.x);
  const rotationZ = THREE.MathUtils.radToDeg(rotation.z);

  rotationDisplay.textContent = `Camera Rotation (X, Y, Z): ${rotationX.toFixed(2)}°, ${rotationY.toFixed(2)}°, ${rotationZ.toFixed(2)}°`;
  positionDisplay.textContent = `Camera Position (X, Y, Z): ${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)}`;

  // Render the scene
  renderer.render(scene, camera);
}
