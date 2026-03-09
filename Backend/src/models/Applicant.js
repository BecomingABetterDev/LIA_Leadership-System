import mongoose from "mongoose";

const applicantSchema = new mongoose.Schema({
  eventID: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
  studentID: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  status: { type: String, default: "pending" },
  rejectionReason: String
}, { timestamps: true });

const Applicant = mongoose.model("Applicant", applicantSchema);
export default Applicant;
