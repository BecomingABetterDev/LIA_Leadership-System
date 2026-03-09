import Announcement from "../models/Announcement.js";
import Notification from "../models/Notification.js";
import Student from "../models/Student.js";

export const createAnnouncement = async (req, res) => {
  try {
    const { postedBy, title, content } = req.body;
    const announcement = await Announcement.create({ postedBy, title, content });

    // Notify all students
    const students = await Student.find();
    await Notification.insertMany(
      students.map(s => ({
        recipient: s._id,
        type: "announcement",
        message: `New announcement: ${title}`
      }))
    );

    res.status(201).json({ message: "Announcement created successfully", announcement });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 });

    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateAnnouncement = async (req, res) => {
  try {
    const { announcementId } = req.params;
    const { postedBy, title, content } = req.body;

    const announcement = await Announcement.findByIdAndUpdate(
      announcementId,
      { $set: { postedBy, title, content } },
      { new: true }
    );

    if (!announcement)
      return res.status(404).json({ message: "Announcement not found" });

    res.json({
      message: "Announcement updated successfully",
      announcement
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const { announcementId } = req.params;

    const announcement = await Announcement.findByIdAndDelete(announcementId);

    if (!announcement)
      return res.status(404).json({ message: "Announcement not found" });

    res.json({ message: "Announcement deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
