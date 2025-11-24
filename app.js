// app.js - glue code
const btnConnect = document.getElementById('btn-connect');
const addrDisplay = document.getElementById('addr-display');
const balanceSttEl = document.getElementById('balance-stt');
const balancePacEl = document.getElementById('balance-pac');
const activityEl = document.getElementById('activity');
const streamStatusEl = document.getElementById('stream-status');
const pairsContainer = document.getElementById('pairs');
const toggleSim = document.getElementById('toggle-sim');
const pointsEl = document.getElementById('points');

let streamAdapter = null;
let pointsHistory = [];
let chart = null;

const mockPairs = {
  SOMUSD: { price: 0.25, change: "+1.2%" },
  SOMPAC: { price: 150, change: "-0.8%" },
  PACUSD: { price: 0.0017, change: "+12.4%" }
};

function toast(msg) {
  const d = document.createElement('div');
  d.textContent = msg;
  activityEl.prepend(d);
  if (activityEl.children.length > 40) activityEl.removeChild(activityEl.lastChild);
}

async function onConnectClicked(){
  const addr = await window.Web3Somnia.connect();
  if (!addr) return alert("MetaMask not connected or rejected.");
  addrDisplay.textContent = addr;
  toast(`Wallet connected: ${addr}`);
  // fetch balances
  const bal = await window.Web3Somnia.getBalances(addr);
  balanceSttEl.textContent = Number(bal.stt).toFixed(4) + " STT";
  balancePacEl.textContent = Number(bal.pac).toFixed(4) + " PAC";

  // init stream (mock by default)
  streamAdapter = new SDSStreamAdapter({
    wallet: addr,
    useMock: toggleSim.checked,
    onPoints: (w,p) => {
      pointsEl.textContent = p;
      pointsHistory.push(p);
      if (pointsHistory.length>60) pointsHistory.shift();
      updateChart();
    },
    onEvent: (txt) => {
      streamStatusEl.textContent = txt;
      toast(txt);
    },
    onError: (e) => {
      streamStatusEl.textContent = "Error";
      toast("Stream error: " + (e.message||e));
    }
  });
  streamAdapter.connect();
  document.querySelector('.indicator').className='indicator online';
}

// pairs UI
function renderPairs(){
  pairsContainer.innerHTML='';
  Object.entries(mockPairs).forEach(([k,v])=>{
    const el = document.createElement('div');
    el.className='pairBox';
    el.innerHTML = `<div>${k}</div><div>${v.price} (${v.change})</div>`;
    pairsContainer.appendChild(el);
  });
}
function updatePairsRandom(){
  Object.keys(mockPairs).forEach(k=>{
    const delta = (Math.random()-0.5)*0.02;
    mockPairs[k].price = Number((mockPairs[k].price*(1+delta)).toFixed(6));
  });
  renderPairs();
}

// chart init
function initChart(){
  const ctx = document.getElementById('pointsChart').getContext('2d');
  chart = new Chart(ctx, {
    type:'line', data:{ labels:[], datasets:[{ label:'Points', data:[], borderColor:'#59ffc9', backgroundColor:'rgba(89,255,201,0.08)'}] },
    options:{ plugins:{legend:{display:false}}, scales:{x:{display:false}} }
  });
}
function updateChart(){
  if(!chart) return;
  chart.data.labels = pointsHistory.map((_,i)=>i+1);
  chart.data.datasets[0].data = pointsHistory;
  chart.update();
}

// iframe message handling (pacman)
window.addEventListener('message', (e)=>{
  const data = e.data || {};
  if (data.type === 'SOMNIA_POINT_EVENT'){
    // add to UI / stream
    toast(`Game: +${data.points} point`);
    // optional: forward to stream adapter points handler
  }
  if (data.type === 'PACMAN_RESIZE'){
    const iframe = document.getElementById('pacman-iframe');
    if (iframe) iframe.style.height = data.height + 'px';
  }
  if (data.type === 'SOMNIA_GAME_OVER'){
    toast(`Game Over: ${data.score}`);
    // auto submit onchain attempt (ask user)
    if (confirm("Submit score onchain?")) {
      submitScoreOnchain(data.score);
    }
  }
});

// submit score helper
async function submitScoreOnchain(points){
  if (!window.Web3Somnia.connected) return alert("Connect wallet dulu.");
  toast("Submitting score onchain...");
  const tx = await window.Web3Somnia.submitScoreOnchain(points);
  if (!tx) return toast("Submit failed.");
  toast("TX sent: " + tx.hash);
}

// wire UI
btnConnect.addEventListener('click', onConnectClicked);
document.getElementById('btn-clear').addEventListener('click', ()=>{ activityEl.innerHTML='[cleared]'; });

// initial
renderPairs();
initChart();
setInterval(updatePairsRandom, 2000);
