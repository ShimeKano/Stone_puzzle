const LEVELS = [
  ...Array.from({length:5},(_,i)=>({number:i+1,size:3,scramble:5+i*2})),
  ...Array.from({length:5},(_,i)=>({number:i+6,size:5,scramble:10+i*2})),
  ...Array.from({length:7},(_,i)=>({number:i+11,size:7,scramble:18+i*2})),
  ...Array.from({length:9},(_,i)=>({number:i+18,size:9,scramble:28+i*2}))
];

const boardEl=document.querySelector('#board');
const levelLabel=document.querySelector('#levelLabel');
const movesLabel=document.querySelector('#movesLabel');
const timeLabel=document.querySelector('#timeLabel');
const hintEl=document.querySelector('#hint');
const completeEl=document.querySelector('#complete');
const completeTitle=document.querySelector('#completeTitle');
const completeText=document.querySelector('#completeText');
const resetBtn=document.querySelector('#resetBtn');
const newBtn=document.querySelector('#newBtn');
const nextBtn=document.querySelector('#nextBtn');

let levelIndex=0,state=[],startState=[],moves=0,startTime=0,timer=null,completed=false;

function blank(n){return Array.from({length:n},()=>Array(n).fill(0))}
function clone(a){return a.map(row=>row.slice())}
function toggle(r,c,n){
  if(r>=0&&r<n&&c>=0&&c<n) state[r][c]^=1;
}
function press(r,c){
  const n=state.length;
  [[r,c],[r-1,c],[r+1,c],[r,c-1],[r,c+1]].forEach(([rr,cc])=>toggle(rr,cc,n));
  moves++;
  render();
  if(moves===1) hintEl.textContent='Exactly: this stone and the four stones beside it changed.';
  if(isSolved()) finishLevel();
}
function isSolved(){return state.every(row=>row.every(v=>v===0))}
function scramble(level){
  const n=level.size; state=blank(n);
  let last=-1;
  for(let i=0;i<level.scramble;i++){
    let p;
    do{p=Math.floor(Math.random()*n*n)}while(p===last);
    last=p;
    const r=Math.floor(p/n),c=p%n;
    [[r,c],[r-1,c],[r+1,c],[r,c-1],[r,c+1]].forEach(([rr,cc])=>toggle(rr,cc,n));
  }
  if(isSolved()) return scramble(level);
  startState=clone(state);
}
function render(){
  const n=state.length;
  boardEl.style.setProperty('--size',n);
  boardEl.innerHTML='';
  state.forEach((row,r)=>row.forEach((value,c)=>{
    const b=document.createElement('button');
    b.className='stone'+(value?' black':'');
    b.setAttribute('role','gridcell');
    b.setAttribute('aria-label',`Row ${r+1}, column ${c+1}, ${value?'black':'white'} stone`);
    b.addEventListener('click',()=>press(r,c));
    boardEl.appendChild(b);
  }));
  movesLabel.textContent=`${moves} move${moves===1?'':'s'}`;
}
function formatTime(sec){
  const m=String(Math.floor(sec/60)).padStart(2,'0');
  const s=String(sec%60).padStart(2,'0');
  return m+':'+s;
}
function updateTime(){timeLabel.textContent=formatTime(Math.floor((Date.now()-startTime)/1000))}
function startTimer(){clearInterval(timer);startTime=Date.now();timer=setInterval(updateTime,1000);updateTime()}
function loadLevel(index){
  levelIndex=index;completed=false;moves=0;completeEl.classList.add('hidden');
  const level=LEVELS[levelIndex];
  scramble(level);levelLabel.textContent=`Level ${level.number} / ${LEVELS.length}`;
  hintEl.textContent='Tap a stone. It and the stones beside it will change.';
  render();startTimer();
}
function finishLevel(){
  if(completed)return;
  completed=true;clearInterval(timer);
  const seconds=Math.floor((Date.now()-startTime)/1000);
  const last=levelIndex===LEVELS.length-1;
  completeTitle.textContent=last?'You beat Stone Puzzle!':'Level complete';
  completeText.textContent=last
    ?`26 levels cleared · ${moves} moves on the final level · ${formatTime(seconds)} on the final level.`
    :`Level ${levelIndex+1} cleared in ${moves} moves and ${formatTime(seconds)}.`;
  nextBtn.textContent=last?'Play again':'Next level';
  completeEl.classList.remove('hidden');
}
resetBtn.addEventListener('click',()=>{state=clone(startState);moves=0;completed=false;completeEl.classList.add('hidden');render();startTimer()});
newBtn.addEventListener('click',()=>loadLevel(levelIndex));
nextBtn.addEventListener('click',()=>loadLevel(levelIndex===LEVELS.length-1?0:levelIndex+1));

loadLevel(0);
