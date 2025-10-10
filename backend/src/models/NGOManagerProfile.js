import mongoose from "mongoose";
const { Schema } = mongoose;

const ngoManagerProfileSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,       // one profile per user
      index: true,
    },
    organization_name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    organization_logo: {
      type: String,       // URL or file path served from /uploads or a CDN
      trim: true,
    },
    contact_number: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    // NEW: store selected SDGs here too
    sdgs: {
      type: [Number],
      default: [],
      validate: {
        validator: (arr) =>
          Array.isArray(arr) &&
          arr.every((n) => Number.isInteger(n) && n >= 1 && n <= 17),
        message: "SDGs must be integers between 1 and 17.",
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("NGOManagerProfile", ngoManagerProfileSchema);

