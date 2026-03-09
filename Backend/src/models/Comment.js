import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  eventID: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
  text: String,
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reply" }]
}, { timestamps: true });

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
