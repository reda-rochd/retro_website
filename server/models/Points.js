import {Schema, model} from 'mongoose';

const pointSchema = new Schema({
	eventId: { type: Schema.Types.ObjectId, ref: 'Events', required: true },
	gameId: { type: Schema.Types.ObjectId, required: true },
	userId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
	teamId: { type: Schema.Types.ObjectId, ref: 'Teams', required: true },
	points: { type: Number, default: 0, required: true },
	scoreMode: { type: String, enum: ['team-only', 'aggregate', 'collective'], default: 'team-only' },
	userAwarded: { type: Boolean, default: false },
	teamAwarded: { type: Boolean, default: false },
}, { timestamps: true });

pointSchema.index({ eventId: 1, gameId: 1, userId: 1 }, { unique: true });

pointSchema.index(
	{ eventId: 1, gameId: 1, teamId: 1 },
	{ unique: true, partialFilterExpression: { scoreMode: 'team-only' } }
);

pointSchema.index(
	{ eventId: 1, gameId: 1, teamId: 1 },
	{ unique: true, partialFilterExpression: { scoreMode: 'collective', teamAwarded: true } }
);

export default model('Points', pointSchema);
