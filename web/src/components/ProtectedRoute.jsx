import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute() {
	const { user, loading } = useAuth();
	const location = useLocation();

	if (loading) return <div>Loading...</div>;
	if (!user) return <Navigate to="/auth" replace state={{ from: location }} />;
	return <Outlet />;
}
