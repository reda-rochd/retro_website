import assert from 'assert';

async function request(method, path, body) {
	const res = await fetch(`http://localhost:3001${path}`, {
		method,
		headers: { 'Content-Type': 'application/json' },
		body: body ? JSON.stringify(body) : undefined,
	});
	const json = await res.json().catch(() => ({}));
	return { status: res.status, json };
}

async function setupUsers() {
	const users = ['alice', 'bob', 'charlie', 'david'];
	for (const login of users) {
		await request('POST', '/api/users', { login });
	}
}

async function teardownUsers() {
	const users = ['alice', 'bob', 'charlie', 'david'];
	for (const login of users) {
		await request('DELETE', `/api/users/${login}`);
	}
}

async function testTeams() {
	const team1 = { members: [{ login: 'alice' }, { login: 'bob' }] };
	const team2 = { members: [{ login: 'charlie' }] };

	const createTeam1 = await request('POST', '/api/teams', team1);
	assert.strictEqual(createTeam1.status, 201);
	assert.ok(createTeam1.json._id && Array.isArray(createTeam1.json.members));

	const team1Id = createTeam1.json._id;

	const createTeam2 = await request('POST', '/api/teams', team2);
	assert.strictEqual(createTeam2.status, 201);
	const team2Id = createTeam2.json._id;

	const { json: teams } = await request('GET', '/api/teams');
	assert(Array.isArray(teams));
	assert(teams.some(t => t._id === team1Id));
	assert(teams.some(t => t._id === team2Id));

	const addMember = await request('POST', `/api/teams/${team1Id}/members/david`, {});
	assert.strictEqual(addMember.status, 200);
	assert.ok(addMember.json.members.some(m => m.login === 'david'));
	const davidId = addMember.json.members.find(m => m.login === 'david')._id;

	const deleteMember = await request('DELETE', `/api/teams/${team1Id}/members/${davidId}`, {});
	assert.strictEqual(deleteMember.status, 200);
	assert.ok(!deleteMember.json.members.some(m => m.login === 'david'));

	const nonExistent = await request('DELETE', '/api/teams/aaaaaaaaaaaaaaaaaaaaaaaa/members/aaaaaaaaaaaaaaaaaaaaaaaa');
	assert.strictEqual(nonExistent.status, 404);
}

async function testEvents() {
	const event1 = {
		name: 'Birthday Party',
		startAt: '2024-06-15T10:00:00.000Z',
		endAt: '2024-06-15T12:00:00.000Z',
		description: 'Fun celebration',
		location: '123 Party St'
	};
	const event2 = {
		name: 'Team Meeting',
		startAt: '2024-06-20T09:00:00.000Z',
		endAt: '2024-06-20T10:30:00.000Z',
		description: 'Weekly sync',
		location: 'Office'
	};

	const createEvent1 = await request('POST', '/api/events', event1);
	assert.strictEqual(createEvent1.status, 200);
	const event1Id = createEvent1.json._id;

	const createEvent2 = await request('POST', '/api/events', event2);
	assert.strictEqual(createEvent2.status, 200);
	const event2Id = createEvent2.json._id;

	const { json: events } = await request('GET', '/api/events');
	assert(Array.isArray(events));
	assert(events.some(e => e._id === event1Id));
	assert(events.some(e => e._id === event2Id));

	const update = await request('PUT', `/api/events/${event1Id}`, { description: 'Updated desc' });
	assert.strictEqual(update.status, 200);
	assert.strictEqual(update.json.description, 'Updated desc');

	const bad = await request('PUT', '/api/events/aaaaaaaaaaaaaaaaaaaaaaaa', { name: 'none' });
	assert.strictEqual(bad.status, 404);
}

(async () => {
	try {
		await setupUsers();
		await testTeams();
		await testEvents();
		console.log('✅ All endpoint tests passed successfully');
	} catch (err) {
		console.error('❌ Test failed:', err.message);
		process.exit(1);
	} finally {
		await teardownUsers();
	}
})();

