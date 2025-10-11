import { useState, useEffect } from "react"
import Modal from "../../components/Modal.jsx"
import Form from "./Form.jsx"
import api from "/src/api/client.js"


function EventForm({ initialData = {}, onSave, onDelete }) {
	const [games, setGames] = useState(initialData.games || []);

	const handleAddGame = () => {
		setGames([...games, { name: "" }]);
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
			<h2>{initialData._id ? "Edit Event" : "Add New Event"}</h2>
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
				defaultValue={
					initialData.date
						? new Date(initialData.date).toISOString().split('T')[0]
						: new Date().toISOString().split('T')[0]
				}
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
						className="w-1/2 px-0 border-gray-500"
					/>
					<input
						type="text"
						value={game.game_master || ""}
						onChange={(e) => handleChangeGame(index, "game_master", e.target.value)}
						placeholder="Game Master"
						required
						className="w-2/5 px-0 border-gray-500"
					/>
					<input
						type="number"
						value={game.score}
						onChange={(e) => handleChangeGame(index, "score", Number(e.target.value))}
						placeholder="Score"
						required
						className="w-1/6 px-0 border-gray-500"
					/>
					<label className="flex items-center gap-1 text-sm text-gray-400 border-gray-500 cursor-pointer">
						<input
							type="checkbox"
							checked={game.solo_game || false}
							onChange={(e) => handleChangeGame(index, "solo_game", e.target.checked)}
							className="w-4 h-4 rounded-full border border-gray-500 appearance-none checked:bg-blue-500 checked:border-blue-500 cursor-pointer"

						/>
						Solo?
					</label>
					<button
						type="button"
						onClick={() => handleDeleteGame(index)}
						className="px-3 p-1 bg-primary text-red-400 rounded-full cursor-pointer"
					>
						&times;
					</button>
				</div>
			))}

			<div className="flex gap-4">
				<button type="submit" className="flex-1 px-4 py-2 bg-primary text-white rounded cursor-pointer">Save Event</button>
				<button type="button"
					onClick={() => {
						if (window.confirm("Are you sure you want to delete this event?"))
							onDelete(initialData._id)
					}}
					className="px-4 py-2 bg-primary text-red-400 rounded cursor-pointer">Delete Event</button>
			</div>
		</form>
	);
}

export default function Events() {
	const [events, setEvents] = useState([])
	const [loading, setLoading] = useState(true)
	const [modalOpen, setModalOpen] = useState(false)
	const [editingEvent, setEditingEvent] = useState(null)

	useEffect(() => {
		api.get('/admin/events')
			.then(res => setEvents(res.data))
			.catch(err => console.error("Failed fetching events:", err))
			.finally(() => setLoading(false));
	}, [])

	const handleSave = async (data) => {
		if (editingEvent) {
			const { data: updated } = await api.put(`/admin/events/${editingEvent._id}`, data);
			setEvents(events.map(ev => ev._id === updated._id ? updated : ev));
		} else {
			const { data: saved } = await api.post("/admin/events", data);
			setEvents([...events, saved]);
		}
		setEditingEvent(null);
		setModalOpen(false);
	};

	const handleDelete = async (id) => {
		try {
			await api.delete(`/admin/events/${id}`);
			setEvents(events.filter(ev => ev._id !== id));
			setEditingEvent(null);
			setModalOpen(false);
		} catch (err) {
			console.error("Failed to delete event:", err);
		}
	};

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
				{events?.map(event => (
					<div key={event._id} className="pl-7">
						<div className="flex mb-2 gap-4 mx-auto w-fit">
							<h2 className="text-xl font-bold">{event.name}</h2>
							<button onClick={() => openEditForm(event)} className="cursor-pointer px-2 text-white rounded">
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
									<path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652l-1.688 1.687m-2.651-2.651L6.75 16.5a2.25 2.25 0 00-.562.975l-.621 2.485a.75.75 0 00.91.91l2.486-.621a2.25 2.25 0 00.975-.562L19.513 7.138m-2.651-2.651L19.5 7.125" />
								</svg>
							</button>
						</div>

						<div className="flex flex-col gap-2">
						<p className="flex items-center gap-2 -ml-7">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
								<path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7H3v12a2 2 0 002 2z" />
							</svg>
							<b>Date:</b> {new Date(event.date).toLocaleDateString()}
						</p>

						<p className="flex items-center gap-2 -ml-7">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
								<path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 12 17.657 7.343a8 8 0 10-11.314 11.314L12 13.414l5.657 5.657z" />
							</svg>
							<b>Location:</b> {event.location}
						</p>

						<p className="flex items-center gap-2 -ml-7">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
								<path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h10m-5 4h5" />
							</svg>
							<b>Description:</b> {event.description}
						</p>
						</div>

						<h3 className="mt-2 flex items-center gap-2 font-bold">
							Games:
						</h3>

						<ul>
							{event.games?.map((game, i) => (
								<li className="ml-4 list-disc" key={game._id}>
								  {game.name}: {game.score} pts (master: {game.game_master})
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
						onDelete={handleDelete}
					/>
				</Modal>
			)}
		</div>
	)
}
