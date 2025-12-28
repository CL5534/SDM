// SignUp.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignUp.css";

function SignUp({ setUser }) {
  // 입력 폼 상태값(이메일/비번/비번확인/이름)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");

  // 가입 성공/실패 후 페이지 이동용
  const navigate = useNavigate();
  // 중복 클릭 방지 및 버튼 텍스트 변경용
  const [isLoading, setIsLoading] = useState(false);
  // 입력 검증/서버 에러 메시지 저장용
  const [errors, setErrors] = useState({});
  async function handleSignUp() {
    // 입력 검증 결과(에러 메시지)를 모아둘 객체
    const newErrors = {};

    // 이름 검증: 공백만 입력한 경우도 막기 위해 trim() 사용
    if (!name.trim()) {
      newErrors.name = "이름을 입력해주세요.";
    }

    // 이메일 검증: 비었는지 먼저 확인
    if (!email.trim()) {
      newErrors.email = "이메일을 입력해주세요.";
    } else {
      // 이메일 형식 검증: @와 도메인이 있는지 체크
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      // 형식이 맞지 않으면 에러 메시지 저장
      if (!emailRegex.test(email)) {
        newErrors.email = "올바른 이메일 형식을 입력해주세요.";
      }
    }

    // 비밀번호 검증: 비었는지 체크
    if (!password.trim()) {
      newErrors.password = "비밀번호를 입력해주세요.";
    } else {
      // 길이 검증: 6자리 이상인지 확인
      if (password.length < 6) {
        newErrors.password = "비밀번호는 6자리 이상이어야 합니다.";
      } else {
        // 특수문자 포함 검증(보안 강화 목적)
        const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;

        // 특수문자가 없으면 에러 메시지 저장
        if (!specialCharRegex.test(password)) {
          newErrors.password = "비밀번호는 특수문자를 포함해야 합니다.";
        }
      }
    }

    // 비밀번호 확인 검증: 비었는지 체크
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "비밀번호 확인을 입력해주세요.";
    } else if (password !== confirmPassword) {
      // 비밀번호와 비밀번호 확인이 다르면 에러
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
    }

    // 에러가 있으면 서버 요청을 보내지 않고 화면에 표시 후 종료
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 검증 통과: 에러 초기화 + 중복 클릭 방지
    setErrors({});
    if (isLoading) return;
    setIsLoading(true);

    try {
      // 회원가입 요청(API: POST /signup)
      const response = await fetch("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 서버로 email/password/name 전달
        body: JSON.stringify({ email, password, name }),
      });

      // 응답이 JSON인지 확인(서버가 HTML/텍스트를 주면 여기서 걸러짐)
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("서버 응답 형식이 올바르지 않습니다.");
      }

      const data = await response.json();

      if (response.ok) {
        // 가입 성공: 안내 후 로그인 페이지로 이동
        alert("회원가입이 완료되었습니다. 로그인해 주세요!");
        navigate("/login");
      } else {
        // 가입 실패: 서버 메시지를 general 에러로 표시
        setErrors({ general: data.message || "회원가입에 실패했습니다." });
      }
    } catch (error) {
      // 네트워크/서버 예외 발생 시: 콘솔 출력 + general 에러 표시
      console.error("회원가입 에러:", error);
      setErrors({
        general: `회원가입 처리 중 오류가 발생했습니다.\n(${error.message})`,
      });
    } finally {
      // 성공/실패 상관없이 로딩 종료
      setIsLoading(false);
    }
  }

  // input 변경 처리 공통 함수(입력 시 해당 필드 에러도 같이 지움)
  function handleChange(setter, field) {
    return function (e) {
      setter(e.target.value);

      // 해당 필드에 에러가 떠 있으면 입력 시작과 동시에 제거
      if (errors[field]) {
        setErrors(function (prev) {
          return { ...prev, [field]: "" };
        });
      }
    };
  }

  return (
    <div className="signup-page">
      <h1>회원가입</h1>

      <div className="signup-form">
        {/* 이름 입력 + 에러 표시 */}
        <div className="signup-field">
          <input
            type="text"
            placeholder="이름"
            value={name}
            onChange={handleChange(setName, "name")}
            className="signup-input"
            required
          />
          <div className="signup-error">{errors.name}</div>
        </div>

        {/* 이메일 입력 + 형식 검증 에러 표시 */}
        <div className="signup-field">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={handleChange(setEmail, "email")}
            className="signup-input"
            required
          />
          <div className="signup-error">{errors.email}</div>
        </div>

        {/* 비밀번호 입력 + 길이/특수문자 검증 에러 표시 */}
        <div className="signup-field">
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={handleChange(setPassword, "password")}
            className="signup-input"
            required
          />
          <div className="signup-error">{errors.password}</div>
        </div>

        {/* 비밀번호 확인 입력 + 불일치 에러 표시 */}
        <div className="signup-field">
          <input
            type="password"
            placeholder="비밀번호 확인"
            value={confirmPassword}
            onChange={handleChange(setConfirmPassword, "confirmPassword")}
            className="signup-input"
            required
          />
          <div className="signup-error">{errors.confirmPassword}</div>
        </div>

        {/* 서버 에러/기타 에러 표시 영역 */}
        {errors.general && <div className="signup-error-general">{errors.general}</div>}

        {/* 가입 버튼(로딩 중 비활성화 + 텍스트 변경) */}
        <button
          type="button"
          onClick={handleSignUp}
          className="btn-signup-submit"
          disabled={isLoading}
        >
          {isLoading ? "가입 중..." : "가입하기"}
        </button>
      </div>
    </div>
  );
}

export default SignUp;
