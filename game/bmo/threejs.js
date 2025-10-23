// Lightweight Three.js initializer and loader wrapper
let THREERef = null;
let scene = null;
let camera = null;
let renderer = null;
let rendererContainer = null;
let gameTexture = null;
let animateId = null;
let frameCallback = null;

export async function initThree({ THREE_MODULE_URL, GLTF_LOADER_URL, DRACO_LOADER_URL, modelPath, canvas, onModelLoaded, onFrame, onProgress, onError }) {
  if (THREERef)
    return getContext();
  const [threeModule, gltfModule, dracoModule] = await Promise.all([
    import(THREE_MODULE_URL),
    import(GLTF_LOADER_URL),
    import(DRACO_LOADER_URL)
  ]);
  THREERef = threeModule;
  const { GLTFLoader } = gltfModule;
  const { DRACOLoader } = dracoModule;
  scene = new THREERef.Scene();
  camera = new THREERef.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.5, 1000);
  renderer = new THREERef.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREERef.SRGBColorSpace;
  renderer.toneMapping = THREERef.NoToneMapping;
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.position = 'relative';
  renderer.domElement.style.zIndex = '1';
  rendererContainer = document.createElement('div');
  Object.assign(rendererContainer.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: '#04110d'
  });
  rendererContainer.appendChild(renderer.domElement);
  document.body.appendChild(rendererContainer);

  const ambientLight = new THREERef.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);
  const directionalLight1 = new THREERef.DirectionalLight(0xff5599, 5);
  directionalLight1.position.set(-50, -20, 10);
  scene.add(directionalLight1);
  const directionalLight2 = new THREERef.DirectionalLight(0x5599ff, 5);
  directionalLight2.position.set(50, 20, 10);
  scene.add(directionalLight2);
  const directionalLight3 = new THREERef.DirectionalLight(0xffffff, 5);
  directionalLight3.position.set(0, 100, 100);
  scene.add(directionalLight3);

  window.addEventListener('resize', handleResize);

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
  dracoLoader.preload();
  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);

  gameTexture = new THREERef.CanvasTexture(canvas);
  gameTexture.colorSpace = THREERef.SRGBColorSpace;
  gameTexture.minFilter = THREERef.NearestFilter;
  gameTexture.magFilter = THREERef.NearestFilter;
  gameTexture.generateMipmaps = false;
  gameTexture.needsUpdate = true;

  frameCallback = typeof onFrame === 'function' ? onFrame : null;

  return new Promise((resolve, reject) => {
    loader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene;
        model.children = model.children.filter(child => child.name !== 'eyes');
        model.scale.set(1000, 1000, 1000);
        model.updateWorldMatrix(true, true);
        scene.add(model);
        animate();
        if (typeof onModelLoaded === 'function')
          onModelLoaded({ THREERef, scene, camera, renderer, model, gameTexture });
        resolve(getContext());
      },
      (progressEvent) => {
        if (typeof onProgress === 'function')
          onProgress(progressEvent);
      },
      (err) => {
        console.error('GLTF loader error:', err);
        if (typeof onError === 'function')
          onError(err);
        reject(err);
      }
    );
  });
}

function handleResize() {
  if (!camera || !renderer)
    return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  if (rendererContainer) {
    rendererContainer.style.width = '100vw';
    rendererContainer.style.height = '100vh';
  }
}

function animate() {
  animateId = requestAnimationFrame(animate);
  if (!renderer || !scene || !camera)
    return;
  renderer.render(scene, camera);
  if (typeof frameCallback === 'function')
    frameCallback({ THREERef, scene, camera, renderer, gameTexture });
  if (gameTexture)
    gameTexture.needsUpdate = true;
}

export function setFrameCallback(cb) {
  frameCallback = typeof cb === 'function' ? cb : null;
}

export function fitCameraToObject(object, offsetH = 1.2, offsetW = 1.1) {
  if (!THREERef || !object || !camera)
    return;
  const box = new THREERef.Box3().setFromObject(object);
  const size = new THREERef.Vector3();
  box.getSize(size);
  const center = new THREERef.Vector3();
  box.getCenter(center);
  const fov = THREERef.MathUtils.degToRad(camera.fov);
  const aspect = window.innerWidth / window.innerHeight;
  let distance;
  if (aspect > 0.75)
    distance = (size.y / 2) / Math.tan(fov / 2) * offsetH;
  else
    distance = size.x / (2 * Math.tan(fov / 2) * aspect) * offsetW;
  const dir = new THREERef.Vector3(0, 0, 1);
  camera.position.copy(center.clone().addScaledVector(dir, distance));
  camera.lookAt(center);
  camera.near = Math.max(distance / 100, 0.1);
  camera.far = distance * 100;
  camera.updateProjectionMatrix();
}

export function getContext() {
  return { THREERef, scene, camera, renderer, gameTexture };
}

export function disposeThree() {
  if (animateId)
    cancelAnimationFrame(animateId);
  window.removeEventListener('resize', handleResize);
  if (rendererContainer && rendererContainer.parentNode)
    rendererContainer.parentNode.removeChild(rendererContainer);
  THREERef = null;
  scene = null;
  camera = null;
  renderer = null;
  rendererContainer = null;
  gameTexture = null;
  frameCallback = null;
}

export default { initThree, disposeThree, fitCameraToObject, setFrameCallback, getContext };
