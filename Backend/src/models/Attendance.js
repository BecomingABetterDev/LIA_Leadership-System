import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  clubId: { type: mongoose.Schema.Types.ObjectId, ref: "Club" },
  date: Date,
  status: { type: Boolean, default: false }
}, { timestamps: true });

attendanceSchema.index({ clubId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;
