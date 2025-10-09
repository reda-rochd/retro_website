export async function authenticate(request, reply) {
	try {
		await request.jwtVerify()
	} catch (err) {
		if (err.code?.startsWith('FST_JWT_')) {
			return reply.code(401).send({ error: 'Unauthorized: Invalid token' })
		}
		return reply.code(500).send({ error: 'Internal server error' })
	}
}

let ADMIN_LOGINS;

const getAdminLogins = () => {
	if (!ADMIN_LOGINS) {
		ADMIN_LOGINS = new Set(
			(process.env.ADMIN_LOGINS || '')
				.split(',')
				.map(s => s.trim().replace(/^['"]|['"]$/g, ''))
				.filter(Boolean)
		);
	}
	return ADMIN_LOGINS;
};

export async function checkAdmin(request, reply) {
	if (!request.user)
		return reply.code(401).send({ error: 'Unauthorized: No user info' });

	const admins = getAdminLogins();
	if (!admins.has(request.user.login))
		return reply.code(403).send({ error: 'Forbidden: Admins only' });
}

