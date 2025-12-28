import { useNavigate, Link } from "react-router-dom";
import "./Header.css";

function Header({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = function () {
    // 프론트 저장값 삭제(자동 로그인/권한 유지용 데이터 제거)
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");

    // 상위 state도 비워서 화면을 즉시 로그아웃 상태로 전환
    if (setUser) setUser(null);

    // 백엔드 세션 로그아웃 요청(세션/쿠키 정리 목적)
    fetch("http://localhost:3000/api/auth/logout", {
      method: "POST",
      credentials: "include", // 쿠키 기반 세션이면 필수(세션 쿠키 같이 보냄)
    }).catch(function () {
      // 로그아웃 요청 실패해도 프론트는 로그아웃 처리 진행(사용자 경험 우선)
    });

    // 사용자 안내 후 로그인/메인 화면으로 이동
    alert("로그아웃 되었습니다.");
    navigate("/");
  };

  return (
    <header className="topNav">
      <div className="navInner">
        {/* 왼쪽: 로고/브랜드 영역 (클릭 시 메인 페이지 이동) */}
        <div className="navLeft" onClick={() => navigate("/Main")}>
          <div className="brandIcon" aria-hidden="true">
            {/* 브랜드 아이콘 SVG */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M7 14h6m-5 5h4m7-8a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M12 5v2"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="brandText">S.D.M</div>
        </div>

        {/* 중앙: 네비게이션 메뉴 */}
        <nav className="navCenter">
          {/* 공통 메뉴: 대시보드 */}
          <Link to="/Main" className="navItem">
            데시보드
          </Link>

          {/* 관리자(role_id=1)만 보이는 메뉴: 회원관리 */}
          {user && Number(user.role_id) === 1 && (
            <Link to="/Role" className="navItem">
              회원관리
            </Link>
          )}

          {/* 로그인한 사용자만 보이는 메뉴: 충전소관리 */}
          {user && (
            <Link to="/StationManagement" className="navItem">
              충전소관리
            </Link>
          )}

          {/* 관리자(role_id=1)만 보이는 메뉴: 충전소등록 */}
          {user && Number(user.role_id) === 1 && (
            <Link to="/NewStationManagement" className="navItem">
              충전소등록
            </Link>
          )}
        </nav>

        {/* 오른쪽: 로그인 상태 표시 / 로그인·로그아웃 버튼 */}
        <div className="navRight">
          {user ? (
            <div className="user-info">
              {/* 로그인 상태일 때: 사용자 이름 표시 */}
              <span className="user-name">{user.name}님</span>

              {/* 로그아웃 버튼 */}
              <button className="logoutBtn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            // 비로그인 상태일 때: 로그인 버튼
            <button
              className="loginBtn"
              type="button"
              onClick={() => navigate("/Login")}
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
