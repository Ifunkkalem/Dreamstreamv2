// pacman_iframe.js — iframe edition (postMessage)
const gridContainer = document.getElementById('grid-container');
const scoreDisplay = document.getElementById('score');
const statusMessage = document.getElementById('status-message');
let score = 0, running = false;

function createGridIframe(){
  gridContainer.innerHTML = '';
  for(let i=0;i<280;i++){ const s=document.createElement('div'); s.className='square'; if(Math.random()<0.08) s.classList.add('wall'); else s.classList.add('dot'); gridContainer.appendChild(s); }
}
createGridIframe();

document.addEventListener('keyup', (e)=> {
  if(!running) return;
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
    score++; scoreDisplay.textContent=score;
    try{ window.parent.postMessage({ type:'SOMNIA_POINT_EVENT', points:1 }, window.location.origin); } catch(e){}
  }
});

document.getElementById('start-button').onclick = ()=>{ running=true; score=0; scoreDisplay.textContent=0; statusMessage.textContent='Go!'; window.parent.postMessage({ type:'PACMAN_RESIZE', height: document.body.scrollHeight }, window.location.origin); };
