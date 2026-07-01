# Learning Tree — Implementation Guide

## Overview

The **Learning Tree** is a visual ecosystem that replaces the transactional "SP and rank" view with an identity-forming "who am I becoming?" experience. It visualizes student growth as a living, breathing tree that evolves through stages.

**Replaces:** The Egg visualization concept  
**Keeps:** 8 feathers, AI advisor, Learning Weather, transformation story, points system  
**Philosophy:** Learning is not a leaderboard. Learning is a living narrative.

---

## Visual Concept

### Tree Structure

```
                    👑 Mentor Stage
                         🔥
                        / | \
                       /  |  \
              ═══════════════════════
              ║   LEARNING TREE       ║
              ║                       ║
              ║    🌿 Leaves/Fruits   ║
              ║   (Skills & Activities)║
              ║                       ║
              ║    🌾 Branches        ║
              ║   (8 Dimensions)      ║
              ║                       ║
              ║    |  YOU  |          ║
              ║  (Student Center)     ║
              ║                       ║
              ║    🪵 Trunk           ║
              ║  (Core SP & Growth)   ║
              ║                       ║
              ║    🌱 Roots           ║
              ║ (Foundation/Start)    ║
              ╚═══════════════════════╝

         Around the tree: 8 Feathers floating
```

### Tree Evolution Stages

| Stage | Visual | Description |
|-------|--------|-------------|
| 🌱 Seed | Small seed with 2 tiny leaves | Beginner — just started |
| 🌿 Sapling | Thin trunk, few branches, sparse leaves | Learner — basic growth |
| 🌳 Growing Tree | Visible trunk, branches spreading, leaves forming | Practitioner — active learning |
| 🌸 Blooming Tree | Full branches, flowers blooming, fruits appearing | Builder — creating & contributing |
| 🔥 Glowing Tree | Tree radiates light, feathers full, majestic | Mentor — guiding others |

---

## The 8 Branches (Dimensions)

Each branch represents one learning dimension. Students earn "branchXP" for each dimension.

| Branch | Color | Activities That Grow It | Daily Limit |
|--------|-------|------------------------|-------------|
| **Curiosity** | Yellow | Questions asked, new topics explored, research questions | 50 pts/day |
| **Consistency** | Blue | Daily streak, attendance, weekly goals completed | 80 pts/day |
| **Collaboration** | Green | Peer help, team projects, code reviews, group discussions | 100 pts/day |
| **Communication** | Orange | Presentations, written explanations, feedback given | 80 pts/day |
| **Leadership** | Purple | Mentoring sessions, team lead roles, workshops conducted | 100 pts/day |
| **Creativity** | Pink | Unique projects, innovative solutions, design creation | 80 pts/day |
| **Research** | Red | Papers read, deep dives, literature reviews | 100 pts/day |
| **Reflection** | White | Journal entries, self-assessments, goal setting, progress reviews | 60 pts/day |

### Branch Growth Mechanics

```
Initial State:
    |
    v
[====] 10% grown — 1 tiny leaf

Mid Growth:
    |
    v
[========----] 50% grown — leaves, small blossoms

Full Growth:
    |
    v
[============] 100% — flowers bloom, fruits appear, glow effect
```

### Branch XP to Growth Percentage

```
0-100 XP     → 0-25%   (Seedling)
101-250 XP   → 26-50%  (Growing)
251-500 XP   → 51-75%  (Mature)
501+ XP      → 76-100% (Fully Grown)
```

---

## The 8 Feathers (Floating Around Tree)

Feathers orbit the tree and respond to mouse movement. They represent the same 8 dimensions as branches but are external, visible indicators of mastery.

