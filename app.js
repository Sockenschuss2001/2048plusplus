const $=s=>document.querySelector(s),K="2048pp03_";let id=0,lock=0,H=[],S;
const load=(k,d)=>{try{return JSON.parse(localStorage.getItem(K+k))??d}catch{return d}},save=(k,v)=>localStorage.setItem(K+k,JSON.stringify(v));
let CP=load("cp",{}),RUNS=load("runs",[]),REC=load("records",{bestScore:0,bestTile:0,fastest:{},fewest:{}}),PREF=localStorage.getItem("2048pp_preview")||"off";let THEME=localStorage.getItem("2048pp_theme")||"deepblue";
let SLIDE=+(localStorage.getItem("2048pp_slide")||140);
let NEXTLIMIT=+(localStorage.getItem("2048pp_nextlimit")||0);
let AUTODELAY=+(localStorage.getItem("2048pp_autospeed")||100);
let AUTODEPTH=+(localStorage.getItem("2048pp_autodepth")||3);
let AUTOSTRATEGY=localStorage.getItem("2048pp_autostrategy")||"balanced";
let AUTO_RUNNING=false,AUTO_TIMER=0;
window.AUTO_RUNNING=false;
const clone=x=>JSON.parse(JSON.stringify(x));
const ACTIVE_KEY=K+"active",ACTIVE_TTL=48*60*60*1000;
let BACKGROUND_AT=0,RESUME_WAS_PAUSED=false;

