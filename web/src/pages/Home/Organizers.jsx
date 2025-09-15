import BlobShape from "../../components/BlobShape.jsx";
import Section from "../../components/Section.jsx";

export default function Organizers({ organizers }) {
	return (
		<Section className="section">
			<h2>Our organizers</h2>
			<div className="flex flex-wrap justify-center gap-x-12 gap-y-8 pb-4">
				{organizers.map((organizer, index) => (
					<div
						key={index}
						className="flex items-center gap-4 min-w-[220px] flex-1"
					>
						<BlobShape avatar={organizer.avatar} size={75} />
						<div className="flex flex-col leading-tight">
							<span className="font-semibold text-sm">{organizer.name}</span>
							<span className="text-xs text-gray-500 italic">{organizer.role}</span>
						</div>

					</div>
				))}
			</div>
		</Section>
	)
}

