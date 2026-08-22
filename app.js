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

const MODEL_VERSION='2.1.0';
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
function progressPeriodSeries(rows, mode='week', count=8){
  const items=(rows||[]).map(w=>({
    ...w,
    date:new Date(w.ended_at||w.created_at||w.started_at||0),
    volume:Number(w.summary?.volume||0),
    sets:Number(w.summary?.sets||0),
    kcal:Number(w.summary?.netKcal||0)
  })).filter(w=>!Number.isNaN(w.date.getTime()));
  const out=[];
  const now=new Date();
  now.setHours(0,0,0,0);
  if(mode==='week'){
    const day=now.getDay();
    const mondayOffset=(day+6)%7;
    const thisMonday=new Date(now);
    thisMonday.setDate(now.getDate()-mondayOffset);
    for(let i=count-1;i>=0;i--){
      const start=new Date(thisMonday); start.setDate(thisMonday.getDate()-i*7);
      const end=new Date(start); end.setDate(start.getDate()+7);
      const bucket=items.filter(w=>w.date>=start&&w.date<end);
      out.push({
        label:i===0?'This week':start.toLocaleDateString(undefined,{month:'short',day:'numeric'}),
        short:start.toLocaleDateString(undefined,{month:'short',day:'numeric'}),
        volume:bucket.reduce((a,w)=>a+w.volume,0),
        sets:bucket.reduce((a,w)=>a+w.sets,0),
        kcal:bucket.reduce((a,w)=>a+w.kcal,0),
        workouts:bucket.length
      });
    }
  }else{
    const first=new Date(now.getFullYear(),now.getMonth()-count+1,1);
    for(let i=0;i<count;i++){
      const start=new Date(first.getFullYear(),first.getMonth()+i,1);
      const end=new Date(start.getFullYear(),start.getMonth()+1,1);
      const bucket=items.filter(w=>w.date>=start&&w.date<end);
      out.push({
        label:start.toLocaleDateString(undefined,{month:'short'}),
        short:start.toLocaleDateString(undefined,{month:'short',year:'numeric'}),
        volume:bucket.reduce((a,w)=>a+w.volume,0),
        sets:bucket.reduce((a,w)=>a+w.sets,0),
        kcal:bucket.reduce((a,w)=>a+w.kcal,0),
        workouts:bucket.length
      });
    }
  }
  return out;
}
function renderProgressDashboard(rows){
  const d=dashboardData(rows||[]);
  const el=$('progressDashboard'); if(!el)return;
  const weekVol=d.recent7.reduce((a,w)=>a+w.volume,0);
  const monthVol=d.recent30.reduce((a,w)=>a+w.volume,0);
  const avgVol=d.workouts.length?d.totalVolume/d.workouts.length:0;
  const avgSets=d.workouts.length?d.totalSets/d.workouts.length:0;
  const avgKcal=d.workouts.length?d.totalKcal/d.workouts.length:0;
  const best=d.workouts.reduce((a,w)=>Math.max(a,w.volume),0);
  const recent=progressDaySeries(rows||[]);
  const split=categorySplit(rows||[]);
  const totalSplit=split.reduce((a,x)=>a+x[1],0)||1;
  const top=d.exercises.slice(0,8);
  const pr=d.exercises.slice().sort((a,b)=>b.bestLoad-a.bestLoad||b.bestE1RM-a.bestE1RM).slice(0,8);
  const totalSets=d.totalSets;
  const totalKcal=Math.round(d.totalKcal);
  const bestExercise=pr[0];
  const weekly=progressPeriodSeries(rows||[],'week',8);
  const monthly=progressPeriodSeries(rows||[],'month',6);
  const currentWeek=weekly[weekly.length-1];
  const previousWeek=weekly[weekly.length-2];
  const currentMonth=monthly[monthly.length-1];
  const previousMonth=monthly[monthly.length-2];
  const pctChange=(current,previous)=>{
    if(!previous || previous===0)return null;
    return ((current-previous)/previous)*100;
  };
  const weekVolumeChange=pctChange(currentWeek?.volume||0,previousWeek?.volume||0);
  const monthVolumeChange=pctChange(currentMonth?.volume||0,previousMonth?.volume||0);
  const frequencyLast4=weekly.slice(-4).reduce((a,w)=>a+w.workouts,0);
  const frequencyPrev4=weekly.slice(-8,-4).reduce((a,w)=>a+w.workouts,0);
  const frequencyChange=pctChange(frequencyLast4,frequencyPrev4);

  if(!d.workouts.length){
    el.innerHTML=`<div class="analytics-shell">
      <div class="analytics-hero"><div><p class="eyebrow">03 · PROGRESS</p><h2>Your training dashboard</h2><p class="muted">Your charts, trends and personal records will appear here after your first saved workout.</p></div><span class="sync-pill"><i class="sync-dot"></i> Cloud connected</span></div>
      <div class="empty-analytics"><div class="empty-icon">↗</div><h3>Your progress starts with your first workout</h3><p>Finish a workout and GAINORY will build volume, frequency, calorie and strength trends automatically.</p><br><button class="primary" type="button" onclick="showRepFuelSection('workout')">Start a workout →</button></div>
    </div>`;
    return;
  }

  const formatVolumeTick=value=>{
    const n=Math.round(Number(value)||0);
    if(n>=1000)return `${(n/1000).toFixed(n>=10000?0:1).replace(/\.0$/,'')}k`;
    return n.toLocaleString();
  };
  const trendMarkup=(value,label)=>{
    if(value===null)return `<span class="trend neutral">No prior data</span>`;
    const up=value>0, flat=Math.abs(value)<0.1;
    return `<span class="trend ${flat?'neutral':up?'up':'down'}">${flat?'→':up?'↑':'↓'} ${Math.abs(value).toFixed(0)}% ${label}</span>`;
  };
  const chartMax=Math.max(...recent.map(x=>Number(x.volume)||0),0);
  const chartScale=chartMax>0?chartMax:1000;
  const chartTicks=[chartScale,chartScale/2,0];
  const chartBars=recent.map(x=>`<div class="bar-col" title="${x.label}: ${Math.round(x.volume).toLocaleString()} kg"><span class="bar-value">${x.volume?formatVolumeTick(x.volume):''}</span><div class="bar" style="height:${Math.max(x.volume?4:2,(x.volume/chartScale)*145)}px"></div><span class="bar-label">${x.label}</span></div>`).join('');
  const chartYAxis=chartTicks.map(v=>`<span>${formatVolumeTick(v)}</span>`).join('');
  const colors=['#A3FF12','#71ad0c','#3f5d1c','#263229'];
  let cumulative=0;
  const stops=split.length?split.map((x,i)=>{const pct=x[1]/totalSplit*100;const s=`${colors[i]} ${cumulative.toFixed(1)}% ${(cumulative+pct).toFixed(1)}%`;cumulative+=pct;return s}).join(', '):'#263229 0 100%';
  const legend=split.length?split.map((x,i)=>`<div class="legend-row"><i class="legend-dot" style="background:${colors[i]}" ></i><span>${x[0]}</span><strong>${Math.round(x[1]).toLocaleString()} kg</strong></div>`).join(''):'<div class="muted">No exercise volume yet.</div>';
  const weeklyMax=Math.max(...weekly.map(x=>x.volume),1);
  const monthlyMax=Math.max(...monthly.map(x=>x.volume),1);
  const weeklyBars=weekly.map(x=>`<div class="trend-bar-col" title="${x.short}: ${Math.round(x.volume).toLocaleString()} kg"><div class="trend-bar-value">${x.volume?formatVolumeTick(x.volume):''}</div><div class="trend-bar" style="height:${Math.max(x.volume?6:2,(x.volume/weeklyMax)*118)}px"></div><span>${x.label}</span></div>`).join('');
  const monthlyBars=monthly.map(x=>`<div class="trend-bar-col" title="${x.short}: ${Math.round(x.volume).toLocaleString()} kg"><div class="trend-bar-value">${x.volume?formatVolumeTick(x.volume):''}</div><div class="trend-bar" style="height:${Math.max(x.volume?6:2,(x.volume/monthlyMax)*118)}px"></div><span>${x.label}</span></div>`).join('');

  el.innerHTML=`
  <div class="analytics-shell">
    <div class="analytics-hero">
      <div><p class="eyebrow">03 · PROGRESS</p><h2>Your training dashboard</h2><p class="muted">A live view of your volume, frequency, calories and strength progression.</p></div>
      <span class="sync-pill"><i class="sync-dot"></i> Cloud synced</span>
    </div>

    <div class="metric-grid">
      <div class="metric-card"><span class="metric-label">Workouts</span><div class="metric-value accent">${d.workouts.length}</div><span class="metric-meta">${d.days} training day${d.days===1?'':'s'} · ${avgSets.toFixed(1)} sets / workout</span></div>
      <div class="metric-card"><span class="metric-label">Total volume</span><div class="metric-value">${Math.round(d.totalVolume).toLocaleString()} kg</div><span class="metric-meta">${Math.round(avgVol).toLocaleString()} kg average / workout</span></div>
      <div class="metric-card"><span class="metric-label">Total sets</span><div class="metric-value">${totalSets}</div><span class="metric-meta">${totalKcal.toLocaleString()} estimated kcal</span></div>
      <div class="metric-card"><span class="metric-label">Best workout</span><div class="metric-value">${Math.round(best).toLocaleString()} kg</div><span class="metric-meta">${bestExercise?`Top lift: ${bestExercise.name}`:'Keep training'}</span></div>
    </div>

    <div class="insight-grid">
      <div class="insight-card"><span>Last 7 days</span><strong>${Math.round(weekVol).toLocaleString()} kg</strong>${trendMarkup(weekVolumeChange,'vs previous week')}</div>
      <div class="insight-card"><span>Last 30 days</span><strong>${Math.round(monthVol).toLocaleString()} kg</strong>${trendMarkup(monthVolumeChange,'vs previous month')}</div>
      <div class="insight-card"><span>Workout frequency</span><strong>${frequencyLast4} <small>/ 4 weeks</small></strong>${trendMarkup(frequencyChange,'vs prior 4 weeks')}</div>
      <div class="insight-card"><span>Average calories</span><strong>${Math.round(avgKcal).toLocaleString()} <small>kcal</small></strong><span class="trend neutral">per workout</span></div>
    </div>

    <div class="analytics-two">
      <div class="analytics-panel">
        <div class="panel-heading"><div><h3>7-day training volume</h3><p>Daily logged resistance volume</p></div><strong class="pr-badge">${Math.round(weekVol).toLocaleString()} kg</strong></div>
        <div class="chart-wrap" aria-label="7-day training volume chart"><div class="chart-y">${chartYAxis}</div><div class="bar-chart">${chartBars}</div></div>
      </div>
      <div class="analytics-panel">
        <div class="panel-heading"><div><h3>Training split</h3><p>All-time volume by body part</p></div></div>
        <div class="donut-wrap"><div class="donut" style="background:conic-gradient(${stops})" role="img" aria-label="Training split by body part"><div class="donut-center"><strong>${formatVolumeTick(totalSplit)}</strong><span>kg all-time</span></div></div><div class="legend">${legend}</div></div>
      </div>
    </div>

    <div class="analytics-panel trend-panel">
      <div class="panel-heading"><div><p class="eyebrow">WEEKLY TREND</p><h3>Volume over the last 8 weeks</h3><p>Weekly training volume with workout frequency.</p></div><span class="history-count">${frequencyLast4} workouts · last 4 weeks</span></div>
      <div class="trend-chart">${weeklyBars}</div>
      <div class="trend-summary"><span><b>${Math.round(currentWeek.volume).toLocaleString()} kg</b> this week</span><span><b>${currentWeek.workouts}</b> workout${currentWeek.workouts===1?'':'s'}</span><span><b>${currentWeek.sets}</b> sets</span></div>
    </div>

    <div class="analytics-panel trend-panel">
      <div class="panel-heading"><div><p class="eyebrow">MONTHLY TREND</p><h3>Volume over the last 6 months</h3><p>Longer-term training consistency and workload.</p></div><span class="history-count">${Math.round(currentMonth.volume).toLocaleString()} kg this month</span></div>
      <div class="trend-chart">${monthlyBars}</div>
      <div class="trend-summary"><span><b>${currentMonth.workouts}</b> workouts</span><span><b>${currentMonth.sets}</b> sets</span><span><b>${Math.round(currentMonth.kcal).toLocaleString()}</b> kcal</span></div>
    </div>

    <div class="analytics-panel">
      <div class="panel-heading"><div><p class="eyebrow">EXERCISE PROGRESSION</p><h3>Highest training volume</h3><p>Exercises ranked by total logged volume.</p></div><span class="history-count">${d.exercises.length} exercises</span></div>
      ${top.length?`<div class="progress-table"><div class="progress-row progress-header"><span>Exercise</span><span>Sessions</span><span>Sets</span><span>Volume</span><span>Best load</span></div>${top.map(x=>`<div class="progress-row"><strong>${x.name}</strong><span>${x.sessions}</span><span>${x.sets}</span><span class="progress-number">${Math.round(x.volume).toLocaleString()} kg</span><span class="progress-number">${x.bestLoad?fmt(x.bestLoad)+' kg':'Bodyweight'}</span></div>`).join('')}</div>`:'<div class="empty-analytics"><h3>No exercise data yet</h3></div>'}
    </div>

    <div class="analytics-panel">
      <div class="panel-heading"><div><p class="eyebrow">PERSONAL RECORDS</p><h3>Best recorded sets</h3><p>Highest load and estimated 1RM from your logged sets.</p></div></div>
      ${pr.length?`<div class="progress-table"><div class="progress-row progress-header"><span>Exercise</span><span>Best load</span><span>Best reps</span><span>Est. 1RM</span><span>Last set</span></div>${pr.map(x=>`<div class="progress-row"><strong>${x.name}</strong><span class="progress-number">${x.bestLoad?fmt(x.bestLoad)+' kg':'Bodyweight'}</span><span class="progress-number">${x.bestReps||0}</span><span class="progress-number">${x.bestE1RM?fmt(x.bestE1RM)+' kg':'—'}</span><span>${x.lastLoad?fmt(x.lastLoad)+' kg × '+x.lastReps:'Bodyweight × '+(x.lastReps||0)}</span></div>`).join('')}</div>`:'<div class="empty-analytics"><h3>Your PRs will appear here</h3></div>'}
    </div>
  </div>`;
}
function formatWorkoutDuration(started, ended){
  if(!started || !ended)return '—';
  const seconds=Math.max(0,Math.round((new Date(ended)-new Date(started))/1000));
  const h=Math.floor(seconds/3600), m=Math.floor((seconds%3600)/60), sec=seconds%60;
  if(h)return `${h}h ${String(m).padStart(2,'0')}m`;
  return `${m}m ${String(sec).padStart(2,'0')}s`;
}
function formatHistoryDate(value){
  if(!value)return 'Date unavailable';
  const d=new Date(value), now=new Date();
  const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  const target=new Date(d.getFullYear(),d.getMonth(),d.getDate());
  const diff=Math.round((today-target)/86400000);
  const time=d.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'});
  if(diff===0)return `Today · ${time}`;
  if(diff===1)return `Yesterday · ${time}`;
  return `${d.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'})} · ${time}`;
}
function historySetMarkup(ex){
  const cardio=isCardio(ex.family);
  const sets=Array.isArray(ex.sets)?ex.sets:[];
  if(!sets.length)return '<div class="history-detail-empty">No completed sets recorded.</div>';
  return `<div class="history-set-list">${sets.map((s,i)=>{
    const weight=cardio?'—':`${fmt(s.load)} kg`;
    const reps=cardio?`${fmt((s.active||0)/60)} min`:`${Number(s.reps)||0} reps`;
    return `<div class="history-set-row"><span><b>Set ${i+1}</b></span><span>${weight}</span><span>${reps}</span><span>${fmt(s.active)}s work</span><span>${fmt(s.rest)}s rest</span></div>`;
  }).join('')}</div>`;
}
function historyExerciseMarkup(ex){
  const sets=Array.isArray(ex.sets)?ex.sets:[];
  const totalReps=sets.reduce((a,s)=>a+(Number(s.reps)||0),0);
  const volume=Number(ex.result?.volume||sets.reduce((a,s)=>a+(Number(s.load)||0)*(Number(s.reps)||0),0));
  return `<div class="history-exercise">
    <div class="history-exercise-head">
      <div><strong>${ex.name||'Exercise'}</strong><span>${ex.bodyPart||''} · ${ex.equipment||'equipment'}</span></div>
      <div class="history-exercise-stat"><b>${sets.length}</b><small>sets</small></div>
      <div class="history-exercise-stat"><b>${volume?Math.round(volume).toLocaleString():'0'}</b><small>kg vol.</small></div>
    </div>
    <div class="history-set-head"><span>SET</span><span>LOAD</span><span>REPS / TIME</span><span>WORK</span><span>REST</span></div>
    ${historySetMarkup(ex)}
  </div>`;
}
async function renderHistory(){
  const rows=await fetchCloudHistory();
  const list=$('historyList');
  const safeRows=Array.isArray(rows)?rows:[];
  if(list) list.innerHTML=`
    <div class="history-toolbar"><div><strong>Recent workouts</strong><span class="history-count"> · ${safeRows.length} workout${safeRows.length===1?'':'s'}</span></div><button class="ghost" type="button" onclick="renderHistory()">↻ Refresh</button></div>
    ${safeRows.length?safeRows.slice(0,30).map((w,index)=>{
      const exercises=Array.isArray(w.exercises)?w.exercises:[];
      const summary=w.summary||{};
      const volume=Number(summary.volume||exercises.reduce((a,e)=>a+Number(e.result?.volume||0),0));
      const kcal=Number(summary.netKcal||exercises.reduce((a,e)=>a+Number(e.result?.net||0),0));
      const sets=Number(summary.sets||exercises.reduce((a,e)=>a+(Array.isArray(e.sets)?e.sets.length:0),0));
      const duration=formatWorkoutDuration(w.started_at,w.ended_at);
      const title=exercises.length?exercises.map(e=>e.name).slice(0,2).join(' + '):'Workout session';
      const more=exercises.length>2?` + ${exercises.length-2} more`:'';
      const dateLabel=formatHistoryDate(w.ended_at||w.created_at||w.started_at);
      return `<details class="history-workout-card" ${index===0?'open':''}>
        <summary class="history-workout-summary">
          <div class="history-summary-main"><div class="history-icon">↗</div><div><strong>${title}${more}</strong><span>${dateLabel}</span></div></div>
          <div class="history-summary-metrics"><span><b>${Math.round(volume).toLocaleString()}</b><small>kg</small></span><span><b>${sets}</b><small>sets</small></span><span><b>${Math.round(kcal)}</b><small>kcal</small></span><span><b>${duration}</b><small>duration</small></span></div>
          <span class="history-chevron">⌄</span>
        </summary>
        <div class="history-workout-details">
          <div class="history-detail-top"><div><p class="eyebrow">WORKOUT DETAILS</p><h3>${dateLabel}</h3></div><span class="history-exercise-count">${exercises.length} exercise${exercises.length===1?'':'s'}</span></div>
          <div class="history-detail-stats"><div><span>Volume</span><b>${Math.round(volume).toLocaleString()} kg</b></div><div><span>Sets</span><b>${sets}</b></div><div><span>Calories</span><b>${Math.round(kcal)} kcal</b></div><div><span>Duration</span><b>${duration}</b></div></div>
          <div class="history-exercises">${exercises.length?exercises.map(historyExerciseMarkup).join(''):'<div class="history-detail-empty">No exercise details were saved for this workout.</div>'}</div>
        </div>
      </details>`;
    }).join(''):`<div class="history-empty"><div><div class="empty-icon">◷</div><h3>No cloud workouts yet</h3><p>Finish and save your first workout. It will appear here automatically.</p><button class="primary" type="button" onclick="showRepFuelSection('workout')">Start your first workout</button></div></div>`}`;

  const h=flattenCloudWorkouts(safeRows);
  const totalKcal=h.reduce((a,x)=>a+(Number(x.estimatedNetKcal)||0),0);
  const totalVolume=h.reduce((a,x)=>a+(Number(x.totalVolumeKg)||0),0);
  if($('historyKcal')) $('historyKcal').textContent=Math.round(totalKcal).toLocaleString();
  if($('historyVolume')) $('historyVolume').textContent=Math.round(totalVolume).toLocaleString()+' kg';
  if($('historyDays')) $('historyDays').textContent=new Set(h.map(x=>x.savedAt?.slice(0,10)).filter(Boolean)).size;
  if($('historySets')) $('historySets').textContent=h.reduce((a,x)=>a+(x.sets||0),0);
  if($('progressWorkouts')) $('progressWorkouts').textContent=safeRows.length;
  if($('progressVolume')) $('progressVolume').textContent=Math.round(totalVolume).toLocaleString()+' kg';
  const bestVolume=safeRows.reduce((best,w)=>Math.max(best,Number(w.summary?.volume||0)),0);
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
  const end=Date.now(),active=(end-state.setStart)/1000,rest=state.sets.length?Math.max(0,(state.setStart-state.sets.at(-1).end)/1000):0;
  if(active<0.5){ clearInterval(state.timer); state.setStart=null; $('finishSet').disabled=true; $('startSet').disabled=false; $('timer').textContent='00:00'; return; }
  clearInterval(state.timer);state.setStart=null;
  const startMs=end-active*1000;
  state.draft={start:startMs,end,active,rest};
  $('finishSet').disabled=true;$('startSet').disabled=false;$('addSet').disabled=false;$('timer').textContent='00:00';
}
function addSet(){
  if(!state.draft||!state.exercise)return;
  if(state.sets.some(s=>s.start===state.draft.start && s.end===state.draft.end))return;
  const cardio=isCardio(state.exercise.family);
  const reps=cardio?1:Number($('reps').value);
  if(!cardio && (!Number.isFinite(reps)||reps<1))return;
  if(cardio && (!Number.isFinite(state.draft.active)||state.draft.active<5))return;
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
function bodyweightVolumeFactor(family){
  // External resistance volume remains the primary strength metric.
  // Bodyweight movements are intentionally kept separate because the
  // actual fraction of body mass loaded varies substantially by movement.
  return ({
    bodyweight:0.65, pullup:1.00, bodyweight_compound:0.75,
    lunge:0.70, unilateral_leg:0.70, hip_thrust:0.70,
    core:0.45, core_high:0.55, bodyweight_high:0.55
  })[family] ?? 0;
}
function calculateVolume(e,sets,p){
  const external=sets.reduce((a,s)=>a+(Number(s.load)||0)*(Number(s.reps)||0),0);
  const bw=(p?.weight||0);
  const bwReps=sets.reduce((a,s)=>a+(Number(s.reps)||0),0);
  const factor=bodyweightVolumeFactor(e.family);
  const estimatedBodyweight=(!isCardio(e.family)&&bw>0&&factor>0)?bw*bwReps*factor:0;
  return {external,estimatedBodyweight,total:external+estimatedBodyweight};
}
function resistanceMET(e,sets){
  if(!sets.length)return BASE_MET[e.family]||3.5;
  let weighted=0,totalActive=0;
  sets.forEach(s=>{
    const active=clamp(Number(s.active)||0,5,180);
    const reps=Math.max(0,Number(s.reps)||0);
    const load=Math.max(0,Number(s.load)||0);
    let effort=1;
    if(load>0 && reps>0){
      const one=epley(load,reps);
      const intensity=one?clamp(load/one,0.40,0.98):0.60;
      effort*=clamp(0.92+(intensity-0.60)*0.55,0.82,1.12);
    }
    const durationFactor=clamp(0.90+(active/30)*0.10,0.90,1.08);
    const repFactor=clamp(0.96+(reps-8)*0.006,0.92,1.05);
    const setMET=(BASE_MET[e.family]||3.5)*effort*durationFactor*repFactor;
    weighted+=setMET*active;
    totalActive+=active;
  });
  return clamp(totalActive?weighted/totalActive:(BASE_MET[e.family]||3.5),2.5,8.0);
}
function cardioMET(e){
  const speed=+$('cardioSpeed')?.value||0;
  const inc=+$('cardioIncline')?.value||0;
  const watts=+$('cardioWatts')?.value||0;
  const intensity=$('cardioIntensity')?.value||'moderate';
  if(e.family==='treadmill_walk'){
    if(speed<=2.0)return 2.5;
    if(speed<=2.5)return 3.0;
    if(speed<=3.0)return 3.5;
    if(speed<=3.5)return 4.3;
    if(speed<=4.0)return 5.0;
    if(speed<=4.5)return 5.8;
    return 6.5;
  }
  if(e.family==='treadmill_incline_walk'){
    return clamp(3.5+(Math.max(0,speed-2.5)*1.15)+(inc*0.28),3.5,9.5);
  }
  if(e.family==='treadmill_run'){
    // Speed input is mph. Values are intentionally conservative.
    let m=speed<=4.0?6.0:speed<=4.5?7.0:speed<=5.0?8.3:speed<=5.5?9.0:speed<=6.0?9.8:speed<=6.5?10.5:speed<=7.0?11.0:speed<=8.0?11.8:12.8;
    if(inc)m+=Math.min(3,inc*0.20);
    return clamp(m,6,16);
  }
  if(['bike_stationary','spin_bike','air_bike'].includes(e.family)){
    if(!watts)return intensity==='vigorous'?9.0:6.8;
    return watts<50?4.0:watts<75?5.0:watts<100?6.0:watts<125?6.8:watts<150?8.0:watts<200?10.0:watts<250?11.0:12.5;
  }
  if(e.family==='rower'){
    if(!watts)return intensity==='vigorous'?10.0:7.0;
    return watts<100?5.0:watts<150?7.0:watts<200?9.5:12.0;
  }
  if(e.family==='elliptical')return intensity==='vigorous'?7.5:5.0;
  if(e.family==='stair_climber')return intensity==='vigorous'?9.0:7.0;
  if(e.family==='skierg')return intensity==='vigorous'?12.5:8.5;
  return BASE_MET[e.family]||5;
}
function publishedResistanceAnchor(p,setData){
  if(p.bodyFat==null||!p.height||!p.age||!p.weight)return null;
  const fat=p.weight*p.bodyFat/100,lean=p.weight-fat;
  const volume=setData.reduce((a,s)=>a+s.load*s.reps,0);
  const kcal=.874*p.height-.596*p.age-1.016*fat+1.638*lean+2.461*(volume*1e-3)-110.742;
  return Number.isFinite(kcal)&&kcal>0?kcal:null;
}
function estimate(e,sets){
  const p=profile(),bw=p.weight||70;
  const active=sets.reduce((a,s)=>a+clamp(Number(s.active)||0,0,600),0);
  const rest=sets.reduce((a,s)=>a+clamp(Number(s.rest)||0,0,1800),0);
  const volume=calculateVolume(e,sets,p);
  const met=isCardio(e.family)?cardioMET(e):resistanceMET(e,sets);

  // Gross MET calories include resting metabolism. For the app's workout
  // calorie figure we report net activity calories, then keep gross as a
  // diagnostic value for future analytics.
  const activeGross=met*3.5*bw*(active/60)/200;
  const restGross=REST_MET*3.5*bw*(rest/60)/200;
  const gross=activeGross+restGross;
  const baseline=3.5*bw*((active+rest)/60)/200;
  const net=Math.max(0,gross-baseline);

  const anchor=isCardio(e.family)?null:publishedResistanceAnchor(p,sets);
  const uncertainty=isCardio(e.family)
    ? Math.max(4,net*0.12+2)
    : Math.max(6,net*0.22+3);

  return {
    net,
    gross,
    low:Math.max(0,net-uncertainty),
    high:net+uncertainty,
    active,
    rest,
    volume:volume.external,
    externalVolume:volume.external,
    estimatedBodyweightVolume:volume.estimatedBodyweight,
    bodyweightReps:(!isCardio(e.family)&&bodyweightVolumeFactor(e.family)>0)?sets.reduce((a,s)=>a+(Number(s.reps)||0),0):0,
    met,
    anchor,
    modelVersion:MODEL_VERSION
  };
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
  const volume=sets.reduce((a,x)=>a+(Number(x.load)||0)*(Number(x.reps)||0),0);
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


let accountSetupEmail = '';

function getCurrentAuthUser(){
  return window.repSupabase?.auth ? repSupabase.auth.getUser() : Promise.resolve({data:{user:null}});
}

async function isPermanentRepFuelUser(){
  const {data:{user}}=await getCurrentAuthUser();
  return !!(user && !user.is_anonymous && user.email);
}

function showAccountPanel(){
  const panel=$('accountPanel'); if(!panel)return;
  panel.classList.remove('hidden');
  updateAccountPanel().catch(console.error);
}

function hideAccountPanel(){
  $('accountPanel')?.classList.add('hidden');
  $('accountModal')?.classList.add('hidden');
}

async function updateAccountPanel(){
  if(!window.repSupabase?.auth)return;
  const {data:{user},error}=await getCurrentAuthUser();
  if(error||!user)return;

  const permanent=!user.is_anonymous;
  $('guestAccountActions')?.classList.toggle('hidden',permanent);
  $('permanentAccountActions')?.classList.toggle('hidden',!permanent);

  if(permanent){
    $('accountStatusTitle').textContent='Permanent account';
    $('accountStatusText').textContent='Your GAINORY account can be recovered on another device using your email and password.';
    $('accountEmail').textContent=user.email||'—';
    $('saveStatus').textContent='☁ Account synced';
  }else{
    $('accountStatusTitle').textContent='Guest account';
    $('accountStatusText').textContent='Your workouts are cloud-synced, but this guest identity cannot be recovered after sign-out or on another device.';
    $('saveStatus').textContent='☁ Guest synced';
  }
}

function openCreateAccount(){
  $('accountModal')?.classList.remove('hidden');
  $('createAccountForm')?.classList.remove('hidden');
  $('verificationStep')?.classList.add('hidden');
  $('passwordStep')?.classList.add('hidden');
  $('loginStep')?.classList.add('hidden');
  $('accountFormError')?.classList.add('hidden');
  $('accountName')?.focus();
}

function closeCreateAccount(){
  $('accountModal')?.classList.add('hidden');
  $('loginStep')?.classList.add('hidden');
}

function openLoginAccount(){
  $('accountModal')?.classList.remove('hidden');
  $('createAccountForm')?.classList.add('hidden');
  $('verificationStep')?.classList.add('hidden');
  $('passwordStep')?.classList.add('hidden');
  $('loginStep')?.classList.remove('hidden');
  $('loginError')?.classList.add('hidden');
  $('loginEmail')?.focus();
}

function explainLoginError(error){
  const message=String(error?.message||error||'');
  const lower=message.toLowerCase();
  if(lower.includes('invalid login credentials')) return 'The email or password is incorrect. Please check both and try again.';
  if(lower.includes('email not confirmed')) return 'Please verify your email address before signing in.';
  if(lower.includes('rate limit')) return 'Too many attempts. Please wait a little and try again.';
  return message || 'Could not sign in. Please try again.';
}

async function signInExistingAccount(){
  if(!window.repSupabase?.auth){showAccountError('loginError','Cloud account services are not available right now.');return;}
  const email=$('loginEmail').value.trim();
  const password=$('loginPassword').value;
  if(!email || !email.includes('@')){showAccountError('loginError','Please enter a valid email address.');return;}
  if(!password){showAccountError('loginError','Please enter your password.');return;}
  $('loginBtn').disabled=true;
  try{
    const {data,error}=await repSupabase.auth.signInWithPassword({email,password});
    if(error)throw error;
    if(!data?.user || data.user.is_anonymous) throw new Error('This login did not create a permanent account session.');
    localStorage.removeItem('repfuel_profile');
    $('loginStep')?.classList.add('hidden');
    $('accountModal')?.classList.add('hidden');
    $('saveStatus').textContent='☁ Account synced';
    const cloud=await loadProfileFromCloud();
    if(cloud){
      enterWorkout(cloud);
    }else{
      await loadProfile();
    }
    await renderHistory();
    await refreshRepFuelProgress();
    await updateAccountPanel();
  }catch(e){
    console.error('GAINORY sign-in failed:',e);
    showAccountError('loginError',explainLoginError(e));
  }finally{$('loginBtn').disabled=false;}
}

function showAccountError(id,message){
  const el=$(id); if(!el)return;
  el.textContent=message; el.classList.remove('hidden');
}

function getAccountRedirectUrl(){
  return window.location.origin + window.location.pathname;
}

function explainAccountError(error){
  const message=String(error?.message||error||'');
  const lower=message.toLowerCase();
  if(lower.includes('manual') && lower.includes('link')){
    return 'Supabase is blocking the account conversion. In Supabase open Authentication → Settings and enable Manual Linking, then try again.';
  }
  if(lower.includes('redirect') || lower.includes('url')){
    return message + ' Make sure https://omprakash06072002.github.io/Repfuel/ is added to Supabase Authentication → URL Configuration → Redirect URLs.';
  }
  if(lower.includes('rate limit')){
    return 'Supabase email sending is temporarily rate-limited. Wait a little and use Send again.';
  }
  return message || 'Could not start account creation.';
}

async function sendAccountVerification(){
  if(!window.repSupabase?.auth){showAccountError('accountFormError','Cloud account services are not available right now.');return;}
  const name=$('accountName').value.trim();
  const email=$('accountEmailInput').value.trim();
  const consent=$('accountDataConsent').checked;
  if(!name){showAccountError('accountFormError','Please enter your name.');return;}
  if(!email || !email.includes('@')){showAccountError('accountFormError','Please enter a valid email address.');return;}
  if(!consent){showAccountError('accountFormError','Please confirm that you understand the account data storage.');return;}

  const {data:{user},error:userError}=await getCurrentAuthUser();
  if(userError||!user){showAccountError('accountFormError','Your GAINORY session is unavailable. Refresh the page and try again.');return;}
  if(!user.is_anonymous){
    showAccountError('accountFormError','This GAINORY user already has a permanent account.');
    return;
  }

  $('sendVerificationBtn').disabled=true;
  try{
    const {error}=await repSupabase.auth.updateUser(
      {
        email,
        data:{display_name:name}
      },
      {emailRedirectTo:getAccountRedirectUrl()}
    );
    if(error)throw error;

    accountSetupEmail=email;
    const p=profile();
    p.name=name;
    p.consent=true;
    localStorage.setItem('repfuel_profile',JSON.stringify(p));
    await saveProfileToCloud(p);

    $('verificationEmail').textContent=email;
    $('createAccountForm').classList.add('hidden');
    $('verificationStep').classList.remove('hidden');
  }catch(e){
    console.error('GAINORY account conversion failed:',e);
    showAccountError('accountFormError',explainAccountError(e));
  }finally{
    $('sendVerificationBtn').disabled=false;
  }
}

async function resendAccountVerification(){
  if(!accountSetupEmail)return;
  $('resendVerificationBtn').disabled=true;
  try{
    const {error}=await repSupabase.auth.resend({
      type:'email_change',
      email:accountSetupEmail,
      options:{emailRedirectTo:getAccountRedirectUrl()}
    });
    if(error)throw error;
    $('verificationError').classList.add('hidden');
  }catch(e){
    console.error('GAINORY verification resend failed:',e);
    showAccountError('verificationError',explainAccountError(e));
  }finally{$('resendVerificationBtn').disabled=false;}
}

async function checkVerificationAndShowPassword(){
  $('finishVerificationBtn').disabled=true;
  try{
    // Refresh the session so the browser receives the user state created by the email link.
    const {error:refreshError}=await repSupabase.auth.refreshSession();
    if(refreshError)throw refreshError;
    const {data:{user},error}=await repSupabase.auth.getUser();
    if(error||!user)throw new Error('Could not read your GAINORY account.');
    const verified=!!user.email_confirmed_at && !user.is_anonymous;
    if(!verified){
      showAccountError('verificationError','Verification is not visible yet. Open the latest email link, return to GAINORY, then press this button again.');
      return;
    }
    accountSetupEmail=user.email||accountSetupEmail;
    $('verificationStep').classList.add('hidden');
    $('passwordStep').classList.remove('hidden');
    $('accountPassword').focus();
  }catch(e){
    console.error('GAINORY verification check failed:',e);
    showAccountError('verificationError',explainAccountError(e));
  }finally{$('finishVerificationBtn').disabled=false;}
}

async function setPermanentPassword(){
  const password=$('accountPassword').value;
  const confirm=$('accountPasswordConfirm').value;
  if(password.length<8){showAccountError('passwordError','Use at least 8 characters.');return;}
  if(password!==confirm){showAccountError('passwordError','The passwords do not match.');return;}

  $('setPasswordBtn').disabled=true;
  try{
    const {data,error}=await repSupabase.auth.updateUser({password});
    if(error)throw error;
    const {data:{user:verifiedUser},error:userError}=await repSupabase.auth.getUser();
    if(userError||!verifiedUser||verifiedUser.is_anonymous||!verifiedUser.email){
      throw new Error('The email was verified, but Supabase did not finish linking the permanent account. Please make sure Manual Linking is enabled in Supabase Authentication → Settings.');
    }

    // Re-save the profile against the same user id.
    const p=profile();
    p.name=$('accountName').value.trim()||p.name||'';
    p.consent=true;
    localStorage.setItem('repfuel_profile',JSON.stringify(p));
    await saveProfileToCloud(p);

    $('accountModal').classList.add('hidden');
    await updateAccountPanel();
    $('saveStatus').textContent='☁ Account synced';
    alert('Your GAINORY account is ready. Your existing cloud workouts stay attached to this account.');
  }catch(e){
    console.error('GAINORY password setup failed:',e);
    showAccountError('passwordError',explainAccountError(e));
  }finally{$('setPasswordBtn').disabled=false;}
}

async function signOutRepFuel(){
  if(!window.repSupabase?.auth)return;
  const {error}=await repSupabase.auth.signOut();
  if(error){alert(error.message);return;}
  // A signed-out anonymous/permanent user cannot be recovered by this page.
  // Start a fresh anonymous session for continued guest use.
  const {error:anonError}=await repSupabase.auth.signInAnonymously();
  if(anonError){alert(anonError.message);return;}
  localStorage.removeItem('repfuel_profile');
  location.reload();
}


document.addEventListener('DOMContentLoaded', () => {

  $('createAccountBtn')?.addEventListener('click', openCreateAccount);
  $('closeAccountPanel')?.addEventListener('click', hideAccountPanel);
  $('closeAccountModal')?.addEventListener('click', closeCreateAccount);

  $('sendVerificationBtn')?.addEventListener('click', sendAccountVerification);
  $('resendVerificationBtn')?.addEventListener('click', resendAccountVerification);
  $('finishVerificationBtn')?.addEventListener('click', checkVerificationAndShowPassword);
  $('setPasswordBtn')?.addEventListener('click', setPermanentPassword);
  $('loginBtn')?.addEventListener('click', signInExistingAccount);
  $('openLoginBtn')?.addEventListener('click', openLoginAccount);
  $('backToCreateBtn')?.addEventListener('click', openCreateAccount);
  $('signOutBtn')?.addEventListener('click', signOutRepFuel);

  $('accountPanel')?.addEventListener('click', (e) => {
    if (e.target === $('accountPanel')) hideAccountPanel();
  });

  $('accountModal')?.addEventListener('click', (e) => {
    if (e.target === $('accountModal')) closeCreateAccount();
  });

});

$('exerciseSelect')?.addEventListener('change',selectExercise);
$('startSet')?.addEventListener('click',startSet);
$('finishSet')?.addEventListener('click',finishSet);
$('addSet')?.addEventListener('click',addSet);
$('finishExercise')?.addEventListener('click',finishExercise);
$('finishWorkout')?.addEventListener('click',finishWorkout);
$('startAnother')?.addEventListener('click',startAnotherWorkout);

$('clearHistory')?.addEventListener('click',async()=>{
  if(!confirm('Clear all cloud workout history for this account?')) return;

  try{
    await deleteCloudHistory();
    localStorage.removeItem('repfuel_history');
    await renderHistory();
    $('saveStatus').textContent='☁ Cloud history cleared';
  }catch(e){
    alert('Could not clear cloud history: '+e.message);
  }
});

$('editProfile')?.addEventListener('click',()=>{
  showAccountPanel();
});
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
