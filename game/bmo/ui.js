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
	const overlay = document.createElement('div');
	Object.assign(overlay.style, {
		position: 'fixed',
		left: '50%',
		top: '50%',
		transform: 'translate(-50%,-50%)',
		background: '#0b0b0b',
		color: '#fff',
		padding: '20px',
		borderRadius: '8px',
		zIndex: 9999,
		textAlign: 'center',
		fontFamily: '"Jersey 10", sans-serif'
	});
	const mins = Math.floor(result.durationSec / 60);
	const secs = result.durationSec % 60;
	overlay.innerHTML = `<div style="font-size:20px; margin-bottom:8px">You scored ${result.score} pts</div>` +
		`<div style="font-size:14px; margin-bottom:8px">Time: ${mins}:${String(secs).padStart(2,'0')}</div>` +
		`<div style="font-size:12px; margin-bottom:12px">${result.newBest ? 'New personal best! 🎉' : 'Not a new best'}</div>` +
		`<button id="closeResultBtn" style="padding:8px 12px; font-size:14px">Close</button>`;
	document.body.appendChild(overlay);
	const button = document.getElementById('closeResultBtn');
	const cleanup = () => {
		if (overlay && overlay.parentNode)
			overlay.parentNode.removeChild(overlay);
		if (typeof onClose === 'function')
			onClose();
	};
	button.addEventListener('click', cleanup, { once: true });
}

export function showSubmitErrorOverlay(message, retryCallback, cancelCallback) {
	const overlay = document.createElement('div');
	Object.assign(overlay.style, {
		position: 'fixed',
		left: '50%',
		top: '50%',
		transform: 'translate(-50%,-50%)',
		background: '#2b0b0b',
		color: '#fff',
		padding: '20px',
		borderRadius: '8px',
		zIndex: 9999,
		textAlign: 'center',
		fontFamily: '"Jersey 10", sans-serif'
	});
	overlay.innerHTML = `<div style="font-size:18px; margin-bottom:8px">Failed to submit score</div>` +
		`<div style="font-size:12px; margin-bottom:12px">${String(message || 'Unknown error')}</div>` +
		`<div style="display:flex; gap:8px; justify-content:center">` +
		`<button id="retrySubmitBtn" style="padding:8px 12px; font-size:14px">Retry</button>` +
		`<button id="cancelSubmitBtn" style="padding:8px 12px; font-size:14px">Cancel</button>` +
		`</div>`;
	document.body.appendChild(overlay);
	const cleanup = () => {
		if (overlay && overlay.parentNode)
			overlay.parentNode.removeChild(overlay);
	};
	document.getElementById('retrySubmitBtn').addEventListener('click', async () => {
		cleanup();
		if (typeof retryCallback === 'function')
			await retryCallback();
	});
	document.getElementById('cancelSubmitBtn').addEventListener('click', () => {
		cleanup();
		if (typeof cancelCallback === 'function')
			cancelCallback();
	});
}

export default { createLoadingOverlay, showResultOverlay, showSubmitErrorOverlay };
