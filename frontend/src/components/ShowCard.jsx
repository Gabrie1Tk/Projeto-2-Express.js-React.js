import { useState } from "react";
import "./ShowCard.css";

export default function ShowCard({ item }) {
  const show = item.show;
  const [expanded, setExpanded] = useState(false);

  const imageUrl =
    show?.image?.medium ||
    "https://via.placeholder.com/210x295?text=Sem+Imagem";

  const summary = show?.summary
    ? show.summary.replace(/<[^>]+>/g, "")
    : "Sem descrição disponível.";

  const genres = show?.genres?.join(", ") || "";
  const rating = show?.rating?.average;
  const status = show?.status;
  const premiered = show?.premiered;

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
            <span className={`card__badge ${status === "Ended" ? "card__badge--ended" : "card__badge--active"}`}>
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
      </div>
    </div>
  );
}
