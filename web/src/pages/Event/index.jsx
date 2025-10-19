import React from 'react';
import {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import api from '/src/api/client.js';
import Section from '/src/components/Section';
import { formatDateRange } from '/src/utils/formatDateTime.js';

const SCORE_MODE_LABELS = {
	'team-only': 'Team Only',
	'collective': 'Collective',
	'aggregate': 'Aggregation'
};

export default function Event() {
	const { eventName } = useParams();
	const [eventData, setEventData] = useState(null);

	useEffect(() => {
		api.get(`/public/events/${eventName}`)
		.then(res => {
			setEventData(res.data);
		})
		.catch(err => {
			setEventData({ error: err.response?.data?.error || 'Failed to load event data' });
		});
	}, [eventName]);

	if (!eventData) return <Section className="mt-20 mb-10">Loading event data...</Section>;
	if (eventData.error) return <Section className="mt-20 mb-10">Error: {eventData.error}</Section>;
	return (
		<Section className="mt-20 mb-10">
			<div className="flex gap-2 mx-auto flex-wrap justify-center items-center">
				<time className="text-accent-cerise-pink text-sm">
					{formatDateRange(eventData.startAt, eventData.endAt ?? eventData.startAt)}
				</time>
				<p className="text-[10px] text-center">•</p>
				<p className="text-sm text-accent-flamingo-queen">{eventData.location}</p>
			</div>
			<h1 className="text-center text-2xl font-bold">{eventData.name}</h1>
			
			<div className="">
				<div className="grid grid-cols-[auto_1fr_1fr_1fr] gap-x-2 gap-y-4">
					<div className="text-sm text-gray-500 truncate">Name</div>
					<div className="text-sm text-gray-500 whitespace-nowrap text-center">Score</div>
					<div className="text-sm text-gray-500 whitespace-nowrap text-left">GameMaster</div>
					<div className="text-sm text-gray-500 whitespace-nowrap text-center">Mode</div>

					{eventData.games && eventData.games.length > 0 ? (
						eventData.games.map(game => (
							<React.Fragment key={game._id}>
								<div className="truncate ">{game.name}</div>
								<div className="whitespace-nowrap text-center">
									<span className="gradient-text">{game.score}</span>
								</div>
								<a
									href={`https://profile-v3.intra.42.fr/users/${game.game_master?.login}`}
									target="_blank"
									className="flex items-center gap-2 truncate ">
									{game.game_master?.avatar_url && (
										<img
											src={game.game_master.avatar_url}
											alt={game.game_master.login}
											className="w-6 h-6 rounded-full object-cover"
										/>
									)}
									<span>{game.game_master?.login}</span>
								</a>
								<div className="text-center whitespace-nowrap">
									<span className="text-xs text-gray-300">
										{SCORE_MODE_LABELS[game.score_mode] || SCORE_MODE_LABELS['team-only']}
									</span>
								</div>
							</React.Fragment>
						))
					) : (
						<div className="col-span-4">No games scheduled for this event.</div>
					)}
				</div>
			</div>
			<div className="text-xs text-gray-500 mt-4 space-y-1">
				<p><span className="text-red-400">*</span><span className="font-semibold text-gray-300">Team Only:</span> Points count toward the team total only.</p>
				<p><span className="text-red-400">*</span><span className="font-semibold text-gray-300">Collective:</span> Points count for individuals; the team scores once overall.</p>
				<p><span className="text-red-400">*</span><span className="font-semibold text-gray-300">Aggregation:</span> Points count for both individuals and the team total.</p>
			</div>
		</Section>
	);
}
