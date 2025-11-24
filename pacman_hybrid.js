// pacman_hybrid.js
const gridContainer = document.getElementById('grid-container');
const scoreDisplay = document.getElementById('score');
const startBtn = document.getElementById('start-button');
const controls = document.getElementById('controls-mobile');

const width = 20;
let squares = [];
let score = 0;
let pacIndex = 301;
let ghostIndex = 191;
let running = false;
let ghostInterval = null;
let initialDots = [];

const layout = [
  1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
  1,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,1,
  1,2,1,1,1,1,1,2,2,1,1,2,2,1,1,1,1,1,2,1,
  1,2,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1,2,2,1,
  1,2,1,2,1,1,1,1,1,1,1,1,1,1,1,2,1,2,1,1,
  1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,
  1,1,1,2,1,1,1,1,1,2,2,1,1,1,1,1,2,1,1,1,
  1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,
  1,2,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,2,1,1,
  1,2,2,2,2,2,2,2,0,0,0,0,2,2,2,2,2,2,2,1,
  1,1,1,1,1,1,1,2,0,0,0,0,2,1,1,1,1,1,1,1,
  1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,
  1,2,1,1,1,1,1,1,1,2,2,1,1,1,1,1,1,2,1,1,
  1,2,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1,2,2,1,
  1,2,1,2,1,1,1,1,1,1,1,1,1,1,1,2,1,2,1,1,
  1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,
  1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
];

function createGrid(){
  gridContainer.innerHTML=''; squares=[];
  const size = window.innerWidth <= 600 ? 14 : 18;
  gridContainer.style.gridTemplateColumns = `repeat(${width}, ${size}px)`;
  for(let i=0;i<layout.length;i++){
    const sq = document.createElement('div');
    sq.className = 'square';
    if (layout[i]===1) sq.classList.add('wall');
    if (layout[i]===2) sq.classList.add('dot');
    gridContainer.appendChild(sq); squares.push(sq);
  }
  initialDots = squares.map(s=> s.classList.contains('dot'));
  pacIndex = 301;
  ghostIndex = 191;
  squares[pacIndex].classList.add('pac-man');
  squares[ghostIndex].classList.add('ghost');
}

function resetGameState(){
  for(let i=0;i<squares.length;i++){
    squares[i].classList.remove('pac-man','ghost');
    if(initialDots[i]) squares[i].classList.add('dot'); else squares[i].classList.remove('dot');
  }
  pacIndex = 301; ghostIndex = 191; score = 0;
  scoreDisplay.textContent = score;
  squares[pacIndex].classList.add('pac-man');
  squares[ghostIndex].classList.add('ghost');
  running = false;
  if(ghostInterval) clearInterval(ghostInterval);
}

function collectDot(){
  if(squares[pacIndex].classList.contains('dot')){
    squares[pacIndex].classList.remove('dot');
    score++; scoreDisplay.textContent = score;
    window.parent.postMessage({ type: 'SOMNIA_POINT_EVENT', points: 1 }, "*");
  }
}

function movePacmanByDir(dir){
  if(!running) return;
  squares[pacIndex].classList.remove('pac-man');
  let next = pacIndex;
  if(dir==='left') next--;
  if(dir==='right') next++;
  if(dir==='up') next-=width;
  if(dir==='down') next+=width;
  if(squares[next] && !squares[next].classList.contains('wall')) pacIndex = next;
  squares[pacIndex].classList.add('pac-man');
  collectDot();
  checkGameOver();
}

document.addEventListener('keyup', (e)=>{
  if(!running) return;
  if(e.key==='ArrowLeft') movePacmanByDir('left');
  if(e.key==='ArrowRight') movePacmanByDir('right');
  if(e.key==='ArrowUp') movePacmanByDir('up');
  if(e.key==='ArrowDown') movePacmanByDir('down');
});

controls.querySelectorAll('button').forEach(b=>{
  b.addEventListener('touchstart', (ev)=>{ ev.preventDefault(); movePacmanByDir(b.dataset.dir); });
  b.addEventListener('click', ()=> movePacmanByDir(b.dataset.dir));
});

function ghostMove(){
  if(!running) return;
  const dirs = [-1,1,-width,width];
  let best = ghostIndex, bestDist=1e9;
  dirs.forEach(d=>{
    const t = ghostIndex + d;
    if(!squares[t] || squares[t].classList.contains('wall')) return;
    const dx = (t%width)-(pacIndex%width);
    const dy = Math.floor(t/width)-Math.floor(pacIndex/width);
    const dist = Math.abs(dx)+Math.abs(dy);
    if(dist<bestDist){ bestDist=dist; best=t; }
  });
  squares[ghostIndex].classList.remove('ghost');
  ghostIndex = best;
  squares[ghostIndex].classList.add('ghost');
  checkGameOver();
}

function checkGameOver(){
  if(pacIndex===ghostIndex){
    window.parent.postMessage({ type:'SOMNIA_GAME_OVER', score }, "*");
    resetGameState();
  }
}

startBtn.onclick = async () => {
  if (running) return;
  try {
    const tx = await window.Web3Somnia.startGameOnchain();
    if (tx) await tx.wait();
  } catch(e){
    alert("Start failed or rejected.");
    console.error(e);
    return;
  }
  running=true; score=0; scoreDisplay.textContent=0;
  ghostInterval = setInterval(ghostMove, 350);
};

window.onload = function(){
  createGrid();
  setTimeout(()=>{ window.parent.postMessage({ type:'PACMAN_RESIZE', height: document.body.scrollHeight }, "*"); }, 200);
};
