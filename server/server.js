import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Fastify from 'fastify';
import fastifyJWT from "@fastify/jwt"
import routes from './routes/index.js';
import authPlugin from './plugins/auth.js';

dotenv.config();

await mongoose.connect('mongodb://localhost:27017/ExerciseDb');

const fastify = Fastify({ logger: true })
fastify.register(fastifyJWT, {secret: process.env.JWT_SECRET})
fastify.register(authPlugin)
fastify.register(routes, { prefix: '/api' });
fastify.setErrorHandler((error, request, reply) => {
	request.log.error(error);
	reply.status(500).send({ error: 'An unexpected error occurred' });
});

fastify.listen({ port: 3001});
