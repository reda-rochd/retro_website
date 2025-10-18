import BlobShape from './BlobShape.jsx';
import { Link } from 'react-router-dom';

export default function Leaderboard({leaders, rank = true}) {
	return (
		<div className="flex flex-col gap-6">
			{leaders.map((leader, index) => {
				const isClickable = Boolean(leader.url);
				const WrapComponent = isClickable ? Link : 'div';

				return (
					<WrapComponent
						key={index}
 						to={isClickable ? leader.url : undefined}
						className={`flex justify-between items-center bg-white/5 rounded-lg px-4 ${isClickable ? 'hover:bg-white/10 transition-colors cursor-pointer' : ''}`}>
						<div className="flex items-center gap-4">
							{rank && <span>#{index + 1}</span> }
							{leader.avatar_url && (
							<div className="h-10 flex items-center">
								<BlobShape
									avatar={leader.avatar_url}
									size={60}
								/>
							</div>
							)}
							<h3 className="text-base font-medium">{leader?.login || leader?.name}</h3>
						</div>
						<span>
							<span className="text-lg font-bold gradient-text mr-0.5">{leader.score}</span>
							<span className="text-xs">pts</span>
						</span>
					</WrapComponent>
				)
			})}
		</div>
	)
}
