import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import Main from "../components/Main";
import SignUp from "../components/SignUp";
import Login from "../components/Login";
import Role from "../components/Role";
import StationManagement from "../components/StationManagement";
import NewStationManagement from "../components/NewStationManagement";
import Header from "../components/Header";

function App() {
  // 현재 로그인 유저 정보(없으면 null)
  const [user, setUser] = useState(null);
  // 서버 세션 체크가 끝났는지 여부(권한/페이지 접근 제어에 사용)
  const [isAuthReady, setIsAuthReady] = useState(false);
  // 앱 최초 로드 시: 로컬스토리지 유저 반영 + 서버 세션 동기화
  useEffect(() => {
    // 로컬스토리지에서 유저 정보를 먼저 가져와 화면에 빠르게 반영(속도 최적화)
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("로컬스토리지 데이터 파싱 에러", e);
      }
    }

    // 서버 세션 확인: 실제 로그인 상태/권한을 최종 확정(보안 + 최신화)
    fetch("http://localhost:3000/api/auth/checkSession", {
      credentials: "include", // 세션 쿠키 포함(Express-session 등)
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("세션 없음");
      })
      .then((data) => {
        // 세션이 유효하면 서버의 유저 정보를 기준으로 state/로컬스토리지 최신화
        if (data.isLoggedIn && data.user) {
          setUser(data.user);

          // 서버 데이터로 로컬스토리지 최신화(새로고침해도 로그인 유지)
          localStorage.setItem("user", JSON.stringify(data.user));
        } else {
          // 세션이 유효하지 않으면 로컬/상태 초기화
          setUser(null);
          localStorage.removeItem("user");
          localStorage.removeItem("userRole");
        }
      })
      .catch(() => {
        // 서버 연결 실패 / 세션 만료 등 (여기서는 조용히 처리)
        // 필요하면 여기서 "로그인 필요" 안내나 리다이렉트도 가능
      })
      .finally(() => setIsAuthReady(true)); // 세션 체크 완료 표시
  }, []);

  return (
    <BrowserRouter>
      {/* 모든 페이지에 공통 헤더 적용(로그인 상태에 따라 메뉴가 달라짐) */}
      <Header user={user} setUser={setUser} />

      <Routes>
        <Route path="/" element={<Navigate to="/main" replace />} />
        <Route path="/main" element={<Main user={user} setUser={setUser} />} />
        <Route path="/Login" element={<Login setUser={setUser} />} />
        <Route path="/SignUp" element={<SignUp setUser={setUser} />} />
        <Route path="/Role" element={<Role user={user} isAuthReady={isAuthReady} />} />
        <Route path="/StationManagement" element={<StationManagement user={user} />} />
        {/* 충전소 등록(관리자 화면) - 세션 체크 완료 여부 전달 */}
        <Route
          path="/NewStationManagement"
          element={<NewStationManagement user={user} isAuthReady={isAuthReady} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
