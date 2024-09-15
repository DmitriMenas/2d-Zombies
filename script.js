// Initialize canvas and context
let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");
let canvasWidth = 4800;
let canvasHeight = 2700;
// Global arrays
let bullets = [];
let mouseX = 0;
let mouseY = 0;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

// Player images
let playerDownImg = new Image();
playerDownImg.src = "./characterside-down.png";

let playerUpImg = new Image();
playerUpImg.src = "./characterside-up.png";

let playerRightImg = new Image();
playerRightImg.src = "./characterside-right.png";

let playerLeftImg = new Image();
playerLeftImg.src = "./characterside-left.png";

// Coin image
let coinImg = new Image();
coinImg.src = "./coin.png";

// Zombie images
let zombieDownImg = new Image();
zombieDownImg.src = "./zombie.png";

let zombieRightImg = new Image();
zombieRightImg.src = "./zombie.png";

let zombieLeftImg = new Image();
zombieLeftImg.src = "./zombie.png";

let zombieUpImg = new Image();
zombieUpImg.src = "./zombie.png";

// Player class
class Player {
  img;
  width = 250;
  height = 250;
  movingRight = false;
  movingLeft = false;
  movingUp = false;
  movingDown = false;
  speed = 10;

  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.img = playerDownImg;
  }

  draw() {
    context.drawImage(this.img, this.x, this.y, this.width, this.height);
  }

  update() {
    this.updateMovement();
  }

  updateMovement() {
    let dx = 0;
    let dy = 0;

    if (this.movingRight) {
      dx += this.speed;
      this.img = playerRightImg;
    }
    if (this.movingLeft) {
      dx -= this.speed;
      this.img = playerLeftImg;
    }
    if (this.movingUp) {
      dy -= this.speed;
      this.img = playerUpImg;
    }
    if (this.movingDown) {
      dy += this.speed;
      this.img = playerDownImg;
    }

    if (dx != 0 && dy != 0) {
      dx *= 0.8;
      dy *= 0.8;
    }

    // Check collision in horizontal direction
    for (let i = 0; i < barrierBoxes.length; i++) {
      let box = barrierBoxes[i];
      if (
        collideObjects(
          this.x + dx,
          this.y,
          this.width,
          this.height,
          box.x,
          box.y,
          box.width,
          box.height
        )
      ) {
        dx = this.movingRight
          ? box.x - (this.x + this.width)
          : -(this.x - (box.x + box.width));
      }
    }

    // Check collision in vertical direction
    for (let i = 0; i < barrierBoxes.length; i++) {
      let box = barrierBoxes[i];
      if (
        collideObjects(
          this.x,
          this.y + dy,
          this.width,
          this.height,
          box.x,
          box.y,
          box.width,
          box.height
        )
      ) {
        dy = this.movingDown
          ? box.y - (this.y + this.height)
          : -(this.y - (box.y + box.height));
      }
    }

    // Update player position
    this.x += dx;
    this.y += dy;

    // Ensure player stays within canvas bounds
    if (this.x + this.width > canvasWidth) {
      this.x = canvasWidth - this.width;
    } else if (this.x < 0) {
      this.x = 0;
    }

    if (this.y + this.height > canvasHeight) {
      this.y = canvasHeight - this.height;
    } else if (this.y < 0) {
      this.y = 0;
    }
  }

  // Add to Player class
  shoot() {
    const angle = Math.atan2(
      mouseY - (this.y + this.height / 2),
      mouseX - (this.x + this.width / 2)
    );
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    bullets.push(
      new Bullet(this.x + this.width / 2, this.y + this.height / 2, dx, dy)
    );
  }
}

