import { useState, useRef, useEffect } from "react";

export function MultiSelectDropdown({
  options,
  value,
  onChange,
  style,
}: {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  style?: React.CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = value ? value.split(", ") : [];

  const toggle = (opt: string) => {
    if (opt === "All rooms") {
      onChange("All rooms");
      return;
    }
    let next = selected.includes(opt) ? selected.filter((x) => x !== opt) : [...selected, opt];
    next = next.filter((x) => x !== "All rooms");
    if (next.length === 0) next = ["All rooms"];
    onChange(next.join(", "));
  };

  return (
    <div ref={ref} style={{ position: "relative", width: "100%", ...style }}>
      <div
        className="cc-input"
        style={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#fff",
        }}
        onClick={() => setOpen(!open)}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {value || "All rooms"}
        </span>
        <span style={{ fontSize: 10, color: "var(--color-muted-foreground)", marginLeft: 8 }}>▼</span>
      </div>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 4,
            background: "#fff",
            border: "1px solid var(--color-border)",
            borderRadius: 6,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            zIndex: 100,
            maxHeight: 200,
            overflowY: "auto",
            padding: 4,
          }}
        >
          {options.map((opt) => (
            <label
              key={opt}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 8px",
                cursor: "pointer",
                borderRadius: 4,
                background: selected.includes(opt) ? "var(--color-muted)" : "transparent",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-muted)")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = selected.includes(opt) ? "var(--color-muted)" : "transparent")
              }
            >
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
                style={{ cursor: "pointer" }}
              />
              <span style={{ fontSize: 13 }}>{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
