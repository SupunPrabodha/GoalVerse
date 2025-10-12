// backend/src/models/Donation.js
import mongoose from 'mongoose';

const DonationSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  amountCents: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  note: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Donation', DonationSchema);