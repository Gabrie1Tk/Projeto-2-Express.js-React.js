import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import "./Login.css";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Preencha e-mail e senha.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-card__brand">
          <span className="login-card__logo">CineSearch</span>
          <p className="login-card__tagline">Sua biblioteca de séries</p>
        </div>

        <form className="login-card__form" onSubmit={handleSubmit} noValidate>
          <div className="login-card__field">
            <label className="login-card__label" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              className={`login-card__input ${error ? "login-card__input--error" : ""}`}
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="login-card__field">
            <label className="login-card__label" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              className={`login-card__input ${error ? "login-card__input--error" : ""}`}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          {error && <p className="login-card__error">{error}</p>}

          <button
            type="submit"
            className="login-card__btn"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="login-card__footer">
          Programação Web Fullstack — Projeto 2
        </p>
      </div>
    </div>
  );
}
