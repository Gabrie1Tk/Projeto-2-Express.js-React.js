import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import "./ShowCard.css";

export default function ShowCard({ item, onEdit, onDelete }) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);

  // Suporta tanto o formato MongoDB (campos diretos) quanto TVMaze ({ show: {...} })
  const show = item.show ?? item;

  const imageUrl =
    show?.image ||
    show?.image?.medium ||
    "https://via.placeholder.com/210x295?text=Sem+Imagem";

  const summary = show?.summary
    ? show.summary.replace(/<[^>]+>/g, "")
    : "Sem descrição disponível.";

  const genres = Array.isArray(show?.genres)
    ? show.genres.join(", ")
    : "";

  const rating = show?.rating?.average ?? show?.rating;
  const status = show?.status;
  const premiered = show?.premiered;

  // Mostra botões de editar/deletar apenas para o dono do registro
  const isOwner = user && show?.owner && String(show.owner) === String(user.id);

  return (
    <div className="card">
      <img src={imageUrl} alt={show?.name} className="card__img" />
      <div className="card__body">
        <h3 className="card__title">{show?.name}</h3>

        <div className="card__badges">
          {rating && (
            <span className="card__badge card__badge--rating">⭐ {rating}</span>
          )}
          {status && (
            <span
              className={`card__badge ${
                status === "Ended" ? "card__badge--ended" : "card__badge--active"
              }`}
            >
              {status === "Ended" ? "Encerrada" : status}
            </span>
          )}
          {premiered && (
            <span className="card__badge card__badge--year">
              {premiered.slice(0, 4)}
            </span>
          )}
        </div>

        {genres && <p className="card__genres">{genres}</p>}

        <p className="card__summary">
          {expanded
            ? summary
            : summary.slice(0, 120) + (summary.length > 120 ? "..." : "")}
        </p>

        {summary.length > 120 && (
          <button
            className="card__btn-expand"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Ver menos" : "Ver mais"}
          </button>
        )}

        {isOwner && (
          <div className="card__owner-actions">
            <button
              className="card__btn-edit"
              onClick={() => onEdit(show)}
              aria-label="Editar série"
            >
              ✏️ Editar
            </button>
            <button
              className="card__btn-delete"
              onClick={() => onDelete(show)}
              aria-label="Excluir série"
            >
              🗑️ Excluir
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
