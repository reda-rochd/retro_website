import { useLocation } from 'react-router-dom';
import { useAuth } from '/src/contexts/AuthContext';
import CenteredLayout from '/src/components/CenteredLayout';
import CTA from '/src/components/CTA';

export default function Auth() {
	const location = useLocation();
	const { user } = useAuth();

	const params = new URLSearchParams(location.search);
	const error = params.get('error');
	const redirect = encodeURIComponent(location.state?.from?.pathname || params.get('redirect') || '/');
	// const error = 'access_denied'
	const errorMessages = {
		access_denied: 'Access denied. Please try again.',
		no_code: 'No code provided. Please try again.',
		oauth_failed: 'OAuth failed. Please try again.',
		invalid_profile: 'Invalid profile data. Please try again.',
		no_token: 'No token received. Please try again.'
	}

	return (
		<CenteredLayout>
			<div className="flex flex-col items-center">
			<h1 className="text-2xl">Welcome to the Authentication Page</h1>
			<p className="mt-2">{user ? `You are logged in as ${user.first_name} ${user.last_name}.` : 'Please sign in to continue.'}</p>
			<a
				href={user ? `/` : `/api/auth/42/login?redirect=${redirect}`}
				className=" cta w-fit m-auto mt-7"
			>
				{user ? 'Go to Home' : 'Sign in with 42'}
			</a>
			{!user && error && (
				<h1 className="text-red-700 mt-7 font-bold">
					{
						errorMessages[error] || 'An unknown error occurred. Please try again.'
					}
				</h1>
			)}
			</div>
		</CenteredLayout>
	);
}

