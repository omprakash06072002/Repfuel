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

const MODEL_VERSION='1.0.0';
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
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const fmt=x=>Number(x||0).toFixed(1);
const isCardio=f=>f&&(['treadmill_walk','treadmill_run','treadmill_incline_walk','bike_stationary','spin_bike','elliptical','stair_climber','rower','air_bike','skierg'].includes(f));

const sessionId=localStorage.getItem('repfuel_session')||crypto.randomUUID();
localStorage.setItem('repfuel_session',sessionId);

let state={parts:[],exerciseOptions:[],exercise:null,sets:[],draft:null,workoutStart:null,setStart:null,timer:null,exercises:[],workoutId:crypto.randomUUID(),finished:false};
function getHistory(){return JSON.parse(localStorage.getItem('repfuel_history')||'[]')}
function renderHistory(){
  const h=getHistory(),sessions={};
  h.forEach(x=>{const key=x.savedAt?.slice(0,10)||'unknown';(sessions[key]??=[]).push(x)});
  const days=Object.entries(sessions).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,14);
  $('historyList').innerHTML=days.length?days.map(([day,items])=>{
    const kcal=items.reduce((a,x)=>a+(x.estimatedNetKcal||0),0),volume=items.reduce((a,x)=>a+(x.totalVolumeKg||0),0);
    const ex=[...new Set(items.map(x=>x.exercise))];
    return `<div class="history-day"><div><strong>${new Date(day+'T12:00:00').toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'})}</strong><span>${ex.length} exercise${ex.length===1?'':'s'}</span></div><div><strong>${Math.round(kcal)} kcal</strong><span>${Math.round(volume).toLocaleString()} kg volume</span></div></div>`
  }).join(''):'<p class="muted">No completed workouts yet. Your history will appear here.</p>';
  $('historyKcal').textContent=Math.round(h.reduce((a,x)=>a+(x.estimatedNetKcal||0),0));
  $('historyVolume').textContent=Math.round(h.reduce((a,x)=>a+(x.totalVolumeKg||0),0)).toLocaleString()+' kg';
  $('historyDays').textContent=new Set(h.map(x=>x.savedAt?.slice(0,10))).size;
  $('historySets').textContent=h.reduce((a,x)=>a+(x.sets||0),0);
}

