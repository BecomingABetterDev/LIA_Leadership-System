import Event from "../models/Event.js";
import Applicant from "../models/Applicant.js";
import EventApplicationRequirement from "../models/EventApplicationRequirement.js";
import Comment from "../models/Comment.js";
import Reply from "../models/Reply.js";
import cloudinary from "../libs/cloudinary.js";
import Notification from "../models/Notification.js";
import SavanahTransaction from "../models/SavanahTransaction.js";
import { contract, wallet } from "../contract.js"; 
import { ethers } from "ethers";
import AdminSettings from "../models/AdminSettings.js";
import Student from "../models/Student.js";
import mongoose from "mongoose";

// ================== Create Student Event ==================
export const createStudentEvent = async (req, res) => {
  const session = await Event.startSession();
  session.startTransaction();

  try {
    const {
      title,
      description,
      detailedDescription,
      tokenValue,
      eventCategory,
      proposedDate,
      maxApplicants,
      location,
      requirements,
      eventPoster,
      customClubName,
    } = req.body;

    const anonymous = eventPoster === "student"

    // 1️⃣ Create the student event
    const event = await Event.create(
      [
        {
          title,
          description,
          detailedDescription,
          tokenValue,
          category: eventCategory,
          proposedDate,
          postedBy: req.student._id,
          isAnonymousStudent: anonymous,
          postedByOther: customClubName,
          maxApplicants,
          isPostedByAStudent: true,
          status: "pending",
          location
        }
      ],
      { session }
    );

    // 2️⃣ Loop through requirements and create them
    if (requirements) {
      for (const reqItem of requirements) {
        const { label, type, maxWordCount } = reqItem;
    
        await EventApplicationRequirement.create(
          [
            {
              eventID: event[0]._id,
              name: label,         
              type,
              maxWord: maxWordCount,
              isQuestion: true,
            }
          ],
          { session }
        );
      }
    }

    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Student event created with requirements", event: event[0] });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({ message: err.message });
  }
};

// ================== Create Leadership Event ==================
export const createLeadershipEvent = async (req, res) => {
  const session = await Event.startSession();
  session.startTransaction();

  try {
    const {
      title,
      description,
      tokenValue,
      eventCategory,
      proposedDate,
      maxApplicants,
      location,
      requirements // array of requirement objects
    } = req.body;

    // 1️⃣ Create leadership event
    const event = await Event.create(
      [
        {
          title,
          description,
          tokenValue,
          category: eventCategory,
          proposedDate,
          maxApplicants,
          postedBy: null,
          isPostedByAStudent: false,
          status: null,
          location
        }
      ],
      { session }
    );

    // 2️⃣ Loop through requirements and create them
    if (requirements) {
      for (const reqItem of requirements) {
        const { label, type, maxWordCount } = reqItem;
    
        await EventApplicationRequirement.create(
          [
            {
              eventID: event[0]._id,
              name: label,        
              type,
              maxWord: maxWordCount,
              isQuestion: true,
            }
          ],
          { session }
        );
      }
    }

    // 3️⃣ Notify all students ONLY after event + requirements succeed
    const students = await Student.find({}, null, { session });
    const notifications = students.map(s => ({
      recipient: s._id,
      type: "new_event",
      message: `New leadership event: ${title}`
    }));

    await Notification.insertMany(notifications, { session });

    // ✅ Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Leadership event created with requirements", event: event[0] });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({ message: err.message });
  }
};

// Apply to event with requirements
export const applyToEvent = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { eventId, requirementsFilled } = req.body;
    const studentID = req.student._id;

    // 1. Verify Event and Applicant
    const event = await Event.findById(eventId).session(session);
    if (!event) throw new Error("Event not found");

    const existing = await Applicant.findOne({ eventID: eventId, studentID }).session(session);
    if (existing) throw new Error("Already applied");

    const eventRequirements = await EventApplicationRequirement.find({
      eventID: eventId,
      isQuestion: true,
    }).session(session);

    // 2. Process Requirements (Upload images to Cloudinary first)
    for (const requirement of eventRequirements) {
      const answer = requirementsFilled.find(
        (r) => r.requirementID.toString() === requirement._id.toString()
      );
      if (!answer) throw new Error("Missing requirement answer");

      let finalImageUrl = "";
      
      // If there's an image and it's a data URL/Base64, upload to Cloudinary
      if (requirement.type === "image" && answer.image && answer.image.startsWith("data:image")) {
        const uploadResult = await cloudinary.uploader.upload(answer.image);
        finalImageUrl = uploadResult.secure_url;
      } else {
        finalImageUrl = answer.image || "";
      }

      await EventApplicationRequirement.create([{
        name: requirement.name,
        type: requirement.type,
        maxWord: requirement.maxWord,
        studentID,
        eventID: eventId,
        text: answer.text || "",
        image: finalImageUrl, // Saved the Cloudinary URL here
        isQuestion: false,
      }], { session });
    }

    // 3. Create Applicant
    const applicant = await Applicant.create([{
        eventID: eventId,
        studentID,
        status: "pending",
    }], { session });

    event.applicants.push(applicant[0]._id);
    await event.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Applied successfully", applicant: applicant[0] });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: err.message });
  }
};

