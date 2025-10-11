import auth from './auth.js';
import admin from './admin.js';
import me from './me.js';
import points from './points.js';
import leaderboard from './leaderboard.js';

import {authenticate, checkAdmin} from '../plugins/auth.js';

export default function (fastify, opts) {
	fastify.decorate('authenticate', authenticate);
	fastify.decorate('checkAdmin', checkAdmin);

	fastify.register(auth, { prefix: '/auth' });

	fastify.register(admin, {
		prefix: '/admin',
		onRequest: [fastify.authenticate, fastify.checkAdmin],
	});

	fastify.register(me, {
		prefix: '/me',
		onRequest: [fastify.authenticate],
	});

	fastify.register(points, {
		prefix: '/points',
		onRequest: [fastify.authenticate],
	});

	fastify.register(leaderboard, {
		prefix: '/leaderboard',
		onRequest: [fastify.authenticate],
	});
}
