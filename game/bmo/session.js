import * as Comm from './comm.js';

const state = {
	token: null,
	start: null,
	submitted: false,
	best: null
};

export function resetRun() {
	state.token = null;
	state.start = null;
	state.submitted = false;
}

export function beginRun() {
	state.submitted = false;
	state.start = new Date();
}

export async function requestStartToken() {
	try {
		const payload = await Comm.requestStartToken();
		state.token = payload?.token ?? null;
		state.start = payload?.startTime ? new Date(payload.startTime) : (state.start || new Date());
		return { token: state.token, startTime: state.start };
	} catch (err) {
		state.token = null;
		return null;
	}
}

function getDurationSec() {
	if (!state.start)
		return 0;
	const start = state.start instanceof Date ? state.start : new Date(state.start);
	if (Number.isNaN(start.getTime()))
		return 0;
	return Math.max(0, Math.round((Date.now() - start.getTime()) / 1000));
}

export async function submitIfNeeded({ victory = false } = {}) {
	if (state.submitted)
		return null;
	state.submitted = true;
	const durationSec = getDurationSec();
	try {
		const payload = await Comm.requestSubmit(state.token, victory);
		if (payload?.newBest)
			state.best = { score: payload.score, durationSec: payload.durationSec };
		return payload || null;
	} catch (err) {
		state.submitted = false;
		return null;
	}
}

export async function fetchBestSession() {
	const best = await Comm.requestBest();
	if (best)
		state.best = best;
	return state.best;
}

export function getBestSession() {
	return state.best;
}

export function setToken(token) {
	state.token = token;
}

export function setStart(startTime) {
	state.start = startTime instanceof Date ? startTime : (startTime ? new Date(startTime) : null);
}

export default {
	resetRun,
	beginRun,
	requestStartToken,
	submitIfNeeded,
	fetchBestSession,
	getBestSession,
	setToken,
	setStart
};
