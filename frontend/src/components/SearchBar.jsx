import { useForm } from "react-hook-form";
import { useSearch } from "../contexts/SearchContext";
import "./SearchBar.css";

export default function SearchBar() {
  const { searchShows, clearResults } = useSearch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    searchShows(data.query);
  };

  const handleClear = () => {
    reset();
    clearResults();
  };

  // Busca todos os shows sem filtro de nome
  const handleListAll = () => {
    reset();
    searchShows("");
  };

  return (
    <div className="search-card">
      <h2 className="search-card__title">Buscar Séries & Shows</h2>
      <div className="search-card__row">
        <div className="search-card__input-wrapper">
          <input
            className={`search-card__input ${errors.query ? "search-card__input--error" : ""}`}
            placeholder="Ex: Breaking Bad, Game of Thrones..."
            {...register("query", {
              minLength: {
                value: 2,
                message: "Digite pelo menos 2 caracteres.",
              },
            })}
          />
          {errors.query && (
            <p className="search-card__error">{errors.query.message}</p>
          )}
        </div>

        <button
          className="search-card__btn-search"
          onClick={handleSubmit(onSubmit)}
        >
          Buscar
        </button>

        <button
          className="search-card__btn-list"
          onClick={handleListAll}
          type="button"
        >
          Ver todos
        </button>

        <button className="search-card__btn-clear" onClick={handleClear} type="button">
          Limpar
        </button>
      </div>
    </div>
  );
}
