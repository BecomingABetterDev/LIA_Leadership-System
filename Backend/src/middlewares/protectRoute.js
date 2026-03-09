import jwt from "jsonwebtoken";
import Student from "../models/Student.js";
import Admin from "../models/Admin.js";
import Club from "../models/Club.js";

// ================= STUDENT PROTECT =================
export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.studentToken;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Student Token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const student = await Student.findById(decoded.id).select("-password");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    req.student = student;

    next();
  } catch (err) {
    console.log("Student protect error:", err.message);
    res.status(401).json({ message: "Unauthorized" });
  }
};

// ================= CLUB PROTECT =================
export const protectClubRoute = async (req, res, next) => {
  try {
    const token = req.cookies.clubToken;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Club Token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const club = await Club.findById(decoded.id);

    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    req.club = club;

    next();
  } catch (err) {
    console.log("Club protect error:", err.message);
    res.status(401).json({ message: "Unauthorized" });
  }
};

// ================= ADMIN PROTECT =================
export const protectAdminRoute = async (req, res, next) => {
  try {
    const token = req.cookies.adminToken;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Admin Token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    req.admin = admin;

    next();
  } catch (err) {
    console.log("Admin protect error:", err.message);
    res.status(401).json({ message: "Unauthorized" });
  }
};