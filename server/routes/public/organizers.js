import Users from '../../models/Users.js';
import Organizers from '../../models/Organizers.js';

const safeName = (user, fallback = '') => {
	const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
	return fullName || user?.login || fallback;
};

export default async function (fastify, opts) {
	fastify.get('/', async (req, reply) => {
		const organizers = await Organizers.find().sort({ category: 1, login: 1 }).lean();
		if (!organizers.length) return [];

		const logins = [...new Set(organizers.map(o => o.login))];
		const users = await Users.find({ login: { $in: logins } })
			.select('first_name last_name avatar_url login')
			.lean();
		const usersMap = Object.fromEntries(users.map(u => [u.login, u]));

		return organizers
			.map(org => ({
				_id: org._id,
				category: org.category,
				role: org.role,
				login: org.login,
				name: safeName(usersMap[org.login], org.login),
				avatar_url: usersMap[org.login]?.avatar_url || '',
			}))
			.filter(org => org.name);
	});
}