function activeElapsed(){
  if(!S)return 0;
  return Math.max(0,(PAUSED&&PAUSE_AT?PAUSE_AT:Date.now())-S.start);
}
function saveActive(){
  if(!S||S.ended||S.runSaved){localStorage.removeItem(ACTIVE_KEY);return}
  try{
    localStorage.setItem(ACTIVE_KEY,JSON.stringify({
      savedAt:Date.now(),
      elapsed:activeElapsed(),
      state:clone(S),
      history:clone(H)
    }));
  }catch(e){}
}
function loadActive(){
  try{
    let a=JSON.parse(localStorage.getItem(ACTIVE_KEY)||"null");
    if(!a||!a.state||!a.savedAt)return null;
    if(Date.now()-a.savedAt>ACTIVE_TTL){localStorage.removeItem(ACTIVE_KEY);return null}
    if(a.state.ended||a.state.runSaved)return null;
    return a;
  }catch(e){return null}
}
function syncIdFromState(){
  id=Math.max(id,...S.b.flat().map(x=>+x.id||0),...H.flatMap(h=>h.b?h.b.flat().map(x=>+x.id||0):[0]));
}
function showResumePrompt(wasPaused=false){
  RESUME_WAS_PAUSED=wasPaused;
  if(!PAUSED)setPaused(true);
  $("#resumeInfo").textContent=`Kachel ${maxTile()} · Score ${S.score} · ${S.moves} Züge · ${fmt(activeElapsed())}`;
  $("#resumePrompt").classList.remove("hidden");
}
function hideResumePrompt(){
  $("#resumePrompt").classList.add("hidden");
}function rnd(s){s.x=(Math.imul(1664525,s.x)+1013904223)>>>0;return s.x/4294967296}
function blank(){return Array.from({length:4},()=>Array.from({length:4},()=>({v:0,id:0})))}function empty(b){let a=[];for(let r=0;r<4;r++)for(let c=0;c<4;c++)if(!b[r][c].v)a.push([r,c]);return a}
function spawn(s){let e=empty(s.b);if(!e.length)return;let p=e[Math.floor(rnd(s.rng)*e.length)];s.b[p[0]][p[1]]={v:rnd(s.rng)<.9?2:4,id:++id}}
function fresh(){let s={b:blank(),score:0,moves:0,start:Date.now(),startTile:2,marks:{},undoCredits:0,ended:false,runSaved:false,win2048Shown:false,rng:{x:(Date.now()^Math.random()*4294967296)>>>0}};spawn(s);spawn(s);return s}
function move(s,d){let n=clone(s),b=blank(),gain=0,anim=[];for(let i=0;i<4;i++){let a=[];for(let j=0;j<4;j++){let r=d=="L"||d=="R"?i:(d=="U"?j:3-j),c=d=="U"||d=="D"?i:(d=="L"?j:3-j),q=s.b[r][c];if(q.v)a.push({v:q.v,id:q.id})}let z=[];for(let k=0;k<a.length;k++){if(a[k+1]&&a[k].v==a[k+1].v){z.push({v:a[k].v*2,id:a[k].id,parts:[a[k],a[k+1]]});gain+=a[k].v*2;k++}else z.push(a[k])}for(let j=0;j<z.length;j++){let r=d=="L"||d=="R"?i:(d=="U"?j:3-j),c=d=="U"||d=="D"?i:(d=="L"?j:3-j),q=z[j];b[r][c]={v:q.v,id:q.id};for(let p of(q.parts||[q]))anim.push({id:p.id,r,c,target:q.v,merge:!!q.parts})}}if(JSON.stringify(b.map(x=>x.map(y=>y.v)))==JSON.stringify(s.b.map(x=>x.map(y=>y.v))))return null;n.b=b;n.score+=gain;n.moves++;return{n,anim,gain}}
function geom(){let cells=[...document.querySelectorAll(".cell")],base=$("#tiles").getBoundingClientRect();return cells.map(c=>{let r=c.getBoundingClientRect();return{x:r.left-base.left,y:r.top-base.top,w:r.width,h:r.height}})}
function place(e,r,c,g){let p=g[r*4+c];e.style.left=p.x+"px";e.style.top=p.y+"px";e.style.width=p.w+"px";e.style.height=p.h+"px"}
function renderBoard(){saveActive();let L=$("#tiles"),g=geom();L.innerHTML="";for(let r=0;r<4;r++)for(let c=0;c<4;c++){let q=S.b[r][c];if(!q.v)continue;let e=document.createElement("div");e.dataset.id=q.id;e.className=`tile ${q.v<=16384?"v"+q.v:"high"}`;e.textContent=q.v;place(e,r,c,g);L.appendChild(e)}stats()}
function canMove(){for(let d of["L","R","U","D"])if(move(S,d))return true;return false}
function scorePop(gain){if(!gain)return;let box=$("#score").parentElement,e=document.createElement("div");e.className="score-pop";e.textContent="+"+gain;box.appendChild(e);setTimeout(()=>e.remove(),700)}
function showGameOver(){if(S.ended)return;stopAuto(true);S.ended=true;localStorage.removeItem(ACTIVE_KEY);finishRun();$("#gameover-score").textContent=`Score ${S.score} · ${S.moves} Züge`;$("#gameover").classList.remove("hidden");stats()}
function animate(q){let old=new Map([...$("#tiles").children].map(x=>[+x.dataset.id,x])),g=geom();for(let m of q.anim){let e=old.get(m.id);if(!e)continue;if(m.merge){e.textContent=m.target;e.className=`tile ${m.target<=16384?"v"+m.target:"high"}`}place(e,m.r,m.c,g)}setTimeout(()=>{S=q.n;spawn(S);milestones();renderBoard();scorePop(q.gain);lock=0;if(!canMove())showGameOver();else autoSchedule()},SLIDE)}
function maxTile(){return Math.max(...S.b.flat().map(x=>x.v))}
function milestones(){let m=maxTile();for(let p=128;p<=m;p*=2)if(!S.marks[p]){let x={t:Date.now()-S.start,m:S.moves};S.marks[p]=x;S.undoCredits=(S.undoCredits||0)+1;CP[p]=clone(S);if(!REC.fastest[p]||x.t<REC.fastest[p])REC.fastest[p]=x.t;if(!REC.fewest[p]||x.m<REC.fewest[p])REC.fewest[p]=x.m;REC.bestTile=Math.max(REC.bestTile,p);save("cp",CP);save("records",REC)}
if(S.marks&&S.marks[2048]&&!S.win2048Shown){S.win2048Shown=true;saveActive();setTimeout(show2048Win,Math.max(80,SLIDE||90))}}
function go(d){if(lock)return;let q=move(S,d);if(!q)return;lock=1;H.push(clone(S));if(H.length>200)H.shift();animate(q)}
window.undo=()=>{if(lock||!H.length||(S.undoCredits||0)<=0)return;let credits=S.undoCredits-1,marks=S.marks,ended=S.ended;S=H.pop();S.undoCredits=credits;S.marks=marks;S.ended=false;$("#gameover").classList.add("hidden");renderBoard()};window.newGame=()=>{stopAuto(true);hideResumePrompt();localStorage.removeItem(ACTIVE_KEY);if(PAUSED)setPaused(false);MENU_PAUSED=false;if(S&&S.moves>0&&!S.runSaved)finishRun();S=fresh();H=[];$("#gameover").classList.add("hidden");$("#panel").classList.add("hidden");renderBoard()}
function fmt(x){let s=x/1000|0,h=s/3600|0,m=(s%3600)/60|0,ss=s%60;return(h?h+":":"")+String(m).padStart(2,"0")+":"+String(ss).padStart(2,"0")}
function preview(){let mode=$("#preview").value,free=empty(S.b).length;if(!NEXTLIMIT||free>NEXTLIMIT||mode=="off")return"";if(mode=="value"){let q=clone(S.rng);return"Nächster Wert: "+(rnd(q)<.9?2:4)}let out=[],sy={L:"←",R:"→",U:"↑",D:"↓"};for(let d of["L","R","U","D"]){let z=move(S,d);if(!z)continue;let e=empty(z.n.b),q=clone(z.n.rng),p=e[Math.floor(rnd(q)*e.length)],v=rnd(q)<.9?2:4;out.push(`${sy[d]} ${v} @ ${String.fromCharCode(65+p[1])}${p[0]+1}`)}return out.join(" · ")}
function stats(){REC.bestScore=Math.max(REC.bestScore,S.score);REC.bestTile=Math.max(REC.bestTile,maxTile());save("records",REC);$("#score").textContent=S.score;$("#best").textContent=REC.bestScore;$("#moves").textContent=S.moves;let ub=$("#undoBtn"),uc=S.undoCredits||0;$("#undoCount").textContent=uc;ub.disabled=!H.length||uc<=0;$("#free").textContent=empty(S.b).length;let mx=maxTile(),g=128;while(g<=mx)g*=2;$("#goal").textContent=g;
let freeNow=empty(S.b).length, nextEnabled=NEXTLIMIT>0&&freeNow<=NEXTLIMIT;
$("#nextCard").classList.toggle("hidden",NEXTLIMIT===0);
$("#preview").disabled=!nextEnabled;
$("#next").textContent=nextEnabled?preview():"";renderMilestones();renderHistory();renderCoach();let a=Object.entries(S.marks);$("#marks").innerHTML=a.length?a.map(([k,v])=>`<div class=r><b>${k}</b><span>${fmt(v.t)} · Zug ${v.m}</span></div>`).join(""):"Noch keine.";let c=Object.keys(CP).map(Number).sort((a,b)=>a-b);$("#cps").innerHTML=c.length?c.map(k=>`<div class=r><b>${k}</b><button onclick=startCP(${k})>Ab hier</button></div>`).join(""):"Noch keine.";$("#records").innerHTML=`<div class=r><b>Höchste Kachel</b><span>${REC.bestTile||"-"}</span></div><div class=r><b>Höchster Score</b><span>${REC.bestScore}</span></div>`;$("#runs").innerHTML=RUNS.length?RUNS.slice(0,12).map(r=>`<div class=r><b>${r.tile} · ${r.score}</b><span>${fmt(r.time)} · ${r.moves} Züge</span></div>`).join(""):"Noch keine abgeschlossenen Runs."}
window.startCP=k=>{stopAuto(true);if(PAUSED)setPaused(false);if(S&&S.moves>0&&!S.runSaved)finishRun();S=clone(CP[k]);S.start=Date.now();S.startTile=+k;S.moves=0;S.score=0;S.marks={};S.undoCredits=0;S.ended=false;S.runSaved=false;S.win2048Shown=(+k>=2048);H=[];$("#gameover").classList.add("hidden");renderBoard()};
$("#gameover-new").onclick=()=>newGame();document.addEventListener("selectstart",e=>{if(!e.target.closest("input,textarea"))e.preventDefault()});document.addEventListener("contextmenu",e=>{if(e.target.closest("#game,header,nav,.stats,.next"))e.preventDefault()});


