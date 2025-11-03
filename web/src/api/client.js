import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.response.use(
	(response) => response,
	(error) => {
		const status = error.response?.status;
		if (status === 401) {
			window.dispatchEvent(new Event('auth:unauthorized'));
		}
		return Promise.reject(error);
	}
);

export default api;
