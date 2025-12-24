// SignUp.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignUp.css";

function SignUp({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  async function handleSignUp() {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "이름을 입력해주세요.";
    }

    if (!email.trim()) {
      newErrors.email = "이메일을 입력해주세요.";
    } else {
      // 이메일 형식 유효성 검사
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = "올바른 이메일 형식을 입력해주세요.";
      }
    }

    if (!password.trim()) {
      newErrors.password = "비밀번호를 입력해주세요.";
    } else {
      if (password.length < 6) {
        newErrors.password = "비밀번호는 6자리 이상이어야 합니다.";
      } else {
        const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
        if (!specialCharRegex.test(password)) {
          newErrors.password = "비밀번호는 특수문자를 포함해야 합니다.";
        }
      }
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "비밀번호 확인을 입력해주세요.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      // 응답이 JSON인지 확인
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("서버 응답 형식이 올바르지 않습니다.");
      }

      const data = await response.json();

      if (response.ok) {
        alert("회원가입이 완료되었습니다. 로그인해 주세요!");
        navigate("/login");
      } else {
        setErrors({ general: data.message || "회원가입에 실패했습니다." });
      }
    } catch (error) {
      console.error("회원가입 에러:", error);
      setErrors({
        general: `회원가입 처리 중 오류가 발생했습니다.\n(${error.message})`,
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleChange(setter, field) {
    return function (e) {
      setter(e.target.value);
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

        {errors.general && <div className="signup-error-general">{errors.general}</div>}

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
