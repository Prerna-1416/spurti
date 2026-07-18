import type { ActivityEvent, ChestTier, RewardSpec } from './index';
import type { Achievement } from './AchievementPopup';
import { makeRewardId } from './RewardPopup';

export interface DemoCallbacks {
  pushActivity: (event: Omit<ActivityEvent, 'id'>) => void;
  showReward: (reward: RewardSpec) => void;
  showAchievement: (a: Achievement) => void;
  showChest: (tier: ChestTier, label: string, emoji: string) => void;
  showDailyLogin: () => void;
  showLegend: () => void;
  bumpStreak: () => void;
  setStreakCelebrating: (b: boolean) => void;
  triggerScoreCardGlow: () => void;
}

const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function playDemo(cbs: DemoCallbacks): Promise<void> {
  cbs.showDailyLogin();
  await wait(2200);
  cbs.pushActivity({ type: 'login', sp: 10, label: 'Daily Login Bonus' });
  await wait(1100);

  cbs.showReward({
    kind: 'attendance',
    title: 'Attendance Complete',
    amount: 10,
    message: 'You were present and counted.',
    emoji: '✅',
    flavor: 'Keep showing up.'
  });
  cbs.pushActivity({ type: 'attendance', sp: 10, label: 'Attendance Completed' });
  cbs.bumpStreak();
  await wait(2200);

  cbs.setStreakCelebrating(true);
  await wait(1500);
  cbs.setStreakCelebrating(false);

  cbs.showReward({
    kind: 'poll',
    title: 'Poll Submitted',
    amount: 10,
    message: 'Your voice was heard.',
    emoji: '🗳️',
    flavor: 'Every poll shapes the cohort.'
  });
  cbs.pushActivity({ type: 'poll', sp: 10, label: 'Poll Submitted' });
  await wait(2200);

  cbs.showReward({
    kind: 'session',
    title: 'Session Completed',
    amount: 20,
    message: 'You stayed till the end.',
    emoji: '📚',
    flavor: 'Knowledge compounds.'
  });
  cbs.pushActivity({ type: 'session', sp: 20, label: 'Session Completed' });
  await wait(2200);

  cbs.showChest('bronze', '+20 SP Bonus', '📦');
  await wait(3600);

  cbs.showReward({
    kind: 'streak',
    title: '7-Day Streak Bonus',
    amount: 30,
    message: 'You came back every day this week.',
    emoji: '🔥',
    flavor: 'Consistency is the cheat code.'
  });
  cbs.pushActivity({ type: 'streak', sp: 30, label: '7-Day Streak Bonus' });
  await wait(2200);

  cbs.showAchievement({
    id: 'first-research-question',
    title: 'Research Pioneer',
    description: 'You submitted your first research question.',
    emoji: '🔬',
    rarity: 'epic'
  });
  cbs.pushActivity({ type: 'badge', sp: 50, label: 'Research Pioneer Badge', emoji: '🔬' });
  await wait(2400);

  cbs.showReward({
    kind: 'project',
    title: 'Project Reviewed',
    amount: 40,
    message: 'A mentor signed off on your project.',
    emoji: '📁',
    flavor: 'Shipped > perfect.'
  });
  cbs.pushActivity({ type: 'project', sp: 40, label: 'Project Reviewed' });
  await wait(2200);

  cbs.showLegend();
}

export function chestTierForDay(day: number): ChestTier {
  if (day >= 30) return 'legendary';
  if (day >= 15) return 'diamond';
  if (day >= 7)  return 'gold';
  if (day >= 3)  return 'silver';
  return 'bronze';
}