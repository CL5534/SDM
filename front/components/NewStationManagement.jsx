import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./NewStationManagement.css";

function NewStationManagement({ user, isAuthReady }) {
  // 등록 성공 후 목록 페이지로 이동할 때 사용
  const navigate = useNavigate();
  // (현재 코드에서는 미사용) 알림 중복 방지용으로 쓰려고 만든 ref
  const alertShown = useRef(false);
  // DB에서 불러온 "고장 원인" 리스트 (드롭다운 체크박스에 표시)
  const [failureReasons, setFailureReasons] = useState([]);
  // "새 원인 직접 입력" 인풋의 값
  const [newReasonText, setNewReasonText] = useState("");
  // 고장 원인 드롭다운(체크박스 목록) 열림/닫힘 상태
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // "원인 추가" 관련 화면용 에러 메시지(빈 입력/서버 실패 등)
  const [reasonError, setReasonError] = useState("");
  // 드롭다운 영역 바깥 클릭 감지용(ref 범위 밖 클릭하면 닫기)
  const dropdownRef = useRef(null);
  // 충전소 등록 폼의 초기 상태값
  // - id/name/address/detail_location: 입력값 저장
  // - status_id: 초기 상태(기본 "사용 가능" = 1)
  // - failure_reason_id: 고장일 때 선택한 원인 ID들을 "1,3,5" 같은 문자열로 저장
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    address: "서울",
    detail_location: "",
    status_id: "1",
    failure_reason_id: "",
  });

  // 필수 입력값 검증 실패 시, 각 필드별 에러 메시지 저장
  const [errors, setErrors] = useState({});

  // 고장 원인 목록 조회(API) → failureReasons에 저장
  async function fetchFailureReasons() {
    try {
      const response = await fetch("http://localhost:3000/api/auth/failure-reasons", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setFailureReasons(data);
      }
    } catch (error) {
      console.error("고장 원인 로드 실패:", error);
    }
  }

  // 인증 준비 완료되면 고장 원인 목록을 불러옴
  useEffect(function () {
    if (!isAuthReady) return;

    fetchFailureReasons();
  }, [user, isAuthReady, navigate]);

  // 드롭다운이 열려있는 동안: 바깥 클릭하면 드롭다운 닫기
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

  // 상태가 "고장(3)"이 아니면 드롭다운을 강제로 닫음(고장 UI 숨길 때 정리)
  useEffect(function () {
    if (formData.status_id !== "3") {
      setIsDropdownOpen(false);
    }
  }, [formData.status_id]);

  // 권한 체크: 인증 준비 전/로그인 안됨/관리자(role_id=1) 아니면 화면 숨김
  if (!isAuthReady || !user || Number(user.role_id) !== 1) {
    return null;
  }

  // 폼 입력 변경 처리(공용)
  // - formData 갱신
  // - 해당 필드의 에러가 있으면 입력 시점에 에러 제거
  function handleChange(e) {
    const name = e.target.name;
    const value = e.target.value;

    setFormData(function (prev) {
      return { ...prev, [name]: value };
    });

    if (errors[name]) {
      setErrors(function (prev) {
        return { ...prev, [name]: "" };
      });
    }
  }

  // 새 고장 원인 입력값 변경 처리 + 에러 메시지(reasonError) 초기화
  function handleNewReasonInput(e) {
    setNewReasonText(e.target.value);

    if (reasonError) {
      setReasonError("");
    }
  }

  // 체크박스 선택값을 failure_reason_id에 누적 저장(예: "1,3,5")
  function handleFailureCheck(reasonId) {
    // 현재 저장된 문자열을 배열로 변환
    const current = formData.failure_reason_id
      ? String(formData.failure_reason_id).split(",")
      : [];

    const rId = String(reasonId);

    // 체크 해제면 제거, 체크면 추가
    var next;
    if (current.includes(rId)) {
      next = current.filter(function (id) {
        return id !== rId;
      });
    } else {
      next = current.concat([rId]);
    }

    // 보기 좋게 숫자 오름차순 정렬
    next.sort(function (a, b) {
      return Number(a) - Number(b);
    });

    // 다시 "1,3,5" 형태로 저장
    setFormData(function (prev) {
      return { ...prev, failure_reason_id: next.join(",") };
    });
  }

  // "원인 추가" 버튼 클릭 시 실행
  // - 빈 값이면 reasonError로 안내
  // - 성공하면 DB 저장 + failureReasons state에 추가해서 드롭다운에 즉시 반영
  // - 실패하면 reasonError에 서버 메시지/기본 메시지 표시
  async function handleAddFailureReason() {
    // 입력값이 비어있으면 추가 불가
    if (!newReasonText.trim()) {
      setReasonError("추가할 내용을 입력하세요.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/auth/failure-reasons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: newReasonText }),
      });

      // 저장 성공: 드롭다운에 바로 반영
      if (response.ok) {
        const addedData = await response.json();
        setFailureReasons(function (prev) {
          return prev.concat([{ id: addedData.id, name: addedData.name }]);
        });
        setNewReasonText("");
        alert("새로운 고장 원인이 등록되었습니다.");
        return;
      }

      // 실패 처리: 서버 메시지(reasonError로 표시)
      const errorData = await response.json().catch(function () {
        return null;
      });
      setReasonError(
        (errorData && errorData.message) || "고장 원인 등록에 실패했습니다."
      );
    } catch (error) {
      console.error("원인 추가 에러:", error);
      setReasonError("서버 연결에 실패했습니다.");
    }
  }

  // 등록 버튼 클릭 시 실행: 필수값 검증 + 등록 API 호출
  async function handleSubmit(e) {
    if (e) e.preventDefault();

    // 프론트 필수값 검증
    const newErrors = {};

    if (!formData.id) {
      newErrors.id = "기기 고유 번호(No.)를 입력해주세요.";
    }
    if (!formData.name.trim()) {
      newErrors.name = "충전소명을 입력해주세요.";
    }
    if (!formData.address.trim()) {
      newErrors.address = "주소를 입력해주세요.";
    }

    // 에러가 있으면 화면에 표시하고 종료(서버 요청 X)
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 서버로 보낼 데이터 가공(타입 변환 + 고장 원인 저장 규칙 적용)
    const submitData = {
      id: Number(formData.id),
      name: formData.name,
      address: formData.address,
      detail_location: formData.detail_location,
      status_id: Number(formData.status_id),

      // 상태가 "고장(3)"일 때만 failure_reason_id 저장, 아니면 null
      failure_reason_id:
        formData.status_id === "3" && formData.failure_reason_id
          ? formData.failure_reason_id
          : null,
    };

    // 등록 API 호출
    try {
      const response = await fetch("http://localhost:3000/api/auth/stations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      // 성공/실패 처리
      if (response.ok) {
        alert("새로운 충전소가 성공적으로 등록되었습니다.");
        navigate("/StationManagement");
      } else {
        // 중복/서버 검증 메시지 등을 id 필드 에러로 표시
        setErrors({ id: data.message || "등록 실패 (이미 존재하는 번호일 수 있습니다.)" });
      }
    } catch (error) {
      console.error("등록 에러:", error);
      setErrors({ id: "서버 연결 실패" });
    }
  }

  // 목록으로 이동
  function goList() {
    navigate("/StationManagement");
  }

  // 드롭다운 열기/닫기 토글
  function toggleDropdown() {
    setIsDropdownOpen(function (prev) {
      return !prev;
    });
  }

  // 선택된 원인들을 텍스트로 만들어 드롭다운 버튼에 표시
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
        <form className="new-station-form">
          {/* 기기 고유 번호 입력 + 에러 표시 */}
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
            {errors.id && (
              <div style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>
                {errors.id}
              </div>
            )}
          </div>

          {/* 충전소명 입력 + 에러 표시 */}
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
            {errors.name && (
              <div style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>
                {errors.name}
              </div>
            )}
          </div>

          {/* 주소 입력 + 에러 표시 */}
          <div className="form-group">
            <label>주소</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
            {errors.address && (
              <div style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>
                {errors.address}
              </div>
            )}
          </div>

          {/* 상세 위치 입력(선택) */}
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

          {/* 초기 상태 선택 */}
          <div className="form-group">
            <label>초기 상태</label>
            <select name="status_id" value={formData.status_id} onChange={handleChange}>
              <option value="1">사용 가능</option>
              <option value="2">점검 중</option>
              <option value="3">고장</option>
            </select>
          </div>

          {/* 초기 상태가 "고장(3)"일 때만 고장 원인 UI 표시 */}
          {formData.status_id === "3" && (
            <div className="form-group failureSection">
              <label className="failureLabel">고장 원인 선택 및 추가</label>

              {/* 고장 원인 드롭다운(체크박스 목록) */}
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

              {/* 새 원인 직접 입력 + 원인 추가 버튼 */}
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

              {/* 원인 추가 관련 에러 메시지 표시 */}
              {reasonError && (
                <div style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>
                  {reasonError}
                </div>
              )}
            </div>
          )}

          {/* 등록 버튼 */}
          <button type="button" onClick={handleSubmit} className="btn-submit">
            등록하기
          </button>
        </form>
      </div>
    </div>
  );
}

export default NewStationManagement;
