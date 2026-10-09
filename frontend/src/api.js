const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Request failed (${response.status})`);
  }
  return response.status === 204 ? null : response.json();
}

export const api = {
  health: () => request('/health'),
  categories: () => request('/categories'),
  recipes: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([,v]) => v !== undefined && v !== ''));
    return request(`/recipes?${qs}`);
  },
  recipe: id => request(`/recipes/${id}`),
  menus: (from, to) => request(`/menus?from=${from || ''}&to=${to || ''}`),
  today: () => request('/menus/today'),
  generate: date => request('/menus/generate', { method: 'POST', body: JSON.stringify({ date }) }),
  updateMenu: (date, body) => request(`/menus/${date}`, { method: 'PUT', body: JSON.stringify(body) }),
  emailMenu: date => request(`/menus/${date}/email`, { method: 'POST' })
};
