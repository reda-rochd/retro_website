import { useState } from 'react'
import { useAuth } from '/src/contexts/AuthContext.jsx'
import api from '/src/api/client.js'
import QRCode from 'react-qr-code'
import Section from '/src/components/Section'
import BlobShape from '/src/components/BlobShape.jsx'
import QRInput from '/src/components/QRInput.jsx'
import Modal from '/src/components/Modal'
import TeamNameEditor from '/src/components/TeamNameEditor.jsx'

export default function Profile() {
	const { user } = useAuth();
	const [modalData, setModalData] = useState(null)
	const [res, setRes] = useState(null)

	const handleScan = (eventId, gameId, scan) => {
		const parts = scan.split("|")
		if (parts.length !== 3) return false;
		const userData = {
			id: parts[0],
			name: parts[1],
			img: parts[2]
		}
		setModalData({ eventId, gameId, userData })
		return true;
	}

	const confirmAward = async () => {
		if (!modalData) return
		const { eventId, gameId, userData } = modalData
		setRes(null)

		api.post('/points', {
			eventId,
			gameId,
			userId: userData.id
		})
		.then(response => {
			if (response.status === 201) {
				setRes({ success: true, message: "Points awarded successfully" })
				setTimeout(closeModal, 2000)
			} else {
				setRes({ success: false, message: "Failed to award points" })
			}
		})
		.catch(error => {
			const status = error.response?.status
			const message = error.response?.data?.error || "Failed to award points"
			setRes({ success: false, message })
		})
	}

	const closeModal = () => {
		setModalData(null)
		setRes(null)
	}

	return (
		<Section className="mt-20 mb-10">
			<div className="flex flex-col items-center ">
				<BlobShape avatar={user.avatar_url} size="125" />
				<p className="text-2xl">{user.name}</p>
			</div>

			{user.is_new_student && (
			  <div className="flex items-center gap-8 justify-center">
				{[
				  { value: user.score, label: "My Score" },
				  { value: user.team?.score ?? 0, label: "Team Score" }
				].map(({ value, label }, index) => (
				  <div key={index} className="flex flex-col items-center">
					<span className="text-xl gradient-text">{value}</span>
					<span className="text-xs text-gray-600">{label}</span>
				  </div>
				))}
			  </div>
			)}

			{user.team && (
				<div className="flex flex-col items-center">
					<TeamNameEditor team={user.team} canEdit={user.role === 'leader'} />
					<div className="flex gap-4 flex-wrap justify-center">
						{
						user.team?.members
							.map((teammate) => (
							<a
								href={`https://profile-v3.intra.42.fr/users/${teammate.login}`}
								target="_blank"
								key={teammate._id}
								className="flex flex-col items-center filter contrast-125"
							>
								<BlobShape avatar={teammate.avatar_url} size="75"/>
								<p className="text-xs text-center">{teammate.login}</p>
							</a>
						))
						}
					</div>
				</div>
			)}

			{console.log(user.gamemasterGames)}

			{user.gamemasterGames?.length > 0 && (
				<div>
					<h3 className="my-2 text-center">Games I'm Managing</h3>
					{user.gamemasterGames.map(event => (
						<div key={event.eventId}>
							{event.games.map(game => (
								<div key={game._id} className="mb-4 flex gap-4 items-center w-full">
									<span className="w-full">{game.name}</span>
									<span className="w-fit shrink-0 gradient-text">{game.score} pts</span>
									<QRInput
									placeholder="Award"
									className="bg-secondary/40 rounded-lg shadow-md w-fit p-2"
									onScan={(qrValue) => handleScan(event.eventId, game._id, qrValue)}
									/>
								</div>
							))}
						</div>
					))}
				</div>
			)}

			{user.is_new_student && (
				<div className="flex flex-col items-center mt-2">
					<h3 className="my-2">Identifier QR Code</h3>
					<QRCode
						value={
							user._id + "|" +
							user.first_name + " " + user.last_name + "|" +
							user.avatar_url.split("/users/")[1]
						}
						size={256} bgColor="#fff" fgColor="#000" level="H"
						className="p-4 bg-white rounded-2xl"
					/>
				</div>
			)}

		{modalData && (
			<Modal onClose={closeModal} className="bg-primary p-4">
				<div className="p-6 flex flex-col items-center gap-4 z-80">
					<p>Award points to {modalData.userData.name}?</p>
					<img src={`https://cdn.intra.42.fr/users/${modalData.userData.img}`} className="w-32 h-32 rounded-full"/>
					<button onClick={confirmAward} className="bg-secondary px-8 py-2 rounded-lg cursor-pointer">Award</button>
					{res && <p className={res.success ? "text-green-500" : "text-red-500"}>{res.message}</p>}
				</div>
			</Modal>
		)}

		</Section>
	)
}
