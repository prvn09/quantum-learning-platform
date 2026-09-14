const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export async function fetchLessons() {
  const response = await fetch(`${API_URL}/lessons`);
  if (!response.ok) throw new Error('Unable to load lessons');
  return response.json();
}
