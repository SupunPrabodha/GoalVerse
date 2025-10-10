import mongoose from "mongoose";
const { Schema } = mongoose;

const reportSchema = new Schema(
  {
    ngo_id: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    type: { type: String, default: "FINANCIAL" },
    dueDate: { type: Date },
    submittedAt: { type: Date },
    status: { type: String, enum: ["DUE", "SUBMITTED", "REVIEWED"], default: "DUE" },
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
