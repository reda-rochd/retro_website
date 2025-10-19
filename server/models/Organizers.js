import { Schema, model } from 'mongoose';

const organizersSchema = new Schema({
	login: { type: String, required: true },
	category: { type: String, required: true },
	role: { type: String, required: true },
});

organizersSchema.index({ login: 1, category: 1 }, { unique: true });

export default model('Organizers', organizersSchema);
