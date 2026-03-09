import mongoose from "mongoose";

const clubMemberSchema = new mongoose.Schema({
  studentID: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  clubID: { type: mongoose.Schema.Types.ObjectId, ref: "Club" },
  sessionsTracked: { type: Number, default: 0 }
}, { timestamps: true });

const ClubMember = mongoose.model("ClubMember", clubMemberSchema);
export default ClubMember;
