import teams from './admin/teams.js';
import events from './admin/events.js';

const ADMIN_LOGINS = new Set((process.env.ADMIN_LOGINS || '').split(',').map(s => s.trim()).filter(Boolean));

export default async function (fastify, opts) {
	fastify.addHook('onRequest', async (request, reply) => {
		try {
			await request.jwtVerify();
			if (!request.user || !ADMIN_LOGINS.has(request.user.login))
				return reply.redirect(`/`);
		} catch (err) {
			if (err.code?.startsWith('FST_JWT_')) {
				const redirect = encodeURIComponent(request.url);
				return reply.redirect(`/auth/42/login?redirect=${redirect}`);
			}
			return reply.redirect(`/`);
		}
	});

	fastify.register(teams, { prefix: '/teams' });
	fastify.register(events, { prefix: '/events' });
}
