import Section from '../../components/Section'
import Leaderboard_component from '../../components/Leaderboard.jsx'
import {useState, useEffect} from 'react';
import api from '/src/api/client.js';

export default function Leaderboard() {
	const [activeTab, setActiveTab] = useState('teams');
	const [data, setData] = useState({teams: [], individuals: []});

	useEffect(() => {
		api.get('/leaderboard').then(res => {
			setData(res.data);
		}).catch(err => {
			console.error(err);
		});
	}, []);
		
	return (
		<Section>
			{/* <h1 className="text-4xl font-bold mb-8 text-center">Leaderboard</h1> */}
			<div className="neon-tab-container">
				<button className={`${activeTab == "teams" ? "active" : ""} neon-tab`} onClick={() => setActiveTab("teams")}>Teams</button>
				<button className={`${activeTab == "teams" ? "" : "active"} neon-tab`} onClick={() => setActiveTab("individuals")}>Individuals</button>
			</div>
			<Leaderboard_component leaders={data[activeTab]} />
		</Section>
	)
}
