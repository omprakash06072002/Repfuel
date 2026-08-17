const EXERCISES = {
  Chest:[['Barbell Bench Press','barbell','heavy_compound'],['Incline Barbell Bench Press','barbell','heavy_compound'],['Dumbbell Bench Press','dumbbell','db_compound'],['Incline Dumbbell Press','dumbbell','db_compound'],['Chest Press Machine','machine','machine_compound'],['Pec Deck / Machine Fly','machine','isolation'],['Cable Chest Fly','cable','isolation'],['Dumbbell Fly','dumbbell','isolation'],['Decline Bench Press','barbell','heavy_compound'],['Push-Ups','bodyweight','bodyweight']],
  Back:[['Lat Pulldown','machine','pull_compound'],['Pull-Ups','bodyweight','pullup'],['Barbell Row','barbell','row_free'],['Seated Cable Row','cable','row_cable'],['T-Bar Row','barbell','row_free'],['Single-Arm Dumbbell Row','dumbbell','unilateral_row'],['Chest-Supported Row','machine','row_supported'],['Straight-Arm Pulldown','cable','pullover'],['Machine Row','machine','row_machine'],['Dumbbell Pullover','dumbbell','pullover_db']],
  Legs:[['Barbell Squat','barbell','squat'],['Front Squat','barbell','squat'],['Leg Press','machine','leg_press'],['Hack Squat','machine','squat_machine'],['Leg Extension','machine','leg_isolation'],['Leg Curl','machine','leg_isolation'],['Romanian Deadlift','barbell','hinge'],['Stiff-Leg Deadlift','barbell','hinge'],['Walking Lunges','bodyweight','lunge'],['Bulgarian Split Squat','dumbbell','unilateral_leg'],['Hip Thrust','bodyweight','hip_thrust'],['Calf Raise','machine','calf']],
  Biceps:[['Barbell Curl','barbell','biceps_isolation'],['Dumbbell Curl','dumbbell','biceps_isolation'],['Hammer Curl','dumbbell','biceps_isolation'],['Incline Dumbbell Curl','dumbbell','biceps_isolation'],['Preacher Curl','machine','biceps_isolation'],['Concentration Curl','dumbbell','biceps_unilateral'],['Cable Curl','cable','biceps_cable'],['EZ-Bar Curl','barbell','biceps_isolation']],
  Triceps:[['Triceps Pushdown','cable','triceps_cable'],['Rope Pushdown','cable','triceps_cable'],['Overhead Triceps Extension','cable','triceps_isolation'],['Skull Crushers','barbell','triceps_isolation'],['Close-Grip Bench Press','barbell','heavy_compound'],['Dumbbell Triceps Extension','dumbbell','triceps_isolation'],['Cable Triceps Extension','cable','triceps_cable'],['Dips','bodyweight','bodyweight_compound']],
  Shoulders:[['Barbell Overhead Press','barbell','shoulder_press'],['Dumbbell Shoulder Press','dumbbell','shoulder_press_db'],['Arnold Press','dumbbell','shoulder_press_db'],['Machine Shoulder Press','machine','shoulder_press_machine'],['Dumbbell Lateral Raise','dumbbell','lateral_raise'],['Cable Lateral Raise','cable','lateral_raise'],['Front Dumbbell Raise','dumbbell','front_raise'],['Rear Delt Fly','dumbbell','rear_delt_isolation'],['Reverse Pec Deck','machine','rear_delt_isolation'],['Face Pull','cable','rear_delt_cable']],
  'Abs / Core':[['Crunches','bodyweight','core'],['Cable Crunch','cable','core'],['Hanging Leg Raise','bodyweight','core_high'],['Hanging Knee Raise','bodyweight','core'],['Leg Raise','bodyweight','core_high'],['Russian Twist','bodyweight','core'],['Plank','bodyweight','core'],['Side Plank','bodyweight','core'],['Ab Wheel Rollout','bodyweight','core_high'],['Mountain Climbers','bodyweight','bodyweight_high']],
  Cardio:[['Treadmill — Walking','treadmill','treadmill_walk'],['Treadmill — Running','treadmill','treadmill_run'],['Treadmill — Incline Walking','treadmill','treadmill_incline_walk'],['Stationary Bike','bike','bike_stationary'],['Spin Bike','bike','spin_bike'],['Elliptical / Cross Trainer','machine','elliptical'],['StairMaster','machine','stair_climber'],['Rowing Machine','machine','rower'],['Air Bike','bike','air_bike'],['SkiErg','machine','skierg']]
};

const MODEL_VERSION='1.5.0';
const REST_MET=1.5;
const BASE_MET={
 heavy_compound:5.5,db_compound:5.0,machine_compound:4.2,isolation:3.7,
 pull_compound:4.8,pullup:6.0,row_free:5.0,row_cable:4.0,unilateral_row:4.8,row_supported:4.2,row_machine:4.0,
 pullover:3.6,pullover_db:3.8,squat:5.2,squat_machine:4.8,leg_press:5.2,leg_isolation:3.8,hinge:5.0,
 lunge:4.8,unilateral_leg:5.0,hip_thrust:4.5,calf:3.2,
 biceps_isolation:3.5,biceps_unilateral:3.6,biceps_cable:3.5,
 triceps_cable:3.7,triceps_isolation:3.6,bodyweight_compound:5.0,shoulder_press:5.0,shoulder_press_db:5.0,shoulder_press_machine:4.2,
 lateral_raise:3.4,front_raise:3.3,rear_delt_isolation:3.4,rear_delt_cable:3.5,core:2.8,core_high:3.8,bodyweight_high:5.5,
 treadmill_walk:3.8,treadmill_run:8.5,treadmill_incline_walk:5.3,bike_stationary:6.8,spin_bike:9.0,elliptical:5.0,stair_climber:9.3,rower:7.3,air_bike:8.0,skierg:10.5
};

