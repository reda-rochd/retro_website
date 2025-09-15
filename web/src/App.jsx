import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Home from './pages/Home/index.jsx'
import Leaderboard from './pages/Leaderboard/index.jsx'
import Dashboard from './pages/Dashboard/index.jsx'
import Profile from './pages/Profile/index.jsx'
import NotFound from './pages/NotFound'

function App() {
	return (
		<>
			<BrowserRouter>
				<div className="font-primary text-base">
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/leaderboard" element={<Leaderboard />} />
						<Route path="/dashboard" element={<Dashboard />} />
						<Route path="/profile" element={<Profile />} />
						<Route path="*" element={<NotFound />} />
					</Routes>
				</div>
			</BrowserRouter>
		</>
	)
}

export default App
