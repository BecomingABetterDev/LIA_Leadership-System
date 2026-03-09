import mongoose from "mongoose";

const communityMeetingGroupSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }]
}, { timestamps: true });

const CommunityMeetingGroup = mongoose.model(
  "CommunityMeetingGroup",
  communityMeetingGroupSchema
);

export default CommunityMeetingGroup;
