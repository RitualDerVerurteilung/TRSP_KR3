import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import "./RegLogPage.css";

import LoginForm from "../../components/LoginForm";
import RegisterForm from "../../components/RegisterForm";
import { api } from "../../api/connection";

export default function RegLogPage() {
    const navigate = useNavigate();

    const [mode, setMode] = useState("login"); // login || register
    useEffect(() => {

    }, []);

    const showRefresh = async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        alert(refreshToken);
    }

    const showAccess = async () => {
        const accessToken = localStorage.getItem('accessToken');
        alert(accessToken);
    }

    const handleSubmit = async (payload) => {
        try {
            if (mode === "login") {
                const user = await api.loginUser(payload);
                navigate("/products");
            } else if (mode === "register") {
                const newUser = await api.registerUser(payload);
                setMode("login")
            }
        } catch (err) {
            console.error(err);
            mode === "login" ? alert("Ошибка входа пользователя") : alert("Ошибка регистрации пользователя");
            
        }
    };

    return (
        <div className="page">
            <header className="header">
                <div className="header__inner">
                    <div className="brand">Products App</div>
                    <div className="header__right">Ritual Product's</div>
                </div>
            </header>
            <main className="main">
                <div className="container">
                    {mode === "login" ? (
                        <LoginForm onSubmit={handleSubmit} setFormMode={setMode} />
                    ) : (
                        <RegisterForm onSubmit={handleSubmit} setFormMode={setMode} />
                    )}
                    <button className="btn" onClick={showRefresh}>Покажи Refresh Token</button>
                    <button className="btn" onClick={showAccess}>Покажи Access Token</button>
                </div>
            </main>
            <footer className="footer">
                <div className="footer__inner">
                    © {new Date().getFullYear()} Products App
                </div>
            </footer>
        </div>
    )
};