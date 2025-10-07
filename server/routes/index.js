import Teams from './Teams.js';
import Events from './Events.js';
import Users from './Users.js';

export default async function (fastify, opts) {
	fastify.register(Teams, { prefix: '/teams' });
	fastify.register(Events, { prefix: '/events' });
	fastify.register(Users, { prefix: '/users' });
}
