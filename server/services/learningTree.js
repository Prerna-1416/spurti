import LearningDimension from '../models/LearningDimension.js';
import LearningTree from '../models/LearningTree.js';
import ActivityLog from '../models/ActivityLog.js';
import AIRecommendation from '../models/AIRecommendation.js';

export const DIMENSIONS = ['curiosity', 'consistency', 'collaboration', 'communication', 'leadership', 'creativity', 'research', 'reflection'];

export const DIMENSION_COLORS = {
  curiosity: '#FFD700',
  consistency: '#4169E1',
  collaboration: '#32CD32',
  communication: '#FFA500',
  leadership: '#9370DB',
  creativity: '#FF69B4',
  research: '#DC143C',
  reflection: '#FFFFFF'
};

export const DIMENSION_LABELS = {
  curiosity: 'Curiosity',
  consistency: 'Consistency',
  collaboration: 'Collaboration',
  communication: 'Communication',
  leadership: 'Leadership',
  creativity: 'Creativity',
  research: 'Research',
  reflection: 'Reflection'
};

export const ACTIVITY_POINTS = {
  curiosity: {
    question_asked: { points: 10, dailyLimit: 50 },
    new_topic_explored: { points: 20, dailyLimit: 60 },
    research_question: { points: 15, dailyLimit: 45 },
    exploration_session: { points: 5, perMinute: true, dailyLimit: 100 }
  },
  consistency: {
    daily_streak_bonus: { points: 10, dailyLimit: 999, streakBonus: true },
    attendance: { points: 5, dailyLimit: 80 },
    weekly_goal_completed: { points: 20, dailyLimit: 999 },
    monthly_goal_completed: { points: 50, dailyLimit: 999 }
  },
  collaboration: {
    peer_help: { points: 15, dailyLimit: 100 },
    team_project: { points: 25, dailyLimit: 999 },
    code_review: { points: 10, dailyLimit: 999 },
    group_discussion: { points: 10, dailyLimit: 999 }
  },
  communication: {
    presentation: { points: 25, dailyLimit: 80 },
    written_explanation: { points: 15, dailyLimit: 60 },
    feedback_given: { points: 10, dailyLimit: 40 }
  },
  leadership: {
    mentoring_session: { points: 30, dailyLimit: 100 },
    team_lead_role: { points: 40, dailyLimit: 999 },
    workshop_conducted: { points: 50, dailyLimit: 999 },
    community_guidance: { points: 25, dailyLimit: 999 }
  },
  creativity: {
    unique_project: { points: 40, dailyLimit: 80 },
    innovative_solution: { points: 35, dailyLimit: 999 },
    design_creation: { points: 20, dailyLimit: 999 },
    novel_approach: { points: 30, dailyLimit: 999 }
  },
  research: {
    paper_read: { points: 15, dailyLimit: 100 },
    deep_dive_session: { points: 20, dailyLimit: 999 },
    research_question_answered: { points: 25, dailyLimit: 999 },
    literature_review: { points: 30, dailyLimit: 999 }
  },
  reflection: {
    journal_entry: { points: 10, dailyLimit: 60 },
    self_assessment: { points: 15, dailyLimit: 999 },
    goal_setting: { points: 10, dailyLimit: 999 },
    progress_review: { points: 20, dailyLimit: 999 }
  }
};

export const STAGE_THRESHOLDS = {
  beginner: { min: 0, max: 500, next: 'learner', categoriesRequired: 0 },
  learner: { min: 501, max: 1500, next: 'practitioner', categoriesRequired: 3 },
  practitioner: { min: 1501, max: 3500, next: 'builder', categoriesRequired: 5 },
  builder: { min: 3501, max: 6000, next: 'mentor', categoriesRequired: 6 },
  mentor: { min: 6000, max: Infinity, next: null, categoriesRequired: 7 }
};

export function calculateStreakBonus(days) {
  if (days >= 22) return 25;
  if (days >= 15) return 20;
  if (days >= 8) return 15;
  return 10;
}

