import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Google from "./Google";
import "./Main.css";

function Main({ user, setUser }) {
  const location = useLocation();
  const navigate = useNavigate();

  const initialSearch = location.state?.search || "";
  const [stations, setStations] = useState([]);

  useEffect(function () {
    fetch("http://localhost:3000/api/auth/stations", {
      credentials: "include", // ✅ 세션 쿠키 포함 (requireLogin 통과용)
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        if (!data) return;
        if (Array.isArray(data)) setStations(data);
        else setStations([]); // 🔴 혹시 모를 예외 방어
      })
      .catch(function (err) {
        console.error("충전소 데이터 로드 실패:", err);
      });
  }, [navigate]);

  return (
    <div className="mainPage">
      <main className="content contentLeft">
        <h1 className="pageTitle">충전기 위치 지도</h1>

        <Google initialQuery={initialSearch} stations={stations} />
      </main>
    </div>
  );
}

export default Main;
