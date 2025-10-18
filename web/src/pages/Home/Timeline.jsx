import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Section from "../../components/Section.jsx";
import api from '/src/api/client.js';
import './Timeline.css';

function makeFakeText(len = 3) {
	const pool = ['coming', 'soon', 'awaiting', 'unveiled', 'mystery', 'story', 'echoes', 'rise', 'next', 'whisper'];
	return Array.from({ length: len }, () => pool[Math.floor(Math.random() * pool.length)]).join(' ');
}


export default function Timeline() {
	const containerRef = useRef(null);
	const [events, setEvents] = useState([]);

	useEffect(() => {
		api.get('/public/events')
		.then(res => setEvents(res.data))
		.catch(console.error);
	}, []);

	useEffect(() => {
		const container = containerRef.current;
		const items = Array.from(container.querySelectorAll('.timeline-item'));
		const svg = container.querySelector('svg');
		const basePath = svg.querySelector('#base');
		const highlightPath = svg.querySelector('#highlight');
		const styles = getComputedStyle(container);
		// const baseline = parseFloat(styles.getPropertyValue('--timeline-baseline'));
		const amplitude = parseFloat(styles.getPropertyValue('--timeline-amplitude'));
		if (items.length === 0) return;

		const update = () => {
			const containerRect = container.getBoundingClientRect();

			const points = items.map((item, i) => {
				const itemRect = item.getBoundingClientRect();
				const cs = getComputedStyle(item, '::before');
				const left = parseFloat(cs.left) || 0;
				const top = parseFloat(cs.top) || 0;
				const w = parseFloat(cs.width) || 0;
				const h = parseFloat(cs.height) || 0;
				const x = ((itemRect.left - containerRect.left) + left + w / 2) + (i % 2 ? amplitude : -amplitude);
				const y = (itemRect.top - containerRect.top) + top + h / 2;
				return [x, y];
			});

			const tension = 1 / 12;
			const d = points.slice(1).reduce((path, [x2, y2], i) => {
				const [x1, y1] = points[i];
				const [x0, y0] = points[i - 1] || [x1, y1];
				const [x3, y3] = points[i + 2] || [x2, y2];
				const cp1x = x1 + (x2 - x0) * tension;
				const cp1y = y1 + (y2 - y0) * tension;
				const cp2x = x2 - (x3 - x1) * tension;
				const cp2y = y2 - (y3 - y1) * tension;
				return `${path} C${cp1x},${cp1y} ${cp2x},${cp2y} ${x2},${y2}`;
			}, `M${points[0][0]},${points[0][1]}`);

			basePath.setAttribute('d', d);
			highlightPath.setAttribute('d', d);

			const pathLength = highlightPath.getTotalLength();
			highlightPath.style.setProperty('--path-length', pathLength);
			const triggerPoint = window.innerHeight * 0.5;
			const progress = (triggerPoint - containerRect.top) / containerRect.height;
			const cappedProgress = Math.max(0, Math.min(1, progress));
			const drawLength = pathLength * cappedProgress;
			highlightPath.style.strokeDashoffset = pathLength - drawLength;

			const cutoffY = highlightPath.getPointAtLength(drawLength).y;
			items.forEach((_, i) => {
				const [, py] = points[i];
				items[i].classList.toggle('active', py <= cutoffY);
			});
		};

		window.addEventListener('scroll', update, { passive: true });
		window.addEventListener('resize', update);
		update();

		return () => {
			window.removeEventListener('scroll', update);
			window.removeEventListener('resize', update);
		};
	}, [events.length]);

	return (
		<Section className="timeline" ref={containerRef}>
			<h2>Our Journey</h2>
			<svg xmlns="http://www.w3.org/2000/svg">
				<path id="base" />
				<path id="highlight" className="highlight" />
			</svg>

			{events.map((e, idx) => {
				const name = e.isUpcoming ? makeFakeText(2) : e.name;
				const description = e.isUpcoming ? makeFakeText(18) : e.description;

				return (
					<div
						key={idx}
						className={`timeline-item`}	
					>
						<time>
							{new Date(e.date).toLocaleDateString(undefined, {
								year: 'numeric',
								month: 'short',
								day: 'numeric',
							})}
						</time>
						<h3 className={e.isUpcoming && "select-none blur font-light" || ""}>{name}</h3>
						<p className={e.isUpcoming && "select-none blur" || ""}>{description}</p>
						{!e.isUpcoming && (<Link to={`/event/${encodeURIComponent(e.name)}`} className="text-sm italic underline mt-2 text-[var(--color-accent-flamingo-queen)]">Learn More</Link>)}
						<span className="circle" aria-hidden="true"></span>
					</div>
				);
			})}
		</Section>
	)
}
