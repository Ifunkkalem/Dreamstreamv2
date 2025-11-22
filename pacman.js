// pacman.js — Hybrid-safe, origin-friendly Pac-Man (posts events to parent)
// Paste this file into pacman_hybrid.html (or pacman_iframe.html) as the game engine.

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
  let pacmanIndex = 301; // initial
  let ghostIndex = 191;  // initial
  let score = 0;
  let running = false;
  let ghostInterval = null;

  // Utilities
  function $id(id){ return document.getElementById(id); }
  function postToParent(message) {
    // send with wildcard — parent must verify ev.origin if necessary
    if (window.parent && window.parent !== window) {
      try { window.parent.postMessage(message, "*"); } catch(e) { /* ignore */ }
    }
  }

  // Create grid
  function createGrid() {
    const gridContainer = $id('grid-container');
    if (!gridContainer) return;
    gridContainer.innerHTML = '';
    squares = [];
    const squareSize = (window.innerWidth <= 600) ? 15 : 18;
    gridContainer.style.gridTemplateColumns = `repeat(${width}, ${squareSize}px)`;

    for (let i = 0; i < layout.length; i++) {
      const s = document.createElement('div');
      s.className = 'square';
      if (layout[i] === 1) s.classList.add('wall');
      if (layout[i] === 2) s.classList.add
