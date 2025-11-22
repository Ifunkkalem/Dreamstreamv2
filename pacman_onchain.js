// pacman_onchain.js — on-chain game
const gridContainer = document.getElementById('grid-container');
const scoreDisplay = document.getElementById('score');
const startBtn = document.getElementById('start-button');
const btnConnect = document.getElementById('btnConnect');
const addrEl = document.getElementById('addr');
const txStatus = document.getElementById('txStatus');

let score = 0, running=false;

function createGridSmall(){
  gridContainer.innerHTML='';
  for(let i=0;i<280;i++){ const d=document.createElement('div'); d.className='square'; if(Math.random()<0.08) d.classList.add('wall'); else d.classList.add('dot'); gridContainer.appendChild(d); }
}
createGridSmall();

document.addEventListener('keyup', (e)=> {
  if(!running) return;
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){ score++; scoreDisplay.textContent=score; }
});

startBtn.onclick = ()=>{ running=true; score=0; scoreDisplay.textContent=0; };

btnConnect.onclick = async ()=> {
  try {
    await connectMetaMask();
    addrEl.textContent = userAddress;
  } catch(e){ alert('Connect failed'); console.error(e); }
};

document.getElementById('btnSubmitScore').onclick = async ()=> {
  if(!pacmanContract) return alert('Connect first');
  try{
    txStatus.textContent = 'Submitting...';
    const tx = await pacmanContract.submitScore(score);
    await tx.wait();
    txStatus.textContent = 'Submitted: ' + tx.hash;
  } catch(e){ txStatus.textContent = 'Submit failed'; console.error(e); }
};

document.getElementById('btnClaimReward').onclick = async ()=> {
  if(!pacmanContract) return alert('Connect first');
  try {
    txStatus.textContent = 'Claiming...';
    const tx = await pacmanContract.claimReward();
    await tx.wait();
    txStatus.textContent = 'Claimed: ' + tx.hash;
  } catch(e){ txStatus.textContent = 'Claim failed'; console.error(e); }
};