export function applyDiminishingUtility(basePoints, activityCount) {
  // activityCount is 1-indexed (1st activity = activityCount 1)
  if (activityCount <= 1) return basePoints;       // Activity 1: 100%
  if (activityCount === 2) return Math.round(basePoints * 0.8);  // Activity 2: 80%
  if (activityCount === 3) return Math.round(basePoints * 0.6);  // Activity 3: 60%
  return Math.round(basePoints * 0.4);             // Activity 4+: 40%
}

export async function getTodayXPForDimension(email, dimension) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const logs = await ActivityLog.find({
    email,
    dimension,
    createdAt: { $gte: startOfDay }
  });

  return logs.reduce((sum, log) => sum + log.appliedPoints, 0);
}

export async function getDailyActivityCount(email, dimension) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  return ActivityLog.countDocuments({
    email,
    dimension,
    createdAt: { $gte: startOfDay }
  });
}

export function validateQuality(duration, qualityScore) {
  // Reject if EITHER condition is true:
  // 1. Duration is less than 5 minutes
  // 2. Quality score exists and is <= 0.7
  if (duration < 5) return false;
  if (qualityScore !== undefined && qualityScore <= 0.7) return false;
  return true;
}

export function detectSuspiciousPattern(email, dimension, points, duration) {
  if (points > 200 && duration < 60) {
    return { suspicious: true, reason: 'Suspiciously high points for short duration' };
  }
  return { suspicious: false, reason: null };
}

export async function calculateLearningWeather(email) {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const recentActivities = await ActivityLog.find({
    email,
    createdAt: { $gte: sevenDaysAgo }
  });

  const todayActivities = recentActivities.filter(a => a.createdAt >= oneDayAgo);
  const recentCount = recentActivities.length;
  const todayCount = todayActivities.length;

  const dimensionCounts = {};
  DIMENSIONS.forEach(d => {
    dimensionCounts[d] = recentActivities.filter(a => a.dimension === d).length;
  });

  const avgQuality = recentActivities.length > 0
    ? recentActivities.reduce((sum, a) => sum + (a.qualityScore || 1), 0) / recentActivities.length
    : 1;

  let weatherType = 'spring';
  let motivation = 'medium';
  let curiosity = 'good';
  let confidence = 'medium';
  let stress = 'low';

  if (recentCount === 0) {
    weatherType = 'winter';
    motivation = 'low';
    curiosity = 'low';
    confidence = 'low';
    stress = 'high';
  } else if (todayCount >= 5 && recentCount >= 20) {
    weatherType = 'summer';
    motivation = 'high';
    curiosity = 'excellent';
    confidence = 'high';
    stress = 'low';
  } else if (recentCount < 10) {
    weatherType = 'autumn';
    motivation = 'medium';
    curiosity = 'medium';
    confidence = 'medium';
    stress = 'low';
  }

  if (avgQuality < 0.7) {
    stress = 'high';
  }

  return {
    type: weatherType,
    motivation,
    curiosity,
    confidence,
    stress
  };
}

