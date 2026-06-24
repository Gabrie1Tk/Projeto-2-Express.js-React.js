import { useSearch } from "../contexts/SearchContext";
import ShowCard from "./ShowCard";
import "./ResultsList.css";

export default function ResultsList() {
  const { state } = useSearch();
  const { results, loading, error, searched } = state;

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
        Use a busca acima para encontrar séries e shows.
      </p>
    );
  }

  return (
    <div>
      <p className="results__count">{results.length} resultado(s) encontrado(s)</p>
      <div className="results__grid">
        {results.map((item) => {
          const id = item.show?.id || item.person?.id;
          return <ShowCard key={id} item={item} />;
        })}
      </div>
    </div>
  );
}