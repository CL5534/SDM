import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login({ setUser }) {
    // 입력값 state (이메일/비밀번호)
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    // 페이지 이동(라우팅)
    const navigate = useNavigate();
    // 아이디/비밀번호 저장 체크박스 상태
    const [rememberEmail, setRememberEmail] = useState(false);
    // 로그인 중복 클릭 방지용 로딩 상태
    const [isLoading, setIsLoading] = useState(false);
    // 입력 검증/서버 에러 메시지 표시용
    const [errors, setErrors] = useState({});

    useEffect(() => {
        // 로컬스토리지에 저장된 이메일/비밀번호가 있으면 초기값으로 세팅
        const savedEmail = localStorage.getItem("rememberedEmail");
        const savedPassword = localStorage.getItem("rememberedPassword");
        
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberEmail(true); // 저장되어 있으면 체크박스도 자동 체크
        }
        if (savedPassword) {
            setPassword(savedPassword);
        }
    }, []);

    // input 변경 핸들러(공통): 값 업데이트 + 해당 필드 에러 제거
    const handleChange = (setter, field) => (e) => {
        setter(e.target.value);
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleLogin = async () => {
        // 1) 프론트 입력 검증(서버 요청 전에 막기)
        const newErrors = {};

        // 이메일 필수 + 형식 검사
        if (!email.trim()) {
            newErrors.email = "이메일을 입력해주세요.";
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                newErrors.email = "올바른 이메일 형식을 입력해주세요.";
            }
        }

        // 비밀번호 필수 + 최소 길이 검사
        if (!password.trim()) {
            newErrors.password = "비밀번호를 입력해주세요.";
        } else {
            let pwMsg = [];
            if (password.length < 6) {
                pwMsg.push("6자리 이상");
            }

            // 조건이 하나라도 걸리면 메시지로 합쳐서 표시
            if (pwMsg.length > 0) {
                newErrors.password = "비밀번호는 " + pwMsg.join(", ") + "이어야 합니다.";
            }
        }

        // 입력 오류가 있으면 화면에 표시하고 종료(서버 요청 X)
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // 2) 요청 시작 전 상태 정리 + 중복 클릭 방지
        setErrors({});
        if (isLoading) return;
        setIsLoading(true);

        try {
            // 3) 백엔드 로그인 API 호출(세션 쿠키 포함)
            const response = await fetch("http://localhost:3000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            // 4) 응답이 JSON인지 확인(서버 오류로 HTML이 올 때 방지)
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("서버 응답 형식이 올바르지 않습니다.");
            }

            const data = await response.json();

            if (response.ok) {
                // 5) 로그인 성공: 유저 정보 저장(자동 로그인/권한 메뉴 분기용)
                localStorage.setItem("user", JSON.stringify(data.user));

                // role_id가 있으면 별도로 저장(권한 기반 메뉴/화면 제어용)
                if (data.user?.role_id) {
                    localStorage.setItem("userRole", String(data.user.role_id));
                }

                // 체크박스 상태에 따라 이메일/비밀번호 저장 여부 처리
                if (rememberEmail) {
                    localStorage.setItem("rememberedEmail", email);
                    localStorage.setItem("rememberedPassword", password);
                } else {
                    localStorage.removeItem("rememberedEmail");
                    localStorage.removeItem("rememberedPassword");
                }

                // 사용자 안내 + 전역 유저 상태 반영 + 이동
                alert(`${data.user?.name || '사용자'}님, 환영합니다!`);
                setUser(data.user);
                navigate("/");
            } else {
                // 6) 로그인 실패: 서버 메시지를 이메일/비밀번호/일반 에러로 분리해서 표시
                var msg = data.message || "로그인에 실패했습니다.";

                if (msg.includes("비밀번호")) {
                    setErrors({ password: msg });
                } else if (msg.includes("이메일") || msg.includes("아이디")) {
                    setErrors({ email: msg });
                } else {
                    setErrors({ general: msg });
                }
            }
        } catch (error) {
            // 7) 네트워크/예외 발생: 콘솔 출력 + 사용자 안내용 에러 표시
            console.error("로그인 중 에러 발생:", error);
            setErrors({ general: `로그인 처리 중 오류가 발생했습니다.\n(${error.message})` });
        } finally {
            // 8) 성공/실패 상관없이 로딩 종료
            setIsLoading(false);
        }
    };

    // Enter 키로 로그인 실행
    const onKeyDown = (e) => {
        if (e.key === "Enter") {
            handleLogin();
        }
    };

    // 회원가입 페이지로 이동
    const handleSignUp = () => {
        navigate("/SignUp");
    };

    return (
        <div className="login-page">
            <h1>로그인</h1>
            <div className="login-form">
                <div style={{ marginBottom: '8px' }}>
                    {/* 이메일 입력 */}
                    <input
                        type="email"
                        placeholder="이메일"
                        value={email}
                        onChange={handleChange(setEmail, "email")}
                        onKeyDown={onKeyDown}
                        className="login-input"
                        style={{ width: "300px", borderColor: errors.email ? "red" : undefined }}
                    />
                    {/* 이메일 에러 메시지 출력 영역(레이아웃 흔들림 방지용 높이 고정) */}
                    <div style={{ minHeight: '18px', color: "red", fontSize: "12px", marginTop: "2px" }}>{errors.email}</div>
                </div>

                <div style={{ marginBottom: '8px' }}>
                    {/* 비밀번호 입력 */}
                    <input
                        type="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={handleChange(setPassword, "password")}
                        onKeyDown={onKeyDown}
                        className="login-input"
                        style={{ width: "300px", borderColor: errors.password ? "red" : undefined }}
                    />
                    {/* 비밀번호 에러 메시지 출력 */}
                    <div style={{ minHeight: '18px', color: "red", fontSize: "12px", marginTop: "2px" }}>{errors.password}</div>
                </div>

                {/* 일반 에러(서버/네트워크/기타 메시지) 출력 */}
                {errors.general && (
                    <div style={{ color: "red", fontSize: "12px", marginBottom: "10px", textAlign: "center" }}>{errors.general}</div>
                )}

                {/* 로그인 버튼(로딩 중 비활성화 + 텍스트 변경) */}
                <button type="button" onClick={handleLogin} className="btn-login" disabled={isLoading} style={{ width: "300px" }}>
                    {isLoading ? "로그인 중..." : "로그인"}
                </button>

                {/* 아이디/비밀번호 저장 체크박스 */}
                <div className="remember-me">
                    <input 
                        type="checkbox" 
                        id="remember" 
                        checked={rememberEmail}
                        onChange={(e) => setRememberEmail(e.target.checked)} 
                    />
                    <label htmlFor="remember">아이디/비밀번호 저장</label>
                </div>
            </div>

            {/* 회원가입 이동 버튼 */}
            <button type="button" onClick={handleSignUp} className="btn-signup-move">
                회원가입
            </button>
        </div>
    );
}

export default Login;
