import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'

import Home from './pages/Home/index.jsx'
import Leaderboard from './pages/Leaderboard/index.jsx'
import Dashboard from './pages/Dashboard/index.jsx'
import Profile from './pages/Profile/index.jsx'
import Team from './pages/Team/index.jsx'
import Event from './pages/Event/index.jsx'

import Navbar from './components/Navbar.jsx'

import NotFound from './pages/NotFound'
import Forbidden from './pages/Forbidden'

import Auth from './pages/Auth/index.jsx'
import AuthCallback from './pages/Auth/callback.jsx'
import {AuthProvider} from './contexts/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

import { AnimatePresence } from 'framer-motion';
import PageWrapper from './components/PageWrapper.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';

function App() {
	return (
		<BrowserRouter>
			<AuthProvider>
				<AppRoutes />
			</AuthProvider>
		</BrowserRouter>
	);
}

function AppRoutes() {
	const location = useLocation();

	return (
		<>
			<Navbar />
			<ScrollToTop />
			<AnimatePresence mode="wait" initial={false}>
				<Routes location={location} key={location.pathname}>
					<Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
					<Route element={<ProtectedRoute />}>
						<Route path="/event/:eventName" element={<PageWrapper><Event /></PageWrapper>} />
						<Route path="/team/:teamName" element={<PageWrapper><Team /></PageWrapper>} />
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
		</>
	);
}

export default App
