import mongoose from "mongoose";

const trimesterArchiveSchema = new mongoose.Schema(
  {
    endedAt: { type: Date, default: Date.now },
    studentResults: Array,
    transactions: Array,
    events: Array,
    attendance: Array,
    feedback: Array,
    comments: Array,
    replies: Array
  },
  { timestamps: true }
);

export default mongoose.model("TrimesterArchive", trimesterArchiveSchema);