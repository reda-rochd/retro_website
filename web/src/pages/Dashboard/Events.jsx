import { useState, useEffect } from "react"
import Modal from "/src/components/Modal.jsx"
import api from "/src/api/client.js"
import { formatDateRange } from "/src/utils/formatDateTime.js"


const SCORE_MODE_OPTIONS = [
	{ value: 'team-only', label: 'Team Only' },
	{ value: 'collective', label: 'Collective' },
	{ value: 'aggregate', label: 'Aggregation' }
];

const HOUR_MS = 60 * 60 * 1000;

function resolveDateLike(input, fallbackFactory) {
	if (!input) return fallbackFactory();
	const parsed = new Date(input);
	if (Number.isNaN(parsed.getTime())) return fallbackFactory();
	return parsed;
}

function toLocalDateTimeInputValue(value) {
	const date = value ? new Date(value) : new Date();
	if (Number.isNaN(date.getTime())) return '';
	const pad = n => n.toString().padStart(2, '0');
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function EventForm({ initialData = {}, onSave, onDelete }) {
	const [games, setGames] = useState(() =>
		initialData.games ? initialData.games.map(game => ({ ...game })) : []
	);

	const defaultStart = resolveDateLike(initialData.startAt, () => {
		const base = new Date();
		base.setMinutes(0, 0, 0);
		return base;
	});

	const defaultEnd = resolveDateLike(initialData.endAt, () => new Date(defaultStart.getTime() + HOUR_MS));

	const handleAddGame = () => {
		setGames([...games, { name: "", score: 0, score_mode: 'team-only' }]);
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
		const formEntries = new FormData(e.target);
		const formData = Object.fromEntries(formEntries.entries());

		const startValue = formData.startAt;
		const endValue = formData.endAt;
		const start = new Date(startValue);
		let end = new Date(endValue);

		if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
			window.alert('Please provide valid start and end times.');
			return;
		}

		const sameDayInput = typeof startValue === 'string'
			&& typeof endValue === 'string'
			&& startValue.slice(0, 10) === endValue.slice(0, 10);

		if (end < start && sameDayInput) {
			end = new Date(end.getTime() + HOUR_MS * 24);
		}

		if (end <= start) {
			window.alert('The end time must be after the start time.');
			return;
		}

		const sanitizedGames = games.map(game => ({
			...game,
			score: Number(game.score) || 0,
			score_mode: game.score_mode || 'team-only'
		}));

		onSave({
			...formData,
			startAt: start.toISOString(),
			endAt: end.toISOString(),
			games: sanitizedGames
		});
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
			<div className="grid gap-4 sm:grid-cols-2">
				<label className="flex flex-col gap-2">
					<span className="text-sm font-semibold">Starts at</span>
					<input
						type="datetime-local"
						name="startAt"
						step="60"
						lang="en-GB"
						defaultValue={toLocalDateTimeInputValue(defaultStart)}
						required
						className="w-full px-4 border-l border-gray-500"
					/>
				</label>
				<label className="flex flex-col gap-2">
					<span className="text-sm font-semibold">Ends at</span>
					<input
						type="datetime-local"
						name="endAt"
						step="60"
						lang="en-GB"
						defaultValue={toLocalDateTimeInputValue(defaultEnd)}
						required
						className="w-full px-4 border-l border-gray-500"
					/>
				</label>
			</div>
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
				className="w-full px-4 border-l border-gray-500 h-24"
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
						className="w-1/3 px-0 border-gray-500"
					/>
					<input
						type="number"
						value={game.score ?? ''}
						onChange={(e) => handleChangeGame(index, "score", e.target.value === "" ? "" : Number(e.target.value))}
						placeholder="Score"
						required
						className="w-1/6 px-0 border-gray-500"
					/>
					<select
						value={game.score_mode || 'team-only'}
						onChange={(e) => handleChangeGame(index, "score_mode", e.target.value)}
						className="px-1 py-1 text-sm bg-secondary text-gray-200"
					>
						{SCORE_MODE_OPTIONS.map(option => (
							<option key={option.value} value={option.value}>{option.label}</option>
						))}
					</select>
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
					<div key={event._id} className="">
						<div className="flex mb-2 gap-4 mx-auto w-fit">
							<h2 className="text-xl font-bold">{event.name}</h2>
							<button onClick={() => openEditForm(event)} className="cursor-pointer px-2 text-white rounded">
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
									<path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652l-1.688 1.687m-2.651-2.651L6.75 16.5a2.25 2.25 0 00-.562.975l-.621 2.485a.75.75 0 00.91.91l2.486-.621a2.25 2.25 0 00.975-.562L19.513 7.138m-2.651-2.651L19.5 7.125" />
								</svg>
							</button>
						</div>

						<div className="grid grid-cols-[auto_auto_1fr] gap-x-2 gap-y-1 items-center mb-2">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
								<path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7H3v12a2 2 0 002 2z" />
							</svg>
							<span className="font-bold">Schedule:</span>
							<span>{formatDateRange(event.startAt, event.endAt)}</span>

							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
								<path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 12 17.657 7.343a8 8 0 10-11.314 11.314L12 13.414l5.657 5.657z" />
							</svg>
							<span className="font-bold">Location:</span>
							<span>{event.location}</span>

							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
								<path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h10m-5 4h5" />
							</svg>
							<span className="font-bold">Description:</span>
							<span>{event.description}</span>
						</div>

						<h3 className="my-2 ml-7 flex items-center gap-2 font-bold">Games:</h3>
						<ul className="ml-7">
							{event.games?.map((game, i) => (
								<li className="ml-4 list-disc" key={game._id}>
								  {game.name} · {game.score} pts · {game.game_master} · {game.score_mode}
								</li>
							))}
						</ul>

					</div>
				))}
			</div>


			{modalOpen && (
				<Modal
					onClose={() => { setModalOpen(false); setEditingEvent(null); }}
					className="bg-secondary p-6"
				>
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
