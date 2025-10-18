import Points from '../models/Points.js';
import Events from '../models/Events.js';
import Teams from '../models/Teams.js';
import Users from '../models/Users.js';

const SCORE_MODES = {
	TEAM_ONLY: 'team-only',
	AGGREGATE: 'aggregate',
	COLLECTIVE: 'collective'
};

const VALID_SCORE_MODES = new Set(Object.values(SCORE_MODES));

export default async function (fastify, options) {
	fastify.post('/', async (request, reply) => {
		const { eventId, gameId, userId } = request.body;
		if (!eventId || !gameId || !userId)
			return reply.status(400).send({ error: 'Missing required fields' });

		const user = await Users.findById(userId).populate('team');
		if (!user) return reply.status(404).send({ error: 'User not found' });

		const team = user.team;
		if (!team) return reply.status(404).send({ error: 'User is not assigned to a team' });

		const event = await Events.findById(eventId);
		if (!event) return reply.status(404).send({ error: 'Event not found' });

		const game = event.games?.id(gameId);
		if (!game) return reply.status(404).send({ error: 'Game not found for this event' });

		const scoreMode = game.score_mode || SCORE_MODES.TEAM_ONLY;
		if (!VALID_SCORE_MODES.has(scoreMode))
			return reply.status(500).send({ error: 'Invalid score mode configuration' });

		const baseScore = game.score ?? 0;

		const existingUserAward = await Points.findOne({ eventId, gameId, userId });
		if (existingUserAward) {
			return reply.status(409).send({
				error: 'User has already been awarded points for this game',
				success: false
			});
		}

		let teamAwarded = false;
		let userAwarded = false;

		switch (scoreMode) {
			case SCORE_MODES.TEAM_ONLY: {
				const alreadyAwarded = await Points.findOne({ eventId, gameId, teamId: team._id, scoreMode: SCORE_MODES.TEAM_ONLY });
				if (alreadyAwarded)
					return reply.status(409).send({
						error: 'Points for this game have already been awarded to this team',
						success: false
					});
				teamAwarded = true;
				break;
			}
			case SCORE_MODES.COLLECTIVE: {
				const teamHit = await Points.findOne({ eventId, gameId, teamId: team._id, scoreMode: SCORE_MODES.COLLECTIVE, teamAwarded: true });
				teamAwarded = !teamHit;
				userAwarded = true;
				break;
			}
			case SCORE_MODES.AGGREGATE: {
				teamAwarded = true;
				userAwarded = true;
				break;
			}
			default:
				return reply.status(500).send({ error: 'Unsupported score mode' });
		}

		try {
			await Points.create({
				eventId,
				gameId,
				userId,
				teamId: team._id,
				points: baseScore,
				scoreMode,
				userAwarded,
				teamAwarded
			});
		} catch (e) {
			if (e.code === 11000)
				return reply.status(409).send({
					error: 'Points for this game have already been awarded',
					success: false
				});
			request.log.error(e, 'points:create');
			return reply.status(500).send({ error: 'Internal server error' });
		}

		const updateOperations = [];
		if (teamAwarded) updateOperations.push(Teams.findByIdAndUpdate(team._id, { $inc: { score: baseScore } }));
		if (userAwarded) updateOperations.push(Users.findByIdAndUpdate(userId, { $inc: { score: baseScore } }));
		await Promise.all(updateOperations);

		return reply.status(201).send({ success: true, teamAwarded, userAwarded, scoreMode });
	});
}
