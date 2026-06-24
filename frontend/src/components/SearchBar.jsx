import { useState } from "react";
import { useSearch } from "../contexts/SearchContext";
import "./SearchBar.css";

export default function SearchBar() {
  const { searchShows, clearResults } = useSearch();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("shows");
  const [queryError, setQueryError] = useState("");

  const validate = () => {
    if (!query.trim()) {
      setQueryError("O campo de busca é obrigatório.");
      return false;
    }
    if (query.trim().length < 2) {
      setQueryError("Digite pelo menos 2 caracteres.");
      return false;
    }
    setQueryError("");
    return true;
  };

  const handleSearch = () => {
    if (!validate()) return;
    searchShows(query.trim(), type);
  };

  const handleClear = () => {
    setQuery("");
    setQueryError("");
    clearResults();
  };

  return (
    <div className="search-card">
      <h2 className="search-card__title">Buscar Séries & Shows</h2>
      <div className="search-card__row">
        <div className="search-card__input-wrapper">
          <input
            className={`search-card__input ${queryError ? "search-card__input--error" : ""}`}
            type="text"
            placeholder="Ex: Breaking Bad, Game of Thrones..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (queryError) setQueryError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          {queryError && <p className="search-card__error">{queryError}</p>}
        </div>

        <select
          className="search-card__select"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="shows">Séries / Shows</option>
        </select>

        <button className="search-card__btn-search" onClick={handleSearch}>
          Buscar
        </button>
        <button className="search-card__btn-clear" onClick={handleClear}>
          Limpar
        </button>
      </div>
    </div>
  );
}
