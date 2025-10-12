import mongoose from "mongoose";
const { Schema } = mongoose;

const donorProfileSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    organization_name: {
      type: String,
      trim: true,
    },
    organization_picture: {
      type: String, // URL or file path served from /uploads or a CDN
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    funding_focus: {
      type: [String], // e.g., ["Education", "Climate Action"]
      default: [],
    },
    total_contributed: {
      type: Number,
      default: 0.0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("DonorProfile", donorProfileSchema);
