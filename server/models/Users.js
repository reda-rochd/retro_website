import {Schema, model} from 'mongoose';

const usersSchema = new Schema({
	login: { type: String, required: true, unique: true },
	intra_id: { type: Number, required: true, unique: true },
	first_name: { type: String, default: '' },
	last_name: { type: String, default: '' },
	avatar_url: { type: String, default: '' },
	role: { type: String, enum: ['user'], default: 'user' },
	team: { type: Schema.Types.ObjectId, ref: 'Teams', default: null }
});

export default model('Users', usersSchema);
