import { useAuth } from "../contexts/AuthContext";
import "./Header.css";

export default function Header({ onAddShow }) {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="header__inner">
        <div className="header__brand">
          <span className="header__logo">CineSearch</span>
          <span className="header__sub">Programação Web Fullstack — Projeto 2</span>
        </div>

        <div className="header__actions">
          <button className="header__btn-add" onClick={onAddShow}>
            + Adicionar série
          </button>

          <div className="header__user">
            <span className="header__user-name">{user?.name}</span>
            <button className="header__btn-logout" onClick={logout}>
              Sair
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
