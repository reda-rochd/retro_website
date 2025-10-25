import { useEffect, useRef, useState } from 'react'
import api from '../../api/client'

export default function Game() {
	const iframeRef = useRef(null)
	const [showIntro, setShowIntro] = useState(true)

	useEffect(() => {
		const prevOverflow = document.body.style.overflow;
		const children = Array.from(document.body.children);
		const prevPaddings = children.map(el => el.style.padding);

		document.body.style.overflow = 'hidden';
		children.forEach(el => (el.style.padding = '0'));

		return () => {
			document.body.style.overflow = prevOverflow;
			children.forEach((el, i) => (el.style.padding = prevPaddings[i]));
		};
	}, []);

	useEffect(() => {
		iframeRef.current?.focus()
	}, [])

	useEffect(() => {
		const iframeEl = iframeRef.current;
		if (!iframeEl) return;

		function isFromIframeOrigin(event) {
			try {
				return new URL(event.origin).origin === window.location.origin;
			} catch (e) {
				return false;
			}
		}

		async function handleMessage(event) {
			const data = event.data || {};
			if (!data.type || !data.requestId) return;
			if (!isFromIframeOrigin(event)) return;

			const sourceWindow = event.source;
			const respond = (success, payload = null, error = null) => {
				const msg = { type: 'RESPONSE', responseTo: data.requestId, success, payload, error };
				try { sourceWindow.postMessage(msg, event.origin); } catch (err) { /* ignore */ }
			};

			try {
				if (data.type === 'REQUEST_START') {
					const res = await api.post('/game-session/start');
					respond(true, res.data);
				} else if (data.type === 'REQUEST_SUBMIT') {
					const { token, victory = false } = data.payload || {};
					const res = await api.post('/game-session/submit', { token, victory });
					respond(true, res.data);
				} else if (data.type === 'REQUEST_BEST') {
					const res = await api.get('/game-session/best');
					respond(true, res.data);
				}
			} catch (err) {
				const message = err?.response?.data?.error || err?.response?.data?.message || err.message || 'unknown';
				respond(false, null, message);
			}
		}

		window.addEventListener('message', handleMessage);
		return () => window.removeEventListener('message', handleMessage);
	}, []);

	return (
		<div className="w-screen h-screen relative">
			<iframe
				ref={iframeRef}
				title="Retro game"
				src="/game/model.html"
				className="w-full h-full border-0"
				sandbox="allow-scripts allow-same-origin"
			/>
			{showIntro && (
				<div
					className="absolute inset-0 z-50 flex items-center justify-center bg-black/90"
					onClick={() => {
						setShowIntro(false);
						setTimeout(() => iframeRef.current?.focus(), 0);
					}}
					role="button"
					aria-label="Tap to skip intro"
				>
					<video
						className="max-w-full max-h-full"
						src="/game/assets/intro.webm"
						autoPlay
						muted
						playsInline
						onEnded={() => {
							setShowIntro(false);
							setTimeout(() => iframeRef.current?.focus(), 0);
						}}
						onError={() => {
							setShowIntro(false);
							setTimeout(() => iframeRef.current?.focus(), 0);
						}}
					/>
					<div className="absolute bottom-4 right-4 text-white/70 text-sm select-none text-center text-shadow-sm">
						Tap to skip
					</div>
				</div>
			)}
		</div>
	)
}
