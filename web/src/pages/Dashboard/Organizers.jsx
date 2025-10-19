import { useEffect, useMemo, useState } from "react";
import api from "/src/api/client.js";

const initialForm = { login: "", category: "", role: "" };
const normalizeLogin = (value = "") => value.trim().toLowerCase();
const normalizeText = (value = "") => value.trim();

const sortOrganizers = (list = []) => {
	return [...list].sort((a, b) => {
		const leftCategory = a?.category || "";
		const rightCategory = b?.category || "";
		const categoryCompare = leftCategory.localeCompare(rightCategory, undefined, { sensitivity: "base" });
		if (categoryCompare !== 0) return categoryCompare;
		const leftName = a?.name || a?.login || "";
		const rightName = b?.name || b?.login || "";
		return leftName.localeCompare(rightName, undefined, { sensitivity: "base" });
	});
};

export default function Organizers() {
	const [form, setForm] = useState(initialForm);
	const [organizers, setOrganizers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		api.get("/admin/organizers")
			.then(res => setOrganizers(sortOrganizers(Array.isArray(res?.data) ? res.data : [])))
			.finally(() => setLoading(false));
	}, []);

	const groupedByCategory = useMemo(() => {
		return organizers.reduce((acc, entry) => {
			const category = entry.category || "Other";
			if (!acc[category]) acc[category] = [];
			acc[category].push(entry);
			return acc;
		}, {});
	}, [organizers]);

	const handleChange = (evt) => {
		const { name, value } = evt.target;
		setForm(prev => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (evt) => {
		evt.preventDefault();
		setError("");
		const payload = {
			login: normalizeLogin(form.login),
			category: normalizeText(form.category),
			role: normalizeText(form.role),
		};
		if (!payload.login || !payload.category || !payload.role) {
			setError("All fields are required.");
			return;
		}
		setSubmitting(true);
		api.post("/admin/organizers", payload)
			.then(res => {
				if (!res?.data) return;
				setOrganizers(prev => {
					const next = [...prev];
					const index = next.findIndex(item => item._id === res.data._id);
					if (index >= 0) {
						next[index] = res.data;
					} else {
						next.push(res.data);
					}
					return sortOrganizers(next);
				});
				setForm(initialForm);
			})
			.catch(err => {
				const message = err?.response?.data?.error || "Unable to save organizer.";
				setError(message);
			})
			.finally(() => setSubmitting(false));
	};

	const handleDelete = (id) => {
		if (!id) return;
		if (!window.confirm("Remove this organizer?")) return;
		api.delete(`/admin/organizers/${id}`)
			.then(() => {
				setOrganizers(prev => prev.filter(entry => entry._id !== id));
			})
			.catch(() => setError("Unable to remove organizer."));
	};

	if (loading) return <div>Loading...</div>;

	return (
		<div className="flex flex-col gap-8 max-w-[640px] mx-auto w-full">
			<form
				onSubmit={handleSubmit}
				className="flex flex-col gap-5 bg-primary/60 p-5 rounded-[var(--radius)] shadow-lg shadow-black/20"
			>
				<div className="flex items-center justify-between gap-3 flex-wrap">
					<div>
						<h2 className="text-xl font-semibold leading-none">Assign organizer role</h2>
						<p className="text-xs uppercase tracking-wide text-white/70 mt-1">Link logins with categories and roles</p>
					</div>
				</div>
				<div className="grid gap-x-2 gap-y-4 md:grid-cols-[repeat(4,minmax(0,1fr))] md:items-end">
					<label className="flex flex-col gap-1 text-sm">
						<span className="text-xs uppercase tracking-wide text-white/70">Login</span>
						<input
							name="login"
							value={form.login}
							onChange={handleChange}
							className="px-3 py-2 rounded bg-white/90 text-primary outline-none focus:ring-2 focus:ring-white/60 transition"
							type="text"
							placeholder="e.g. userx"
						/>
					</label>
					<label className="flex flex-col gap-1 text-sm">
						<span className="text-xs uppercase tracking-wide text-white/70">Category</span>
						<input
							name="category"
							value={form.category}
							onChange={handleChange}
							className="px-3 py-2 rounded bg-white/90 text-primary outline-none focus:ring-2 focus:ring-white/60 transition"
							type="text"
							placeholder="e.g. Ceremony"
						/>
					</label>
					<label className="flex flex-col gap-1 text-sm">
						<span className="text-xs uppercase tracking-wide text-white/70">Role</span>
						<input
							name="role"
							value={form.role}
							onChange={handleChange}
							className="px-3 py-2 rounded bg-white/90 text-primary outline-none focus:ring-2 focus:ring-white/60 transition"
							type="text"
							placeholder="e.g. Presenter"
						/>
					</label>
					<button
						type="submit"
						disabled={submitting}
						className="w-full md:w-auto bg-white text-primary font-semibold py-2 px-6 rounded cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-black/10"
					>
						{submitting ? "Saving..." : "+ Add"}
					</button>
				</div>
				{error && <p className="text-red-500 text-sm">{error}</p>}
			</form>

			{Object.keys(groupedByCategory).length === 0 ? (
				<p className="text-center text-sm text-white/70">No organizers assigned yet.</p>
			) : (
				Object.entries(groupedByCategory).map(([category, entries]) => (
					<div key={category} className="bg-secondary/40 rounded-[var(--radius)] p-4 flex flex-col gap-3">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-semibold">{category}</h3>
						</div>
						<div className="flex flex-col gap-3">
							{entries.map(entry => (
								<div key={entry._id} className="flex items-center justify-between gap-4 bg-primary/50 py-2 px-3 rounded">
									<div className="flex items-center gap-3 min-w-0">
										<img
											src={entry.avatar_url || undefined}
											alt={entry.login}
											className="w-10 h-10 rounded-full object-cover bg-white/30"
										/>
										<div className="flex flex-col truncate">
											<span className="font-medium text-sm truncate">{entry.name || entry.login}</span>
											<span className="text-xs text-white/70 truncate">{entry.role}</span>
										</div>
									</div>
									<button
										onClick={() => handleDelete(entry._id)}
										className="text-xs text-red-500 bg-primary px-3 py-1 rounded cursor-pointer"
									>
										Remove
									</button>
								</div>
							))}
						</div>
					</div>
				))
			)}
		</div>
	);
}

