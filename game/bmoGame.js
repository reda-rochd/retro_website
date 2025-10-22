import { assetsManager } from "./assets.js";
import { Player } from "./player.js";
import { Background } from "./background.js";
import { Marceline} from "./marceline.js";

const THREE_MODULE_URL = 'https://unpkg.com/three@0.168.0/build/three.module.js?module';
const GLTF_LOADER_URL = 'https://unpkg.com/three@0.168.0/examples/jsm/loaders/GLTFLoader.js?module';
const DRACO_LOADER_URL = 'https://unpkg.com/three@0.168.0/examples/jsm/loaders/DRACOLoader.js?module';

document.addEventListener('contextmenu', event => event.preventDefault());

let gameOver = false;
let gameStart = false;
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const width = canvas.width;
const height = canvas.height;


const FPS = 24;
const FIXED_DT = 1 / FPS; // fixed timestep in seconds
let accumulator = 0;
let lastTime = performance.now();

let assets = assetsManager();

const player = new Player(width / 2, height - 60, width, height);
const boss = new Marceline(width * 0.8, height - 60, width, height);
boss.setIdleTimer();

let update = startScreenUpdate;
let draw = startScreenDraw;
let background;

// session state
let currentSessionToken = null;
let currentSessionStart = null;
let submitted = false;
let bestSession = null; // { score, durationSec }

async function startGame() {
	await assets.load();
	background = new Background(width, height, assets);
	restartGame();
	// initialize the Three.js model viewer (schedule so it doesn't block)
	scheduleThreeInit();
	// fetch best session for display
	fetchBestSession().then(b => { if (b) bestSession = b; }).catch(() => { });
	requestAnimationFrame(gameLoop);
}

function onStart(e) {
	if (gameStart) return;
	gameStart = true;
	window.removeEventListener('keydown', onStart);
	player.setState('jakeRollIn');
	update = transitionUpdate;
	draw = transitionDraw;
	// request a short-lived start token from server
	requestStartToken().then(t => {
		currentSessionToken = t?.token || null;
		currentSessionStart = t?.startTime ? new Date(t.startTime) : new Date();
	}).catch(err => console.warn('Start token request failed', err));
}

function startScreenUpdate() { player.update(); }

function startScreenMessage() {
	ctx.fillStyle = '#181818';
	ctx.font = `${width * 0.06}px "Jersey 10", sans-serif`;
	ctx.textAlign = 'center';
	ctx.fillText('Press GREEN to start', width / 2, height * 0.28);
	if (bestSession) {
		ctx.font = `${width * 0.035}px "Jersey 10", sans-serif`;
		const mins = Math.floor(bestSession.durationSec / 60);
		const secs = bestSession.durationSec % 60;
		ctx.fillText(`Best: ${bestSession.score} pts — ${mins}:${String(secs).padStart(2, '0')}`, width / 2, height * 0.36);
	}
}

function startScreenDraw() { drawBackground(true); player.draw(ctx, assets); startScreenMessage(); }

let shouldStop = false;
function transitionUpdate() {
	if (player.x > width) { player.x = -50; update = blackScreenUpdate; draw = blackScreenDraw; return; }
	if (shouldStop && player.x >= width * 0.2) player.setState('jakeRollOut');

	player.update();
	if (player.state === 'idle') { update = gameUpdate; draw = gameDraw; }
}

let alpha = 0;
let step = 0.05;
const blackScreenUpdate = () => {
	alpha += step;
	if (alpha >= 1) { background.showTutorial = false; step = -step; }
	if (step < 0) boss.update(0, player);
	if (alpha <= 0 && step < 0) shouldStop = true;
	if (!shouldStop) return;

	if (player.x > width * 0.2) player.setState('jakeRollOut');

	player.update();
	if (player.state === 'idle') { update = gameUpdate; draw = gameDraw; }
}

function transitionDraw() { drawBackground(); if (Math.floor(Date.now() / 80) % 2 == 0) startScreenMessage(); player.draw(ctx, assets); }

