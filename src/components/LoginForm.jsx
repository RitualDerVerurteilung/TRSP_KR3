import React, { useEffect, useState } from "react";

export default function LoginForm({ onSubmit, setFormMode }) {

    const [email, setEmail] = useState("");
    const [wrongEmail, setWrongEmail] = useState(false);
    const [password, setPassword] = useState("");

    useEffect(() => {

    }, []);

    function validateEmail(email) {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(email);
    }

    const emailChange = (value) => {
        const isEmailValid = validateEmail(value);
        if (isEmailValid) {
            setWrongEmail(false);
            setEmail(value);
        } else {
            setWrongEmail(true);
            setEmail(value);
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmed_email = email.trim();
        const trimmed_password = password.trim();
        if (!trimmed_email) {
            alert("Введите почту");
            return;
        }
        if (!trimmed_password) {
            alert("Введите пароль");
            return;
        }
        onSubmit({
            email: trimmed_email,
            password: trimmed_password
        });
    }

    return (
        <section className="login">
            <div className="login__header">
                <h1 className="login__title">Вход</h1>
                <p className="login__description">Войдите в аккаунт со своими учётными данными</p>
            </div>
            <form className="form" role="form" onSubmit={handleSubmit}>
                <label className="label">
                    Почта
                    <input
                        className={!wrongEmail ? "input" : "input wrong"}
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => emailChange(e.target.value)}
                        placeholder="example@mail.com"
                        autoFocus
                    />
                </label>
                <label className="label">
                    Пароль
                    <input
                        className="input"
                        type="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="password"
                    />
                </label>
                <div className="login__submit">
                    <button type="submit" className="btn btn--primary">
                        Войти
                    </button>
                    <div>
                        <button className="btn" onClick={() => setFormMode("register")}>Впервые на нашем сайте? Пройдите простую регистрацию!</button>
                    </div>
                </div>
            </form>
        </section>
    );
}