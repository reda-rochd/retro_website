import {Schema, model} from 'mongoose';

const pointSchema = new Schema({
	eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
	gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true },
	userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
	points: { type: Number, default: 0, required: true },
	solo: { type: Boolean, default: false},
}, { timestamps: true });

pointSchema.index(
  { eventId: 1, gameId: 1, teamId: 1 },
  { unique: true }
);

export default model('Points', pointSchema);
