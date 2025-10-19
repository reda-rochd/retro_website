import Organizers from '../../models/Organizers.js';
import Users from '../../models/Users.js';

const normalizeLogin = (value = '') => value.trim().toLowerCase();
const normalizeText = (value = '') => value.trim();

const safeName = (user, fallback = '') => {
	const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
	return fullName || user?.login || fallback;
};

function mergeWithUser(organizer, usersMap) {
	const user = usersMap[organizer.login];
	return {
		...organizer,
		name: safeName(user, organizer.login),
		avatar_url: user?.avatar_url || '',
	};
}

export default async function (fastify, opts) {
	fastify.get('/', async () => {
		const entries = await Organizers.find().sort({ category: 1, login: 1 }).lean();
		if (!entries.length) return [];
		const logins = [...new Set(entries.map(entry => entry.login))];
		const users = await Users.find({ login: { $in: logins } })
			.select('login first_name last_name avatar_url')
			.lean();
		const usersMap = Object.fromEntries(users.map(user => [user.login, user]));
		return entries.map(entry => mergeWithUser(entry, usersMap));
	});

	fastify.post('/', async (req, reply) => {
		const { login, category, role } = req.body ?? {};
		const normalizedLogin = normalizeLogin(login || '');
		const normalizedCategory = normalizeText(category || '');
		const normalizedRole = normalizeText(role || '');

		if (!normalizedLogin || !normalizedCategory || !normalizedRole) {
			return reply.status(400).send({ error: 'login, category and role are required' });
		}

		const user = await Users.findOne({ login: normalizedLogin })
			.select('login first_name last_name avatar_url')
			.lean();
		if (!user) {
			return reply.status(404).send({ error: 'User not found' });
		}

		const updated = await Organizers.findOneAndUpdate(
			{ login: normalizedLogin, category: normalizedCategory },
			{ $set: { role: normalizedRole } },
			{ upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
		);

		const organizer = updated?.toObject ? updated.toObject() : updated;
		return mergeWithUser(organizer, { [user.login]: user });
	});

	fastify.delete('/:id', async (req, reply) => {
		const deleted = await Organizers.findByIdAndDelete(req.params.id);
		if (!deleted) {
			return reply.status(404).send({ error: 'Organizer not found' });
		}
		return { success: true, id: deleted._id };
	});
}
