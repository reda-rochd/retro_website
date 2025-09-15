const addEvent = (event) => {
	<div className="border border-gray-300 rounded p-4 mb-4">
		<h2 className="text-xl font-bold">Add New Event</h2>
		<form className="flex flex-col gap-4 mt-4">
			<input type="text" placeholder="Event Name" className="border border-gray-300 rounded p-2 w-full" />
			<input type="date" placeholder="Date" className="border border-gray-300 rounded p-2 w-full" />
			<input type="text" placeholder="Location" className="border border-gray-300 rounded p-2 w-full" />
			<textarea placeholder="Description" className="border border-gray-300 rounded p-2 w-full"></textarea>
			<button type="submit" className="cursor-pointer px-4 py-2 bg-primary text-white rounded w-full">Save Event</button>
		</form>
	</div>
}

export default function Events()
{
	const data = [
		{
			id: 1,
			name: "Quidditch",
			date: "2023-10-01",
			description: "This is the first event.",
			location: "Hogwarts",
			games: [
				{
					name: "Hoops",
					score: "32",
				},
			]
		},
		{
			id: 2,
			name: "Field Games",
			date: "2024-10-01",
			description: "This is the second event.",
			location: "Zurich",
			games: [
				{
					name: "Oulala",
					score: "32",
				},
				{
					name: "zogala",
					score: "27",
				}
			]
		},
	]

	const saveEvent = (event) => {
	}

	return (
		<div className="">
			<button
				onClick={saveEvent}
				className="cursor-pointer mb-7 px-4 py-2 bg-secondary text-white rounded w-full"
			>Add New Event</button>
			<div className=" flex flex-col gap-8">
				{data.map((event) => (
					<div key={event.id} className="border border-gray-300 rounded p-4">
						<h2 className="text-xl font-bold">{event.name}</h2>
						<p>Date: {event.date}</p>
						<p>Location: {event.location}</p>
						<p>Description: {event.description}</p>
						<h3 className="mt-2">Games:</h3>
						{event.games.map((game, gameIndex) => (
							<p className="ml-4" key={gameIndex}>
								{game.name}: {game.score} pts
							</p>
						))}
						<button className="cursor-pointer mt-4 px-4 py-1 bg-white text-primary rounded">Edit Event</button>
					</div>
				))}
			</div>
		</div>
	)
}
