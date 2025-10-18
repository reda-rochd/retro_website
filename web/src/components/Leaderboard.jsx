import BlobShape from './BlobShape.jsx';
import { Link } from 'react-router-dom';

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
						<span>
							{
								leader.role === 'leader' ? (
									<span>LEADER</span>
								) : (
									<>
										<span className="text-lg font-bold gradient-text mr-0.5">{leader.score}</span>
										<span className="text-xs">pts</span>
									</>
								)
							}
						</span>
					</Wrapper>
				);
			})}
		</div>
	);
}
