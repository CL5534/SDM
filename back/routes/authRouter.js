import express from "express";
import {
  signup,
  login,
  logout,
  checkSession,
  getUsers,
  updateRole,
  deleteUser,
  updatePassword,
} from "../controllers/authController.js";

import {
  getStations,
  updateStationStatus,
  createStation,
  deleteStation,
  getFailureReasons,
  createFailureReason,
  getMyHistory, 
} from "../controllers/station.js";

const router = express.Router();

// 로그인 체크(세션 기반)
function requireLogin(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.status(401).json({ message: "로그인이 필요합니다." });
}

// 인증 관련
router.get("/me", checkSession);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// 회원 관리(Role) 관련 
router.get("/users", requireLogin, getUsers);
router.post("/updateRole", requireLogin, updateRole);
router.delete("/users/:id", requireLogin, deleteUser);
router.post("/updatePassword", requireLogin, updatePassword);

// 충전소 관련 
router.get("/stations", getStations);
router.post("/stations", requireLogin, createStation);
router.put("/stations/:id", requireLogin, updateStationStatus);
router.delete("/stations/:id", requireLogin, deleteStation);

// 고장 원인 관련 
router.get("/failure-reasons", requireLogin, getFailureReasons);
router.post("/failure-reasons", requireLogin, createFailureReason);

// 내 작업 내역(maintenance_history 기반)
router.get("/my-history", requireLogin, getMyHistory);

export default router;
