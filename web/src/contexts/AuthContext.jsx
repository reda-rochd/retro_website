import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client.js";

const AuthContext = createContext();

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) {
			setLoading(false);
			return;
		}

		api.get("/me")
			.then((res) => setUser(res.data))
			.catch(() => localStorage.removeItem("token"))
			.finally(() => setLoading(false));
	}, []);

	return (
		<AuthContext.Provider value={{ user, setUser, loading }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}
