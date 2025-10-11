import mongoose from "mongoose";
const { Schema } = mongoose; 

export const PROJECT_STATUSES = ["PLANNED", "ON_GOING", "COMPLETED"];

const projectSchema = new Schema(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        organization: {
            type: Schema.Types.ObjectId,
            ref: "NGOManagerProfile",
        },

        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120,
        },

        status: {
            type: String,
            enum: PROJECT_STATUSES,
            default: "ON_GOING",
            index: true,
        },

        sdg: {
            type: Number,
            required: true,
            min: 1,
            max: 17,
            index: true,
        },

        start_date: { type: Date },

        end_date: { type: Date },

        budget: {
            amount: { type: Number, min: 0, default: 0 },
            currency: { type: String, default: "USD", trim: true, uppercase: true },
        },

        donors: {
            type: [String],
            default: [],
        },

        region: { type: String, trim: true, maxlength: 120 },

        description: { type: String, trim: true, maxlength: 1000 },

        target_beneficiaries: { type: Number, min: 0, default: 0 },

        achieved_beneficiaries: { type: Number, min: 0, default: 0 },
    },
    { timestamps: true }
);

// Helpful unique-ish index to avoid exact duplicates per owner
projectSchema.index({ owner: 1, name: 1 }, { unique: false });

// Validate end date is not before start date
projectSchema.pre("save", function (next) {
  if (this.start_date && this.end_date && this.end_date < this.start_date) {
    return next(new Error("End date cannot be before start date"));
  }
  if (
    typeof this.target_beneficiaries === "number" &&
    typeof this.achieved_beneficiaries === "number" &&
    this.achieved_beneficiaries > this.target_beneficiaries
  ) {
    return next(new Error("Achieved beneficiaries cannot exceed target beneficiaries"));
  }
  next();
});

const Project = mongoose.model("Project", projectSchema);
export default Project;