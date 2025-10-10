import mongoose from "mongoose";
const { Schema } = mongoose;

const donationSchema = new Schema(
  {
    ngo_id: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    donor_id: { type: Schema.Types.ObjectId, ref: "User" },
    amountCents: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    note: { type: String, trim: true },
    status: { type: String, enum: ["COMPLETED", "PENDING", "FAILED"], default: "COMPLETED" },
  },
  { timestamps: true }
);

export default mongoose.model("Donation", donationSchema);