| Feather | Color | Visual State at Different Levels |
|---------|-------|----------------------------------|
| Yellow | 🪶🪶🪶🪶🪶 | Empty → Single feather → Multiple → Full glow |
| Blue | 🪶🪶🪶🪶🪶 | Empty → Single feather → Multiple → Full glow |
| Green | 🪶🪶🪶🪶🪶 | Empty → Single feather → Multiple → Full glow |
| Orange | 🪶🪶🪶🪶🪶 | Empty → Single feather → Multiple → Full glow |
| Purple | 🪶🪶🪶🪶🪶 | Empty → Single feather → Multiple → Full glow |
| Pink | 🪶🪶🪶🪶🪶 | Empty → Single feather → Multiple → Full glow |
| Red | 🪶🪶🪶🪶🪶 | Empty → Single feather → Multiple → Full glow |
| White | 🪶🪶🪶🪶🪶 | Empty → Single feather → Multiple → Full glow |

### Feather Interactions
- **Mouse hover:** Feather enlarges slightly, tooltip shows dimension name and XP
- **Mouse move near:** Feathers gently rotate/follow cursor
- **Milestone reached:** Feather glows with pulsing light effect
- **All feathers full:** Rainbow glow effect around entire tree

---

## Points System

### Dimension Points (BranchXP)

| Behavior | Points | Daily Limit |
|----------|--------|-------------|
| **Curiosity Points** | | |
| Question asked | 10 | 50/day |
| New topic explored | 20 | 60/day |
| Research question | 15 | 45/day |
| Exploration session | 5/10min | 100/day |
| **Consistency Points** | | |
| Daily streak bonus | 10+ (see formula) | Increasing |
| Attendance (per session) | 5 | 80/day |
| Weekly goal completed | 20 | — |
| Monthly goal completed | 50 | — |
| **Collaboration Points** | | |
| Peer help | 15/help | 100/day |
| Team project contribution | 25 | — |
| Code review | 10 | — |
| Group discussion | 10 | — |
| **Communication Points** | | |
| Presentation delivered | 25 | 80/day |
| Written explanation | 15 | 60/day |
| Feedback given | 10 | 40/day |
| **Leadership Points** | | |
| Mentoring session | 30 | 100/day |
| Team lead role | 40 | — |
| Workshop conducted | 50 | — |
| Community guidance | 25 | — |
| **Creativity Points** | | |
| Unique project | 40 | 80/day |
| Innovative solution | 35 | — |
| Design creation | 20 | — |
| Novel approach | 30 | — |
| **Research Points** | | |
| Paper read | 15 | 100/day |
| Deep dive session | 20 | — |
| Research question answered | 25 | — |
| Literature review | 30 | — |
| **Reflection Points** | | |
| Journal entry | 10 | 60/day |
| Self-assessment | 15 | — |
| Goal setting | 10 | — |
| Progress review | 20 | — |

### Streak Bonus Formula

```
Days 1-7:   10 points (base)
Days 8-14:  15 points (+50%)
Days 15-21: 20 points (+100%)
Days 22+:   25 points (+150%)
```

### Anti-Cheat Rules

#### Quality Requirements
- Minimum effort: 5 minutes per activity
- Quality grade must be > 0.7
- Suspicious activities checked manually

#### Diminishing Marginal Utility
```
Activity 1: 100% points
Activity 2:  80% points
Activity 3:  60% points
Activity 4+: 40% points
```

#### Diversity Requirement
- Must earn points in **at least 3 categories** to be valid
- **Weekly requirement:** balance in at least 5 categories
- Punishment for narrow, single-category farming

#### Suspicious Pattern Detection
- Suspiciously fast point earning (e.g., 100 points in 1 minute)
- Suspicious repetition (same activity copied)
- Suspicious learning pattern inconsistency
- Suspicious gaming attempts (auto-clicking, bot behavior)

---

## Learning Stages

Students evolve through 5 stages based on total BranchXP and diversity:

```
🌱 Beginner (0-500 BranchXP, < 3 categories)
    ↓
📚 Learner (501-1500 BranchXP, ≥ 3 categories)
    ↓
⚡ Practitioner (1501-3500 BranchXP, ≥ 5 categories)
    ↓
🏗 Builder (3501-6000 BranchXP, ≥ 6 categories)
    ↓
👑 Mentor (6000+ BranchXP, ≥ 7 categories, leadership activities)
```

### Stage Transition Requirements

