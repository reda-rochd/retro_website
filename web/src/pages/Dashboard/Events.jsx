import { useState, useEffect } from "react"
import Modal from "../../components/Modal.jsx"
import Form from "./Form.jsx"


function EventForm({ initialData = {}, onSave }) {
	const [games, setGames] = useState(initialData.games || []);

	const handleAddGame = () => {
		setGames([...games, { name: "", score: 0 }]);
	};

	const handleChangeGame = (index, field, value) => {
		const updated = [...games];
		updated[index][field] = value;
		setGames(updated);
	};

	const handleDeleteGame = (index) => {
		setGames(games.filter((_, i) => i !== index));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		const formData = Object.fromEntries(new FormData(e.target).entries());
		onSave({ ...formData, games });
	};

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-4">
			<h2>{initialData.id ? "Edit Event" : "Add New Event"}</h2>
			<input
				type="text"
				name="name"
				defaultValue={initialData.name || ""}
				placeholder="Event Name"
				required
				className="w-full px-4 border-l border-gray-500"
			/>
			<input
				type="date"
				name="date"
				defaultValue={initialData.date || Date.now()}
				required
				className="w-full px-4 border-l border-gray-500"
			/>
			<input
				type="text"
				name="location"
				defaultValue={initialData.location || ""}
				placeholder="Location"
				required
				className="w-full px-4 border-l border-gray-500"
			/>
			<textarea
				name="description"
				defaultValue={initialData.description || ""}
				placeholder="Description"
				className="w-full px-4 border-l border-gray-500"
			></textarea>

			<div className="flex gap-4 mt-2 items-center justify-between">
				<h3 className="text-xl font-bold">Games:</h3>
				<button
					type="button"
					onClick={handleAddGame}
					className="px-4 py-2 bg-primary/10 rounded w-fit flex cursor-pointer"
				>
					+ Add Game
				</button>
			</div>

			{games.map((game, index) => (
				<div key={index} className="flex gap-2 items-center justify-between">
					<input
						type="text"
						value={game.name}
						onChange={(e) => handleChangeGame(index, "name", e.target.value)}
						placeholder="Game Name"
						required
						className="w-1/2 px-4 border-l border-gray-500"
					/>
					<input
						type="number"
						value={game.score}
						onChange={(e) => handleChangeGame(index, "score", Number(e.target.value))}
						placeholder="Score"
						required
						className="w-1/2 px-4 border-l border-gray-500"
					/>
					<button
						type="button"
						onClick={() => handleDeleteGame(index)}
						className="px-4 py-2 bg-primary text-red-400 rounded cursor-pointer"
					>
						Delete
					</button>
				</div>
			))}

			<button type="submit" className="px-4 py-2 bg-primary text-white rounded cursor-pointer">
				Save Event
			</button>
		</form>
	);
}

export default function Events() {
	const [events, setEvents] = useState([])
	const [loading, setLoading] = useState(true)
	const [modalOpen, setModalOpen] = useState(false)
	const [editingEvent, setEditingEvent] = useState(null)

	useEffect(() => {
		const fetchEvents = async () => {
			try {
				const res = await fetch("/api/events")
				const json = await res.json()
				setEvents(json)
			} catch (err) {
				console.error("Failed fetching events:", err)
			} finally {
				setLoading(false)
			}
		}
		fetchEvents()
	}, [])

	const handleSave = async (data) => {
		if (editingEvent) {
			const res = await fetch(`/api/events/${editingEvent.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			})
			const updated = await res.json()
			setEvents(events.map(ev => ev.id === updated.id ? updated : ev))
		} else {
			const res = await fetch("/api/events", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			})
			const saved = await res.json()
			setEvents([...events, saved])
		}
		setEditingEvent(null)
		setModalOpen(false)
	}

	const openAddForm = () => {
		setEditingEvent(null)
		setModalOpen(true)
	}

	const openEditForm = (event) => {
		setEditingEvent(event)
		setModalOpen(true)
	}

	if (loading) return <div>Loading...</div>

	return (
		<div>
			<button
				onClick={openAddForm}
				className="cursor-pointer mb-7 px-4 py-2 bg-white text-primary rounded w-fit flex items-center justify-center gap-2"
			>
				<span>+ Add New Event</span>
			</button>

			<div className="flex flex-col gap-8">
				{events.map(event => (
					<div key={event.id} className="border-l border-gray-300 pl-8 pb-4">
						<div className="flex mb-2 gap-4 mx-auto w-fit">
						<h2 className="text-xl font-bold">{event.name}</h2>
						<button onClick={() => openEditForm(event)}
							className="cursor-pointer px-2 text-white rounded"
						>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
								<path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652l-1.688 1.687m-2.651-2.651L6.75 16.5a2.25 2.25 0 00-.562.975l-.621 2.485a.75.75 0 00.91.91l2.486-.621a2.25 2.25 0 00.975-.562L19.513 7.138m-2.651-2.651L19.5 7.125" />
							</svg>
						</button>
						</div>
						<p>Date: {event.date}</p>
						<p>Location: {event.location}</p>
						<p>Description: {event.description}</p>
						<h3 className="mt-2">Games:</h3>
						<ul>
						{event.games?.map((game, i) => (
							<li className="ml-4 list-disc" key={i}>
								{game.name}: {game.score} pts
							</li>
						))}
						</ul>
					</div>
				))}
			</div>

			{modalOpen && (
				<Modal onClose={() => setModalOpen(false)}>
					<EventForm
						initialData={editingEvent || {}}
						onSave={handleSave}
					/>
				</Modal>
			)}
		</div>
	)
}
