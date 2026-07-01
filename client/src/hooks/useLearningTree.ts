import { useState, useEffect, useCallback } from 'react';
import { getLearningTree, getWeather, getAdvisor, postActivity, markRecommendationRead } from '../services/learningTreeApi';
import type { LearningTreeData, LearningWeather, Recommendation, PostActivityRequest } from '../types/learningTree';

interface UseLearningTreeReturn {
  treeData: LearningTreeData | null;
  weather: LearningWeather | null;
  recommendations: Recommendation[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  logActivity: (data: PostActivityRequest) => Promise<void>;
  dismissRecommendation: (id: string) => Promise<void>;
}

export function useLearningTree(): UseLearningTreeReturn {
  const [treeData, setTreeData] = useState<LearningTreeData | null>(null);
  const [weather, setWeather] = useState<LearningWeather | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [tree, weatherData, advisorData] = await Promise.all([
        getLearningTree(),
        getWeather(),
        getAdvisor()
      ]);
      setTreeData(tree);
      setWeather(weatherData);
      setRecommendations(advisorData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load learning tree');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logActivityHandler = useCallback(async (data: PostActivityRequest) => {
    try {
      await postActivity(data);
      await refresh();
    } catch (err) {
      throw err;
    }
  }, [refresh]);

  const dismissRecommendation = useCallback(async (id: string) => {
    try {
      await markRecommendationRead(id);
      setRecommendations(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      console.error('Failed to dismiss recommendation:', err);
    }
  }, []);

  return {
    treeData,
    weather,
    recommendations,
    loading,
    error,
    refresh,
    logActivity: logActivityHandler,
    dismissRecommendation
  };
}