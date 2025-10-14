import Section from '../../components/Section'
import Leaderboard_component from '../../components/Leaderboard.jsx'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '/src/api/client.js'

export default function Leaderboard() {
	const [activeTab, setActiveTab] = useState('teams')
	const [data, setData] = useState({ teams: [], individuals: [] })

	useEffect(() => {
		api.get('/leaderboard').then(res => {
			const { teams, individuals } = res.data
			const topAvatars = {}
			for (const user of individuals) {
				if (!user.team) continue
				const existing = topAvatars[user.team]
				if (!existing || user.score > existing.score)
					topAvatars[user.team] = { avatar_url: user.avatar_url, score: user.score }
			}
			for (const team of teams)
				team.avatar_url = topAvatars[team._id]?.avatar_url || ''
			setData({ teams, individuals })
		}).catch(console.error)
	}, [])

	return (
		<Section className="mt-20">
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
			</div>

			<AnimatePresence mode="wait">
				<motion.div
					key={activeTab}
					initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
					animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
					exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
					transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
				>
					<Leaderboard_component leaders={data[activeTab]} />
				</motion.div>
			</AnimatePresence>
		</Section>
	)
}

