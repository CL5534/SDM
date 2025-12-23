import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./StationManagement.css";

function StationManagement({ user }) {
  const navigate = useNavigate();
  const [chargers, setChargers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- 작업 내역(히스토리) 관련 State ---
  const [showHistory, setShowHistory] = useState(false);
  const [historyIds, setHistoryIds] = useState([]);

  const [failureReasons, setFailureReasons] = useState([]);
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  useEffect(function () {
    if (user) {
      const stored = localStorage.getItem(`station_history_${user.id}`);
      if (stored) setHistoryIds(JSON.parse(stored));
    }
  }, [user]);

  useEffect(function () {
    fetchChargers();
    fetchFailureReasons();
  }, []);

  async function fetchChargers() {
    try {
      const response = await fetch("http://localhost:3000/api/auth/stations");
      const data = await response.json();
      if (response.ok) setChargers(data);
      setLoading(false);
    } catch (error) {
      console.error("서버 연결 실패:", error);
      setLoading(false);
    }
  }

  async function fetchFailureReasons() {
    try {
      const response = await fetch(
        "http://localhost:3000/api/auth/failure-reasons"
      );
      if (response.ok) {
        const data = await response.json();
        setFailureReasons(data);
      }
    } catch (error) {
      console.error("고장 원인 로드 실패:", error);
    }
  }

  // 1) 점검자(role_id === 2)인 경우 '사용 가능(1)' 상태는 제외하고 보여줌
  let displayChargers = chargers;
  if (user && Number(user.role_id) === 2) {
    displayChargers = displayChargers.filter(function (charger) {
      return Number(charger.status_id) !== 1;
    });
  }

  // 2) 검색어 필터링
  const searchResults = displayChargers.filter(function (charger) {
    return charger.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // 3) 검색 결과가 있으면 결과값, 없으면 전체(필터된) 리스트
  const filteredChargers =
    searchTerm && searchResults.length > 0 ? searchResults : displayChargers;

  // --- 페이지네이션 계산 ---
  const totalPages = Math.ceil(filteredChargers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredChargers.slice(indexOfFirstItem, indexOfLastItem);

  function handleSearch(e) {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }

  function paginate(pageNumber) {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  }

  async function handleDelete(stationId) {
    if (!window.confirm(`No.${stationId} 충전소를 정말 삭제하시겠습니까?`)) return;
    try {
      const response = await fetch(
        `http://localhost:3000/api/auth/stations/${stationId}`,
        { method: "DELETE" }
      );
      if (response.ok) {
        alert("삭제되었습니다.");
        fetchChargers();
      }
    } catch (error) {
      alert("서버 연결 실패");
    }
  }

  async function handleUpdate(stationId, newStatusId, newFailureId) {
    try {
      const updatedFailureId = newStatusId === "1" ? null : newFailureId;

      const response = await fetch(
        `http://localhost:3000/api/auth/stations/${stationId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status_id: newStatusId,
            failure_reason_id: updatedFailureId,
          }),
        }
      );

      if (response.ok) {
        fetchChargers();

        // 수정 성공 시 히스토리에 저장
        if (user) {
          setHistoryIds(function (prev) {
            if (!prev.includes(stationId)) {
              const newHistory = [stationId, ...prev];
              localStorage.setItem(
                `station_history_${user.id}`,
                JSON.stringify(newHistory)
              );
              return newHistory;
            }
            return prev;
          });
        }
      }
    } catch (error) {
      console.error("업데이트 에러:", error);
    }
  }

  // 체크박스 변경 핸들러 (다중 선택)
  function handleFailureCheck(charger, reasonId) {
    const current = charger.failure_reason_id
      ? String(charger.failure_reason_id).split(",")
      : [];

    let next;
    if (current.includes(reasonId)) {
      next = current.filter(function (id) {
        return id !== reasonId;
      });
    } else {
      next = [...current, reasonId];
    }

    next.sort(); // 1,2,3 순서 유지
    const nextReasonId = next.length > 0 ? next.join(",") : null;
    handleUpdate(charger.id, String(charger.status_id), nextReasonId);
  }

  if (loading) return <div className="loading">데이터 로딩 중...</div>;

  return (
    <div className="station-management-page">
      <header className="station-management-header">
        <button onClick={() => navigate("/main")} className="back-btn">
          ← 메인으로
        </button>
        <h1>충전소 관리 및 현황</h1>

        <div className="header-controls">
          <input
            type="text"
            placeholder="충전소명 검색"
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />

          {user && Number(user.role_id) === 2 && (
            <button
              onClick={() => setShowHistory(true)}
              className="history-btn"
            >
              📋 작업 내역
            </button>
          )}

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
                {user && Number(user.role_id) === 1 && <th>관리</th>}
              </tr>
            </thead>

            <tbody>
              {currentItems.map(function (charger) {
                return (
                  <tr key={charger.id}>
                    <td className="td-no">{charger.id}</td>

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

                    <td>{charger.detail_location}</td>

                    <td>
                      <div className="reasonDropdownWrap">
                        <div
                          className="reasonDropdownToggle"
                          onClick={() =>
                            setActiveDropdownId(
                              activeDropdownId === charger.id ? null : charger.id
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

                        {activeDropdownId === charger.id && (
                          <div className="reasonDropdownMenu">
                            {failureReasons.map(function (reason) {
                              const checked = charger.failure_reason_id
                                ? String(charger.failure_reason_id)
                                    .split(",")
                                    .includes(String(reason.id))
                                : false;

                              const disabled = !(
                                Number(charger.status_id) === 3 ||
                                (user &&
                                  Number(user.role_id) === 1 &&
                                  Number(charger.status_id) !== 1)
                              );

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

        {totalPages > 0 && (
          <div className="pagination">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="page-btn"
            >
              &lt; 이전
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(function (number) {
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

      {/* 작업 내역 팝업 */}
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
                  {chargers.filter((c) => historyIds.includes(c.id)).length > 0 ? (
                    chargers
                      .filter((c) => historyIds.includes(c.id))
                      .map(function (charger) {
                        return (
                          <tr key={charger.id}>
                            <td>{charger.id}</td>
                            <td>{charger.name}</td>

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
                                              handleFailureCheck(
                                                charger,
                                                String(reason.id)
                                              )
                                            }
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
