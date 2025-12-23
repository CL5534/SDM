import express from "express";
import { signup, login, checkSession, getUsers, updateRole, deleteUser, updatePassword } from "../controllers/authController.js";
// 1. 컨트롤러에서 새로 만든 함수 2개를 추가로 import 합니다.
import { 
    getStations, 
    updateStationStatus, 
    createStation, 
    deleteStation, 
    getFailureReasons,   // 추가
    createFailureReason  // 추가
} from "../controllers/Station.js";

const router = express.Router();

// --- 인증 관련 ---
router.get("/me", checkSession); 
router.post("/signup", signup);
router.post("/login", login);

// --- 회원 관리(Role) 관련 ---
router.get("/users", getUsers);
router.post("/updateRole", updateRole);
router.delete("/users/:id", deleteUser);
router.post("/updatePassword", updatePassword);

// --- 충전소 관련 ---
router.get("/stations", getStations);
router.post("/stations", createStation);
router.put("/stations/:id", updateStationStatus);
router.delete("/stations/:id", deleteStation);

// --- ★ 고장 원인 관련 (새로 추가) ★ ---
// 고장 원인 목록을 가져오는 경로
router.get("/failure-reasons", getFailureReasons);
// 새로운 고장 원인을 등록하는 경로
router.post("/failure-reasons", createFailureReason);

export default router;