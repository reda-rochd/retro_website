import {Schema, model} from 'mongoose';

const teamsSchema = new Schema({
	name: {type: String, required: true},
	members: [{type: Schema.Types.ObjectId, ref: 'Users'}],
	membersCount: {type: Number, default: 0}
}, {timestamps: true});

export default model('Teams', teamsSchema);
