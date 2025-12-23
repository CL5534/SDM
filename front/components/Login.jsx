import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login({ setUser }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const [rememberEmail, setRememberEmail] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const savedEmail = localStorage.getItem("rememberedEmail");
        const savedPassword = localStorage.getItem("rememberedPassword");
        
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberEmail(true);
        }
        if (savedPassword) {
            setPassword(savedPassword);
        }
    }, []);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            alert("이메일과 비밀번호를 모두 입력해주세요.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert("올바른 이메일 형식을 입력해주세요.");
            return;
        }

        if (isLoading) return;
        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:3000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("서버 응답 형식이 올바르지 않습니다.");
            }

            const data = await response.json();

            if (response.ok) {
                // 1. [핵심] 새로고침 시 유지를 위해 로컬스토리지에 유저 객체 저장
                localStorage.setItem("user", JSON.stringify(data.user));

                // 2. 권한 정보 별도 저장 (기존 로직 유지)
                if (data.user?.role_id) {
                    localStorage.setItem("userRole", String(data.user.role_id));
                }

                // 3. 아이디/비밀번호 저장 (오타 수정됨: passwaord -> password)
                if (rememberEmail) {
                    localStorage.setItem("rememberedEmail", email);
                    localStorage.setItem("rememberedPassword", password);
                } else {
                    localStorage.removeItem("rememberedEmail");
                    localStorage.removeItem("rememberedPassword");
                }

                alert(`${data.user?.name || '사용자'}님, 환영합니다!`);
                setUser(data.user); // App.js의 state 업데이트
                navigate("/");
            } else {
                alert(data.message || "로그인에 실패했습니다.");
            }
        } catch (error) {
            console.error("로그인 중 에러 발생:", error);
            alert(`로그인 처리 중 오류가 발생했습니다.\n(${error.message})`);
        } finally {
            setIsLoading(false);
        }
    };

    const onKeyDown = (e) => {
        if (e.key === "Enter") {
            handleLogin();
        }
    };

    const handleSignUp = () => {
        navigate("/SignUp");
    };

    return (
        <div className="login-page">
            <h1>로그인</h1>
            <div className="login-form">
                <input
                    type="email"
                    placeholder="이메일"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={onKeyDown}
                    className="login-input"
                />
                <input
                    type="password"
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={onKeyDown}
                    className="login-input"
                />
                <button type="button" onClick={handleLogin} className="btn-login" disabled={isLoading}>
                    {isLoading ? "로그인 중..." : "로그인"}
                </button>
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
            
            <button type="button" onClick={handleSignUp} className="btn-signup-move">
                회원가입
            </button>
        </div>
    );
}

export default Login;