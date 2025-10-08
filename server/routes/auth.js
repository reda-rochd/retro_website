import fetch from "node-fetch"
import Users from "../models/Users.js"

const CLIENT_ID = process.env.FORTYTWO_UID
const CLIENT_SECRET = process.env.FORTYTWO_SECRET
const REDIRECT_URI = process.env.FORTYTWO_REDIRECT_URI

export default async function (fastify, opts) {
	fastify.get("/42/login", async (req, reply) => {
		const redirectAfter = req.query.redirect || "/"
		const state = encodeURIComponent(redirectAfter)

		const url =
			`https://api.intra.42.fr/oauth/authorize?client_id=${CLIENT_ID}` +
			`&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
			`&response_type=code` +
			`&state=${state}`

		reply.redirect(url)
	})

	fastify.get("/42/callback", async (req, reply) => {
		const code = req.query.code
		const redirectAfter = decodeURIComponent(req.query.state || "/")

		const tokenRes = await fetch("https://api.intra.42.fr/oauth/token", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				grant_type: "authorization_code",
				client_id: CLIENT_ID,
				client_secret: CLIENT_SECRET,
				code,
				redirect_uri: REDIRECT_URI
			})
		})

		const token = await tokenRes.json()
		if (!token.access_token)
			return reply.status(400).send({ error: "Failed to obtain access token" })

		const meRes = await fetch("https://api.intra.42.fr/v2/me", {
			headers: { Authorization: `Bearer ${token.access_token}` }
		})
		const profile = await meRes.json()

		let user = await Users.findOne({ intra_id: profile.id })
		if (!user) {
			user = await Users.create({
				intra_id: profile.id,
				login: profile.login,
				email: profile.email,
				first_name: profile.first_name,
				last_name: profile.last_name,
				avatar_url: profile.image_url
			})
		}

		const jwtToken = fastify.jwt.sign({ userId: user._id })
		reply.setCookie("session", jwtToken, { httpOnly: true, path: "/" })

		reply.redirect(redirectAfter)
	})
}

