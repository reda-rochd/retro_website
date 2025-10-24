import Teams from '../models/Teams.js';
import Users from '../models/Users.js';
import GameSession from '../models/GameSession.js';

export default async function leaderboard(fastify, opts) {
	fastify.get('/', async (request, reply) => {
		const topTeams = await Teams.find(
			{members: { $exists: true, $not: {$size: 0} }},
			{ name: 1, score: 1}
		)
		.sort({ score: -1 })
		.lean();

		const topUsers = await Users.find(
			{is_new_student: true},
			{ login: 1, score: 1, avatar_url: 1, team: 1, _id: 0 }
		)
		.sort({ score: -1 })
		.lean();

		// Simple game leaderboard using GameSession
		const sessions = await GameSession.find(
			{},
			{ score: 1, durationSec: 1, userId: 1, _id: 0 }
		)
		.sort({ score: -1 })
		.limit(100)
		.populate({ path: 'userId', select: 'login avatar_url', model: 'Users' })
		.lean();

		const game = sessions.map((s) => ({
			login: s.userId?.login,
			avatar_url: s.userId?.avatar_url,
			score: s.score,
			durationSec: s.durationSec,
		}));

		reply.send({ teams: topTeams, individuals: topUsers, game });
	});
}
