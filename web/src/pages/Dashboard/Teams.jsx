import {useEffect, useState} from "react"
import Modal from "../../components/Modal.jsx"
import Form from "./Form.jsx"

const create_empty_member = () => ({ tmp_id: crypto.randomUUID(), login: "" })

export default function Teams()
{
	const [teams, setTeams] = useState([])
	const [loading, setLoading] = useState(true)
	const [modalOpen, setModalOpen] = useState(false)
	const [editingTeam, setEditingTeam] = useState(null)
	const [tempMembers, setTempMembers] = useState([create_empty_member()])

	useEffect(() => {
		const fetchTeams = async () => {
			try {
				const res = await fetch("/api/dashboard/teams")
				if (!res.ok) throw new Error("Failed to fetch")
				const json = await res.json()
				setTeams(json)
			} catch (err) {
				console.error("Failed fetching teams:", err)
			} finally {
				setLoading(false)
			}
		}
		fetchTeams()
	}, [])

	const openEditForm = (team) => {
		setEditingTeam(team)
		setModalOpen(true)
	}

	const handleCreateTeam = (e) => {
		e.preventDefault();
		fetch("/api/dashboard/teams", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				members: tempMembers.filter(m => m.login.trim() !== "")
			})
		}).then(res => res.json()).then(newTeam => {
			if(!newTeam._id) {
				console.error("Failed creating team:", newTeam)
			} else {
				setTeams([...teams, newTeam])
			}
			setModalOpen(false)
			setTempMembers([create_empty_member()])
		}).catch(err => {
			console.error("Failed creating team:", err)
		})
	}

	const handleDeleteTeam = async (teamId) => {
		const res = await fetch(`/api/dashboard/teams/${teamId}`, { method: "DELETE" });
		if (res.ok) {
			setTeams(teams.filter(t => t._id !== teamId));
			setModalOpen(false);
			setEditingTeam(null);
		} else {
			console.error("Failed deleting team");
		}
	}

	const handleUpdateMember = (teamId, login, method) => {
		const res = fetch(`/api/dashboard/teams/${teamId}/members/${login}`, {
			method,
		}).then(res => res.json()).then(updatedTeam => {
			if (!updatedTeam._id) {
				console.error("Failed updating member:", updatedTeam)
				return
			}
			setTeams(teams.map(t => t._id === updatedTeam._id ? updatedTeam : t))
			setEditingTeam(updatedTeam)
		}).catch(err => {
			console.error("Failed adding member:", err)
		})
	}

	if (loading) return <div>Loading...</div>
	return (
		<div className="flex flex-col items-start gap-4">
				<button
					className="bg-white text-primary py-2 px-4 rounded cursor-pointer"
					onClick={() => {openEditForm(null)}}
				>+ Add Team</button>
			{teams.map(team => (
				<div key={team._id} className="">
					<p>{team.name}:</p>
					<div className="flex space-x-4 justify-center items-center flex-wrap">
						{team?.members?.map(member => (
							<div key={member.login} className="text-center relative">
								<img
									src={member.avatarUrl === "" ? null : member.avatarUrl}
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
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
								<path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652l-1.688 1.687m-2.651-2.651L6.75 16.5a2.25 2.25 0 00-.562.975l-.621 2.485a.75.75 0 00.91.91l2.486-.621a2.25 2.25 0 00.975-.562L19.513 7.138m-2.651-2.651L19.5 7.125" />
							</svg>
						</button>
					</div>
				</div>
			))}

		{modalOpen && (
		<Modal onClose={() => {setModalOpen(false); setEditingTeam(null); setTempMembers([create_empty_member()])}}>
			<h2 className="text-2xl font-bold mb-4">{editingTeam ? "Edit Team" : "Add New Team"}</h2>
			{!editingTeam && (
				<form onSubmit={handleCreateTeam} className="flex flex-col gap-4">
					<button
						type="button"
						onClick={() => setTempMembers([...tempMembers, create_empty_member()])}
						className="bg-white text-primary py-2 px-4 rounded cursor-pointer w-fit"
					>+ New Member</button>
					{tempMembers.map((member, index) => (
						<div key={member.tmp_id} className="flex items-center gap-4">
							<input
								className="w-full px-4 border-l border-gray-500 outline-none"
								placeholder="Login"
								onChange={e => {
									const newMembers = [...tempMembers]
									newMembers[index].login = e.target.value
									setTempMembers(newMembers)
								}}
								type="text" name={`member-${index}`} />
							<button
								onClick={() => { setTempMembers(tempMembers.filter((_, i) => i !== index)) }}
								className="text-red-400 bg-primary py-2 px-4 rounded cursor-pointer w-fit"
							>Delete</button>
						</div>
					))}
					<button type="submit" className="bg-primary text-white py-2 px-4 rounded cursor-pointer">Create Team</button>
				</form>
			)}

			{editingTeam && (
				<div className="flex flex-col gap-2">
				{editingTeam?.members?.map((member, i) => (
					<div key={i} className="flex items-center justify-between gap-4">
						<p className="ml-4">{member.login}</p>
						<button onClick={() => handleUpdateMember(editingTeam._id, member._id, "DELETE")}
							className="text-red-400 bg-primary py-2 px-4 rounded cursor-pointer"
						>Delete</button>
					</div>
				))}
				<form
					onSubmit={(e) => {
						e.preventDefault()
						handleUpdateMember(editingTeam._id, e.target.login.value, "POST")
						e.target.reset()
					}}
					className="flex items-center gap-4"
				>
					<input type="text" name="login" placeholder="Login"
						className="w-full px-4 border-l border-gray-500 outline-none"
					/>
					<button type="submit" className="bg-primary text-blue-400 px-6 py-2 rounded cursor-pointer">Add</button>
				</form>
				<button type="button"
					onClick={() => {if (window.confirm("Are you sure?")) handleDeleteTeam(editingTeam._id)}}
					className="text-red-400 bg-primary py-2 px-4 rounded cursor-pointer w-fit m-auto"
				>Delete Team</button>
				</div>
			)}
		</Modal>
		)}
		</div>
	)
}
