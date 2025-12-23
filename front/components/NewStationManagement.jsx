import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./NewStationManagement.css";

function NewStationManagement({ user, isAuthReady }) {
  const navigate = useNavigate();
  const alertShown = useRef(false);

  const [failureReasons, setFailureReasons] = useState([]);
  const [newReasonText, setNewReasonText] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // ✅ 드롭다운 영역(체크박스 메뉴) 바깥 클릭 감지를 위한 ref
  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    address: "서울",
    detail_location: "",
    status_id: "1",
    failure_reason_id: "",
  });

  async function fetchFailureReasons() {
    try {
      const response = await fetch("http://localhost:3000/api/auth/failure-reasons");
      if (response.ok) {
        const data = await response.json();
        setFailureReasons(data);
      }
    } catch (error) {
      console.error("고장 원인 로드 실패:", error);
    }
  }

  useEffect(function () {
    if (!isAuthReady) return;

    if (!user || Number(user.role_id) !== 1) {
      if (alertShown.current) return;
      alertShown.current = true;
      alert("관리자 권한이 필요합니다.");
      navigate("/main");
      return;
    }

    fetchFailureReasons();
  }, [user, isAuthReady, navigate]);

  // ✅ 드롭다운이 열려있을 때: 바깥 클릭하면 닫기
  useEffect(function () {
    if (!isDropdownOpen) return;

    function handleOutsideClick(e) {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return function () {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isDropdownOpen]);

  // ✅ 상태가 고장(3)에서 벗어나면 드롭다운 닫기
  useEffect(function () {
    if (formData.status_id !== "3") {
      setIsDropdownOpen(false);
    }
  }, [formData.status_id]);

  if (!isAuthReady || !user || Number(user.role_id) !== 1) {
    return null;
  }

  function handleChange(e) {
    const name = e.target.name;
    const value = e.target.value;
    setFormData(function (prev) {
      return { ...prev, [name]: value };
    });
  }

  function handleNewReasonInput(e) {
    setNewReasonText(e.target.value);
  }

  function handleFailureCheck(reasonId) {
    const current = formData.failure_reason_id
      ? String(formData.failure_reason_id).split(",")
      : [];
    const rId = String(reasonId);

    var next;
    if (current.includes(rId)) {
      next = current.filter(function (id) {
        return id !== rId;
      });
    } else {
      next = current.concat([rId]);
    }

    next.sort(function (a, b) {
      return Number(a) - Number(b);
    });

    setFormData(function (prev) {
      return { ...prev, failure_reason_id: next.join(",") };
    });
  }

  async function handleAddFailureReason() {
    if (!newReasonText.trim()) {
      alert("추가할 내용을 입력하세요.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/auth/failure-reasons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newReasonText }),
      });

      if (response.ok) {
        const addedData = await response.json();
        setFailureReasons(function (prev) {
          return prev.concat([{ id: addedData.id, name: addedData.name }]);
        });
        setNewReasonText("");
        alert("새로운 고장 원인이 등록되었습니다.");
      } else {
        // 서버 연결 전 테스트용 (임시 로컬 업데이트)
        const tempId = failureReasons.length + 1;
        setFailureReasons(function (prev) {
          return prev.concat([{ id: tempId, name: newReasonText }]);
        });
        setNewReasonText("");
        alert("서버 연결 실패로 임시로 추가되었습니다.");
      }
    } catch (error) {
      console.error("원인 추가 에러:", error);
      alert("서버 연결에 실패했습니다.");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const submitData = {
      id: Number(formData.id),
      name: formData.name,
      address: formData.address,
      detail_location: formData.detail_location,
      status_id: Number(formData.status_id),
      failure_reason_id:
        formData.status_id === "3" && formData.failure_reason_id
          ? formData.failure_reason_id
          : null,
    };

    try {
      const response = await fetch("http://localhost:3000/api/auth/stations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("새로운 충전소가 성공적으로 등록되었습니다.");
        navigate("/StationManagement");
      } else {
        alert(data.message || "등록 실패");
      }
    } catch (error) {
      console.error("등록 에러:", error);
      alert("서버 연결 실패");
    }
  }

  function goList() {
    navigate("/StationManagement");
  }

  function toggleDropdown() {
    setIsDropdownOpen(function (prev) {
      return !prev;
    });
  }

  function getSelectedReasonText() {
    if (!formData.failure_reason_id) return "기존 원인 선택";

    const selectedIds = String(formData.failure_reason_id).split(",");
    const selectedNames = failureReasons
      .filter(function (r) {
        return selectedIds.includes(String(r.id));
      })
      .map(function (r) {
        return r.name;
      });

    return selectedNames.length > 0 ? selectedNames.join(", ") : "기존 원인 선택";
  }

  return (
    <div className="new-station-page">
      <header className="new-station-header">
        <button onClick={goList} className="back-btn">
          ← 목록으로
        </button>
        <h1>충전소 등록</h1>
      </header>

      <div className="new-station-content">
        <form onSubmit={handleSubmit} className="new-station-form">
          <div className="form-group">
            <label>No. (기기 고유 번호)</label>
            <input
              type="number"
              name="id"
              value={formData.id}
              onChange={handleChange}
              placeholder="예: 501"
              className="no-spin"
              required
            />
          </div>

          <div className="form-group">
            <label>충전소명</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="예: 종각역"
              required
            />
          </div>

          <div className="form-group">
            <label>주소</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>상세 위치</label>
            <input
              type="text"
              name="detail_location"
              value={formData.detail_location}
              onChange={handleChange}
              placeholder="상세 위치 입력"
            />
          </div>

          <div className="form-group">
            <label>초기 상태</label>
            <select name="status_id" value={formData.status_id} onChange={handleChange}>
              <option value="1">사용 가능</option>
              <option value="2">점검 중</option>
              <option value="3">고장</option>
            </select>
          </div>

          {formData.status_id === "3" && (
            <div className="form-group failureSection">
              <label className="failureLabel">고장 원인 선택 및 추가</label>

              <div className="failureRow failureRow--select">
                <div className="reasonDropdownWrap" ref={dropdownRef}>
                  <div className="reasonDropdownToggle" onClick={toggleDropdown}>
                    <span className="reasonDropdownText">{getSelectedReasonText()}</span>
                    <span className="reasonDropdownChevron">▼</span>
                  </div>

                  {isDropdownOpen && (
                    <div className="reasonDropdownMenu">
                      {failureReasons.map(function (reason) {
                        const checked = formData.failure_reason_id
                          ? String(formData.failure_reason_id)
                              .split(",")
                              .includes(String(reason.id))
                          : false;

                        return (
                          <label key={reason.id} className="reasonOptionLabel">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={function () {
                                handleFailureCheck(reason.id);
                              }}
                              className="reasonOptionCheckbox"
                            />
                            {reason.id}. {reason.name}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="failureRow">
                <input
                  type="text"
                  placeholder="새 원인 직접 입력"
                  value={newReasonText}
                  onChange={handleNewReasonInput}
                  className="failureInput"
                />
                <button
                  type="button"
                  onClick={handleAddFailureReason}
                  className="failureAddBtn"
                >
                  원인 추가
                </button>
              </div>
            </div>
          )}

          <button type="submit" className="btn-submit">
            등록하기
          </button>
        </form>
      </div>
    </div>
  );
}

export default NewStationManagement;
