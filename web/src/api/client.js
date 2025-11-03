import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

let isRedirecting = false;

api.interceptors.response.use(
	(response) => response,
	(error) => {
		const status = error.response?.status;
		const skipAuthRedirect = Boolean(error.config?.skipAuthRedirect);
		if (status === 401 && !skipAuthRedirect && !isRedirecting && !window.location.pathname.startsWith('/auth')) {
			isRedirecting = true;
			window.location.href = '/auth?error=access_denied&redirect=' + encodeURIComponent(window.location.pathname + window.location.search);
		}
		if (status === 403 && !isRedirecting) {
			isRedirecting = true;
			window.location.href = '/forbidden';
		}
		return Promise.reject(error);
	}
);

export default api;
