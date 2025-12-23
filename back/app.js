// app.js
import express from "express";
import cors from "cors";
import session from "express-session";
import authRouter from "./routes/authRouter.js";

const app = express();

// 1. 요청 로그 미들웨어 (디버깅용)
app.use(function (req, res, next) {
  console.log(`[요청] ${req.method} ${req.url}`);
  next();
});

app.use(express.json());

// 🔴 CORS는 session보다 먼저 + credentials true 유지
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// 2. 세션 설정 (필수: 로그인 유지)
app.use(
  session({
    secret: "cdm_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,        // http 환경에서는 false
      httpOnly: true,
      sameSite: "lax",      // 🔴 추가: 로컬(포트 다름)에서도 쿠키 전달 안정
      maxAge: 1000 * 60 * 60 * 24, // 1일
    },
  })
);

// 라우터 등록
app.use("/api/auth", authRouter);

// 404 에러 핸들러
app.use(function (req, res, next) {
  res
    .status(404)
    .json({ message: `경로를 찾을 수 없습니다: ${req.method} ${req.url}` });
});

app.listen(3000, function () {
  console.log("서버 실행 중...");
});
