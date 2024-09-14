const rows = 5;
const cols = 5;

// Helper functions for matrix operations
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// Generate a fully connected matrix with 2's
function generateConnectedMatrix() {
  let matrix = Array.from({ length: rows }, () => Array(cols).fill(1));
  let stack = [[0, 0]];
  let visited = new Set();
  visited.add("0,0");
  matrix[0][0] = 2;

  while (stack.length) {
    let [row, col] = stack.pop();
    let directions = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
    ];
    directions.sort(() => Math.random() - 0.5); // Randomize directions

    for (let [dr, dc] of directions) {
      let newRow = row + dr;
      let newCol = col + dc;

      if (
        newRow >= 0 &&
        newRow < rows &&
        newCol >= 0 &&
        newCol < cols &&
        !visited.has(`${newRow},${newCol}`)
      ) {
        stack.push([newRow, newCol]);
        visited.add(`${newRow},${newCol}`);
        matrix[newRow][newCol] = 2;
      }
    }
  }

  return matrix;
}

// Place walls without breaking connectivity
function scatterWalls(matrix, wallDensity) {
  let numWalls = Math.floor(rows * cols * wallDensity);
  let wallsPlaced = 0;

  while (wallsPlaced < numWalls) {
    let row = getRandomInt(rows);
    let col = getRandomInt(cols);

    if (matrix[row][col] === 2) {
      matrix[row][col] = 1;
      wallsPlaced++;
    }
  }
}

// Ensure all 2's are connected
function isConnected(matrix) {
  let startRow = 0,
    startCol = 0;
  let queue = [[startRow, startCol]];
  let visited = new Set();
  visited.add(`${startRow},${startCol}`);

  while (queue.length) {
    let [row, col] = queue.shift();
    let directions = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
    ];

    for (let [dr, dc] of directions) {
      let newRow = row + dr;
      let newCol = col + dc;

      if (
        newRow >= 0 &&
        newRow < rows &&
        newCol >= 0 &&
        newCol < cols &&
        matrix[newRow][newCol] === 2 &&
        !visited.has(`${newRow},${newCol}`)
      ) {
        queue.push([newRow, newCol]);
        visited.add(`${newRow},${newCol}`);
      }
    }
  }

  // Check if all 2's are visited
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (matrix[r][c] === 2 && !visited.has(`${r},${c}`)) {
        return false;
      }
    }
  }
  return true;
}

// Ensure connectivity and handle edge cases
function generateAndRenderMatrix() {
  let matrix;

  do {
    matrix = generateConnectedMatrix();
    scatterWalls(matrix, 0.3); // Adjust wall density here
  } while (!isConnected(matrix));

  return matrix;
}

// Render matrix on HTML page
function renderMatrix(matrix) {
  const matrixContainer = document.getElementById("matrix");
  matrixContainer.innerHTML = ""; // Clear previous content

  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[0].length; j++) {
      let cell = document.createElement("div");
      cell.classList.add("cell");
      cell.classList.add(matrix[i][j] === 1 ? "wall" : "floor");
      matrixContainer.appendChild(cell);
    }
  }
}

// Generate and render the matrix
let matrix = generateAndRenderMatrix();
renderMatrix(matrix);
