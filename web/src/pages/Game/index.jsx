import { useEffect, useRef, useState } from 'react'
import api from '../../api/client'

export default function Game() {
	const iframeRef = useRef(null)
	const [showIntro, setShowIntro] = useState(true)
	const [needsTapToStart, setNeedsTapToStart] = useState(true)
	const [showSkip, setShowSkip] = useState(false)
	const videoRef = useRef(null)
	const skipTimerRef = useRef(null)
	const [fadingOut, setFadingOut] = useState(false)

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
				try { sourceWindow.postMessage(msg, event.origin); } catch (err) {console.log(err);}
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

	useEffect(() => {
		return () => {
			if (skipTimerRef.current) {
				clearTimeout(skipTimerRef.current)
				skipTimerRef.current = null
			}
		}
	}, [])

	function startVideoWithAudio() {
		const v = videoRef.current
		if (!v) return
		try {
			v.currentTime = 0
			v.muted = false
			const playPromise = v.play()
			if (playPromise && typeof playPromise.then === 'function') {
				playPromise.catch(() => {
					v.muted = true
					v.play().catch((e) => console.log(e))
				})
			}
		} finally {
			setNeedsTapToStart(false)
			skipTimerRef.current = setTimeout(() => setShowSkip(true), 3000)
		}
	}

	function closeIntro() {
		if (skipTimerRef.current) {
			clearTimeout(skipTimerRef.current)
			skipTimerRef.current = null
		}
		try {
			videoRef.current?.pause()
		} catch(e) {console.log(e);}

		setFadingOut(true)
		setTimeout(() => {
			setShowIntro(false)
			setFadingOut(false)
			iframeRef.current?.focus()
		}, 1000)
	}

	return (
		<div className="w-screen h-screen relative overflow-hidden">
			<iframe
				ref={iframeRef}
				title="Retro game"
				src="/game/model.html"
				className="w-full h-full border-0"
				sandbox="allow-scripts allow-same-origin"
			/>
			{showIntro && (
				<div
					className={`absolute inset-0 z-50 flex items-center justify-center bg-black/90 overflow-hidden transition-opacity transition-[backdrop-filter] duration-1000 ${fadingOut ? 'opacity-0 backdrop-blur-md' : 'opacity-100 backdrop-blur-0'}`}
				>
					<video
						ref={videoRef}
						className="absolute inset-0 h-full object-cover m-auto"
						src="/game/assets/intro.webm"
						playsInline
						muted={needsTapToStart}
						autoPlay={false}
						onEnded={closeIntro}
						onError={closeIntro}
					/>

					{needsTapToStart && (
						<button
							onClick={startVideoWithAudio}
							className="absolute inset-0 flex items-center justify-center text-white select-none"
						>
							<span className="px-5 py-3 bg-white/10 backdrop-blur rounded-lg border border-white/20 text-lg font-semibold shadow-lg">
								Tap to start
							</span>
						</button>
					)}

					{!needsTapToStart && showSkip && (
						<button
							onClick={closeIntro}
							className="absolute inset-0 text-white/80 text-sm select-none hover:text-white transition"
						>
							<span className="absolute top-12 left-0 right-0">
								Tap Again To Skip Intro
							</span>
						</button>
					)}
				</div>
			)}
		</div>
	)
}

