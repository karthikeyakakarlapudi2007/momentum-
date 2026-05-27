import { createContext, useCallback, useContext, useMemo, useState } from "react";

const SearchContext = createContext(null);

export function SearchProvider({ children }) {
  const [query, setQuery] = useState("");

  const clear = useCallback(() => setQuery(""), []);

  const value = useMemo(() => ({ query, setQuery, clear }), [query, clear]);

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used inside SearchProvider");
  return ctx;
}

export function filterHabits(habits, query) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return habits;
  return habits.filter((h) => {
    const name = (h.name || "").toLowerCase();
    const category = (h.category || "").toLowerCase();
    return name.includes(q) || category.includes(q);
  });
}
