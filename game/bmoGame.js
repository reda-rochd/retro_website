import { assetsManager } from "./assets.js";
import { Player } from "./player.js";
import { Background } from "./background.js";
import { Marceline } from "./marceline.js";
import { initThree, fitCameraToObject, setFrameCallback } from "./bmo/threejs.js";
import * as Keys from "./bmo/keys.js";
import * as Touch from "./bmo/touch.js";
import * as Session from "./bmo/session.js";
import { createLoadingOverlay, showResultOverlay, showSubmitErrorOverlay } from "./bmo/ui.js";
import {
	setupModel,
	createUpdateButtonTransforms,
	createButtonHandlers,
	getButtonRefs
} from "./bmo/model.js";

document.addEventListener("contextmenu", (event) => event.preventDefault());

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const width = canvas.width;
const height = canvas.height;

const THREE_MODULE_URL = "https://unpkg.com/three@0.168.0/build/three.module.js?module";
const GLTF_LOADER_URL = "https://unpkg.com/three@0.168.0/examples/jsm/loaders/GLTFLoader.js?module";
const DRACO_LOADER_URL = "https://unpkg.com/three@0.168.0/examples/jsm/loaders/DRACOLoader.js?module";
const MODEL_PATH = "assets/BMO.glb";

const FPS = 24;
const FIXED_DT = 1 / FPS;
let accumulator = 0;
let lastTime = performance.now();

const assets = assetsManager();

const player = new Player(width / 2, height - 60, width, height);
const boss = new Marceline(width * 0.8, height - 60, width, height);
boss.setIdleTimer();

let background;
let update = startScreenUpdate;
let draw = startScreenDraw;
let gameStart = false;
let gameOver = false;
let shouldStop = false;
let alpha = 0;
let fadeStep = 0.05;
let bestSession = null;

let loadingOverlay = null;
let threeBootstrapped = false;

const keyState = Object.create(null);

Keys.initKeys();
Keys.onKeyEvent(onKeyDown, onKeyUp);
window.addEventListener("blur", releaseAllKeys);

async function startGame() {
	await assets.load();
	background = new Background(width, height, assets);
	restartGame();
	scheduleThreeInit();
	Session.fetchBestSession().then((best) => {
		if (best)
			bestSession = best;
	}).catch(() => {});
	requestAnimationFrame(gameLoop);
}

function onKeyDown(code) {
	applyKey(code, true);
	if (!gameStart && !gameOver)
		triggerGameStart();
}

function onKeyUp(code) { applyKey(code, false); }

function applyKey(rawCode, pressed) {
	const code = rawCode.toLowerCase();
	if (pressed) {
		if (keyState[code])
			return;
		keyState[code] = true;
		player.states[player.state].onKeyDown(code);
		return;
	}
	if (!keyState[code])
		return;
	delete keyState[code];
	player.states[player.state].onKeyUp(code);
}

function isKeyDown(code) { return Boolean(keyState[code]); }

function releaseAllKeys() {
	Object.keys(keyState).forEach((code) => applyKey(code, false));
}

function triggerGameStart() {
	if (gameStart)
		return;
	gameStart = true;
	shouldStop = false;
	Session.beginRun();
	player.setState("jakeRollIn");
	update = transitionUpdate;
	draw = transitionDraw;
	Session.requestStartToken().then((result) => {
		if (result?.token)
			Session.setToken(result.token);
		if (result?.startTime)
			Session.setStart(result.startTime);
	}).catch((err) => console.warn("Start token request failed", err));
}

function startScreenUpdate() { player.update(); }

function drawStartMessage() {
	ctx.fillStyle = "#181818";
	ctx.font = `${width * 0.06}px "Jersey 10", sans-serif`;
	ctx.textAlign = "center";
	ctx.fillText("Press GREEN to start", width / 2, height * 0.28);
	const best = Session.getBestSession() || bestSession;
	if (!best)
		return;
	ctx.font = `${width * 0.035}px "Jersey 10", sans-serif`;
	const mins = Math.floor(best.durationSec / 60);
	const secs = best.durationSec % 60;
	ctx.fillText(`Best: ${best.score} pts — ${mins}:${String(secs).padStart(2, "0")}`, width / 2, height * 0.36);
}

