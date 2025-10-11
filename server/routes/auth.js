import mongoose from "mongoose"
import fetch from "node-fetch"
import Users from "../models/Users.js"
import Teams from "../models/Teams.js"


export default async function (fastify, opts) {
	const { FORTYTWO_UID, FORTYTWO_SECRET, FORTYTWO_REDIRECT_URI, FRONTEND_URL } = process.env
	const REDIRECT_URI_ENCODED = encodeURIComponent(FORTYTWO_REDIRECT_URI)
	const SCHOOL_YEAR = process.env.CURRENT_SCHOOL_YEAR || new Date().getUTCFullYear();
	const MAX_TEAM_SIZE = 5;

	async function assignStudentToTeam(userId) {
		let team = await Teams.findOneAndUpdate(
			{ membersCount: { $lt: MAX_TEAM_SIZE } },
			{ $push: { members: userId }, $inc: { membersCount: 1 } },
			{ new: true, sort: { createdAt: -1 } }
		);

		if (!team) {
			const shortId = Math.random().toString(36).slice(-4).toUpperCase();
			team = await Teams.create({
				name: `Team-${shortId}`,
				members: [userId],
				membersCount: 1
			});
		}

		await Users.findByIdAndUpdate(userId, { team: team._id });

		return team;
	}

	fastify.get("/42/login", async (req, reply) => {
		const redirectAfter = req.query.redirect || "/";
		const state = encodeURIComponent(redirectAfter);

		const url =
			`https://api.intra.42.fr/oauth/authorize?client_id=${FORTYTWO_UID}` +
			`&redirect_uri=${REDIRECT_URI_ENCODED}` +
			`&response_type=code` +
			`&state=${state}`;

		return reply.redirect(url);
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
			const isNewStudent = new Date(profile.created_at).getUTCFullYear() == SCHOOL_YEAR;

			const user = await Users.findOneAndUpdate(
				{ intra_id: profile.id },
				{
					$setOnInsert: {
						login: profile.login,
						intra_id: profile.id,
						first_name: profile.first_name,
						last_name: profile.last_name,
						avatar_url: profile.image?.versions?.small || null,
						is_new_student: isNewStudent,
					}
				},
				{ upsert: true, new: true }
			);

			if (isNewStudent && !user.team) await assignStudentToTeam(user._id);

			const jwtToken = fastify.jwt.sign({ userId: user._id, login: user.login }, { expiresIn: '1d' }); 
			const url = "/auth/callback?token=" + jwtToken + `&redirect=` + redirectAfter;
			return reply.redirect(FRONTEND_URL + url);
		}
		catch (err) {
			console.error(err);
			return reply.redirect(FRONTEND_URL + "/auth?error=server_error");
		}
	})
}
