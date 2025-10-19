import Events from '../../models/Events.js';

const VALID_SCORE_MODES = new Set(['team-only', 'aggregate', 'collective']);

function normalizeGames(games = []) {
	return games.map(game => {
		const derivedMode = VALID_SCORE_MODES.has(game.score_mode)
			? game.score_mode
			: 'team-only';
		const normalized = { ...game, score_mode: derivedMode };
		return normalized;
	});
}

export default async function (fastify, opts) {
	fastify.get('/', async (req, reply) => {
		const now = new Date();
		const events = await Events.find().sort({ startAt: 1 }).lean();

		const sanitized = events.map(e => {
			const startAt = new Date(e.startAt);
			const endAt = new Date(e.endAt);
			const isUpcoming = startAt > now;
			if (isUpcoming) {
				return {
					startAt,
					endAt,
					isUpcoming
				};
			}
			return {
				startAt,
				endAt,
				name: e.name,
				location: e.location,
				description: e.description,
				isUpcoming
			};
		});

		reply.send(sanitized);
	});

	fastify.get('/:eventName', async (request, reply) => {
		const eventName = typeof request.params.eventName === 'string' ? decodeURIComponent(request.params.eventName.trim()) : '';

		if (!eventName)
			return reply.status(400).send({ error: 'Event name is required' });

		const event = await Events.findOne({ name: eventName })
			.select('-_id -createdAt -updatedAt')
			.populate('games.game_master')
			.lean();
		if (!event)
			return reply.status(404).send({ error: 'Event not found' });

		const today = new Date();
		const referenceDate = new Date(event.startAt);
		if (referenceDate.setHours(0, 0, 0, 0) > today.setHours(0, 0, 0, 0)) {
			return reply.status(404).send({ error: 'Event not found' });
		}

		return reply.send({
			...event,
			games: normalizeGames(event.games)
		});
	});
}
