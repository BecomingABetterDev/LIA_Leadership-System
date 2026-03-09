import express from "express";
import {
  getClubSettings,
  updateClubSettings,
  getClubsOverview,
  getClubMembers,
  submitAttendance,
  grantPermission,
  getClubSessions
} from "../controllers/clubController.js";

const router = express.Router();

// Club settings
router.get("/settings", getClubSettings);
router.post("/settings/update", updateClubSettings); 

// Club overview and members
router.get("/overview", getClubsOverview);
router.get("/members", getClubMembers);

// Attendance
router.post("/attendance/submit", submitAttendance);
router.post("/grant-permission", grantPermission);
router.get("/club-sessions", getClubSessions);

export default router;