| Transition | Requirements |
|------------|--------------|
| Beginner → Learner | 500+ BranchXP, active in 3+ dimensions |
| Learner → Practitioner | 1500+ BranchXP, active in 5+ dimensions |
| Practitioner → Builder | 3500+ BranchXP, active in 5+ dimensions, 2+ projects |
| Builder → Mentor | 6000+ BranchXP, leadership activities, mentorship started |

---

## AI Growth Advisor

### What It Analyzes
- Attendance patterns
- Poll participation
- Project completion
- SP growth rate
- Learning consistency
- Collaboration frequency
- Dimension balance

### Example Outputs

#### "You're close to Builder phase"
```
⚠️ You are close to Builder phase.
However, your Communication and Research branches are still growing.
Before entering Mentor phase, focus on:
✓ Knowledge Sharing
✓ Research
✓ Team Collaboration
```

#### "Rapid Curiosity Growth"
```
Your Curiosity branch is growing rapidly.
You may enjoy:
• AI Research
• Open Source Projects
• Advanced Challenges
```

#### "Imbalanced Growth Warning"
```
⚠️ 80% of your points come from Consistency.
Consider exploring:
• Creativity projects
• Research papers
• Team collaboration
This helps unlock Builder stage faster.
```

---

## Learning Weather

AI generates emotional learning weather based on engagement patterns.

### Weather Types

| Weather | Meaning | Indicators |
|---------|---------|------------|
| 🌱 Spring | New skills, exploration phase | Recent topic exploration, questions asked |
| ☀ Summer | Peak productivity | High daily activity, streak active |
| 🍁 Autumn | Revision, consolidation | Review activities, reflection entries |
| ❄ Winter | Burnout risk | Declining activity, missed sessions |

### Weather Display
```
Today's Learning Weather
☀ Motivation: High
🌈 Curiosity: Excellent
☁ Confidence: Medium
🌧 Stress: Low
```

---

## Interactive Exploration

### Clicking a Branch
When student clicks a branch (e.g., Research):

```
Research Branch 🌳
━━━━━━━━━━━━━━━━━
Papers Read: 15 (+225 XP)
Questions Asked: 20 (+300 XP)
Deep Dives: 3 (+60 XP)

Growth: +35% this month

Suggestion: Explore AI Ethics next.
```

### Clicking the Trunk
```
Your Learning Tree
━━━━━━━━━━━━━━━━━
Total BranchXP: 2,847
Stage: ⚡ Practitioner

Strongest: Consistency (95%)
Growing: Curiosity (+12% this week)
Weakest: Leadership (23%)

Next milestone: Builder stage (1,654 XP to go)
```

### Clicking a Feather
Tooltip with dimension details and suggestions.

---

## Data Model Changes

### New MongoDB Collections

#### learningDimensions
```javascript
{
  _id: ObjectId,
  email: String,           // student identifier
  dimension: String,       // 'curiosity' | 'consistency' | 'collaboration' |
                          // 'communication' | 'leadership' | 'creativity' |
                          // 'research' | 'reflection'
  branchXP: Number,        // total XP in this dimension
  level: Number,           // 1-10 scale
  growthPercent: Number,   // 0-100
  activities: [{
    type: String,          // activity type
    points: Number,
    qualityScore: Number,  // 0-1
    duration: Number,      // minutes
    createdAt: Date
  }],
  streakDays: Number,      // consecutive days of activity
  lastActivityAt: Date,
  updatedAt: Date
}
```

#### learningTree
```javascript
{
  _id: ObjectId,
  email: String,
  totalBranchXP: Number,   // sum of all branch XP
  stage: String,           // 'beginner' | 'learner' | 'practitioner' | 'builder' | 'mentor'
  stageProgress: Number,   // 0-100 to next stage
  treeVisualState: {
    trunkHealth: Number,   // 0-100
    branchCount: Number,   // branches with activity
    leafDensity: Number,   // 0-100
    glowIntensity: Number  // 0-100
  },
  learningWeather: {
    type: String,          // 'spring' | 'summer' | 'autumn' | 'winter'
    motivation: String,    // 'high' | 'medium' | 'low'
    curiosity: String,     // 'excellent' | 'good' | 'medium' | 'low'
    confidence: String,    // 'high' | 'medium' | 'low'
    stress: String         // 'low' | 'medium' | 'high'
  },
  weeklyMetrics: {
    categoriesActive: Number,
    totalActivities: Number,
    avgQuality: Number
  },
  updatedAt: Date
}
```

