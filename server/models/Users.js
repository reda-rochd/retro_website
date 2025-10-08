import {Schema, model} from 'mongoose';

const usersSchema = new Schema({
	login: { type: String, required: true, unique: true },
	firstName: { type: String, default: '' },
	lastName: { type: String, default: '' },
	avatarUrl: { type: String, default: '' },
	team: { type: Schema.Types.ObjectId, ref: 'Teams', default: null }
});

export default model('Users', usersSchema);
