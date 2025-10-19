import {useState} from "react";
import QRInput from "../../components/QRInput.jsx";
import Organizers from "./Organizers.jsx";
import Events from "./Events.jsx";
import Teams from "./Teams.jsx";

export default function Dashboard()
{
	const tabs = ["Events", "Teams", "Organizers"];
	const [activeTab, setActiveTab] = useState(tabs[0]);

	return (
		<div className="mt-20 mb-10">
			<div className="flex rounded-[var(--radius)] overflow-hidden w-fit m-auto">
				{tabs.map(tab => (
					<button
						className={`cursor-pointer py-5 w-30 
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
			</section>
		</div>
	)
}
