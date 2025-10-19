import Events from '../../models/Events.js';
import Users from '../../models/Users.js';

const VALID_SCORE_MODES = new Set(['team-only', 'aggregate', 'collective']);
const SCORE_MODE_FALLBACK = 'team-only';
const DAY_MS = 24 * 60 * 60 * 1000;

function normalizeGames(games = []) {
	return games.map(rawGame => {
		const game = rawGame?.toObject ? rawGame.toObject() : { ...rawGame };
		const derivedMode = VALID_SCORE_MODES.has(game.score_mode)
			? game.score_mode
			: SCORE_MODE_FALLBACK;
		const sanitized = { ...game, score_mode: derivedMode };
		if (sanitized.score !== undefined) {
			sanitized.score = Number(sanitized.score) || 0;
		}
		return sanitized;
	});
}

async function mapGameMasters(games = []) {
	const normalized = normalizeGames(games);
	const logins = normalized.map(g => g.game_master).filter(login => typeof login === 'string');
	if (logins.length === 0) return normalized;
	const users = await Users.find({ login: { $in: logins } });
	const loginToId = Object.fromEntries(users.map(u => [u.login, u._id]));

	for (const game of normalized) {
		if (typeof game.game_master !== 'string') continue;
		if (!loginToId[game.game_master]) throw new Error('User not found');
		game.game_master = loginToId[game.game_master];
	}
	return normalized;
}

async function gamesWithLogin(games = []) {
	const normalized = normalizeGames(games);
	const populated = await Promise.all(
		normalized.map(async g => {
			if (typeof g.game_master === 'string') return g;
			const user = await Users.findById(g.game_master, 'login').lean();
			return { ...g, game_master: user ? user.login : g.game_master };
		})
	);
	return populated;
}

function extractDatePortion(value) {
	if (typeof value === 'string') return value.slice(0, 10);
	if (value instanceof Date) return value.toISOString().slice(0, 10);
	return null;
}

function ensureEndFollowsStart(start, end, rawStart, rawEnd) {
	if (end < start) {
		const startDay = extractDatePortion(rawStart);
		const endDay = extractDatePortion(rawEnd);
		if (startDay && endDay && startDay === endDay) {
			return new Date(end.getTime() + DAY_MS);
		}
	}
	return end;
}
export default async function (fastify, opts) {
	fastify.get('/', async () => {
		const events = await Events.find().lean();
		return Promise.all(events.map(async ev => ({
			...ev,
			games: await gamesWithLogin(ev.games)
		})));
	});

	fastify.post('/', async (req, reply) => {
		if (req.body.games) req.body.games = await mapGameMasters(req.body.games);
		const { startAt, endAt } = req.body;
		if (!startAt) return reply.status(400).send({ error: 'startAt is required' });
		if (!endAt) return reply.status(400).send({ error: 'endAt is required' });
		const start = new Date(startAt);
		let end = new Date(endAt);
		if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
			return reply.status(400).send({ error: 'Invalid startAt or endAt value' });
		}
		end = ensureEndFollowsStart(start, end, startAt, endAt);
		if (end <= start) {
			return reply.status(400).send({ error: 'endAt must be after startAt' });
		}
		req.body.startAt = start;
		req.body.endAt = end;
		const event = await Events.create(req.body);
		const evObj = event.toObject();
		evObj.games = await gamesWithLogin(evObj.games);
		return evObj;
	});

	fastify.put('/:id', async (req, reply) => {
		const existing = await Events.findById(req.params.id).lean();
		if (!existing) return reply.status(404).send({ error: 'Event not found' });
		if (req.body.games) req.body.games = await mapGameMasters(req.body.games);
		const startAtCandidate = req.body.startAt ?? existing.startAt;
		const endAtCandidate = req.body.endAt ?? existing.endAt;
		if (!startAtCandidate) return reply.status(400).send({ error: 'startAt is required' });
		if (!endAtCandidate) return reply.status(400).send({ error: 'endAt is required' });
		const start = new Date(startAtCandidate);
		let end = new Date(endAtCandidate);
		if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
			return reply.status(400).send({ error: 'Invalid startAt or endAt value' });
		}
		end = ensureEndFollowsStart(start, end, req.body.startAt ?? existing.startAt, req.body.endAt ?? existing.endAt);
		if (end <= start) {
			return reply.status(400).send({ error: 'endAt must be after startAt' });
		}
		if (req.body.startAt !== undefined) req.body.startAt = start;
		if (req.body.endAt !== undefined) req.body.endAt = end;
		const updated = await Events.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
		if (!updated) return reply.status(404).send({ error: 'Event not found' });
		const evObj = updated.toObject();
		evObj.games = await gamesWithLogin(evObj.games);
		return evObj;
	});

	fastify.delete('/:id', async (req, reply) => {
		const deleted = await Events.findByIdAndDelete(req.params.id);
		if (!deleted) return reply.status(404).send({ error: 'Event not found' });
		return { success: true, id: deleted._id };
	});
}
