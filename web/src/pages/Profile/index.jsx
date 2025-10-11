import { useState } from 'react'
import { useAuth } from '/src/contexts/AuthContext.jsx'
import api from '/src/api/client.js'
import QRCode from 'react-qr-code'
import Section from '/src/components/Section'
import BlobShape from '/src/components/BlobShape.jsx'
import QRInput from '/src/components/QRInput.jsx'
import Modal from '/src/components/Modal'

export default function Profile() {
	// const [qrcode, setQrcode] = useState("my");
	const { user } = useAuth();
	const [modalData, setModalData] = useState(null)
	console.log(user);

	const handleScan = (eventId, gameId, scan) => {
		const parts = scan.split("|")
		if (parts.length !== 3) return;
		const userData = {
			id: parts[0],
			name: parts[1],
			img: parts[2]
		}
		setModalData({ eventId, gameId, userData })
	}

	const confirmAward = async () => {
		if (!modalData) return
		const { eventId, gameId, userData } = modalData
		try {
			await api.post('/points', {
				eventId,
				gameId,
				userId: userData.id 
			})
			// TODO: await server response and show success message
		} finally {
			setModalData(null) // TODO: only if success
		}
	}

	const cancelAward = () => setModalData(null)

	return (
		<Section>
			<div className="flex flex-col items-center ">
				<BlobShape avatar={user.avatar_url} size="125" />
				<p className="text-2xl">{user.name}</p>
			</div>
			{user.gamemasterGames?.length === 0 && (
			<div className="flex items-center gap-8 justify-center">
				{
					[user.self_score, user.team_score].map((score, index) => (
						<div key={index} className="flex flex-col items-center">
							<span className="text-xl gradient-text">{score}</span>
							<span className="text-xs text-gray-600">{index === 0 ? 'My' : 'Team'} Score</span>
						</div>
					))
				}
			</div>
			)}
			{user.team && user.gamemasterGames?.length === 0 && (
				<div className="flex flex-col items-center">
					<h3 className="my-2">Team</h3>
					<div className="flex gap-4 flex-wrap justify-center">
						{
						user.team?.members
							?.filter(teammate => teammate.login !== user.login)
							.map((teammate, index) => (
							<div key={index} className="flex flex-col items-center gap-2">
								<BlobShape avatar={teammate.avatar_url} size="75" className=""/>
								<p className="text-xs text-center">{teammate.login}</p>
							</div>
						))
						}
					</div>
				</div>
			)}

			{user.gamemasterGames?.length > 0 && (
				<div className="mt-4">
					<h3 className="my-2 text-center">Games I'm Managing</h3>
					{user.gamemasterGames.map(event => (
						<div key={event.eventId}>
							{event.games.map(game => (
								<div key={game._id} className="mb-4 flex gap-4 items-center w-full">
									<span className="w-2/3">{game.name}</span>
									<span className="w-1/8 gradient-text">{game.score} pts</span>
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
			<Modal onClose={cancelAward}>
				<div className="p-6 flex flex-col items-center gap-4 z-80">
					<p>Award points to {modalData.userData.name}?</p>
					<img src={`https://cdn.intra.42.fr/users/${modalData.userData.img}`} className="w-32 h-32 rounded-full"/>
					<button onClick={confirmAward} className="bg-primary px-8 py-2 rounded-lg cursor-pointer">Award</button>
				</div>
			</Modal>
		)}

		</Section>
	)
}
