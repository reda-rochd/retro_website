import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../api/client.js";

const AuthContext = createContext();

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	const loadUser = useCallback(async () => {
		const response = await api.get("/me", { skipAuthRedirect: true });
		setUser(response.data);
		return response.data;
	}, []);

	const login = useCallback(async () => {
		setLoading(true);
		try {
			return await loadUser();
		} catch (error) {
			setUser(null);
			throw error;
		} finally {
			setLoading(false);
		}
	}, [loadUser]);

	const logout = useCallback(async () => {
		await api.post("/auth/42/logout").catch(() => {});
		setUser(null);
	}, []);

	useEffect(() => {
		loadUser()
			.catch(() => setUser(null))
			.finally(() => setLoading(false));
	}, [loadUser]);

	return (
		<AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}
