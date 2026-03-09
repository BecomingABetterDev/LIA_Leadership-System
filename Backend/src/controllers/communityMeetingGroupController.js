import CommunityMeetingGroup from "../models/CommunityMeetingGroup.js";
import Student from "../models/Student.js";

// ====== Create a new community meeting group ======
export const createCMGroup = async (req, res) => {
  try {
    const { name, studentIds = [] } = req.body;

    // Optional: validate student IDs exist
    const students = await Student.find({ _id: { $in: studentIds } });

    let group = await CommunityMeetingGroup.create({
      name,
      students: students.map(s => s._id)
    });

    group = await group.populate("students", "_id name profileImage");

    res.json({ message: "Community meeting group created", group });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ====== Update an existing group ======
export const updateCMGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, studentIds } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (studentIds) {
      const students = await Student.find({ _id: { $in: studentIds } });
      updateData.students = students.map(s => s._id);
    }

    let group = await CommunityMeetingGroup.findByIdAndUpdate(
      groupId,
      { $set: updateData },
      { new: true }
    );

    group = await group.populate("students", "_id name profileImage");

    if (!group) return res.status(404).json({ message: "Group not found" });

    res.json({ message: "Community meeting group updated", group });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ====== Delete a group ======
export const deleteCMGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await CommunityMeetingGroup.findByIdAndDelete(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    res.json({ message: "Community meeting group deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ====== List all groups ======
export const listCMGroups = async (req, res) => {
  try {
    const groups = await CommunityMeetingGroup.find().populate("students", "_id name profileImage");
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
