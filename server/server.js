import Fastify from 'fastify';
import mongoose from 'mongoose';
import routes from './routes/index.js';

mongoose.connect('mongodb://localhost:27017/ExerciseDb');
const fastify = Fastify({ logger: true });

fastify.register(routes, { prefix: '/api' });

fastify.setErrorHandler((error, request, reply) => {
	request.log.error(error);
	reply.status(500).send({ error: 'An unexpected error occurred' });
});

fastify.listen({ port: 3001});
