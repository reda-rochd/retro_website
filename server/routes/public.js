import events from './public/events.js'
import organizers from './public/organizers.js'
import teams from './public/teams.js'
import users from './public/users.js'

export default async function(fastify, opts) {
	fastify.register(events, { prefix: '/events' } );
	fastify.register(organizers, { prefix: '/organizers' } );
	fastify.register(teams, { prefix: '/teams' } );
	fastify.register(users, { prefix: '/users' } );
}