export async function generateRecommendations(email, treeState, dimensions) {
  const recommendations = [];

  const stage = treeState.stage;
  const stageThreshold = STAGE_THRESHOLDS[stage];

  if (stageThreshold.next) {
    const nextStageXP = STAGE_THRESHOLDS[stageThreshold.next].min;
    const xpNeeded = nextStageXP - treeState.totalBranchXP;

    if (xpNeeded > 0 && xpNeeded <= 500) {
      recommendations.push({
        email,
        recommendationType: 'stage_hint',
        message: `You are close to ${STAGE_THRESHOLDS[stageThreshold.next]} phase! Just ${xpNeeded} XP away.`,
        suggestedDimensions: [],
        urgency: 'medium'
      });
    }
  }

  const totalXP = dimensions.reduce((sum, d) => sum + d.branchXP, 0);
  const dimensionXP = {};
  dimensions.forEach(d => {
    dimensionXP[d.dimension] = d.branchXP;
  });

  const dominantDimension = Object.entries(dimensionXP).sort((a, b) => b[1] - a[1])[0];
  if (dominantDimension && totalXP > 0) {
    const dominantPercent = (dominantDimension[1] / totalXP) * 100;
    if (dominantPercent > 70) {
      recommendations.push({
        email,
        recommendationType: 'dimension_suggestion',
        message: `${Math.round(dominantPercent)}% of your points come from ${DIMENSION_LABELS[dominantDimension[0]]}. Consider exploring other dimensions for balanced growth.`,
        suggestedDimensions: DIMENSIONS.filter(d => d !== dominantDimension[0]).slice(0, 3),
        urgency: 'medium'
      });
    }
  }

  const lowestDimension = dimensions.sort((a, b) => a.branchXP - b.branchXP)[0];
  if (lowestDimension && lowestDimension.branchXP < 50) {
    recommendations.push({
      email,
      recommendationType: 'dimension_suggestion',
      message: `Your ${DIMENSION_LABELS[lowestDimension.dimension]} is just starting. Consider activities like ${getSuggestedActivity(lowestDimension.dimension)}`,
      suggestedDimensions: [lowestDimension.dimension],
      urgency: 'low'
    });
  }

  return recommendations;
}

function getSuggestedActivity(dimension) {
  const suggestions = {
    curiosity: 'asking questions or exploring new topics',
    consistency: 'maintaining daily streaks and attending sessions',
    collaboration: 'helping peers or participating in group discussions',
    communication: 'giving presentations or written explanations',
    leadership: 'mentoring or leading team activities',
    creativity: 'building unique projects or innovative solutions',
    research: 'reading papers or doing deep dives',
    reflection: 'journaling or self-assessments'
  };
  return suggestions[dimension] || 'learning activities';
}

export async function logActivity(email, dimension, activityType, basePoints, qualityScore, duration, metadata) {
  const todayCount = await getDailyActivityCount(email, dimension);
  const activityConfig = ACTIVITY_POINTS[dimension]?.[activityType];

  if (!activityConfig) {
    throw new Error(`Unknown activity type: ${activityType} for dimension: ${dimension}`);
  }

  const activityLimit = activityConfig.dailyLimit || 999;
  const todayXP = await getTodayXPForDimension(email, dimension);
  const projectedXP = todayXP + basePoints;

  if (projectedXP > activityLimit) {
    const allowedPoints = Math.max(0, activityLimit - todayXP);
    if (allowedPoints <= 0) {
      throw new Error(`Daily limit reached for ${dimension} activities`);
    }
  }

  if (!validateQuality(duration, qualityScore)) {
    throw new Error('Activity does not meet quality requirements (min 5 min or quality > 0.7)');
  }

  const suspicious = detectSuspiciousPattern(email, dimension, basePoints, duration);
  if (suspicious.suspicious) {
    throw new Error(suspicious.reason);
  }

  const appliedPoints = applyDiminishingUtility(basePoints, todayCount);

  const log = await ActivityLog.create({
    email,
    dimension,
    activityType,
    points: basePoints,
    appliedPoints,
    qualityScore: qualityScore || 1.0,
    duration,
    metadata
  });

  const dimensionDoc = await LearningDimension.findOneAndUpdate(
    { email, dimension },
    {
      $push: {
        activities: {
          type: activityType,
          points: appliedPoints,
          qualityScore: qualityScore || 1.0,
          duration,
          createdAt: new Date()
        }
      },
      $inc: { branchXP: appliedPoints },
      $set: { lastActivityAt: new Date() },
      setDefaultsOnInsert: true
    },
    { upsert: true, new: true }
  );

  dimensionDoc.growthPercent = dimensionDoc.calculateGrowthPercent();
  dimensionDoc.level = dimensionDoc.calculateLevel();
  await dimensionDoc.save();

  await updateLearningTree(email);

  return {
    success: true,
    points: basePoints,
    appliedPoints,
    newBranchXP: dimensionDoc.branchXP,
    newGrowthPercent: dimensionDoc.growthPercent
  };
}

