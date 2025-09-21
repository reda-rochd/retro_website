import {useState} from "react";
import QRInput from "../../components/QRInput.jsx";
import Events from "./Events.jsx";
import Teams from "./Teams.jsx";
import Leaders from "./Leaders.jsx";

export default function Dashboard()
{
	const tabs = ["Events", "Teams", "Leaders"];
	const [activeTab, setActiveTab] = useState(tabs[0]);

	return (
		<section className="section top-12 relative z-2">
			<div className="flex absolute -top-20 left-1/2 -translate-x-1/2 rounded-[var(--radius)] overflow-hidden">
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
			{ activeTab === "Events" && <Events /> }
			{ activeTab === "Teams" && <Teams /> }
			{ activeTab === "Leaders" && <Leaders /> }
		</section>
	)
}
