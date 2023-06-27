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

// Add event listeners for mouse movements
let isDragging = false;
let previousMousePosition = {
  x: 0,
  y: 0
};

document.addEventListener('mousedown', function (event) {
  isDragging = true;
});

document.addEventListener('mouseup', function (event) {
  isDragging = false;
});

document.addEventListener('mousemove', function (event) {
  if (!isDragging) {
    return;
  }

  const deltaMove = {
    x: event.offsetX - previousMousePosition.x,
    y: event.offsetY - previousMousePosition.y
  };

  const rotationSpeed = 0.005;
  camera.rotation.y -= deltaMove.x * rotationSpeed;

  previousMousePosition = {
    x: event.offsetX,
    y: event.offsetY
  };
});

// Movement variables
const movementSpeed = 0.5;
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

  camera.translateOnAxis(movementVector, movementSpeed);

  // Render the scene
  renderer.render(scene, camera);
}