const $=id=>document.getElementById(id);
function changeLoad(delta){
  const el=$('load'); const v=Math.max(0,(Number(el.value)||0)+delta);
  el.value=Number(v.toFixed(1));
}
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const fmt=x=>Number(x||0).toFixed(1);
const isCardio=f=>f&&(['treadmill_walk','treadmill_run','treadmill_incline_walk','bike_stationary','spin_bike','elliptical','stair_climber','rower','air_bike','skierg'].includes(f));

const sessionId=localStorage.getItem('repfuel_session')||crypto.randomUUID();
localStorage.setItem('repfuel_session',sessionId);

let state={parts:[],exerciseOptions:[],exercise:null,sets:[],draft:null,workoutStart:null,setStart:null,timer:null,exercises:[],workoutId:crypto.randomUUID(),finished:false};
function getHistory(){
  return JSON.parse(localStorage.getItem('repfuel_history')||'[]');
}

function flattenCloudWorkouts(rows){
  return (rows||[]).flatMap(w=>{
    const exercises=Array.isArray(w.exercises)?w.exercises:[];
    return exercises.map(ex=>({
      ...ex,
      savedAt:w.ended_at||w.created_at,
      estimatedNetKcal:ex.result?.net||0,
      totalVolumeKg:ex.result?.volume||0,
      sets:ex.sets?.length||0,
      workoutId:w.id,
      userId:w.user_id
    }));
  });
}

async function fetchCloudHistory(){
  if(!window.repSupabase?.auth)return [];
  const {data:{user}}=await repSupabase.auth.getUser();
  if(!user)return [];
  const {data,error}=await repSupabase
    .from('repfuel_workouts')
    .select('id,user_id,started_at,ended_at,exercises,summary,created_at')
    .eq('user_id',user.id)
    .order('ended_at',{ascending:false})
    .limit(100);
  if(error){console.error('History fetch failed:',error);return [];}
  return data||[];
}

