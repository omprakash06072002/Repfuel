# RepFuel Gym Tracker — MVP v0.2.0

RepFuel is a browser-first workout logger with a research-anchored calorie-estimation model.

## Current scope
- Profile: age, sex, height, body weight
- Up to 3 body parts per workout
- Expanded Chest + Back + Shoulders + Biceps + Triceps + Core exercise libraries
- Set start/finish timestamps
- Per-set reps
- Exercise volume
- Active lifting time and rest time
- Net calorie estimate with uncertainty range
- Anonymous opt-in event collection
- Model versioning

## Model v0.2.0
The model uses:
1. Published resistance-training MET anchors.
2. Exercise-family base intensity.
3. Relative-load signal where a usable external load is available.
4. Rep and set-duration modifiers.
5. Automatic active/rest timing.
6. Separate gross and net expenditure calculations.
7. An uncertainty range; this is deliberately not presented as an exact measured calorie count.

Important: MET values are population-level activity anchors, not precise individual measurements. The model is provisional and intended to be calibrated against validated metabolic measurements in future research.

## Data collection
The app only posts workout events when the user explicitly checks the anonymous-data consent box. No name/email is collected by this MVP.

Set `DATABASE_URL` to a PostgreSQL connection string to enable collection.

## Run locally
```bash
npm install
npm start
```

Then open http://localhost:3000

## Deployment
This is suitable for a Node.js host such as Render, Railway, Fly.io, or another service that supports Node + PostgreSQL. Configure `DATABASE_URL` and optionally `ALLOWED_ORIGIN`.

## Important next step
Shoulders v0.6.0 includes the complete 28-exercise list supplied by the user. Shoulder press and lateral-raise/rear-delt work are kept as separate exercise families because research shows meaningful differences in deltoid activation between shoulder press and lateral raise, while activation is not treated as a direct calorie multiplier. A controlled study also compared standing/seated and barbell/dumbbell shoulder presses and found that the more stability-demanding standing dumbbell condition produced higher deltoid activation, but lower 1RM strength. These findings support stability and equipment as model features rather than arbitrary calorie percentages.

Triceps v0.5.0 includes the complete 20-exercise list supplied by the user. Direct metabolic research has measured triceps extension at multiple relative intensities. In an 80% 1RM exhaustive protocol, triceps extension averaged about 10.86 kcal/min; energy cost rose with relative intensity. Another metabolic study included triceps pushdown at 60–70% predicted 1RM for 8–12 reps. These protocol-specific values are calibration anchors, not fixed calories per set.

Biceps v0.4.0 includes the complete Biceps exercise list supplied by the user. The Biceps family model is anchored by direct metabolic research on biceps curl. The study found the lowest energy cost among the eight isolated resistance exercises tested, while energy cost still rose with relative intensity. At 12%, 16%, 20% and 24% 1RM, biceps curl averaged about 2.68, 3.15, 3.42 and 3.87 kcal/min respectively; the 80% 1RM exhaustive bout averaged about 8.53 kcal/min. These are protocol-specific laboratory values, so RepFuel uses them as calibration anchors rather than fixed per-set calories. 

Legs v0.3.0 includes the full exercise list supplied for quadriceps/legs, hamstrings/glutes and calves. The final numerical coefficients remain provisional and are family-level anchors, not exercise-specific measured MET values.

Research anchors used for the leg model:
- A 2019 metabolic-cart study included leg press, leg curl and leg extension and modeled resistance-training energy expenditure using body characteristics and total training volume.
- A deadlift study found a strong relationship between estimated mechanical work and oxygen cost (R=0.912).
- A 2024 study directly measured energy cost across bodyweight squat, single-leg squat and forward lunge and found movement pattern and duration materially affected energy cost.
- Recent squat research shows oxygen demand can become very high during repeated squat sets, reinforcing the need to keep work duration, rest, intensity and exercise family in the model.

The leg coefficients in this MVP should be treated as calibration starting points until validated against measured metabolic data.


## Shoulder calibration notes
- Shoulder press is a compound upper-body family with a provisional higher MET anchor than delt isolation.
- Lateral raise, rear-delt fly, face pull and front raise are isolation families.
- Standing/dumbbell vs seated/barbell differences are represented as exercise-family metadata; EMG differences are not converted directly into kcal.
- The model continues to use actual set duration and rest duration as primary timing inputs.


## Cardio v0.7.0
Added 21 cardio-machine activities:
- Treadmill: walking, incline walking, brisk walking, jogging, running, incline running, sprinting
- Cycling: stationary, spin, recumbent, air/assault bike
- Other: elliptical/cross trainer, stair climber/StairMaster, rowing machine, SkiErg, VersaClimber

