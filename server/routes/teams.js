import Teams from '../models/Teams.js';
import Users from '../models/Users.js';

export default async function teams(fastify, opts) {
	fastify.put('/:teamId/name', async (request, reply) => {
		const { teamId } = request.params;
		const { name } = request.body || {};

		const trimmedName = typeof name === 'string' ? name.trim() : '';
		if (!trimmedName)
			return reply.status(400).send({ error: 'Team name is required' });

		if (trimmedName.length < 3 || trimmedName.length > 30)
			return reply.status(400).send({ error: 'Team name must be between 3 and 30 characters long' });

		const user = await Users.findById(request.user.userId).select('role team');
		if (!user)
			return reply.status(404).send({ error: 'User not found' });

		if (user.role !== 'leader')
			return reply.status(403).send({ error: 'Only team leaders can rename the team' });

		if (!user.team || user.team.toString() !== teamId)
			return reply.status(403).send({ error: 'You can only rename your own team' });

		const updatedTeam = await Teams.findByIdAndUpdate(
			teamId,
			{ name: trimmedName },
			{ new: true, runValidators: true }
		).lean();

		if (!updatedTeam)
			return reply.status(404).send({ error: 'Team not found' });

		return reply.send({ team: { _id: updatedTeam._id, name: updatedTeam.name } });
	});
}
