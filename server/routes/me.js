import Users from '../models/Users.js';
import Events from '../models/Events.js';

export default async function (fastify, opts) {
	fastify.get("/", {
		preValidation: [fastify.authenticate],
		handler: async (req, reply) => {
			const user = await Users.findById(req.user.userId)
				.populate({
					path: 'team',
					populate: { path: 'members' }
				})
				.lean();

			if (!user) return reply.status(404).send({ error: 'User not found' });

			const eventsWithGmGames = await Events.find({ "games.game_master": user._id }).lean();

			const gamemasterGames = eventsWithGmGames.map(event => ({
				eventId: event._id,
				eventName: event.name,
				games: event.games.filter(g => g.game_master.toString() === user._id.toString())
			}));

			return { ...user, gamemasterGames };
		}
	});
}