function formatDateTime(value){
  if(!value)return '—';
  return new Date(value).toLocaleString(undefined,{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'});
}
function formatDay(value){
  if(!value)return '—';
  return new Date(value).toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'});
}
function dashboardData(rows){
  const now=Date.now(), d7=now-7*86400000, d30=now-30*86400000;
  const workoutSummary=(rows||[]).map(w=>({
    ...w,
    date:new Date(w.ended_at||w.created_at||w.started_at).getTime(),
    volume:Number(w.summary?.volume||0),
    kcal:Number(w.summary?.netKcal||0),
    sets:Number(w.summary?.sets||0),
    active:Number(w.summary?.active||0)
  }));
  const exerciseMap={};
  workoutSummary.forEach(w=>{
    (Array.isArray(w.exercises)?w.exercises:[]).forEach(ex=>{
      const name=ex.name||'Unknown exercise';
      const stats=exerciseMap[name]??={name,sessions:0,sets:0,volume:0,bestLoad:0,bestReps:0,bestE1RM:0,lastLoad:0,lastReps:0,lastDate:0};
      stats.sessions+=1;
      const sets=Array.isArray(ex.sets)?ex.sets:[];
      stats.sets+=sets.length;
      sets.forEach(s=>{
        const load=Number(s.load||0), reps=Number(s.reps||0);
        stats.volume+=load*reps;
        stats.bestLoad=Math.max(stats.bestLoad,load);
        stats.bestReps=Math.max(stats.bestReps,reps);
        stats.bestE1RM=Math.max(stats.bestE1RM,load>0&&reps>0?load*(1+reps/30):0);
        if(w.date>=stats.lastDate){stats.lastLoad=load;stats.lastReps=reps;stats.lastDate=w.date;}
      });
    });
  });
  const exercises=Object.values(exerciseMap).sort((a,b)=>b.volume-a.volume);
  const days=new Set(workoutSummary.map(w=>new Date(w.date).toISOString().slice(0,10))).size;
  const totalVolume=workoutSummary.reduce((a,w)=>a+w.volume,0);
  const totalKcal=workoutSummary.reduce((a,w)=>a+w.kcal,0);
  const totalSets=workoutSummary.reduce((a,w)=>a+w.sets,0);
  const recent7=workoutSummary.filter(w=>w.date>=d7);
  const recent30=workoutSummary.filter(w=>w.date>=d30);
  return {workouts:workoutSummary,exercises,days,totalVolume,totalKcal,totalSets,recent7,recent30};
}
function progressDaySeries(rows){
  const today=new Date();
  today.setHours(0,0,0,0);
  const out=[];
  for(let i=6;i>=0;i--){
    const d=new Date(today);d.setDate(d.getDate()-i);
    const key=d.toISOString().slice(0,10);
    const items=(rows||[]).filter(w=>(w.ended_at||w.created_at||w.started_at||'').slice(0,10)===key);
    out.push({date:d,key,label:d.toLocaleDateString(undefined,{weekday:'short'}),volume:items.reduce((a,w)=>a+Number(w.summary?.volume||0),0),workouts:items.length});
  }
  return out;
}
function categorySplit(rows){
  const map={};
  (rows||[]).forEach(w=>(Array.isArray(w.exercises)?w.exercises:[]).forEach(ex=>{
    const part=ex.bodyPart||'Other';
    const vol=(Array.isArray(ex.sets)?ex.sets:[]).reduce((a,s)=>a+Number(s.load||0)*Number(s.reps||0),0);
    map[part]=(map[part]||0)+vol;
  }));
  return Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,4);
}
function renderProgressDashboard(rows){
  const d=dashboardData(rows||[]);
  const el=$('progressDashboard'); if(!el)return;
  const weekVol=d.recent7.reduce((a,w)=>a+w.volume,0);
  const monthVol=d.recent30.reduce((a,w)=>a+w.volume,0);
  const avgVol=d.workouts.length?d.totalVolume/d.workouts.length:0;
  const best=d.workouts.reduce((a,w)=>Math.max(a,w.volume),0);
  const recent=progressDaySeries(rows||[]);
  const maxBar=Math.max(...recent.map(x=>x.volume),1);
  const split=categorySplit(rows||[]);
  const totalSplit=split.reduce((a,x)=>a+x[1],0)||1;
  const top=d.exercises.slice(0,8);
  const pr=d.exercises.slice().sort((a,b)=>b.bestLoad-a.bestLoad||b.bestE1RM-a.bestE1RM).slice(0,8);
  const totalSets=d.totalSets;
  const totalKcal=Math.round(d.totalKcal);
  const bestExercise=pr[0];

  if(!d.workouts.length){
    el.innerHTML=`<div class="analytics-shell">
      <div class="analytics-hero"><div><p class="eyebrow">03 · PROGRESS</p><h2>Your training dashboard</h2><p class="muted">Your charts, volume trends and personal records will appear here after your first saved workout.</p></div><span class="sync-pill"><i class="sync-dot"></i> Cloud connected</span></div>
      <div class="empty-analytics"><div class="empty-icon">↗</div><h3>Your progress starts with your first workout</h3><p>Finish a workout and RepFuel will automatically calculate volume, training frequency, exercise progression and personal records.</p><br><button class="primary" type="button" onclick="showRepFuelSection('workout')">Start a workout →</button></div>
    </div>`;
    return;
  }

  const chartBars=recent.map(x=>`<div class="bar-col" title="${x.label}: ${Math.round(x.volume).toLocaleString()} kg"><span class="bar-value">${x.volume?Math.round(x.volume/1000*10)/10+'k':''}</span><div class="bar" style="height:${Math.max(3,(x.volume/maxBar)*145)}px"></div><span class="bar-label">${x.label}</span></div>`).join('');
  const colors=['#A3FF12','#71ad0c','#3f5d1c','#263229'];
  let cumulative=0;
  const stops=split.length?split.map((x,i)=>{const pct=x[1]/totalSplit*100;const s=`${colors[i]} ${cumulative.toFixed(1)}% ${(cumulative+pct).toFixed(1)}%`;cumulative+=pct;return s}).join(', '):'#263229 0 100%';
  const legend=split.length?split.map((x,i)=>`<div class="legend-row"><i class="legend-dot" style="background:${colors[i]}"></i><span>${x[0]}</span><strong>${Math.round(x[1]).toLocaleString()} kg</strong></div>`).join(''):'<div class="muted">No exercise volume yet.</div>';

  el.innerHTML=`
  <div class="analytics-shell">
    <div class="analytics-hero">
      <div><p class="eyebrow">03 · PROGRESS</p><h2>Your training dashboard</h2><p class="muted">A live view of your RepFuel training history.</p></div>
      <span class="sync-pill"><i class="sync-dot"></i> Cloud synced</span>
    </div>

    <div class="metric-grid">
      <div class="metric-card"><span class="metric-label">Workouts</span><div class="metric-value accent">${d.workouts.length}</div><span class="metric-meta">${d.days} training day${d.days===1?'':'s'}</span></div>
      <div class="metric-card"><span class="metric-label">Total volume</span><div class="metric-value">${Math.round(d.totalVolume).toLocaleString()} kg</div><span class="metric-meta">${Math.round(avgVol).toLocaleString()} kg average / workout</span></div>
      <div class="metric-card"><span class="metric-label">Total sets</span><div class="metric-value">${totalSets}</div><span class="metric-meta">${totalKcal.toLocaleString()} estimated kcal</span></div>
      <div class="metric-card"><span class="metric-label">Best workout</span><div class="metric-value">${Math.round(best).toLocaleString()} kg</div><span class="metric-meta">${bestExercise?`Top lift: ${bestExercise.name}`:'Keep training'}</span></div>
    </div>

    <div class="analytics-two">
      <div class="analytics-panel">
        <div class="panel-heading"><div><h3>7-day training volume</h3><p>Daily logged resistance volume</p></div><strong class="pr-badge">${Math.round(weekVol).toLocaleString()} kg</strong></div>
        <div class="chart-wrap"><div class="chart-y"><span>${Math.round(maxBar).toLocaleString()}</span><span>${Math.round(maxBar*.5).toLocaleString()}</span><span>0</span></div><div class="bar-chart">${chartBars}</div></div>
      </div>
      <div class="analytics-panel">
        <div class="panel-heading"><div><h3>Training split</h3><p>All-time volume by body part</p></div></div>
        <div class="donut-wrap"><div class="donut" style="background:conic-gradient(${stops})"><div class="donut-center"><strong>${Math.round(monthVol/1000*10)/10}k</strong><span>kg / 30 days</span></div></div><div class="legend">${legend}</div></div>
      </div>
    </div>

    <div class="analytics-panel">
      <div class="panel-heading"><div><p class="eyebrow">EXERCISE PROGRESSION</p><h3>Highest training volume</h3><p>Exercises ranked by total logged volume.</p></div><span class="history-count">${d.exercises.length} exercises</span></div>
      ${top.length?`<div class="progress-table"><div class="progress-row progress-header"><span>Exercise</span><span>Sessions</span><span>Sets</span><span>Volume</span><span>Best load</span></div>${top.map(x=>`<div class="progress-row"><strong>${x.name}</strong><span>${x.sessions}</span><span>${x.sets}</span><span>${Math.round(x.volume).toLocaleString()} kg</span><span>${x.bestLoad?fmt(x.bestLoad)+' kg':'Bodyweight'}</span></div>`).join('')}</div>`:'<div class="empty-analytics"><h3>No exercise data yet</h3></div>'}
    </div>

    <div class="analytics-panel">
      <div class="panel-heading"><div><p class="eyebrow">PERSONAL RECORDS</p><h3>Best recorded sets</h3><p>Highest load and estimated 1RM from your logged sets.</p></div></div>
      ${pr.length?`<div class="progress-table"><div class="progress-row progress-header"><span>Exercise</span><span>Best load</span><span>Best reps</span><span>Est. 1RM</span><span>Last set</span></div>${pr.map(x=>`<div class="progress-row"><strong>${x.name}</strong><span>${x.bestLoad?fmt(x.bestLoad)+' kg':'Bodyweight'}</span><span>${x.bestReps||0}</span><span>${x.bestE1RM?fmt(x.bestE1RM)+' kg':'—'}</span><span>${x.lastLoad?fmt(x.lastLoad)+' kg × '+x.lastReps:'Bodyweight × '+(x.lastReps||0)}</span></div>`).join('')}</div>`:'<div class="empty-analytics"><h3>Your PRs will appear here</h3></div>'}
    </div>
  </div>`;
}
async function renderHistory(){
  const rows=await fetchCloudHistory();
  const h=flattenCloudWorkouts(rows);
  const sessions={};
  h.forEach(x=>{const key=x.savedAt?.slice(0,10)||'unknown';(sessions[key]??=[]).push(x)});
  const days=Object.entries(sessions).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,30);
  const list=$('historyList');
  if(list) list.innerHTML=`
    <div class="history-toolbar"><div><strong>Recent workouts</strong><span class="history-count"> · ${days.length} training day${days.length===1?'':'s'}</span></div><button class="ghost" type="button" onclick="renderHistory()">↻ Refresh</button></div>
    ${days.length?days.map(([day,items])=>{
      const kcal=items.reduce((a,x)=>a+(x.estimatedNetKcal||0),0);
      const volume=items.reduce((a,x)=>a+(x.totalVolumeKg||0),0);
      const sets=items.reduce((a,x)=>a+(x.sets||0),0);
      const ex=[...new Set(items.map(x=>x.exercise))];
      return `<div class="history-day"><div class="history-title"><div class="history-icon">↗</div><div><strong>${formatDay(day+'T12:00:00')}</strong><span>${ex.slice(0,3).join(' · ')}${ex.length>3?' · +'+(ex.length-3)+' more':''}</span></div></div><div class="history-metrics"><span><b>${Math.round(volume).toLocaleString()}</b> kg</span><span><b>${sets}</b> sets</span><span><b>${Math.round(kcal)}</b> kcal</span></div></div>`
    }).join(''):'<div class="empty-analytics"><div class="empty-icon">◷</div><h3>No cloud workouts yet</h3><p>Finish and save your first workout. It will appear here automatically.</p></div>'}`;

  const totalKcal=h.reduce((a,x)=>a+(x.estimatedNetKcal||0),0);
  const totalVolume=h.reduce((a,x)=>a+(x.totalVolumeKg||0),0);
  if($('historyKcal')) $('historyKcal').textContent=Math.round(totalKcal).toLocaleString();
  if($('historyVolume')) $('historyVolume').textContent=Math.round(totalVolume).toLocaleString()+' kg';
  if($('historyDays')) $('historyDays').textContent=new Set(h.map(x=>x.savedAt?.slice(0,10)).filter(Boolean)).size;
  if($('historySets')) $('historySets').textContent=h.reduce((a,x)=>a+(x.sets||0),0);
  if($('progressWorkouts')) $('progressWorkouts').textContent=rows.length;
  if($('progressVolume')) $('progressVolume').textContent=Math.round(totalVolume).toLocaleString()+' kg';
  const bestVolume=rows.reduce((best,w)=>Math.max(best,Number(w.summary?.volume||0)),0);
  if($('progressBest')) $('progressBest').textContent=Math.round(bestVolume).toLocaleString()+' kg';
}

