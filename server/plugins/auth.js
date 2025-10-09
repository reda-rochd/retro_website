const ADMIN_LOGINS = new Set((process.env.ADMIN_LOGINS || '').split(',').map(s => s.trim()).filter(Boolean))

export default async function (fastify, opts) {
	fastify.decorate('authenticate', async function (request, reply) {
		try {
			await request.jwtVerify()
		} catch (err) {
			if (err.code?.startsWith('FST_JWT_')) {
				return reply.code(401).send({ error: 'Unauthorized: Invalid token' })
			}
			return reply.code(500).send({ error: 'Internal server error' })
		}
	})

	fastify.decorate('checkAdmin', async function (request, reply) {
		if (!request.user) {
			return reply.code(401).send({ error: 'Unauthorized: No user info' })
		}
		if (!ADMIN_LOGINS.has(request.user.login)) {
			return reply.code(403).send({ error: 'Forbidden: Admins only' })
		}
	})
}