function startScreenDraw() {
	drawBackground(true);
	player.draw(ctx, assets);
	drawStartMessage();
}

function transitionUpdate() {
	if (player.x > width) {
		player.x = -50;
		update = blackScreenUpdate;
		draw = blackScreenDraw;
		return;
	}
	if (shouldStop && player.x >= width * 0.2)
		player.setState("jakeRollOut");
	player.update();
	if (player.state === "idle") {
		update = gameUpdate;
		draw = gameDraw;
	}
}

function transitionDraw() {
	drawBackground();
	if (((Date.now() / 80) | 0) % 2 === 0)
		drawStartMessage();
	player.draw(ctx, assets);
}

function blackScreenUpdate(delta) {
	alpha += fadeStep;
	if (alpha >= 1) {
		if (background)
			background.showTutorial = false;
		fadeStep = -fadeStep;
	}
	if (fadeStep < 0)
		boss.update(delta, player);
	if (alpha <= 0 && fadeStep < 0)
		shouldStop = true;
	if (!shouldStop)
		return;
	if (player.x > width * 0.2)
		player.setState("jakeRollOut");
	player.update();
	if (player.state === "idle") {
		update = gameUpdate;
		draw = gameDraw;
	}
}

function blackScreenDraw(delta) {
	drawBackground();
	player.draw(ctx, assets);
	if (fadeStep < 0)
		boss.draw(ctx, assets);
	ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
	ctx.fillRect(0, 0, width, height);
}

function gameUpdate(deltaTime) {
	if (boss.isCalm && !gameOver) {
		victoryMessage();
		return;
	}
	player.update(deltaTime);
	boss.update(deltaTime, player);
}

function gameDraw() {
	ctx.clearRect(0, 0, width, height);
	drawBackground();
	drawHpBar();
	boss.drawHpBar(ctx);
	if (boss.isAttacking) {
		player.draw(ctx, assets);
		boss.draw(ctx, assets);
	} else {
		boss.draw(ctx, assets);
		player.draw(ctx, assets);
	}
}

function drawBackground(moveBackground = false) {
	ctx.clearRect(0, 0, width, height);
	if (moveBackground && background)
		background.update();
	background?.draw(ctx, assets);
}

let flickerTimer = 0;
function drawHpBar() {
	if (player.state === "hurt")
		flickerTimer = 1;
	const bar = assets.get("hp_bar");
	const w = bar.width;
	ctx.save();
	ctx.scale(0.5, 0.5);
	const h = bar.height / 9;
	let hp = 8 - player.hp;
	if (flickerTimer > 0) {
		if (((flickerTimer * 10) | 0) % 2 === 0)
			hp--;
		flickerTimer -= 0.05;
	}
	const y = hp * h;
	ctx.drawImage(bar, 0, y, w, h, 10, 10, w, h);
	ctx.restore();
}

function gameLoop(timestamp) {
	const delta = (timestamp - lastTime) / 1000;
	lastTime = timestamp;
	accumulator += delta;
	if (!player.isDead && !gameOver) {
		while (accumulator >= FIXED_DT) {
			update(FIXED_DT);
			accumulator -= FIXED_DT;
		}
	}
	draw();
	if (player.isDead && !gameOver)
		endGame();
	requestAnimationFrame(gameLoop);
}

function endGame() {
	releaseAllKeys();
	ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
	ctx.fillRect(0, 0, width, height);
	ctx.fillStyle = "white";
	ctx.textAlign = "center";
	ctx.font = `${width * 0.12}px "Jersey 10", sans-serif`;
	ctx.fillText("Game Over", width / 2, height / 2);
	gameStart = false;
	gameOver = true;
	handleSubmission(false);
}

