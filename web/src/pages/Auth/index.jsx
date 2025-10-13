import { useLocation } from 'react-router-dom';
import CTA from '../../components/CTA';

export default function Auth() {
	const location = useLocation();
	const redirect = encodeURIComponent(location.state?.from?.pathname || '/');

	const params = new URLSearchParams(location.search);
	const error = params.get('error');
	// const error = 'access_denied'
	const errorMessages = {
		access_denied: 'Access denied. Please try again.',
		no_code: 'No code provided. Please try again.',
		oauth_failed: 'OAuth failed. Please try again.',
		invalid_profile: 'Invalid profile data. Please try again.',
		no_token: 'No token received. Please try again.'
	}

	return (
		<div className="flex items-center justify-center h-screen">
			<div className="flex flex-col justify-center items-center h-[75vh] overflow-hidden max-w-md mx-auto text-center gap-6 bg-primary/85 rounded-[var(--radius)] shadow-lg px-10">
				<div className="flex flex-col items-center">
				<h1 className="text-2xl">Welcome to the Authentication Page</h1>
				<p className="mt-2">Please sign in to continue.</p>
				<CTA
					href={`/api/auth/42/login?redirect=${redirect}`}
					text="Sign in with your 42 account"
					className="w-fit m-auto mt-7"
				/>
				{error && (
					<h1 className="text-red-700 mt-7 font-bold">
						{
							errorMessages[error] || 'An unknown error occurred. Please try again.'
						}
					</h1>
				)}
				</div>
			</div>
		</div>
	);
}

