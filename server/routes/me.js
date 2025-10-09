import Users from '../models/Users.js';

export default async function (fastify, opts) {
	fastify.get("/", {
		preValidation: [fastify.authenticate],
		handler: async (req, reply) => {
			const user = await Users.findById(req.user.userId).lean();
			if (!user) return reply.status(404).send({ error: 'User not found' });
			return user;
		}
	});
}
