import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login({ setUser }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const [rememberEmail, setRememberEmail] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

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

    const handleChange = (setter, field) => (e) => {
        setter(e.target.value);
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleLogin = async () => {
        const newErrors = {};

        if (!email.trim()) {
            newErrors.email = "이메일을 입력해주세요.";
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                newErrors.email = "올바른 이메일 형식을 입력해주세요.";
            }
        }

        if (!password.trim()) {
            newErrors.password = "비밀번호를 입력해주세요.";
        } else {
            let pwMsg = [];
            if (password.length < 6) {
                pwMsg.push("6자리 이상");
            }

            
            if (pwMsg.length > 0) {
                newErrors.password = "비밀번호는 " + pwMsg.join(", ") + "이어야 합니다.";
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
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
                localStorage.setItem("user", JSON.stringify(data.user));

                if (data.user?.role_id) {
                    localStorage.setItem("userRole", String(data.user.role_id));
                }

                if (rememberEmail) {
                    localStorage.setItem("rememberedEmail", email);
                    localStorage.setItem("rememberedPassword", password);
                } else {
                    localStorage.removeItem("rememberedEmail");
                    localStorage.removeItem("rememberedPassword");
                }

                alert(`${data.user?.name || '사용자'}님, 환영합니다!`);
                setUser(data.user);
                navigate("/");
            } else {
                // ✅ 여기 추가/수정: 서버 메시지를 위치별로 분리해서 표시
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
            console.error("로그인 중 에러 발생:", error);
            setErrors({ general: `로그인 처리 중 오류가 발생했습니다.\n(${error.message})` });
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
                <div style={{ marginBottom: '8px' }}>
                    <input
                        type="email"
                        placeholder="이메일"
                        value={email}
                        onChange={handleChange(setEmail, "email")}
                        onKeyDown={onKeyDown}
                        className="login-input"
                        style={{ width: "300px", borderColor: errors.email ? "red" : undefined }}
                    />
                    <div style={{ minHeight: '18px', color: "red", fontSize: "12px", marginTop: "2px" }}>{errors.email}</div>
                </div>

                <div style={{ marginBottom: '8px' }}>
                    <input
                        type="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={handleChange(setPassword, "password")}
                        onKeyDown={onKeyDown}
                        className="login-input"
                        style={{ width: "300px", borderColor: errors.password ? "red" : undefined }}
                    />
                    <div style={{ minHeight: '18px', color: "red", fontSize: "12px", marginTop: "2px" }}>{errors.password}</div>
                </div>

                {errors.general && (
                    <div style={{ color: "red", fontSize: "12px", marginBottom: "10px", textAlign: "center" }}>{errors.general}</div>
                )}

                <button type="button" onClick={handleLogin} className="btn-login" disabled={isLoading} style={{ width: "300px" }}>
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
