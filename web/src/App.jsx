import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Home from './pages/Home/index.jsx'
import Leaderboard from './pages/Leaderboard/index.jsx'
import Dashboard from './pages/Dashboard/index.jsx'
import Profile from './pages/Profile/index.jsx'

import Navbar from './components/Navbar.jsx'

import NotFound from './pages/NotFound'
import Forbidden from './pages/Forbidden'

import Auth from './pages/Auth/index.jsx'
import AuthCallback from './pages/Auth/callback.jsx'
import {AuthProvider} from './contexts/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

import { AnimatePresence } from 'framer-motion';
import PageWrapper from './components/PageWrapper.jsx';

function App() {
	return (
		<BrowserRouter>
			<AuthProvider>
				<Navbar />
				<AnimatePresence mode="wait">
					<Routes>
						<Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
						<Route element={<ProtectedRoute />}>
							<Route path="/leaderboard" element={<PageWrapper><Leaderboard /></PageWrapper>} />
							<Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
							<Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
						</Route>
						<Route path="/auth" element={<PageWrapper><Auth /></PageWrapper>} />
						<Route path="/auth/callback" element={<PageWrapper><AuthCallback /></PageWrapper>} />
						<Route path="/forbidden" element={<PageWrapper><Forbidden /></PageWrapper>} />
						<Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
					</Routes>
				</AnimatePresence>
			</AuthProvider>
		</BrowserRouter>
	);
}


export default App
