import { useEffect, useState } from "react";
import Modal from "/src/components/Modal.jsx";
import api from "/src/api/client.js";

const create_empty_member = () => ({ tmp_id: crypto.randomUUID(), login: "", role: "user" });

export default function Teams() {
	const [teams, setTeams] = useState([]);
	const [loading, setLoading] = useState(true);
	const [modalOpen, setModalOpen] = useState(false);
	const [editingTeam, setEditingTeam] = useState(null);
	const [tempMembers, setTempMembers] = useState([create_empty_member()]);

	useEffect(() => {
		api.get("/admin/teams")
			.then(res => setTeams(res.data))
			.finally(() => setLoading(false));
	}, []);

	const openEditForm = (team) => {
		setEditingTeam(team);
		setModalOpen(true);
	};

	const handleCreateTeam = (e) => {
		e.preventDefault();
		api.post("/admin/teams", { members: tempMembers.filter(m => m.login.trim() !== "") })
		.then(res => setTeams(p => [...p, res.data]))
		.finally(() => {
			setModalOpen(false);
			setTempMembers([create_empty_member()]);
		});
	};

	const handleDeleteTeam = (teamId) => {
		api.delete(`/admin/teams/${teamId}`)
		.then(() => {
			setTeams(teams.filter(t => t._id !== teamId));
			setModalOpen(false);
			setEditingTeam(null);
		})
	};

	const handleRoleChange = (userId, teamId, checked) => {
		const updateMemberInTeam = (team, userId, updatedUser) => ({
			...team,
			members: team.members.map(m => m._id === userId ? updatedUser : m)
		});

		api.put(`/admin/teams/users/${userId}/role`, { role: checked ? "leader" : "user" })
		.then(res => {
			setTeams(p => p.map(t => t._id === teamId ? updateMemberInTeam(t, userId, res.data) : t));
			setEditingTeam(p => p && p._id === teamId ? updateMemberInTeam(p, userId, res.data) : p);
		})
	};

	const handleDeleteMember = (teamId, userId) => {
		const removeMemberFromTeam = (team, userId) => ({
			...team,
			members: team.members.filter(m => m._id !== userId)
		});
		api.delete(`/admin/teams/${teamId}/members/${userId}`)
		.then(() => {
			setTeams(p => p.map(t => t._id === teamId ? removeMemberFromTeam(t, userId) : t));
			setEditingTeam(p => p && p._id === teamId ? removeMemberFromTeam(p, userId) : p);
		});
	};

	const handleAddMember = (teamId, login, role) => {
		api.post(`/admin/teams/${teamId}/members`, { login, role })
		.then(res => {
			setTeams(p => p.map(t => t._id === teamId ? res.data : t));
			setEditingTeam(p => p && p._id === teamId ? res.data : p);
		});
	};

	if (loading) return <div>Loading...</div>;

	return (
		<div className="flex flex-col items-start gap-4">
			<button
				className="bg-white text-primary py-2 px-4 rounded cursor-pointer"
				onClick={() => openEditForm(null)}
			>
				+ Add Team
			</button>

			{teams.map(team => (
				<div key={team._id}>
					<p>{team.name}:</p>
					<div className="flex space-x-4 justify-center items-center flex-wrap">
						{team?.members?.map(member => (
							<div key={member._id} className="text-center relative">
								<img
									src={member.avatar_url || undefined}
									alt={member.login}
									className="w-16 h-16 rounded-full mx-auto mb-1"
								/>
								<div className="text-sm">{member.login}</div>
							</div>
						))}
						<button
							onClick={() => openEditForm(team)}
							className="cursor-pointer p-2 bg-white text-primary rounded self-start mt-4"
						>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
								<path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652l-1.688 1.687m-2.651-2.651L6.75 16.5a2.25 2.25 0 00-.562.975l-.621 2.485a.75.75 0 00.91.91l2.486-.621a2.25 2.25 0 00.975-.562L19.513 7.138m-2.651-2.651L19.5 7.125" />
							</svg>
						</button>
					</div>
				</div>
			))}

			{modalOpen && (
				<Modal
					onClose={() => {
						setModalOpen(false);
						setEditingTeam(null);
						setTempMembers([create_empty_member()]);
					}}
					className="bg-secondary p-6"
				>
					<h2 className="text-2xl font-bold mb-4">
						{editingTeam ? "Edit Team" : "Add New Team"}
					</h2>

					{!editingTeam && (
						<form onSubmit={handleCreateTeam} className="flex flex-col gap-4">
							<button
								type="button"
								onClick={() => setTempMembers([...tempMembers, create_empty_member()])}
								className="bg-white text-primary py-2 px-4 rounded cursor-pointer w-fit"
							>
								+ New Member
							</button>

							{tempMembers.map((member, index) => (
								<div key={member.tmp_id} className="flex items-center gap-4">
									<input
										className="w-full px-4 border-l border-gray-500 outline-none"
										placeholder="Login"
										value={member.login}
										onChange={e => {
											const newMembers = [...tempMembers];
											newMembers[index].login = e.target.value;
											setTempMembers(newMembers);
										}}
									/>
									<label className="flex items-center gap-1 cursor-pointer">
										<input
											type="checkbox"
											checked={member.role === "leader"}
											className="cursor-pointer rounded-full appearance-none bg-white checked:bg-blue-500  w-4 h-4 flex-shrink-0"
											onChange={e => {
												const newMembers = [...tempMembers];
												newMembers[index].role = e.target.checked ? "leader" : "user";
												setTempMembers(newMembers);
											}}
										/>
										Leader?
									</label>
									<button
										type="button"
										onClick={() => setTempMembers(tempMembers.filter((_, i) => i !== index))}
										className="text-red-400 bg-primary py-2 px-4 rounded cursor-pointer w-fit"
									>
										Delete
									</button>
								</div>
							))}

							<button type="submit" className="bg-primary text-white py-2 px-4 rounded cursor-pointer">
								Create Team
							</button>
						</form>
					)}

					{editingTeam && (
						<div className="flex flex-col gap-2">
							{editingTeam?.members?.map((member, i) => (
								<div key={member._id} className="flex items-center justify-between gap-4">
									<p className="ml-4 w-full">{member.login}</p>
									<label className="flex items-center gap-1 cursor-pointer">
										<input
											type="checkbox"
											checked={member.role === "leader"}
											className="w-4 h-4 appearance-none rounded bg-white checked:bg-blue-500 cursor-pointer"
											onChange={e => handleRoleChange(member._id, editingTeam._id, e.target.checked)}
										/>
										Leader?
									</label>
									<button
										onClick={() => handleDeleteMember(editingTeam._id, member._id)}
										className="text-red-400 bg-primary py-2 px-4 rounded cursor-pointer"
									>
										Delete
									</button>
								</div>
							))}

							<form
								onSubmit={(e) => {
									e.preventDefault();
									const login = e.target.login.value.trim();
									const role = e.target.role.checked ? "leader" : "user";
									if (!login) return;

									handleAddMember(editingTeam._id, login, role)
									e.target.reset();
								}}
								className="flex items-center gap-4"
							>
								<input
									type="text"
									name="login"
									placeholder="Login"
									className="w-full px-4 border-l border-gray-500 outline-none"
								/>
								<label className="flex items-center gap-1 cursor-pointer">
									<input type="checkbox" name="role" className="w-4 h-4 appearance-none rounded bg-white checked:bg-blue-500"/>
									Leader?
								</label>
								<button type="submit" className="bg-primary text-blue-400 px-6 py-2 rounded cursor-pointer">
									Add
								</button>
							</form>

							<button
								type="button"
								onClick={() => {
									if (window.confirm("Are you sure?")) handleDeleteTeam(editingTeam._id);
								}}
								className="text-red-400 bg-primary py-2 px-4 rounded cursor-pointer w-fit m-auto"
							>
								Delete Team
							</button>
						</div>
					)}
				</Modal>
			)}
		</div>
	);
}
