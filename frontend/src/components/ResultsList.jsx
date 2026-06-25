import { useEffect } from "react";
import { useSearch } from "../contexts/SearchContext";
import { useWebSocket } from "../contexts/WebSocketContext";
import ShowCard from "./ShowCard";
import "./ResultsList.css";

export default function ResultsList({ onEdit, onDelete }) {
  const { state, refreshResults } = useSearch();
  const { results, loading, error, searched } = state;
  const { lastEvent } = useWebSocket();

  // Atualiza a lista automaticamente ao receber evento WebSocket
  useEffect(() => {
    if (lastEvent) {
      refreshResults();
    }
  }, [lastEvent]);

  if (loading) {
    return (
      <div className="results__loading">
        <div className="spinner" />
        <p className="results__loading-text">Buscando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="results__error">
        <p>{error}</p>
      </div>
    );
  }

  if (searched && results.length === 0) {
    return <p className="results__empty">Sem resultados.</p>;
  }

  if (!searched) {
    return (
      <p className="results__hint">
        Use a busca acima para encontrar séries, ou clique em "Adicionar série" para cadastrar uma nova.
      </p>
    );
  }

  return (
    <div>
      <p className="results__count">{results.length} resultado(s) encontrado(s)</p>
      <div className="results__grid">
        {results.map((item) => {
          const show = item.show ?? item;
          const id = show._id || show.id;
          return (
            <ShowCard
              key={id}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          );
        })}
      </div>
    </div>
  );
}
