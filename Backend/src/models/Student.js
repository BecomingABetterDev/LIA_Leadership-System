import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  schoolId: { type: String, unique: true },
  profileImage: { type: String, default: "" }, 
  section: String,
  grade: String,
  email: { type: String },
  password: { type: String, required: true },
  tokenBalance: { type: Number, default: 0 }, 
  gradeLetter: { type: String, default: "F"}
}, { timestamps: true });

const Student = mongoose.model("Student", studentSchema);
export default Student;