let COACH=localStorage.getItem("2048pp_coach")==="1";
const DIRLABEL={L:"←",R:"→",U:"↑",D:"↓"};

function cornerBonus(b){
  let m=0;for(let r=0;r<4;r++)for(let c=0;c<4;c++)m=Math.max(m,b[r][c].v||0);
  let corners=[b[0][0].v,b[0][3].v,b[3][0].v,b[3][3].v];
  return corners.includes(m)?Math.log2(Math.max(2,m))*7:0;
}
function mergePotential(b){
  let n=0;
  for(let r=0;r<4;r++)for(let c=0;c<4;c++){
    let v=b[r][c].v;if(!v)continue;
    if(c<3&&b[r][c+1].v===v)n++;
    if(r<3&&b[r+1][c].v===v)n++;
  } return n;
}
function smoothPenalty(b){
  let p=0;
  for(let r=0;r<4;r++)for(let c=0;c<4;c++){
    let v=b[r][c].v;if(!v)continue;let a=Math.log2(v);
    if(c<3&&b[r][c+1].v)p+=Math.abs(a-Math.log2(b[r][c+1].v));
    if(r<3&&b[r+1][c].v)p+=Math.abs(a-Math.log2(b[r+1][c].v));
  } return p;
}
function monotonicity(b){
  let score=0;
  for(let r=0;r<4;r++){
    let a=b[r].map(x=>x.v?Math.log2(x.v):0),inc=0,dec=0;
    for(let i=0;i<3;i++){if(a[i]>=a[i+1])dec+=a[i]-a[i+1];else inc+=a[i+1]-a[i]}
    score+=Math.max(inc,dec);
  }
  for(let c=0;c<4;c++){
    let a=[0,1,2,3].map(r=>b[r][c].v?Math.log2(b[r][c].v):0),inc=0,dec=0;
    for(let i=0;i<3;i++){if(a[i]>=a[i+1])dec+=a[i]-a[i+1];else inc+=a[i+1]-a[i]}
    score+=Math.max(inc,dec);
  } return score;
}
function boardScore(state,gain=0,strategy=AUTOSTRATEGY){
  let b=state.b,free=empty(b).length,merges=mergePotential(b),smooth=smoothPenalty(b),mono=monotonicity(b),corner=cornerBonus(b);
  let score;
  switch(strategy){
    case "survival":
      score=free*52+merges*10+corner*.85+mono*1.45-smooth*1.65+(gain||0)*.018;
      break;
    case "corner":
      score=free*27+merges*10+corner*1.75+mono*3.15-smooth*2.55+(gain||0)*.022;
      break;
    case "score":
      score=free*22+merges*20+corner*.75+mono*1.25-smooth*1.55+(gain||0)*.085;
      break;
    case "fast":
    case "balanced":
    default:
      score=free*32+merges*13+corner+mono*1.8-smooth*2.2+(gain||0)*.035;
  }
  return {score,free,merges};
}
function coachEval(depth=1,state=S){
  let out=[];
  for(let d of ["L","D","R","U"]){
    let q=move(state,d);if(!q)continue;
    let h=boardScore(q.n,q.gain);
    out.push({d,score:h.score,free:h.free,merges:h.merges,gain:q.gain||0});
  }
  return out.sort((a,b)=>b.score-a.score);
}

