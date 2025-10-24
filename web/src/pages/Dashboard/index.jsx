import {useState} from "react";
import QRInput from "../../components/QRInput.jsx";
import Organizers from "./Organizers.jsx";
import Points from "./Points.jsx";
import Events from "./Events.jsx";
import Teams from "./Teams.jsx";

export default function Dashboard()
{
	const tabs = ["Events", "Teams", "Organizers", "Points"];
	const [activeTab, setActiveTab] = useState(tabs[0]);

	return (
		<div className="mt-20 mb-10">
			<div className="flex flex-wrap justify-center gap-2 md:gap-0 md:flex-nowrap rounded-[var(--radius)] md:overflow-hidden w-full md:w-fit mx-auto">
				{tabs.map(tab => (
					<button
						className={`cursor-pointer px-4 py-3 text-sm md:text-base rounded-[var(--radius)] md:rounded-none whitespace-nowrap 
							${activeTab === tab
								? "bg-primary z-1"
								: "bg-primary/55 text-white"}`}
						key={tab}
						onClick={() => setActiveTab(tab)}
					>{tab}</button>
				))}
			</div>
			<section className="section z-2 mt-5">
				{ activeTab === "Events" && <Events /> }
				{ activeTab === "Teams" && <Teams /> }
				{ activeTab === "Organizers" && <Organizers /> }
				{ activeTab === "Points" && <Points /> }
			</section>
		</div>
	)
}