Cardio uses duration as the primary input and can optionally use speed, treadmill incline, or machine watts. 2024 Adult Compendium anchors include walking 2.0–2.4 mph at 2.8 MET, 3.5–3.9 mph brisk walking at 4.8 MET, running 5.0–5.2 mph at 8.5 MET, stationary cycling values from 3.5 MET at 25–30 W through 12.5 MET at 230–250 W, elliptical 5.0/9.0 MET moderate/vigorous, stair treadmill 9.3 MET, and rowing 5.0–14.0 MET depending on watts. SkiErg uses 10.5/18.0 MET anchors from the Compendium; VersaClimber has no dedicated entry and therefore uses a clearly marked provisional stair-treadmill proxy.


## Curated exercise library — v0.8.0
The exercise picker has intentionally been reduced to the user's curated list of common gym movements. The goal is a clean, non-overcrowded interface while retaining broad movement coverage.

Counts:
- Chest: 10
- Back: 10
- Legs: 12
- Biceps: 8
- Triceps: 8
- Shoulders: 10
- Abs / Core: 10
- Cardio: 10
- Total: 78 exercises

The original larger exercise research library is no longer exposed in the UI.


# RepFuel Model 1.0

Model 1.0 freezes the curated 78-exercise library and changes the estimator architecture.

## Resistance training
The primary estimate uses actual active set time + rest time, body weight and exercise-family intensity anchors, with load/reps used as bounded modifiers.

A published regression is also calculated when optional body-fat percentage is supplied:
Net kcal = 0.874*height(cm) - 0.596*age - 1.016*fat mass(kg) + 1.638*lean mass(kg) + 2.461*(total volume kg * 10^-3) - 110.742.

This equation was developed by Lytle et al. (2019) for a specific 7-exercise resistance-training bout (leg press, chest press, leg curl, lat pull, leg extension, triceps pushdown, biceps curl), 2–3 sets, 8–12 reps, 60–70% 1RM, with 2-minute turnover. It is therefore used as a validation/sanity anchor, not blindly applied to every exercise.

## Cardio
Cardio remains duration-first, using published MET anchors and optional speed, incline and watts. The 2024 Adult Compendium is the primary activity anchor.

## Uncertainty
Resistance estimates show a wider uncertainty range than cardio because resistance exercise has substantial anaerobic contribution and indirect calorimetry has limitations. Model 1.0 is not a medical or laboratory measurement.

## Data collection
The user can optionally provide body-fat percentage. It is stored only when anonymous data consent is enabled for server upload; locally it remains in the user's browser profile.


## v1.1 Product layer
RepFuel v1.1 introduces a cleaner onboarding flow, multi-exercise workouts, explicit workout completion, device-local history, aggregate progress stats, profile editing, and stable workout IDs for future cloud synchronization. The exercise library remains intentionally curated at 78 movements.


## v1.1.1 — Variable load per set
Each resistance-training set now stores its own load. Users can increase or decrease the weight between sets (for example 60 → 70 → 80 kg) while keeping reps and timing separate for every set. The last load remains as the next-set default for convenience.


## v1.1.2 — Bug fix and timing polish
Fixed a JavaScript initialization error caused by a missing `strengthControls` element. The error prevented later click handlers from attaching, which made Start/Finish/Add Set and other buttons appear non-functional. v1.1.2 also records and displays each set's exact start and end timestamps and improves button states so an exercise can only be saved after a completed set.


## v1.2.0 — Product UX
- Dark RepFuel visual identity using the requested green/lime palette.
- Training level collected as Beginner / Intermediate / Pro.
- Visual exercise picker with recognizable movement cards.
- External load explicitly accepts 0 kg.
- Training level is collected as a dataset feature and does not artificially change calories until validated.


## v1.2.1 — Exercise picker fix
Fixed category initialization and exercise selection. Body-part buttons now render reliably, selecting up to three categories populates the exercise dropdown, and each exercise appears as a clickable visual card. Exercise cards now use inline SVG movement illustrations instead of placeholder emoji.


## v1.2.2 — Category initialization hardening
- Added a static fallback for all workout categories.
- Added DOM-ready bootstrap so categories render even with cached/local profile state.
- Exercise gallery and dropdown now initialize safely after categories.
- Prevented empty category/exercise state from blocking the workout UI.


## v1.3.0 — Premium workout dashboard
- Reworked workout screen to match the approved premium dark/lime design direction.
- Added top navigation, live workout stats, two-column desktop layout and workout sidebar.
- Added professional start/finish vector exercise demonstrations for all 78 exercises.
- Added exercise detail panel with muscles, equipment and training tip.
- Added load stepper with 0 kg support.
- Preserved per-set load, reps, timing, volume and calorie estimation logic.


## v1.4.0 — Approved visual direction
The workout screen follows the approved RepFuel reference: compact dark navigation, neon-lime active state, horizontal category filters, five-column exercise grid on desktop, search/list controls, and a sticky right-hand exercise detail panel.
