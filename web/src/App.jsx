import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Home from './pages/Home/index.jsx'
import Leaderboard from './pages/Leaderboard/index.jsx'
import Dashboard from './pages/Dashboard/index.jsx'
import Profile from './pages/Profile/index.jsx'

import NotFound from './pages/NotFound'
import Forbidden from './pages/Forbidden'

import Auth from './pages/Auth/index.jsx'
import AuthCallback from './pages/Auth/callback.jsx'
import {AuthProvider} from './contexts/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

function App() {
	return (
		<BrowserRouter>
		<AuthProvider>
			<div className="font-primary text-base">
				<Routes>
					<Route path="/" element={<Home />} />
					<Route element={<ProtectedRoute />}>
						<Route path="/leaderboard" element={<Leaderboard />} />
						<Route path="/dashboard" element={<Dashboard />} />
						<Route path="/profile" element={<Profile />} />
					</Route>
					<Route path="/auth" element={<Auth />} />
					<Route path="/auth/callback" element={<AuthCallback />} />

					<Route path="/forbidden" element={<Forbidden />} />
					<Route path="*" element={<NotFound />} />
				</Routes>
			</div>
		</AuthProvider>
		</BrowserRouter>
	)
}

export default App
