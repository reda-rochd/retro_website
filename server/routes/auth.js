import { randomBytes } from "crypto"
import Users from "../models/Users.js"
import Teams from "../models/Teams.js"


export default async function (fastify, opts) {
	const { FORTYTWO_UID, FORTYTWO_SECRET, FORTYTWO_REDIRECT_URI, FRONTEND_URL } = process.env
	const REDIRECT_URI_ENCODED = encodeURIComponent(FORTYTWO_REDIRECT_URI)
	const SCHOOL_YEAR = process.env.CURRENT_SCHOOL_YEAR || new Date().getUTCFullYear();
	const MAX_TEAM_SIZE = 6;
	const IS_PROD = process.env.NODE_ENV === 'production';

	function safeRedirect(redirect) {
		if (typeof redirect !== "string") return "/";
		if (!redirect.startsWith("/") || redirect.startsWith("//")) return "/";
		return redirect;
	}

	async function assignStudentToTeam(userId) {
		let team = await Teams.findOneAndUpdate(
			{ membersCount: { $lt: MAX_TEAM_SIZE } },
			{ $push: { members: userId }, $inc: { membersCount: 1 } },
			{ new: true, sort: { createdAt: -1 } }
		);

		if (!team) {
			const shortId = Math.random().toString(36).slice(-3).toUpperCase();
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
		const redirectAfter = safeRedirect(req.query.redirect);

		const nonce = randomBytes(16).toString("hex");
		const state = Buffer.from(JSON.stringify({ nonce, redirect: redirectAfter })).toString("base64url");

		reply.setCookie("oauth_nonce", nonce, {
			httpOnly: true,
			secure: IS_PROD,
			sameSite: "lax",
			maxAge: 300,
			path: "/"
		});

		const url =
			`https://api.intra.42.fr/oauth/authorize?client_id=${FORTYTWO_UID}` +
			`&redirect_uri=${REDIRECT_URI_ENCODED}` +
			`&response_type=code` +
			`&state=${encodeURIComponent(state)}`;

		return reply.redirect(url);
	})

	fastify.get("/42/callback", async (req, reply) => {
		try {
			const code = req.query.code;
			if (!code)
				return reply.redirect(FRONTEND_URL + "/auth?error=no_code");

			// Verify CSRF nonce
			const storedNonce = req.cookies.oauth_nonce;
			let redirectAfter = "/";
			try {
				const stateData = JSON.parse(Buffer.from(req.query.state || "", "base64url").toString());
				if (!storedNonce || !stateData.nonce || storedNonce !== stateData.nonce)
					return reply.redirect(FRONTEND_URL + "/auth?error=invalid_state");
				redirectAfter = safeRedirect(stateData.redirect);
			} catch {
				return reply.redirect(FRONTEND_URL + "/auth?error=invalid_state");
			}
			reply.clearCookie("oauth_nonce", { path: "/" });

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

			reply.setCookie("token", jwtToken, {
				httpOnly: true,
				secure: IS_PROD,
				sameSite: "lax",
				path: "/",
				maxAge: 86400
			});

			return reply.redirect(FRONTEND_URL + redirectAfter);
		}
		catch (err) {
			console.error(err);
			return reply.redirect(FRONTEND_URL + "/auth?error=server_error");
		}
	})

	fastify.post("/42/logout", async (req, reply) => {
		reply.clearCookie("token", { path: "/" });
		return reply.send({ success: true });
	})
}
