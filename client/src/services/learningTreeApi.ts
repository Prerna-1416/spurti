import type { LearningTreeData, BranchDetail, FeatherData, LearningWeather, Recommendation, ActivityLogEntry, PostActivityRequest, PostActivityResponse, Dimension } from '../types/learningTree';

const APP_BASE = window.location.pathname.startsWith('/spurti') ? '/spurti' : '';
const API = `${APP_BASE}/api/learning-tree`;

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function getLearningTree(): Promise<LearningTreeData> {
  return fetchJson<LearningTreeData>(API);
}

export async function getBranches(dimension?: Dimension): Promise<BranchDetail | BranchDetail[]> {
  const url = dimension ? `${API}/branches?dimension=${dimension}` : `${API}/branches`;
  return fetchJson<BranchDetail | BranchDetail[]>(url);
}

export async function getFeathers(): Promise<FeatherData[]> {
  return fetchJson<FeatherData[]>(`${API}/feathers`);
}

export async function getWeather(): Promise<LearningWeather> {
  return fetchJson<LearningWeather>(`${API}/weather`);
}

export async function getAdvisor(): Promise<Recommendation[]> {
  return fetchJson<Recommendation[]>(`${API}/advisor`);
}

export async function getStage(): Promise<{ stage: string; stageProgress: number; totalBranchXP: number }> {
  return fetchJson<{ stage: string; stageProgress: number; totalBranchXP: number }>(`${API}/stage`);
}

export async function postActivity(data: PostActivityRequest): Promise<PostActivityResponse> {
  return fetchJson<PostActivityResponse>(`${API}/activity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

export async function getHistory(dimension?: Dimension, limit = 50): Promise<ActivityLogEntry[]> {
  const params = new URLSearchParams();
  if (dimension) params.set('dimension', dimension);
  params.set('limit', String(limit));
  return fetchJson<ActivityLogEntry[]>(`${API}/history?${params}`);
}

export async function markRecommendationRead(id: string): Promise<{ success: boolean }> {
  return fetchJson<{ success: boolean }>(`${API}/recommendation/${id}/read`, {
    method: 'POST'
  });
}