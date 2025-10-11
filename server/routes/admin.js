import teams from './admin/teams.js';
import events from './admin/events.js';

export default async function (fastify, opts) {
	fastify.register(teams, { prefix: '/teams' });
	fastify.register(events, { prefix: '/events' });
}

