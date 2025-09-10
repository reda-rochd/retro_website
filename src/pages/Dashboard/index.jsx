import {useState} from "react";

export default function Dashboard()
{
	const [activeTab, setActiveTab] = useState("teams");

	return (
		<div>
			<button onClick={() => {setActiveTab("teams");}}>Teams</button>
			<button onClick={() => {setActiveTab("events");}}>Events</button>

			<input className="border-2" type="text" name="team" style={{ display: activeTab == "teams" ? "block" : "none"  }}/>
			<input className="border-2" type="text" name="event" style={{ display: activeTab == "events" ? "block" : "none"  }}/>
		</div>
	)
}
