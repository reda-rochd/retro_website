import Teams from '../models/Teams.js';
import Users from '../models/Users.js';

export default async function leaderboard(fastify, opts) {
	fastify.get('/', async (request, reply) => {
		const topTeams = await Teams.find({}, { name: 1, score: 1, _id: 0 }).sort({ score: -1 }).lean();
		const topUsers = await Users.find({}, { login: 1, score: 1, avatar_url: 1, _id: 0 }).sort({ score: -1 }).lean();
		reply.send({ teams: topTeams, individuals: topUsers });
	});
}
