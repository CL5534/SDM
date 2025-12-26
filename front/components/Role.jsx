import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Role.css";

function Role({ user, isAuthReady }) {
  const navigate = useNavigate();
  const alertShown = useRef(false);

  const [userList, setUserList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(function () {
    // 세션 체크가 아직 안 끝났으면 대기
    if (!isAuthReady) return;

    fetchUsers();
  }, [user, isAuthReady, navigate]);

  // 유저 목록 불러오기 함수
  function fetchUsers() {
    fetch("http://localhost:3000/api/auth/users", { credentials: "include" })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        setUserList(data);
        setIsLoading(false);
      })
      .catch(function (err) {
        console.error("로딩 실패:", err);
      });
  }

  // 권한 수정 기능 (변경 즉시 서버 저장)
  async function handleRoleChange(userId, newRoleId) {
    try {
      const res = await fetch("http://localhost:3000/api/auth/updateRole", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: userId, role_id: Number(newRoleId) }),
      });

      if (res.ok) {
        setUserList(function (prev) {
          return prev.map(function (u) {
            return u.id === userId ? { ...u, role_id: Number(newRoleId) } : u;
          });
        });
        alert("권한이 수정되었습니다.");
      }
    } catch (err) {
      alert("권한 수정 중 오류가 발생했습니다.");
    }
  }

  // 삭제 기능
  async function handleDeleteUser(id, name) {
    if (!window.confirm(`${name} 사용자를 정말로 삭제하시겠습니까?`)) return;

    try {
      const res = await fetch(`http://localhost:3000/api/auth/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        alert("삭제되었습니다.");
        setUserList(function (prev) {
          return prev.filter(function (u) {
            return u.id !== id;
          });
        });
      }
    } catch (err) {
      alert("삭제 실패");
    }
  }

  // 비밀번호 수정 기능
  async function handlePasswordChange(id) {
    const newPassword = prompt("새로운 비밀번호를 입력하세요.");
    if (!newPassword || newPassword.length < 4) {
      if (newPassword !== null) alert("비밀번호는 최소 4자 이상이어야 합니다.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/auth/updatePassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: id, newPassword: newPassword }),
      });

      if (res.ok) alert("비밀번호가 변경되었습니다.");
    } catch (err) {
      alert("변경 실패");
    }
  }

  if (isLoading) return <div className="loading">데이터를 불러오는 중...</div>;

  return (
    <div className="role-container">
      <header className="role-header">
        <button
          onClick={function () {
            navigate("/");
          }}
          className="back-btn"
        >
          ← 메인으로
        </button>
        <h1>회원 정보 관리 (관리자)</h1>
      </header>

      <div className="role-content">
        <div className="table-container">
          <table className="role-table">
            <thead>
              <tr>
                <th className="th-id">ID</th>
                <th className="th-name">이름</th>
                <th className="th-email">이메일</th>
                <th className="th-role">권한 수정</th>
                <th className="th-actions">관리 액션</th>
              </tr>
            </thead>

            <tbody>
              {/* userList(서버 데이터) → map으로 테이블 생성 */}
              {userList.map(function (u) {
                return (
                  <tr key={u.id}>
                    <td className="td-id">{u.id}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <select
                  /* admin@gmail.com 계정은 권한 변경을 막기 위해 select 비활성화 */
                        value={u.role_id}
                        onChange={function (e) {
                          handleRoleChange(u.id, e.target.value);
                        }}
                        className="role-select"
                        disabled={u.email === "admin@gmail.com"}
                      >
                        <option value={1}>관리자</option>
                        <option value={2}>점검자</option>
                      </select>
                    </td>
                    <td>
                      {u.email !== "admin@gmail.com" && (
                        <>
                          <button
                            onClick={function () {
                              handlePasswordChange(u.id);
                            }}
                            className="btn-pw"
                          >
                            PW수정
                          </button>
                          <button
                            onClick={function () {
                              handleDeleteUser(u.id, u.name);
                            }}
                            className="btn-del"
                          >
                            삭제
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Role;
