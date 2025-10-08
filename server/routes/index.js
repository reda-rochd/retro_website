import auth from './auth.js';
import admin from './admin.js';

export default async function (fastify, opts) {
	fastify.register(auth, { prefix: '/auth' });
	fastify.register(admin, { prefix: '/admin' });
}
