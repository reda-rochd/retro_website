import auth from './auth.js';
import admin from './admin.js';
import me from './me.js';
import {authenticate, checkAdmin} from '../plugins/auth.js';

export default function (fastify, opts, done) {
	fastify.decorate('authenticate', authenticate);
	fastify.decorate('checkAdmin', checkAdmin);

	fastify.register(auth, { prefix: '/auth' });
	fastify.register(admin, { prefix: '/admin' });
	fastify.register(me, { prefix: '/me' });
	done()
}