// Zombie class
class Zombie {
  img;
  width = 250;
  height = 250;
  speed = 5;
  followRange = 800; // Distance within which the zombie starts following

  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.img = zombieDownImg;
  }

  draw() {
    context.drawImage(this.img, this.x, this.y, this.width, this.height);
  }

  update(player) {
    this.updateMovement(player);
  }

  updateMovement(player) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < this.followRange) {
      const angle = Math.atan2(dy, dx);
      const moveX = Math.cos(angle) * this.speed;
      const moveY = Math.sin(angle) * this.speed;

      // Calculate new position
      let newX = this.x + moveX;
      let newY = this.y + moveY;

      // Check for collisions with barriers and adjust movement if necessary
      let collision = false;
      for (let i = 0; i < barrierBoxes.length; i++) {
        let box = barrierBoxes[i];

        if (
          collideObjects(
            newX,
            this.y,
            this.width,
            this.height,
            box.x,
            box.y,
            box.width,
            box.height
          )
        ) {
          newX = this.x; // Stop horizontal movement
        }

        if (
          collideObjects(
            this.x,
            newY,
            this.width,
            this.height,
            box.x,
            box.y,
            box.width,
            box.height
          )
        ) {
          newY = this.y; // Stop vertical movement
        }
      }

      // Update position if no collision
      this.x = newX;
      this.y = newY;

      // Update zombie image based on movement direction
      if (Math.abs(moveX) > Math.abs(moveY)) {
        this.img = moveX > 0 ? zombieRightImg : zombieLeftImg;
      } else {
        this.img = moveY > 0 ? zombieDownImg : zombieUpImg;
      }
    }
  }
}

// Coin class
class Coin {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.collected = false;
  }

  draw() {
    if (!this.collected) {
      context.drawImage(coinImg, this.x, this.y, this.width, this.height);
    }
  }

  checkCollision(player) {
    if (
      collideObjects(
        player.x,
        player.y,
        player.width,
        player.height,
        this.x,
        this.y,
        this.width,
        this.height
      )
    ) {
      this.collected = true;
      return true;
    }
    return false;
  }
}

class Bullet {
  constructor(x, y, dx, dy) {
    this.x = x;
    this.y = y;
    this.width = 20; // Width of the bullet
    this.height = 20; // Height of the bullet
    this.dx = dx; // Bullet speed in x direction
    this.dy = dy; // Bullet speed in y direction
    this.speed = 15; // Bullet speed
    this.remove = false; // Flag to indicate if the bullet should be removed
  }

  update() {
    this.x += this.dx * this.speed;
    this.y += this.dy * this.speed;

    // Check if the bullet is out of canvas bounds
    if (
      this.x < 0 ||
      this.x > canvasWidth ||
      this.y < 0 ||
      this.y > canvasHeight
    ) {
      this.remove = true;
    }
  }

  draw() {
    context.fillStyle = "red"; // Bullet color
    context.fillRect(this.x, this.y, this.width, this.height);
  }
}

// Collision Box class
class CollisionBox {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  draw() {
    context.fillStyle = "rgba(0, 0, 0, 0)";
    context.fillRect(this.x, this.y, this.width, this.height);
  }
}

// Barrier Boxes
let barrierBoxes = [];
let coins = [];
let zombies = []; // Declare zombies here

// Check if two boxes collide
function collideObjects(
  obj1x,
  obj1y,
  obj1w,
  obj1h,
  obj2x,
  obj2y,
  obj2w,
  obj2h
) {
  return (
    obj1x + obj1w > obj2x &&
    obj1x < obj2x + obj2w &&
    obj1y + obj1h > obj2y &&
    obj1y < obj2y + obj2h
  );
}

// Update barrierBoxes function
function updateBarrierBoxes() {
  barrierBoxes = [];
  const walls = document.querySelectorAll(".wall");
  walls.forEach((wall) => {
    const rect = wall.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    const x = rect.left - canvasRect.left;
    const y = rect.top - canvasRect.top;
    const width = rect.width;
    const height = rect.height;
    barrierBoxes.push(new CollisionBox(x, y, width, height));
  });
}

