import Teams from '../../models/Teams.js';
import Users from '../../models/Users.js';

export default async function teams(fastify) {
	fastify.get('/:teamName', async (request, reply) => {
		let { teamName } = request.params;
		teamName = typeof teamName === 'string' ? teamName.trim() : '';

		if (!teamName)
			return reply.status(400).send({ error: 'Team name is required' });

		const team = await Teams.findOne({ name: teamName })
			.select('name score avatar_url members -_id')
			.populate('members', 'login first_name last_name avatar_url score role -_id')
			.lean();

		if (!team)
			return reply.status(404).send({ error: 'Team not found' });

		return reply.send(team);
	});
}
