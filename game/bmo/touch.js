// Pointer/touch + raycast helper
let raycaster = null;
let mouse = null;
let sceneRef = null;
let cameraRef = null;
let handlers = {};
let pressedButtons = new Set(); // Track which buttons are currently pressed

export function initTouch({ scene, camera, three }) {
  if (!three) return;
  raycaster = new three.Raycaster();
  mouse = new three.Vector2();
  sceneRef = scene;
  cameraRef = camera;
  window.addEventListener('mousedown', onPointerDown);
  window.addEventListener('touchstart', onPointerDown, { passive: false });
  window.addEventListener('mouseup', onPointerUp);
  window.addEventListener('touchend', onPointerUp);
}

export function disposeTouch() {
  window.removeEventListener('mousedown', onPointerDown);
  window.removeEventListener('touchstart', onPointerDown);
  window.removeEventListener('mouseup', onPointerUp);
  window.removeEventListener('touchend', onPointerUp);
  raycaster = null; mouse = null; sceneRef = null; cameraRef = null; handlers = {};
  pressedButtons.clear();
}

export function setHandlers(h) { handlers = h || {}; }

function getIntersect(event) {
  if (!raycaster || !mouse || !sceneRef || !cameraRef) return null;
  event.preventDefault();
  let x, y;
  if (event.touches && event.touches.length > 0) { x = event.touches[0].clientX; y = event.touches[0].clientY; }
  else { x = event.clientX; y = event.clientY; }
  mouse.x = (x / window.innerWidth) * 2 - 1;
  mouse.y = -(y / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, cameraRef);
  const intersects = raycaster.intersectObjects(sceneRef.children, true);
  if (intersects.length > 0 && intersects[0].object && intersects[0].object.name in handlers) return intersects[0];
  return null;
}

function onPointerDown(e) {
  const inter = getIntersect(e);
  if (inter) {
    pressedButtons.add(inter.object.name);
    handlers[inter.object.name]?.(inter, true);
  }
}

function onPointerUp(e) {
  const inter = getIntersect(e);
  if (inter && pressedButtons.has(inter.object.name)) {
    pressedButtons.delete(inter.object.name);
    handlers[inter.object.name]?.(inter, false);
  } else {
    // If we lifted off but not on a button, release all currently pressed buttons
    for (const buttonName of pressedButtons) {
      handlers[buttonName]?.(null, false);
    }
    pressedButtons.clear();
  }
}

export default { initTouch, disposeTouch, setHandlers };
