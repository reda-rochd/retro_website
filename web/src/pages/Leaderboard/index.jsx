import Section from '../../components/Section'
import LeaderboardList from '../../components/Leaderboard.jsx'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '/src/api/client.js'

export default function Leaderboard() {
	const [activeTab, setActiveTab] = useState('teams')
	const [data, setData] = useState({ teams: [], individuals: [], game: [] })

	useEffect(() => {
		api.get('/leaderboard').then(res => {
			const { teams, individuals, games = [] } = res.data
			const game = games.map(g => ({
				login: g.userId?.login,
				first_name: g.userId?.first_name,
				last_name: g.userId?.last_name,
				avatar_url: g.userId?.avatar_url,
				score: g.score,
				durationSec: g.durationSec,
			}))
			const topAvatars = {}
			for (const user of individuals) {
				if (!user.team) continue
				const existing = topAvatars[user.team]
				if (!existing || user.score > existing.score)
					topAvatars[user.team] = { avatar_url: user.avatar_url, score: user.score }
			}
			for (const team of teams)
				team.avatar_url = topAvatars[team._id]?.avatar_url || ''

			teams.map(team => team.url = `/team/${encodeURIComponent(team.name)}`)

			setData({ teams, individuals, game })
		}).catch(console.error)
	}, [])

	const formatDuration = (seconds) => {
		if (typeof seconds !== 'number' || !isFinite(seconds) || seconds < 0) return null;
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${m}:${String(s).padStart(2, '0')}`;
	};

	const tabProps = {
		teams: {
			items: data.teams,
			getUrl: (team) => `/team/${encodeURIComponent(team.name)}`,
			getAvatarUrl: (team) => team.avatar_url,
			getTitle: (team) => team.name,
			renderRight: (team) => (
				<>
					<span className="text-lg font-bold gradient-text mr-0.5">{team.score}</span>
					<span className="text-xs">pts</span>
				</>
			),
		},
		individuals: {
			items: data.individuals,
			getUrl: (user) => `https://profile-v3.intra.42.fr/users/${user.login}`,
			getAvatarUrl: (user) => user.avatar_url,
			getTitle: (user) => user.login || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
			getSubtitle: (user) => {
				const full = `${user.first_name || ''} ${user.last_name || ''}`.trim();
				return full || undefined;
			},
			renderRight: (user) => (
				<>
					<span className="text-lg font-bold gradient-text mr-0.5">{user.score}</span>
					<span className="text-xs">pts</span>
				</>
			),
		},
		game: {
			items: data.game,
			getUrl: (entry) => `https://profile-v3.intra.42.fr/users/${entry.login}`,
			getAvatarUrl: (entry) => entry.avatar_url,
			getTitle: (entry) => entry.login,
			getSubtitle: (entry) => {
				const full = `${entry.first_name || ''} ${entry.last_name || ''}`.trim();
				return full || undefined;
			},
			renderRight: (entry) => (
				<>
					{typeof entry.durationSec === 'number' && (
						<span className="text-xs mr-1 text-white">{formatDuration(entry.durationSec)}</span>
					)}
					<span className="text-lg font-bold gradient-text mr-0.5">{entry.score}</span>
					<span className="text-xs">pts</span>
				</>
			),
		},
	};

	return (
		<Section className="mt-20 mb-10">
			<div className="neon-tab-container">
				<button
					className={`${activeTab === 'teams' ? 'active' : ''} neon-tab`}
					onClick={() => setActiveTab('teams')}
				>
					Teams
				</button>
				<button
					className={`${activeTab === 'individuals' ? 'active' : ''} neon-tab`}
					onClick={() => setActiveTab('individuals')}
				>
					Individuals
				</button>
				{/* <button */}
				{/* 	className={`${activeTab === 'game' ? 'active' : ''} neon-tab`} */}
				{/* 	onClick={() => setActiveTab('game')} */}
				{/* > */}
				{/* 	Game */}
				{/* </button> */}
			</div>

			<AnimatePresence mode="wait">
				<motion.div
					key={activeTab}
					initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
					animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
					exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
					transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
				>
					{(() => {
						const props = tabProps[activeTab];
						return (
							<LeaderboardList
								items={props.items}
								rank={true}
								getUrl={props.getUrl}
								getAvatarUrl={props.getAvatarUrl}
								getTitle={props.getTitle}
								getSubtitle={props.getSubtitle}
								renderRight={props.renderRight}
							/>
						);
					})()}
				</motion.div>
			</AnimatePresence>
		</Section>
	)
}

