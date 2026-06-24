import { SearchProvider } from "./contexts/SearchContext";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import ResultsList from "./components/ResultsList";
import "./App.css";

export default function App() {
  return (
    <SearchProvider>
      <div className="app">
        <Header />
        <main className="app-main">
          <SearchBar />
          <ResultsList />
        </main>
        <footer className="app-footer">
          Feito por Gabriel Takao e Luiz Gustavo
        </footer>
      </div>
    </SearchProvider>
  );
}
