class Matrix {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.matrix = Array.from({ length: rows }, () => Array(cols).fill(1));
  }

  getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  generateConnectedMatrix() {
    let stack = [[0, 0]];
    let visited = new Set();
    visited.add("0,0");
    this.matrix[0][0] = 2;

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
          newRow < this.rows &&
          newCol >= 0 &&
          newCol < this.cols &&
          !visited.has(`${newRow},${newCol}`)
        ) {
          stack.push([newRow, newCol]);
          visited.add(`${newRow},${newCol}`);
          this.matrix[newRow][newCol] = 2;
        }
      }
    }
  }

  scatterWalls(wallDensity) {
    let numWalls = Math.floor(this.rows * this.cols * wallDensity);
    let wallsPlaced = 0;

    while (wallsPlaced < numWalls) {
      let row = this.getRandomInt(this.rows);
      let col = this.getRandomInt(this.cols);

      if (this.matrix[row][col] === 2) {
        this.matrix[row][col] = 1;
        wallsPlaced++;
      }
    }
  }

  isConnected() {
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
          newRow < this.rows &&
          newCol >= 0 &&
          newCol < this.cols &&
          this.matrix[newRow][newCol] === 2 &&
          !visited.has(`${newRow},${newCol}`)
        ) {
          queue.push([newRow, newCol]);
          visited.add(`${newRow},${newCol}`);
        }
      }
    }

    // Check if all 2's are visited
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.matrix[r][c] === 2 && !visited.has(`${r},${c}`)) {
          return false;
        }
      }
    }
    return true;
  }

  generateAndRenderMatrix() {
    do {
      this.generateConnectedMatrix();
      this.scatterWalls(0.3); // Adjust wall density here
    } while (!this.isConnected());
  }

  renderMatrix() {
    const matrixContainer = document.getElementById("matrix");
    matrixContainer.innerHTML = ""; // Clear previous content

    for (let i = 0; i < this.matrix.length; i++) {
      for (let j = 0; j < this.matrix[0].length; j++) {
        let cell = document.createElement("div");
        cell.classList.add("cell");
        cell.classList.add(this.matrix[i][j] === 1 ? "wall" : "floor");
        matrixContainer.appendChild(cell);
      }
    }
  }
}

// Initialize and render the matrix
const matrix = new Matrix(9, 16);
matrix.generateAndRenderMatrix();
matrix.renderMatrix();
