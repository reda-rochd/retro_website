import Section from '../../components/Section'
import Leaderboard_component from '../../components/Leaderboard.jsx'
import {useState} from 'react';

export default function Leaderboard() {
	const [activeTab, setActiveTab] = useState('teams');
	const data = {
		"teams": [
			{
				name: "Team A",
				avatar: "https://avatars.githubusercontent.com/u/542148?s=200&v=4",
				points: 120,
			},
			{
				name: "Team C",
				avatar: "https://avatars.githubusercontent.com/u/542149?s=200&v=4",
				points: 110,
			},
			{
				name: "Team B",
				avatar: "https://avatars.githubusercontent.com/u/542150?s=200&v=4",
				points: 95,
			},
		],
		"individuals": [
			{
				name: "Alice",
				avatar: "https://avatars.githubusercontent.com/u/542151?s=200&v=4",
				points: 60,
			},
			{
				name: "Bob",
				avatar: "https://avatars.githubusercontent.com/u/542152?s=200&v=4",
				points: 55,
			},
			{
				name: "Charlie",
				avatar: "https://avatars.githubusercontent.com/u/542153?s=200&v=4",
				points: 50,
			}
		]
	};

	return (
		<Section>
			<h1 className="text-4xl font-bold mb-8 text-center">Leaderboard</h1>
			<div className="flex justify-center mb-6 space-x-4">
				<button className={`${activeTab == "teams" ? "active" : ""} neon-btn`} onClick={() => setActiveTab("teams")}>Teams</button>
				<button className={`${activeTab == "teams" ? "" : "active"} neon-btn`} onClick={() => setActiveTab("individuals")}>Individuals</button>
			</div>
			<Leaderboard_component leaders={data[activeTab]} />
		</Section>
	)
}
