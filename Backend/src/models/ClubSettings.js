import mongoose from "mongoose";

const clubSettingsSchema = new mongoose.Schema({
  presentAward: Number,
  lateDeduction: Number,
  absentDeduction: Number,
  allowedDays: [Number]
}, { timestamps: true });

const ClubSettings = mongoose.model("ClubSettings", clubSettingsSchema);
export default ClubSettings;