function drawVictoryOverlay() {
	ctx.fillStyle = "#181818";
	ctx.textAlign = "center";
	ctx.font = `${width * 0.12}px "Jersey 10", sans-serif`;
	ctx.fillText("You Win!", width / 2, height / 2);
	ctx.font = `${width * 0.05}px "Jersey 10", sans-serif`;
	ctx.fillText("Marceline is calm again.", width / 2, height / 2 + 40);
}

function victoryMessage() {
	releaseAllKeys();
	drawVictoryOverlay();
	gameStart = false;
	gameOver = true;
	handleSubmission(true);
}

async function handleSubmission(victory) {
	try {
		const result = await Session.submitIfNeeded({ victory });
		if (result) {
			bestSession = Session.getBestSession() || result;
			showResultOverlay(result, restartGame);
			return;
		}
	} catch (err) {
		console.warn("submitIfNeeded error", err);
	}
	showSubmitErrorOverlay("Submission failed or timed out", async () => {
		const retry = await Session.submitIfNeeded({ victory });
		if (retry) {
			bestSession = Session.getBestSession() || retry;
			showResultOverlay(retry, restartGame);
		}
	}, restartGame);
}

function restartGame() {
	if (gameStart)
		return;
	releaseAllKeys();
	alpha = 0;
	fadeStep = 0.05;
	player.x = width / 2;
	player.y = height - 60;
	player.reset();
	player.setState("walking");
	boss.x = width * 0.8;
	boss.y = height - 60;
	boss.reset();
	boss.setIdleTimer();
	background?.reset();
	gameStart = false;
	gameOver = false;
	shouldStop = false;
	update = startScreenUpdate;
	draw = startScreenDraw;
	Session.resetRun();
}

function scheduleThreeInit() {
	if (threeBootstrapped)
		return;
	threeBootstrapped = true;
	const init = async () => {
		loadingOverlay = createLoadingOverlay();
		try {
			await initThree({
				THREE_MODULE_URL,
				GLTF_LOADER_URL,
				DRACO_LOADER_URL,
				modelPath: MODEL_PATH,
				canvas,
				onModelLoaded: setupModelCallback,
				onProgress: updateLoadingOverlay,
				onError: (err) => {
					console.error("Model load error:", err);
					if (loadingOverlay)
						loadingOverlay.textContent = "Failed to load model";
				}
			});
			setFrameCallback(createUpdateButtonTransforms(isKeyDown));
		} catch (error) {
			console.error("Failed to initialize Three.js scene:", error);
			threeBootstrapped = false;
			if (loadingOverlay)
				loadingOverlay.textContent = "Failed to load model";
		}
	};
	if ("requestIdleCallback" in window)
		requestAnimationFrame(() => window.requestIdleCallback(init, { timeout: 300 }));
	else
		requestAnimationFrame(init);
}

function updateLoadingOverlay(xhr) {
	if (!loadingOverlay || !loadingOverlay.isConnected)
		return;
	const total = xhr.total || xhr.loaded;
	if (!total) {
		loadingOverlay.textContent = "Loading BMO...";
		return;
	}
	const percent = (xhr.loaded / total) * 100;
	if (percent >= 100)
		loadingOverlay.textContent = "Decoding BMO...";
	else
		loadingOverlay.textContent = `Loading BMO... ${percent.toFixed(0)}%`;
}

function setupModelCallback(modelData) {
	setupModel(modelData, { enhanceButtons });
	const { bmoBody } = getButtonRefs();
	Touch.initTouch({ scene: modelData.scene, camera: modelData.camera, three: modelData.THREERef });
	const buttonHandlers = createButtonHandlers({
		applyKey,
		triggerGameStart,
		restartGame,
		gameOver: () => gameOver,
		gameStart: () => gameStart
	});
	Touch.setHandlers(buttonHandlers);
	fitCameraToObject(bmoBody);
	if (loadingOverlay && loadingOverlay.isConnected)
		loadingOverlay.remove();
	loadingOverlay = null;
}

startGame();
