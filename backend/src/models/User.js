// ESM
import mongoose from "mongoose";

export const ROLES = [
  "NGO_MANAGER",
  "DONOR",
  "VOLUNTEER",
];

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ROLES, default: "DONOR" },

    // organizationName: { type: String, trim: true },
    // logoUrl: { type: String },
    // sdgs: [{ type: Number, min: 1, max: 17 }],

    isOrgProfileComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.methods.toPublic = function () {
  const {
    _id,
    fullName,
    email,
    role,
    //organizationName,
    //logoUrl,
    //sdgs,
    isOrgProfileComplete,
    createdAt,
  } = this;
  return {
    id: _id,
    fullName,
    email,
    role,
    //organizationName,
    //logoUrl,
    //sdgs,
    isOrgProfileComplete,
    createdAt,
  };
};

const User = mongoose.model("User", userSchema);
export default User;
