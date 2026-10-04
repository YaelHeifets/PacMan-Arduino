const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 700;
canvas.height = 700;


// -------------------------
// PAC-MAN
// -------------------------

const pacman = {
    x: 350,
    y: 612.5,
    radius: 17,
    speed: 3,
    direction: "LEFT",
    nextDirection: "LEFT"
};

// -------------------------
// BLINKY
// -------------------------

const blinky = {
    x: 332.5,
    y: 367.5,
    startX: 332.5,
    startY: 367.5,
    radius: 15,
    speed: 1.5,
    direction: "LEFT",
    color: "red",
    lastDecisionRow: -1,
    lastDecisionCol: -1
};

const TILE_SIZE = 35;

const maze = [
    "####################",
    "#........##........#",
    "#.####.#.##.#.####.#",
    "#o####.#.##.#.####o#",
    "#..................#",
    "#.####.######.####.#",
    "#......##..##......#",
    "######.##..##.######",
    "######........######",
    "######.##--##.######",
    "#........--........#",
    "######.######.######",
    "######........######",
    "#........##........#",
    "#.####.#.##.#.####.#",
    "#o..##........##..o#",
    "###.##.######.##.###",
    "#..................#",
    "#.################.#",
    "####################"
];

const mazeGrid = maze.map(row => row.split(""));

function drawMaze() {

    for (let row = 0; row < maze.length; row++) {

        for (let col = 0; col < maze[row].length; col++) {

            const tile = mazeGrid[row][col];

            const x = col * TILE_SIZE;
            const y = row * TILE_SIZE;

            if (tile === "#") {
                ctx.fillStyle = "#2121ff";
                ctx.fillRect(
                    x,
                    y,
                    TILE_SIZE,
                    TILE_SIZE
                );
            }

            else if (tile === ".") {
                ctx.beginPath();
                ctx.arc(
                    x + TILE_SIZE / 2,
                    y + TILE_SIZE / 2,
                    3,
                    0,
                    Math.PI * 2
                );

                ctx.fillStyle = "#ffb8ae";
                ctx.fill();
            }

            else if (tile === "o") {
                ctx.beginPath();
                ctx.arc(
                    x + TILE_SIZE / 2,
                    y + TILE_SIZE / 2,
                    7,
                    0,
                    Math.PI * 2
                );

                ctx.fillStyle = "#ffb8ae";
                ctx.fill();
            }
        }
    }
}

// -------------------------
// INPUT
// -------------------------

function handleDirection(direction) {

    pacman.nextDirection = direction;

}

document.addEventListener("keydown", function(event) {

    if (event.key === "ArrowUp") {
        handleDirection("UP");
    }

    else if (event.key === "ArrowDown") {
        handleDirection("DOWN");
    }

    else if (event.key === "ArrowLeft") {
        handleDirection("LEFT");
    }

    else if (event.key === "ArrowRight") {
        handleDirection("RIGHT");
    }

});

function isWall(x, y) {

    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);

    // Outside the maze = wall
    if (
        row < 0 ||
        row >= maze.length ||
        col < 0 ||
        col >= maze[0].length
    ) {
        return true;
    }

    return mazeGrid[row][col] === "#";
}

function canPacmanMoveTo(x, y) {

    const r = pacman.radius - 2;

    return (
        !isWall(x - r, y - r) &&
        !isWall(x + r, y - r) &&
        !isWall(x - r, y + r) &&
        !isWall(x + r, y + r)
    );
}

function canGhostMoveTo(ghost, x, y) {

    const r = ghost.radius - 2;

    return (
        !isWall(x - r, y - r) &&
        !isWall(x + r, y - r) &&
        !isWall(x - r, y + r) &&
        !isWall(x + r, y + r)
    );
}

function checkGhostCollision(ghost) {

    const dx = pacman.x - ghost.x;
    const dy = pacman.y - ghost.y;

    const distance = Math.sqrt(
        dx * dx + dy * dy
    );

    return distance <
        pacman.radius + ghost.radius;
}

function handleGhostCollision(ghost) {

    if (!checkGhostCollision(ghost)) {
        return;
    }

    if (powerMode) {

        addScore(200);

        ghost.x = ghost.startX;
        ghost.y = ghost.startY;
        ghost.direction = "LEFT";

        ghost.lastDecisionRow = -1;
        ghost.lastDecisionCol = -1;
    }

    else {

        lives--;

        document.getElementById("lives").textContent =
            lives;

        if (lives <= 0) {

            gameOver = true;

            document.getElementById("status").textContent =
                "GAME OVER";
        }

        else {
            resetPacman();
        }
    }
}

