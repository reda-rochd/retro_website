import { useEffect, useMemo, useState } from "react";
import Section from "../../components/Section.jsx";
import BlobShape from "../../components/BlobShape.jsx";
import api from "/src/api/client.js";

export default function Organizers() {
	const [organizers, setOrganizers] = useState([]);

	useEffect(() => {
		api.get("/public/organizers")
		.then(res => setOrganizers(res.data))
	}, []);

	const groupedByCategory = useMemo(() => {
		return organizers.reduce((acc, organizer) => {
			const category = organizer.category || "Organizers";
			if (!acc[category]) acc[category] = [];
			acc[category].push(organizer);
			return acc;
		}, {});
	}, [organizers]);

	return (
		<Section className="section">
			<h2>Our organizers</h2>
			<div className="flex flex-col gap-8 pb-4">
				{Object.keys(groupedByCategory).length === 0 && (
					<p className="text-sm text-gray-500">Stay tuned, organizers list coming soon.</p>
				)}
				{Object.entries(groupedByCategory)
					.sort(([left], [right]) => left.localeCompare(right, undefined, { sensitivity: "base" }))
					.map(([category, entries]) => (
					<div key={category} className="flex flex-col gap-4">
						<h3 className="text-lg font-semibold">{category}</h3>
						<div className="flex flex-wrap justify-center gap-x-12 gap-y-8">
							{entries
								.slice()
								.sort((a, b) => (a.name || a.login || "").localeCompare(b.name || b.login || "", undefined, { sensitivity: "base" }))
								.map(organizer => (
								<div
									key={organizer._id || `${organizer.login}-${organizer.role}`}
									className="flex items-center gap-4 min-w-[220px] flex-1"
								>
									<BlobShape avatar={organizer.avatar_url} size={75} />
									<div className="flex flex-col leading-tight">
										<span className="font-semibold text-sm">{organizer.name}</span>
										<span className="text-xs text-gray-500 italic">{organizer.role}</span>
									</div>
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</Section>
	);
}

