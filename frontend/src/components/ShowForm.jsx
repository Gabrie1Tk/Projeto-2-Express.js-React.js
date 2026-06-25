import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import "./ShowForm.css";

const RESOURCE_SERVICE_URL = "https://localhost:3002";

const EMPTY_FORM = {
  name: "",
  genres: "",
  status: "Running",
  premiered: "",
  rating: "",
  summary: "",
  image: "",
};

export default function ShowForm({ show, onClose, onSuccess }) {
  const { token } = useAuth();
  const isEditing = Boolean(show);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (show) {
      setForm({
        name: show.name || "",
        genres: Array.isArray(show.genres) ? show.genres.join(", ") : "",
        status: show.status || "Running",
        premiered: show.premiered || "",
        rating: show.rating ?? "",
        summary: show.summary || "",
        image: show.image || "",
      });
    }
  }, [show]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Nome é obrigatório.";
    if (form.rating && (isNaN(form.rating) || form.rating < 0 || form.rating > 10))
      errs.rating = "Nota deve ser entre 0 e 10.";
    if (form.premiered && !/^\d{4}-\d{2}-\d{2}$/.test(form.premiered))
      errs.premiered = "Use o formato AAAA-MM-DD.";
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    const payload = {
      name: form.name.trim(),
      genres: form.genres
        ? form.genres.split(",").map((g) => g.trim()).filter(Boolean)
        : [],
      status: form.status,
      premiered: form.premiered || undefined,
      rating: form.rating !== "" ? parseFloat(form.rating) : undefined,
      summary: form.summary.trim() || undefined,
      image: form.image.trim() || undefined,
    };

    setLoading(true);
    try {
      const url = isEditing
        ? `${RESOURCE_SERVICE_URL}/shows/${show._id}`
        : `${RESOURCE_SERVICE_URL}/shows`;

      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erro ao salvar série.");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="showform"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={isEditing ? "Editar série" : "Adicionar série"}
      >
        <div className="showform__header">
          <h2 className="showform__title">
            {isEditing ? "Editar série" : "Adicionar série"}
          </h2>
          <button className="showform__close" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </div>

        <form className="showform__form" onSubmit={handleSubmit} noValidate>
          {/* Nome */}
          <div className="showform__field">
            <label className="showform__label" htmlFor="sf-name">
              Nome <span className="showform__required">*</span>
            </label>
            <input
              id="sf-name"
              name="name"
              className={`showform__input ${errors.name ? "showform__input--error" : ""}`}
              placeholder="Ex: Breaking Bad"
              value={form.name}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.name && <p className="showform__error">{errors.name}</p>}
          </div>

          {/* Gêneros */}
          <div className="showform__field">
            <label className="showform__label" htmlFor="sf-genres">
              Gêneros <span className="showform__hint">(separados por vírgula)</span>
            </label>
            <input
              id="sf-genres"
              name="genres"
              className="showform__input"
              placeholder="Ex: Drama, Crime, Thriller"
              value={form.genres}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          {/* Status + Ano — linha dupla */}
          <div className="showform__row">
            <div className="showform__field">
              <label className="showform__label" htmlFor="sf-status">
                Status
              </label>
              <select
                id="sf-status"
                name="status"
                className="showform__select"
                value={form.status}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="Running">Em exibição</option>
                <option value="Ended">Encerrada</option>
                <option value="In Development">Em desenvolvimento</option>
              </select>
            </div>

            <div className="showform__field">
              <label className="showform__label" htmlFor="sf-premiered">
                Estreia
              </label>
              <input
                id="sf-premiered"
                name="premiered"
                className={`showform__input ${errors.premiered ? "showform__input--error" : ""}`}
                placeholder="AAAA-MM-DD"
                value={form.premiered}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.premiered && (
                <p className="showform__error">{errors.premiered}</p>
              )}
            </div>

            <div className="showform__field showform__field--sm">
              <label className="showform__label" htmlFor="sf-rating">
                Nota (0-10)
              </label>
              <input
                id="sf-rating"
                name="rating"
                type="number"
                min="0"
                max="10"
                step="0.1"
                className={`showform__input ${errors.rating ? "showform__input--error" : ""}`}
                placeholder="8.5"
                value={form.rating}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.rating && (
                <p className="showform__error">{errors.rating}</p>
              )}
            </div>
          </div>

          {/* URL da imagem */}
          <div className="showform__field">
            <label className="showform__label" htmlFor="sf-image">
              URL da imagem
            </label>
            <input
              id="sf-image"
              name="image"
              className="showform__input"
              placeholder="https://..."
              value={form.image}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          {/* Resumo */}
          <div className="showform__field">
            <label className="showform__label" htmlFor="sf-summary">
              Descrição
            </label>
            <textarea
              id="sf-summary"
              name="summary"
              className="showform__textarea"
              placeholder="Breve descrição da série..."
              rows={4}
              value={form.summary}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          {serverError && (
            <p className="showform__server-error">{serverError}</p>
          )}

          <div className="showform__actions">
            <button
              type="button"
              className="showform__btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="showform__btn-save"
              disabled={loading}
            >
              {loading
                ? "Salvando..."
                : isEditing
                ? "Salvar alterações"
                : "Adicionar série"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
