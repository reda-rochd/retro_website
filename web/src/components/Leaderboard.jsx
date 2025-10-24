import BlobShape from './BlobShape.jsx';
import { Link } from 'react-router-dom';

function formatDuration(seconds) {
	if (typeof seconds !== 'number' || !isFinite(seconds) || seconds < 0) return null;
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	const mm = String(m);
	const ss = String(s).padStart(2, '0');
	return `${mm}:${ss}`;
}

export default function Leaderboard({ leaders, rank = true }) {
	return (
		<div className="flex flex-col gap-6">
			{leaders.map((leader, index) => {
				const isExternal = leader.url?.startsWith('http');
				const isInternal = leader.url && !isExternal;

				const Wrapper = isExternal ? 'a' : isInternal ? Link : 'div';
				const wrapperProps = isExternal
					? { href: leader.url, target: '_blank', rel: 'noopener noreferrer' }
					: isInternal
					? { to: leader.url }
					: {};

				return (
					<Wrapper
						key={index}
						{...wrapperProps}
						className={`flex justify-between items-center bg-white/5 rounded-lg px-4 ${
							leader.url ? 'hover:bg-white/10 transition-colors cursor-pointer' : ''
						}`}
					>
						<div className="flex items-center gap-4">
							{rank && <span>#{index + 1}</span>}
							{leader.avatar_url && (
								<div className="h-10 flex items-center">
									<BlobShape avatar={leader.avatar_url} size={60} />
								</div>
							)}
							<h3 className="text-base font-medium">{leader?.login || leader?.name}</h3>
						</div>
						<span className="flex items-baseline gap-2">
							{
								leader.role === 'leader' ? (
									<span>GUIDE</span>
								) : (
									<>
										<span className="text-lg font-bold gradient-text mr-0.5">{leader.score}</span>
										<span className="text-xs">pts</span>
									</>
								)
							}
							{typeof leader.durationSec === 'number' && (
								<span className="text-xs text-white/70">{formatDuration(leader.durationSec)}</span>
							)}
						</span>
					</Wrapper>
				);
			})}
		</div>
	);
}
