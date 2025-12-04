(() => {
  const size = 5;
  const tilesWrap = document.getElementById('tiles');
  const gridEl = document.getElementById('grid');
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const newBtn = document.getElementById('newBtn');
  const overlay = document.getElementById('overlay');
  const overlayScore = document.getElementById('overlayScore');
  const retry = document.getElementById('retry');

  let board = [];
  let score = 0;
  let best = Number(localStorage.getItem('best2048') || 0);
  let lastSwapn = null; //pop

  //sound
  const sMove = new Audio('assets/move.wav');
  const sMerge = new Audio('assets/merge.wav');
  const sSpawn = new Audio('assets/spawn.wav');
  function playSafely(a){ a.currentTime = 0; a.play().catch(()=>{}); }

  const PAD = 16;
  const GAP = 12;
  function makeEmpty(){ board = Array.from({length:size}, ()=>Array(size).fill(0)); }

  function randomEmpty(){
    const list = [];
    for(let r = 0;r<size;r++) for(let c = 0; c<size;c++) if(board[r][c] === 0)list.push([r,c]);
    return list[Math.floor(Math.random()*list.length)];
  }
  function spawnTile(initial){
    const spot = randomEmpty();
    if(!spot) return false;
    const [r,c] = spot;
    board[r][c] = Math.random() < 0.9?2:4;
    lastSwapn=[r,c];
    requestAnimationFrame(()=> drawTiles());
    playSafely(sSpawn);
    if(!initial) checkGameOver();
    return true;
  }
  function startGame(){
    makeEmpty();
    score = 0;
    lastSwapn = null;
    updateScore();
    hidenOverlay();

    requestAnimationFrame(()=>{
      spawnTile(true);
      spawnTile(true);
      requestAnimationFrame(()=> drawTiles());
    });
  }
  function updateScore(){
    scoreEl.textContent = score;
    if(score>best){best=score; localStorage.setItem('best2048', best);}
    bestEl.textContent = best;
    }
    function transpose(b){return b[0].map((_,c)=>b.map(r=>r[c]));}
    function reverseRows(b){return b.map(r=>r.slice().reverse());}
    function squishRowLeft(row){
      const old = row.slice();
      let arr = row.filter(v=>v);
      let gained = 0;
      for(let i=0;i<arr.length-1;i++){
        if(arr[i] === arr[i+1]){
          arr[i] *= 2;
          gained += arr[i];
          arr.splice(i+1,1);
        }
      }
      while(arr.length < size) arr.push(0);
      return{arr, moved: !arr.every((v,i)=>v===old[i]), gained};
    }
    function move(dir){
      let rotated;
      if(dir === 'left') rotated = board.map(r=>r.slice());
      else if(dir === 'right') rotated = reverseRows(board);
      else if(dir === 'up') rotated = reverseRows(board);
      else if(dir === 'down') rotated = reverseRows(transpose(board));

      let moveAny = false;
      let gainedTotal = 0;
      const newBoard = Array.from({length:size}, ()=>Array(size).fill(0));
      for(let r=0;r<size;r++){
        const{arr,moved,gained} = squishRowLeft(rotated[r]);
        newBoard[r] = arr;
        if(moved) moveAny = true;
        gainedTotal += gained;
      }
      if(dir === 'left')board = newBoard;
      else if(dir === 'right') board = reverseRows(newBoard);
      else if(dir === 'up') board = transpose(newBoard);
      else if(dir === 'down') board = transpose(reverseRows(newBoard));
      if(movedAny){
        score+=gainedTotal;
        updateScore(sMove);
        playSafely(sMove);
        if(gainedTotal>0) playSafely(sMerge);
        setTimeout(()=> spawnTile(false),90);
      } else {
        requestAnimationFrame(()=> drawTiles());
      }
      return movedAny;
    }
    function drawTiles(){
      //old tile clear
      tilesWrap.innerHTML = '';
      const rect = gridEl.getBoundingClientRect();
      const outer = Math.min(rect.width, rect.height);
      const cell = (outer - PAD*2 - GAP*3)/4;
      for(let r = 0;r<size;r++){
        for(let c=0;c<size;c++){
          const val = board[r][c];
          if(!val) continue;

          const tile= document.createElement('div');
          tile.className = 'tile';
          tile.textContent = val;
          tile.classList.add(`val-${val <= 64? val : 'large'}`);
          const left = PAD + c * (cell+GAP);
          const top = PAD + r * (cell + GAP);
          
          tile.style.width = `${cell}px`;
          tile.style.height = `${cell}px`;
          tile.style.left = `${left}px`;
          tile.style.top = `${top}px`;
        }
      }
      }
    }
  }
});