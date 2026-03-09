import mongoose from "mongoose";

const replySchema = new mongoose.Schema({
  commentID: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },
  userID: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  text: String
}, { timestamps: true });

const Reply = mongoose.model("Reply", replySchema);
export default Reply;
