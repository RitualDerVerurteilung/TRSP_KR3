import React, { useEffect, useState } from "react";

export default function LoginForm({ onSubmit, setFormMode }) {

    const [email, setEmail] = useState("");
    const [wrongEmail, setWrongEmail] = useState(false);
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

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
        const trimmed_firstName = firstName.trim();
        const trimmed_lastName = lastName.trim();
        if (!trimmed_email) {
            alert("Введите почту");
            return;
        }
        if (!trimmed_firstName) {
            alert("Введите имя");
            return;
        }
        if (!trimmed_lastName) {
            alert("Введите фамилию");
            return;
        }
        if (!trimmed_password) {
            alert("Введите пароль");
            return;
        }
        onSubmit({
            email: trimmed_email,
            password: trimmed_password,
            first_name: firstName,
            last_name: lastName
        });
    }

    return (
        <section className="login">
            <div className="login__header">
                <h1 className="login__title">Регистрация</h1>
                <p className="login__description">Создайте новый аккаунт на нашей платформе</p>
            </div>
            <form className="form" role="form" onSubmit={handleSubmit}>
                <label className="label">
                    Почта
                    <input
                        className={!wrongEmail ? "input" : "input wrong"}
                        value={email}
                        name="email"
                        onChange={(e) => emailChange(e.target.value)}
                        placeholder="example@mail.com"
                        autoFocus
                    />
                </label>
                <label className="label">
                    Имя
                    <input
                        className="input"
                        name="first name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Александр"
                    />
                </label>
                <label className="label">
                    Фамилия
                    <input
                        className="input"
                        name="last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Великий"
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
                        Зарегистрироваться                    </button>
                    <div>
                        <button className="btn" onClick={() => setFormMode("login")}>Уже зарегистрированы? Войдите в аккаунт</button>
                    </div>
                </div>
            </form>
        </section>
    );
}