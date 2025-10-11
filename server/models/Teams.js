import {Schema, model} from 'mongoose';

const teamsSchema = new Schema({
	name: {type: String, required: true},
	members: [{type: Schema.Types.ObjectId, ref: 'Users'}],
	membersCount: {type: Number, default: 0},
	score: {type: Number, default: 0},
	avatar_url: {type: String, default: ''},
}, {timestamps: true});

teamsSchema.index({score: -1});

export default model('Teams', teamsSchema);
