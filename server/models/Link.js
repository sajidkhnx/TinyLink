import mongoose from "mongoose";

const LinkSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  targetUrl: { type: String, required: true },
  totalClicks: { type: Number, default: 0 },
  lastClicked: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Link", LinkSchema);
