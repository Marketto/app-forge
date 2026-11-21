// Logica pura: niente DOM, testabile con node --test.
export function addItem(state, text, now = Date.now()) {
  const t = String(text ?? "").trim();
  if (!t) return state;
  return { ...state, items: [...state.items, { id: now.toString(36), text: t }] };
}
export function removeItem(state, id) {
  return { ...state, items: state.items.filter(i => i.id !== id) };
}