const EXERCISE_IMAGE_MAP = {"barbell_bench_press":"assets/exercises/barbell_press.png","incline_barbell_bench_press":"assets/exercises/inclined_barwell_bench_press.png","dumbbell_bench_press":"assets/exercises/dumbel_bench_press.png","incline_dumbbell_press":"assets/exercises/inclined_dumbel_press.png","pec_deck_machine_fly":"assets/exercises/pecdeck_fly.png","cable_chest_fly":"assets/exercises/cabel_chest_fly.png","lat_pulldown":"assets/exercises/latt_pull_down.png","barbell_row":"assets/exercises/barbell_row.png","seated_cable_row":"assets/exercises/seated_cabel_row.png","t_bar_row":"assets/exercises/t_bar.png","straight_arm_pulldown":"assets/exercises/straight_arm_pulldown.png","dumbbell_pullover":"assets/exercises/dumbel_pullover.png","barbell_squat":"assets/exercises/barbell_squat.png","leg_press":"assets/exercises/leg_press.png","leg_extension":"assets/exercises/leg_extention.png","leg_curl":"assets/exercises/leg_curl.png","hip_thrust":"assets/exercises/hip_thrust.png","calf_raise":"assets/exercises/calf_raises.png","barbell_curl":"assets/exercises/barbell_curl.png","hammer_curl":"assets/exercises/hammer_curl.png","preacher_curl":"assets/exercises/preacher_curl.png","triceps_pushdown":"assets/exercises/tricep_pushdown.png","overhead_triceps_extension":"assets/exercises/overhead_tricep_extention.png","skull_crushers":"assets/exercises/skull_crusher.png","dumbbell_shoulder_press":"assets/exercises/dumbell_shoulder_press.png","dumbbell_lateral_raise":"assets/exercises/dumbell_lateral_raise.png","front_dumbbell_raise":"assets/exercises/front_dumbel_raise.png","reverse_pec_deck":"assets/exercises/reverse_pec_deck.png","face_pull":"assets/exercises/face_pull.png"};
function findExerciseImage(e){const key=(e.name||'').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');return EXERCISE_IMAGE_MAP[key]||null;}
function exerciseVisual(e){
  const image=findExerciseImage(e);
  if(image){
    return `<div class="exercise-art real-art">
      <img src="${image}" alt="${e.name} exercise demonstration" loading="lazy">
      <div class="real-art-badge">REP FUEL · DEMO</div>
    </div>`;
  }
  return `<div class="exercise-art fallback-art" aria-label="${e.name} visual placeholder">
    <div><strong>${e.name}</strong><span>Visual guide not supplied yet</span></div>
  </div>`;
}
const CATEGORY_NAMES=['Chest','Back','Legs','Biceps','Triceps','Shoulders','Abs / Core','Cardio'];
function renderParts(){
  const el=$('bodyParts');
  if(!el) return;
  state.parts=CATEGORY_NAMES.slice();
  state.selectedParts=Array.isArray(state.selectedParts)?state.selectedParts:[];
  el.innerHTML=CATEGORY_NAMES.map(p=>`<button type="button" class="chip ${state.selectedParts.includes(p)?'active':''}" data-part="${p}">${p}</button>`).join('');
  el.style.display='flex';
  el.style.flexWrap='wrap';
  el.style.gap='8px';
  el.querySelectorAll('.chip').forEach(b=>b.onclick=()=>selectPart(b.dataset.part));
}
function selectPart(part){
  state.selectedParts=state.selectedParts||[];
  if(state.selectedParts.includes(part)) state.selectedParts=state.selectedParts.filter(x=>x!==part);
  else if(state.selectedParts.length<3) state.selectedParts.push(part);
  else {alert('You can select up to 3 muscle groups for one workout.');return}
  renderParts();
  renderExercises();
}
function exerciseMuscles(e){
  const p=e.bodyPart||'';
  const f=e.family||'';
  const map={
    Chest:['Chest','Triceps','Front Delts'],Back:['Lats','Upper Back','Biceps'],Legs:['Quads','Glutes','Hamstrings'],
    Biceps:['Biceps','Brachialis','Forearms'],Triceps:['Triceps','Chest','Shoulders'],Shoulders:['Deltoids','Traps','Upper Chest'],
    'Abs / Core':['Abs','Obliques','Hip Flexors'],Cardio:['Cardiovascular','Legs','Full Body']
  };
  return map[p]||[p];
}
function updateExerciseDetails(){
  const e=state.exercise;
  const box=$('exerciseDetails');
  if(!box)return;
  if(!e){box.innerHTML='<div class="detail-empty">Select an exercise to see muscles, equipment and guidance.</div>';return}
  const muscles=exerciseMuscles(e);
  box.innerHTML=`<div class="detail-title"><div><p class="eyebrow">${e.bodyPart||'Exercise'}</p><h3>${e.name}</h3></div><span class="detail-tag">${e.equipment||'Bodyweight'}</span></div>
    <div class="detail-visual">${exerciseVisual(e)}</div>
    <div class="detail-block"><strong>Primary / secondary muscles</strong><div class="muscle-tags">${muscles.map((m,i)=>`<span class="${i===0?'primary-muscle':''}">${m}</span>`).join('')}</div></div>
    <div class="detail-block"><strong>Equipment</strong><p class="muted">${e.equipment||'Bodyweight'} · ${e.family.replaceAll('_',' ')}</p></div>
    <div class="tip-box"><strong>Tip</strong><p>Use controlled movement and a comfortable range of motion. Record the load actually used for this set.</p></div>`;
}
function renderExercises(){
  const gallery=$('exerciseGallery');
  const select=$('exerciseSelect');
  if(!gallery||!select) return;
  state.selectedParts=Array.isArray(state.selectedParts)?state.selectedParts:[];
  state.exerciseOptions=state.selectedParts.filter(p=>EXERCISES[p]).flatMap(p=>(EXERCISES[p]||[]).map(e=>({bodyPart:p,name:e[0],equipment:e[1],family:e[2]})));
  $('exerciseSelect').innerHTML=state.exerciseOptions.length
    ? state.exerciseOptions.map((e,i)=>`<option value="${i}">${e.bodyPart} · ${e.name}</option>`).join('')
    : '<option value="">Choose a category first</option>';

  $('exerciseGallery').innerHTML=state.exerciseOptions.length
    ? state.exerciseOptions.map((e,i)=>`<button type="button" class="exercise-card" data-index="${i}">
        ${exerciseVisual(e)}<strong>${e.name}</strong><span>${e.equipment||''} · ${e.family||''}</span>
      </button>`).join('')
    : '<div class="empty-gallery">Select Chest, Back, Legs, Biceps, Triceps, Shoulders, Abs / Core or Cardio above to see exercises.</div>';

  document.querySelectorAll('.exercise-card').forEach(card=>card.onclick=()=>{
    $('exerciseSelect').value=card.dataset.index;
    selectExercise();
    document.querySelectorAll('.exercise-card').forEach(c=>c.classList.remove('active'));
    card.classList.add('active');
  });
  if(state.exerciseOptions.length) selectExercise(); else updateExerciseDetails();
}
function selectExercise(){
  const e=state.exerciseOptions?.[Number($('exerciseSelect').value)]||null;
  state.exercise=e;state.sets=[];state.draft=null;updateExerciseDetails();
  $('currentExercise').textContent=e?e.name:'Select an exercise';
  $('exerciseMeta').textContent=e?`Family: ${e.family.replaceAll('_',' ')} · ${e.equipment}`:'';
  const cardio=isCardio(e?.family);
  $('cardioControls').classList.toggle('hidden',!cardio);
  $('startSet').disabled=!e;$('finishSet').disabled=true;$('addSet').disabled=true;$('finishExercise').disabled=true;$('setsTable').innerHTML='';
  $('timer').textContent='00:00';
  document.querySelectorAll('.exercise-card').forEach(c=>c.classList.toggle('active',Number(c.dataset.index)===Number($('exerciseSelect').value)));
}
function tick(){if(!state.setStart)return;$('timer').textContent=new Date((Date.now()-state.setStart)).toISOString().substring(14,19)}
function startSet(){state.setStart=Date.now();$('startSet').disabled=true;$('finishSet').disabled=false;$('addSet').disabled=true;state.timer=setInterval(tick,250)}
function finishSet(){
  if(!state.setStart)return;
  const end=Date.now(),active=(end-state.setStart)/1000,rest=state.sets.length?(state.setStart-state.sets.at(-1).end)/1000:0;
  clearInterval(state.timer);state.setStart=null;
  const startMs=end-active*1000;
  state.draft={start:startMs,end,active,rest};
  $('finishSet').disabled=true;$('startSet').disabled=false;$('addSet').disabled=false;$('timer').textContent='00:00';
}
function addSet(){
  if(!state.draft)return;
  const cardio=isCardio(state.exercise.family);
  const reps=cardio?1:Number($('reps').value);
  if(!cardio&&!reps)return;
  // IMPORTANT: load is captured independently for THIS set.
  // The user can change the load before every subsequent set.
  const load=cardio?0:Number($('load').value===''?0:$('load').value);
  state.sets.push({...state.draft,reps,load});
  state.draft=null;
  $('reps').value='';
  $('finishExercise').disabled=false;
  $('addSet').disabled=true;
  // Keep the last load in the input as a convenient default for the next set.
  // The user is free to increase/decrease it before starting the next set.
  renderSets();
}
function renderSets(){
  $('setsTable').innerHTML=state.sets.map((s,i)=>{
    const loadText=isCardio(state.exercise.family)?'—':`${fmt(s.load)} kg`;
    const repsText=isCardio(state.exercise.family)?`${fmt(s.active/60)} min`:`${s.reps} reps`;
    const timeText=`${new Date(s.start).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'})} → ${new Date(s.end).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'})}`;
    return `<div class="set-item">
      <span><strong>Set ${i+1}</strong><small>${loadText}</small></span>
      <span>${repsText}</span>
      <span>${fmt(s.active)}s work<small>${timeText}</small></span>
      <span>${fmt(s.rest)}s rest</span>
    </div>`;
  }).join('');
}
function epley(load,reps){return load>0&&reps>0?load*(1+reps/30):0}
function profile(){
  return {age:+$('age').value||0,sex:$('sex').value,height:+$('height').value||0,weight:+$('bodyWeight').value||0,bodyFat:$('bodyFat').value===''?null:+$('bodyFat').value,consent:$('consent').checked,level:localStorage.getItem('repfuel_level')||$('level')?.value||'beginner'};
}
function resistanceMET(e,sets){
  let total=0;
  sets.forEach(s=>{
    let effort=1;
    if(s.load>0 && s.reps>0){
      const one=epley(s.load,s.reps);
      const ri=one?clamp(s.load/one,0.4,0.98):0.6;
      effort*=clamp(0.96+(ri-0.60)*0.45,0.86,1.12);
    }
    const duration=clamp(0.94+(s.active/30)*0.10,0.92,1.08);
    const reps=clamp(0.95+(s.reps-6)*0.008,0.92,1.06);
    total+=effort*duration*reps;
  });
  return clamp((BASE_MET[e.family]||3.5)*(sets.length?total/sets.length:1),2.4,7.5);
}
function cardioMET(e){
  const speed=+$('cardioSpeed').value||0,inc=+$('cardioIncline').value||0,watts=+$('cardioWatts').value||0;
  if(e.family==='treadmill_walk'){
    if(speed<2.5)return 3.0;if(speed<3.0)return 3.5;if(speed<3.5)return 3.8;if(speed<4.0)return 4.8;if(speed<4.5)return 5.8;return 6.8;
  }
  if(e.family==='treadmill_incline_walk') return clamp(3.8+inc*0.35+(speed>3?1.0:0),3.8,10);
  if(e.family==='treadmill_run'){
    let m=speed<4.3?6.5:speed<4.9?7.8:speed<5.3?8.5:speed<5.9?9.0:speed<6.4?9.3:speed<7?10.5:speed<7.6?11:speed<8.1?11.8:speed<8.7?12:speed<9.1?13:14.8;
    if(inc)m+=Math.min(4,inc*.25);return clamp(m,6,18);
  }
  if(['bike_stationary','spin_bike','air_bike'].includes(e.family)){
    if(!watts)return BASE_MET[e.family];
    return watts<50?4:watts<70?5:watts<100?6:watts<125?6.8:watts<150?8:watts<200?10.3:watts<230?10.8:12.5;
  }
  if(e.family==='rower')return watts?watts<100?5:watts<150?7.5:watts<200?11:14:7.3;
  if(e.family==='elliptical')return $('cardioIntensity').value==='vigorous'?9:5;
  if(e.family==='stair_climber')return 9.3;
  if(e.family==='skierg')return $('cardioIntensity').value==='vigorous'?18:10.5;
  return BASE_MET[e.family]||5;
}
function publishedResistanceAnchor(p,setData){
  // Lytle et al. 2019: net kcal = .874*height - .596*age -1.016*fatMass
  // +1.638*leanMass + 2.461*(totalVolume*1e-3) -110.742.
  // This anchor was developed for a 7-exercise bout at 60-70% 1RM with 2-3 sets
  // and should be used as a validation/sanity reference, not a universal per-set formula.
  if(p.bodyFat==null||!p.height||!p.age||!p.weight)return null;
  const fat=p.weight*p.bodyFat/100,lean=p.weight-fat;
  const volume=setData.reduce((a,s)=>a+s.load*s.reps,0);
  return .874*p.height-.596*p.age-1.016*fat+1.638*lean+2.461*(volume*1e-3)-110.742;
}
function estimate(e,sets){
  const p=profile(),bw=p.weight||70;
  const active=sets.reduce((a,s)=>a+s.active,0),rest=sets.reduce((a,s)=>a+s.rest,0);
  const met=isCardio(e.family)?cardioMET(e):resistanceMET(e,sets);
  const gross=met*3.5*bw*(active/60)/200 + REST_MET*3.5*bw*(rest/60)/200;
  const baseline=3.5*bw*((active+rest)/60)/200;
  const net=Math.max(0,gross-baseline);
  const anchor=isCardio(e.family)?null:publishedResistanceAnchor(p,sets);
  const uncertainty=isCardio(e.family)?Math.max(5,net*.10+3):Math.max(7,net*.20+4);
  return {net,gross,low:Math.max(0,net-uncertainty),high:net+uncertainty,active,rest,volume:sets.reduce((a,s)=>a+s.load*s.reps,0),met,anchor,modelVersion:MODEL_VERSION};
}
async function saveWorkoutToCloud(){
  if(!window.repSupabase?.auth)return {ok:false,error:'Supabase client not configured'};
  const {data:{user}}=await repSupabase.auth.getUser();
  if(!user)return {ok:false,error:'No authenticated user'};
  const p=profile();
  const payload={
    id:state.workoutId,user_id:user.id,
    started_at:new Date(state.workoutStart||Date.now()).toISOString(),
    ended_at:new Date().toISOString(),
    profile:{age:p.age,sex:p.sex,height_cm:p.height,weight_kg:p.weight,body_fat_percent:p.bodyFat,training_level:p.level,consent:p.consent},
    exercises:state.exercises.map(x=>({bodyPart:x.exercise.bodyPart,name:x.exercise.name,equipment:x.exercise.equipment,family:x.exercise.family,sets:x.sets,result:x.result})),
    summary:{
      volume:state.exercises.reduce((a,x)=>a+x.result.volume,0),
      active:state.exercises.reduce((a,x)=>a+x.result.active,0),
      rest:state.exercises.reduce((a,x)=>a+x.result.rest,0),
      netKcal:state.exercises.reduce((a,x)=>a+x.result.net,0),
      low:state.exercises.reduce((a,x)=>a+x.result.low,0),
      high:state.exercises.reduce((a,x)=>a+x.result.high,0),
      sets:state.exercises.reduce((a,x)=>a+x.sets.length,0),
      modelVersion:MODEL_VERSION
    }
  };
  const {error}=await repSupabase.from('repfuel_workouts').upsert(payload,{onConflict:'id'});
  if(error){console.error('Cloud workout save failed:',error);return {ok:false,error:error.message};}
  return {ok:true};
}

async function saveProfileToCloud(p){
  if(!window.repSupabase?.auth)return {ok:false,error:'Supabase client not configured'};
  const {data:{user}}=await repSupabase.auth.getUser();
  if(!user)return {ok:false,error:'No authenticated user'};
  const row={user_id:user.id,age:p.age,sex:p.sex,height_cm:p.height,weight_kg:p.weight,body_fat_percent:p.bodyFat,training_level:p.level,consent:p.consent,updated_at:new Date().toISOString()};
  const {error}=await repSupabase.from('repfuel_profiles').upsert(row,{onConflict:'user_id'});
  if(error){console.error('Cloud profile save failed:',error);return {ok:false,error:error.message};}
  return {ok:true};
}

async function loadProfileFromCloud(){
  if(!window.repSupabase?.auth)return null;
  const {data:{user}}=await repSupabase.auth.getUser();
  if(!user)return null;
  const {data,error}=await repSupabase.from('repfuel_profiles').select('*').eq('user_id',user.id).maybeSingle();
  if(error){console.error('Cloud profile fetch failed:',error);return null;}
  if(!data)return null;
  const p={age:data.age||0,sex:data.sex||'male',height:data.height_cm||0,weight:data.weight_kg||0,bodyFat:data.body_fat_percent??null,consent:!!data.consent,level:data.training_level||'beginner'};
  localStorage.setItem('repfuel_profile',JSON.stringify(p));
  localStorage.setItem('repfuel_level',p.level);
  return p;
}

async function deleteCloudHistory(){
  if(!window.repSupabase?.auth)return;
  const {data:{user}}=await repSupabase.auth.getUser();
  if(!user)return;
  const {error}=await repSupabase.from('repfuel_workouts').delete().eq('user_id',user.id);
  if(error)throw error;
}

function finishExercise(){
  if(!state.exercise||!state.sets.length)return;
  const r=estimate(state.exercise,state.sets);
  state.exercises.push({exercise:state.exercise,sets:[...state.sets],result:r});
  state.sets=[];state.draft=null;renderSets();renderLiveStats();renderLiveStats();$('finishExercise').disabled=true;$('startSet').disabled=true;$('finishSet').disabled=true;$('addSet').disabled=true;renderSummary();
}
async function finishWorkout(){
  if(state.setStart) finishSet();
  if(state.draft) addSet();
  if(state.exercise && state.sets.length) finishExercise();
  if(!state.exercises.length){alert('Add at least one exercise before finishing.');return}
  state.finished=true;renderSummary();
  $('workoutCard').classList.add('hidden');$('progressCard').classList.add('hidden');$('summaryCard').classList.remove('hidden');$('historyCard').classList.add('hidden');
  $('workoutComplete').classList.remove('hidden');$('workoutComplete').scrollIntoView({behavior:'smooth',block:'start'});
  const result=await saveWorkoutToCloud();
  if(result.ok){$('saveStatus').textContent='☁ Workout synced';await renderHistory();}
  else{$('saveStatus').textContent='Saved locally · cloud sync failed';console.error(result.error);}
}

function startAnotherWorkout(){location.reload()}
function renderLiveStats(){
  const exercises=state.exercises||[];
  const sets=exercises.flatMap(x=>x.sets||[]);
  const volume=sets.reduce((a,x)=>a+(x.load||0)*(x.reps||0),0);
  const active=sets.reduce((a,x)=>a+(x.active||0),0);
  const kcal=exercises.reduce((a,x)=>a+(x.result?.net||0),0);
  const ids=[['liveVolume',`${Math.round(volume).toLocaleString()} kg`],['liveActive',`${fmt(active/60)} min`],['liveSets',`${sets.length}`],['liveKcal',`${Math.round(kcal)} kcal`],['sideExercises',`${exercises.length}`],['sideSets',`${sets.length}`],['sideVolume',`${Math.round(volume).toLocaleString()} kg`],['sideKcal',`${Math.round(kcal)} kcal`]];
  ids.forEach(([id,v])=>{const el=$(id);if(el)el.textContent=v});
}
function renderSummary(){
  renderLiveStats();
  const low=state.exercises.reduce((a,x)=>a+x.result.low,0),high=state.exercises.reduce((a,x)=>a+x.result.high,0);
  const vol=state.exercises.reduce((a,x)=>a+x.result.volume,0),active=state.exercises.reduce((a,x)=>a+x.result.active,0);
  $('sumKcal').textContent=`${Math.round(low)}–${Math.round(high)}`;
  $('sumVolume').textContent=`${Math.round(vol).toLocaleString()} kg`;
  $('sumActive').textContent=`${fmt(active/60)} min`;
  $('sumTime').textContent=`${fmt((Date.now()-state.workoutStart)/60000)} min`;
  $('summaryExercises').innerHTML=state.exercises.map(x=>`<div class="exercise-summary"><strong>${x.exercise.name}</strong><div class="muted">${x.sets.length} sets · ${x.sets.reduce((a,s)=>a+s.reps,0)} reps · ${Math.round(x.result.net)} kcal · MET ${fmt(x.result.met)}</div></div>`).join('');
  $('completeSub').textContent=`${state.exercises.length} exercise${state.exercises.length===1?'':'s'} recorded.`;
}
function applyProfileToForm(p){
  $('age').value=p.age||'';$('sex').value=p.sex||'male';$('height').value=p.height||'';
  $('bodyWeight').value=p.weight||'';$('bodyFat').value=p.bodyFat??'';
  $('level').value=p.level||'beginner';$('consent').checked=!!p.consent;
  if($('progressLevel')) $('progressLevel').textContent=(p.level||'beginner').replace(/^./,c=>c.toUpperCase());
}
function enterWorkout(p){
  applyProfileToForm(p);localStorage.setItem('repfuel_profile',JSON.stringify(p));localStorage.setItem('repfuel_level',p.level);
  $('profileCard').classList.add('hidden');$('workoutCard').classList.remove('hidden');$('progressCard').classList.add('hidden');$('summaryCard').classList.add('hidden');$('historyCard').classList.add('hidden');
  state.workoutStart=Date.now();renderParts();renderExercises();renderHistory();
}
async function loadProfile(){
  const cloud=await loadProfileFromCloud();
  if(cloud){enterWorkout(cloud);return}
  const local=JSON.parse(localStorage.getItem('repfuel_profile')||'null');
  if(local) enterWorkout(local);
  else{$('profileCard').classList.remove('hidden');$('workoutCard').classList.add('hidden');$('summaryCard').classList.add('hidden');$('historyCard').classList.add('hidden');}
}

$('saveProfile').onclick=async()=>{
  const p=profile();p.level=$('level').value;
  if(!p.age||!p.height||!p.weight){alert('Please enter age, height and weight.');return}
  localStorage.setItem('repfuel_profile',JSON.stringify(p));localStorage.setItem('repfuel_level',$('level').value);
  const cloud=await saveProfileToCloud(p);$('saveStatus').textContent=cloud.ok?'☁ Profile synced':'Local profile';enterWorkout(p);
};

$('exerciseSelect').onchange=selectExercise;
$('startSet').onclick=startSet;$('finishSet').onclick=finishSet;$('addSet').onclick=addSet;$('finishExercise').onclick=finishExercise;
$('finishWorkout').onclick=finishWorkout;$('startAnother').onclick=startAnotherWorkout;
$('clearHistory').onclick=async()=>{if(!confirm('Clear all cloud workout history for this account?'))return;try{await deleteCloudHistory();localStorage.removeItem('repfuel_history');await renderHistory();$('saveStatus').textContent='☁ Cloud history cleared'}catch(e){alert('Could not clear cloud history: '+e.message)}};
$('editProfile').onclick=()=>{['workoutCard','progressCard','summaryCard','historyCard'].forEach(id=>$(id)?.classList.add('hidden'));$('profileCard').classList.remove('hidden');document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.section==='workout'));window.scrollTo({top:0,behavior:'smooth'});};
async function showRepFuelSection(section){
  const views=['workoutCard','progressCard','historyCard'];
  const summary=$('summaryCard');

  // Hide all primary views first.
  views.forEach(id=>{const el=$(id);if(el)el.classList.add('hidden')});
  if(summary) summary.classList.add('hidden');

  // If the profile is not set up, keep the profile screen visible.
  const p=JSON.parse(localStorage.getItem('repfuel_profile')||'null');
  if(!p){
    $('profileCard').classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.section==='workout'));
    return;
  }
  $('profileCard').classList.add('hidden');

  if(section==='workout'){
    $('workoutCard').classList.remove('hidden');
  }else if(section==='progress'){
    $('progressCard').classList.remove('hidden');
    await refreshRepFuelProgress();
  }else if(section==='history'){
    $('historyCard').classList.remove('hidden');
    await renderHistory();
  }

  document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.section===section));
  window.scrollTo({top:0,behavior:'smooth'});
}

