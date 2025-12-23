// app.js
import express from "express";
import cors from "cors";
import session from "express-session"; // 세션 미들웨어 추가
import authRouter from "./routes/authRouter.js"; // 라우터 가져오기

const app = express();

// 1. 요청 로그 미들웨어 (디버깅용)
app.use((req, res, next) => {
  console.log(`[요청] ${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// 2. 세션 설정 (필수: 로그인 유지)
app.use(session({
  secret: 'cdm_secret_key', // 보안을 위해 임의의 문자열 설정
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // http 환경에서는 false
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 1일
  }
}));

// 라우터 등록 (이제 /signup 요청이 오면 authRouter가 처리함)
app.use("/api/auth", authRouter); 

// 404 에러 핸들러 (API 경로를 못 찾을 경우 JSON 응답)
app.use((req, res, next) => {
  res.status(404).json({ message: `경로를 찾을 수 없습니다: ${req.method} ${req.url}` });
});

app.listen(3000, () => {
  console.log("서버 실행 중...");
});