import type { NoteData } from "../services/notesService";

type NoteProps = {
  note: NoteData;
  onToggleImportance: (note: NoteData) => void;
  onDelete: (id: NoteData["id"]) => void;
  onToggleCompleted: (note: NoteData) => void;
};

function Note({
  note,
  onToggleImportance,
  onDelete,
  onToggleCompleted,
}: NoteProps) {
  return (
    <li className={`note-card ${note.completed ? "completed" : ""}`}>
      <div className="note-content">
        <label>
          <input
            type="checkbox"
            checked={note.completed || false}
            onChange={() => onToggleCompleted(note)}
  />
  Terminée
</label>
        {note.content}
        <span
          className={`category-badge category-${(note.category || "Personnel") === "École"
      ? "ecole"
      : (note.category || "Personnel").toLowerCase()
  }`}
>
  {note.category || "Personnel"}
        </span>
        
        {note.important && <span className="note-badge">Importante</span>}
      </div>
      <div className="note-actions">
        <button
          type="button"
          onClick={() => onToggleImportance(note)}
          aria-pressed={note.important}
        >
          {note.important ? "Retirer des importantes" : "Marquer importante"}
        </button>
        <button
          className="button-delete"
          type="button"
          onClick={() => onDelete(note.id)}
          aria-label={`Supprimer la note : ${note.content}`}
        >
          Supprimer
        </button>
      </div>
    </li>
  );
}

export default Note;
