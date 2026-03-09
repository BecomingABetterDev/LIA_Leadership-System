import mongoose from "mongoose";

const clubSessionSchema = new mongoose.Schema({
  clubMemberID: { type: mongoose.Schema.Types.ObjectId, ref: "ClubMember" },
  date: Date,
  recordedAttendance: { type: String, default: null },
  lostSavanah: { type: Number, default: 0 },
  gainedSavanah: { type: Number, default: 0 },
}, { timestamps: true });

const ClubSession = mongoose.model("ClubSession", clubSessionSchema);
export default ClubSession;
