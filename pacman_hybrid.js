// pacman_hybrid.js — hybrid behavior
const gridContainer = document.getElementById('grid-container');
const scoreDisplay = document.getElementById('score');
const startBtn = document.getElementById('start-button');
const btnConnect = document.getElementById('btnConnect');
const addrEl = document.getElementById('addr');
const txStatus = document.getElementById('txStatus');

let score = 0, running=false;

function createGridHybrid(){
  gridContainer.innerHTML=''; for(let i=0;i<280;i++){ const s=document.createElement('div'); s.className='square'; if(Math.random()<0.08) s.classList.add('wall'); else s.classList.add('dot'); gridContainer.appendChild(s); }
}
createGridHybrid();

document.addEventListener('keyup', (e)=> {
  if(!running) return;
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
    score++; scoreDisplay.textContent=score;
    try{ window.parent.postMessage({ type:'SOMNIA_POINT_EVENT', points:1 }, window.location.origin); } catch(e){}
  }
});

startBtn.onclick = ()=>{ running=true; score=0; scoreDisplay.textContent=0; };

btnConnect.onclick = async ()=> {
  try { await connectMetaMask(); addrEl.textContent = userAddress; } catch(e){ alert('connect fail'); }
};

document.getElementById('btnSubmit').onclick = async ()=> {
  if(!pacmanContract) return alert('Connect first');
  try {
    txStatus.textContent='Submitting...';
    const tx = await pacmanContract.submitScore(score);
    await tx.wait();
    txStatus.textContent = 'Submitted: ' + tx.hash;
    try{ window.parent.postMessage({ type:'SOMNIA_ONCHAIN_SUBMIT', tx: tx.hash, score }, window.location.origin); } catch(e){}
  } catch(e){ txStatus.textContent='Submit error'; console.error(e); }
};
