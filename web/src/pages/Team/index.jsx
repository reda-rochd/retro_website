import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '/src/api/client.js';
import Section from '/src/components/Section';
import Leaderboard from '/src/components/Leaderboard.jsx';

export default function Team() {
	const { teamName } = useParams();
	const [teamData, setTeamData] = useState(null);

	useEffect(() => {
		api.get(`/public/teams/${teamName}`)
		.then(res => {
			const members = res.data.members
				.sort((a, b) => b.score - a.score)
				.map(member => ({
					...member,
					url: `https://profile-v3.intra.42.fr/users/${member.login}`,
				}));
			setTeamData( {
				name: res.data.name,
				score: res.data.score,
				members: members
			});
		})
		.catch(err => {
			setTeamData({ error: err.response?.data?.error || 'Failed to load team data' });
		});

	}, [teamName]);

	if (!teamData) return <Section className="mt-20 mb-10">Loading team data...</Section>;
	if (teamData.error) return <Section className="mt-20 mb-10">Error: {teamData.error}</Section>;
	return (
		<Section className="mt-20 mb-10">
			<h1 className="text-xl font-bold mb-1 text-center"
			>{teamData.name}</h1>
			<p className="text-center text-2xl mb-2 font-semibold">
				<span className="gradient-text">{teamData.score} pts</span>
			</p>
			<Leaderboard
				items={teamData.members}
				rank={false}
				getUrl={(m) => `https://profile-v3.intra.42.fr/users/${m.login}`}
				getAvatarUrl={(m) => m.avatar_url}
				getTitle={(m) => m.login}
				getSubtitle={(m) => {
					const full = `${m.first_name || ''} ${m.last_name || ''}`.trim();
					return full || undefined;
				}}
				renderRight={(m) => (
					<>
						<span className="text-lg font-bold gradient-text mr-0.5">{m.score}</span>
						<span className="text-xs">pts</span>
					</>
				)}
			/>
		</Section>
	)
}
