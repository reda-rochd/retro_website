import {Schema, model} from 'mongoose';

const teamsSchema = new Schema({
  name: {type: String, required: true},
  members: [{type: Schema.Types.ObjectId, ref: 'Users'}],
  createdAt: {type: Date, default: Date.now},
});

export default model('Teams', teamsSchema);
