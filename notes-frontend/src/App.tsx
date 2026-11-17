import { useEffect, useState, type SubmitEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./App.css";
import Note from "./components/Note";
import notesService, { type NoteData } from "./services/notesService";
import {
  fetchNotes,
  noteAdded,
  noteRemoved,
  noteUpdated,
} from "./store/notesSlice";
import type { AppDispatch, RootState } from "./store/store";

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const notes = useSelector((state: RootState) => state.notes.items);
  const loading = useSelector(
    (state: RootState) => state.notes.status === "loading",
  );
  const [newNote, setNewNote] = useState("");
  const [newCategory, setNewCategory] = useState("Personnel");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [showAll, setShowAll] = useState(true);
  const [error, setError] = useState("");
  const MAX_CHARACTERS = 100;
  const isNoteValid =
    newNote.trim().length > 0 && newNote.length <= MAX_CHARACTERS;

  useEffect(() => {
    dispatch(fetchNotes())
      .unwrap()
      .then(() => setError(""))
      .catch(() => setError("Impossible de charger les notes."));
  }, [dispatch]);

  const addNote = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = newNote.trim();
    if (!content) {
      setError("Veuillez entrer une note.");
      return;
    }
    if (newNote.length > MAX_CHARACTERS) {
      setError("La note ne peut pas dépasser 100 caractères.");
      return;
    }

    try {
      const createdNote = await notesService.create({
        content,
        important: false,
        category: newCategory,
        completed: false,
      });
      dispatch(noteAdded(createdNote));
      setNewNote("");
      setNewCategory("Personnel");
      setError("");
    } catch {
      setError("Impossible d’ajouter la note.");
    }
  };

  const toggleImportance = async (note: NoteData) => {
  const updatedNote = {
    ...note,
    important: !note.important,
  };

  await notesService.update(note.id, updatedNote);
  dispatch(noteUpdated(updatedNote));
};

const toggleCompleted = async (note: NoteData) => {
  const updatedNote = {
    ...note,
    completed: !note.completed,
  };

  await notesService.update(note.id, updatedNote);
  dispatch(noteUpdated(updatedNote));
};

  const deleteNote = async (id: NoteData["id"]) => {
    try {
      await notesService.remove(id);
      dispatch(noteRemoved(id));
      setError("");
    } catch {
      setError("Impossible de supprimer la note.");
    }
  };

  const visibleNotes = notes.filter((note) => {
  const matchesImportance = showAll || note.important;

  const matchesCategory =
    selectedCategory === "Tous" ||
    (note.category || "Personnel") === selectedCategory;

  return matchesImportance && matchesCategory;
});

  return (
    <main className="notes-app">
      <header className="notes-header">
        <p className="eyebrow">Votre espace personnel</p>
        <h1>Notes</h1>
        <p className="notes-subtitle">
          Toutes vos idées importantes, au même endroit.
        </p>
      </header>

      <form className="note-form" onSubmit={addNote}>
        <label htmlFor="note-content">Ajouter une note</label>
        <input
          id="note-content"
          value={newNote}
          onChange={(event) => {
            setNewNote(event.target.value);
            setError("");
          }}
          placeholder="Écrivez votre idée ici..."
          maxLength={100}
        />
        <select
          value={newCategory}
          onChange={(event) => setNewCategory(event.target.value)}
        >
          <option value="Travail">Travail</option>
          <option value="École">École</option>
          <option value="Personnel">Personnel</option>
          <option value="Urgent">Urgent</option>
</select>
        <p>
          {newNote.length}/100 caractères
        </p>
        {!isNoteValid && newNote.length > 0 && (
          <p className="error-message">
            La note doit contenir entre 1 et 100 caractères.
          </p>
        )}

        <button
          className="button-primary"
          type="submit"
          disabled={!isNoteValid}
        >
          Enregistrer
        </button>
      </form>

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      {loading && <p className="loading-state">Chargement de vos notes...</p>}

      <section aria-labelledby="notes-list-heading">
        <div className="category-filter">
          <label htmlFor="category-filter">Filtrer par catégorie :</label>
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
          >
            <option value="Tous">Toutes les catégories</option>
            <option value="Travail">Travail</option>
            <option value="École">École</option>
            <option value="Personnel">Personnel</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>
        <div className="notes-toolbar">
          <h2 id="notes-list-heading">
            {showAll ? "Toutes les notes" : "Notes importantes"}
            <span className="notes-count">({visibleNotes.length})</span>
          </h2>
          <button
            className="button-filter"
            type="button"
            onClick={() => setShowAll((current) => !current)}
            aria-pressed={!showAll}
          >
            {showAll ? "Voir les importantes" : "Voir toutes les notes"}
          </button>
        </div>
        {visibleNotes.length > 0 ? (
          <ul className="notes-list">
            {visibleNotes.length === 0 ? (
              <p>Aucune note trouvée</p>
            ) : (
                visibleNotes.map((note) => (
                  <Note                  
                    key={note.id}
                    note={note}
                    onToggleImportance={toggleImportance}
                    onDelete={deleteNote}
                    onToggleCompleted={toggleCompleted}
                  />
                ))
)}
          </ul>
        ) : (
          !loading && (
            <p className="empty-state">
              {showAll
                ? "Aucune note pour le moment. Ajoutez votre première idée ci-dessus."
                : "Aucune note importante pour le moment."}
            </p>
          )
        )}
      </section>
    </main>
  );
}

export default App;
