import mongoose from "mongoose";
const { Schema } = mongoose;

const partnerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["NGO", "DONOR", "GOVERNMENT"], required: true },
    focus: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    recommended: { type: Boolean, default: false },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
  },
  { timestamps: true }
);

export default mongoose.model("Partner", partnerSchema);
