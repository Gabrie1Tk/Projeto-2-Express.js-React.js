import { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import { SearchProvider, useSearch } from "./contexts/SearchContext";

import Login from "./components/Login";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import ResultsList from "./components/ResultsList";
import ShowForm from "./components/ShowForm";
import ConfirmModal from "./components/ConfirmModal";

import "./App.css";

// Fluxo de exclusão isolado — chama DELETE no resource-service e fecha o modal
function ConfirmDeleteFlow({ show, onClose }) {
  const { token } = useAuth();
  const { refreshResults } = useSearch();

  const handleConfirm = async () => {
    try {
      const res = await fetch(`http://localhost:3002/shows/${show._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.message || "Erro ao excluir.");
        return;
      }
      refreshResults();
    } catch {
      alert("Erro de conexão ao excluir.");
    } finally {
      onClose();
    }
  };

  return (
    <ConfirmModal
      show={show}
      onConfirm={handleConfirm}
      onCancel={onClose}
    />
  );
}

// Componente interno que já tem acesso a todos os contextos
function AppContent() {
  const { isAuthenticated } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [editingShow, setEditingShow] = useState(null);
  const [deletingShow, setDeletingShow] = useState(null);

  if (!isAuthenticated) {
    return <Login />;
  }

  const handleAddShow = () => {
    setEditingShow(null);
    setShowForm(true);
  };

  const handleEditShow = (show) => {
    setEditingShow(show);
    setShowForm(true);
  };

  const handleDeleteShow = (show) => {
    setDeletingShow(show);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingShow(null);
  };

  return (
    <SearchProvider>
      <div className="app">
        <Header onAddShow={handleAddShow} />

        <main className="app-main">
          <SearchBar />
          <ResultsList onEdit={handleEditShow} onDelete={handleDeleteShow} />
        </main>

        <footer className="app-footer">
          Feito por Gabriel Takao e Luiz Gustavo
        </footer>

        {showForm && (
          <ShowForm
            show={editingShow}
            onClose={handleCloseForm}
            onSuccess={handleCloseForm}
          />
        )}

        {deletingShow && (
          <ConfirmDeleteFlow
            show={deletingShow}
            onClose={() => setDeletingShow(null)}
          />
        )}
      </div>
    </SearchProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <AppContent />
      </WebSocketProvider>
    </AuthProvider>
  );
}