export async function updateLearningTree(email) {
  const dimensions = await LearningDimension.find({ email });

  const totalBranchXP = dimensions.reduce((sum, d) => sum + d.branchXP, 0);
  const activeCategories = dimensions.filter(d => d.branchXP > 0).length;

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentActivities = await ActivityLog.find({
    email,
    createdAt: { $gte: weekAgo }
  });

  const weekDimensionCounts = {};
  DIMENSIONS.forEach(d => weekDimensionCounts[d] = 0);
  recentActivities.forEach(a => {
    if (weekDimensionCounts[a.dimension] !== undefined) {
      weekDimensionCounts[a.dimension]++;
    }
  });

  const weekCategoriesActive = Object.values(weekDimensionCounts).filter(c => c > 0).length;

  // Diversity enforcement: apply penalty if weekly categories < 5
  // Per docs/implementation.md: "Weekly requirement: balance in at least 5 categories"
  // Penalty: -10% of weekly XP for each category shortfall
  if (weekCategoriesActive < 5 && totalBranchXP > 0) {
    const categoriesShort = 5 - weekCategoriesActive;
    const weeklyXP = recentActivities.reduce((sum, a) => sum + a.appliedPoints, 0);
    if (weeklyXP > 0) {
      const penaltyPerCategory = Math.round(weeklyXP * 0.1);
      const totalPenalty = penaltyPerCategory * categoriesShort;
      // Apply penalty proportionally across all dimensions
      const penaltyPerDim = Math.ceil(totalPenalty / DIMENSIONS.length);
      for (const dim of DIMENSIONS) {
        if (dim.branchXP > 0) {
          await LearningDimension.findOneAndUpdate(
            { email, dimension: dim },
            { $inc: { branchXP: -penaltyPerDim } }
          );
        }
      }
      // Log diversity penalty transaction
      await ActivityLog.create({
        email,
        dimension: 'consistency',
        activityType: 'diversity_penalty',
        points: -totalPenalty,
        appliedPoints: -totalPenalty,
        qualityScore: 1.0,
        duration: 0,
        metadata: { categoriesShort, weekCategoriesActive, reason: 'Weekly diversity requirement not met (need 5 categories, got ' + weekCategoriesActive + ')' }
      });
    }
  }

  let stage = 'beginner';
  if (totalBranchXP >= 6000 && activeCategories >= 7) stage = 'mentor';
  else if (totalBranchXP >= 3501 && activeCategories >= 6) stage = 'builder';
  else if (totalBranchXP >= 1501 && weekCategoriesActive >= 5) stage = 'practitioner';
  else if (totalBranchXP >= 501 && activeCategories >= 3) stage = 'learner';

  const thresholds = STAGE_THRESHOLDS[stage];
  let stageProgress = 0;
  if (thresholds.next) {
    stageProgress = Math.round(((totalBranchXP - thresholds.min) / (thresholds.max - thresholds.min)) * 100);
    stageProgress = Math.min(100, Math.max(0, stageProgress));
  } else {
    stageProgress = 100;
  }

  const weather = await calculateLearningWeather(email);

  const branchCount = dimensions.filter(d => d.branchXP > 0).length;
  const avgGrowth = dimensions.length > 0
    ? dimensions.reduce((sum, d) => sum + d.growthPercent, 0) / dimensions.length
    : 0;
  const leafDensity = avgGrowth;
  const glowIntensity = stage === 'mentor' ? 100 : stage === 'builder' ? 70 : stage === 'practitioner' ? 40 : 10;

  const tree = await LearningTree.findOneAndUpdate(
    { email },
    {
      $set: {
        totalBranchXP,
        stage,
        stageProgress,
        'treeVisualState.trunkHealth': Math.min(100, 50 + Math.floor(totalBranchXP / 100)),
        'treeVisualState.branchCount': branchCount,
        'treeVisualState.leafDensity': leafDensity,
        'treeVisualState.glowIntensity': glowIntensity,
        learningWeather: weather,
        weeklyMetrics: {
          categoriesActive: weekCategoriesActive,
          totalActivities: recentActivities.length,
          avgQuality: recentActivities.length > 0
            ? recentActivities.reduce((sum, a) => sum + (a.qualityScore || 1), 0) / recentActivities.length
            : 1
        }
      }
    },
    { upsert: true, new: true }
  );

  const newRecommendations = await generateRecommendations(email, tree, dimensions);
  for (const rec of newRecommendations) {
    const existing = await AIRecommendation.findOne({
      email,
      recommendationType: rec.recommendationType,
      read: false,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    if (!existing) {
      await AIRecommendation.create(rec);
    }
  }

  return tree;
}

export async function getLearningTreeData(email) {
  let tree = await LearningTree.findOne({ email });
  const dimensions = await LearningDimension.find({ email });

  if (!tree) {
    tree = await LearningTree.create({ email });
  }

  if (dimensions.length === 0) {
    for (const dim of DIMENSIONS) {
      await LearningDimension.create({
        email,
        dimension: dim,
        branchXP: 0,
        level: 1,
        growthPercent: 0,
        activities: [],
        streakDays: 0
      });
    }
    return getLearningTreeData(email);
  }

  const dimensionMap = {};
  dimensions.forEach(d => {
    dimensionMap[d.dimension] = {
      xp: d.branchXP,
      level: d.level,
      growth: d.growthPercent,
      streakDays: d.streakDays
    };
  });

  const unreadRecommendations = await AIRecommendation.find({
    email,
    read: false
  }).sort({ createdAt: -1 }).limit(5);

  return {
    student: email,
    stage: tree.stage,
    stageProgress: tree.stageProgress,
    totalBranchXP: tree.totalBranchXP,
    treeVisual: tree.treeVisualState,
    learningWeather: tree.learningWeather,
    weeklyMetrics: tree.weeklyMetrics,
    branches: dimensionMap,
    feathers: Object.fromEntries(
      Object.entries(dimensionMap).map(([dim, data]) => [
        dim,
        {
          level: data.level,
          glowing: data.growth >= 100
        }
      ])
    ),
    recommendations: unreadRecommendations
  };
}

export async function getBranchDetail(email, dimension) {
  const dim = await LearningDimension.findOne({ email, dimension });
  if (!dim) {
    throw new Error(`Dimension ${dimension} not found`);
  }

  const activitySummary = {};
  dim.activities.forEach(a => {
    if (!activitySummary[a.type]) {
      activitySummary[a.type] = { count: 0, totalPoints: 0 };
    }
    activitySummary[a.type].count++;
    activitySummary[a.type].totalPoints += a.points;
  });

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentActivities = dim.activities.filter(a => a.createdAt >= thirtyDaysAgo);
  const monthlyGrowth = recentActivities.length > 0
    ? recentActivities.reduce((sum, a) => sum + a.points, 0)
    : 0;

  return {
    dimension,
    label: DIMENSION_LABELS[dimension],
    color: DIMENSION_COLORS[dimension],
    xp: dim.branchXP,
    level: dim.level,
    growthPercent: dim.growthPercent,
    streakDays: dim.streakDays,
    lastActivityAt: dim.lastActivityAt,
    activities: dim.activities.slice(-20).reverse(),
    activitySummary,
    monthlyGrowth
  };
}

export async function getFeatherData(email) {
  const dimensions = await LearningDimension.find({ email });
  const dimensionMap = {};
  dimensions.forEach(d => {
    dimensionMap[d.dimension] = d;
  });

  return DIMENSIONS.map((dim, index) => {
    const d = dimensionMap[dim];
    const angle = (index * 45) - 90;
    return {
      dimension: dim,
      color: DIMENSION_COLORS[dim],
      label: DIMENSION_LABELS[dim],
      angle,
      level: d?.level || 1,
      growth: d?.growthPercent || 0,
      glowing: (d?.growthPercent || 0) >= 100
    };
  });
}

export async function markRecommendationRead(id) {
  await AIRecommendation.findByIdAndUpdate(id, { read: true });
}

export async function getActivityHistory(email, dimension, limit = 50) {
  const query = { email };
  if (dimension) {
    query.dimension = dimension;
  }
  return ActivityLog.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}