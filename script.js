function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
  
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  // generate multiple tetromino sequences using the bag system
  // @see https://tetris.fandom.com/wiki/Random_Generator
  function generateSequence() {
    const sequence = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
  
    while (sequence.length) {
      const rand = getRandomInt(0, sequence.length - 1);
      const name = sequence.splice(rand, 1)[0];
      tetrominoSequence.push(name);
    }
  }
  
  // Ensure there are always enough pieces in the sequence
  function ensureSequence() {
    while (tetrominoSequence.length < 14) { // Generate ahead to avoid gaps
      generateSequence();
    }
  }
  
  // get the next tetromino in the sequence
  function getNextTetromino() {
    ensureSequence();
  
    const name = tetrominoSequence.pop();
    const matrix = tetrominos[name];
  
    // I and O start centered, all others start in left-middle
    const col = playfield[0].length / 2 - Math.ceil(matrix[0].length / 2);
  
    // I starts on row 21 (-1), all others start on row 22 (-2)
    const row = name === 'I' ? -1 : -2;
  
    return {
      name: name,      // name of the piece (L, O, etc.)
      matrix: matrix,  // the current rotation matrix
      row: row,        // current row (starts offscreen)
      col: col         // current col
    };
  }
  
  // rotate an NxN matrix 90deg clockwise
  // @see https://codereview.stackexchange.com/a/186834
  function rotate(matrix) {
    const N = matrix.length - 1;
    const result = matrix.map((row, i) =>
      row.map((val, j) => matrix[N - j][i])
    );
  
    return result;
  }
  
  // rotate an NxN matrix 90deg counterclockwise
  function rotateCounterclockwise(matrix) {
    const N = matrix.length - 1;
    const result = matrix.map((row, i) =>
      row.map((val, j) => matrix[j][N - i])
    );
  
    return result;
  }
  
  // check to see if the new matrix/row/col is valid
  function isValidMove(matrix, cellRow, cellCol) {
    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        if (matrix[row][col] && (
            // outside the game bounds
            cellCol + col < 0 ||
            cellCol + col >= playfield[0].length ||
            cellRow + row >= playfield.length ||
            // collides with another piece
            playfield[cellRow + row][cellCol + col])
          ) {
          return false;
        }
      }
    }
  
    return true;
  }
  
  // place the tetromino on the playfield
  function placeTetromino() {
    for (let row = 0; row < tetromino.matrix.length; row++) {
      for (let col = 0; col < tetromino.matrix[row].length; col++) {
        if (tetromino.matrix[row][col]) {
  
          // game over if piece has any part offscreen
          if (tetromino.row + row < 0) {
            return showGameOver();
          }
  
          playfield[tetromino.row + row][tetromino.col + col] = tetromino.name;
        }
      }
    }
  
    // check for line clears starting from the bottom and working our way up
    for (let row = playfield.length - 1; row >= 0; ) {
      if (playfield[row].every(cell => !!cell)) {
  
        // drop every row above this one
        for (let r = row; r >= 0; r--) {
          for (let c = 0; c < playfield[r].length; c++) {
            playfield[r][c] = playfield[r-1][c];
          }
        }
      }
      else {
        row--;
      }
    }
  
    tetromino = getNextTetromino();
    canHold = true; // Allow holding again after placing a tetromino
  }
  
  // show the game over screen
  function showGameOver() {
    cancelAnimationFrame(rAF);
    gameOver = true;
  
    context.fillStyle = 'black';
    context.globalAlpha = 0.75;
    context.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);
  
    context.globalAlpha = 1;
    context.fillStyle = 'white';
    context.font = '36px monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2);
  }
  
  const canvas = document.getElementById('game');
  const context = canvas.getContext('2d');
  const holdPieceCanvas = document.getElementById('hold-piece');
  const holdPieceContext = holdPieceCanvas.getContext('2d');
  const nextPiecesCanvas = document.getElementById('next-pieces');
  const nextPiecesContext = nextPiecesCanvas.getContext('2d');
  const grid = 32;
  const tetrominoSequence = [];
  
  // keep track of what is in every cell of the game using a 2d array
  // tetris playfield is 10x20, with a few rows offscreen
  const playfield = [];
  
  // populate the empty state
  for (let row = -2; row < 20; row++) {
    playfield[row] = [];
  
    for (let col = 0; col < 10; col++) {
      playfield[row][col] = 0;
    }
  }
  
  // how to draw each tetromino
  // @see https://tetris.fandom.com/wiki/SRS
  const tetrominos = {
    'I': [
      [0,0,0,0],
      [1,1,1,1],
      [0,0,0,0],
      [0,0,0,0]
    ],
    'J': [
      [1,0,0],
      [1,1,1],
      [0,0,0],
    ],
    'L': [
      [0,0,1],
      [1,1,1],
      [0,0,0],
    ],
    'O': [
      [1,1],
      [1,1],
    ],
    'S': [
      [0,1,1],
      [1,1,0],
      [0,0,0],
    ],
    'Z': [
      [1,1,0],
      [0,1,1],
      [0,0,0],
    ],
    'T': [
      [0,1,0],
      [1,1,1],
      [0,0,0],
    ]
  };
  
  // color of each tetromino
  const colors = {
    'I': 'cyan',
    'O': 'yellow',
    'T': 'purple',
    'S': 'green',
    'Z': 'red',
    'J': 'blue',
    'L': 'orange'
  };
  
  let count = 0;
  let tetromino = getNextTetromino();
  let heldTetromino = null;
  let canHold = true;
  let rAF = null;  // keep track of the animation frame so we can cancel it
  let gameOver = false;
  
  // Calculate the lowest position the current piece can go in the current rotation
  function getGhostPosition() {
    let ghostRow = tetromino.row;
  
    while (isValidMove(tetromino.matrix, ghostRow + 1, tetromino.col)) {
      ghostRow++;
    }
  
    return ghostRow;
  }
  
  // game loop
  function loop() {
    rAF = requestAnimationFrame(loop);
    context.clearRect(0,0,canvas.width,canvas.height);
  
    // draw the guide lines
    context.strokeStyle = 'gray';
    context.lineWidth = 1;
    for (let col = 0; col < 10; col++) {
      context.beginPath();
      context.moveTo(col * grid, 0);
      context.lineTo(col * grid, canvas.height);
      context.stroke();
    }
  
    // draw the playfield
    for (let row = 0; row < 20; row++) {
      for (let col = 0; col < 10; col++) {
        if (playfield[row][col]) {
          const name = playfield[row][col];
          context.fillStyle = colors[name];
  
          // drawing 1 px smaller than the grid creates a grid effect
          context.fillRect(col * grid, row * grid, grid-1, grid-1);
        }
      }
    }
  
    // draw the ghost piece
    const ghostRow = getGhostPosition();
    context.fillStyle = 'rgba(255, 255, 255, 0.3)'; // semi-transparent white for the ghost piece
    for (let row = 0; row < tetromino.matrix.length; row++) {
      for (let col = 0; col < tetromino.matrix[row].length; col++) {
        if (tetromino.matrix[row][col]) {
          context.fillRect((tetromino.col + col) * grid, (ghostRow + row) * grid, grid-1, grid-1);
        }
      }
    }
  
    // draw the active tetromino
    if (tetromino) {
  
      // tetromino falls every 35 frames
      if (++count > 35) {
        tetromino.row++;
        count = 0;
  
        // place piece if it runs into anything
        if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.col)) {
          tetromino.row--;
          placeTetromino();
        }
      }
  
      context.fillStyle = colors[tetromino.name];
  
      for (let row = 0; row < tetromino.matrix.length; row++) {
        for (let col = 0; col < tetromino.matrix[row].length; col++) {
          if (tetromino.matrix[row][col]) {
  
            // drawing 1 px smaller than the grid creates a grid effect
            context.fillRect((tetromino.col + col) * grid, (tetromino.row + row) * grid, grid-1, grid-1);
          }
        }
      }
    }
  
    // draw the held tetromino
    holdPieceContext.clearRect(0, 0, holdPieceCanvas.width, holdPieceCanvas.height);
    if (heldTetromino) {
      holdPieceContext.fillStyle = colors[heldTetromino.name];
      for (let row = 0; row < heldTetromino.matrix.length; row++) {
        for (let col = 0; col < heldTetromino.matrix[row].length; col++) {
          if (heldTetromino.matrix[row][col]) {
            holdPieceContext.fillRect(col * grid, row * grid, grid-1, grid-1);
          }
        }
      }
    }
  
    // draw the next tetrominos
    nextPiecesContext.clearRect(0, 0, nextPiecesCanvas.width, nextPiecesCanvas.height);
    for (let i = 0; i < 5; i++) {
      if (tetrominoSequence[tetrominoSequence.length - 1 - i]) {
        const nextTetromino = tetrominos[tetrominoSequence[tetrominoSequence.length - 1 - i]];
        nextPiecesContext.fillStyle = colors[tetrominoSequence[tetrominoSequence.length - 1 - i]];
        for (let row = 0; row < nextTetromino.length; row++) {
          for (let col = 0; col < nextTetromino[row].length; col++) {
            if (nextTetromino[row][col]) {
              nextPiecesContext.fillRect(col * grid, (row + i * 4) * grid, grid-1, grid-1);
            }
          }
        }
      }
    }
  }
  
  // Function to handle holding the current tetromino
  function holdTetromino() {
    if (!canHold) return;
  
    if (heldTetromino) {
      // Swap the current tetromino with the held one
      [tetromino, heldTetromino] = [heldTetromino, tetromino];
      // Reset the position of the swapped-in tetromino
      tetromino.row = heldTetromino.name === 'I' ? -1 : -2;
      tetromino.col = playfield[0].length / 2 - Math.ceil(tetromino.matrix[0].length / 2);
    } else {
      // Hold the current tetromino and get a new one
      heldTetromino = tetromino;
      tetromino = getNextTetromino();
    }
  
    canHold = false; // Prevent multiple holds in a row
  }
  
  // listen to keyboard events to move the active tetromino
  document.addEventListener('keydown', function(e) {
    if (gameOver) return;
  
    // 'A' key (move left)
    if (e.which === 65) {
      const col = tetromino.col - 1;
      if (isValidMove(tetromino.matrix, tetromino.row, col)) {
        tetromino.col = col;
      }
    }
  
    // 'D' key (move right)
    if (e.which === 68) {
      const col = tetromino.col + 1;
      if (isValidMove(tetromino.matrix, tetromino.row, col)) {
        tetromino.col = col;
      }
    }
  
    // 'K' key (rotate counterclockwise)
    if (e.which === 75) {
      const matrix = rotateCounterclockwise(tetromino.matrix);
      if (isValidMove(matrix, tetromino.row, tetromino.col)) {
        tetromino.matrix = matrix;
      }
    }
  
    // ';' key (rotate clockwise)
    if (e.which === 186) {
      const matrix = rotate(tetromino.matrix);
      if (isValidMove(matrix, tetromino.row, tetromino.col)) {
        tetromino.matrix = matrix;
      }
    }
  
    // 'S' key (soft drop)
    if(e.which === 83) {
      const row = tetromino.row + 1;
      if (!isValidMove(tetromino.matrix, row, tetromino.col)) {
        tetromino.row = row - 1;
        placeTetromino();
        return;
      }
      tetromino.row = row;
    }
  
    // 'L' key (hard drop)
    if (e.which === 76) {
      const ghostRow = getGhostPosition();
      tetromino.row = ghostRow;
      placeTetromino();
    }
  
    // '.' key (hold)
    if (e.which === 190) {
      holdTetromino();
    }
  });
  
  // start the game
  rAF = requestAnimationFrame(loop);