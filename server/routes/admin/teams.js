import fastify from 'fastify';
import mongoose from 'mongoose';
import Teams from '../../models/Teams.js';
import Users from '../../models/Users.js';

export default async function (fastify, opts) {
	fastify.get('/', async (request, reply) => await Teams.find().populate('members').lean());

	fastify.post('/', async (request, reply) => {
		const logins = request.body.members.map(m => m.login);
		const users = await Users.find({ login: { $in: logins } }).select('_id');

		// if (users.length !== logins.length)
		// 	return reply.status(400).send({ error: 'Some members not found' });

		const teamName = `Team ${await Teams.countDocuments() + 1}`;

		const newTeam = await Teams.create({
			...request.body,
			name: teamName,
			members: users
		});

		return reply.status(201).send(await newTeam.populate('members'));
	});

	fastify.delete('/:id', async (request, reply) => {
		const deletedTeam = await Teams.findByIdAndDelete(request.params.id);
		if (!deletedTeam)
			return reply.status(404).send({ error: 'Team not found' });
		return deletedTeam;
	});

	fastify.post('/:teamId/members/:memberLogin', async (request, reply) => {
		const member = await Users.findOne({ login: request.params.memberLogin }).select('_id').lean();
		if (!member)
			return reply.status(404).send({ error: 'Member not found' });
		const updatedTeam = await Teams.findByIdAndUpdate(
			request.params.teamId,
			{ $addToSet: { members: member._id } },
			{ new: true }
		).populate('members');
		if (!updatedTeam)
			return reply.status(404).send({ error: 'Team not found' });
		return updatedTeam;
	});

	fastify.delete('/:teamId/members/:memberId', async (request, reply) => {
		const updatedTeam = await Teams.findByIdAndUpdate(
			request.params.teamId,
			{ $pull: { members: new mongoose.Types.ObjectId(request.params.memberId) } },
			{ new: true }
		).populate('members');
		if (!updatedTeam)
			return reply.status(404).send({ error: 'Team not found' });
		return updatedTeam;
	});
}