function getGhostNextPosition(ghost, direction) {

    let x = ghost.x;
    let y = ghost.y;

    switch (direction) {

        case "UP":
            y -= ghost.speed;
            break;

        case "DOWN":
            y += ghost.speed;
            break;

        case "LEFT":
            x -= ghost.speed;
            break;

        case "RIGHT":
            x += ghost.speed;
            break;
    }

    return { x, y };
}

function chooseGhostDirection(ghost) {

    const directions = [
        "UP",
        "DOWN",
        "LEFT",
        "RIGHT"
    ];

    const oppositeDirections = {
        UP: "DOWN",
        DOWN: "UP",
        LEFT: "RIGHT",
        RIGHT: "LEFT"
    };

    const possibleDirections = [];

    for (let direction of directions) {

        // Don't go backwards unless necessary
        if (
            direction ===
            oppositeDirections[ghost.direction]
        ) {
            continue;
        }

        let testX = ghost.x;
        let testY = ghost.y;

        switch (direction) {

            case "UP":
                testY -= TILE_SIZE / 2;
                break;

            case "DOWN":
                testY += TILE_SIZE / 2;
                break;

            case "LEFT":
                testX -= TILE_SIZE / 2;
                break;

            case "RIGHT":
                testX += TILE_SIZE / 2;
                break;
        }

        if (
            canGhostMoveTo(
                ghost,
                testX,
                testY
            )
        ) {
            possibleDirections.push(direction);
        }
    }

    // If there is no other option,
    // turn around
    if (possibleDirections.length === 0) {

        ghost.direction =
            oppositeDirections[ghost.direction];

        return;
    }

    let bestDirection = possibleDirections[0];
let shortestDistance = Infinity;

for (let direction of possibleDirections) {

    let targetX = ghost.x;
    let targetY = ghost.y;

    switch (direction) {

        case "UP":
            targetY -= TILE_SIZE;
            break;

        case "DOWN":
            targetY += TILE_SIZE;
            break;

        case "LEFT":
            targetX -= TILE_SIZE;
            break;

        case "RIGHT":
            targetX += TILE_SIZE;
            break;
    }

    const distance = Math.sqrt(
        Math.pow(pacman.x - targetX, 2) +
        Math.pow(pacman.y - targetY, 2)
    );

    if (distance < shortestDistance) {

        shortestDistance = distance;
        bestDirection = direction;
    }
}

ghost.direction = bestDirection;
}

function updateGhost(ghost) {

    const col = Math.floor(ghost.x / TILE_SIZE);
    const row = Math.floor(ghost.y / TILE_SIZE);

    const centerX =
        col * TILE_SIZE + TILE_SIZE / 2;

    const centerY =
        row * TILE_SIZE + TILE_SIZE / 2;

    const nearCenter =
        Math.abs(ghost.x - centerX) <= ghost.speed &&
        Math.abs(ghost.y - centerY) <= ghost.speed;

    const newTile =
        row !== ghost.lastDecisionRow ||
        col !== ghost.lastDecisionCol;


    // Choose direction only once per tile
    if (nearCenter && newTile) {

        ghost.x = centerX;
        ghost.y = centerY;

        chooseGhostDirection(ghost);

        ghost.lastDecisionRow = row;
        ghost.lastDecisionCol = col;
    }


    const nextPosition =
        getGhostNextPosition(
            ghost,
            ghost.direction
        );


    if (
        canGhostMoveTo(
            ghost,
            nextPosition.x,
            nextPosition.y
        )
    ) {
        ghost.x = nextPosition.x;
        ghost.y = nextPosition.y;
    }

    else {
        chooseGhostDirection(ghost);
    }
}

function getNextPosition(direction) {

    let x = pacman.x;
    let y = pacman.y;

    switch (direction) {

        case "UP":
            y -= pacman.speed;
            break;

        case "DOWN":
            y += pacman.speed;
            break;

        case "LEFT":
            x -= pacman.speed;
            break;

        case "RIGHT":
            x += pacman.speed;
            break;
    }

    return { x, y };
}

// -------------------------
// UPDATE
// -------------------------

function updatePacman() {

    // Try the direction requested by the player
    const requestedMove = getNextPosition(
        pacman.nextDirection
    );

    if (
        canPacmanMoveTo(
            requestedMove.x,
            requestedMove.y
        )
    ) {
        pacman.direction = pacman.nextDirection;
    }

    // Continue moving in the current direction
    const nextMove = getNextPosition(
        pacman.direction
    );

    if (
        canPacmanMoveTo(
            nextMove.x,
            nextMove.y
        )
    ) {
        pacman.x = nextMove.x;
        pacman.y = nextMove.y;
    }

    eatDot();
}


