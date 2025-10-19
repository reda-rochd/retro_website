import {Schema, model} from 'mongoose';

const eventsSchema = new Schema({
	name: {type: String, required: true},
	startAt: {type: Date, required: true},
	endAt: {type: Date, required: true},
	description: {type: String, required: true},
	location: {type: String, required: true},
	games: [{
		name: {type: String, required: true},
		game_master: {type: Schema.Types.ObjectId, ref: 'Users', required: true},
		score: {type: Number, default: 0, required: true},
		score_mode: {type: String, enum: ['team-only', 'aggregate', 'collective'], default: 'team-only'},
	}],
	createdAt: {type: Date, default: Date.now},
});

eventsSchema.index({ startAt: -1 });

export default model('Events', eventsSchema);
