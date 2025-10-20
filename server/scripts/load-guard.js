#!/usr/bin/env node

// Periodically promotes/demotes Cloudflare security level based on host load.
import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';

const fetchFn = globalThis.fetch ?? (await import('node-fetch')).default;

const CF_SECURITY_HIGH = 'under_attack';
const CF_SECURITY_NORMAL = 'medium';
const CLOUDFLARE_TOKEN = 'XUNwjbwE_JF6slBLxbveDUQBycZig7_hIXGL5xln';
const CLOUDFLARE_ZONE_ID = 'f5249b01785938fffc4e5bfe5288e3f5';
const cpuCount = Math.max(os.cpus()?.length || 1, 1);
const thresholdRatio = 0.6;
const threshold = thresholdRatio * cpuCount;
const intervalIndex = 1;
const breachTarget = 2;
const recoveryTarget = 3;
const statePath = path.join(os.tmpdir(), 'cloudflare-load-guard.json');
const POLL_INTERVAL_MS = 30_000;

async function fetchCurrentSecurityLevel() {
	const res = await fetchFn(`https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/settings/security_level`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${CLOUDFLARE_TOKEN}`,
		},
	});

	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Cloudflare API error (${res.status}): ${text}`);
	}

	const body = await res.json();
	return body?.result?.value ?? CF_SECURITY_NORMAL;
}

async function ensureState() {
	try {
		const raw = fs.readFileSync(statePath, 'utf8');
		return JSON.parse(raw);
	} catch (_) {
		try {
			const remoteLevel = await fetchCurrentSecurityLevel();
			return { currentLevel: remoteLevel, breachStreak: 0, recoveryStreak: 0 };
		} catch (error) {
			console.warn(`Falling back to default security level: ${error.message || error}`);
			return { currentLevel: CF_SECURITY_NORMAL, breachStreak: 0, recoveryStreak: 0 };
		}
	}
}

function saveState(state) {
	fs.writeFileSync(statePath, JSON.stringify(state));
}

async function updateSecurityLevel(targetLevel) {
	const res = await fetchFn(`https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/settings/security_level`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${CLOUDFLARE_TOKEN}`,
		},
		body: JSON.stringify({ value: targetLevel }),
	});

	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Cloudflare API error (${res.status}): ${text}`);
	}
}

function isAboveThreshold(loadAvg) {
	return loadAvg > threshold;
}


async function runCycle() {
	const loadAvg = os.loadavg()[intervalIndex];
	const state = await ensureState();
	const above = isAboveThreshold(loadAvg);

	if (above) {
		state.breachStreak += 1;
		state.recoveryStreak = 0;
		if (state.currentLevel !== CF_SECURITY_HIGH && state.breachStreak >= breachTarget) {
			await updateSecurityLevel(CF_SECURITY_HIGH);
			state.currentLevel = CF_SECURITY_HIGH;
			console.log(`Raised Cloudflare security level to ${CF_SECURITY_HIGH}; load=${loadAvg.toFixed(2)} threshold=${threshold.toFixed(2)}`);
		}
	} else {
		state.recoveryStreak += 1;
		state.breachStreak = 0;
		if (state.currentLevel !== CF_SECURITY_NORMAL && state.recoveryStreak >= recoveryTarget) {
			await updateSecurityLevel(CF_SECURITY_NORMAL);
			state.currentLevel = CF_SECURITY_NORMAL;
			console.log(`Restored Cloudflare security level to ${CF_SECURITY_NORMAL}; load=${loadAvg.toFixed(2)} threshold=${threshold.toFixed(2)}`);
		}
	}

	saveState(state);
}

async function loop() {
	try {
		await runCycle();
	} catch (error) {
		console.error(error.message || error);
	}

	setTimeout(loop, POLL_INTERVAL_MS);
}

loop();