/* Expectimax: MAX = unser Zug, CHANCE = zufällige neue 2/4-Kachel.
   Auf dem iPhone wird mit Zeitbudget + deterministischer Stichprobe gerechnet,
   damit auch Tiefe 4 die Oberfläche nicht minutenlang blockiert. */
function boardKey(state){return state.b.flat().map(x=>x.v||0).join(",")}
function chanceSample(cells,max=6){
  if(cells.length<=max)return cells;
  let out=[],used=new Set();
  for(let i=0;i<max;i++){
    let n=Math.round(i*(cells.length-1)/(max-1));
    if(!used.has(n)){used.add(n);out.push(cells[n])}
  }
  return out;
}
function exLeaf(state){return boardScore(state).score}
function exMax(state,depth,ctx){
  if(depth<=0||performance.now()>=ctx.deadline)return exLeaf(state);
  let key="M"+depth+"|"+boardKey(state),hit=ctx.cache.get(key);
  if(hit!==undefined)return hit;
  let best=-Infinity,valid=false;
  for(let d of ["L","D","R","U"]){
    let q=move(state,d);if(!q)continue;valid=true;
    let v=(q.gain||0)*.035+exChance(q.n,depth-1,ctx);
    if(v>best)best=v;
    if(performance.now()>=ctx.deadline)break;
  }
  if(!valid)best=exLeaf(state)-5000;
  ctx.cache.set(key,best);return best;
}
function exChance(state,depth,ctx){
  if(performance.now()>=ctx.deadline)return exLeaf(state);
  let cells=empty(state.b);
  if(!cells.length)return exMax(state,depth,ctx);
  let key="C"+depth+"|"+boardKey(state),hit=ctx.cache.get(key);
  if(hit!==undefined)return hit;
  let sample=chanceSample(cells,6),sum=0;
  for(let [r,c] of sample){
    let s2=clone(state);s2.b[r][c]={v:2,id:0};
    let s4=clone(state);s4.b[r][c]={v:4,id:0};
    sum+=.9*exMax(s2,depth,ctx)+.1*exMax(s4,depth,ctx);
    if(performance.now()>=ctx.deadline)break;
  }
  let v=sum/Math.max(1,sample.length);
  ctx.cache.set(key,v);return v;
}
function expectimaxEval(maxDepth,state=S){
  if(AUTOSTRATEGY==="fast"){
    let a=coachEval(1,state);a.depth=1;return a;
  }
  let budget=AUTODELAY<=20?42:AUTODELAY<=100?70:AUTODELAY<=250?100:140;
  let deadline=performance.now()+budget,best=coachEval(1,state),completed=0;
  for(let depth=1;depth<=maxDepth;depth++){
    let ctx={deadline,cache:new Map()},out=[];
    for(let d of ["L","D","R","U"]){
      let q=move(state,d);if(!q)continue;
      let h=boardScore(q.n,q.gain);
      let score=(q.gain||0)*.035+exChance(q.n,depth-1,ctx);
      out.push({d,score,free:h.free,merges:h.merges,gain:q.gain||0});
      if(performance.now()>=deadline)break;
    }
    if(performance.now()>=deadline||!out.length)break;
    best=out.sort((a,b)=>b.score-a.score);completed=depth;
  }
  best.depth=completed||1;
  return best;
}

