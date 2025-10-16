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
}
