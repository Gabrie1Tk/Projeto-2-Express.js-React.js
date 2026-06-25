import { createContext, useContext, useReducer, useCallback } from "react";
import { useAuth } from "./AuthContext";

const RESOURCE_SERVICE_URL = "https://localhost:3002";

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
  const { token } = useAuth();

  const searchShows = useCallback(async (query) => {
    dispatch({ type: "FETCH_START" });
    try {
      const params = query ? `?name=${encodeURIComponent(query)}` : "";
      const res = await fetch(`${RESOURCE_SERVICE_URL}/shows${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erro ao buscar dados.");
      }

      const data = await res.json();

      if (!data.length) throw new Error("Nenhum resultado encontrado.");

      dispatch({ type: "FETCH_SUCCESS", payload: data });
    } catch (err) {
      dispatch({ type: "FETCH_ERROR", payload: err.message });
    }
  }, [token]);

  const clearResults = useCallback(() => dispatch({ type: "CLEAR" }), []);

  // Recarrega a lista atual (chamado após eventos WebSocket)
  const refreshResults = useCallback(async () => {
    if (!state.searched) return;
    try {
      const res = await fetch(`${RESOURCE_SERVICE_URL}/shows`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      dispatch({ type: "FETCH_SUCCESS", payload: data });
    } catch {
      // silencioso — não sobrescreve erro existente
    }
  }, [state.searched, token]);

  return (
    <SearchContext.Provider value={{ state, searchShows, clearResults, refreshResults }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  return useContext(SearchContext);
}