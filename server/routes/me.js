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

			const startOfDay = new Date();
			startOfDay.setHours(0, 0, 0, 0);
			const endOfDay = new Date();
			endOfDay.setHours(23, 59, 59, 999);

			const eventsWithGmGames = await Events.find({
				"games.game_master": user._id,
				date: { $gte: startOfDay, $lte: endOfDay }
			}).lean();
			const gamemasterGames = eventsWithGmGames.map(event => ({
				eventId: event._id,
				eventName: event.name,
				games: event.games.filter(g => g.game_master.toString() === user._id.toString())
			}));

			return { ...user, gamemasterGames };
		}
	});
}
