import Users from '../../models/Users.js';

export default async function (fastify, opts) {
	fastify.get('/:login', async (request, reply) => {
		const login = request.params.login?.trim();
		
		if (!login) {
			return reply.status(400).send({ error: 'Login is required' });
		}

		const user = await Users.findOne({ login }).select('_id first_name last_name avatar_url').lean();
		
		if (!user) {
			return reply.status(404).send({ error: 'User not found' });
		}

		return reply.send(user);
	});
}
