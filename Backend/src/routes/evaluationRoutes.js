import express from "express";
import {
  createGradeMapping,
  updateGradeMapping,
  deleteGradeMapping,
  listAllGrades,
  createFixedEvent,
  updateFixedEvent,
  deleteFixedEvent
} from "../controllers/evaluationController.js";

const router = express.Router();
                                                                                         
router.post("/grades", createGradeMapping);
router.put("/grades/:id", updateGradeMapping);
router.delete("/grades/:id", deleteGradeMapping);
router.get("/grades", listAllGrades);

router.post("/fixed-events", createFixedEvent);
router.put("/fixed-events/:id", updateFixedEvent);
router.delete("/fixed-events/:id", deleteFixedEvent);

export default router;
