import { Schema, model } from 'mongoose';

const gameSessionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
    tokenId: { type: String, required: true, unique: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    durationSec: { type: Number, required: true },
    score: { type: Number, required: true },
}, { timestamps: true });

gameSessionSchema.index({ userId: 1, createdAt: -1 });

export default model('GameSession', gameSessionSchema);
