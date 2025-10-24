import { useEffect, useRef } from 'react'
import api from '../../api/client'

export default function Game() {
	const iframeRef = useRef(null)

	useEffect(() => {
		const prevOverflow = window.getComputedStyle(document.body).overflow ?? document.body.style.overflow
		const prevPadding = document.body.style.padding ?? document.body.style.padding
		document.body.style.overflow = 'hidden'
		document.body.style.padding = '0'
		return () => {
			document.body.style.overflow = prevOverflow
			document.body.style.padding = prevPadding
		}
	}, [])


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
		<div className="w-screen h-screen">
			<iframe
				ref={iframeRef}
				title="Retro game"
				src="/game/model.html"
		className="w-full h-full border-0"
				sandbox="allow-scripts allow-same-origin"
			/>
		</div>
	)
}
