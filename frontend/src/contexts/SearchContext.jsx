import { createContext, useContext, useReducer, useCallback } from "react";

export const SearchContext = createContext(null);

const initialState = {
  results: [],
  loading: false,
  error: null,
  searched: false,
};

function searchReducer(state, action) {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null, searched: true };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, results: action.payload };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload, results: [] };
    case "CLEAR":
      return initialState;
    default:
      return state;
  }
}

export function SearchProvider({ children }) {
  const [state, dispatch] = useReducer(searchReducer, initialState);

  const searchShows = useCallback(async (query, type) => {
    dispatch({ type: "FETCH_START" });
    try {
      const url = `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Erro ao buscar dados.");
      const data = await res.json();
      if (data.length === 0) throw new Error("Nenhum resultado encontrado.");

      dispatch({ type: "FETCH_SUCCESS", payload: data });
    } catch (err) {
      dispatch({ type: "FETCH_ERROR", payload: err.message });
    }
  }, []);

  const clearResults = () => dispatch({ type: "CLEAR" });

  return (
    <SearchContext.Provider value={{ state, searchShows, clearResults }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  return useContext(SearchContext);
}
