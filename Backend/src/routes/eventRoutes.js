import express from "express";
import {
  createStudentEvent,
  createLeadershipEvent,
  applyToEvent,
  countEventView,
  listEvents,
  addComment,
  updateComment,
  deleteComment,
  addReply,
  updateReply,
  deleteReply,
  getAllRequirements,
  approveEvent,
  rejectEvent,
  updateEventDate,
  updateMaxApplicants,
  cancelEvent,
  completeEvent,
  endEventApplications,
  approveApplicant,
  rejectApplicant,
  markNotificationRead,
  listNotifications,
  listTransactions,
  listApplicants,
  getAdminSettings
} from "../controllers/eventController.js";
import { protectRoute } from "../middlewares/protectRoute.js";

const router = express.Router();

// Student actions
router.post("/student", protectRoute, createStudentEvent);
router.post("/apply", protectRoute, applyToEvent);
router.post("/view", protectRoute, countEventView);

// List events
router.get("/list", listEvents);

// Comments & replies
router.post("/comment", protectRoute, addComment);
router.put("/comment/:commentId", protectRoute, updateComment);
router.delete("/comment/:commentId", protectRoute, deleteComment);

router.post("/reply", protectRoute, addReply);
router.put("/reply/:replyId", protectRoute, updateReply);
router.delete("/reply/:replyId", protectRoute, deleteReply);

// Leadership & Event management
router.post("/leadership", createLeadershipEvent);
router.post("/approve", approveEvent);
router.post("/reject", rejectEvent);
router.post("/update-date", updateEventDate);
router.post("/update-spots", updateMaxApplicants);
router.post("/cancel", cancelEvent);
router.post("/complete", completeEvent);
router.post("/end-applications", endEventApplications);
router.get("/notifications", listNotifications);
router.get("/transactions", listTransactions);
router.get("/applicants", listApplicants);
router.get("/admin-settings", getAdminSettings); 

router.get("/requirements", getAllRequirements);

// Applicant management (new)
router.post("/applicant/approve", approveApplicant);
router.post("/applicant/reject", rejectApplicant);

// Notification management (mark as read)
router.post("/notification/read", markNotificationRead);

export default router;