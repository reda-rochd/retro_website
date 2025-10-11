import {Schema, model} from 'mongoose';

const usersSchema = new Schema({
	login: { type: String, required: true, unique: true },
	intra_id: { type: Number, required: true, unique: true },
	first_name: { type: String, default: '' },
	last_name: { type: String, default: '' },
	is_new_student: { type: Boolean, default: true },
	avatar_url: { type: String, default: '' },
	role: { type: String, enum: ['user', 'leader'], default: 'user' },
	team: { type: Schema.Types.ObjectId, ref: 'Teams', default: null },
	score: { type: Number, default: 0 },
});

usersSchema.index({score: -1});

export default model('Users', usersSchema);
