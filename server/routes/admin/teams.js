import mongoose from 'mongoose';
import Teams from '../../models/Teams.js';
import Users from '../../models/Users.js';

const { ObjectId } = mongoose.Types;

async function syncMembersCount(teamIds = []) {
	const uniqueIds = [...new Set(
		teamIds
			.map(id => (id ? id.toString() : ''))
			.filter(Boolean)
	)];

	if (uniqueIds.length === 0) return;

	const teams = await Teams.find({ _id: { $in: uniqueIds.map(id => new ObjectId(id)) } }).select('members');
	const ops = teams.map(team => ({
		updateOne: {
			filter: { _id: team._id },
			update: { $set: { membersCount: team.members.length } }
		}
	}));
	if (ops.length > 0) await Teams.bulkWrite(ops);
}

export default async function (fastify, opts) {
	fastify.get('/', async (request, reply) => await Teams.find().populate('members').lean());

	fastify.post('/', async (req, reply) => {
		const membersData = Array.isArray(req.body.members) ? req.body.members : [];
		const normalizedMembers = membersData
			.map(member => ({
				login: typeof member?.login === 'string' ? member.login.trim().toLowerCase() : '',
				role: member?.role
			}))
			.filter(member => member.login);
		const logins = normalizedMembers.map(m => m.login);

		if (normalizedMembers.length > 0 && new Set(logins).size !== logins.length)
			return reply.status(400).send({ error: 'Duplicate logins detected in payload' });

		const users = await Users.find({ login: { $in: logins } }).select('_id team login');
		if (users.length !== normalizedMembers.length)
			return reply.status(400).send({ error: 'One or more users could not be found' });

		const userIds = users.map(u => u._id);
		const newTeam = await Teams.create({
			...req.body,
			name: req.body?.name || "Team-" + Math.random().toString(36).slice(-3).toUpperCase(),
			members: userIds,
			membersCount: userIds.length
		});

		let conflictingIds = [];
		if (userIds.length > 0) {
			const conflictingTeams = await Teams.find({
				_id: { $ne: newTeam._id },
				members: { $in: userIds }
			}).select('_id');
			conflictingIds = conflictingTeams.map(team => team._id);
			if (conflictingIds.length > 0) {
				await Teams.updateMany(
					{ _id: { $in: conflictingIds } },
					{ $pullAll: { members: userIds } }
				);
			}
		}
		await syncMembersCount([...conflictingIds, newTeam._id]);

		if (normalizedMembers.length > 0) {
			const bulkOps = normalizedMembers.map(m => ({
				updateOne: {
					filter: { login: m.login },
					update: { $set: { role: m.role || 'user', team: newTeam._id } }
				}
			}));
			await Users.bulkWrite(bulkOps);
		}

		const populatedTeam = await Teams.findById(newTeam._id).populate('members').lean();
		return reply.status(201).send(populatedTeam);
	});


	fastify.delete('/:id', async (request, reply) => {
		const deletedTeam = await Teams.findByIdAndDelete(request.params.id);
		if (!deletedTeam)
			return reply.status(404).send({ error: 'Team not found' });

		if (Array.isArray(deletedTeam.members) && deletedTeam.members.length > 0) {
			await Users.updateMany(
				{ _id: { $in: deletedTeam.members } },
				{ $set: { team: null, role: 'user' } }
			);
		}

		return deletedTeam;
	});

	fastify.post('/:teamId/members', async (req, reply) => {
		const { login, role } = req.body;
		const { teamId } = req.params;
		const normalizedLogin = typeof login === 'string' ? login.trim().toLowerCase() : '';
		if (!normalizedLogin)
			return reply.status(400).send({ error: 'Login is required' });

		const targetTeam = await Teams.findById(teamId);
		if (!targetTeam) return reply.status(404).send({ error: 'Team not found' });

		const existingMember = await Users.findOne({ login: normalizedLogin });
		if (!existingMember)
			return reply.status(404).send({ error: 'Member not found' });

		await Users.findByIdAndUpdate(
			existingMember._id,
			{ $set: { role: role || 'user', team: targetTeam._id } },
			{ new: true }
		);

		await Teams.findByIdAndUpdate(
			targetTeam._id,
			{ $addToSet: { members: existingMember._id } },
			{ new: true }
		);

		const conflictingTeams = await Teams.find({
			_id: { $ne: targetTeam._id },
			members: existingMember._id
		}).select('_id');
		const conflictingIds = conflictingTeams.map(team => team._id);
		if (conflictingIds.length > 0) {
			await Teams.updateMany(
				{ _id: { $in: conflictingIds } },
				{ $pull: { members: existingMember._id } }
			);
		}

		await syncMembersCount([...conflictingIds, teamId]);
		const refreshedTeam = await Teams.findById(teamId).populate('members').lean();
		return reply.send(refreshedTeam);
	});

	fastify.delete('/:teamId/members/:memberId', async (request, reply) => {
		const { teamId, memberId } = request.params;
		const memberObjectId = new ObjectId(memberId);
		const updatedTeam = await Teams.findByIdAndUpdate(
			teamId,
			{ $pull: { members: memberObjectId } },
			{ new: true }
		);
		if (!updatedTeam)
			return reply.status(404).send({ error: 'Team not found' });

		await Users.findByIdAndUpdate(memberObjectId, { $set: { team: null, role: 'user' } });

		const lingeringTeams = await Teams.find({ members: memberObjectId }).select('_id');
		const lingeringIds = lingeringTeams.map(team => team._id);
		if (lingeringIds.length > 0) {
			await Teams.updateMany(
				{ _id: { $in: lingeringIds } },
				{ $pull: { members: memberObjectId } }
			);
		}

		await syncMembersCount([...lingeringIds, teamId]);
		const refreshedTeam = await Teams.findById(teamId).populate('members').lean();
		return reply.send(refreshedTeam);
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