function renderParts(){
  $('bodyParts').innerHTML=Object.keys(EXERCISES).map(p=>`<button class="chip ${state.parts.includes(p)?'active':''}" data-part="${p}">${p}</button>`).join('');
  document.querySelectorAll('[data-part]').forEach(b=>b.onclick=()=>{
    const p=b.dataset.part;
    state.parts=state.parts.includes(p)?state.parts.filter(x=>x!==p):state.parts.length<3?[...state.parts,p]:state.parts;
    renderParts();renderExercises();
  });
}
function renderExercises(){
  state.exerciseOptions=state.parts.flatMap(p=>EXERCISES[p].map(e=>({bodyPart:p,name:e[0],equipment:e[1],family:e[2]})));
  $('exerciseSelect').innerHTML=state.exerciseOptions.length?state.exerciseOptions.map((e,i)=>`<option value="${i}">${e.bodyPart} · ${e.name}</option>`).join(''):'<option>Select category</option>';
  selectExercise();
}
function selectExercise(){
  const e=state.exerciseOptions[$('exerciseSelect').selectedIndex]||null;
  state.exercise=e;state.sets=[];state.draft=null;
  $('currentExercise').textContent=e?e.name:'Select an exercise';
  $('exerciseMeta').textContent=e?`Family: ${e.family.replaceAll('_',' ')} · ${e.equipment}`:'';
  const cardio=isCardio(e?.family);
  $('cardioControls').classList.toggle('hidden',!cardio);
  $('strengthControls').classList.toggle('hidden',!!cardio);
  $('startSet').disabled=!e;$('finishExercise').disabled=!e;$('setsTable').innerHTML='';
  $('timer').textContent='00:00';
}
function tick(){if(!state.setStart)return;$('timer').textContent=new Date((Date.now()-state.setStart)).toISOString().substring(14,19)}
function startSet(){state.setStart=Date.now();$('startSet').disabled=true;$('finishSet').disabled=false;$('addSet').disabled=true;state.timer=setInterval(tick,250)}
function finishSet(){
  if(!state.setStart)return;
  const end=Date.now(),active=(end-state.setStart)/1000,rest=state.sets.length?(state.setStart-state.sets.at(-1).end)/1000:0;
  clearInterval(state.timer);state.setStart=null;
  state.draft={start:end-active*1000,end,active,rest};
  $('finishSet').disabled=true;$('startSet').disabled=false;$('addSet').disabled=false;$('timer').textContent='00:00';
}
function addSet(){
  if(!state.draft)return;
  const cardio=isCardio(state.exercise.family);
  const reps=cardio?1:Number($('reps').value);
  if(!cardio&&!reps)return;
  // IMPORTANT: load is captured independently for THIS set.
  // The user can change the load before every subsequent set.
  const load=cardio?0:Number($('load').value||0);
  state.sets.push({...state.draft,reps,load});
  state.draft=null;
  $('reps').value='';
  $('addSet').disabled=true;
  // Keep the last load in the input as a convenient default for the next set.
  // The user is free to increase/decrease it before starting the next set.
  renderSets();
}
function renderSets(){
  $('setsTable').innerHTML=state.sets.map((s,i)=>{
    const loadText=isCardio(state.exercise.family)?'—':`${fmt(s.load)} kg`;
    const repsText=isCardio(state.exercise.family)?`${fmt(s.active/60)} min`:`${s.reps} reps`;
    return `<div class="set-item">
      <span><strong>Set ${i+1}</strong><small>${loadText}</small></span>
      <span>${repsText}</span>
      <span>${fmt(s.active)}s work</span>
      <span>${fmt(s.rest)}s rest</span>
    </div>`;
  }).join('');
}
function epley(load,reps){return load>0&&reps>0?load*(1+reps/30):0}
function profile(){
  return {age:+$('age').value||0,sex:$('sex').value,height:+$('height').value||0,weight:+$('bodyWeight').value||0,bodyFat:$('bodyFat').value===''?null:+$('bodyFat').value,consent:$('consent').checked};
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
async function saveEvent(e,r){
  const p=profile();
  const payload={consent:p.consent,sessionId,workoutId:state.workoutId,modelVersion:MODEL_VERSION,bodyWeightKg:p.weight,heightCm:p.height,ageYears:p.age,sex:p.sex,bodyFatPercent:p.bodyFat,
    bodyPart:e.bodyPart,exercise:e.name,equipment:e.equipment,exerciseFamily:e.family,loadKg:Math.max(...state.sets.map(s=>s.load),0),
    reps:state.sets.reduce((a,s)=>a+s.reps,0),sets:state.sets.length,activeSeconds:r.active,restSeconds:r.rest,totalVolumeKg:r.volume,
    estimatedNetKcal:r.net,estimateLowKcal:r.low,estimateHighKcal:r.high,publishedAnchorKcal:r.anchor,savedAt:new Date().toISOString()};
  const history=getHistory();history.push(payload);localStorage.setItem('repfuel_history',JSON.stringify(history.slice(-500)));
  localStorage.setItem('repfuel_last_workout',JSON.stringify(payload));renderHistory();
  if(!p.consent){$('saveStatus').textContent='Saved on this device';return}
  try{const x=await fetch('/api/workout-event',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});$('saveStatus').textContent=x.ok?'Anonymous data saved':'Saved locally'}catch{$('saveStatus').textContent='Saved locally'}
}
function finishExercise(){
  if(!state.exercise||!state.sets.length)return;
  const r=estimate(state.exercise,state.sets);
  state.exercises.push({exercise:state.exercise,sets:[...state.sets],result:r});
  saveEvent(state.exercise,r);
  state.sets=[];state.draft=null;renderSets();$('finishExercise').disabled=true;renderSummary();
}
function finishWorkout(){
  if(state.setStart) finishSet();
  if(state.draft) addSet();
  if(state.exercise && state.sets.length) finishExercise();
  if(!state.exercises.length){alert('Add at least one exercise before finishing.');return}
  state.finished=true;renderSummary();
  $('workoutCard').classList.add('hidden');$('summaryCard').classList.remove('hidden');$('historyCard').classList.remove('hidden');
  $('workoutComplete').classList.remove('hidden');$('workoutComplete').scrollIntoView({behavior:'smooth',block:'start'});
}
function startAnotherWorkout(){location.reload()}
function renderSummary(){
  const low=state.exercises.reduce((a,x)=>a+x.result.low,0),high=state.exercises.reduce((a,x)=>a+x.result.high,0);
  const vol=state.exercises.reduce((a,x)=>a+x.result.volume,0),active=state.exercises.reduce((a,x)=>a+x.result.active,0);
  $('sumKcal').textContent=`${Math.round(low)}–${Math.round(high)}`;
  $('sumVolume').textContent=`${Math.round(vol).toLocaleString()} kg`;
  $('sumActive').textContent=`${fmt(active/60)} min`;
  $('sumTime').textContent=`${fmt((Date.now()-state.workoutStart)/60000)} min`;
  $('summaryExercises').innerHTML=state.exercises.map(x=>`<div class="exercise-summary"><strong>${x.exercise.name}</strong><div class="muted">${x.sets.length} sets · ${x.sets.reduce((a,s)=>a+s.reps,0)} reps · ${Math.round(x.result.net)} kcal · MET ${fmt(x.result.met)}</div></div>`).join('');
  $('completeSub').textContent=`${state.exercises.length} exercise${state.exercises.length===1?'':'s'} recorded.`;
}
function loadProfile(){
  const p=JSON.parse(localStorage.getItem('repfuel_profile')||'null');if(!p)return;
  $('age').value=p.age||'';$('sex').value=p.sex||'male';$('height').value=p.height||'';$('bodyWeight').value=p.weight||'';$('bodyFat').value=p.bodyFat??'';$('consent').checked=!!p.consent;
  $('profileCard').classList.add('hidden');$('workoutCard').classList.remove('hidden');state.workoutStart=Date.now();renderParts();renderHistory();renderHistory();
}
$('saveProfile').onclick=()=>{const p=profile();if(!p.age||!p.height||!p.weight){alert('Please enter age, height and weight.');return}localStorage.setItem('repfuel_profile',JSON.stringify(p));$('profileCard').classList.add('hidden');$('workoutCard').classList.remove('hidden');state.workoutStart=Date.now();renderParts();renderHistory()};
$('exerciseSelect').onchange=selectExercise;
$('startSet').onclick=startSet;$('finishSet').onclick=finishSet;$('addSet').onclick=addSet;$('finishExercise').onclick=finishExercise;
$('finishWorkout').onclick=finishWorkout;$('startAnother').onclick=startAnotherWorkout;
$('clearHistory').onclick=()=>{if(confirm('Clear workout history from this device?')){localStorage.removeItem('repfuel_history');renderHistory()}};
$('editProfile').onclick=()=>{$('workoutCard').classList.add('hidden');$('historyCard').classList.add('hidden');$('profileCard').classList.remove('hidden')};
$('newWorkout').onclick=()=>location.reload();loadProfile();
