import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  subject: String,
  message: String,
  status: { type: String, default: "pending" },
  response: String,
  studentID: { type: mongoose.Schema.Types.ObjectId, ref: "Student" }
}, { timestamps: true });

const Feedback = mongoose.model("Feedback", feedbackSchema);
export default Feedback;
