import mongoose from "mongoose";
const { Schema } = mongoose;

const schema = new Schema({
  key: { type: String, unique: true, index: true },  // e.g. "project:<id>" or "org:<id>"
  text: { type: String, default: "" },
  meta: { type: Object, default: {} },               // optional (model, tokens, etc.)
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("AISummary", schema);
