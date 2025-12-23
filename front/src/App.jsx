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
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // ✅ 앱 로드 시 로컬스토리지 및 세션 확인
  useEffect(() => {
    // 1. 먼저 로컬스토리지에서 유저 정보를 가져와 즉시 반영 (속도 최적화)
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("로컬스토리지 데이터 파싱 에러", e);
      }
    }

    // 2. 서버 세션 확인 (최신 데이터 동기화 및 보안 확인)
    fetch("http://localhost:3000/api/auth/checkSession", {
      credentials: "include", 
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("세션 없음");
      })
      .then((data) => {
        if (data.isLoggedIn && data.user) {
          setUser(data.user);
          // 서버 데이터로 로컬스토리지 최신화
          localStorage.setItem("user", JSON.stringify(data.user));
        } else {
          // 세션이 유효하지 않으면 정보 삭제
          setUser(null);
          localStorage.removeItem("user");
          localStorage.removeItem("userRole");
        }
      })
      .catch(() => { 
        // 서버 연결 실패나 세션 만료 시 처리
        // 로그인 필수 페이지라면 여기서 추가 처리가 가능합니다.
      })
      .finally(() => setIsAuthReady(true));
  }, []);

  return (
    <BrowserRouter>
      {/* 공통 헤더 적용 */}
      <Header user={user} setUser={setUser} />

      <Routes>
        <Route path="/" element={<Navigate to="/main" replace />} />
        <Route path="/main" element={<Main user={user} setUser={setUser} />} />
        <Route path="/Login" element={<Login setUser={setUser} />} />
        <Route path="/SignUp" element={<SignUp setUser={setUser} />} />
        <Route path="/Role" element={<Role user={user} isAuthReady={isAuthReady} />} />
        <Route path="/StationManagement" element={<StationManagement user={user} />} />
        <Route path="/NewStationManagement" element={<NewStationManagement user={user} isAuthReady={isAuthReady} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;