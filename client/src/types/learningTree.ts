export const DIMENSIONS = ['curiosity', 'consistency', 'collaboration', 'communication', 'leadership', 'creativity', 'research', 'reflection'] as const;

export type Dimension = typeof DIMENSIONS[number];

export type Stage = 'beginner' | 'learner' | 'practitioner' | 'builder' | 'mentor';

export type WeatherType = 'spring' | 'summer' | 'autumn' | 'winter';

export type EnergyLevel = 'high' | 'medium' | 'low' | 'excellent' | 'good';

export interface TreeVisualState {
  trunkHealth: number;
  branchCount: number;
  leafDensity: number;
  glowIntensity: number;
}

export interface LearningWeather {
  type: WeatherType;
  motivation: EnergyLevel;
  curiosity: EnergyLevel;
  confidence: EnergyLevel;
  stress: EnergyLevel;
}

export interface WeeklyMetrics {
  categoriesActive: number;
  totalActivities: number;
  avgQuality: number;
}

export interface BranchData {
  xp: number;
  level: number;
  growth: number;
  streakDays?: number;
}

export interface FeatherData {
  dimension: Dimension;
  color: string;
  label: string;
  angle: number;
  level: number;
  growth: number;
  glowing: boolean;
}

export interface Recommendation {
  _id: string;
  recommendationType: 'stage_hint' | 'dimension_suggestion' | 'weather_alert' | 'streak_reminder' | 'milestone_achieved';
  message: string;
  suggestedDimensions: Dimension[];
  urgency: 'high' | 'medium' | 'low';
  read: boolean;
  createdAt: string;
}

export interface LearningTreeData {
  student: string;
  stage: Stage;
  stageProgress: number;
  totalBranchXP: number;
  treeVisual: TreeVisualState;
  learningWeather: LearningWeather;
  weeklyMetrics: WeeklyMetrics;
  branches: Record<Dimension, BranchData>;
  feathers: Record<Dimension, { level: number; glowing: boolean }>;
  recommendations: Recommendation[];
}

export interface BranchDetail {
  dimension: Dimension;
  label: string;
  color: string;
  xp: number;
  level: number;
  growthPercent: number;
  streakDays: number;
  lastActivityAt: string | null;
  activities: ActivityItem[];
  activitySummary: Record<string, { count: number; totalPoints: number }>;
  monthlyGrowth: number;
}

export interface ActivityItem {
  type: string;
  points: number;
  qualityScore: number;
  duration: number;
  createdAt: string;
}

export interface ActivityLogEntry {
  _id: string;
  email: string;
  dimension: Dimension;
  activityType: string;
  points: number;
  appliedPoints: number;
  qualityScore: number;
  duration: number;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface StageInfo {
  current: Stage;
  next: Stage | null;
  progress: number;
  totalXP: number;
}

export interface PostActivityRequest {
  dimension: Dimension;
  activityType: string;
  duration?: number;
  qualityScore?: number;
  metadata?: Record<string, unknown>;
}

export interface PostActivityResponse {
  success: boolean;
  points: number;
  appliedPoints: number;
  newBranchXP: Record<Dimension | 'total', number>;
  branchGrowth: Record<Dimension, string>;
  stageProgress: {
    current: Stage;
    next: Stage;
    percent: number;
  };
  newRecommendation: Recommendation | null;
}

export const DIMENSION_COLORS: Record<Dimension, string> = {
  curiosity: '#FFD700',
  consistency: '#4169E1',
  collaboration: '#32CD32',
  communication: '#FFA500',
  leadership: '#9370DB',
  creativity: '#FF69B4',
  research: '#DC143C',
  reflection: '#FFFFFF'
};

export const DIMENSION_LABELS: Record<Dimension, string> = {
  curiosity: 'Curiosity',
  consistency: 'Consistency',
  collaboration: 'Collaboration',
  communication: 'Communication',
  leadership: 'Leadership',
  creativity: 'Creativity',
  research: 'Research',
  reflection: 'Reflection'
};

export const STAGE_LABELS: Record<Stage, string> = {
  beginner: '🌱 Beginner',
  learner: '📚 Learner',
  practitioner: '⚡ Practitioner',
  builder: '🏗 Builder',
  mentor: '👑 Mentor'
};

export const WEATHER_EMOJIS: Record<WeatherType, string> = {
  spring: '🌱',
  summer: '☀',
  autumn: '🍁',
  winter: '❄'
};