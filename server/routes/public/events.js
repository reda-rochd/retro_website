import Events from '../../models/Events.js';

export default async function (fastify, opts) {
	fastify.get('/', async (req, reply) => {
		const now = new Date();
		const events = await Events.find().sort({ date: 1 }).lean();

		const sanitized = events.map(e => {
			if (e.date > now) {
				return {
					date: e.date,
					isUpcoming: true,
				};
			} else {
				return {
					date: e.date,
					name: e.name,
					location: e.location,
					description: e.description,
					isUpcoming: false
				};
			}
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
		const eventDate = new Date(event.date);
		if (eventDate.setHours(0, 0, 0, 0) > today.setHours(0, 0, 0, 0)) {
			return reply.status(404).send({ error: 'Event not found' });
		}

		return reply.send(event);
	});
}
