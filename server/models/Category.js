import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 40 },
  type: { type: String, enum: ["income", "expense"], default: "expense" }
}, { timestamps: true });

categorySchema.index({ user: 1, name: 1, type: 1 }, { unique: true });
export default mongoose.model("Category", categorySchema);