async function refreshRepFuelProgress(){
  const rows=await fetchCloudHistory();
  renderProgressDashboard(rows);
  if($('progressWorkouts')) $('progressWorkouts').textContent=rows.length;
  const totalVolume=rows.reduce((a,w)=>a+Number(w.summary?.volume||0),0);
  if($('progressVolume')) $('progressVolume').textContent=Math.round(totalVolume).toLocaleString()+' kg';
  const best=rows.reduce((m,w)=>Math.max(m,Number(w.summary?.volume||0)),0);
  if($('progressBest')) $('progressBest').textContent=Math.round(best).toLocaleString()+' kg';
}

$('newWorkout').onclick=()=>{if(confirm('Reset the current workout? Saved cloud history will remain in your account.')) location.reload();};
async function bootRepFuel(){
  renderParts();renderExercises();
  if(window.repSupabase?.auth){
    try{
      const {data:{session}}=await repSupabase.auth.getSession();
      if(!session){
        const {data,error}=await repSupabase.auth.signInAnonymously();
        if(error)throw error;
      }
      $('saveStatus').textContent='☁ Cloud ready';
    }catch(e){console.error('Supabase auth failed:',e);$('saveStatus').textContent='Local mode';}
  }else $('saveStatus').textContent='Local mode';
  await loadProfile();await renderHistory();
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bootRepFuel);
else bootRepFuel();