const blackScreenDraw = () => { drawBackground(); player.draw(ctx, assets); if (step < 0) boss.draw(ctx, assets); ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`; ctx.fillRect(0, 0, width, height); }

function restartGame() {
	if (gameStart) return;
	alpha = 0; step = 0.05;
	player.x = width / 2; player.y = height - 60; player.reset(); player.setState('walking');
	boss.x = width * 0.8; boss.y = height - 60; boss.reset(); boss.setIdleTimer();
	background.reset(); gameStart = false; gameOver = false; shouldStop = false; submitted = false;
	currentSessionToken = null; currentSessionStart = null; update = startScreenUpdate; draw = startScreenDraw; window.addEventListener('keydown', onStart);
}

function gameLoop(timestamp) {
	let delta = (timestamp - lastTime) / 1000; lastTime = timestamp; accumulator += delta;
	if (!player.isDead) { while (accumulator >= FIXED_DT) { update(FIXED_DT); accumulator -= FIXED_DT; } }
	draw(); if (player.isDead) endGame(); requestAnimationFrame(gameLoop);
}

function endGame() {
	ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; ctx.fillRect(0, 0, width, height);
	ctx.fillStyle = 'white'; ctx.textAlign = 'center'; ctx.font = `${width * 0.12}px "Jersey 10", sans-serif`; ctx.fillText('Game Over', width / 2, height / 2);
	gameStart = false; gameOver = true;
	submitIfNeeded().then(result => {
		if (result) showResultOverlay(result);
		else showSubmitErrorOverlay('Submission failed or timed out', async () => {
			const r = await submitIfNeeded(false);
			if (r) showResultOverlay(r);
		});
	}).catch(err => {
		console.warn('submitIfNeeded error', err);
		showSubmitErrorOverlay(err?.message || 'Submission error', async () => {
			const r = await submitIfNeeded(false);
			if (r) showResultOverlay(r);
		});
	});
}

function victoryMessage() {
	ctx.fillStyle = '#181818'; ctx.textAlign = 'center'; ctx.font = `${width * 0.12}px "Jersey 10", sans-serif`; ctx.fillText('You Win!', width / 2, height / 2);
	ctx.font = `${width * 0.05}px "Jersey 10", sans-serif`; ctx.fillText('Marceline is calm again.', width / 2, height / 2 + 40);
	gameStart = false; gameOver = true; submitIfNeeded(true).then(result => {
		if (result) showResultOverlay(result);
		else showSubmitErrorOverlay('Submission failed or timed out', async () => {
			const r = await submitIfNeeded(true);
			if (r) showResultOverlay(r);
		});
	}).catch(err => {
		console.warn('submitIfNeeded error', err);
		showSubmitErrorOverlay(err?.message || 'Submission error', async () => {
			const r = await submitIfNeeded(true);
			if (r) showResultOverlay(r);
		});
	});
}

function gameUpdate(deltaTime) { if (boss.isCalm) player.setState('victory'); player.update(deltaTime); boss.update(deltaTime, player); }

function gameDraw() { ctx.clearRect(0, 0, width, height); drawBackground(); drawHpBar(); boss.drawHpBar(ctx); if (boss.isAttacking) { player.draw(ctx, assets); boss.draw(ctx, assets); } else { boss.draw(ctx, assets); player.draw(ctx, assets); } }

function drawBackground(moveBackground = false) { ctx.clearRect(0, 0, width, height); if (moveBackground) background.update(); background.draw(ctx, assets); }

let flickerTimer = 0;
function drawHpBar() { if (player.state === 'hurt') flickerTimer = 1; const bar = assets.get('hp_bar'); const w = bar.width; ctx.save(); ctx.scale(0.5, 0.5); const h = bar.height / 9; let hp = 8 - player.hp; if (flickerTimer > 0) { if (Math.floor(flickerTimer * 10) % 2 == 0) hp--; flickerTimer -= 0.05; } const y = hp * h; ctx.drawImage(bar, 0, y, w, h, 10, 10, w, h); ctx.restore(); }

startGame();

// ------------------ Session API bridge (postMessage) ------------------
// The game runs inside an iframe. To avoid making authenticated API calls from
// inside the iframe, we request the host React app to perform them and reply
// via postMessage. A simple request/response map with timeouts is used.

const pendingRequests = new Map();

function sendMessageToParent(type, payload = {}) {
	const requestId = 'r_' + Math.random().toString(36).slice(2);
	const message = { type, requestId, payload };
	try {
		window.parent.postMessage(message, '*');
	} catch (err) {
		return Promise.reject(new Error('postMessage failed'));
	}
	return new Promise((resolve, reject) => {
		const timeout = setTimeout(() => {
			pendingRequests.delete(requestId);
			reject(new Error('request timeout'));
		}, 10000);
		pendingRequests.set(requestId, { resolve, reject, timeout });
	});
}

window.addEventListener('message', (e) => {
	const data = e.data || {};
	// Expect responses in the shape: { type: 'RESPONSE', responseTo: requestId, success: true, payload }
	if (data.type === 'RESPONSE' && data.responseTo) {
		const entry = pendingRequests.get(data.responseTo);
		if (!entry) return;
		clearTimeout(entry.timeout);
		pendingRequests.delete(data.responseTo);
		if (data.success) entry.resolve(data.payload); else entry.reject(new Error(data.error || 'response error'));
	}
});

async function requestStartToken() {
	try {
		const payload = await sendMessageToParent('REQUEST_START');
		// payload expected: { token, startTime }
		return payload || null;
	} catch (err) {
		console.warn('Failed to get start token via parent', err);
		return null;
	}
}

async function submitIfNeeded(victory = false) {
	// If we've already submitted for this session, do nothing
	if (submitted) return null;
	submitted = true;

	// Helper: compute a local score using the same algorithm as the server
	function computeScoreLocal(durationSec) {
		const minSec = 50;
		const maxSec = 180;
		const bestPts = 100;
		const worstPts = 5;
		if (durationSec <= minSec) return bestPts;
		if (durationSec >= maxSec) return worstPts;
		const t = (durationSec - minSec) / (maxSec - minSec);
		const pts = bestPts + t * (worstPts - bestPts);
		return Math.round(pts);
	}

	// Compute duration locally from the recorded start time
	let durationSec = 0;
	if (currentSessionStart) {
		const start = currentSessionStart instanceof Date ? currentSessionStart : new Date(currentSessionStart);
		if (!isNaN(start.getTime())) durationSec = Math.max(0, Math.round((Date.now() - start.getTime()) / 1000));
	}

	// Always attempt to submit via the parent (server). Do NOT compute or show
	// a local fallback result — wait for the server to respond. If the submit
	// fails or times out, return null so the caller does not show a local overlay.
	try {
		const payload = await sendMessageToParent('REQUEST_SUBMIT', { token: currentSessionToken, victory });
		// payload should be the server response JSON: { score, durationSec, newBest }
		if (payload && payload.newBest) { bestSession = { score: payload.score, durationSec: payload.durationSec }; }
		return payload || null;
	} catch (err) {
		console.warn('Submit request via parent failed', err);
		// Do not create a local result; return null so no overlay is shown.
		return null;
	}
}

async function fetchBestSession() {
	try {
		const payload = await sendMessageToParent('REQUEST_BEST');
		return payload?.best || null;
	} catch (err) {
		return null;
	}
}

// ------------------ UI overlay ------------------
function showResultOverlay(result) {
	const overlay = document.createElement('div');
	Object.assign(overlay.style, { position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', background: '#0b0b0b', color: '#fff', padding: '20px', borderRadius: '8px', zIndex: 9999, textAlign: 'center', fontFamily: '"Jersey 10", sans-serif' });
	const mins = Math.floor(result.durationSec / 60); const secs = result.durationSec % 60;
	overlay.innerHTML = `<div style="font-size:20px; margin-bottom:8px">You scored ${result.score} pts</div>` + `<div style="font-size:14px; margin-bottom:8px">Time: ${mins}:${String(secs).padStart(2,'0')}</div>` + `<div style="font-size:12px; margin-bottom:12px">${result.newBest ? 'New personal best! 🎉' : 'Not a new best'}</div>` + `<button id="closeResultBtn" style="padding:8px 12px; font-size:14px">Close</button>`;
	document.body.appendChild(overlay);
	document.getElementById('closeResultBtn').addEventListener('click', () => { overlay.remove(); restartGame(); });
}

function showSubmitErrorOverlay(message, retryCallback) {
	const overlay = document.createElement('div');
	Object.assign(overlay.style, { position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', background: '#2b0b0b', color: '#fff', padding: '20px', borderRadius: '8px', zIndex: 9999, textAlign: 'center', fontFamily: '"Jersey 10", sans-serif' });
	overlay.innerHTML = `<div style="font-size:18px; margin-bottom:8px">Failed to submit score</div>` + `<div style="font-size:12px; margin-bottom:12px">${String(message || 'Unknown error')}</div>` + `<div style="display:flex; gap:8px; justify-content:center">` + `<button id="retrySubmitBtn" style="padding:8px 12px; font-size:14px">Retry</button>` + `<button id="cancelSubmitBtn" style="padding:8px 12px; font-size:14px">Cancel</button>` + `</div>`;
	document.body.appendChild(overlay);
	const cleanup = () => { if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay); };
	document.getElementById('retrySubmitBtn').addEventListener('click', async () => { cleanup(); if (typeof retryCallback === 'function') await retryCallback(); });
	document.getElementById('cancelSubmitBtn').addEventListener('click', () => { cleanup(); restartGame(); });
}

// ------------------ 3D model integration (unchanged) ------------------
const model_path = "assets/BMO.glb";
const loadingOverlay = createLoadingOverlay();

let THREERef; let scene; let camera; let renderer; let raycaster; let mouse; let gameTexture; let model = null; let plus_button; let red_button; let blue_button; let green_button; let bmo_body; let bmo_screen; let rendererContainer; let crtMaterial; let crtUniforms; let clock;

const threeInitState = { started: false };
const keysPressed = {};

window.addEventListener('keydown', (event) => { onKeyEvent(event.code.toLowerCase(), true); });
window.addEventListener('keyup', (event) => { onKeyEvent(event.code.toLowerCase(), false); });

const handlers = {
	plus_button: DPad,
	Red_button: (intersect, pressed) => { onKeyEvent('space', pressed); },
	triangle_button: (intersect, pressed) => { onKeyEvent('keyg', pressed); },
	small_button: (intersect, pressed) => {
		keysPressed['keyr'] = pressed;
		if (keysPressed['keyr'] && !gameStart && gameOver) restartGame();
		else if (keysPressed['keyr'] && !gameStart) onStart();
	},
};


function scheduleThreeInit() { const init = () => { initThreeScene().catch((error) => { console.error('Failed to initialize Three.js scene:', error); threeInitState.started = false; if (loadingOverlay && loadingOverlay.isConnected) loadingOverlay.textContent = 'Failed to load model'; }); }; if ('requestIdleCallback' in window) requestAnimationFrame(() => requestIdleCallback(init, { timeout: 300 })); else requestAnimationFrame(init); }

async function initThreeScene() {
	if (threeInitState.started) return; threeInitState.started = true;
	const [threeModule, gltfModule, dracoModule] = await Promise.all([ import(THREE_MODULE_URL), import(GLTF_LOADER_URL), import(DRACO_LOADER_URL) ]);
	THREERef = threeModule; const { GLTFLoader } = gltfModule; const { DRACOLoader } = dracoModule; clock = new THREERef.Clock();
	scene = new THREERef.Scene(); camera = new THREERef.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.5, 1000); renderer = new THREERef.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75)); renderer.setSize(window.innerWidth, window.innerHeight); renderer.outputColorSpace = THREERef.SRGBColorSpace; renderer.toneMapping = THREERef.NoToneMapping; renderer.domElement.style.width = '100%'; renderer.domElement.style.height = '100%'; renderer.domElement.style.display = 'block'; renderer.domElement.style.position = 'relative'; renderer.domElement.style.zIndex = '1';
	rendererContainer = document.createElement('div'); Object.assign(rendererContainer.style, { position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#04110d' }); rendererContainer.appendChild(renderer.domElement); document.body.appendChild(rendererContainer);
	const ambientLight = new THREERef.AmbientLight(0xffffff, 1); scene.add(ambientLight); const directionalLight1 = new THREERef.DirectionalLight(0xff5599, 5); directionalLight1.position.set(-50, -20, 10); scene.add(directionalLight1); const directionalLight2 = new THREERef.DirectionalLight(0x5599ff, 5); directionalLight2.position.set(50, 20, 10); scene.add(directionalLight2); const directionalLight3 = new THREERef.DirectionalLight(0xffffff, 5); directionalLight3.position.set(0, 100, 100); scene.add(directionalLight3);
	raycaster = new THREERef.Raycaster(); mouse = new THREERef.Vector2();
	gameTexture = new THREERef.CanvasTexture(canvas); gameTexture.colorSpace = THREERef.SRGBColorSpace; gameTexture.minFilter = THREERef.NearestFilter; gameTexture.magFilter = THREERef.NearestFilter; gameTexture.generateMipmaps = false; gameTexture.needsUpdate = true; crtMaterial = buildCrtMaterial(gameTexture);
	const dracoLoader = new DRACOLoader(); dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/'); dracoLoader.preload(); const loader = new GLTFLoader(); loader.setDRACOLoader(dracoLoader);
	loader.load(model_path, (gltf) => { model = gltf.scene; model.children = model.children.filter(child => child.name !== "eyes"); model.scale.set(1000, 1000, 1000); model.updateWorldMatrix(true, true); bmo_body = model.getObjectByName("Body"); plus_button = model.getObjectByName("plus_button"); red_button = model.getObjectByName("Red_button"); blue_button = model.getObjectByName("triangle_button"); green_button = model.getObjectByName("small_button"); bmo_screen = model.getObjectByName("screen"); enhanceButtons(); gameTexture.repeat.set(-1,1); gameTexture.offset.set(0,0); gameTexture.center = new THREERef.Vector2(0.5,0.5); gameTexture.rotation = -Math.PI/2; gameTexture.updateMatrix(); if (crtUniforms && crtUniforms.uTexMatrix) crtUniforms.uTexMatrix.value.copy(gameTexture.matrix); if (bmo_screen) { crtMaterial.uniforms.uTexture.value = gameTexture; bmo_screen.material = crtMaterial; bmo_screen.material.needsUpdate = true; } fitCameraToObject(camera, bmo_body); scene.add(model); if (loadingOverlay && loadingOverlay.isConnected) loadingOverlay.remove(); }, (xhr) => { const total = xhr.total || xhr.loaded; const percent = total ? (xhr.loaded / total) * 100 : 0; if (loadingOverlay && loadingOverlay.isConnected) { if (percent >= 100) loadingOverlay.textContent = 'Decoding BMO...'; else loadingOverlay.textContent = `Loading BMO... ${percent.toFixed(0)}%`; } }, (error) => { console.error('Error loading model:', error); if (loadingOverlay && loadingOverlay.isConnected) loadingOverlay.textContent = 'Error loading model'; });
	renderer.domElement.addEventListener('mousedown', onPointerDown); renderer.domElement.addEventListener('touchstart', onPointerDown, { passive: false }); renderer.domElement.addEventListener('mouseup', onPointerUp); renderer.domElement.addEventListener('touchend', onPointerUp);
	window.addEventListener('resize', handleResize);
function handleResize() { if (!camera || !renderer) return; camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); if (bmo_body) fitCameraToObject(camera, bmo_body); if (rendererContainer) { rendererContainer.style.width = '100vw'; rendererContainer.style.height = '100vh'; } }

function fitCameraToObject(activeCamera, object, offsetH = 1.2, offsetW = 1.1) { if (!THREERef || !object) return; const box = new THREERef.Box3().setFromObject(object); const size = new THREERef.Vector3(); box.getSize(size); const center = new THREERef.Vector3(); box.getCenter(center); const fov = THREERef.MathUtils.degToRad(activeCamera.fov); const aspect = window.innerWidth / window.innerHeight; let distance; if (aspect > 0.75) distance = (size.y / 2) / Math.tan(fov / 2) * offsetH; else distance = size.x / (2 * Math.tan(fov / 2) * aspect) * offsetW; const dir = new THREERef.Vector3(0,0,1); activeCamera.position.copy(center.clone().addScaledVector(dir, distance)); activeCamera.lookAt(center); activeCamera.near = Math.max(distance / 100, 0.1); activeCamera.far = distance * 100; activeCamera.updateProjectionMatrix(); }

function handleKeys() { const angle = 0.1; if (!plus_button || !red_button || !blue_button || !green_button) return; if (keysPressed['arrowup'] || keysPressed['keyw']) plus_button.rotation.x = -angle; else if (keysPressed['arrowdown'] || keysPressed['keys']) plus_button.rotation.x = angle; else plus_button.rotation.x = 0; if (keysPressed['arrowleft'] || keysPressed['keya']) plus_button.rotation.y = -angle; else if (keysPressed['arrowright'] || keysPressed['keyd']) plus_button.rotation.y = angle; else plus_button.rotation.y = 0; const z = plus_button.position.z; const zOffset = -0.005; red_button.position.z = keysPressed['space'] ? z + zOffset : z; blue_button.position.z = keysPressed['keyg'] ? z + zOffset : z; green_button.position.z = keysPressed['keyr'] ? z + zOffset : z; }

function onKeyEvent(key, pressed) { keysPressed[key] = pressed; if (pressed) player.states[player.state].onKeyDown(key); else player.states[player.state].onKeyUp(key); }

function getIntersect(event) { if (!raycaster || !mouse || !scene || !camera) return null; event.preventDefault(); let x; let y; if (event.touches && event.touches.length > 0) { x = event.touches[0].clientX; y = event.touches[0].clientY; } else { x = event.clientX; y = event.clientY; } mouse.x = (x / window.innerWidth) * 2 - 1; mouse.y = -(y / window.innerHeight) * 2 + 1; raycaster.setFromCamera(mouse, camera); const intersects = raycaster.intersectObjects(scene.children, true); if (intersects.length > 0 && intersects[0].object && intersects[0].object.name in handlers) return intersects[0]; return null; }

function onPointerDown(event) { const intersect = getIntersect(event); if (intersect) buttonPressed(intersect, true); }
function onPointerUp(event) { const intersect = getIntersect(event); if (intersect) buttonReleased(intersect, false); else { for (const key in keysPressed) onKeyEvent(key, false); } }
function buttonPressed(intersect) { const objectName = intersect.object.name; if (handlers[objectName]) handlers[objectName](intersect, true); }
function buttonReleased(intersect) { const objectName = intersect.object.name; if (handlers[objectName]) handlers[objectName](intersect, false); }
function DPad(intersection, pressed = true) { const localPoint = intersection.object.worldToLocal(intersection.point); const rotations = { left: () => { onKeyEvent('arrowleft', pressed); }, right: () => { onKeyEvent('arrowright', pressed); }, up: () => { onKeyEvent('arrowup', pressed); }, down: () => { onKeyEvent('arrowdown', pressed); }, }; let region = 'center'; if (localPoint.x < -0.01) region = 'left'; else if (localPoint.x > 0.01) region = 'right'; if (localPoint.y < -0.01) region = 'down'; else if (localPoint.y > 0.01) region = 'up'; if (region !== 'center') { rotations[region](); return; } onKeyEvent('arrowleft', false); onKeyEvent('arrowright', false); onKeyEvent('arrowup', false); onKeyEvent('arrowdown', false); }

function animate() { requestAnimationFrame(animate); if (!renderer || !scene || !camera) return; renderer.render(scene, camera); handleKeys(); if (crtUniforms && clock) crtUniforms.uTime.value = clock.getElapsedTime(); if (crtUniforms && crtUniforms.uTexMatrix && gameTexture) crtUniforms.uTexMatrix.value.copy(gameTexture.matrix); if (gameTexture) gameTexture.needsUpdate = true; }

animate();

function createLoadingOverlay() { const overlay = document.createElement('div'); Object.assign(overlay.style, { position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0d0d0d', color: '#6fffe9', fontFamily: '"Jersey 10", sans-serif', fontSize: 'min(8vw, 48px)', letterSpacing: '0.08em', zIndex: '10' }); overlay.textContent = 'Loading BMO...'; document.body.appendChild(overlay); return overlay; }

function buildCrtMaterial(texture) { crtUniforms = { uTexture: { value: texture }, uTime: { value: 0 }, uTexMatrix: { value: new THREERef.Matrix3() } }; const vertexShader = ` varying vec2 vUv; void main() { vUv = uv; vec3 displaced = position; vec2 centeredUv = (uv - 0.5) * 2.0; float curvature = dot(centeredUv, centeredUv); displaced.z += curvature * 0.012; gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0); } `; const fragmentShader = ` uniform sampler2D uTexture; uniform float uTime; uniform mat3 uTexMatrix; varying vec2 vUv; float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); } void main() { float time = uTime; vec2 uv = vUv; vec2 centered = uv - 0.5; float dist = dot(centered, centered); vec2 warpedUv = uv + centered * dist * 0.08; vec2 jitter = vec2( sin(warpedUv.y * 280.0 + time * 32.0) * 0.0013, cos(time * 70.0 + warpedUv.y * 160.0) * 0.0010 ); vec3 transformed = uTexMatrix * vec3(warpedUv + jitter, 1.0); vec2 sampleUv = transformed.xy; float scan = sin(warpedUv.y * 780.0) * 0.03; float grille = sin(warpedUv.x * 1210.0) * 0.038; float triadPhase = sin(warpedUv.x * 280.0); vec3 triad = vec3(1.0 + triadPhase * 0.05, 1.0, 1.0 - triadPhase * 0.05); vec2 aberration = vec2(dist * 0.009, 0.0); vec2 uvR = clamp(sampleUv + aberration, 0.0, 1.0); vec2 uvG = clamp(sampleUv, 0.0, 1.0); vec2 uvB = clamp(sampleUv - aberration, 0.0, 1.0); vec3 color; color.r = texture2D(uTexture, uvR).r; color.g = texture2D(uTexture, uvG).g; color.b = texture2D(uTexture, uvB).b; float flicker = 0.97 + sin(time * 6.283) * 0.015 + sin(time * 11.0) * 0.01; float fineNoise = hash(sampleUv * (time * 15.0 + 2.5)); float coarseNoise = hash(sampleUv * 0.4 + time * 1.6); float grain = (fineNoise - 0.5) * 0.09 + (coarseNoise - 0.5) * 0.045; color *= triad; color = color * flicker + vec3(scan * 0.03 + grille * 0.035); color += grain; float glow = smoothstep(0.42, 0.08, dist) * 0.10; float vignette = smoothstep(0.96, 0.38, dist); color = mix(color * 0.92, color, vignette); color += vec3(glow); color = pow(color, vec3(0.95)); color = clamp(color, 0.0, 1.0); gl_FragColor = vec4(color, 1.0); } `; crtMaterial = new THREERef.ShaderMaterial({ uniforms: crtUniforms, vertexShader, fragmentShader, toneMapped: false }); crtMaterial.side = THREERef.FrontSide; crtMaterial.needsUpdate = true; return crtMaterial; }

function enhanceButtons() { if (!THREERef) return; const bumpCache = createBumpTexture(); applyMaterialToTarget(plus_button, { bumpMap: bumpCache, bumpScale: 0.12, metalness: 0.22, roughness: 0.58 }); applyMaterialToTarget(red_button, { bumpMap: bumpCache, bumpScale: 0.08, metalness: 0.18, roughness: 0.6 }); applyMaterialToTarget(blue_button, { bumpMap: bumpCache, bumpScale: 0.08, metalness: 0.2, roughness: 0.57 }); applyMaterialToTarget(green_button, { bumpMap: bumpCache, bumpScale: 0.07, metalness: 0.16, roughness: 0.6 }); }

function setTextureDefaults(texture, { useMipmaps = true, colorSpace = THREERef.SRGBColorSpace } = {}) { if (!texture) return; texture.wrapS = THREERef.ClampToEdgeWrapping; texture.wrapT = THREERef.ClampToEdgeWrapping; texture.colorSpace = colorSpace; texture.generateMipmaps = useMipmaps; texture.minFilter = useMipmaps ? THREERef.LinearMipmapLinearFilter : THREERef.LinearFilter; texture.magFilter = THREERef.LinearFilter; const anisotropy = renderer?.capabilities?.getMaxAnisotropy?.() ?? 1; texture.anisotropy = Math.min(anisotropy, 8); texture.needsUpdate = true; }

function createBumpTexture() { const size = 256; const canvas = document.createElement('canvas'); canvas.width = size; canvas.height = size; const context = canvas.getContext('2d'); const base = context.createRadialGradient(size / 2, size / 2, size * 0.1, size / 2, size / 2, size * 0.7); base.addColorStop(0, 'rgba(210, 210, 210, 1)'); base.addColorStop(1, 'rgba(110, 110, 110, 1)'); context.fillStyle = base; context.fillRect(0, 0, size, size); addNoise(context, size, 0.25); const texture = new THREERef.CanvasTexture(canvas); setTextureDefaults(texture, { useMipmaps: false, colorSpace: THREERef.NoColorSpace }); return texture; }

function addNoise(context, size, intensity) { const imageData = context.getImageData(0, 0, size, size); const data = imageData.data; for (let i = 0; i < data.length; i += 4) { const random = (Math.random() - 0.5) * 255 * intensity; data[i] = clampColor(data[i] + random); data[i + 1] = clampColor(data[i + 1] + random); data[i + 2] = clampColor(data[i + 2] + random); } context.putImageData(imageData, 0, 0); }

function clampColor(value) { return Math.max(0, Math.min(255, value)); }

function applyMaterialToTarget(target, options) { if (!target || !options) return; const { bumpMap, bumpScale, metalness, roughness } = options; target.traverse(child => { if (child.isMesh) { const original = child.material; let updated; if (original && original.isMeshStandardMaterial) updated = original.clone(); else { updated = new THREERef.MeshStandardMaterial({ color: original?.color ? original.color.clone() : new THREERef.Color(0xffffff), map: original?.map ?? null }); if (original?.map) updated.map = original.map; } if (bumpMap) updated.bumpMap = bumpMap; if (typeof bumpScale === 'number') updated.bumpScale = bumpScale; if (typeof metalness === 'number') updated.metalness = metalness; if (typeof roughness === 'number') updated.roughness = roughness; updated.needsUpdate = true; child.material = updated; child.castShadow = true; child.receiveShadow = true; } }); }

}

function handleResize()
{
	if (!camera || !renderer)
		return;
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	if (bmo_body)
		fitCameraToObject(camera, bmo_body);
 	if (rendererContainer)
	{
		rendererContainer.style.width = '100vw';
		rendererContainer.style.height = '100vh';
	}
}

// ---------------------------------------------------------------
// responsive model fitting
function fitCameraToObject(activeCamera, object, offsetH = 1.2, offsetW = 1.1)
{
	if (!THREERef || !object)
		return;

	const box = new THREERef.Box3().setFromObject(object);
	const size = new THREERef.Vector3();
	box.getSize(size);
	const center = new THREERef.Vector3();
	box.getCenter(center);

	const fov = THREERef.MathUtils.degToRad(activeCamera.fov);
	const aspect = window.innerWidth / window.innerHeight;
	let distance;

	if (aspect > 0.75)
		distance = (size.y / 2) / Math.tan(fov / 2) * offsetH;
	else
		distance = size.x / (2 * Math.tan(fov / 2) * aspect) * offsetW;

	const dir = new THREERef.Vector3(0, 0, 1);
	activeCamera.position.copy(center.clone().addScaledVector(dir, distance));
	activeCamera.lookAt(center);
	activeCamera.near = Math.max(distance / 100, 0.1);
	activeCamera.far = distance * 100;
	activeCamera.updateProjectionMatrix();
}

//---------------------------------------------------------------

function handleKeys()
{
	const angle = 0.1;

	if (!plus_button || !red_button || !blue_button || !green_button)
		return;

	if (keysPressed['arrowup'] || keysPressed['keyw'])
		plus_button.rotation.x = -angle;
	else if (keysPressed['arrowdown'] || keysPressed['keys'])
		plus_button.rotation.x = angle;
	else
		plus_button.rotation.x = 0;

	if (keysPressed['arrowleft'] || keysPressed['keya'])
		plus_button.rotation.y = -angle;
	else if (keysPressed['arrowright'] || keysPressed['keyd'])
		plus_button.rotation.y = angle;
	else
		plus_button.rotation.y = 0;

	const z = plus_button.position.z;
	const zOffset = -0.005;

	red_button.position.z = keysPressed['space'] ? z + zOffset : z;
	blue_button.position.z = keysPressed['keyg'] ? z + zOffset : z;
	green_button.position.z = keysPressed['keyr'] ? z + zOffset : z;
}

function onKeyEvent(key, pressed)
{
	keysPressed[key] = pressed;
	if (pressed)
		player.states[player.state].onKeyDown(key);
	else
		player.states[player.state].onKeyUp(key);
}

// Raycasting for touch and mouse interaction
function getIntersect(event)
{
	if (!raycaster || !mouse || !scene || !camera)
		return null;
	event.preventDefault();
	let x;
	let y;
	if (event.touches && event.touches.length > 0)
	{
		x = event.touches[0].clientX;
		y = event.touches[0].clientY;
	}
	else
	{
		x = event.clientX;
		y = event.clientY;
	}

	mouse.x = (x / window.innerWidth) * 2 - 1;
	mouse.y = -(y / window.innerHeight) * 2 + 1;

	raycaster.setFromCamera(mouse, camera);
	const intersects = raycaster.intersectObjects(scene.children, true);

	if (intersects.length > 0 && intersects[0].object && intersects[0].object.name in handlers)
		return intersects[0];
	return null;
}

function onPointerDown(event)
{
	const intersect = getIntersect(event);
	if (intersect)
		buttonPressed(intersect, true);
}

function onPointerUp(event)
{
	const intersect = getIntersect(event);
	if (intersect)
		buttonReleased(intersect, false);
	else
	{
		for (const key in keysPressed)
			onKeyEvent(key, false);
	}
}

function buttonPressed(intersect)
{
	const objectName = intersect.object.name;
	if (handlers[objectName])
		handlers[objectName](intersect, true);
}

function buttonReleased(intersect)
{
	const objectName = intersect.object.name;
	if (handlers[objectName])
		handlers[objectName](intersect, false);
}

function DPad(intersection, pressed = true)
{
	const localPoint = intersection.object.worldToLocal(intersection.point);
	const rotations = {
		left: () => { onKeyEvent('arrowleft', pressed); },
		right: () => { onKeyEvent('arrowright', pressed); },
		up: () => { onKeyEvent('arrowup', pressed); },
		down: () => { onKeyEvent('arrowdown', pressed); },
	};

	let region = 'center';
	if (localPoint.x < -0.01)
		region = 'left';
	else if (localPoint.x > 0.01)
		region = 'right';
	if (localPoint.y < -0.01)
		region = 'down';
	else if (localPoint.y > 0.01)
		region = 'up';

	if (region !== 'center')
	{
		rotations[region]();
		return;
	}

	onKeyEvent('arrowleft', false);
	onKeyEvent('arrowright', false);
	onKeyEvent('arrowup', false);
	onKeyEvent('arrowdown', false);
}


// ---------------------------------------------------------------

// Animation loop
function animate()
{
	requestAnimationFrame(animate);
	if (!renderer || !scene || !camera)
		return;
	renderer.render(scene, camera);
	handleKeys();
	if (crtUniforms && clock)
		crtUniforms.uTime.value = clock.getElapsedTime();
	if (crtUniforms && crtUniforms.uTexMatrix && gameTexture)
		crtUniforms.uTexMatrix.value.copy(gameTexture.matrix);
	if (gameTexture)
		gameTexture.needsUpdate = true;
}

animate();

function createLoadingOverlay()
{
	const overlay = document.createElement('div');
	Object.assign(overlay.style, {
		position: 'fixed',
		top: '0',
		left: '0',
		width: '100%',
		height: '100%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#0d0d0d',
		color: '#6fffe9',
		fontFamily: '"Jersey 10", sans-serif',
		fontSize: 'min(8vw, 48px)',
		letterSpacing: '0.08em',
		zIndex: '10'
	});
	overlay.textContent = 'Loading BMO...';
	document.body.appendChild(overlay);
	return overlay;
}

function buildCrtMaterial(texture)
{
	crtUniforms = {
		uTexture: { value: texture },
		uTime: { value: 0 },
		uTexMatrix: { value: new THREERef.Matrix3() }
	};
	const vertexShader = `
		varying vec2 vUv;
		void main()
		{
			vUv = uv;
			vec3 displaced = position;
			vec2 centeredUv = (uv - 0.5) * 2.0;
			float curvature = dot(centeredUv, centeredUv);
			displaced.z += curvature * 0.012;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
		}
	`;
	const fragmentShader = `
		uniform sampler2D uTexture;
		uniform float uTime;
		uniform mat3 uTexMatrix;
		varying vec2 vUv;

		float hash(vec2 p)
		{
			return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
		}

		void main()
		{
			float time = uTime;
			vec2 uv = vUv;
			vec2 centered = uv - 0.5;
			float dist = dot(centered, centered);
			vec2 warpedUv = uv + centered * dist * 0.08;

			vec2 jitter = vec2(
				sin(warpedUv.y * 280.0 + time * 32.0) * 0.0013,
				cos(time * 70.0 + warpedUv.y * 160.0) * 0.0010
			);
			vec3 transformed = uTexMatrix * vec3(warpedUv + jitter, 1.0);
			vec2 sampleUv = transformed.xy;

			float scan = sin(warpedUv.y * 780.0) * 0.03;
			float grille = sin(warpedUv.x * 1210.0) * 0.038;
			float triadPhase = sin(warpedUv.x * 280.0);
			vec3 triad = vec3(1.0 + triadPhase * 0.05, 1.0, 1.0 - triadPhase * 0.05);

			vec2 aberration = vec2(dist * 0.009, 0.0);
			vec2 uvR = clamp(sampleUv + aberration, 0.0, 1.0);
			vec2 uvG = clamp(sampleUv, 0.0, 1.0);
			vec2 uvB = clamp(sampleUv - aberration, 0.0, 1.0);
			vec3 color;
			color.r = texture2D(uTexture, uvR).r;
			color.g = texture2D(uTexture, uvG).g;
			color.b = texture2D(uTexture, uvB).b;

			float flicker = 0.97 + sin(time * 6.283) * 0.015 + sin(time * 11.0) * 0.01;

			float fineNoise = hash(sampleUv * (time * 15.0 + 2.5));
			float coarseNoise = hash(sampleUv * 0.4 + time * 1.6);
			float grain = (fineNoise - 0.5) * 0.09 + (coarseNoise - 0.5) * 0.045;

			color *= triad;
			color = color * flicker + vec3(scan * 0.03 + grille * 0.035);
			color += grain;

			float glow = smoothstep(0.42, 0.08, dist) * 0.10;
			float vignette = smoothstep(0.96, 0.38, dist);
			color = mix(color * 0.92, color, vignette);
			color += vec3(glow);
			color = pow(color, vec3(0.95));
			color = clamp(color, 0.0, 1.0);

			gl_FragColor = vec4(color, 1.0);
		}
	`;
	crtMaterial = new THREERef.ShaderMaterial({
		uniforms: crtUniforms,
		vertexShader,
		fragmentShader,
		toneMapped: false
	});
	crtMaterial.side = THREERef.FrontSide;
	crtMaterial.needsUpdate = true;
	return crtMaterial;
}

// Procedurally build richer materials for the face buttons.
function enhanceButtons()
{
	if (!THREERef)
		return;
	const bumpCache = createBumpTexture();
	applyMaterialToTarget(plus_button, {
		bumpMap: bumpCache,
		bumpScale: 0.12,
		metalness: 0.22,
		roughness: 0.58
	});
	applyMaterialToTarget(red_button, {
		bumpMap: bumpCache,
		bumpScale: 0.08,
		metalness: 0.18,
		roughness: 0.6
	});
	applyMaterialToTarget(blue_button, {
		bumpMap: bumpCache,
		bumpScale: 0.08,
		metalness: 0.2,
		roughness: 0.57
	});
	applyMaterialToTarget(green_button, {
		bumpMap: bumpCache,
		bumpScale: 0.07,
		metalness: 0.16,
		roughness: 0.6
	});
}

function setTextureDefaults(texture, { useMipmaps = true, colorSpace = THREERef.SRGBColorSpace } = {})
{
	if (!texture)
		return;
	texture.wrapS = THREERef.ClampToEdgeWrapping;
	texture.wrapT = THREERef.ClampToEdgeWrapping;
	texture.colorSpace = colorSpace;
	texture.generateMipmaps = useMipmaps;
	texture.minFilter = useMipmaps ? THREERef.LinearMipmapLinearFilter : THREERef.LinearFilter;
	texture.magFilter = THREERef.LinearFilter;
	const anisotropy = renderer?.capabilities?.getMaxAnisotropy?.() ?? 1;
	texture.anisotropy = Math.min(anisotropy, 8);
	texture.needsUpdate = true;
}

function createBumpTexture()
{
	const size = 256;
	const canvas = document.createElement('canvas');
	canvas.width = size;
	canvas.height = size;
	const context = canvas.getContext('2d');
	const base = context.createRadialGradient(size / 2, size / 2, size * 0.1, size / 2, size / 2, size * 0.7);
	base.addColorStop(0, 'rgba(210, 210, 210, 1)');
	base.addColorStop(1, 'rgba(110, 110, 110, 1)');
	context.fillStyle = base;
	context.fillRect(0, 0, size, size);
	addNoise(context, size, 0.25);
	const texture = new THREERef.CanvasTexture(canvas);
	setTextureDefaults(texture, { useMipmaps: false, colorSpace: THREERef.NoColorSpace });
	return texture;
}

function addNoise(context, size, intensity)
{
	const imageData = context.getImageData(0, 0, size, size);
	const data = imageData.data;
	for (let i = 0; i < data.length; i += 4)
	{
		const random = (Math.random() - 0.5) * 255 * intensity;
		data[i] = clampColor(data[i] + random);
		data[i + 1] = clampColor(data[i + 1] + random);
		data[i + 2] = clampColor(data[i + 2] + random);
	}
	context.putImageData(imageData, 0, 0);
}

function clampColor(value)
{
	return Math.max(0, Math.min(255, value));
}

function applyMaterialToTarget(target, options)
{
	if (!target || !options)
		return;
	const { bumpMap, bumpScale, metalness, roughness } = options;
	target.traverse(child => {
		if (child.isMesh)
		{
			const original = child.material;
			let updated;
			if (original && original.isMeshStandardMaterial)
				updated = original.clone();
			else
			{
				updated = new THREERef.MeshStandardMaterial({
					color: original?.color ? original.color.clone() : new THREERef.Color(0xffffff),
					map: original?.map ?? null
				});
				if (original?.map)
					updated.map = original.map;
			}
			if (bumpMap)
				updated.bumpMap = bumpMap;
			if (typeof bumpScale === 'number')
				updated.bumpScale = bumpScale;
			if (typeof metalness === 'number')
				updated.metalness = metalness;
			if (typeof roughness === 'number')
				updated.roughness = roughness;
			updated.needsUpdate = true;
			child.material = updated;
			child.castShadow = true;
			child.receiveShadow = true;
		}
	});
}
