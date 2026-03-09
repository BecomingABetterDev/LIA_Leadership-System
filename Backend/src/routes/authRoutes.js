import express from "express";
import {
  studentLogin,
  studentLogout,
  studentUpdateAccount,
  studentResetPassword,
  studentDeleteAccount,
  listAllStudents,
  registerStudent, 
  adminLogin,
  adminLogout,
  adminUpdatePassword,
  clubLogin,
  clubLogout,
  clubUpdatePassword,
  clubResetPassword,
  clubDeleteAccount,
  createClub,
  checkStudentAuth,
  checkClubAuth,
  checkAdminAuth
} from "../controllers/authController.js";

import { protectRoute, protectClubRoute, protectAdminRoute } from "../middlewares/protectRoute.js";

const router = express.Router();

// STUDENT ROUTES
router.post("/students/login", studentLogin);
router.post("/students/logout", studentLogout);
router.put("/students/update", protectRoute, studentUpdateAccount);
router.put("/students/reset-password/:schoolId", studentResetPassword);
router.delete("/students/delete/:schoolId", studentDeleteAccount);
router.get("/students", listAllStudents);
router.get("/students/check", protectRoute, checkStudentAuth);


// ADMIN STUDENT REGISTRATION
router.post("/students/register", registerStudent); 

// ADMIN ROUTES
router.post("/admin/login", adminLogin);
router.post("/admin/logout", adminLogout);
router.put("/admin/update-password", adminUpdatePassword);
router.get("/admin/check", protectAdminRoute, checkAdminAuth);

// CLUB ROUTES
router.post("/clubs/login", clubLogin);
router.post("/clubs/logout", clubLogout);
router.put("/clubs/update-password", protectClubRoute, clubUpdatePassword);
router.put("/clubs/reset-password/:clubId", clubResetPassword);
router.delete("/clubs/delete/:clubId", clubDeleteAccount);
router.post("/clubs/create", createClub);
router.get("/clubs/check", protectClubRoute, checkClubAuth);



export default router;