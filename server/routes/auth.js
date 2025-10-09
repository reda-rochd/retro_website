import fetch from "node-fetch"
import Users from "../models/Users.js"

const { FORTYTWO_UID, FORTYTWO_SECRET, FORTYTWO_REDIRECT_URI, FRONTEND_URL } = process.env
const REDIRECT_URI_ENCODED = encodeURIComponent(FORTYTWO_REDIRECT_URI)

export default async function (fastify, opts) {
	fastify.get("/42/login", async (req, reply) => {
		const redirectAfter = req.query.redirect || "/";
		const state = encodeURIComponent(redirectAfter);

		const url =
			`https://api.intra.42.fr/oauth/authorize?client_id=${FORTYTWO_UID}` +
			`&redirect_uri=${REDIRECT_URI_ENCODED}` +
			`&response_type=code` +
			`&state=${state}`;

		reply.redirect(url);
	})

	fastify.get("/42/callback", async (req, reply) => {
		const code = req.query.code;
		if (!code)
			return reply.redirect(FRONTEND_URL + "/auth/callback?error=no_code");
		const redirectAfter = req.query.state || "/";

		const tokenRes = await fetch("https://api.intra.42.fr/oauth/token", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				grant_type: "authorization_code",
				client_id: FORTYTWO_UID,
				client_secret: FORTYTWO_SECRET,
				code,
				redirect_uri: FORTYTWO_REDIRECT_URI
			})
		});
		if (!tokenRes.ok)
			return reply.redirect(FRONTEND_URL + "/auth/callback?error=oauth_failed");
		const token = await tokenRes.json();

		const meRes = await fetch("https://api.intra.42.fr/v2/me", {
			headers: { Authorization: `Bearer ${token.access_token}` }
		});
		if (!meRes.ok)
			return reply.redirect(FRONTEND_URL + "/auth/callback?error=oauth_failed");
		const profile = await meRes.json();

		let user = await Users.findOne({ intra_id: profile.id });
		if (!user) {
			user = await Users.create({
				intra_id: profile.id,
				login: profile.login,
				first_name: profile.first_name,
				last_name: profile.last_name,
				avatar_url: profile.image_url
			})
		};

		const jwtToken = fastify.jwt.sign({ userId: user._id }, { expiresIn: '10m' });
		const url = "/auth/callback?token=" + jwtToken + `&redirect=` + redirectAfter;
		reply.redirect(FRONTEND_URL + url);
	})
}
