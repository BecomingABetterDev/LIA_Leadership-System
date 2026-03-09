import express from "express";
import { distributeTokensToStudent, distributeTokensToGroup } from "../controllers/transactionController.js";

const router = express.Router();

router.post("/distribute/student", distributeTokensToStudent);
router.post("/distribute/group", distributeTokensToGroup);

export default router;