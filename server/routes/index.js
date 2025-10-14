import auth from './auth.js';
import admin from './admin.js';
import me from './me.js';
import points from './points.js';
import public_ from './public.js';
import leaderboard from './leaderboard.js';

import {authenticate, checkAdmin} from '../plugins/auth.js';

export default async function (fastify, opts) {
	fastify.decorate('authenticate', authenticate);
	fastify.decorate('checkAdmin', checkAdmin);

	fastify.register(auth, { prefix: '/auth' });
	fastify.register(public_, { prefix: '/public' });

	fastify.register(async function authenticatedScope(authFastify) {
		authFastify.addHook('onRequest', authFastify.authenticate);

		authFastify.register(me, { prefix: '/me' });
		authFastify.register(points, { prefix: '/points' });
		authFastify.register(leaderboard, { prefix: '/leaderboard' });

		authFastify.register(async function adminScope(adminFastify) {
			adminFastify.addHook('onRequest', adminFastify.checkAdmin);
			adminFastify.register(admin);
		}, { prefix: '/admin' });
	});
}
