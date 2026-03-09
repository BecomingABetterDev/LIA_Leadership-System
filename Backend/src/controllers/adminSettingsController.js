import AdminSettings from "../models/AdminSettings.js";
import Student from "../models/Student.js";
import TrimesterArchive from "../models/TrimesterArchive.js";
import SavannahTransaction from "../models/SavanahTransaction.js";
import Event from "../models/Event.js";
import Attendance from "../models/Attendance.js";
import Feedback from "../models/Feedback.js";
import Comment from "../models/Comment.js";
import Reply from "../models/Reply.js";

export const endTrimester = async (req, res) => {
  try {
    const settings = await AdminSettings.findOne();

    if (!settings)
      return res.status(404).json({ message: "Admin settings not found" });

    if (settings.isTrimesterEnded)
      return res.status(400).json({ message: "Trimester already ended" });

    const students = await Student.find().select(
      "name grade section tokenBalance gradeLetter"
    );

    const archive = await TrimesterArchive.create({
      studentResults: students,
      transactions: await SavannahTransaction.find(),
      events: await Event.find(),
      attendance: await Attendance.find(),
      feedback: await Feedback.find(),
      comments: await Comment.find(),
      replies: await Reply.find()
    });

    await Promise.all([
      SavannahTransaction.deleteMany(),
      Event.deleteMany(),
      Attendance.deleteMany(),
      Feedback.deleteMany(),
      Comment.deleteMany(),
      Reply.deleteMany()
    ]);

    settings.isTrimesterEnded = true;
    await settings.save();

    res.json({
      success: true,
      message: "Trimester ended successfully",
      archiveId: archive
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const startNewTrimester = async (req, res) => {
  try {
    const settings = await AdminSettings.findOne();

    if (!settings)
      return res.status(404).json({ message: "Admin settings not found" });

    if (!settings.isTrimesterEnded)
      return res.status(400).json({ message: "Trimester not ended yet" });

    await Student.updateMany({}, {
      tokenBalance: 0,
      gradeLetter: null
    });

    await TrimesterArchive.deleteMany();

    let nextTrimester = settings.currentTrimester + 1;
    if (nextTrimester > 3) nextTrimester = 1;

    settings.isTrimesterEnded = false;
    settings.currentTrimester = nextTrimester;
    settings.trimesterStartDate = new Date();

    await settings.save();

    res.json({
      success: true,
      message: "New trimester started",
      currentTrimester: settings.currentTrimester,
      startDate: settings.trimesterStartDate
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const handleProfileSetting = async (req, res) => {
  try {
    const settings = await AdminSettings.findOne();

    if (!settings) {
      return res.status(404).json({ message: "Settings not found" });
    }

    settings.isProfileAllowed = !settings.isProfileAllowed;

    const updatedSettings = await settings.save();

    res.status(200).json({
      message: "Profile setting updated successfully",
      isProfileAllowed: updatedSettings.isProfileAllowed,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};