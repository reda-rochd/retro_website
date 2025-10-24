import { randomBytes } from 'crypto';
import GameSession from '../models/GameSession.js';
import Users from '../models/Users.js';

function computeScore(durationSec) {
	const minSec = 30;
	const maxSec = 180;
	const bestPts = 350;
	const worstPts = 5;
	if (durationSec <= minSec) return bestPts;
	if (durationSec >= maxSec) return worstPts;
	const t = (durationSec - minSec) / (maxSec - minSec);
	const pts = bestPts + t * (worstPts - bestPts);
	return Math.round(pts);
}

export default async function (fastify, opts) {
	fastify.post('/start', async (req, reply) => {
		const userId = req.user.userId;
		const tokenId = randomBytes(12).toString('hex');
		const startTime = new Date();
		const payload = { tokenId, startTime: startTime.toISOString(), userId };
		const token = fastify.jwt.sign(payload, { expiresIn: '10m' });
		return { token, startTime: startTime.toISOString() };
	});

	fastify.post('/submit', async (req, reply) => {
		const { token, victory = false } = req.body || {};
		if (!token)
			return reply.code(400).send({ error: 'Missing token' });
		let payload;
		try {
			payload = fastify.jwt.verify(token);
		} catch (err) {
			return reply.code(401).send({ error: 'Invalid or expired token' });
		}
		if (String(payload.userId) !== String(req.user.userId))
			return reply.code(403).send({ error: 'User mismatch' });

		const tokenId = payload.tokenId;
		const start = new Date(payload.startTime);
		const end = new Date();
		if (isNaN(start.getTime()))
			return reply.code(400).send({ error: 'Invalid start timestamp in token' });
		let durationSec = Math.max(0, Math.round((end.getTime() - start.getTime()) / 1000));

		if (!victory)
			return reply.send({ score: 0, durationSec, newBest: false });

		if (durationSec > 3600 || durationSec < 20)
			return reply.code(400).send({ error: 'Unrealistic duration' });

		const score = computeScore(durationSec);

		const existing = await GameSession.findOne({ tokenId });
		if (existing)
			return reply.code(409).send({ error: 'Already submitted' });

		const prevBest = await GameSession.findOne({ userId: req.user.userId }).sort({ score: -1 }).limit(1);
		const prevScore = prevBest ? prevBest.score : 0;
		const delta = Math.max(0, score - prevScore);

		const newBest = score > prevScore;

		if (newBest) {
			await GameSession.create({
				userId: req.user.userId,
				tokenId,
				startTime: start,
				endTime: end,
				durationSec,
				score,
			});
			if (delta > 0) {
				await Users.findByIdAndUpdate(req.user.userId, { $inc: { score: delta } });
			}
		}

		return { score, durationSec, newBest };
	});

	fastify.get('/best', async (req, reply) => {
		const best = await GameSession.findOne({ userId: req.user.userId }).sort({ score: -1 }).limit(1);
		if (!best) return { best: null };
		return { best: { score: best.score, durationSec: best.durationSec, updatedAt: best.updatedAt } };
	});
}
