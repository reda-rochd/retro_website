import fetch from "node-fetch"
import Users from "../models/Users.js"


export default async function (fastify, opts) {
	const { FORTYTWO_UID, FORTYTWO_SECRET, FORTYTWO_REDIRECT_URI, FRONTEND_URL } = process.env
	const REDIRECT_URI_ENCODED = encodeURIComponent(FORTYTWO_REDIRECT_URI)

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
		try {
		const code = req.query.code;
		if (!code)
			return reply.redirect(FRONTEND_URL + "/auth?error=no_code");
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
			return reply.redirect(FRONTEND_URL + "/auth?error=oauth_failed");
		const token = await tokenRes.json();

		const meRes = await fetch("https://api.intra.42.fr/v2/me", {
			headers: { Authorization: `Bearer ${token.access_token}` }
		});
		if (!meRes.ok)
			return reply.redirect(FRONTEND_URL + "/auth?error=oauth_failed");
		const profile = await meRes.json();
		if (!profile || !profile.id || !profile.login || !profile.first_name || !profile.last_name || !profile.image || !profile.image.versions || !profile.image.versions.small)
			return reply.redirect(FRONTEND_URL + "/auth?error=invalid_profile");
		console.log(profile);
		const user = await Users.findOneAndUpdate(
			{ intra_id: profile.id },
			{
				$setOnInsert: {
					login: profile.login,
					intra_id: profile.id,
					first_name: profile.first_name,
					last_name: profile.last_name,
					avatar_url: profile.image.versions.small,
				}
			},
			{ upsert: true, new: true }
		);

		const jwtToken = fastify.jwt.sign({ userId: user._id, login: user.login }, { expiresIn: '1d' }); 
		const url = "/auth/callback?token=" + jwtToken + `&redirect=` + redirectAfter;
		reply.redirect(FRONTEND_URL + url);
		}
		catch (err) {
			console.error(err);
			return reply.redirect(FRONTEND_URL + "/auth?error=server_error");
		}
	})
}
