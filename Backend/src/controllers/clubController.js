import AdminSettings from "../models/AdminSettings.js";
import Club from "../models/Club.js";
import ClubMember from "../models/ClubMember.js";
import ClubSession from "../models/ClubSession.js";
import ClubSettings from "../models/ClubSettings.js";
import Attendance from "../models/Attendance.js";
import Student from "../models/Student.js";
import SavanahTransaction from "../models/SavanahTransaction.js";
import { contract } from "../contract.js";
import { ethers } from "ethers";

// ====== GET CLUB SETTINGS ======
export const getClubSettings = async (req, res) => {
  try {
    const settings = await ClubSettings.findOne();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ====== UPDATE CLUB SETTINGS ======
export const updateClubSettings = async (req, res) => {
  try {
    const { presentAward, lateDeduction, absentDeduction, allowedDays } = req.body;

    let settings = await ClubSettings.findOne();
    
    if (!settings) {
      settings = await ClubSettings.create({
        presentAward: presentAward || 0,
        lateDeduction: lateDeduction || 0,
        absentDeduction: absentDeduction || 0,
        allowedDays: allowedDays || []
      });
      return res.status(201).json({ message: "Club settings created", settings });
    }

    if (presentAward !== undefined) settings.presentAward = presentAward;
    if (lateDeduction !== undefined) settings.lateDeduction = lateDeduction;
    if (absentDeduction !== undefined) settings.absentDeduction = absentDeduction;
    if (allowedDays !== undefined) settings.allowedDays = allowedDays;

    await settings.save();

    res.json({ message: "Club settings updated successfully", settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ====== GET CLUB MEMBERS ======
export const getClubMembers = async (req, res) => {
  try {
    const club = req.club;
    const members = await ClubMember.find({ clubID: club._id })
      .populate("studentID", "name email grade");
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ====== GET CLUBS OVERVIEW ======
export const getClubsOverview = async (req, res) => {
  try {
    const clubs = await Club.find();
    const result = [];

    for (const club of clubs) {
      const members = await ClubMember.find({ clubID: club._id })
        .populate("studentID", "name email grade");

      const attendanceRecords = await Attendance.find({ clubId: club._id })
        .sort({ date: 1 });

      result.push({
        club,
        members,
        attendanceRecords
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ====== SUBMIT ATTENDANCE ======
export const submitAttendance = async (req, res) => {
  try {
    const club = req.club;
    const { date, members } = req.body; 
    const settings = await ClubSettings.findOne();
    if (!settings) return res.status(400).json({ message: "Club settings not found" });

    const adminSettings = await AdminSettings.findOne();
    if (!adminSettings) return res.status(400).json({ message: "Admin settings not found" });

    // Create a new Attendance record for the day
    const attendance = await Attendance.create({
      clubId: club._id,
      date: new Date(date),
      status: true
    });

    const results = [];

    for (const m of members) {
      const { clubMemberID, status } = m;
      const clubMember = await ClubMember.findById(clubMemberID);
      if (!clubMember) continue;
    
      let tokenChange = 0;
      if (status === "present") tokenChange = settings.presentAward;
      else if (status === "late") tokenChange = -settings.lateDeduction;
      else if (status === "absent") tokenChange = -settings.absentDeduction;
    
      const session = await ClubSession.create({
        clubMemberID: clubMember._id,
        date: new Date(date),
        recordedAttendance: status,
        lostSavanah: tokenChange < 0 ? Math.abs(tokenChange) : 0,
        gainedSavanah: tokenChange > 0 ? tokenChange : 0, // add gainedSavanah
      });
    
      clubMember.sessionsTracked += 1;
      await clubMember.save();
    
      const student = await Student.findById(clubMember.studentID);
      if (!student) continue;
    
      if (tokenChange !== 0) {
        if (tokenChange > 0) {
          const tx = await contract.mint(
            student._id,
            ethers.parseUnits(tokenChange.toString(), 18)
          );
          await tx.wait();
          student.tokenBalance += tokenChange;
          adminSettings.totalTokensDistributed += tokenChange;
        } else {
          const tx = await contract.burn(
            student._id,
            ethers.parseUnits(Math.abs(tokenChange).toString(), 18)
          );
          await tx.wait();
          student.tokenBalance += tokenChange;
        }
    
        await student.save();
    
        await SavanahTransaction.create({
          studentID: student._id,
          clubId: club._id,
          sessionId: session._id,
          amount: tokenChange,
          description: `Attendance: ${status}`,
        });
      }
    
      results.push({ clubMemberID, sessionId: session._id, tokenChange });
    }

    await adminSettings.save();

    res.json({ message: "Attendance recorded for all members", attendanceId: attendance._id, results, totalTokensDistributed: adminSettings.totalTokensDistributed });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ====== GRANT PERMISSION ======
export const grantPermission = async (req, res) => {
  try {
    const { clubMemberID, date } = req.body;
    const settings = await ClubSettings.findOne();
    if (!settings) return res.status(400).json({ message: "Club settings not found" });

    const adminSettings = await AdminSettings.findOne();
    if (!adminSettings) return res.status(400).json({ message: "Admin settings not found" });

    const clubMember = await ClubMember.findById(clubMemberID);
    if (!clubMember) return res.status(404).json({ message: "Club member not found" });

    // Use presentAward from settings
    const tokenChange = settings.presentAward || 0;

    const session = await ClubSession.create({
      clubMemberID: clubMember._id,
      date: new Date(date),
      recordedAttendance: "present",
      lostSavanah: 0,
      gainedSavanah: tokenChange, // record gainedSavanah
    });

    clubMember.sessionsTracked += 1;
    await clubMember.save();

    const student = await Student.findById(clubMember.studentID);
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (tokenChange > 0) {
      const tx = await contract.mint(student._id, ethers.parseUnits(tokenChange.toString(), 18));
      await tx.wait();

      student.tokenBalance += tokenChange;
      await student.save();

      adminSettings.totalTokensDistributed += tokenChange;
      await adminSettings.save();

      await SavanahTransaction.create({
        studentID: student._id,
        clubId: clubMember.clubID,
        sessionId: session._id,
        amount: tokenChange,
        description: "Attendance granted as present",
      });
    }

    res.json({
      message: "Permission granted for the day",
      session,
      gainedSavanah: tokenChange,
      totalTokensDistributed: adminSettings.totalTokensDistributed,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getClubSessions = async (req, res) => {
  try {
    const sessions = await ClubSession.find().sort({ date: -1 });

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};