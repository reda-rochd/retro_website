import fastify from 'fastify';
import mongoose from 'mongoose';
import Teams from '../../models/Teams.js';
import Users from '../../models/Users.js';

export default async function (fastify, opts) {
	fastify.get('/', async (request, reply) => await Teams.find().populate('members').lean());

	fastify.post('/', async (req, reply) => {
		const membersData = req.body.members;
		const logins = membersData.map(m => m.login);

		const bulkOps = membersData.map(m => ({
			updateOne: {
				filter: { login: m.login },
				update: { $set: { role: m.role || 'user' } }
			}
		}));
		await Users.bulkWrite(bulkOps);

		const users = await Users.find({ login: { $in: logins } }).select('_id');

		const newTeam = await Teams.create({
			...req.body,
			name: "Team-" + Math.random().toString(36).slice(-3).toUpperCase(),
			members: users.map(u => u._id)
		});

		await newTeam.populate('members');
		return reply.status(201).send(newTeam);
	});


	fastify.delete('/:id', async (request, reply) => {
		const deletedTeam = await Teams.findByIdAndDelete(request.params.id);
		if (!deletedTeam)
			return reply.status(404).send({ error: 'Team not found' });
		return deletedTeam;
	});

	fastify.post('/:teamId/members', async (req, reply) => {
	  const { login, role } = req.body;
	  const { teamId } = req.params;

	  const member = await Users.findOneAndUpdate(
		{ login },
		{ $set: { role: role || 'user', team: teamId } },
		{ new: true }
	  );
	  if (!member) return reply.status(404).send({ error: 'Member not found' });

	  const updatedTeam = await Teams.findByIdAndUpdate(
		teamId,
		{ $addToSet: { members: member._id } },
		{ new: true }
	  ).populate('members');

	  if (!updatedTeam) return reply.status(404).send({ error: 'Team not found' });
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

	fastify.put('/users/:userId/role', async (request, reply) => {
		const { userId } = request.params;
		const { role } = request.body;

		if (!['leader', 'user'].includes(role))
			return reply.status(400).send({ error: 'Invalid role' });

		const updatedUser = await Users.findByIdAndUpdate(
			userId,
			{ role },
			{ new: true }
		).lean();

		if (!updatedUser)
			return reply.status(404).send({ error: 'User not found' });

		return updatedUser;
	});
}
