import {useState} from "react";
import QRInput from "../../components/QRInput.jsx";
import Events from "./Events.jsx";
import Teams from "./Teams.jsx";

export default function Dashboard()
{
	const tabs = ["Events", "Teams"];
	const [activeTab, setActiveTab] = useState(tabs[0]);

	return (
		<>
			<div className="flex rounded-[var(--radius)] overflow-hidden w-fit m-auto mt-5">
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
			<section className="section z-2">
				{ activeTab === "Events" && <Events /> }
				{ activeTab === "Teams" && <Teams /> }
			</section>
		</>
	)
}
