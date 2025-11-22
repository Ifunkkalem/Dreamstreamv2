// pacman_hybrid.js
// Hybrid-safe Pacman: runs inside iframe, posts requests to parent for wallet & on-chain txs,
// receives results back from parent and displays TX status.

(function () {
  // Layout (20 x 17)
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

  const width = 20;
  let squares = [];
  let pacmanIndex = 301;
  let ghostIndex = 191;
  let score = 0;
  let running = false;
  let ghostInterval = null;

  function $id(id){ return document.getElementById(id); }
  function post(message){ try{ window.parent.postMessage(message, "*"); } catch(e){} }

  function createGrid(){
    const grid = $id('grid-container');
    if(!grid) return;
    grid.innerHTML = '';
    squares = [];
    const size = (window.innerWidth <= 600) ? 15 : 18;
    grid.style.gridTemplateColumns = `repeat(${width}, ${size}px)`;
    for(let i=0;i<layout.length;i++){
      const s = document.createElement('div'); s.className='square';
      if(layout[i]===1) s.classList.add('wall');
      if(layout[i]===2) s.classList.add('dot');
      grid.appendChild(s); squares.push(s);
    }
    pacmanIndex = Math.max(0, Math.min(layout.length-1, pacmanIndex));
    ghostIndex = Math.max(0, Math.min(layout.length-1, ghostIndex));
    squares[pacmanIndex].classList.add('pac-man');
    squares[ghostIndex].classList.add('ghost');
    $id('score') && ($id('score').textContent = score);
  }

  function collectDot(){
    if(!squares[pacmanIndex]) return;
    if(squares[pacmanIndex].classList.contains('dot')){
      squares[pacmanIndex].classList.remove('dot');
      score++;
      $id('score') && ($id('score').textContent = score);
      post({ type:'SOMNIA_POINT_EVENT', points:1, score });
    }
  }

  function movePac(key){
    if(!running) return;
    if(!squares[pacmanIndex]) return;
    squares[pacmanIndex].classList.remove('pac-man');
    let next = pacmanIndex;
    if(key==='ArrowLeft') next = pacmanIndex - 1;
    if(key==='ArrowRight') next = pacmanIndex + 1;
    if(key==='ArrowUp') next = pacmanIndex - width;
    if(key==='ArrowDown') next = pacmanIndex + width;
    if(next >= 0 && next < layout.length && !squares[next].classList.contains('wall')){
      pacmanIndex = next;
      collectDot();
    }
    squares[pacmanIndex] && squares[pacmanIndex].classList.add('pac-man');
    checkOver();
  }

  function moveGhost(){
    if(!running) return;
    const dirs = [-1,1,-width,width];
    let best = ghostIndex, bestDist = 1e9;
    dirs.forEach(d=>{
      const t = ghostIndex + d;
      if(t<0||t>=layout.length) return;
      if(!squares[t]||squares[t].classList.contains('wall')) return;
      const dx = (t%width)-(pacmanIndex%width);
      const dy = Math.floor(t/width)-Math.floor(pacmanIndex/width);
      const dist = Math.abs(dx)+Math.abs(dy);
      if(dist < bestDist){ bestDist = dist; best = t; }
    });
    squares[ghostIndex] && squares[ghostIndex].classList.remove('ghost');
    ghostIndex = best;
    squares[ghostIndex] && squares[ghostIndex].classList.add('ghost');
    checkOver();
  }

  function checkOver(){
    if(pacmanIndex === ghostIndex){
      running = false;
      if(ghostInterval){ clearInterval(ghostInterval); ghostInterval=null; }
      $id('status-message') && ($id('status-message').textContent = 'GAME OVER');
      post({ type:'SOMNIA_GAME_OVER', score });
    }
  }

  function startGame(){
    if(running) return;
    running = true; score = 0;
    createGrid();
    $id('status-message') && ($id('status-message').textContent = 'GO!');
    if(ghostInterval) clearInterval(ghostInterval);
    ghostInterval = setInterval(moveGhost, 380);
    sendHeight();
  }

  function sendHeight(){
    setTimeout(()=>{ post({ type:'PACMAN_RESIZE', height: document.body.scrollHeight }); }, 120);
  }

  // Buttons: connect should ask parent to connect (parent does metaMask)
  $id('btnConnect')?.addEventListener('click', ()=> {
    post({ type: 'REQUEST_CONNECT' });
  });

  // When user presses Submit On-Chain in iframe UI, ask parent to submit (parent will call contract)
  $id('btnSubmit')?.addEventListener('click', ()=> {
    post({ type: 'SOMNIA_ONCHAIN_SUBMIT_REQUEST', score });
  });

  // Keyboard controls
  window.addEventListener('keyup', e => {
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) movePac(e.key);
  });

  // Listen for parent responses (connect result, tx result)
  window.addEventListener('message', (ev) => {
    const d = ev.data;
    if(!d || !d.type) return;
    if(d.type === 'CONNECT_RESULT') {
      // d.success, d.address
      if(d.success) { $id('addr').textContent = d.address || 'Connected'; }
      else { $id('addr').textContent = 'Connect failed'; alert('Parent failed to connect wallet: '+(d.error||'unknown')); }
    }
    if(d.type === 'SOMNIA_ONCHAIN_SUBMIT_RESULT') {
      // d.success, d.txHash, d.error
      if(d.success) {
        $id('txStatus') && ($id('txStatus').textContent = 'Submitted: ' + d.txHash);
        // notify parent & local
        post({ type:'SOMNIA_ONCHAIN_SUBMIT_ACK', tx: d.txHash, score });
      } else {
        $id('txStatus') && ($id('txStatus').textContent = 'Submit failed: ' + (d.error||''));
      }
    }
  });

  // Start button
  $id('start-button')?.addEventListener('click', startGame);

  // Init
  window.addEventListener('load', ()=>{
    createGrid();
    sendHeight();
    window.addEventListener('resize', sendHeight);
  });

  // Expose API (optional)
  window.pacmanAPI = { start: startGame, getScore: () => score };
})();