function setAutoUi(){
  let b=$("#autoBtn");if(!b)return;
  b.classList.toggle("active",AUTO_RUNNING);
  b.textContent=AUTO_RUNNING?`AUTO ${AUTOSTRATEGY==="fast"?"1":AUTODEPTH}× Ⅱ`:"AUTO";
}
function stopAuto(update=true){
  AUTO_RUNNING=false;window.AUTO_RUNNING=false;
  clearTimeout(AUTO_TIMER);AUTO_TIMER=0;
  if(update)setAutoUi();
}
function autoSchedule(){
  clearTimeout(AUTO_TIMER);AUTO_TIMER=0;
  if(!AUTO_RUNNING||PAUSED||lock||S.ended)return;
  AUTO_TIMER=setTimeout(autoStep,AUTODELAY);
}
function autoStep(){
  AUTO_TIMER=0;
  if(!AUTO_RUNNING||PAUSED||lock||S.ended)return;
  let a=expectimaxEval(AUTODEPTH);
  if(!a.length){showGameOver();return}
  S.autoUsed=true;S.autoDepth=AUTOSTRATEGY==="fast"?1:AUTODEPTH;S.autoActualDepth=a.depth||1;
  S.autoSolver=AUTOSTRATEGY==="fast"?"Heuristik":"Expectimax";S.autoStrategy=AUTOSTRATEGY;
  S.autoStrategiesUsed=S.autoStrategiesUsed||[];
  if(!S.autoStrategiesUsed.includes(AUTOSTRATEGY))S.autoStrategiesUsed.push(AUTOSTRATEGY);
  go(a[0].d);
}
function toggleAuto(){
  if(AUTO_RUNNING){stopAuto();return}
  if(S.ended)return;
  AUTO_RUNNING=true;window.AUTO_RUNNING=true;S.autoUsed=true;
  setAutoUi();saveActive();autoSchedule();
}

