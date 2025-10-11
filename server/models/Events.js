import {Schema, model} from 'mongoose';

const eventsSchema = new Schema({
	name: {type: String, required: true},
	date: {type: Date, required: true},
	description: {type: String, required: true},
	location: {type: String, required: true},
	games: [{
		name: {type: String, required: true},
		game_master: {type: Schema.Types.ObjectId, ref: 'Users', required: true},
		score: {type: Number, default: 0, required: true},
		solo_game: {type: Boolean, default: false},
	}],
	createdAt: {type: Date, default: Date.now},
});

export default model('Events', eventsSchema);
