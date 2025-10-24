import Teams from '../models/Teams.js';
import Users from '../models/Users.js';
import GameSession from '../models/GameSession.js';

export default async function leaderboard(fastify, opts) {
	fastify.get('/', async (request, reply) => {
		const teams = await Teams.find(
			{members: { $exists: true, $not: {$size: 0} }},
			{ name: 1, score: 1}
		)
		.sort({ score: -1 })
		.lean();

		const individuals = await Users.find(
			{is_new_student: true},
			{ login: 1, score: 1, avatar_url: 1, team: 1, first_name: 1, last_name: 1, _id: 0 }
		)
		.sort({ score: -1 })
		.lean();

		const games = await GameSession.find(
			{},
			{ score: 1, durationSec: 1, userId: 1, _id: 0 }
		)
		.sort({ score: -1, durationSec: 1 })
		.populate({ path: 'userId', select: 'login avatar_url first_name last_name', model: 'Users' })
		.lean();

		reply.send({ teams, individuals, games });
	});
}