function renderCoach(){
  let card=$("#coachCard"),btn=$("#coachBtn");if(!card||!btn)return;
  btn.classList.toggle("active",COACH);card.classList.toggle("hidden",!COACH);
  if(!COACH)return;
  let a=coachEval(),box=$("#coachMoves");
  if(!a.length){box.innerHTML='<span class="coach-bad">Keine Züge</span>';$("#coachWhy").textContent="Game over";return}
  let hi=a[0].score,lo=a[a.length-1].score,span=Math.max(1,hi-lo);
  box.innerHTML=a.map((x,i)=>{
    let rel=(x.score-lo)/span,label=i===0?"Sehr gut":rel>.58?"Gut":rel>.25?"Riskant":"Schwach";
    return `<div class="coach-move ${i===0?"best":""}"><b>${DIRLABEL[x.d]}</b><span>${label}</span></div>`;
  }).join("");
  let x=a[0];$("#coachWhy").textContent=`Empfehlung ${DIRLABEL[x.d]} · frei ${x.free} · Merge-Chancen ${x.merges}${x.gain?" · +"+x.gain:""}`;
}
function fmtRunTime(ms){
  let sec=Math.max(0,Math.floor((ms||0)/1000)),h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;
  return h?`${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`:`${m}:${String(s).padStart(2,"0")}`;
}
function fmtRunDate(ts){
  if(!ts)return "—";
  let d=new Date(ts); return d.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"})+" "+d.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"});
}
const STRATEGY_NAMES={
  balanced:"Ausgewogen",survival:"Überleben",corner:"Ecke / Ordnung",
  score:"Punkte / Merge",fast:"Schnell",mixed:"Gemischt",legacy:"Früheres AUTO"
};
function runStrategyKey(r){
  let used=Array.isArray(r.autoStrategiesUsed)?[...new Set(r.autoStrategiesUsed.filter(Boolean))]:[];
  if(used.length>1)return "mixed";
  if(used.length===1)return used[0];
  return r.autoStrategy||"legacy";
}
function median(vals){
  if(!vals.length)return 0;
  let a=[...vals].sort((x,y)=>x-y),m=Math.floor(a.length/2);
  return a.length%2?a[m]:Math.round((a[m-1]+a[m])/2);
}
function renderStrategyCompare(){
  let box=$("#strategyCompare");if(!box)return;
  let auto=(RUNS||[]).filter(r=>r.autoUsed);
  if(!auto.length){
    box.innerHTML='<div class="history-empty">Noch keine abgeschlossenen AUTO-Läufe zum Vergleichen.</div>';
    return;
  }
  let order=["balanced","survival","corner","score","fast","mixed","legacy"];
  let groups={};
  for(let r of auto){let k=runStrategyKey(r);(groups[k]||(groups[k]=[])).push(r)}
  let rows=order.filter(k=>groups[k]?.length).map(k=>{
    let a=groups[k],n=a.length;
    let avgScore=Math.round(a.reduce((x,r)=>x+(r.score||0),0)/n);
    let avgMoves=Math.round(a.reduce((x,r)=>x+(r.moves||0),0)/n);
    let bestScore=Math.max(...a.map(r=>r.score||0));
    let bestTile=Math.max(...a.map(r=>r.tile||2));
    let medTile=median(a.map(r=>r.tile||2));
    let hit2048=a.filter(r=>(r.tile||0)>=2048||(r.milestones||[]).includes(2048)).length;
    let rate=Math.round(hit2048/n*100);
    return `<div class="strategy-row ${k==="mixed"||k==="legacy"?"secondary":""}">
      <div class="strategy-name"><b>${STRATEGY_NAMES[k]||k}</b><small>${n} ${n===1?"Lauf":"Läufe"}</small></div>
      <span><small>2048</small><b>${rate}%</b></span>
      <span><small>Best</small><b>${bestTile}</b></span>
      <span><small>Median</small><b>${medTile}</b></span>
      <span><small>Ø Score</small><b>${avgScore}</b></span>
      <span><small>Bestscore</small><b>${bestScore}</b></span>
      <span><small>Ø Züge</small><b>${avgMoves}</b></span>
    </div>`;
  }).join("");
  box.innerHTML=`<div class="strategy-head"><span>Strategie</span><span>2048</span><span>Best</span><span>Median</span><span>Ø Score</span><span>Bestscore</span><span>Ø Züge</span></div>${rows}`;
}
function renderHistory(){
  let box=$("#runHistory"); if(!box)return;
  let runs=RUNS||[], best=runs.reduce((a,r)=>Math.max(a,r.score||0),0), mx=runs.reduce((a,r)=>Math.max(a,r.tile||0),0);
  $("#runCount").textContent=runs.length; $("#historyBest").textContent=best; $("#historyMax").textContent=mx||"—";
  renderStrategyCompare();
  box.innerHTML=runs.length?runs.slice(0,20).map((r,i)=>`<div class="run-row">
    <div><b>${r.tile||2}</b><small>${fmtRunDate(r.ended||r.date||r.ts)}</small></div>
    <span>Score <b>${r.score||0}</b></span><span>${r.moves||0} Z.</span><span>${fmtRunTime(r.time)}</span>
    <small>${r.autoUsed?("AUTO "+(r.autoDepth||1)+"× · "+(STRATEGY_NAMES[runStrategyKey(r)]||runStrategyKey(r))+((r.startTile||2)>2?" · Checkpoint "+r.startTile:"")) : ((r.startTile||2)>2?"Checkpoint "+r.startTile:"Normal")}</small>
  </div>`).join(""):`<div class="history-empty">Noch keine abgeschlossenen Spiele.</div>`;
}
function finishRun(){
  if(S.runSaved)return;
  S.runSaved=true;
  RUNS.unshift({ended:Date.now(),tile:maxTile(),score:S.score,moves:S.moves,time:Date.now()-S.start,startTile:S.startTile||2,autoUsed:!!S.autoUsed,autoDepth:S.autoDepth||0,autoActualDepth:S.autoActualDepth||0,autoSolver:S.autoSolver||"",autoStrategy:S.autoStrategy||"",autoStrategiesUsed:[...(S.autoStrategiesUsed||[])],milestones:Object.keys(S.marks||{}).map(Number)});
  RUNS=RUNS.slice(0,100); save("runs",RUNS); renderHistory();
}
function fmtMilestoneTime(ms){
  if(ms==null)return "—";
  let sec=Math.floor(ms/1000),m=Math.floor(sec/60),s=sec%60;
  return `${m}:${String(s).padStart(2,"0")}`;
}
function renderMilestones(){
  let box=$("#milestoneTable"); if(!box)return;
  let max=Math.max(2048,maxTile(),...Object.keys(S.marks||{}).map(Number),...Object.keys(REC.fastest||{}).map(Number));
  let vals=[]; for(let v=128;v<=Math.max(max,128);v*=2) vals.push(v);
  $("#milestoneCount").textContent=Object.keys(S.marks||{}).length;
  $("#milestoneUndo").textContent=S.undoCredits||0;
  box.innerHTML=vals.map(v=>{
    let hit=S.marks&&S.marks[v],ft=Number(REC.fastest&&REC.fastest[v]),fm=Number(REC.fewest&&REC.fewest[v]);if(!Number.isFinite(ft)||ft<1000)ft=null;if(!Number.isFinite(fm)||fm<2)fm=null;
    return `<div class="ms-row ${hit?"hit":""}">
      <b>${v}</b><span>${hit?"✓":"○"}</span>
      <span>${hit?fmtMilestoneTime(hit.t):"—"}</span>
      <span>${hit?hit.m+" Z.":"—"}</span>
      <small>Best ${ft!=null?fmtMilestoneTime(ft):"—"} · ${fm!=null?fm+" Z.":"—"}</small>
    </div>`;
  }).join("");
}
let PAUSED=false,PAUSE_AT=0,MENU_PAUSED=false;
function setPaused(v){
  if(v===PAUSED)return;
  if(v){PAUSED=true;PAUSE_AT=Date.now()}
  else{if(PAUSE_AT)S.start+=Date.now()-PAUSE_AT;PAUSED=false;PAUSE_AT=0}
  $("#pauseOverlay").classList.toggle("hidden",!PAUSED||!$("#panel").classList.contains("hidden"));
  $("#pauseBtn").classList.toggle("active",PAUSED);
  $("#pauseBtn").textContent=PAUSED?"▶":"Ⅱ";
}
$("#pauseBtn").onclick=()=>{setPaused(!PAUSED);if(!PAUSED)autoSchedule()};
$("#pauseOverlay").onclick=()=>{setPaused(false);autoSchedule()};
$("#resetAll").onclick=()=>{if(confirm("Wirklich ALLES zurücksetzen?\n\nSpielhistorie, Rekorde, Checkpoints, Spielstand und Einstellungen werden gelöscht.")&&confirm("Letzte Bestätigung: Alle lokalen 2048++-Daten endgültig löschen?")){Object.keys(localStorage).filter(k=>k.startsWith("2048pp")).forEach(k=>localStorage.removeItem(k));location.reload()}};
$("#clearHistory").onclick=()=>{if(confirm("Spielhistorie wirklich löschen?")){RUNS=[];save("runs",RUNS);renderHistory()}};
$("#coachBtn").onclick=()=>{COACH=!COACH;localStorage.setItem("2048pp_coach",COACH?"1":"0");renderCoach()};
$("#autoBtn").onclick=toggleAuto;
$("#preview").value=["off","value","full"].includes(PREF)?PREF:"off";
$("#slideSpeed").value=String([50,90,140,220].includes(SLIDE)?SLIDE:140);
$("#autoSpeed").value=String([20,100,250,500].includes(AUTODELAY)?AUTODELAY:100);
$("#autoDepth").value=String([1,2,3,4].includes(AUTODEPTH)?AUTODEPTH:3);
$("#autoStrategy").value=["balanced","survival","corner","score","fast"].includes(AUTOSTRATEGY)?AUTOSTRATEGY:"balanced";
$("#nextLimit").value=String([0,4,6,8,16].includes(NEXTLIMIT)?NEXTLIMIT:0);
$("#slideSpeed").onchange=e=>{SLIDE=+e.target.value;localStorage.setItem("2048pp_slide",SLIDE)};
$("#autoSpeed").onchange=e=>{AUTODELAY=+e.target.value;localStorage.setItem("2048pp_autospeed",AUTODELAY);if(AUTO_RUNNING)autoSchedule()};
$("#autoDepth").onchange=e=>{AUTODEPTH=+e.target.value;localStorage.setItem("2048pp_autodepth",AUTODEPTH);setAutoUi();if(AUTO_RUNNING)autoSchedule()};
$("#autoStrategy").onchange=e=>{AUTOSTRATEGY=e.target.value;localStorage.setItem("2048pp_autostrategy",AUTOSTRATEGY);setAutoUi();if(AUTO_RUNNING)autoSchedule()};
$("#nextLimit").onchange=e=>{NEXTLIMIT=+e.target.value;localStorage.setItem("2048pp_nextlimit",NEXTLIMIT);stats()};$("#preview").onchange=e=>{localStorage.setItem("2048pp_preview",e.target.value);stats()};$("#menu").onclick=()=>{
  MENU_PAUSED=!PAUSED;
  if(MENU_PAUSED)setPaused(true);
  $("#panel").classList.remove("hidden");
  $("#pauseOverlay").classList.add("hidden");
  stats()
};
$("#close").onclick=()=>{
  $("#panel").classList.add("hidden");
  if(MENU_PAUSED){MENU_PAUSED=false;setPaused(false);autoSchedule()}
  else if(PAUSED)$("#pauseOverlay").classList.remove("hidden");
};
function autoIsRunning(){return !!(window.AUTO_RUNNING||window.AUTO_ACTIVE)}
function show2048Win(){if(autoIsRunning())return;if(!PAUSED)setPaused(true);$("#win2048").classList.remove("hidden")}
$("#winContinue").onclick=()=>{$("#win2048").classList.add("hidden");if(PAUSED)setPaused(false)};
$("#winNew").onclick=()=>{$("#win2048").classList.add("hidden");newGame()};
$("#resumeContinue").onclick=()=>{
  hideResumePrompt();
  if(!RESUME_WAS_PAUSED&&PAUSED)setPaused(false);
  else if(RESUME_WAS_PAUSED&&PAUSED)$("#pauseOverlay").classList.remove("hidden");
  RESUME_WAS_PAUSED=false;
  saveActive();
};
$("#resumeNew").onclick=()=>{
  hideResumePrompt();
  RESUME_WAS_PAUSED=false;
  newGame();
};

