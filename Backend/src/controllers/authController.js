import bcrypt from "bcryptjs";
import Student from "../models/Student.js";
import Admin from "../models/Admin.js";
import Club from "../models/Club.js";
import { generateToken } from "../libs/utils.js";
import cloudinary from "../libs/cloudinary.js";

// ======= STUDENT CONTROLLERS =======

// Login
export const studentLogin = async (req, res) => {
  try {
    const { schoolId, password } = req.body;

    const student = await Student.findOne({ schoolId });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const match = await bcrypt.compare(password, student.password);
    if (!match) return res.status(401).json({ message: "Student not found" });

    const token = generateToken(student._id, res);
    res.json({ message: "Login successful", student, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Logout
export const studentLogout = async (req, res) => {
  res.cookie("studentToken", "", { maxAge: 0, httpOnly: true, path: "/" });
  res.json({ message: "Student logged out successfully" });
};

export const studentUpdateAccount = async (req, res) => {
  try {
    const studentId = req.student._id;
    if (!studentId) return res.status(401).json({ message: "Unauthorized" });

    const { email, oldPassword, newPassword, profileImage } = req.body;
    const updateData = {};

    // Update email if provided
    if (email) updateData.email = email;

    // Password update flow
    if (oldPassword || newPassword) {
      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          message: "Both current and new password are required to change password",
        });
      }

      // Fetch student to compare passwords
      const student = await Student.findById(studentId);
      if (!student) return res.status(404).json({ message: "Student not found" });

      const isMatch = await bcrypt.compare(oldPassword, student.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Hash new password
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    // Profile image update
    if (profileImage) {
      const student = await Student.findById(studentId);
    
      if (student.profileImage) {
        const urlParts = student.profileImage.split("/");
        const fileName = urlParts[urlParts.length - 1];
        const publicId = fileName.split(".")[0];
    
        await cloudinary.uploader.destroy(publicId);
      }
    
      const uploadResult = await cloudinary.uploader.upload(profileImage);
      updateData.profileImage = uploadResult.secure_url;
    }

    // Update student
    const updatedStudent = await Student.findByIdAndUpdate(studentId, { $set: updateData }, { new: true });
    res.json({ message: "Account updated successfully", student: updatedStudent });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reset password
export const studentResetPassword = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { newPassword } = req.body;

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const student = await Student.findOneAndUpdate(
      { schoolId },
      { $set: { password: hashedPassword } },
      { new: true }
    );

    if (!student) return res.status(404).json({ message: "Student not found" });

    res.json({ message: "Password reset successfully", student });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete account
export const studentDeleteAccount = async (req, res) => {
  try {
    const { schoolId } = req.params;

    const student = await Student.findOne({ schoolId });
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Delete profile from Cloudinary
    if (student.profileImage) {
      await cloudinary.uploader.destroy(student.profileImage.split("/").pop().split(".")[0]);
    }

    await student.deleteOne();

    res.json({ message: "Student account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const registerStudent = async (req, res) => {
  try {
    const { name, schoolId, password } = req.body;

    if (!name || !schoolId || !password) {
      return res.status(400).json({ message: "Name, schoolId, and password are required" });
    }

    const exists = await Student.findOne({ schoolId });
    if (exists) return res.status(400).json({ message: "Student with this schoolId already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await Student.create({
      name,
      schoolId,
      password: hashedPassword
    });

    res.status(201).json({ message: "Student registered successfully", student });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// List all students (exclude password)
export const listAllStudents = async (req, res) => {
  try {
    const students = await Student.find().select("-password");
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const checkStudentAuth = async (req, res) => {
  try {
    if (!req.student) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    res.json({
      authenticated: true,
      student: req.student,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ======= ADMIN CONTROLLERS =======

export const adminLogin = async (req, res) => {
  try {
    const { password } = req.body;
    const admin = await Admin.findOne();
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(401).json({ message: "Incorrect password" });

    generateToken(admin._id, res);
    res.json({ message: "Admin logged in", admin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const adminLogout = async (req, res) => {
  res.cookie("token", "", { maxAge: 0, httpOnly: true, path: "/" });
  res.json({ message: "Admin logged out successfully" });
};

export const adminUpdatePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const admin = await Admin.findOne();
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();
    res.json({ message: "Admin password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const checkAdminAuth = async (req, res) => {
  try {
    if (!req.admin) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    res.json({
      authenticated: true,
      admin: req.admin,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ======= CLUB CONTROLLERS =======

export const clubLogin = async (req, res) => {
  try {
    const { name, password } = req.body;
    const club = await Club.findOne({ name });
    if (!club) return res.status(404).json({ message: "Club not found" });

    const match = await bcrypt.compare(password, club.password);
    if (!match) return res.status(401).json({ message: "Incorrect password" });

    generateToken(club._id, res);
    res.json({ message: "Club logged in", club });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const clubLogout = async (req, res) => {
  res.cookie("token", "", { maxAge: 0, httpOnly: true, path: "/" });
  res.json({ message: "Club logged out successfully" });
};

export const clubUpdatePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const club = req.club; // from protectClubRoute middleware

    if (!club) return res.status(404).json({ message: "Club not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedClub = await Club.findByIdAndUpdate(
      club._id,
      { $set: { password: hashedPassword } },
      { new: true }
    );

    res.json({ message: "Club password updated successfully", club: updatedClub });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const clubResetPassword = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { newPassword } = req.body;

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const club = await Club.findByIdAndUpdate(
      clubId,
      { $set: { password: hashedPassword } },
      { new: true }
    );

    if (!club) return res.status(404).json({ message: "Club not found" });

    res.json({ message: "Club password reset successfully", club });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const clubDeleteAccount = async (req, res) => {
  try {
    const { clubId } = req.params;

    const club = await Club.findByIdAndDelete(clubId);
    if (!club) return res.status(404).json({ message: "Club not found" });

    res.json({ message: "Club account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createClub = async (req, res) => {
  try {
    const { name, password } = req.body;
    const exists = await Club.findOne({ name });
    if (exists) return res.status(400).json({ message: "Club already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const club = await Club.create({ name, password: hashed });

    res.json({ message: "Club created successfully", club });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const checkClubAuth = async (req, res) => {
  try {
    if (!req.club) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    res.json({
      authenticated: true,
      club: req.club,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
