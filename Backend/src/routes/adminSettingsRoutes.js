import express from "express";
import {
  endTrimester,
  startNewTrimester, 
  handleProfileSetting
} from "../controllers/adminSettingsController.js";

const router = express.Router();

router.post("/end", endTrimester);
router.post("/start", startNewTrimester);
router.post("/handleProfileSetting", handleProfileSetting);

export default router;