import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Role.css";

function Role({ user, isAuthReady }) {
  // 페이지 이동(뒤로가기/메인 이동)에 사용
  const navigate = useNavigate();
  // (현재 코드에서는 미사용) 알림 중복 방지용으로 쓰려고 만든 ref
  const alertShown = useRef(false);
  // 서버에서 받아온 회원 목록 저장
  const [userList, setUserList] = useState([]);
  // 회원 목록 로딩 상태(로딩 화면 표시용)
  const [isLoading, setIsLoading] = useState(true);
  useEffect(function () {
    // 세션 체크가 아직 안 끝났으면 API 호출하지 않고 대기
    if (!isAuthReady) return;

    // 인증 준비 완료되면 회원 목록 조회
    fetchUsers();
  }, [user, isAuthReady, navigate]);

  // 유저 목록 불러오기(API: GET /users)
  function fetchUsers() {
    fetch("http://localhost:3000/api/auth/users", { credentials: "include" })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        // 서버에서 받은 회원 리스트를 state에 저장
        setUserList(data);
        setIsLoading(false);
      })
      .catch(function (err) {
        console.error("로딩 실패:", err);
      });
  }

  // 권한 수정 기능(셀렉트 변경 즉시 서버 저장 + 화면 반영)
  async function handleRoleChange(userId, newRoleId) {
    try {
      // API: POST /updateRole (id, role_id 전달)
      const res = await fetch("http://localhost:3000/api/auth/updateRole", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: userId, role_id: Number(newRoleId) }),
      });

      // 성공하면 프론트 state(userList)도 같이 업데이트(새로고침 없이 반영)
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

  // 회원 삭제 기능(확인창 → 서버 삭제 → 성공 시 리스트에서 제거)
  async function handleDeleteUser(id, name) {
    // 실수 삭제 방지를 위해 confirm으로 한 번 더 확인
    if (!window.confirm(`${name} 사용자를 정말로 삭제하시겠습니까?`)) return;

    try {
      // API: DELETE /users/:id
      const res = await fetch(`http://localhost:3000/api/auth/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      // 성공하면 화면에서도 해당 회원 제거(필터링)
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

  // 비밀번호 변경 기능(prompt로 새 비번 입력 → 서버 저장)
  async function handlePasswordChange(id) {
    // 새 비밀번호 입력 받기
    const newPassword = prompt("새로운 비밀번호를 입력하세요.");

    // 입력 취소(null) 또는 4자리 미만이면 중단(예외처리)
    if (!newPassword || newPassword.length < 4) {
      if (newPassword !== null) alert("비밀번호는 최소 4자 이상이어야 합니다.");
      return;
    }

    try {
      // API: POST /updatePassword (id, newPassword 전달)
      const res = await fetch("http://localhost:3000/api/auth/updatePassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: id, newPassword: newPassword }),
      });

      // 성공 시 알림
      if (res.ok) alert("비밀번호가 변경되었습니다.");
    } catch (err) {
      alert("변경 실패");
    }
  }

  // 로딩 중이면 로딩 화면 표시
  if (isLoading) return <div className="loading">데이터를 불러오는 중...</div>;

  return (
    <div className="role-container">
      <header className="role-header">
        {/* 메인으로 이동 */}
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
              {/* userList(서버 데이터) → map으로 테이블 행 생성 */}
              {userList.map(function (u) {
                return (
                  <tr key={u.id}>
                    {/* 회원 고유 ID */}
                    <td className="td-id">{u.id}</td>

                    {/* 이름/이메일 표시 */}
                    <td>{u.name}</td>
                    <td>{u.email}</td>

                    {/* 권한 수정 드롭다운 */}
                    <td>
                      <select
                        // admin@gmail.com 계정은 권한 변경을 막기 위해 비활성화(예외처리)
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

                    {/* 관리 액션(PW수정/삭제) */}
                    <td>
                      {/* admin@gmail.com은 삭제/비번변경 버튼도 숨김(예외처리) */}
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
