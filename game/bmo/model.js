// BMO model setup and button handling logic

let plusButton = null;
let redButton = null;
let blueButton = null;
let greenButton = null;
let screenMesh = null;
let bmoBody = null;

const buttonDefaults = {
	redZ: 0,
	blueZ: 0,
	greenZ: 0,
	plusRotX: 0,
	plusRotY: 0
};

export function getButtonDefaults() {
	return buttonDefaults;
}

export function getButtonRefs() {
	return { plusButton, redButton, blueButton, greenButton, screenMesh, bmoBody };
}

export function setupModel(modelData, setupHandlers) {
	const { THREERef, renderer, model, gameTexture, camera, scene } = modelData;

	plusButton = model.getObjectByName("plus_button");
	redButton = model.getObjectByName("Red_button");
	blueButton = model.getObjectByName("triangle_button");
	greenButton = model.getObjectByName("small_button");
	screenMesh = model.getObjectByName("screen");
	bmoBody = model.getObjectByName("Body") || model;

	// Save default button positions/rotations for reset
	buttonDefaults.redZ = redButton ? redButton.position.z : 0;
	buttonDefaults.blueZ = blueButton ? blueButton.position.z : 0;
	buttonDefaults.greenZ = greenButton ? greenButton.position.z : 0;
	buttonDefaults.plusRotX = plusButton ? plusButton.rotation.x : 0;
	buttonDefaults.plusRotY = plusButton ? plusButton.rotation.y : 0;

	// Configure screen texture and material
	configureScreenTexture(THREERef, gameTexture);
	configureScreenMaterial(THREERef, gameTexture);

	// Enhance button materials
	const { enhanceButtons } = setupHandlers;
	if (enhanceButtons)
		enhanceButtons({ three: THREERef, renderer, plus: plusButton, red: redButton, blue: blueButton, green: greenButton });

	return { camera, scene };
}

export function configureScreenTexture(THREERef, texture) {
	if (!texture)
		return;
	texture.repeat.set(-1, 1);
	texture.offset.set(0, 0);
	texture.center = new THREERef.Vector2(0.5, 0.5);
	texture.rotation = -Math.PI / 2;
	texture.matrixAutoUpdate = false;
	if (typeof texture.updateMatrix === "function")
		texture.updateMatrix();
	texture.needsUpdate = true;
}

export function configureScreenMaterial(THREERef, texture) {
	if (!screenMesh)
		return;
	const material = new THREERef.MeshBasicMaterial({ map: texture, toneMapped: false });
	material.needsUpdate = true;
	screenMesh.material = material;
}

export function createUpdateButtonTransforms(isKeyDownFn) {
	return function updateButtonTransforms() {
		if (!plusButton || !redButton || !blueButton || !greenButton)
			return;

		const angle = 0.1;
		plusButton.rotation.x = isKeyDownFn("arrowup") || isKeyDownFn("keyw") ? -angle : isKeyDownFn("arrowdown") || isKeyDownFn("keys") ? angle : buttonDefaults.plusRotX;
		plusButton.rotation.y = isKeyDownFn("arrowleft") || isKeyDownFn("keya") ? -angle : isKeyDownFn("arrowright") || isKeyDownFn("keyd") ? angle : buttonDefaults.plusRotY;

		const offset = -0.005;
		redButton.position.z = isKeyDownFn("space") ? buttonDefaults.redZ + offset : buttonDefaults.redZ;
		blueButton.position.z = isKeyDownFn("keyg") ? buttonDefaults.blueZ + offset : buttonDefaults.blueZ;
		greenButton.position.z = isKeyDownFn("keyr") ? buttonDefaults.greenZ + offset : buttonDefaults.greenZ;
	};
}

export function createButtonHandlers(callbacks) {
	const { applyKey, triggerGameStart, restartGame, gameOver, gameStart } = callbacks;

	return {
		plus_button: handleDPad,
		Red_button: (_, pressed) => applyKey("space", pressed),
		triangle_button: (_, pressed) => applyKey("keyg", pressed),
		small_button: handleGreenButton
	};

	function handleDPad(intersection, pressed) {
		if (!pressed) {
			releaseDirectionalKeys();
			return;
		}
		if (!intersection)
			return;
		const localPoint = intersection.object.worldToLocal(intersection.point);
		let target = null;
		if (localPoint.x < -0.01)
			target = "arrowleft";
		else if (localPoint.x > 0.01)
			target = "arrowright";
		if (localPoint.y < -0.01)
			target = "arrowdown";
		else if (localPoint.y > 0.01)
			target = "arrowup";
		if (!target) {
			releaseDirectionalKeys();
			return;
		}
		releaseDirectionalKeys(target);
		applyKey(target, true);
	}

	function handleGreenButton(_, pressed) {
		applyKey("keyr", pressed);
		if (!pressed)
			return;
		if (gameOver())
			restartGame();
		else if (!gameStart())
			triggerGameStart();
	}

	function releaseDirectionalKeys(except) {
		["arrowleft", "arrowright", "arrowup", "arrowdown"].forEach((code) => {
			if (code !== except)
				applyKey(code, false);
		});
	}
}

export default {
	setupModel,
	configureScreenTexture,
	configureScreenMaterial,
	createUpdateButtonTransforms,
	createButtonHandlers,
	getButtonRefs,
	getButtonDefaults
};
