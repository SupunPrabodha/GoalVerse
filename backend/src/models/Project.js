import mongoose from "mongoose";
const { Schema } = mongoose; 

export const PROJECT_STATUSES = ["PLANNED", "ON_GOING", "COMPLETED"];

const expenseCategorySchema = new Schema(
  {
    // keep ObjectId for stable updates from client
    _id: { type: Schema.Types.ObjectId, auto: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    allocated: { type: Number, min: 0, default: 0 },
    actual: { type: Number, min: 0, default: 0 },
     // core vs custom
    type: { type: String, enum: ["CORE", "CUSTOM"], default: "CUSTOM" },
    // only for CORE rows (helps you find them quickly)
    code: {
     type: String,
     enum: ["PROGRAM_IMPLEMENTATION", "ADMINISTRATIVE_COSTS", "EMERGENCY_FUND"],
   },
   // prevent deletion/rename in update flows if you want
   isLocked: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false }, // optional
  },
  { _id: true, timestamps: true }
);

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

        expenses: { type: [expenseCategorySchema], default: [] },
    },
    { timestamps: true }
);

const CORE_ROWS = [
  { code: "PROGRAM_IMPLEMENTATION",  name: "Program Implementation"  },
  { code: "ADMINISTRATIVE_COSTS",    name: "Administrative Costs"    },
  { code: "EMERGENCY_FUND",          name: "Emergency Fund"          },
];


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

// 🆕 Computed totals
projectSchema.virtual("allocated_total").get(function () {
  return (this.expenses || []).reduce((sum, e) => sum + (e.allocated || 0), 0);
});

projectSchema.virtual("remaining").get(function () {
  const total = this.budget?.amount || 0;
  return total - this.allocated_total;
});

projectSchema.set("toJSON", { virtuals: true });
projectSchema.set("toObject", { virtuals: true });

// 🆕 Validation guards
projectSchema.pre("validate", function (next) {
  // Ensure three core categories exist exactly once
  const list = this.expenses || (this.expenses = []);
  for (const core of CORE_ROWS) {
    const has = list.some(
      (e) => e.type === "CORE" && e.code === core.code
    );
    if (!has) {
      list.push({
        name: core.name,
        type: "CORE",
        code: core.code,
        isLocked: true,
        allocated: 0,
        actual: 0,
      });
    }
  }
  // dates
  if (this.start_date && this.end_date && this.end_date < this.start_date) {
    return next(new Error("End date cannot be before start date"));
  }
  // beneficiaries
  if (
    typeof this.target_beneficiaries === "number" &&
    typeof this.achieved_beneficiaries === "number" &&
    this.achieved_beneficiaries > this.target_beneficiaries
  ) {
    return next(new Error("Achieved beneficiaries cannot exceed target beneficiaries"));
  }
  // unique category names (case-insensitive) within this project
  const names = (this.expenses || []).map((e) => (e.name || "").trim().toLowerCase());
  const set = new Set(names);
  if (set.size !== names.length) {
    return next(new Error("Expense category names must be unique within the project"));
  }
  // actual ≤ allocated per category
  for (const e of this.expenses || []) {
    if (e.actual > e.allocated) {
      return next(new Error(`Actual cannot exceed allocated for category "${e.name}"`));
    }
  }
  // sum(allocated) ≤ budget.amount
  const allocatedTotal = (this.expenses || []).reduce((s, e) => s + (e.allocated || 0), 0);
  if ((this.budget?.amount || 0) < allocatedTotal) {
    return next(new Error("Total allocated across categories exceeds the project budget"));
  }
  next();
});

const Project = mongoose.model("Project", projectSchema);
export default Project;