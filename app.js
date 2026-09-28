const $=s=>document.querySelector(s),K="2048pp03_";let id=0,lock=0,H=[],S;
const load=(k,d)=>{try{return JSON.parse(localStorage.getItem(K+k))??d}catch{return d}},save=(k,v)=>localStorage.setItem(K+k,JSON.stringify(v));
let CP=load("cp",{}),RUNS=load("runs",[]),REC=load("records",{bestScore:0,bestTile:0,fastest:{},fewest:{}}),PREF=localStorage.getItem("2048pp_preview")||"off";let THEME=localStorage.getItem("2048pp_theme")||"deepblue";
let SLIDE=+(localStorage.getItem("2048pp_slide")||140);
let NEXTLIMIT=+(localStorage.getItem("2048pp_nextlimit")||0);
const clone=x=>JSON.parse(JSON.stringify(x));function rnd(s){s.x=(Math.imul(1664525,s.x)+1013904223)>>>0;return s.x/4294967296}
function blank(){return Array.from({length:4},()=>Array.from({length:4},()=>({v:0,id:0})))}function empty(b){let a=[];for(let r=0;r<4;r++)for(let c=0;c<4;c++)if(!b[r][c].v)a.push([r,c]);return a}
function spawn(s){let e=empty(s.b);if(!e.length)return;let p=e[Math.floor(rnd(s.rng)*e.length)];s.b[p[0]][p[1]]={v:rnd(s.rng)<.9?2:4,id:++id}}
function fresh(){let s={b:blank(),score:0,moves:0,start:Date.now(),startTile:2,marks:{},undoCredits:0,ended:false,runSaved:false,rng:{x:(Date.now()^Math.random()*4294967296)>>>0}};spawn(s);spawn(s);return s}
function move(s,d){let n=clone(s),b=blank(),gain=0,anim=[];for(let i=0;i<4;i++){let a=[];for(let j=0;j<4;j++){let r=d=="L"||d=="R"?i:(d=="U"?j:3-j),c=d=="U"||d=="D"?i:(d=="L"?j:3-j),q=s.b[r][c];if(q.v)a.push({v:q.v,id:q.id})}let z=[];for(let k=0;k<a.length;k++){if(a[k+1]&&a[k].v==a[k+1].v){z.push({v:a[k].v*2,id:a[k].id,parts:[a[k],a[k+1]]});gain+=a[k].v*2;k++}else z.push(a[k])}for(let j=0;j<z.length;j++){let r=d=="L"||d=="R"?i:(d=="U"?j:3-j),c=d=="U"||d=="D"?i:(d=="L"?j:3-j),q=z[j];b[r][c]={v:q.v,id:q.id};for(let p of(q.parts||[q]))anim.push({id:p.id,r,c,target:q.v,merge:!!q.parts})}}if(JSON.stringify(b.map(x=>x.map(y=>y.v)))==JSON.stringify(s.b.map(x=>x.map(y=>y.v))))return null;n.b=b;n.score+=gain;n.moves++;return{n,anim,gain}}
function geom(){let cells=[...document.querySelectorAll(".cell")],base=$("#tiles").getBoundingClientRect();return cells.map(c=>{let r=c.getBoundingClientRect();return{x:r.left-base.left,y:r.top-base.top,w:r.width,h:r.height}})}
function place(e,r,c,g){let p=g[r*4+c];e.style.left=p.x+"px";e.style.top=p.y+"px";e.style.width=p.w+"px";e.style.height=p.h+"px"}
function renderBoard(){let L=$("#tiles"),g=geom();L.innerHTML="";for(let r=0;r<4;r++)for(let c=0;c<4;c++){let q=S.b[r][c];if(!q.v)continue;let e=document.createElement("div");e.dataset.id=q.id;e.className=`tile ${q.v<=16384?"v"+q.v:"high"}`;e.textContent=q.v;place(e,r,c,g);L.appendChild(e)}stats()}
function canMove(){for(let d of["L","R","U","D"])if(move(S,d))return true;return false}
function scorePop(gain){if(!gain)return;let box=$("#score").parentElement,e=document.createElement("div");e.className="score-pop";e.textContent="+"+gain;box.appendChild(e);setTimeout(()=>e.remove(),700)}
function showGameOver(){if(S.ended)return;S.ended=true;finishRun();$("#gameover-score").textContent=`Score ${S.score} · ${S.moves} Züge`;$("#gameover").classList.remove("hidden");stats()}
function animate(q){let old=new Map([...$("#tiles").children].map(x=>[+x.dataset.id,x])),g=geom();for(let m of q.anim){let e=old.get(m.id);if(!e)continue;if(m.merge){e.textContent=m.target;e.className=`tile ${m.target<=16384?"v"+m.target:"high"}`}place(e,m.r,m.c,g)}setTimeout(()=>{S=q.n;spawn(S);milestones();renderBoard();scorePop(q.gain);lock=0;if(!canMove())showGameOver()},SLIDE)}
function maxTile(){return Math.max(...S.b.flat().map(x=>x.v))}
function milestones(){let m=maxTile();for(let p=128;p<=m;p*=2)if(!S.marks[p]){let x={t:Date.now()-S.start,m:S.moves};S.marks[p]=x;S.undoCredits=(S.undoCredits||0)+1;CP[p]=clone(S);if(!REC.fastest[p]||x.t<REC.fastest[p])REC.fastest[p]=x.t;if(!REC.fewest[p]||x.m<REC.fewest[p])REC.fewest[p]=x.m;REC.bestTile=Math.max(REC.bestTile,p);save("cp",CP);save("records",REC)}}
function go(d){if(lock)return;let q=move(S,d);if(!q)return;lock=1;H.push(clone(S));if(H.length>200)H.shift();animate(q)}
window.undo=()=>{if(lock||!H.length||(S.undoCredits||0)<=0)return;let credits=S.undoCredits-1,marks=S.marks,ended=S.ended;S=H.pop();S.undoCredits=credits;S.marks=marks;S.ended=false;$("#gameover").classList.add("hidden");renderBoard()};window.newGame=()=>{if(S&&S.moves>0&&!S.runSaved)finishRun();S=fresh();H=[];$("#gameover").classList.add("hidden");renderBoard()}
function fmt(x){let s=x/1000|0,h=s/3600|0,m=(s%3600)/60|0,ss=s%60;return(h?h+":":"")+String(m).padStart(2,"0")+":"+String(ss).padStart(2,"0")}
function preview(){let mode=$("#preview").value,free=empty(S.b).length;if(!NEXTLIMIT||free>NEXTLIMIT||mode=="off")return"";if(mode=="value"){let q=clone(S.rng);return"Nächster Wert: "+(rnd(q)<.9?2:4)}let out=[],sy={L:"←",R:"→",U:"↑",D:"↓"};for(let d of["L","R","U","D"]){let z=move(S,d);if(!z)continue;let e=empty(z.n.b),q=clone(z.n.rng),p=e[Math.floor(rnd(q)*e.length)],v=rnd(q)<.9?2:4;out.push(`${sy[d]} ${v} @ ${String.fromCharCode(65+p[1])}${p[0]+1}`)}return out.join(" · ")}
function stats(){REC.bestScore=Math.max(REC.bestScore,S.score);REC.bestTile=Math.max(REC.bestTile,maxTile());save("records",REC);$("#score").textContent=S.score;$("#best").textContent=REC.bestScore;$("#moves").textContent=S.moves;let ub=$("#undoBtn"),uc=S.undoCredits||0;$("#undoCount").textContent=uc;ub.disabled=!H.length||uc<=0;$("#free").textContent=empty(S.b).length;let mx=maxTile(),g=128;while(g<=mx)g*=2;$("#goal").textContent=g;
let freeNow=empty(S.b).length, nextEnabled=NEXTLIMIT>0&&freeNow<=NEXTLIMIT;
$("#nextCard").classList.toggle("hidden",NEXTLIMIT===0);
$("#preview").disabled=!nextEnabled;
$("#next").textContent=nextEnabled?preview():"";renderMilestones();renderHistory();renderCoach();let a=Object.entries(S.marks);$("#marks").innerHTML=a.length?a.map(([k,v])=>`<div class=r><b>${k}</b><span>${fmt(v.t)} · Zug ${v.m}</span></div>`).join(""):"Noch keine.";let c=Object.keys(CP).map(Number).sort((a,b)=>a-b);$("#cps").innerHTML=c.length?c.map(k=>`<div class=r><b>${k}</b><button onclick=startCP(${k})>Ab hier</button></div>`).join(""):"Noch keine.";$("#records").innerHTML=`<div class=r><b>Höchste Kachel</b><span>${REC.bestTile||"-"}</span></div><div class=r><b>Höchster Score</b><span>${REC.bestScore}</span></div>`;$("#runs").innerHTML=RUNS.length?RUNS.slice(0,12).map(r=>`<div class=r><b>${r.tile} · ${r.score}</b><span>${fmt(r.time)} · ${r.moves} Züge</span></div>`).join(""):"Noch keine abgeschlossenen Runs."}
window.startCP=k=>{if(S&&S.moves>0&&!S.runSaved)finishRun();S=clone(CP[k]);S.start=Date.now();S.startTile=+k;S.moves=0;S.score=0;S.marks={};S.undoCredits=0;S.ended=false;S.runSaved=false;H=[];$("#gameover").classList.add("hidden");renderBoard()};
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
function coachEval(){
  let out=[];
  for(let d of ["L","D","R","U"]){
    let q=move(S,d); if(!q)continue;
    let b=q.n.b,free=empty(b).length,merges=mergePotential(b),smooth=smoothPenalty(b),mono=monotonicity(b);
    let score=free*32+merges*13+cornerBonus(b)+mono*1.8-smooth*2.2+(q.gain||0)*.035;
    out.push({d,score,free,merges,gain:q.gain||0});
  }
  return out.sort((a,b)=>b.score-a.score);
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
function renderHistory(){
  let box=$("#runHistory"); if(!box)return;
  let runs=RUNS||[], best=runs.reduce((a,r)=>Math.max(a,r.score||0),0), mx=runs.reduce((a,r)=>Math.max(a,r.tile||0),0);
  $("#runCount").textContent=runs.length; $("#historyBest").textContent=best; $("#historyMax").textContent=mx||"—";
  box.innerHTML=runs.length?runs.slice(0,20).map((r,i)=>`<div class="run-row">
    <div><b>${r.tile||2}</b><small>${fmtRunDate(r.ended||r.date||r.ts)}</small></div>
    <span>Score <b>${r.score||0}</b></span><span>${r.moves||0} Z.</span><span>${fmtRunTime(r.time)}</span>
    <small>${(r.startTile||2)>2?"Checkpoint "+r.startTile:"Normal"}</small>
  </div>`).join(""):`<div class="history-empty">Noch keine abgeschlossenen Spiele.</div>`;
}
function finishRun(){
  if(S.runSaved)return;
  S.runSaved=true;
  RUNS.unshift({ended:Date.now(),tile:maxTile(),score:S.score,moves:S.moves,time:Date.now()-S.start,startTile:S.startTile||2,milestones:Object.keys(S.marks||{}).map(Number)});
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
$("#resetAll").onclick=()=>{if(confirm("Wirklich ALLES zurücksetzen?\\n\\nSpielhistorie, Rekorde, Checkpoints, Spielstand und Einstellungen werden gelöscht.")&&confirm("Letzte Bestätigung: Alle lokalen 2048++-Daten endgültig löschen?")){Object.keys(localStorage).filter(k=>k.startsWith("2048pp")).forEach(k=>localStorage.removeItem(k));location.reload()}};
$("#clearHistory").onclick=()=>{if(confirm("Spielhistorie wirklich löschen?")){RUNS=[];save("runs",RUNS);renderHistory()}};
$("#coachBtn").onclick=()=>{COACH=!COACH;localStorage.setItem("2048pp_coach",COACH?"1":"0");renderCoach()};
$("#preview").value=["off","value","full"].includes(PREF)?PREF:"off";
$("#slideSpeed").value=String([50,90,140,220].includes(SLIDE)?SLIDE:140);
$("#nextLimit").value=String([0,4,6,8,16].includes(NEXTLIMIT)?NEXTLIMIT:0);
$("#slideSpeed").onchange=e=>{SLIDE=+e.target.value;localStorage.setItem("2048pp_slide",SLIDE)};
$("#nextLimit").onchange=e=>{NEXTLIMIT=+e.target.value;localStorage.setItem("2048pp_nextlimit",NEXTLIMIT);stats()};$("#preview").onchange=e=>{localStorage.setItem("2048pp_preview",e.target.value);stats()};$("#menu").onclick=()=>{$("#panel").classList.remove("hidden");stats()};$("#close").onclick=()=>$("#panel").classList.add("hidden");
function setTheme(t){THEME=["blue","original","deepblue"].includes(t)?t:"deepblue";document.body.dataset.theme=THEME;localStorage.setItem("2048pp_theme",THEME);document.querySelectorAll(".theme-btn").forEach(b=>b.classList.toggle("active",b.dataset.theme===THEME))}
setTheme(THEME);document.querySelectorAll(".theme-btn").forEach(b=>b.onclick=()=>setTheme(b.dataset.theme));
for(let i=0;i<16;i++){let e=document.createElement("div");e.className="cell";$("#grid").appendChild(e)}let x,y,G=$("#game");G.ontouchstart=e=>{x=e.touches[0].clientX;y=e.touches[0].clientY};G.ontouchend=e=>{let X=e.changedTouches[0].clientX-x,Y=e.changedTouches[0].clientY-y;if(Math.max(Math.abs(X),Math.abs(Y))<22)return;go(Math.abs(X)>Math.abs(Y)?(X>0?"R":"L"):(Y>0?"D":"U"))};S=fresh();requestAnimationFrame(renderBoard);addEventListener("resize",()=>requestAnimationFrame(renderBoard));setInterval(()=>$("#time").textContent=fmt(Date.now()-S.start),1000);if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js");