import mongoose from "mongoose";
const { Schema } = mongoose;

const evidenceSchema = new Schema(
  {
    ngo_id: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    filename: { type: String, required: true },
    originalname: { type: String },
    mimeType: { type: String },
    type: { type: String, enum: ["photo", "video", "document"], default: "document" },
    status: { type: String, enum: ["verified", "pending", "flagged"], default: "pending" },
    amountCents: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Evidence", evidenceSchema);
