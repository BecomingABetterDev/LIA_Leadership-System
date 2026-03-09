import mongoose from "mongoose";

const adminSettingsSchema = new mongoose.Schema(
  {
    isProfileAllowed: {
      type: Boolean,
      default: true
    },

    totalTokensDistributed: {
      type: Number,
      default: 0
    },

    totalEventsHosted: {
      type: Number,
      default: 0
    },

    totalTokenDistributedThisTrimister: {
      type: Number,
      default: 0
    },

    isTrimesterEnded: {
      type: Boolean,
      default: false
    },

    currentTrimester: {
      type: Number,
      default: 1
    },

    trimesterStartDate: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.model("AdminSettings", adminSettingsSchema);