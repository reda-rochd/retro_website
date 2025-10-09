import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthCallback() {
	const navigate = useNavigate();

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const token = params.get('token');
		const redirect = params.get('redirect') || '/';
		if (token) {
			localStorage.setItem('token', token);
			navigate(redirect);
		} else {
			navigate('/auth?error=no_token');
		}
	}, [navigate]);

	return <div>Logging you in...</div>;
}
