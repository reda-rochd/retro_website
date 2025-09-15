import { useMemo } from "react";

export default function BlobShape({ avatar, size = 100, radius = 45, variance = 10, minPoints = 10, maxPoints = 20 }) {
	const id = useMemo(() => "clip" + Math.random().toString(36).slice(2), []);

	const path = useMemo(() => {
		const pointsCount = Math.floor(Math.random() * (maxPoints - minPoints + 1)) + minPoints;
		const angleStep = (2 * Math.PI) / pointsCount;
		const points = [];

		for (let i = 0; i < pointsCount; i++) {
			const angle = i * angleStep;
			const r = radius + Math.random() * variance - variance / 2;
			points.push({
				x: 50 + r * Math.cos(angle),
				y: 50 + r * Math.sin(angle),
			});
		}

		const pathArr = [];
		for (let i = 0; i < points.length; i++) {
			const p0 = points[(i - 1 + points.length) % points.length];
			const p1 = points[i];
			const p2 = points[(i + 1) % points.length];
			const p3 = points[(i + 2) % points.length];

			const cp1 = {
				x: p1.x + (p2.x - p0.x) / 6,
				y: p1.y + (p2.y - p0.y) / 6,
			};
			const cp2 = {
				x: p2.x - (p3.x - p1.x) / 6,
				y: p2.y - (p3.y - p1.y) / 6,
			};

			if (i === 0) pathArr.push(`M ${p1.x} ${p1.y}`);
			pathArr.push(`C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${p2.x} ${p2.y}`);
		}

		pathArr.push("Z");
		return pathArr.join(" ");
	}, [minPoints, maxPoints, radius, variance]);

	return (
		<svg
			viewBox="0 0 100 100"
			width={size}
			height={size}
		>
			<defs>
				<clipPath id={id}>
					<path d={path} />
				</clipPath>
			</defs>
			<image
				href={avatar}
				width="100"
				height="100"
				preserveAspectRatio="xMidYMid slice"
				clipPath={`url(#${id})`}
			/>
			<path
				d={path}
				fill="none"
				stroke="white"
				strokeWidth="1"
			/>
		</svg>
	);
}

