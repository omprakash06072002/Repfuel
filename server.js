const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const { Pool } = require('pg');

const MODEL_VERSION = '1.1.0'
const app = express();
const port = process.env.PORT || 3000;
const origin = process.env.ALLOWED_ORIGIN || true;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin }));
app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname)));

let pool = null;
if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
}

async function initDb() {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS workout_events (
      id BIGSERIAL PRIMARY KEY,
      session_id TEXT NOT NULL,
      workout_id TEXT,
      training_level TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      body_weight_kg REAL,
      height_cm REAL,
      age_years REAL,
      sex TEXT,
      body_part TEXT,
      exercise TEXT,
      equipment TEXT,
      exercise_family TEXT,
      load_kg REAL,
      reps INTEGER,
      sets INTEGER,
      active_seconds REAL,
      rest_seconds REAL,
      total_volume_kg REAL,
      estimated_net_kcal REAL,
      estimate_low_kcal REAL,
      estimate_high_kcal REAL,
      model_version TEXT NOT NULL,
      body_fat_percent REAL,
      published_anchor_kcal REAL,
      consent BOOLEAN NOT NULL DEFAULT FALSE
    );
  `);
  await pool.query(`ALTER TABLE workout_events ADD COLUMN IF NOT EXISTS workout_id TEXT`);
  await pool.query(`ALTER TABLE workout_events ADD COLUMN IF NOT EXISTS training_level TEXT`);
  await pool.query(`ALTER TABLE workout_events ADD COLUMN IF NOT EXISTS body_fat_percent REAL`);
  await pool.query(`ALTER TABLE workout_events ADD COLUMN IF NOT EXISTS published_anchor_kcal REAL`);
}

app.get('/api/health', async (_req, res) => {
  res.json({ ok: true, dataCollection: Boolean(pool), modelVersion: MODEL_VERSION });
});

app.post('/api/workout-event', async (req, res) => {
  const d = req.body || {};
  if (!d.consent || !d.sessionId || !d.exercise) {
    return res.status(400).json({ error: 'consent, sessionId and exercise are required' });
  }
  if (!pool) return res.status(503).json({ error: 'Data collection database is not configured' });

  try {
    await pool.query(`
      INSERT INTO workout_events
      (session_id, workout_id, training_level, body_weight_kg, height_cm, age_years, sex, body_part, exercise, equipment,
       exercise_family, body_fat_percent, published_anchor_kcal, load_kg, reps, sets, active_seconds, rest_seconds, total_volume_kg,
       estimated_net_kcal, estimate_low_kcal, estimate_high_kcal, model_version, consent)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
    `, [
      String(d.sessionId).slice(0, 80), String(d.workoutId || '').slice(0, 80), String(d.trainingLevel || '').slice(0, 30), d.bodyWeightKg ?? null, d.heightCm ?? null, d.ageYears ?? null,
      d.sex ?? null, d.bodyPart ?? null, String(d.exercise).slice(0, 120), d.equipment ?? null,
      d.exerciseFamily ?? null, d.bodyFatPercent ?? null, d.publishedAnchorKcal ?? null, d.loadKg ?? null, d.reps ?? null, d.sets ?? null,
      d.activeSeconds ?? null, d.restSeconds ?? null, d.totalVolumeKg ?? null,
      d.estimatedNetKcal ?? null, d.estimateLowKcal ?? null, d.estimateHighKcal ?? null,
      String(d.modelVersion || MODEL_VERSION).slice(0, 20), true
    ]);
    res.status(201).json({ saved: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not save event' });
  }
});

app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'index.html')));

initDb().then(() => app.listen(port, () => console.log(`RepFuel ${MODEL_VERSION} running on ${port}`)))
  .catch(err => { console.error(err); process.exit(1); });
