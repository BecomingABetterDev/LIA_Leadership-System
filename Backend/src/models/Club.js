import mongoose from "mongoose";

const clubSchema = new mongoose.Schema({
  name: { type: String, required: true },
  password: { type: String, required: true }
}, { timestamps: true });

const Club = mongoose.model("Club", clubSchema);
export default Club;