document.addEventListener("visibilitychange",()=>{
  if(document.hidden){
    BACKGROUND_AT=Date.now();
    saveActive();
  }else if(BACKGROUND_AT){
    let away=Date.now()-BACKGROUND_AT,wasPaused=PAUSED;
    if(!PAUSED)S.start+=away; // background time does not count as play time
    BACKGROUND_AT=0;
    saveActive();
    if(away>=30000&&S&&!S.ended&&S.moves>0)showResumePrompt(wasPaused);
  }
});
addEventListener("pagehide",saveActive);

function setTheme(t){THEME=["blue","original","deepblue"].includes(t)?t:"deepblue";document.body.dataset.theme=THEME;localStorage.setItem("2048pp_theme",THEME);document.querySelectorAll(".theme-btn").forEach(b=>b.classList.toggle("active",b.dataset.theme===THEME))}
setTheme(THEME);setAutoUi();document.querySelectorAll(".theme-btn").forEach(b=>b.onclick=()=>setTheme(b.dataset.theme));
for(let i=0;i<16;i++){let e=document.createElement("div");e.className="cell";$("#grid").appendChild(e)}let x,y,G=$("#game"),SWIPE_OK=false;
const swipeBlocked=t=>!!t.closest("button,select,input,textarea,#panel,.resume-prompt,.win2048");
document.addEventListener("touchstart",e=>{if(PAUSED||e.touches.length!==1||swipeBlocked(e.target)){SWIPE_OK=false;return}SWIPE_OK=true;x=e.touches[0].clientX;y=e.touches[0].clientY},{passive:true});
document.addEventListener("touchend",e=>{if(!SWIPE_OK||PAUSED){SWIPE_OK=false;return}SWIPE_OK=false;let X=e.changedTouches[0].clientX-x,Y=e.changedTouches[0].clientY-y;if(Math.max(Math.abs(X),Math.abs(Y))<22)return;go(Math.abs(X)>Math.abs(Y)?(X>0?"R":"L"):(Y>0?"D":"U"))},{passive:true});
let ACTIVE=loadActive();
if(ACTIVE&&ACTIVE.state&&ACTIVE.state.moves>0){
  S=ACTIVE.state;H=Array.isArray(ACTIVE.history)?ACTIVE.history:[];
  S.start=Date.now()-Math.max(0,+ACTIVE.elapsed||0);
  S.ended=false;S.runSaved=false;
  AUTO_RUNNING=false;window.AUTO_RUNNING=false;
  syncIdFromState();
  requestAnimationFrame(()=>{renderBoard();showResumePrompt(false)});
}else{
  S=fresh();H=[];requestAnimationFrame(renderBoard);
}addEventListener("resize",()=>requestAnimationFrame(renderBoard));setInterval(()=>$("#time").textContent=fmt((PAUSED&&PAUSE_AT?PAUSE_AT:Date.now())-S.start),1000);if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js");
async function requestPortraitLock(){
  try{if(screen.orientation&&screen.orientation.lock)await screen.orientation.lock("portrait")}catch(e){}
}
requestPortraitLock();
document.addEventListener("visibilitychange",()=>{if(!document.hidden)requestPortraitLock()});
