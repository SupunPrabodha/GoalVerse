import mongoose from "mongoose";
const { Schema } = mongoose;

const volunteerProfileSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    profile_picture: {
      type: String, // URL or file path served from /uploads or a CDN
      trim: true,
    },
    age: {
      type: Number,
      min: 15,
      max: 100,
    },
    skills: {
      type: [String], // e.g., ["Data Entry", "Fieldwork"]
      default: [],
    },
    district: {
      type: String,
      trim: true,
    },
    availability: {
      type: String,
      enum: ["Full-time", "Part-time", "Occasional"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("VolunteerProfile", volunteerProfileSchema);
