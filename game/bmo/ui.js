export function createLoadingOverlay() {
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

export function showResultOverlay(result, onClose) {
	return { result, onClose };
}

export function drawResultOnCanvas(ctx, result, width, height) {
	// Dim the background
	ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
	ctx.fillRect(0, 0, width, height);

	const centerX = width / 2;
	const centerY = height / 2;

	// Determine if victory or loss
	const isVictory = result.victory === true;

	// Draw title
	ctx.fillStyle = isVictory ? '#6fffe9' : '#ff6b6b';
	ctx.textAlign = 'center';
	ctx.font = `${width * 0.08}px "Jersey 10", sans-serif`;
	ctx.fillText(isVictory ? 'Victory!' : 'Defeat!', centerX, centerY - 60);

	// Draw score
	ctx.fillStyle = '#fff';
	ctx.font = `${width * 0.05}px "Jersey 10", sans-serif`;
	ctx.fillText(`Score: ${result.score} pts`, centerX, centerY - 10);

	// Draw time
	const mins = Math.floor(result.durationSec / 60);
	const secs = result.durationSec % 60;
	ctx.font = `${width * 0.04}px "Jersey 10", sans-serif`;
	ctx.fillText(`Time: ${mins}:${String(secs).padStart(2, '0')}`, centerX, centerY + 20);

	// Draw best status (only for victories)
	if (isVictory) {
		ctx.fillStyle = result.newBest ? '#6fffe9' : '#aaa';
		ctx.font = `${width * 0.035}px "Jersey 10", sans-serif`;
		ctx.fillText(result.newBest ? '🎉 New Personal Best!' : 'Not a new best', centerX, centerY + 50);
	}

	// Draw instruction
	ctx.fillStyle = '#6fffe9';
	ctx.font = `${width * 0.03}px "Jersey 10", sans-serif`;
	ctx.fillText('Press GREEN to continue', centerX, centerY + 90);
}

export function showSubmitErrorOverlay(message, retryCallback, cancelCallback) {
	return { message, retryCallback, cancelCallback };
}

export function drawErrorOnCanvas(ctx, message, width, height) {
	// Dim the background
	ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
	ctx.fillRect(0, 0, width, height);

	const centerX = width / 2;
	const centerY = height / 2;

	// Draw title
	ctx.fillStyle = '#ff6b6b';
	ctx.textAlign = 'center';
	ctx.font = `${width * 0.08}px "Jersey 10", sans-serif`;
	ctx.fillText('Submission Failed', centerX, centerY - 40);

	// Draw message
	ctx.fillStyle = '#fff';
	ctx.font = `${width * 0.04}px "Jersey 10", sans-serif`;
	ctx.fillText(String(message || 'Unknown error'), centerX, centerY + 10);

	// Draw instructions
	ctx.fillStyle = '#6fffe9';
	ctx.font = `${width * 0.03}px "Jersey 10", sans-serif`;
	ctx.fillText('GREEN to Retry | RED to Cancel', centerX, centerY + 60);
}

export default { createLoadingOverlay, showResultOverlay, showSubmitErrorOverlay, drawResultOnCanvas, drawErrorOnCanvas };
