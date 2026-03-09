import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  detailedDescription: String,
  tokenValue: Number,
  category: String,
  proposedDate: Date,
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  isAnonymousStudent: Boolean,
  postedByOther: String,
  maxApplicants: { type: Number, default: 0 },
  isPostedByAStudent: Boolean,
  status: { type: String, default: "pending" },
  isCompleted: { type: Boolean, default: false }, 
  isApplicationEnded: { type: Boolean, default: false },
  rejectionReason: String,
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Applicant" }],
  location: String,
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  isFixed: { type: Boolean, default: false },
  views: {type: Number, default: 0}
}, { timestamps: true });

const Event = mongoose.model("Event", eventSchema);
export default Event;