// Randomly place a coin on a valid floor cell
function placeRandomCoin() {
  const floors = document.querySelectorAll(".floor");
  const validFloors = Array.from(floors).filter((floor) => {
    const rect = floor.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    const x = rect.left - canvasRect.left;
    const y = rect.top - canvasRect.top;
    return !barrierBoxes.some((box) =>
      collideObjects(x, y, 50, 50, box.x, box.y, box.width, box.height)
    );
  });

  if (validFloors.length > 0) {
    const randomFloor =
      validFloors[Math.floor(Math.random() * validFloors.length)];
    const rect = randomFloor.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    const x = rect.left - canvasRect.left;
    const y = rect.top - canvasRect.top;
    coins.push(new Coin(x, y, 250, 250));
  }
}

// Randomly place zombies on valid floor cells
function placeRandomZombies(numZombies) {
  const floors = document.querySelectorAll(".floor");
  const validFloors = Array.from(floors).filter((floor) => {
    const rect = floor.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    const x = rect.left - canvasRect.left;
    const y = rect.top - canvasRect.top;
    return !barrierBoxes.some((box) =>
      collideObjects(x, y, 300, 300, box.x, box.y, box.width, box.height)
    );
  });

  if (validFloors.length > 0) {
    zombies = [];
    for (let i = 0; i < numZombies; i++) {
      const randomFloor =
        validFloors[Math.floor(Math.random() * validFloors.length)];
      const rect = randomFloor.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      const x = rect.left - canvasRect.left;
      const y = rect.top - canvasRect.top;
      zombies.push(new Zombie(x, y));
    }
  }
}

//game loop
// Update window.onload function
window.onload = function () {
  updateBarrierBoxes();
  placeRandomCoin();
  placeRandomZombies(3); // Example to place 3 zombies randomly

  const player = new Player(200, 300);

  document.addEventListener("keydown", keyDown);
  document.addEventListener("keyup", keyUp);
  document.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
  });
  document.addEventListener("click", () => player.shoot()); // Add this line for shooting

  setInterval(update, 1000 / 60);

  function update() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    player.update();
    player.draw();

    // Update and draw bullets
    bullets = bullets.filter((bullet) => !bullet.remove); // Remove bullets that should be deleted
    bullets.forEach((bullet) => {
      bullet.update();
      bullet.draw();

      // Check for collisions with zombies
      zombies.forEach((zombie) => {
        if (
          collideObjects(
            bullet.x,
            bullet.y,
            bullet.width,
            bullet.height,
            zombie.x,
            zombie.y,
            zombie.width,
            zombie.height
          )
        ) {
          // Handle zombie hit
          zombies = zombies.filter((z) => z !== zombie); // Remove the zombie
          bullet.remove = true; // Remove the bullet
        }
      });

      // Check for collisions with barriers
      barrierBoxes.forEach((box) => {
        if (
          collideObjects(
            bullet.x,
            bullet.y,
            bullet.width,
            bullet.height,
            box.x,
            box.y,
            box.width,
            box.height
          )
        ) {
          bullet.remove = true; // Remove the bullet if it hits a barrier
        }
      });
    });

    barrierBoxes.forEach((box) => box.draw());
    coins.forEach((coin) => {
      if (coin.checkCollision(player)) {
        console.log("Coin collected!");
      }
      coin.draw();
    });

    zombies.forEach((zombie) => {
      zombie.update(player); // Update each zombie with the player
      zombie.draw();
    });
  }

  // Movement functions
  function keyDown(e) {
    switch (e.key) {
      case "w":
      case "ArrowUp":
        player.movingUp = true;
        break;
      case "s":
      case "ArrowDown":
        player.movingDown = true;
        break;
      case "a":
      case "ArrowLeft":
        player.movingLeft = true;
        break;
      case "d":
      case "ArrowRight":
        player.movingRight = true;
        break;
    }
  }

  function keyUp(e) {
    switch (e.key) {
      case "w":
      case "ArrowUp":
        player.movingUp = false;
        break;
      case "s":
      case "ArrowDown":
        player.movingDown = false;
        break;
      case "a":
      case "ArrowLeft":
        player.movingLeft = false;
        break;
      case "d":
      case "ArrowRight":
        player.movingRight = false;
        break;
    }
  }
};
