import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Google from "./Google";
import "./Main.css";

function Main({ user, setUser }) {
  // 라우터에서 전달된 state(검색어 등) 받기 + 페이지 이동용
  const location = useLocation();
  const navigate = useNavigate();
  // 이전 화면에서 넘어온 검색어가 있으면 초기 검색값으로 사용
  const initialSearch = location.state?.search || "";
  // 백엔드에서 가져온 충전소 목록 저장
  const [stations, setStations] = useState([]);

  useEffect(function () {
    // 충전소 전체 목록 조회 API 호출 (세션 쿠키 포함)
    fetch("http://localhost:3000/api/auth/stations", {
      credentials: "include", 
    })
      .then(function (res) {
        // 응답 JSON 파싱
        return res.json();
      })
      .then(function (data) {
        // 데이터가 없으면 종료
        if (!data) return;

        // 배열이면 그대로 저장, 아니면 안전하게 빈 배열 처리(화면 오류 방지)
        if (Array.isArray(data)) setStations(data);
        else setStations([]); 
      })
      .catch(function (err) {
        // 네트워크/서버 오류 시 콘솔로 확인
        console.error("충전소 데이터 로드 실패:", err);
      });
  }, [navigate]);

  return (
    <div className="mainPage">
      <main className="content contentLeft">
        {/* 지도 페이지 제목 */}
        <h1 className="pageTitle">충전기 위치 지도</h1>

        {/* Google 컴포넌트에 초기 검색어 + 충전소 목록 전달 */}
        <Google initialQuery={initialSearch} stations={stations} />
      </main>
    </div>
  );
}

export default Main;
