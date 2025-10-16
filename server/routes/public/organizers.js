import Users from '../../models/Users.js';

export default async function (fastify, opts) {
	fastify.get('/', async (req, reply) => {
		const loginsAndRoles = [
		];

		const logins = loginsAndRoles.map(u => u.login);

		const users = await Users.find({ login: { $in: logins } })
			.select('first_name last_name avatar_url login')
			.lean();

		const usersMap = Object.fromEntries(users.map(u => [u.login, u]));

		const enriched = loginsAndRoles
		.filter(u => usersMap[u.login])
		.map(u => ({
			role: u.role,
			name: `${usersMap[u.login]?.first_name || ''} ${usersMap[u.login]?.last_name || ''}`,
			avatar_url: usersMap[u.login]?.avatar_url || '',
		}));

		return enriched;
	});
}
