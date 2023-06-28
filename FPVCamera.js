import * as THREE from 'three';
import { GLTFLoader } from './three.js/examples/jsm/loaders/GLTFLoader.js';

export function createFPVCamera(
  gltfPath,
  movementSpeed,
  rotationSpeed,
  minRotationX,
  maxRotationX,
  positionRangeX,
  positionRangeZ,
  initialPosition,
  initialRotation,
  debugCallback
) {
  // Init
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.copy(initialPosition); // Set initial camera position
  camera.rotation.set(
    THREE.MathUtils.degToRad(initialRotation.x),
    THREE.MathUtils.degToRad(initialRotation.y),
    THREE.MathUtils.degToRad(initialRotation.z)
  ); // Set initial camera rotation

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Load the glTF model
  const loader = new GLTFLoader();
  loader.load(
    gltfPath,
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
  let previousMousePosition = { x: 0, y: 0 };

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

      const deltaQuaternionX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -delta.y * rotationSpeed);
      const deltaQuaternionY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -delta.x * rotationSpeed);

      // Remove the z component of the deltaQuaternionX and deltaQuaternionY to disable roll rotation
      deltaQuaternionX.z = 0;
      deltaQuaternionY.z = 0;

      const newCameraQuaternion = camera.quaternion.clone();
      newCameraQuaternion.premultiply(deltaQuaternionY).multiply(deltaQuaternionX);

      const euler = new THREE.Euler().setFromQuaternion(newCameraQuaternion, 'YXZ');
      const minRotationXRad = THREE.MathUtils.degToRad(minRotationX);
      const maxRotationXRad = THREE.MathUtils.degToRad(maxRotationX);

      euler.x = THREE.MathUtils.clamp(euler.x, minRotationXRad, maxRotationXRad);

      newCameraQuaternion.setFromEuler(euler);

      camera.quaternion.copy(newCameraQuaternion);

      // Update camera direction vector based on the new rotation
      const direction = new THREE.Vector3(0, 0, -1);
      direction.applyQuaternion(camera.quaternion);
      camera.lookAt(camera.position.clone().add(direction));
    }

    previousMousePosition = { x: x, y: y };
  }

  // Movement variables
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

    // Apply rotation around Y-axis to the movement vector
    const rotation = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
    movementVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotation.y);

    // Apply movement vector while clamping the camera position within the specified ranges
    const clampedX = THREE.MathUtils.clamp(camera.position.x + movementVector.x, positionRangeX.min, positionRangeX.max);
    const clampedZ = THREE.MathUtils.clamp(camera.position.z + movementVector.z, positionRangeZ.min, positionRangeZ.max);
    camera.position.set(clampedX, camera.position.y, clampedZ);

    // Call the debugCallback function with camera position and rotation values
    if (typeof debugCallback === 'function') {
      const rotationX = THREE.MathUtils.radToDeg(rotation.x);
      const rotationY = THREE.MathUtils.radToDeg(rotation.y);
      const rotationZ = THREE.MathUtils.radToDeg(rotation.z);

      debugCallback({
        rotation: { x: rotationX, y: rotationY, z: rotationZ },
        position: { x: camera.position.x, y: camera.position.y, z: camera.position.z }
      });
    }

    // Render the scene
    renderer.render(scene, camera);
  }
}