#### activityLogs
```javascript
{
  _id: ObjectId,
  email: String,
  dimension: String,
  activityType: String,
  points: Number,
  appliedPoints: Number,   // after diminishing utility
  qualityScore: Number,
  duration: Number,
  metadata: Object,        // extra context
  createdAt: Date
}
```

#### aiRecommendations
```javascript
{
  _id: ObjectId,
  email: String,
  recommendationType: String,  // 'stage_hint' | 'dimension_suggestion' | 'weather_alert'
  message: String,
  suggestedDimensions: [String],
  urgency: String,             // 'high' | 'medium' | 'low'
  read: Boolean,
  createdAt: Date
}
```

---

## API Endpoints (FastAPI)

### Core Endpoints

```
GET  /api/learning-tree
     → Returns student's tree state, stage, branchXP per dimension

GET  /api/learning-tree/branches
     → Returns detailed branch data with activities

GET  /api/learning-tree/feathers
     → Returns feather positions and visual states

GET  /api/learning-tree/weather
     → Returns current learning weather

GET  /api/learning-tree/advisor
     → Returns AI-generated recommendations

GET  /api/learning-tree/stage
     → Returns current stage and progress to next

POST /api/learning-tree/activity
     → Log a new activity (auto-calculates points)

GET  /api/learning-tree/history
     → Returns activity history with filters
```

### Request/Response Examples

#### POST /api/learning-tree/activity
```json
// Request
{
  "dimension": "curiosity",
  "activityType": "question_asked",
  "duration": 5,
  "metadata": {
    "topic": "Machine Learning",
    "subTopic": "Neural Networks"
  }
}

// Response
{
  "success": true,
  "points": 10,
  "appliedPoints": 10,        // after anti-cheat
  "newBranchXP": {
    "curiosity": 110,
    "total": 1847
  },
  "branchGrowth": {
    "curiosity": "26%",
    "prev": "25%", "delta": "+1%"
  },
  "stageProgress": {
    "current": "learner",
    "next": "practitioner",
    "percent": 67
  },
  "newRecommendation": null
}
```

#### GET /api/learning-tree
```json
// Response
{
  "student": "rahul@iitrpr.ac.in",
  "stage": "learner",
  "stageProgress": 67,
  "totalBranchXP": 1847,
  "treeVisual": {
    "trunkHealth": 82,
    "branchCount": 6,
    "leafDensity": 58,
    "glowIntensity": 35
  },
  "branches": {
    "curiosity":    { "xp": 340, "level": 3, "growth": 68 },
    "consistency":  { "xp": 520, "level": 5, "growth": 95 },
    "collaboration":{ "xp": 180, "level": 2, "growth": 36 },
    "communication":{ "xp": 150, "level": 2, "growth": 30 },
    "leadership":   { "xp": 80,  "level": 1, "growth": 16 },
    "creativity":   { "xp": 220, "level": 2, "growth": 44 },
    "research":     { "xp": 190, "level": 2, "growth": 38 },
    "reflection":   { "xp": 167, "level": 2, "growth": 33 }
  },
  "feathers": {
    "curiosity":    { "level": 3, "glowing": false },
    "consistency":  { "level": 5, "glowing": true },
    "collaboration":{ "level": 2, "glowing": false },
    "communication":{ "level": 2, "glowing": false },
    "leadership":   { "level": 1, "glowing": false },
    "creativity":   { "level": 2, "glowing": false },
    "research":     { "level": 2, "glowing": false },
    "reflection":   { "level": 2, "glowing": false }
  }
}
```

---

## Frontend Architecture

