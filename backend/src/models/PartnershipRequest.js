import mongoose from 'mongoose';

const PartnershipRequestSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  partnerId: { type: mongoose.Schema.Types.ObjectId, required: true },
  partnerType: { type: String, enum: ['NGO', 'Donor', 'Volunteer'], required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
}, { timestamps: true });

export default mongoose.model('PartnershipRequest', PartnershipRequestSchema);