// Count views
export const countEventView = async (req, res) => {
  try {
    const { eventId } = req.body;
    const studentID = req.student._id;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (!event.views) event.views = [];
    if (!event.views.includes(studentID)) {
      event.views.push(studentID);
      await event.save();
    }

    res.json({ message: "View counted", totalViews: event.views.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// List events with comments & replies
export const listEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate({
        path: "comments",
        select: "text createdAt userID replies",
        options: { sort: { createdAt: -1 } },
        populate: [
          { path: "userID", select: "name profileImage" },
          {
            path: "replies",
            select: "text createdAt userID",
            options: { sort: { createdAt: -1 } },
            populate: { path: "userID", select: "name profileImage" }
          }
        ]
      })
      .populate({
        path: "postedBy",
        select: "name"
      })
      .populate({
        path: "applicants",
        populate: { path: "studentID", select: "name _id profileImage" }
      })
      .sort({createdAt: -1})

    // Format proposedDate like "Feb 15, 2026"
    const formattedEvents = events.map((event) => ({
      ...event.toObject(),
      proposedDate: event.proposedDate
        ? new Date(event.proposedDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : null
    }));

    res.json(formattedEvents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Comments
export const addComment = async (req, res) => {
  try {
    const { eventID, text } = req.body;

    const comment = await Comment.create({
      eventID,
      userID: req.student._id,
      text,
    });

    // Push to event
    const event = await Event.findById(eventID);
    if (event) {
      event.comments.push(comment._id);
      await event.save();
    }

    // 🔥 IMPORTANT: populate before sending
    const populatedComment = await Comment.findById(comment._id)
      .populate("userID", "name profileImage");

    res.json({ message: "Comment added", comment: populatedComment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;

    const comment = await Comment.findByIdAndUpdate(
      commentId,
      { $set: { text } },
      { new: true }
    ).populate("userID", "name profileImage"); // 🔥 populate here too

    if (!comment)
      return res.status(404).json({ message: "Comment not found" });

    res.json({ message: "Comment updated", comment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findByIdAndDelete(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    res.json({ message: "Comment deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Replies
export const addReply = async (req, res) => {
  try {
    const { commentID, text } = req.body;

    const reply = await Reply.create({
      commentID,
      userID: req.student._id,
      text,
    });

    // Push reply into comment.replies
    const comment = await Comment.findById(commentID);
    if (comment) {
      comment.replies.push(reply._id);
      await comment.save();
    }

    // Notify comment owner if not same student
    if (comment && comment.userID.toString() !== req.student._id.toString()) {
      await Notification.create({
        recipient: comment.userID,
        type: "reply",
        message: `New reply to your comment`,
      });
    }

    // 🔥 IMPORTANT: populate before returning
    const populatedReply = await Reply.findById(reply._id)
      .populate("userID", "name profileImage");

    res.json({ message: "Reply added", reply: populatedReply });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateReply = async (req, res) => {
  try {
    const { replyId } = req.params;
    const { text } = req.body;

    const reply = await Reply.findByIdAndUpdate(
      replyId,
      { $set: { text } },
      { new: true }
    ).populate("userID", "name profileImage");

    if (!reply) {
      return res.status(404).json({ message: "Reply not found" });
    }

    res.json({ message: "Reply updated", reply });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteReply = async (req, res) => {
  try {
    const { replyId } = req.params;
    const reply = await Reply.findByIdAndDelete(replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found" });
    res.json({ message: "Reply deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Leadership/Admin actions
export const approveEvent = async (req, res) => {
  try {
    const { eventId, amount, bonusGiven = 0, deductedMark = 0, description } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (!event.isPostedByAStudent) return res.status(400).json({ message: "Only student-prepared events apply here" });

    event.status = "approved";
    await event.save();

    if (event.postedBy) {
      await Notification.create({
        recipient: event.postedBy,
        type: "application_approved",
        message: `Your event "${event.title}" has been approved!`
      });
    }

    const students = await Student.find();
    await Notification.insertMany(
      students.map(s => ({
        recipient: s._id,
        type: "new_event",
        message: `A new event is now available: "${event.title}"`
      }))
    );

    if (event.postedBy && amount > 0) {
      const student = await Student.findById(event.postedBy);
      if (student) {
        // Mint from platform wallet to itself
        const tx = await contract.mint(wallet.address, ethers.parseUnits(amount.toString(), 18));
        await tx.wait();

        // Update student's off-chain balance
        student.tokenBalance += Number(amount);
        await student.save();

        await SavanahTransaction.create({
          studentID: student._id,
          eventId: event._id,
          amount,
          bonusGiven,
          deductedMark,
          description: description || "Event approved transaction"
        });
      }
    }
     
    const adminSettings = await AdminSettings.findOne();
    if (!adminSettings) return res.status(400).json({ message: "Admin settings not found" });

      adminSettings.totalTokensDistributed += Number(amount);
      adminSettings.totalTokenDistributedThisTrimister += Number(amount);

      await adminSettings.save()

    res.json({ message: "Event approved, student notified, and all students alerted about the new event", event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const rejectEvent = async (req, res) => {
  try {
    const { eventId, rejectionReason } = req.body;
    if (!rejectionReason) return res.status(400).json({ message: "Rejection reason required" });
    const event = await Event.findByIdAndUpdate(
      eventId,
      { $set: { status: "rejected", rejectionReason } },
      { new: true }
    );
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Notify student
    if (event.postedBy) {
      await Notification.create({
        recipient: event.postedBy,
        type: "application_rejected",
        message: `Your event "${event.title}" was rejected. Reason: ${rejectionReason}`
      });
    }

    res.json({ message: "Event rejected", event });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const updateEventDate = async (req, res) => {
  try {
    const { eventId, proposedDate } = req.body;
    const event = await Event.findByIdAndUpdate(eventId, { $set: { proposedDate } }, { new: true });
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json({ message: "Event date updated", event });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const updateMaxApplicants = async (req, res) => {
  try {
    const { eventId, maxApplicants } = req.body;
    const event = await Event.findByIdAndUpdate(eventId, { $set: { maxApplicants } }, { new: true });
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json({ message: "Max applicants updated", event });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const cancelEvent = async (req, res) => {
  try {
    const { eventId } = req.body;
    const event = await Event.findByIdAndDelete(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json({ message: "Event cancelled" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const completeEvent = async (req, res) => {
  const { eventId } = req.body;

  try {
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const requirements = await EventApplicationRequirement.find({ eventID: eventId });

    await Promise.all(
      requirements.map(async (reqItem) => {
        if (reqItem.image) {
          const urlParts = reqItem.image.split("/");
          const fileName = urlParts[urlParts.length - 1];
          const publicId = fileName.split(".")[0];
    
          await cloudinary.uploader.destroy(publicId);
        }
      })
    );

    event.isCompleted = true;
    await event.save();

    res.json({
      message: "Event completed, all student requirement images deleted",
      event
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const endEventApplications = async (req, res) => {
  try {
    const { eventId } = req.body;
    const event = await Event.findByIdAndUpdate(eventId, { $set: { status: "approved", isApplicationEnded: true } }, { new: true });
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json({ message: "Event applications ended", event });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Approve Applicant
export const approveApplicant = async (req, res) => {
  try {
    const { applicantId } = req.body;
    const applicant = await Applicant.findById(applicantId);
    if (!applicant) return res.status(404).json({ message: "Applicant not found" });

    applicant.status = "approved";
    await applicant.save();

    // Notify the student
    await Notification.create({
      recipient: applicant.studentID,
      type: "application_approved",
      message: `Your application for event "${applicant.event}" has been approved!`
    });

    res.json({ message: "Applicant approved", applicant });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reject Applicant
export const rejectApplicant = async (req, res) => {
  try {
    const { applicantId, rejectionReason } = req.body;
    if (!rejectionReason) return res.status(400).json({ message: "Rejection reason required" });

    const applicant = await Applicant.findById(applicantId);
    if (!applicant) return res.status(404).json({ message: "Applicant not found" });

    applicant.status = "rejected";
    applicant.rejectionReason = rejectionReason;
    await applicant.save();

    // Notify the student
    await Notification.create({
      recipient: applicant.studentID,
      type: "application_rejected",
      message: `Your application for event "${applicant.event}" was rejected. Reason: ${rejectionReason}`
    });

    res.json({ message: "Applicant rejected", applicant });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark Notification(s) as Read
export const markNotificationRead = async (req, res) => {
  try {
    const { notificationIds } = req.body; // array or single ID
    if (!notificationIds) return res.status(400).json({ message: "Notification ID(s) required" });

    if (Array.isArray(notificationIds)) {
      await Notification.updateMany(
        { _id: { $in: notificationIds } },
        { $set: { isRead: true } }
      );
    } else {
      await Notification.findByIdAndUpdate(notificationIds, { $set: { isRead: true } });
    }

    res.json({ message: "Notification(s) marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const listApplicants = async (req, res) => {
  try {
    const applicants = await Applicant.find()
    res.json(applicants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const listTransactions = async (req, res) => {
  try {
    const transactions = await SavanahTransaction.find()
      .populate("studentID", "name grade gradeLetter") // Fetches name and grade info from Student
      .populate("eventId", "title")                 // Fetches the title from Event
      .sort({ createdAt: -1 });                     // Optional: Shows newest transactions first

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const listNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAdminSettings = async (req, res) => {
  try {
    // Attempt to find the single existing settings document
    let settings = await AdminSettings.findOne();

    // If no document is found, create it using the schema's defaults
    if (!settings) {
      settings = await AdminSettings.create({});
    }

    res.status(200).json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllRequirements = async (req, res) => {
  try {
    const reqs = await EventApplicationRequirement.find()
    res.json(reqs);
    console.log(reqs)
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
