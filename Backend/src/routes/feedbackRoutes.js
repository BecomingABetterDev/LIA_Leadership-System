import express from "express";
import {
  sendFeedback,
  respondToFeedback,
  listAllFeedbacks
} from "../controllers/feedbackController.js";
import { protectRoute } from "../middlewares/protectRoute.js";

const router = express.Router();

router.post("/", protectRoute,  sendFeedback);
router.put("/feedback/respond/:id", respondToFeedback);
router.get("/", listAllFeedbacks);

export default router;
