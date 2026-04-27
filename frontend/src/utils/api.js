const API_BASE = '';

export async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options
  });
  
  let data;
  try {
    data = await res.json();
  } catch {
    data = { error: 'Network Error' };
  }
  
  if (!res.ok) {
    let errMessage = data.error || `Request failed (${res.status})`;
    if (typeof errMessage === 'string') {
      const lower = errMessage.toLowerCase();
      if (lower.includes('sql') || lower.includes('database') || lower.includes('supabase') || lower.includes('pg_') || lower.includes('node_modules')) {
        errMessage = 'An internal server error occurred. Please try again.';
      }
    }
    throw new Error(errMessage);
  }
  return data;
}
