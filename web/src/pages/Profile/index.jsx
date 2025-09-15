import { useState } from 'react'
import Section from '../../components/Section'
import BlobShape from '../../components/BlobShape.jsx'

export default function Profile() {
	const [qrcode, setQrcode] = useState("my");
	const data = {
		name: "John Doe",
		login: 'johndoe',
		avatar: 'https://avatars.githubusercontent.com/u/542948?s=200&v=4',
		self_qrCode: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg',
		team_qrCode: 'https://sp-ao.shortpixel.ai/client/to_webp,q_glossy,ret_img,w_300,h_300/https://prooftag.net/wp-content/uploads/2021/07/QR-Code.png',
		self_score: 1200,
		team_score: 3500,
		teammates: [
			{
				login: 'fernas',
				avatar: 'https://avatars.githubusercontent.com/u/9633?s=200&v=4',
			},
			{
				login: 'herbola',
				avatar: 'https://avatars.githubusercontent.com/u/542948?s=200&v=4',
			},
			{
				login: 'derbola',
				avatar: 'https://avatars.githubusercontent.com/u/9637?s=200&v=4',
			},
			{
				login: 'zerbola',
				avatar: 'https://avatars.githubusercontent.com/u/9641?s=200&v=4',
			},
			{
				login: 'merbola',
				avatar: 'https://avatars.githubusercontent.com/u/9645?s=200&v=4',
			}
		]
	}
	return (
		<Section>
			<div className="flex flex-col items-center ">
				<BlobShape avatar={data.avatar} size="125" />
				<p className="text-2xl">{data.name}</p>
			</div>
			<div className="flex items-center gap-8 justify-center">
				{
					[data.self_score, data.team_score].map((score, index) => (
						<div key={index} className="flex flex-col items-center">
							<span className="text-xl gradient-text">{score}</span>
							<span className="text-xs text-gray-600">{index === 0 ? 'My' : 'Team'} Score</span>
						</div>
					))
				}
			</div>
			<div className="flex flex-col items-center">
				<h3 className="my-2">My Team</h3>
				<div className="flex gap-4 flex-wrap justify-center">
					{
					data.teammates.map((teammate, index) => (
						<div key={index} className="flex flex-col items-center gap-2">
							<BlobShape avatar={teammate.avatar} size="75" className=""/>
							<p className="text-xs text-center">{teammate.login}</p>
						</div>
					))
					}
				</div>
			</div>
			<div className="flex flex-col items-center mt-2">
				<div className="neon-tab-container">
					<button onClick={() => setQrcode("my")} className={`neon-tab ${qrcode === "my" ? 'active' : ''}`}>My QR Code</button>
					<button onClick={() => setQrcode("team")} className={`neon-tab ${qrcode === "team" ? 'active' : ''}`}>My Team QR Code</button>
				</div>
				<img src={qrcode === "my" ? data.self_qrCode : data.team_qrCode} alt="QR Code" className="w-48 h-48 bg-white p-4 rounded-2xl"/>
			</div>
		</Section>
	)
}
