import mongoose from "mongoose";
const { Schema } = mongoose;

const campaignSchema = new Schema(
  {
    ngo_id: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, trim: true, default: "General" },
    budgetCents: { type: Number, default: 0 },
    spentCents: { type: Number, default: 0 },
    status: { type: String, enum: ["ACTIVE", "PROPOSAL", "DRAFT"], default: "DRAFT" },
  },
  { timestamps: true }
);

export default mongoose.model("Campaign", campaignSchema);
