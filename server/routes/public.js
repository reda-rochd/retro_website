import events from './public/events.js'
import organizers from './public/organizers.js'

export default async function(fastify, opts) {
	fastify.register(events, { prefix: '/events' } );
	fastify.register(organizers, { prefix: '/organizers' } );
}
