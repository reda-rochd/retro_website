import {Schema, model} from 'mongoose';

const eventsSchema = new Schema({
	name: {type: String, required: true},
	date: {type: Date, required: true},
	description: {type: String, required: true},
	location: {type: String, required: true},
	createdAt: {type: Date, default: Date.now},
	games: [{
		name: {type: String, required: true},
		score: {type: Number, required: true},
	}],
});

export default model('Events', eventsSchema);
