// Dati solo sul dispositivo. Per molti dati passa a IndexedDB (vedi Ottoteca).
const KEY = "__ID__:v1";
export const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) ?? { items: [] }; } catch { return { items: [] }; } };
export const save = state => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} };
