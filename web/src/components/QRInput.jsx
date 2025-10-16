import { useState, useRef } from "react";
import Modal from "/src/components/Modal.jsx";
import jsQR from "jsqr";

export default function QRScanner({ onScan, placeholder="Scan QR Code", className = "" }) {
	const videoRef = useRef(null);
	const canvasRef = useRef(null);
	const scanningRef = useRef(false);
	const handlingScanRef = useRef(false);
	const [scanning, setScanning] = useState(false);


	const startScan = async () => {
		if (scanningRef.current) return;
		setScanning(true);
		scanningRef.current = true;

		try {
			const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
			videoRef.current.srcObject = stream;
			videoRef.current.play();

			const tick = async () => {
				if (!scanningRef.current) return;

				const video = videoRef.current;
				const canvas = canvasRef.current;
				const ctx = canvas.getContext("2d", { willReadFrequently: true });
				if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth && video.videoHeight) {
					canvas.width = video.videoWidth;
					canvas.height = video.videoHeight;
					ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
					const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
					const code = jsQR(imageData.data, canvas.width, canvas.height);
					if (code && !handlingScanRef.current) {
						handlingScanRef.current = true;
						try {
							const result = onScan ? onScan(code.data) : true;
							const resolved = result && typeof result.then === "function" ? await result : result;
							if (resolved !== false) {
								stopScan();
								return;
							}
						} catch (error) {
							console.error("QR scan handler failed:", error);
						} finally {
							handlingScanRef.current = false;
						}
					}
				}
				requestAnimationFrame(tick);
			};
			requestAnimationFrame(tick);
		} catch (err) {
			console.error("Camera access denied:", err);
			scanningRef.current = false;
			setScanning(false);
		}
	};

	const stopScan = () => {
		scanningRef.current = false;
		handlingScanRef.current = false;
		const stream = videoRef.current?.srcObject;
		if (stream) {
			stream.getTracks().forEach(track => track.stop());
		}
		videoRef.current.srcObject = null;
		setScanning(false);
	};

	const cancelScan = () => {
		if (scanningRef.current) {
			stopScan();
		}
	}

	// useRef(() => {
	// }, [])

	return (
		<div className={`${className}`}>
			<button
				onClick={scanning ? cancelScan : startScan}
				className={`relative flex items-center gap-2 cursor-pointer w-fit`}
			>
				<span className="">{placeholder}</span>
				<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-6 h-6" viewBox="0 0 640 640"><path  d="M160 224L224 224L224 160L160 160L160 224zM96 144C96 117.5 117.5 96 144 96L240 96C266.5 96 288 117.5 288 144L288 240C288 266.5 266.5 288 240 288L144 288C117.5 288 96 266.5 96 240L96 144zM160 480L224 480L224 416L160 416L160 480zM96 400C96 373.5 117.5 352 144 352L240 352C266.5 352 288 373.5 288 400L288 496C288 522.5 266.5 544 240 544L144 544C117.5 544 96 522.5 96 496L96 400zM416 160L416 224L480 224L480 160L416 160zM400 96L496 96C522.5 96 544 117.5 544 144L544 240C544 266.5 522.5 288 496 288L400 288C373.5 288 352 266.5 352 240L352 144C352 117.5 373.5 96 400 96zM384 416C366.3 416 352 401.7 352 384C352 366.3 366.3 352 384 352C401.7 352 416 366.3 416 384C416 401.7 401.7 416 384 416zM384 480C401.7 480 416 494.3 416 512C416 529.7 401.7 544 384 544C366.3 544 352 529.7 352 512C352 494.3 366.3 480 384 480zM480 512C480 494.3 494.3 480 512 480C529.7 480 544 494.3 544 512C544 529.7 529.7 544 512 544C494.3 544 480 529.7 480 512zM512 416C494.3 416 480 401.7 480 384C480 366.3 494.3 352 512 352C529.7 352 544 366.3 544 384C544 401.7 529.7 416 512 416zM480 448C480 465.7 465.7 480 448 480C430.3 480 416 465.7 416 448C416 430.3 430.3 416 448 416C465.7 416 480 430.3 480 448z"/></svg>
			</button>
			<div className="fixed inset-0 bg-black/50 flex items-center justify-center" style={{ display: scanning ? 'block' : 'none' }}>
				<Modal onClose={cancelScan} open={scanning} className="bg-white p-2">
					<div className="w-full h-full rounded-xl overflow-hidden">
						<video
							ref={videoRef}
							className="w-full h-full object-cover"
							autoPlay
							muted
							playsInline
						/>
					</div>
				</Modal>
			</div>
			<canvas ref={canvasRef} style={{ display: "none" }} />
		</div>
	);
}

