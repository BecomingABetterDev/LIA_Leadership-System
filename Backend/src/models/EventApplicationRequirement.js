import mongoose from "mongoose";

const requirementSchema = new mongoose.Schema({
  name: String,
  type: String,
  image: String,
  text: String,
  maxWord: Number,
  studentID: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  eventID: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
  isQuestion: Boolean,
}, { timestamps: true });

const EventApplicationRequirement = mongoose.model("EventApplicationRequirement", requirementSchema);
export default EventApplicationRequirement;
