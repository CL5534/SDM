import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./StationManagement.css";

function StationManagement({ user }) {
  const navigate = useNavigate();

  // 충전소(충전기) 목록 데이터
  const [chargers, setChargers] = useState([]);
  // 로딩 상태(처음 데이터 불러오는 동안 화면 제어)
  const [loading, setLoading] = useState(true);
  // 검색어(충전소명 기준 필터)
  const [searchTerm, setSearchTerm] = useState("");
  // 페이지네이션(현재 페이지 / 페이지당 개수)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // 작업 내역(maintenance_history) 팝업 표시 여부
  const [showHistory, setShowHistory] = useState(false);
  // 내가 작업한 충전소 id 목록(예: [3,7,12])
  const [historyIds, setHistoryIds] = useState([]);
  // 고장 원인 목록(드롭다운 체크박스에 사용)
  const [failureReasons, setFailureReasons] = useState([]);
  // 어떤 행(row)의 고장원인 드롭다운이 열려있는지 추적
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  // 화면 최초 진입 시: 충전소 목록 + 고장원인 목록 불러오기
  useEffect(function () {
    fetchChargers();
    fetchFailureReasons();
  }, []);

  // user가 바뀌면(로그인/로그아웃): 작업내역도 새로 불러오기
  useEffect(function () {
    if (user) {
      fetchMyHistoryIds();
    } else {
      setHistoryIds([]);
    }
  }, [user]);

  // 드롭다운이 열려있을 때: 바깥 클릭하면 드롭다운 닫기
  useEffect(function () {
    if (!activeDropdownId) return;

    function handleClickOutside(e) {
      // .reasonDropdownWrap 밖을 클릭하면 닫기
      if (!e.target.closest(".reasonDropdownWrap")) {
        setActiveDropdownId(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return function () {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeDropdownId]);

  // 충전소 목록 불러오기(API: GET /stations)
  async function fetchChargers() {
    try {
      const response = await fetch("http://localhost:3000/api/auth/stations", {
        credentials: "include", // 세션 쿠키 포함
      });

      // 로그인 안 되어있으면 로그인 화면으로 이동
      if (response.status === 401) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      const data = await response.json();

      // 정상 응답이면 목록 state 업데이트
      if (response.ok) setChargers(data);

      setLoading(false);
    } catch (error) {
      console.error("서버 연결 실패:", error);
      setLoading(false);
    }
  }

  // 고장 원인 목록 불러오기(API: GET /failure-reasons)
  async function fetchFailureReasons() {
    try {
      const response = await fetch("http://localhost:3000/api/auth/failure-reasons", {
        credentials: "include",
      });

      if (response.status === 401) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      // 드롭다운에서 사용할 원인 목록 저장
      if (response.ok) {
        const data = await response.json();
        setFailureReasons(data);
      }
    } catch (error) {
      console.error("고장 원인 로드 실패:", error);
    }
  }

  // DB(maintenance_history)에서 내가 작업한 충전소 id 목록 불러오기
  async function fetchMyHistoryIds() {
    try {
      const response = await fetch("http://localhost:3000/api/auth/my-history", {
        credentials: "include",
      });

      // 세션 없으면 여기서는 그냥 종료(팝업 띄우기 전에 막는 용도)
      if (response.status === 401) {
        return;
      }

      if (response.ok) {
        const data = await response.json(); // 예: [3, 7, 12...]
        setHistoryIds(data);
      }
    } catch (error) {
      console.error("작업 내역 로드 실패:", error);
    }
  }

  // 점검자(role_id===2)인 경우: 사용 가능(1)은 목록에서 제외하고 보여줌
  let displayChargers = chargers;
  if (user && Number(user.role_id) === 2) {
    displayChargers = displayChargers.filter(function (charger) {
      return Number(charger.status_id) !== 1;
    });
  }

  // 검색어로 충전소명 필터링
  const searchResults = displayChargers.filter(function (charger) {
    return charger.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // 검색어가 있고 결과가 있으면 검색 결과를, 없으면 전체 목록(필터된 목록)을 사용
  const filteredChargers =
    searchTerm && searchResults.length > 0 ? searchResults : displayChargers;

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredChargers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredChargers.slice(indexOfFirstItem, indexOfLastItem);

  // 검색 입력 시: 검색어 반영 + 1페이지로 초기화
  function handleSearch(e) {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }

  // 페이지 이동
  function paginate(pageNumber) {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  }

  // 충전소 삭제(API: DELETE /stations/:id) - 관리자만 버튼이 보임
  async function handleDelete(stationId) {
    if (!window.confirm(`No.${stationId} 충전소를 정말 삭제하시겠습니까?`)) return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/auth/stations/${stationId}`,
        { method: "DELETE", credentials: "include" }
      );

      if (response.status === 401) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      // 삭제 성공 시 목록 다시 불러오기
      if (response.ok) {
        alert("삭제되었습니다.");
        fetchChargers();
      }
    } catch (error) {
      alert("서버 연결 실패");
    }
  }

  // 상태/고장원인 업데이트(API: PUT /stations/:id)
  async function handleUpdate(stationId, newStatusId, newFailureId) {
    try {
      // 상태가 "사용 가능(1)"이면 고장 원인은 null 처리
      const updatedFailureId = newStatusId === "1" ? null : newFailureId;

      const response = await fetch(
        `http://localhost:3000/api/auth/stations/${stationId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status_id: newStatusId,
            failure_reason_id: updatedFailureId,
          }),
        }
      );

      if (response.status === 401) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      if (response.ok) {
        // 화면 목록 최신화(서버 값 다시 가져오기)
        fetchChargers();

        // 내가 수정한 충전소는 작업내역에 바로 반영(중복 추가 방지)
        setHistoryIds(function (prev) {
          if (!prev.includes(stationId)) {
            return [stationId, ...prev];
          }
          return prev;
        });
      }
    } catch (error) {
      console.error("업데이트 에러:", error);
    }
  }

  // 고장 원인 체크박스 변경(다중 선택)
  // - failure_reason_id를 "1,3,5" 형태로 유지
  function handleFailureCheck(charger, reasonId) {
    const current = charger.failure_reason_id
      ? String(charger.failure_reason_id).split(",")
      : [];

    let next;
    if (current.includes(reasonId)) {
      // 이미 체크된 값이면 제거
      next = current.filter(function (id) {
        return id !== reasonId;
      });
    } else {
      // 체크 안 된 값이면 추가
      next = [...current, reasonId];
    }

    // 정렬 후 다시 문자열로 합치기
    next.sort();
    const nextReasonId = next.length > 0 ? next.join(",") : null;

    // 서버로 업데이트 요청(상태는 그대로 유지)
    handleUpdate(charger.id, String(charger.status_id), nextReasonId);
  }

  // 로딩 중이면 로딩 화면 표시
  if (loading) return <div className="loading">데이터 로딩 중...</div>;

  return (
    <div className="station-management-page">
      <header className="station-management-header">
        {/* 메인 화면으로 이동 */}
        <button onClick={() => navigate("/main")} className="back-btn">
          ← 메인으로
        </button>

        <div style={{ display: "flex", gap: "10px" }}></div>

        <h1>충전소 관리 및 현황</h1>

        <div className="header-controls">
          {/* 충전소명 검색 입력창 */}
          <input
            type="text"
            placeholder="충전소명 검색"
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />

          {/* 점검자(role_id===2): 작업 내역 버튼 표시 */}
          {user && Number(user.role_id) === 2 && (
            <button
              onClick={async function () {
                await fetchMyHistoryIds(); // 최신 작업내역을 먼저 갱신
                setShowHistory(true); // 팝업 열기
              }}
              className="history-btn"
            >
              📋 작업 내역
            </button>
          )}

          {/* 관리자(role_id===1): 충전소 등록 버튼 표시 */}
          {user && Number(user.role_id) === 1 && (
            <button
              onClick={() => navigate("/NewStationManagement")}
              className="add-station-btn"
            >
              + 충전소 등록
            </button>
          )}
        </div>
      </header>

      <div className="station-management-content">
        <div className="table-container">
          <table className="charger-table">
            <thead>
              <tr>
                <th className="th-no">No.</th>
                <th className="th-name">충전소명 (위치)</th>
                <th className="th-detail">상세 위치</th>
                <th className="th-reason">고장 원인</th>
                <th>상태</th>

                {/* 관리자만 삭제 버튼 컬럼 표시 */}
                {user && Number(user.role_id) === 1 && <th>관리</th>}
              </tr>
            </thead>

            <tbody>
              {currentItems.map(function (charger) {
                return (
                  <tr key={charger.id}>
                    {/* 충전소 고유번호 */}
                    <td className="td-no">{charger.id}</td>

                    {/* 충전소명 클릭 시: 메인 지도 화면으로 이동하면서 검색어 전달 */}
                    <td>
                      <div
                        className="charger-name"
                        onClick={() =>
                          navigate("/main", { state: { search: charger.name } })
                        }
                      >
                        {charger.name}
                      </div>
                      <div className="charger-address">{charger.address}</div>
                    </td>

                    {/* 상세 위치 */}
                    <td>{charger.detail_location}</td>

                    {/* 고장 원인(체크박스 다중선택 드롭다운) */}
                    <td>
                      <div className="reasonDropdownWrap">
                        {/* 드롭다운 토글 버튼 */}
                        <div
                          className="reasonDropdownToggle"
                          onClick={() =>
                            setActiveDropdownId(
                              activeDropdownId === charger.id ? null : charger.id
                            )
                          }
                        >
                          <span className="reasonDropdownText">
                            {/* 선택된 원인 id들을 이름으로 변환해서 표시 */}
                            {charger.failure_reason_id
                              ? failureReasons
                                  .filter(function (r) {
                                    return String(charger.failure_reason_id)
                                      .split(",")
                                      .includes(String(r.id));
                                  })
                                  .map(function (r) {
                                    return r.name;
                                  })
                                  .join(", ")
                              : "선택 안됨"}
                          </span>
                          <span className="reasonDropdownChevron">▼</span>
                        </div>

                        {/* 해당 row의 드롭다운이 열렸을 때만 메뉴 표시 */}
                        {activeDropdownId === charger.id && (
                          <div className="reasonDropdownMenu">
                            {failureReasons.map(function (reason) {
                              const checked = charger.failure_reason_id
                                ? String(charger.failure_reason_id)
                                    .split(",")
                                    .includes(String(reason.id))
                                : false;

                              // 체크박스 비활성화 조건
                              // - 기본: 고장(3)일 때만 가능
                              // - 예외: 관리자(role_id===1)는 사용 가능(1)만 아니면 선택 가능
                              const disabled = !(
                                Number(charger.status_id) === 3 ||
                                (user &&
                                  Number(user.role_id) === 1 &&
                                  Number(charger.status_id) !== 1)
                              );

                              return (
                                <label key={reason.id} className="reasonOptionLabel">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() =>
                                      handleFailureCheck(charger, String(reason.id))
                                    }
                                    disabled={disabled}
                                    className="reasonOptionCheckbox"
                                  />
                                  {reason.id}. {reason.name}
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* 상태 변경 select(사용 가능/점검 중/고장) */}
                    <td>
                      <select
                        value={charger.status_id}
                        onChange={(e) =>
                          handleUpdate(
                            charger.id,
                            e.target.value,
                            charger.failure_reason_id
                          )
                        }
                        className={`table-select status-select ${
                          Number(charger.status_id) === 3 ? "error" : ""
                        }`}
                      >
                        <option value="1">사용 가능</option>
                        <option value="2">점검 중</option>
                        <option value="3">고장</option>
                      </select>
                    </td>

                    {/* 관리자만 삭제 버튼 표시 */}
                    {user && Number(user.role_id) === 1 && (
                      <td>
                        <button
                          onClick={() => handleDelete(charger.id)}
                          className="delete-btn"
                        >
                          삭제
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/** 페이지네이션 UI **/}
        {totalPages > 0 && (
          <div className="pagination">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="page-btn"
            >
              &lt; 이전
            </button>

            {Array.from({ length: totalPages }, function (_, i) {
              return i + 1;
            }).map(function (number) {
              return (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`page-btn number ${
                    currentPage === number ? "active" : ""
                  }`}
                >
                  {number}
                </button>
              );
            })}

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="page-btn"
            >
              다음 &gt;
            </button>
          </div>
        )}
      </div>

      {/* 작업 내역 팝업(점검자 버튼 클릭 시 표시) */}
      {showHistory && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>내가 작업한 충전소 (수정 내역)</h2>
              <button
                onClick={() => setShowHistory(false)}
                className="close-btn"
              >
                &times;
              </button>
            </div>

            <div className="table-container">
              <table className="charger-table">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>충전소명</th>
                    <th>고장 원인</th>
                    <th>상태 (재수정 가능)</th>
                  </tr>
                </thead>

                <tbody>
                  {/* historyIds에 포함된 충전소가 있으면 목록 표시 */}
                  {chargers.filter((c) => historyIds.includes(c.id)).length > 0 ? (
                    chargers
                      .filter((c) => historyIds.includes(c.id))
                      .map(function (charger) {
                        return (
                          <tr key={charger.id}>
                            <td>{charger.id}</td>
                            <td>{charger.name}</td>

                            {/* 작업내역 팝업 안에서도 고장원인 수정 가능(조건 있음) */}
                            <td>
                              <div className="reasonDropdownWrap">
                                <div
                                  className="reasonDropdownToggle reasonDropdownToggle--history"
                                  onClick={() =>
                                    setActiveDropdownId(
                                      activeDropdownId === `history_${charger.id}`
                                        ? null
                                        : `history_${charger.id}`
                                    )
                                  }
                                >
                                  <span className="reasonDropdownText">
                                    {charger.failure_reason_id
                                      ? failureReasons
                                          .filter(function (r) {
                                            return String(charger.failure_reason_id)
                                              .split(",")
                                              .includes(String(r.id));
                                          })
                                          .map(function (r) {
                                            return r.name;
                                          })
                                          .join(", ")
                                      : "선택 안됨"}
                                  </span>
                                  <span className="reasonDropdownChevron">▼</span>
                                </div>

                                {activeDropdownId === `history_${charger.id}` && (
                                  <div className="reasonDropdownMenu">
                                    {failureReasons.map(function (reason) {
                                      const checked = charger.failure_reason_id
                                        ? String(charger.failure_reason_id)
                                            .split(",")
                                            .includes(String(reason.id))
                                        : false;

                                      return (
                                        <label
                                          key={reason.id}
                                          className="reasonOptionLabel"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() =>
                                              handleFailureCheck(charger, String(reason.id))
                                            }
                                            // 팝업에서는 "고장(3)"일 때만 체크박스 수정 가능
                                            disabled={Number(charger.status_id) !== 3}
                                            className="reasonOptionCheckbox"
                                          />
                                          {reason.id}. {reason.name}
                                        </label>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* 상태 변경(팝업에서도 수정 가능) */}
                            <td>
                              <select
                                value={charger.status_id}
                                onChange={(e) =>
                                  handleUpdate(
                                    charger.id,
                                    e.target.value,
                                    charger.failure_reason_id
                                  )
                                }
                                className={`table-select status-select status-select--history ${
                                  Number(charger.status_id) === 3 ? "error" : ""
                                }`}
                              >
                                <option value="1">사용 가능</option>
                                <option value="2">점검 중</option>
                                <option value="3">고장</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })
                  ) : (
                    // 작업내역이 없으면 안내 문구 출력
                    <tr>
                      <td colSpan="4">작업 내역이 없습니다.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StationManagement;
