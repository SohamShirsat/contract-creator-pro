import { useState, useCallback } from "react";
import { useContract } from "@/lib/contract";
import { getNotes, addNote, deleteNote, clearStepNotes, clearAllNotes, type Note } from "@/lib/notes";

const STEP_NAMES = ["", "Setup", "Pricing", "Add-ons", "Policies", "Tax", "Info", "Preview"];

function fmtDate(iso: string) {
  const d = new Date(iso);
  return (
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
    " · " +
    d.toLocaleDateString([], { month: "short", day: "numeric" })
  );
}

export function NotesPanel() {
  const { step } = useContract();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>(() => getNotes());
  const [text, setText] = useState("");
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const stepNotes = notes.filter((n) => n.step === step);
  const totalCount = notes.length;

  const refresh = useCallback(() => {
    setNotes(getNotes());
  }, []);

  const handleAdd = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    addNote(step, trimmed);
    setText("");
    refresh();
  };

  const handleDelete = (id: string) => {
    deleteNote(id);
    refresh();
  };

  const handleClearStep = () => {
    clearStepNotes(step);
    refresh();
  };

  const handleClearAll = () => {
    if (!confirmClearAll) {
      setConfirmClearAll(true);
      setTimeout(() => setConfirmClearAll(false), 3000);
      return;
    }
    clearAllNotes();
    setConfirmClearAll(false);
    refresh();
  };

  return (
    <>
      {/* Side tab toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        title="Presentation notes"
        style={{
          position: "fixed",
          right: open ? 308 : 0,
          top: "42%",
          transform: "translateY(-50%)",
          zIndex: 51,
          background: "#fbbf24",
          border: "none",
          borderRadius: "8px 0 0 8px",
          padding: "14px 7px",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          boxShadow: "-2px 2px 10px rgba(0,0,0,0.18)",
          transition: "right 0.22s ease",
          userSelect: "none",
        }}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#78350f" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11l5-5V5a2 2 0 0 0-2-2z" />
          <path d="M16 3v5h5" />
        </svg>

        {totalCount > 0 && (
          <span style={{
            background: "#78350f",
            color: "white",
            borderRadius: 999,
            fontSize: 10,
            fontWeight: 700,
            lineHeight: 1,
            padding: "3px 5px",
            minWidth: 16,
            textAlign: "center",
          }}>
            {totalCount}
          </span>
        )}

        <svg
          width="12" height="12"
          viewBox="0 0 24 24" fill="none" stroke="#78350f" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.22s" }}
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>

      {/* Panel */}
      <div style={{
        position: "fixed",
        right: open ? 0 : -310,
        top: 0,
        bottom: 0,
        width: 308,
        background: "#fffbeb",
        borderLeft: "2px solid #fde047",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        transition: "right 0.22s ease",
        boxShadow: "-6px 0 28px rgba(0,0,0,0.13)",
      }}>

        {/* Header */}
        <div style={{
          padding: "14px 14px 10px",
          background: "#fef08a",
          borderBottom: "1px solid #fde047",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: "#78350f", display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#78350f" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11l5-5V5a2 2 0 0 0-2-2z" />
                  <path d="M16 3v5h5" />
                </svg>
                Step {step} — {STEP_NAMES[step]}
              </div>
              <div style={{ fontSize: 11.5, color: "#92400e", marginTop: 3 }}>
                {stepNotes.length === 0
                  ? "No notes for this step"
                  : `${stepNotes.length} note${stepNotes.length !== 1 ? "s" : ""} on this step`}
              </div>
            </div>
            {stepNotes.length > 0 && (
              <button
                onClick={handleClearStep}
                style={{
                  fontSize: 11.5, color: "#b45309", background: "none", border: "none",
                  cursor: "pointer", textDecoration: "underline", padding: 0, flexShrink: 0,
                }}
              >
                Clear step
              </button>
            )}
          </div>
        </div>

        {/* Notes list */}
        <div style={{ flex: 1, overflow: "auto", padding: "10px 10px 0", display: "flex", flexDirection: "column", gap: 8 }}>
          {stepNotes.length === 0 && (
            <div style={{
              textAlign: "center", color: "#a16207", fontSize: 12.5,
              marginTop: 44, opacity: 0.65, lineHeight: 1.6,
            }}>
              No notes yet on this step.
              <br />
              Add one below.
            </div>
          )}

          {stepNotes.map((note) => (
            <NoteCard key={note.id} note={note} onDelete={handleDelete} />
          ))}
        </div>

        {/* Add note + footer actions */}
        <div style={{ padding: 10, borderTop: "1px solid #fde047", background: "#fef9c3", flexShrink: 0 }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAdd();
            }}
            placeholder="Type a note… (⌘↵ to save)"
            rows={3}
            style={{
              width: "100%",
              border: "1.5px solid #fde047",
              borderRadius: 6,
              padding: "8px 10px",
              fontSize: 12.5,
              background: "#fffbeb",
              color: "#1c1917",
              resize: "none",
              outline: "none",
              fontFamily: "inherit",
              boxSizing: "border-box",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#f59e0b")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#fde047")}
          />
          <button
            onClick={handleAdd}
            disabled={!text.trim()}
            style={{
              marginTop: 6,
              width: "100%",
              height: 34,
              background: text.trim() ? "#f59e0b" : "#fde047",
              color: text.trim() ? "white" : "#92400e",
              border: "none",
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 12.5,
              cursor: text.trim() ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              transition: "all 0.15s",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Note
          </button>

          {totalCount > 0 && (
            <button
              onClick={handleClearAll}
              style={{
                marginTop: 8,
                width: "100%",
                background: "none",
                border: "none",
                fontSize: 11,
                color: confirmClearAll ? "#dc2626" : "#b45309",
                cursor: "pointer",
                textDecoration: "underline",
                padding: "2px 0",
                fontWeight: confirmClearAll ? 600 : 400,
              }}
            >
              {confirmClearAll
                ? `Click again to delete all ${totalCount} notes across all steps`
                : `Clear all notes (${totalCount} across all steps)`}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function NoteCard({ note, onDelete }: { note: Note; onDelete: (id: string) => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        background: "#fef9c3",
        border: "1px solid #fde047",
        borderRadius: 6,
        padding: "9px 10px",
        boxShadow: hovered
          ? "3px 4px 12px rgba(0,0,0,0.13)"
          : "2px 3px 7px rgba(0,0,0,0.07)",
        position: "relative",
        transition: "box-shadow 0.15s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        onClick={() => onDelete(note.id)}
        title="Delete note"
        style={{
          position: "absolute",
          top: 6,
          right: 6,
          background: hovered ? "#fde047" : "transparent",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
          padding: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#b45309",
          transition: "background 0.15s",
        }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>

      <div style={{
        fontSize: 12.5,
        color: "#1c1917",
        lineHeight: 1.55,
        paddingRight: 20,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}>
        {note.text}
      </div>
      <div style={{ fontSize: 10.5, color: "#92400e", marginTop: 5, opacity: 0.75 }}>
        {fmtDate(note.createdAt)}
      </div>
    </div>
  );
}
