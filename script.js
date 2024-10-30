function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
  
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  // Több tetromino szekvencia generálása a bag rendszer használatával
  // https://tetris.fandom.com/wiki/Random_Generator
  function generateSequence() {
    const sequence = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
  
    while (sequence.length) {
      const rand = getRandomInt(0, sequence.length - 1);
      const name = sequence.splice(rand, 1)[0];
      tetrominoSequence.push(name);
    }
  }
  
  // Biztosítja, hogy mindig elegendő darab legyen a szekvenciában
  function ensureSequence() {
    while (tetrominoSequence.length < 14) { // Előre generálás a hézagok elkerülése érdekében
      generateSequence();
    }
  }
  
  // A következő tetromino megszerzése a szekvenciában
  function getNextTetromino() {
    ensureSequence();
  
    const name = tetrominoSequence.pop();
    const matrix = tetrominos[name];
  
    // Az I és O középen kezd, az összes többi bal-középen
    const col = playfield[0].length / 2 - Math.ceil(matrix[0].length / 2);
  
    // Az I a 21. sorban kezd (-1), az összes többi a 22. sorban (-2)
    const row = name === 'I' ? -1 : -2;
  
    return {
      name: name,      // a darab neve (L, O, stb.)
      matrix: matrix,  // az aktuális forgatási mátrix
      row: row,        // aktuális sor (a képernyőn kívül kezd)
      col: col         // aktuális oszlop
    };
  }
  
  // Egy NxN mátrix 90 fokos elforgatása az óramutató járásával megegyező irányban
  function rotate(matrix) {
    const N = matrix.length - 1;
    const result = matrix.map((row, i) =>
      row.map((val, j) => matrix[N - j][i])
    );
  
    return result;
  }
  
  // Egy NxN mátrix 90 fokos elforgatása az óramutató járásával ellentétes irányban
  function rotateCounterclockwise(matrix) {
    const N = matrix.length - 1;
    const result = matrix.map((row, i) =>
      row.map((val, j) => matrix[j][N - i])
    );
  
    return result;
  }
  
  // Ellenőrzi, hogy az új mátrix/sor/oszlop érvényes-e
  function isValidMove(matrix, cellRow, cellCol) {
    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        if (matrix[row][col] && (
            // a játék határain kívül
            cellCol + col < 0 ||
            cellCol + col >= playfield[0].length ||
            cellRow + row >= playfield.length ||
            // ütközik egy másik darabbal
            playfield[cellRow + row][cellCol + col])
          ) {
          return false;
        }
      }
    }
  
    return true;
  }
  
  // A tetromino elhelyezése a játéktéren
  function placeTetromino() {
    for (let row = 0; row < tetromino.matrix.length; row++) {
      for (let col = 0; col < tetromino.matrix[row].length; col++) {
        if (tetromino.matrix[row][col]) {
  
          // játék vége, ha a darab bármely része a képernyőn kívül van
          if (tetromino.row + row < 0) {
            return showGameOver();
          }
  
          playfield[tetromino.row + row][tetromino.col + col] = tetromino.name;
        }
      }
    }
  
    // Ellenőrzi a sorok törlését alulról felfelé haladva
    for (let row = playfield.length - 1; row >= 0; ) {
      if (playfield[row].every(cell => !!cell)) {
  
        // minden sor lejjebb esik
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
    canHold = true; // Engedélyezi a tartást a tetromino elhelyezése után
  }
  
  // A játék vége képernyő megjelenítése
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
  
  // Nyilvántartja, hogy mi van a játék minden cellájában egy 2D tömb segítségével
  // A tetris játéktér 10x20, néhány sor a képernyőn kívül van
  const playfield = [];
  
  // Az üres állapot feltöltése
  for (let row = -2; row < 20; row++) {
    playfield[row] = [];
  
    for (let col = 0; col < 10; col++) {
      playfield[row][col] = 0;
    }
  }
  
  // Hogyan kell rajzolni minden tetrominot
  // https://tetris.fandom.com/wiki/SRS
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
  
  // Minden tetromino színe
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
  let rAF = null;  // Nyilvántartja az animációs képkockát, hogy le lehessen állítani
  let gameOver = false;
  
  // Kiszámítja a legalsó pozíciót, ahová az aktuális darab eljuthat az aktuális forgatásban
  function getGhostPosition() {
    let ghostRow = tetromino.row;
  
    while (isValidMove(tetromino.matrix, ghostRow + 1, tetromino.col)) {
      ghostRow++;
    }
  
    return ghostRow;
  }
  
  // Játék ciklus
  function loop() {
    rAF = requestAnimationFrame(loop);
    context.clearRect(0,0,canvas.width,canvas.height);
  
    // Az irányvonalak rajzolása
    context.strokeStyle = 'gray';
    context.lineWidth = 1;
    for (let col = 0; col < 10; col++) {
      context.beginPath();
      context.moveTo(col * grid, 0);
      context.lineTo(col * grid, canvas.height);
      context.stroke();
    }
  
    // A játéktér rajzolása
    for (let row = 0; row < 20; row++) {
      for (let col = 0; col < 10; col++) {
        if (playfield[row][col]) {
          const name = playfield[row][col];
          context.fillStyle = colors[name];
  
          // 1 px kisebb rajzolása, mint a rács, rácshatást hoz létre
          context.fillRect(col * grid, row * grid, grid-1, grid-1);
        }
      }
    }
  
    // A szellem darab rajzolása
    const ghostRow = getGhostPosition();
    context.fillStyle = 'rgba(255, 255, 255, 0.3)'; // félig átlátszó fehér a szellem darabhoz
    for (let row = 0; row < tetromino.matrix.length; row++) {
      for (let col = 0; col < tetromino.matrix[row].length; col++) {
        if (tetromino.matrix[row][col]) {
          context.fillRect((tetromino.col + col) * grid, (ghostRow + row) * grid, grid-1, grid-1);
        }
      }
    }
  
    // Az aktív tetromino rajzolása
    if (tetromino) {
  
      // A tetromino minden 35. képkockánál esik
      if (++count > 35) {
        tetromino.row++;
        count = 0;
  
        // A darab elhelyezése, ha bármibe ütközik
        if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.col)) {
          tetromino.row--;
          placeTetromino();
        }
      }
  
      context.fillStyle = colors[tetromino.name];
  
      for (let row = 0; row < tetromino.matrix.length; row++) {
        for (let col = 0; col < tetromino.matrix[row].length; col++) {
          if (tetromino.matrix[row][col]) {
  
            // 1 px kisebb rajzolása, mint a rács, rácshatást hoz létre
            context.fillRect((tetromino.col + col) * grid, (tetromino.row + row) * grid, grid-1, grid-1);
          }
        }
      }
    }
  
    // A tartott tetromino rajzolása
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
  
    // A következő tetrominok rajzolása
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
  
  // Funkció a jelenlegi tetromino tartására
  function holdTetromino() {
    if (!canHold) return;
  
    if (heldTetromino) {
      // A jelenlegi tetromino cseréje a tartottal
      [tetromino, heldTetromino] = [heldTetromino, tetromino];
      // A becserélt tetromino pozíciójának visszaállítása
      tetromino.row = heldTetromino.name === 'I' ? -1 : -2;
      tetromino.col = playfield[0].length / 2 - Math.ceil(tetromino.matrix[0].length / 2);
    } else {
      // A jelenlegi tetromino tartása és egy új megszerzése
      heldTetromino = tetromino;
      tetromino = getNextTetromino();
    }
  
    canHold = false; // Megakadályozza a többszöri tartást egymás után
  }
  
  // Billentyűzet események figyelése az aktív tetromino mozgatásához
  document.addEventListener('keydown', function(e) {
    if (gameOver) return;
  
    // 'A' billentyű (balra mozgatás)
    if (e.which === 65) {
      const col = tetromino.col - 1;
      if (isValidMove(tetromino.matrix, tetromino.row, col)) {
        tetromino.col = col;
      }
    }
  
    // 'D' billentyű (jobbra mozgatás)
    if (e.which === 68) {
      const col = tetromino.col + 1;
      if (isValidMove(tetromino.matrix, tetromino.row, col)) {
        tetromino.col = col;
      }
    }
  
    // 'K' billentyű (forgatás az óramutató járásával ellentétes irányban)
    if (e.which === 75) {
      const matrix = rotateCounterclockwise(tetromino.matrix);
      if (isValidMove(matrix, tetromino.row, tetromino.col)) {
        tetromino.matrix = matrix;
      }
    }
  
    // ';' billentyű (forgatás az óramutató járásával megegyező irányban)
    if (e.which === 186) {
      const matrix = rotate(tetromino.matrix);
      if (isValidMove(matrix, tetromino.row, tetromino.col)) {
        tetromino.matrix = matrix;
      }
    }
  
    // 'S' billentyű (lágy esés)
    if(e.which === 83) {
      const row = tetromino.row + 1;
      if (!isValidMove(tetromino.matrix, row, tetromino.col)) {
        tetromino.row = row - 1;
        placeTetromino();
        return;
      }
      tetromino.row = row;
    }
  
    // 'L' billentyű (kemény esés)
    if (e.which === 76) {
      const ghostRow = getGhostPosition();
      tetromino.row = ghostRow;
      placeTetromino();
    }
  
    // '.' billentyű (tartás)
    if (e.which === 190) {
      holdTetromino();
    }
  });
  
  // A játék indítása
  rAF = requestAnimationFrame(loop);