### Tech Stack
- **React + TypeScript** — component structure, state management
- **D3.js** — tree visualization, force-directed layout
- **SVG** — scalable tree graphics, feathers
- **Framer Motion** — animations, transitions, hover effects

### Component Structure

```
src/
├── components/
│   └── learning-tree/
│       ├── LearningTree.tsx          # Main container
│       ├── TreeVisual/
│       │   ├── Tree.tsx              # D3.js tree rendering
│       │   ├── Trunk.tsx             # Center trunk SVG
│       │   ├── Branch.tsx            # Individual branch
│       │   ├── Leaves.tsx            # Leaf particles
│       │   └── GlowEffect.tsx        # Milestone glow
│       ├── Feathers/
│       │   ├── FeatherOrbit.tsx      # Floating feathers container
│       │   ├── Feather.tsx           # Individual feather
│       │   └── FeatherTooltip.tsx    # Hover tooltip
│       ├── LearningWeather/
│       │   └── WeatherDisplay.tsx    # Weather visualization
│       ├── Advisor/
│       │   └── AIAdvisor.tsx         # AI recommendations panel
│       ├── StageIndicator/
│       │   └── StageProgress.tsx     # Current stage + next milestone
│       └── BranchDetail/
│           └── BranchModal.tsx       # Click-to-explore branch
├── hooks/
│   ├── useLearningTree.ts            # Main data hook
│   ├── useFeatherPhysics.ts          # Mouse-move feather animation
│   └── useTreeAnimation.ts           # Growth animations
├── services/
│   └── learningTreeApi.ts            # API calls
├── utils/
│   ├── branchCalculations.ts         # XP, growth % calculations
│   ├── antiCheat.ts                  # Quality, pattern detection
│   └── treeLayout.ts                 # D3 tree positioning
└── types/
    └── learningTree.ts               # TypeScript interfaces
```

### D3.js Tree Layout

```
Initial Load:
1. Calculate tree center (viewport center)
2. Position trunk at center
3. Place 8 branches at 45° intervals around trunk
4. Initialize feather positions in outer orbit

Branch Positioning (polar coordinates):
- Branch 1 (Curiosity):    0°   (top)
- Branch 2 (Consistency):  45°
- Branch 3 (Collaboration):90°  (right)
- Branch 4 (Communication):135°
- Branch 5 (Leadership):   180° (bottom)
- Branch 6 (Creativity):   225°
- Branch 7 (Research):     270° (left)
- Branch 8 (Reflection):   315°
```

### Feather Animation Physics

