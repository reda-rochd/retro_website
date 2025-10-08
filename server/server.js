import Fastify from 'fastify';
import fastifyCookie from "@fastify/cookie"
import fastifyJWT from "@fastify/jwt"
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import routes from './routes/index.js';

dotenv.config();

await mongoose.connect('mongodb://localhost:27017/ExerciseDb');

const fastify = Fastify({ logger: true })

fastify.register(fastifyCookie)
fastify.register(fastifyJWT, {
	secret: process.env.JWT_SECRET,
	cookie: { cookieName: "session", signed: false },
	sign: { expiresIn: "1d" }
})

fastify.register(routes, { prefix: '/api' });

fastify.setErrorHandler((error, request, reply) => {
	request.log.error(error);
	reply.status(500).send({ error: 'An unexpected error occurred' });
});

fastify.listen({ port: 3001});
