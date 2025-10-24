import Points from '../../models/Points.js';
import Users from '../../models/Users.js';
import Teams from '../../models/Teams.js';
import Events from '../../models/Events.js';

export default async function (fastify, opts) {
	fastify.get('/', async (req, reply) => {
		const results = await Points.aggregate([
			{ $sort: { createdAt: -1 } },
			{ $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
			{ $lookup: { from: 'teams', localField: 'teamId', foreignField: '_id', as: 'team' } },
			{ $lookup: { from: 'events', localField: 'eventId', foreignField: '_id', as: 'event' } },
			{ $unwind: '$user' },
			{ $unwind: '$team' },
			{ $unwind: '$event' },
			{
				$addFields: {
					game: {
					$first: {
						$filter: {
						input: '$event.games',
						as: 'g',
						cond: { $eq: ['$$g._id', '$gameId'] }
						}
					}
					}
				}
			},
			{
				$project: {
					userLogin: '$user.login',
					teamName: '$team.name',
					eventName: '$event.name',
					gameName: '$game.name',
					gameMode: '$game.gameMode',
					points: 1,
					createdAt: 1
				}
			}
		]);
		return results;
	});

	fastify.delete('/:id', async (req, reply) => {
		const { id } = req.params;
		const entry = await Points.findById(id);
		if (!entry) return reply.status(404).send({ error: 'Points record not found' });

		const updates = [];
		const points = Number(entry.points) || 0;
		if (points !== 0) {
			if (entry.userAwarded && entry.userId) {
				updates.push(Users.findByIdAndUpdate(entry.userId, { $inc: { score: -points } }));
			}
			if (entry.teamAwarded && entry.teamId) {
				updates.push(Teams.findByIdAndUpdate(entry.teamId, { $inc: { score: -points } }));
			}
		}

		await Promise.allSettled(updates);
		await Points.deleteOne({ _id: id });
		return { success: true };
	});
}
