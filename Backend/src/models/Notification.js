import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },
    type: {
      type: String,
      enum: [
        "announcement",
        "application_approved",
        "application_rejected",
        "reply",
        "comment", 
        "new_event"
      ]
    },
    message: String,
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);