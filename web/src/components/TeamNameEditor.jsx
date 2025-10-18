import { useCallback } from 'react';
import api from '/src/api/client.js';
import { useAuth } from '/src/contexts/AuthContext.jsx';
import { useInlineEditable } from '/src/hooks/useInlineEditable.js';

export default function TeamNameEditor({ team, canEdit }) {
	const { setUser } = useAuth();
	if (!team) return null;

	const teamId = team?._id ?? null;

	const handleSave = useCallback(async (nextName) => {
		if (!teamId || !canEdit) return;
		try {
			const { data } = await api.put(`/teams/${teamId}/name`, { name: nextName });
			setUser((prev) => {
				if (!prev) return prev;
				if (!prev.team) return { ...prev };
				return { ...prev, team: { ...prev.team, name: data.team.name } };
			});
		} catch (error) {
			const message = error.response?.data?.error || 'Failed to update team name';
			throw new Error(message);
		}
	}, [teamId, canEdit, setUser]);

	const validate = useCallback((value) => {
		if (!value) return 'Team name cannot be empty';
		if (value.length > 60) return 'Team name is too long';
		return null;
	}, []);

	const {
		editing,
		draft,
		setDraft,
		start,
		cancel,
		submit,
		saving,
		error
	} = useInlineEditable(team.name, {
		onSave: handleSave,
		validate
	});

	if (!canEdit) {
		return <h3 className="my-2 text-center">{team.name}</h3>;
	}

	if (!editing) {
		return (
			<div className="flex items-center gap-2">
				<h3 className="my-2 text-center">{team.name}</h3>
				<button
					type="button"
					onClick={start}
					className="rounded-full border border-secondary/60 p-1 text-secondary transition hover:bg-secondary/10"
					aria-label="Edit team name"
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
						<path d="M3.56 12.44 2 18l5.56-1.56L18 6l-3.44-3.44L3.56 12.44zm11.2-6.76L15.5 6.42 13.58 4.5l-.74-.74 1.26-1.27 1.66 1.67zM3 16.64l1.52-.42 8.9-8.9-1.1-1.1-8.9 8.9L3 16.64z" />
					</svg>
				</button>
			</div>
		);
	}

	return (
		<form onSubmit={submit} className="flex flex-col sm:flex-row items-center gap-2 w-full max-w-xs mb-4">
			<input
				type="text"
				value={draft}
				onChange={(event) => setDraft(event.target.value)}
				className="w-fit rounded-md border border-gray-300 bg-white/80 px-3 py-1 text-center text-sm text-black focus:outline-none focus:ring-2 focus:ring-secondary outline-none"
				maxLength={60}
				minLength={3}
				placeholder="Team name"
				disabled={saving}
			/>
			<div className="flex gap-2">
				<button type="submit" className="rounded-md bg-secondary px-3 py-1 text-sm text-white disabled:opacity-50 outline-none" disabled={saving}>
					{saving ? 'Saving...' : 'Save'}
				</button>
				<button
					type="button"
					onClick={cancel}
					className="rounded-md bg-white/10 px-3 py-1 text-sm text-red-500 outline-none"
					disabled={saving}
				>
					Cancel
				</button>
			</div>
			{error && <p className="mt-1 w-full text-center text-sm text-red-500">{error}</p>}
		</form>
	);
}
