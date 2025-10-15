import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../api/client.js";

const AuthContext = createContext();

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	const loadUser = useCallback(async () => {
		const response = await api.get("/me");
		setUser(response.data);
		return response.data;
	}, []);

	const login = useCallback(async (token) => {
		localStorage.setItem("token", token);
		setLoading(true);
		try {
			return await loadUser();
		} catch (error) {
			localStorage.removeItem("token");
			setUser(null);
			throw error;
		} finally {
			setLoading(false);
		}
	}, [loadUser]);

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) {
			setLoading(false);
			return;
		}

		loadUser()
			.catch(() => {
				localStorage.removeItem("token");
				setUser(null);
			})
			.finally(() => setLoading(false));
	}, [loadUser]);

	return (
		<AuthContext.Provider value={{ user, setUser, loading, login }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}
