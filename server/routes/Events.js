import fastify from 'fastify';
import Events from '../models/Events.js';

export default async function (fastify, opts) {
	fastify.get('/', async () => await Events.find().lean());

	fastify.post('/', async (request) => await Events.create(request.body));

	fastify.put('/:id', async (request, reply) => {
		const updatedEvent = await Events.findByIdAndUpdate(request.params.id, request.body, { new: true });
		if (!updatedEvent)
			return reply.status(404).send({ error: 'Event not found' });
		return updatedEvent;
	});

	fastify.delete('/:id', async (request, reply) => {
		const deletedEvent = await Events.findByIdAndDelete(request.params.id);
		if (!deletedEvent)
			return reply.status(404).send({ error: 'Event not found' });
		return { success: true, id: deletedEvent._id };
	});
}
