import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Google from "./Google";

import "./Main.css";

function Main({ user, setUser }) {
  const location = useLocation();
  const initialSearch = location.state?.search || "";
  const [stations, setStations] = useState([]);

  useEffect(function () {
    fetch("http://localhost:3000/api/auth/stations")
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        if (Array.isArray(data)) setStations(data);
      })
      .catch(function (err) {
        console.error("충전소 데이터 로드 실패:", err);
      });
  }, []);

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
