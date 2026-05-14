import { createServerFn } from "@tanstack/react-start";
import fs from "node:fs";
import path from "node:path";

export interface Note {
  id: string;
  step: number;
  text: string;
  createdAt: string;
}

// Stored in notes.json at project root — local dev only.
const FILE = path.resolve(process.cwd(), "notes.json");

function read(): Note[] {
  try {
    return (JSON.parse(fs.readFileSync(FILE, "utf-8")) as { notes: Note[] }).notes ?? [];
  } catch {
    return [];
  }
}

function write(notes: Note[]) {
  fs.writeFileSync(FILE, JSON.stringify({ notes }, null, 2), "utf-8");
}

export const getNotes = createServerFn({ method: "GET" }).handler(() => read());

export const addNote = createServerFn({ method: "POST" })
  .inputValidator((d: { step: number; text: string }) => d)
  .handler(({ data }) => {
    const note: Note = {
      id: Math.random().toString(36).slice(2, 10),
      step: data.step,
      text: data.text,
      createdAt: new Date().toISOString(),
    };
    write([...read(), note]);
    return note;
  });

export const deleteNote = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string }) => d)
  .handler(({ data }) => {
    write(read().filter((n) => n.id !== data.id));
  });

export const clearStepNotes = createServerFn({ method: "POST" })
  .inputValidator((d: { step: number }) => d)
  .handler(({ data }) => {
    write(read().filter((n) => n.step !== data.step));
  });

export const clearAllNotes = createServerFn({ method: "POST" }).handler(() => {
  write([]);
});
