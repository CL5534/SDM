import { useNavigate, Link } from "react-router-dom";
import "./Header.css";

function Header({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = function () {
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    if (setUser) setUser(null);

    // 백엔드 세션 로그아웃 (쿠키 삭제 등)
    fetch("http://localhost:3000/api/auth/logout", {
      method: "POST",
      credentials: "include",
    }).catch(function () {});

    alert("로그아웃 되었습니다.");
    navigate("/");
  };

  return (
    <header className="topNav">
      <div className="navInner">
        <div className="navLeft" onClick={() => navigate("/Main")}>
          <div className="brandIcon" aria-hidden="true">
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

        {/* 중앙 네비게이션 */}
        <nav className="navCenter">
          <Link to="/Main" className="navItem">
            데시보드
          </Link>

          {user && Number(user.role_id) === 1 && (
            <Link to="/Role" className="navItem">
              회원관리
            </Link>
          )}

          {user && (
            <Link to="/StationManagement" className="navItem">
              충전소관리
            </Link>
          )}

          {user && Number(user.role_id) === 1 && (
            <Link to="/NewStationManagement" className="navItem">
              충전소등록
            </Link>
          )}
        </nav>

        <div className="navRight">
          {user ? (
            <div className="user-info">
              <span className="user-name">{user.name}님</span>

              <button className="logoutBtn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
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
