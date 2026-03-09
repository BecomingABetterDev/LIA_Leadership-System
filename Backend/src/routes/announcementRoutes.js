import express from "express";
import {
  createAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  deleteAnnouncement
} from "../controllers/announcementController.js";

const router = express.Router();

router.get("/", getAnnouncements);
router.post("/", createAnnouncement);
router.put("/:announcementId", updateAnnouncement);
router.delete("/:announcementId", deleteAnnouncement);

export default router;
