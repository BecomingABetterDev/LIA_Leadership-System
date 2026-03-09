import mongoose from "mongoose";

const savanahTransactionSchema = new mongoose.Schema({
  studentID: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", default: null },
  amount: Number,
  bonusGiven: { type: Number, default: 0 },
  deductedMark: { type: Number, default: 0 },
  description: { type: String, default: "" } 
}, { timestamps: true });

const SavanahTransaction = mongoose.model("SavanahTransaction", savanahTransactionSchema);
export default SavanahTransaction;
