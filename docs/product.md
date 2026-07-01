# Spurti - Product Overview

## What Is Spurti?

Spurti is a student engagement tracking and motivation system for the VLED Summership program at IIT Ropar. It tracks student participation through Spurti Points (SP) and helps maintain learning momentum throughout the program.

**Live Production URL:** `https://samagama.in/spurti/`

## Core Problem It Solves

Students often start courses with enthusiasm but lose consistency over time. Traditional systems only show marks or attendance at the end — too late to help. Spurti makes learning engagement visible in real-time so students and mentors can intervene early.

## Key Concepts

### Spurti Points (SP)
- SP measures **engagement behavior**, not academic performance
- Students earn SP for attendance, poll participation, chat, and milestones
- SP is not marks — a student can have high marks but low SP if they don't participate consistently
- Every active student starts with **100 SP** on their official internship start date

### Student Lifecycle
```
yet to onboard → active → excused
```
- **yet to onboard:** exists in system but hasn't started earning SP
- **active:** can earn and lose SP
- **excused:** excluded from active calculations, SP history preserved

## SP Earning Rules

| Category | Threshold | SP Change |
|----------|-----------|-----------|
| Initial credit | On internship start date | +100 |
| Attendance | ≥90% of session window | +10 |
| Attendance | 75–89% | +5 |
| Attendance | 50–74% | +3 |
| Attendance | <50% | 0 |
| Poll | ≥90% questions attempted | +10 |
| Poll | 75–89% | +5 |
| Poll | 50–74% | +3 |
| Poll | <50% | 0 |
| Chat | Admin-reviewed via ChatSPReview | ± varies |

### Attendance Window Clipping
Presence is clipped to `[09:05 IST, min(first-instance-end, 11:00 IST)]` to standardize scoring.

### Grace Day
2026-06-06: 1-min join = full attendance + full poll.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite (client/) |
| Backend | Express.js (server/server.js) |
| Database | MongoDB with Mongoose |
| Auth | Cookie-based (`chatengine_token` passthrough from Samagama) |
| Hosting | samagama.in:5003 via Nginx proxy `/spurti` → `127.0.0.1:5003` |

## Architecture

The system has two halves that communicate only through MongoDB:

1. **Web App (this repo):** Express API + React SPA. Read-only consumer of `sakshi_spurti`.
2. **SP Pipeline (pipeline/):** Runs on samagama server as `samagama` user via cron. The scoring engine that WRITES to `sakshi_spurti`.

**SP is computed by `pipeline/sp-rubric-build-mirror.cjs`** — reads only MongoDB mirrors (no Zoom credentials, no live API).

## Database Schema

### Core Collections

**students**
- `_id, name, email, alternateEmail`
- `internshipStartDate, internshipEndDate`
- `status: 'active' | 'excused'`
- `totalSp (default: 100)`

**sessions**
- `label, date, type, startDateTime, endDateTime, totalMinutes`

**sptransactions**
- `email, studentId, category, sessionLabel`
- `deltaMode: 'absolute' | 'percentage'`
- `deltaValue, appliedDelta, balanceAfter`
- `reason, dateTime, createdAt`

**attendancerecords**
- `email, studentId, sessionLabel`
- `attendedMinutes, totalSessionMinutes`
- `attendancePercentage, qualified, transactionId`

**pollrecords**
- `email, studentId, sessionLabel`
- `totalQuestions, attemptedQuestions, missedQuestions`
- `responses[], transactionId`

**chatrecords**
- `email, studentId, sessionLabel`
- `messages[], positiveCount, negativeCount, neutralCount`
- `overallSentiment, transactionId`

**chatspreviews (ChatSPReview)**
- `sessionLabel, dateTime, studentName, studentEmail, studentId`
- `issuedByName, delta, reason, evidenceText, sourceMessage, sourceMessageKey, confidence`
- `status: 'pending' | 'accepted' | 'rejected'`
- `reviewedBy, reviewedAt, transactionId`

## Key Features

### Leaderboard
- `GET /api/leaderboard` — SP rankings of active students
- Shows engagement and consistency, not academic performance

### Chat SP Reviews
- Admin-reviewed discretionary SP awards
- `GET /api/admin/chat-sp-reviews` — pending reviews
- `POST /api/admin/chat-sp-reviews/:id/accept` — award SP
- `POST /api/admin/chat-sp-reviews/:id/reject` — reject

### Survey Popup
- Mandatory blocking modal requiring students to complete a Google Form survey
- Configured via env vars (`SURVEY_ENABLED`, `SURVEY_FORM_URL`, `SURVEY_ENFORCEMENT`, `SURVEY_DEADLINE`)
- Auto-expires after deadline — no redeploy needed
- Webhook verifies real submissions via Google Apps Script

### Attendance Window
- Standardized to `[09:05 IST, min(end, 11:00 IST)]`
- Clipped presence prevents gaming the window

## Configuration (Environment Variables)

```
MONGO_URI=mongodb://127.0.0.1:27017/sakshi_spurti
PORT=5003
SAMAGAMA_AUTH_URL=http://127.0.0.1:5001/api/auth/me

# Survey (optional)
SURVEY_ENABLED=1
SURVEY_FORM_URL=https://docs.google.com/forms/d/e/XXXX/viewform
SURVEY_EMAIL_ENTRY=entry.1234567890
SURVEY_ENFORCEMENT=hard
SURVEY_DEADLINE=2026-06-30T23:59:59+05:30
SURVEY_WEBHOOK_SECRET=<secret>
```

## Common Tasks

### Run SP Pipeline (dry run)
```bash
cd pipeline
node sp-rubric-build-mirror.cjs
```

### Run SP Pipeline (apply changes)
```bash
APPLY=1 node sp-rubric-build-mirror.cjs
```
Auto-backs up `sptransactions` + `students` before writing.

### Rebuild Student Data
```bash
npm run rebuild
```

### Sync New Students
```bash
npm run sync-students -- data/new-roster.csv
```

## Admin Contacts

- **Admin/owner:** Rohit (rohit@iitrpr.ac.in) — manages students, SP reviews
- **Server SSH:** `ssh sakshi@samagama.in`
- **SSH path:** `/home/sakshi/spurti`

## Known Issues

- Session label format mismatch: display code uses old `"15 May Morning"` format while pipeline produces `Day N (DD Mon)` — known issue to reconcile
- `deltaMode` validator requires `'absolute' | 'percentage'` — using `'percent'` causes validation failure

## Source of Truth

- **Database:** `sakshi_spurti` on port 27017 (auth required)
- **Verify SP correctness:** `sum(appliedDelta) == totalSp` per student
- **Verify leaderboard:** `/api/leaderboard` returns same `totalSp` as `students` collection