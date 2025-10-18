import React from 'react';
import {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import api from '/src/api/client.js';
import Section from '/src/components/Section';

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
					{new Date(eventData.date).toLocaleDateString(undefined, {
						year: 'numeric',
						month: 'short',
						day: 'numeric',
					})}
				</time>
				<p className="text-[10px] text-center">•</p>
				<p className="text-sm text-accent-flamingo-queen">{eventData.location}</p>
			</div>
			<h1 className="text-center text-2xl font-bold">{eventData.name}</h1>
			
			<div className="">
				<div className="grid grid-cols-[auto_1fr_1fr_1fr] gap-x-4 gap-y-4">
					<div className="text-gray-500 truncate">Name</div>
					<div className="text-gray-500 whitespace-nowrap text-left">Score</div>
					<div className="text-gray-500 whitespace-nowrap text-left">GameMaster</div>
					<div className="text-gray-500 whitespace-nowrap text-center">Mode</div>

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
											className="w-8 h-8 rounded-full object-cover"
										/>
									)}
									<span>{game.game_master?.login}</span>
								</a>
								<div className="text-center whitespace-nowrap">
									{game.solo_game ? (
										<span className="text-green-500 text-sm">✔</span>
									) : (
										<span className="text-red-500 text-sm">✖</span>
									)}
								</div>
							</React.Fragment>
						))
					) : (
						<div className="col-span-4">No games scheduled for this event.</div>
					)}
				</div>
			</div>
		</Section>
	);
}