```
Mouse Movement:
- Calculate distance from cursor to each feather
- Apply gentle rotation toward cursor (lerp factor: 0.05)
- Feathers in "shadow" rotate away from cursor

Idle Animation:
- Each feather has slight oscillation (sin wave, different phase)
- Period: 3-5 seconds per feather
- Amplitude: 5-10° rotation

Milestone Glow:
- Trigger when branch reaches 100%
- Feather pulses with box-shadow/glow
- Color intensifies
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Create new MongoDB collections (`learningDimensions`, `learningTree`, `activityLogs`, `aiRecommendations`)
- [ ] Set up FastAPI routes for Learning Tree API
- [ ] Create `POST /api/learning-tree/activity` endpoint with anti-cheat logic
- [ ] Build dimension XP calculation service
- [ ] Implement diminishing utility calculation
- [ ] Build basic `GET /api/learning-tree` endpoint

### Phase 2: Visualization Core (Week 3-4)
- [ ] Set up D3.js in React project
- [ ] Create basic SVG tree structure (trunk + 8 branches)
- [ ] Implement branch positioning algorithm
- [ ] Build branch click interaction
- [ ] Create branch detail modal
- [ ] Connect to API and render dynamic data

### Phase 3: Feathers & Animation (Week 5-6)
- [ ] Create 8 feather SVG components
- [ ] Implement feather orbit layout
- [ ] Add mouse-follow physics
- [ ] Create hover tooltip
- [ ] Add milestone glow effects
- [ ] Implement idle oscillation animation

### Phase 4: Learning Weather & Advisor (Week 7)
- [ ] Build weather calculation algorithm
- [ ] Create weather display component
- [ ] Implement AI recommendation engine (rule-based initially)
- [ ] Build advisor panel
- [ ] Connect recommendations to stage transitions

### Phase 5: Stage Evolution (Week 8)
- [ ] Implement stage calculation logic
- [ ] Build stage transition animations
- [ ] Create tree visual state changes per stage
- [ ] Build achievement/milestone notifications
- [ ] Add tree growth animations (leaves appearing, trunk thickening)

### Phase 6: Polish & Anti-Cheat (Week 9)
- [ ] Quality score validation
- [ ] Suspicious pattern detection
- [ ] Diversity requirement enforcement
- [ ] Framer Motion polish for all transitions
- [ ] Mobile responsive adjustments
- [ ] Performance optimization (lazy loading, virtualization)

### Phase 7: Integration & Testing (Week 10)
- [ ] Integrate with existing Spurti dashboard
- [ ] Connect to existing SP/attendance data as input source
- [ ] End-to-end testing
- [ ] User testing and feedback
- [ ] Bug fixes and refinements

---

## Integration with Existing Spurti

### Data Flow

```
Existing Spurti                    Learning Tree
────────────────                   ──────────────
Attendance record          →       Consistency dimension
Poll participation         →       Engagement + Research dimension
Chat/Discussion            →       Communication dimension
Project completion         →       Creativity dimension
Mentoring/Helping          →       Leadership dimension
Survey/Reflection          →       Reflection dimension
Session attendance         →       Trunk health (overall SP)
```

### Connecting Points

1. **Existing SP transactions** → Parse category → Map to dimensions
2. **Attendance records** → Auto-credit Consistency
3. **Poll records** → Auto-credit Research/Engagement
4. **Manual SP awards** → Map to appropriate dimension
5. **Survey completions** → Reflection dimension

### Migration Strategy
1. Calculate historical BranchXP from existing `sptransactions`
2. Backfill `learningDimensions` for all students
3. Calculate initial tree state and stage
4. Run Learning Tree alongside existing dashboard (no replacement yet)
5. Monitor for 2 weeks, then full switch

---

## Performance Considerations

### Frontend
- Use `React.memo` for tree/branch components
- D3.js calculations in Web Worker if complex
- Throttle mouse movement handlers (16ms)
- Use CSS transforms for animations (GPU accelerated)
- Lazy load branch detail modals

### Backend
- Cache tree state (invalidate on new activity)
- Aggregate BranchXP daily, not per request
- Use MongoDB indexes on `email + dimension`
- Batch recommendation generation (cron, not on-demand)

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Dashboard engagement | +40% time spent on learning tree view |
| Dimension diversity | 60% students active in 5+ dimensions |
| Stage progression | 50% students advance one stage in 30 days |
| Weather accuracy | AI weather matches student-reported mood (survey) |
| Anti-cheat false positives | < 2% of activities flagged |

---

## Open Questions / Future Enhancements

1. **Social learning:** See peers' trees (anonymized) for motivation
2. **Collaboration missions:** Two students' trees grow together
3. **Seasonal events:** Special activities during exam prep, breaks
4. **Physical rewards:** Tree milestones unlock physical rewards (badges, certificates)
5. **Parent/mentor view:** Show growth story to mentors
6. **Export:** Download learning journey as PDF/story

---

## Visual Reference

Inspired by: [Searching for Birds](https://searchingforbirds.visualcinnamon.com/)

Key visual elements to study:
- Voronoi cell layout
- Feather physics and hover effects
- Egg transformation animation
- Ecosystem particle system

---

## Summary

The Learning Tree transforms Spurti from:
- ❌ "How many SP do I have?" → ✅ "Who am I becoming?"

It adds:
- 8 growth dimensions (branches)
- Visual ecosystem with feathers
- AI-powered advisor
- Learning weather
- Stage-based progression
- Anti-cheat with quality requirements

**Core philosophy:** Learning is not a leaderboard. Learning is a living narrative.

The tree grows with the learner — and like a real tree, it tells a story of time, effort, and transformation.