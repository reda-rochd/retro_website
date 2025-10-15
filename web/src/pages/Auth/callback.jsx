import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '/src/contexts/AuthContext.jsx';

export default function AuthCallback() {
	const navigate = useNavigate();
	const { login } = useAuth();

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const token = params.get('token');
		const rawRedirect = params.get('redirect') || '/';
		let redirect = '/';
		try {
			redirect = decodeURIComponent(rawRedirect) || '/';
		} catch (err) {
			redirect = '/';
		}
		if (!redirect.startsWith('/')) redirect = '/';

		if (!token) {
			navigate('/auth?error=no_token', { replace: true });
			return;
		}

		login(token)
			.then(() => {
				navigate(redirect, { replace: true });
			})
			.catch(() => {
				navigate(`/auth?error=no_token&redirect=${encodeURIComponent(redirect)}`, { replace: true });
			});
	}, [login, navigate]);

	return <div>Logging you in...</div>;
}
