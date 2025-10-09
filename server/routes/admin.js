import teams from './admin/teams.js';
import events from './admin/events.js';

export default async function (fastify, opts) {
	fastify.addHook('preHandler', async (request, reply) => {
		await fastify.authenticate(request, reply);
		await fastify.checkAdmin(request, reply);
	});

	fastify.register(teams, { prefix: '/teams' });
	fastify.register(events, { prefix: '/events' });
}

