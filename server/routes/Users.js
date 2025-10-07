import fastify from 'fastify';
import Users from '../models/Users.js';

export default async function (fastify, opts) {
	fastify.post('/', async (request, reply) => {
		const newUser = await Users.create(request.body);
		return reply.status(201).send(newUser);
	});

	fastify.delete('/:id', async (request, reply) => {
		const deletedUser = await Users.findByIdAndDelete(request.params.id);
		if (!deletedUser)
			return reply.status(404).send({ error: 'User not found' });
		return deletedUser;
	});
}

