import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Fastify from 'fastify';
import fastifyJWT from "@fastify/jwt"
import fastifyCookie from "@fastify/cookie"
import routes from './routes/index.js';

dotenv.config();

await mongoose.connect('mongodb://localhost:27017/ExerciseTesting');

const fastify = Fastify({ logger: true });
await fastify.register(fastifyCookie);
await fastify.register(fastifyJWT, {
	secret: process.env.JWT_SECRET,
	cookie: { cookieName: 'token', signed: false }
});
await fastify.register(routes, { prefix: '/api' });
fastify.setErrorHandler((error, request, reply) => {
	request.log.error(error);
	reply.status(500).send({ error: 'An unexpected error occurred' });
});

fastify.listen({ port: 3001});
