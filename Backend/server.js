import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "./src/libs/db.js";

// Import Routes from src/routes
import authRoutes from "./src/routes/authRoutes.js";
import announcementRoutes from "./src/routes/announcementRoutes.js";
import clubRoutes from "./src/routes/clubRoutes.js";
import eventRoutes from "./src/routes/eventRoutes.js";
import evaluationRoutes from "./src/routes/evaluationRoutes.js";
import feedbackRoutes from "./src/routes/feedbackRoutes.js";
import communityMeetingGroupRoutes from "./src/routes/communityMettingGroupRoutes.js";
import transactionRoutes from "./src/routes/transactionRoutes.js";
import XLSX from "xlsx";
import bcrypt from "bcryptjs";
import Student from "./src/models/Student.js";
import Admin from "./src/models/Admin.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors({
  // Fallback to the string if the ENV isn't loading correctly for a second
  origin: process.env.FRONTEND_URL || "https://lia-leadership-system-production.onrender.com/",
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(cookieParser()); 
app.use(express.json({ limit: "10mb" }));

// Route Middlewares
app.use("/api/auth", authRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/evaluation", evaluationRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/cm-groups", communityMeetingGroupRoutes);
app.use("/api/transaction", transactionRoutes);

app.get("/", (req, res) => {
    res.send("Welcome Home");
});


const createAdmin = async () => {
  try {
    const existingAdmin = await Admin.findOne();

    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash("LIA-Leadership-2026", 10);

    await Admin.create({
      password: hashedPassword,
      isProfileAllowed: true
    });

    console.log("✅ Admin created successfully");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

//createAdmin();

const registerStudentsFromExcelFile = async () => {
  try {
    // 📄 Load Excel file
    const workbook = XLSX.readFile("./data/students.xlsx");
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // 🔄 Convert to JSON
    const rows = XLSX.utils.sheet_to_json(worksheet);

    const createdStudents = [];
    const skippedStudents = [];

    for (const row of rows) {
      // ✅ Handle different header cases safely
      const name = row.Name || row.name;
      const schoolId = row.SchoolID || row.schoolId || row.schoolid;
      const password = row.Password || row.password;
      const grade = row.Grade || row.grade;
      const section = row.Section || row.section;

      // ❌ Missing required fields
      if (!name || !schoolId || !password || !grade || !section) {
        skippedStudents.push({ row, reason: "Missing required fields" });
        continue;
      }

      // ❌ Check duplicate schoolId
      const exists = await Student.findOne({ schoolId });
      if (exists) {
        skippedStudents.push({ row, reason: "Duplicate schoolId" });
        continue;
      }

      // 🔐 Hash password
      const hashedPassword = await bcrypt.hash(password.toString(), 10);

      // ✅ Create student
      const student = await Student.create({
        name,
        schoolId,
        password: hashedPassword,
        grade,
        section
      });

      createdStudents.push(student);
    }

    console.log("✅ Bulk registration complete");
    console.log("✔ Created:", createdStudents.length);
    console.log("⚠ Skipped:", skippedStudents.length);

    if (skippedStudents.length) {
      console.log("Skipped details:", skippedStudents);
    }

  } catch (err) {
    console.error("❌ Error registering students from Excel:", err.message);
  }
};

export default registerStudentsFromExcelFile;

//registerStudentsFromExcelFile();

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    connectDB();
});