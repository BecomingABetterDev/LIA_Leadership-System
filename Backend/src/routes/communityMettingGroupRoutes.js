import express from "express";
import {
  createCMGroup,
  updateCMGroup,
  deleteCMGroup,
  listCMGroups
} from "../controllers/communityMeetingGroupController.js";

const router = express.Router();

// Create a new group
router.post("/create", createCMGroup);

// Update group by id
router.put("/update/:groupId", updateCMGroup);

// Delete group by id
router.delete("/delete/:groupId", deleteCMGroup);

// List all groups
router.get("/", listCMGroups);

export default router;
