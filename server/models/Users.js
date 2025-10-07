import {Schema, model} from 'mongoose';

const usersSchema = new Schema({
	login: { type: String, required: true, unique: true },
	team: { type: Schema.Types.ObjectId, ref: 'Teams', default: null }
});

export default model('Users', usersSchema);
