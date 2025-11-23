// pacman_hybrid.js — Final Hybrid Pac-Man (Somnia Competition Edition)
// - Runs inside iframe (pacman_hybrid.html)
// - Posts events to parent: SOMNIA_POINT_EVENT, SOMNIA_GAME_OVER, PACMAN_RESIZE
// - Can request parent to connect / submit on-chain via REQUEST_CONNECT and SOMNIA_ONCHAIN_SUBMIT_REQUEST
// - Self-contained, no external dependencies beyond browser

(function () {
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
  const gridContainer = document.getElementById('grid-container');
  const scoreEl = document.getElementById('score');
  const statusEl = document.getElementById('status-message');
  const startBtn = document.getElementById('start-button');
  const connectBtn = document.getElementById('btnConnect');
  const submitBtn = document.getElementById('btnSubmit');
  const addrEl = document.getElementById('addr');
  const txStatusEl = document.getElementById('txStatus');

  let squares = [];
  let pacmanIndex = 301;
  let ghostIndex = 191;
  let score = 0;
  let running = false;
  let ghostInterval = null;

  function postToParent(msg) {
    try {
      window.parent.postMessage(msg, '*');
    } catch (e) {
      // ignore
    }
  }

  function createGrid() {
    if (!gridContainer) return;
    gridContainer.innerHTML = '';
    squares = [];
    const squareSize = window.innerWidth <= 600 ? 15 : 18;
    gridContainer.style.gridTemplateColumns = `repeat(${width}, ${squareSize}px)`;

    for (let i = 0; i < layout.length; i++) {
      const div = document.createElement('div');
      div.className = 'square';
      if (layout[i] === 1) div.classList.add('wall');
      if (layout[i] === 2) div.classList.add('dot');
      gridContainer.appendChild(div);
      squares.push(div);
    }

    // ensure initial indices valid
    pacmanIndex = Math.max(0, Math.min(layout.length - 1, pacmanIndex));
    ghostIndex = Math.max(0, Math.min(layout.length - 1, ghostIndex));

    squares[pacmanIndex].classList.add('pac-man');
    squares[ghostIndex].classList.add('ghost');

    updateScore(0);
  }

  function updateScore(v) {
    score = v;
    if (scoreEl) scoreEl.textContent = String(score);
  }

  function collectDot() {
    if (!squares[pacmanIndex]) return;
    if (squares[pacmanIndex].classList.contains('dot')) {
      squares[pacmanIndex].classList.remove('dot');
      score++;
      if (scoreEl) scoreEl.textContent = String(score);
      postToParent({ type: 'SOMNIA_POINT_EVENT', points: 1, score });
    }
  }

  function movePac(key) {
    if (!running) return;
    if (!squares[pacmanIndex]) return;

    squares[pacmanIndex].classList.remove('pac-man');
    let next = pacmanIndex;

    if (key === 'ArrowLeft') next = pacmanIndex - 1;
    if (key === 'ArrowRight') next = pacmanIndex + 1;
    if (key === 'ArrowUp') next = pacmanIndex - width;
    if (key === 'ArrowDown') next = pacmanIndex + width;

    if (next >= 0 && next < layout.length && !squares[next].classList.contains('wall')) {
      pacmanIndex = next;
      collectDot();
    }

    squares[pacmanIndex].classList.add('pac-man');
    checkGameOver();
  }

  function moveGhost() {
    if (!running) return;

    const dirs = [-1, 1, -width, width];
    let best = ghostIndex;
    let bestDist = Infinity;

    dirs.forEach(d => {
      const t = ghostIndex + d;
      if (t < 0 || t >= layout.length) return;
      if (!squares[t] || squares[t].classList.contains('wall')) return;
      const dx = (t % width) - (pacmanIndex % width);
      const dy = Math.floor(t / width) - Math.floor(pacmanIndex / width);
      const dist = Math.abs(dx) + Math.abs(dy);
      if (dist < bestDist) {
        bestDist = dist;
        best = t;
      }
    });

    if (squares[ghostIndex]) squares[ghostIndex].classList.remove('ghost');
    ghostIndex = best;
    if (squares[ghostIndex]) squares[ghostIndex].classList.add('ghost');
    checkGameOver();
  }

  function checkGameOver() {
    if (pacmanIndex === ghostIndex) {
      running = false;
      if (ghostInterval) clearInterval(ghostInterval);
      if (statusEl) statusEl.textContent = 'GAME OVER';
      postToParent({ type: 'SOMNIA_GAME_OVER', score });
    }
  }

  function startGame() {
    if (running) return;
    running = true;
    score = 0;
    updateScore(0);
    createGrid();
    if (ghostInterval) clearInterval(ghostInterval);
    ghostInterval = setInterval(moveGhost, 380);
    if (statusEl) statusEl.textContent = 'GO!';
    sendHeight();
  }

  function sendHeight() {
    setTimeout(() => {
      try {
        postToParent({ type: 'PACMAN_RESIZE', height: document.body.scrollHeight });
      } catch (e) {}
    }, 120);
  }

  // Request parent to connect wallet (parent will handle MetaMask)
  if (connectBtn) {
    connectBtn.addEventListener('click', () => {
      postToParent({ type: 'REQUEST_CONNECT' });
    });
  }

  // Request parent to submit score on-chain
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      postToParent({ type: 'SOMNIA_ONCHAIN_SUBMIT_REQUEST', score });
    });
  }

  // Keyboard controls
  window.addEventListener('keyup', (e) => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      movePac(e.key);
    }
  });

  // Mobile control buttons if exist
  document.querySelectorAll('.controls-mobile button[data-key]').forEach(b => {
    b.addEventListener('click', () => {
      const k = b.getAttribute('data-key');
      if (!running) startGame();
      movePac(k);
    });
  });

  // Listen replies from parent
  window.addEventListener('message', (ev) => {
    const d = ev.data;
    if (!d || !d.type) return;

    if (d.type === 'CONNECT_RESULT') {
      if (d.success) {
        if (addrEl) addrEl.textContent = d.address || 'Connected';
      } else {
        if (addrEl) addrEl.textContent = 'Connect failed';
        alert('Parent failed to connect wallet: ' + (d.error || ''));
      }
    }

    if (d.type === 'SOMNIA_ONCHAIN_SUBMIT_RESULT') {
      if (d.success) {
        if (txStatusEl) txStatusEl.textContent = 'TX: ' + d.txHash;
        // optionally notify parent ack
        postToParent({ type: 'SOMNIA_ONCHAIN_SUBMIT_ACK', tx: d.txHash, score });
      } else {
        if (txStatusEl) txStatusEl.textContent = 'Submit failed: ' + (d.error || '');
      }
    }
  });

  // Start button
  if (startBtn) startBtn.addEventListener('click', startGame);

  // Initialize grid on load and post size
  window.addEventListener('load', () => {
    createGrid();
    sendHeight();
    window.addEventListener('resize', sendHeight);
  });

  // expose API
  window.pacmanAPI = {
    start: startGame,
    getScore: () => score
  };
})();
