import BlobShape from './BlobShape.jsx';

export default function Leaderboard({leaders}) {
	return (
		<div className="flex flex-col gap-6">
			{leaders.map((leader, index) => (
				<div key={index} className="flex justify-between items-center bg-white/5 rounded-lg px-4">
					<div className="flex items-center gap-4">
						<span>#{index + 1}</span>
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
				</div>
			))}
		</div>
	)
}
