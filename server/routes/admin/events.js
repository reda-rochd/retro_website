import Events from '../../models/Events.js';
import Users from '../../models/Users.js';

export default async function (fastify, opts) {
	async function mapGameMasters(games) {
		const logins = games.map(g => g.game_master);
		const users = await Users.find({ login: { $in: logins } });
		const loginToId = Object.fromEntries(users.map(u => [u.login, u._id]));

		for (const game of games) {
			if (!loginToId[game.game_master]) throw new Error('User not found');
			game.game_master = loginToId[game.game_master];
		}
		return games;
	}

	async function gamesWithLogin(games) {
		const populated = await Promise.all(
			games.map(async g => {
				if (typeof g.game_master === 'string') return g;
				const user = await Users.findById(g.game_master, 'login').lean();
				return { ...g, game_master: user ? user.login : g.game_master };
			})
		);
		return populated;
	}

	fastify.get('/', async () => {
		const events = await Events.find().lean();
		return Promise.all(events.map(async ev => ({
			...ev,
			games: await gamesWithLogin(ev.games)
		})));
	});

	fastify.post('/', async (req, reply) => {
		if (req.body.games) req.body.games = await mapGameMasters(req.body.games);
		const event = await Events.create(req.body);
		const evObj = event.toObject();
		evObj.games = await gamesWithLogin(evObj.games);
		return evObj;
	});

	fastify.put('/:id', async (req, reply) => {
		if (req.body.games) req.body.games = await mapGameMasters(req.body.games);
		const updated = await Events.findByIdAndUpdate(req.params.id, req.body, { new: true });
		if (!updated) return reply.status(404).send({ error: 'Event not found' });
		const evObj = updated.toObject();
		evObj.games = await gamesWithLogin(evObj.games);
		return evObj;
	});

	fastify.delete('/:id', async (req, reply) => {
		const deleted = await Events.findByIdAndDelete(req.params.id);
		if (!deleted) return reply.status(404).send({ error: 'Event not found' });
		return { success: true, id: deleted._id };
	});
}
