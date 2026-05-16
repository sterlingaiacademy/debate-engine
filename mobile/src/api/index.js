export const API_BASE = 'http://65.20.85.75';

const request = async (path, options = {}) => {
  const url = `${API_BASE}${path}`;
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || data?.message || 'Request failed');
    return data;
  } catch (err) {
    throw err;
  }
};

export const api = {
  login: (body) => request('/api/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => request('/api/register', { method: 'POST', body: JSON.stringify(body) }),
  getAnalytics: (id) => request(`/api/analytics/${id}`),
  getTimeLimits: (id) => request(`/api/time-limits/${id}`),
  getLeaderboard: () => request('/api/leaderboard'),
  getBadges: (id) => request(`/api/leaderboard/badges/${id}`),
  getDailyChallenge: () => request('/api/daily-challenge').catch(() => null),
  submitDailyChallenge: (id, body) => request(`/api/daily-challenge/${id}/submit`, { method: 'POST', body: JSON.stringify(body) }),
  startDebate: (body) => request('/api/debate/start', { method: 'POST', body: JSON.stringify(body) }),
  submitDebate: (body) => request('/api/debate/submit', { method: 'POST', body: JSON.stringify(body) }),
  getResults: (sessionId) => request(`/api/results/${sessionId}`),
  updateProfile: (id, body) => request(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  enrollPremium: (body) => request('/api/enrollment', { method: 'POST', body: JSON.stringify(body) }),
};
