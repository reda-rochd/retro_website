import Points from '../models/Points.js';
import Events from '../models/Events.js';
import Teams from '../models/Teams.js';
import Users from '../models/Users.js';

export default async function (fastify, options) {
	fastify.post('/points', async (request, reply) => {
		const { eventId, gameId, userId} = request.body;
		if (!eventId || !gameId || !userId)
			return reply.status(400).send({ error: 'Missing required fields' });
		
		const user = await Users.findById(userId).populate('team');
		const team = user?.team;
		const event = await Events.findById(eventId, { games: { $elemMatch: { _id: gameId } } });
		const game = event?.games?.[0];
		if (!user || !team || !event || !game)
			return reply.status(404).send({ error: 'Record not found' });

		const solo = game.solo_game;
		try{
			const points = await Points.create({
				eventId,
				gameId,
				userId,
				teamId: team._id,
				points: game.score,
				solo
			});
		} catch (e) {
			if (e.code === 11000)
				return reply.status(409).send({
					error: 'Points for this game have already been awarded to this team',
					success: false
				});
			return reply.status(500).send({ error: 'Internal server error' });
		}

		await Teams.findByIdAndUpdate(team._id, { $inc: { score: game.score } });
		if (solo) await Users.findByIdAndUpdate(userId, { $inc: { self_score: game.score } });

		return reply.status(201).send({ message: 'Points awarded successfully', success: true })
	});
}
