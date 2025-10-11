import mongoose from "mongoose";
const { Schema } = mongoose;

const partnershipSchema = new Schema(
  {
    ngo_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    // Prefer linking to a real user account as the partner when available
    partner_user_id: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    // Backward compatibility: older Partner catalog entries (optional)
    partner_id: { type: Schema.Types.ObjectId, ref: 'Partner', index: true },
    status: { type: String, enum: ['REQUESTED','ACTIVE','REJECTED','PENDING_REPORT'], default: 'REQUESTED' },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model('Partnership', partnershipSchema);
