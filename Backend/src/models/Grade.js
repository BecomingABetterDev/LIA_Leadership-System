import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema({
  maximumValue: Number,
  minimumValue: Number,
  gradeLetter: String
}, { timestamps: true });

const Grade = mongoose.model("Grade", gradeSchema);
export default Grade;