// -------------------------
// DRAW
// -------------------------

function drawPacman() {

    ctx.beginPath();

    ctx.arc(
        pacman.x,
        pacman.y,
        pacman.radius,
        0.2 * Math.PI,
        1.8 * Math.PI
    );

    ctx.lineTo(pacman.x, pacman.y);

    ctx.closePath();

    if (powerMode) {
    ctx.fillStyle = "#ffff80";
    } 
    else {
        ctx.fillStyle = "yellow";
    }
    ctx.fill();
}

let score = 0;

let highScore = localStorage.getItem("pacmanHighScore");
let powerMode = false;
let powerTimer = null;
let lives = 3;
let gameOver = false;

if (highScore === null) {
    highScore = 0;
} else {
    highScore = Number(highScore);
}

document.getElementById("highScore").textContent = highScore;

function addScore(points) {

    score += points;

    document.getElementById("score").textContent = score;

    if (score > highScore) {

        highScore = score;

        document.getElementById("highScore").textContent = highScore;

        localStorage.setItem(
            "pacmanHighScore",
            highScore
        );
    }
}

function eatDot() {

    const col = Math.floor(pacman.x / TILE_SIZE);
    const row = Math.floor(pacman.y / TILE_SIZE);

    const tile = mazeGrid[row][col];
    console.log("row:", row, "col:", col, "tile:", tile);

    if (tile === ".") {

        mazeGrid[row][col] = " ";

        addScore(10);
    }

    else if (tile === "o") {

        mazeGrid[row][col] = " ";

        addScore(50);

        activatePowerMode();
    }
}

function activatePowerMode() {

    powerMode = true;

    document.getElementById("status").textContent =
        "POWER MODE!";

    // If Pac-Man eats another Power Pellet
    // while Power Mode is already active,
    // restart the timer.
    if (powerTimer !== null) {
        clearTimeout(powerTimer);
    }

    powerTimer = setTimeout(function() {

        powerMode = false;

        document.getElementById("status").textContent =
            "Use arrow keys to move";

        powerTimer = null;

    }, 8000);
}

function drawGhost(ghost) {

    ctx.beginPath();

    ctx.arc(
        ghost.x,
        ghost.y,
        ghost.radius,
        Math.PI,
        0
    );

    ctx.lineTo(
        ghost.x + ghost.radius,
        ghost.y + ghost.radius
    );

    ctx.lineTo(
        ghost.x + ghost.radius / 2,
        ghost.y + ghost.radius - 5
    );

    ctx.lineTo(
        ghost.x,
        ghost.y + ghost.radius
    );

    ctx.lineTo(
        ghost.x - ghost.radius / 2,
        ghost.y + ghost.radius - 5
    );

    ctx.lineTo(
        ghost.x - ghost.radius,
        ghost.y + ghost.radius
    );

    ctx.closePath();

    if (powerMode) {
        ctx.fillStyle = "blue";
    } else {
        ctx.fillStyle = ghost.color;
    }

    ctx.fill();


    // Eyes
    ctx.fillStyle = "white";

    ctx.beginPath();
    ctx.arc(
        ghost.x - 6,
        ghost.y - 3,
        4,
        0,
        Math.PI * 2
    );

    ctx.arc(
        ghost.x + 6,
        ghost.y - 3,
        4,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Pupils
    ctx.fillStyle = "black";

    ctx.beginPath();

    ctx.arc(
        ghost.x - 6,
        ghost.y - 3,
        2,
        0,
        Math.PI * 2
    );

    ctx.arc(
        ghost.x + 6,
        ghost.y - 3,
        2,
        0,
        Math.PI * 2
    );

    ctx.fill();
}

function resetPacman() {

    pacman.x = 350;
    pacman.y = 612.5;

    pacman.direction = "LEFT";
    pacman.nextDirection = "LEFT";

    blinky.x = blinky.startX;
    blinky.y = blinky.startY;
    blinky.direction = "LEFT";

    blinky.lastDecisionRow = -1;
    blinky.lastDecisionCol = -1;
}

// -------------------------
// GAME LOOP
// -------------------------

function gameLoop() {

    if (gameOver) {

    drawMaze();
    drawPacman();
    drawGhost(blinky);

    return;
    }

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    updatePacman();
    updateGhost(blinky);
    handleGhostCollision(blinky);

    drawMaze();
    drawPacman();
    drawGhost(blinky);

    requestAnimationFrame(gameLoop);
}


gameLoop();