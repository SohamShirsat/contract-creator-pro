const STORAGE_KEY = "contract_creator_notes";

export interface Note {
  id: string;
  step: number;
  text: string;
  createdAt: string;
}

function load(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return (JSON.parse(raw) as { notes: Note[] }).notes ?? [];
  } catch {
    return [];
  }
}

function save(notes: Note[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ notes }));
}

export function getNotes(): Note[] {
  return load();
}

export function addNote(step: number, text: string): Note {
  const note: Note = {
    id: Math.random().toString(36).slice(2, 10),
    step,
    text,
    createdAt: new Date().toISOString(),
  };
  save([...load(), note]);
  return note;
}

export function deleteNote(id: string) {
  save(load().filter((n) => n.id !== id));
}

export function clearStepNotes(step: number) {
  save(load().filter((n) => n.step !== step));
}

export function clearAllNotes() {
  save([]);
}
