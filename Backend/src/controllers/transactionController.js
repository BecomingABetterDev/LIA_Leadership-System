import Student from "../models/Student.js";
import AdminSettings from "../models/AdminSettings.js";
import SavanahTransaction from "../models/SavanahTransaction.js";
import { contract, wallet } from "../contract.js";
import { ethers } from "ethers";

// ====== Admin distributes tokens to a single student ======
export const distributeTokensToStudent = async (req, res) => {
  try {
    const { studentId, amount, bonusGiven = 0, deductedMark = 0, description } = req.body;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const adminSettings = await AdminSettings.findOne();
    if (!adminSettings) return res.status(400).json({ message: "Admin settings not found" });

    // Mint amount on blockchain
    if (amount > 0) {
      const tx = await contract.mint(wallet.address, ethers.parseUnits(amount.toString(), 18));
      await tx.wait();
      student.tokenBalance += Number(amount);

      // Increment total tokens distributed only for positive awards
      adminSettings.totalTokensDistributed += Number(amount);
      adminSettings.totalTokenDistributedThisTrimister += Number(amount);
      await adminSettings.save();
    }

    await student.save();

    await SavanahTransaction.create({
      studentID: student._id,
      bonusGiven,
      deductedMark,
      description,
      amount
    });

    res.json({ message: "Transaction recorded", student, totalTokensDistributed: adminSettings.totalTokensDistributed });
  } catch (err) {
    console.error("❌ Distribute Tokens Error:");
    console.error(err);           // full error
    console.error(err.stack);     // exact line of crash
    res.status(500).json({ message: err.message });
  }
};

// ====== Admin distributes tokens to multiple students ======
export const distributeTokensToGroup = async (req, res) => {
  try {
    const { studentIds, amount, bonusGiven = 0, deductedMark = 0, description } = req.body;

    const students = await Student.find({ _id: { $in: studentIds } });
    if (!students.length) return res.status(404).json({ message: "No students found" });

    const adminSettings = await AdminSettings.findOne();
    if (!adminSettings) return res.status(400).json({ message: "Admin settings not found" });

    for (const student of students) {
      // Mint amount on blockchain
      if (amount > 0) {
        const tx = await contract.mint(student._id, ethers.parseUnits(amount.toString(), 18));
        await tx.wait();
        student.tokenBalance += Number(amount);

        // Increment total tokens distributed only for positive awards
        adminSettings.totalTokensDistributed += Number(amount);
        adminSettings.totalTokenDistributedThisTrimister += Number(amount);
      }

      await student.save();

      await SavanahTransaction.create({
        studentID: student._id,
        bonusGiven,
        deductedMark,
        description,
        amount
      });
    }

    await adminSettings.save();

    res.json({ message: "Group transaction recorded", totalStudents: students.length, totalTokensDistributed: adminSettings.totalTokensDistributed });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};