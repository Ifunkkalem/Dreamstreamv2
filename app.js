// app.js — main glue for dashboard
const btnMeta = document.getElementById('btn-metamask');
const btnAddSomnia = document.getElementById('btn-add-somnia');
const btnConnect = document.getElementById('btn-connect');
const walletInput = document.getElementById('wallet-input');
const pointsEl = document.getElementById('points');
const streamStatusEl = document.getElementById('stream-status');
const activityEl = document.getElementById('activity');
const pairsContainer = document.getElementById('pairs');
const liveIndicator = document.getElementById('live-indicator');
const missionsEl = document.getElementById('missions');
const missionsRefresh = document.getElementById('btn-refresh-missions');
const leaderboardEl = document.getElementById('leaderboard');
const toggleSim = document.getElementById('toggle-sim');

let pointsHistory = [];
let chart = null;
let currentAdapter = null;
let trackedWallets = [];

// init chart
function initChart(){
  const ctx = document.getElementById('pointsChart').getContext('2d');
  chart = new Chart(ctx, { type:'line',
    data:{ labels:[], datasets:[{ label:'Points', data:[], borderColor:'#3ac7ff', tension:0.3 }]},
    options:{ plugins:{legend:{display:false}}, scales:{ x:{display:false} } }
  });
}
initChart();

// toast
function toast(msg){ const d = document.createElement('div'); d.textContent = msg; activityEl.prepend(d); if(activityEl.children.length>120) activityEl.removeChild(activityEl.lastChild); }

// handle iframe messages (from pacman variants)
window.addEventListener('message', (ev)=>{
  const d = ev.data;
  if(!d || !d.type) return;
  if(d.type === 'SOMNIA_POINT_EVENT'){
    // increase points
    const pts = Number(d.points||1);
    const current = Number(pointsEl.textContent.replace(/[^0-9]/g,''))||0;
    const total = current + pts;
    pointsEl.textContent = total;
    pointsHistory.push(total); if(pointsHistory.length>60) pointsHistory.shift();
    chart.data.labels = pointsHistory.map((_,i)=>i+1); chart.data.datasets[0].data = pointsHistory; chart.update();
    toast('Point +'+pts);
  }
  if(d.type === 'SOMNIA_ONCHAIN_SUBMIT'){
    toast('Onchain submit '+d.tx);
  }
  if(d.type === 'PACMAN_RESIZE'){
    const iframe = document.getElementById('pacman-iframe'); if(iframe) iframe.style.height = d.height + 'px';
  }
});

// UI: connect metamask
btnMeta.onclick = async () => {
  try {
    await connectMetaMask();
    toast('Connected: '+userAddress);
    document.getElementById('wallet-count').textContent = trackedWallets.length;
  } catch (e) { toast('MetaMask connect error'); console.error(e); }
};

btnAddSomnia.onclick = async () => {
  try { await addOrSwitchSomnia(); toast('Somnia network added/switched'); } catch(e){ toast('Add/switch failed: '+e.message); console.error(e); }
};

btnConnect.onclick = ()=> {
  const w = walletInput.value.trim();
  if(!w) { toast('Enter wallet'); return; }
  if(!trackedWallets.includes(w)) trackedWallets.push(w);
  toast('Tracking wallet '+w);
  // start stream adapter for wallet
  if(currentAdapter) currentAdapter.disconnect();
  currentAdapter = new SDSStreamAdapter({
    wallet: w,
    useMock: toggleSim.checked,
    onPoints: (w,p)=>{
      const current = Number(pointsEl.textContent.replace(/[^0-9]/g,''))||0;
      pointsEl.textContent = p;
      toast('SDS: '+p+' pts');
      pointsHistory.push(p); if(pointsHistory.length>60) pointsHistory.shift();
      chart.data.labels = pointsHistory.map((_,i)=>i+1); chart.data.datasets[0].data = pointsHistory; chart.update();
    },
    onEvent: (msg, ok)=>{ streamStatusEl.textContent = msg; liveIndicator.className = 'indicator ' + (ok?'online':'offline'); toast(msg); },
    onError: (e)=>{ toast('Stream error'); console.error(e); }
  });
  currentAdapter.connect();
};

// missions
missionsRefresh && missionsRefresh.addEventListener('click', ()=>{ missionsEl.innerHTML=''; ['Collect 50 points','Play Pacman','Claim reward'].forEach(m=>{ const li=document.createElement('li'); li.textContent=m; missionsEl.appendChild(li); }); toast('Missions refreshed'); });

// export log
document.getElementById('btn-export').onclick = ()=> {
  const blob = new Blob([activityEl.innerText],{type:'text/plain'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='activity.txt'; a.click(); URL.revokeObjectURL(url);
};
