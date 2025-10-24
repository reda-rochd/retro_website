import { useEffect, useState } from "react";
import api from "/src/api/client.js";

export default function Points() {
	const [entries, setEntries] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		api.get("/admin/points")
			.then(res => setEntries(Array.isArray(res?.data) ? res.data : []))
			.catch(() => setError("Unable to load points."))
			.finally(() => setLoading(false));
	}, []);

	const handleDelete = (id) => {
		if (!id) return;
		if (!window.confirm("Remove this points record? This will adjust scores accordingly.")) return;
		api.delete(`/admin/points/${id}`)
			.then(() => setEntries(prev => prev.filter(e => e._id !== id)))
			.catch(() => setError("Unable to remove points record."));
	};

	if (loading) return <div>Loading...</div>;

	return (
		<div className="flex flex-col gap-4 max-w-[880px] mx-auto w-full">
			{error && <p className="text-red-500 text-sm">{error}</p>}
			{entries.length === 0 ? (
				<p className="text-center text-sm text-white/70">No points recorded yet.</p>
			) : (
				<ul className="flex flex-col gap-3">
					{entries.map(entry => (
						<li key={entry._id} className="bg-secondary/50 hover:bg-secondary/80 transition py-2 px-4 rounded grid grid-cols-[1fr_auto] items-center gap-2">
							<div className="overflow-x-auto no-scrollbar whitespace-nowrap text-sm touch-pan-x">
								<div className="flex items-center gap-2">
									<span className="font-medium">{entry.userLogin}</span>
									<span className="text-white/60">• {entry.teamName}</span>
									<span className="text-white/40">—</span>
									<span>
										{entry.eventName}<span className="text-white/60"> • {entry.gameName}</span>
									</span>
								</div>
							</div>

							<div className="flex items-center gap-2 pl-2 justify-self-end shrink-0">
								<span className="px-2 py-0.5 rounded-full bg-white/20 text-[12px] font-semibold">+{entry.points}</span>
								<button onClick={() => handleDelete(entry._id)} className="text-[11px] text-red-400 hover:text-red-300 px-2 py-1 rounded cursor-pointer bg-white/10 hover:bg-white/20 transition">Remove</button>
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
