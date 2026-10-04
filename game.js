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
    radius: 15,
    speed: 1.5,
    direction: "LEFT",
    color: "red"
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

    const possibleDirections = [];

    for (let direction of directions) {

        const nextPosition =
            getGhostNextPosition(ghost, direction);

        if (
            canGhostMoveTo(
                ghost,
                nextPosition.x,
                nextPosition.y
            )
        ) {
            possibleDirections.push(direction);
        }
    }

    if (possibleDirections.length > 0) {

        const randomIndex = Math.floor(
            Math.random() * possibleDirections.length
        );

        ghost.direction =
            possibleDirections[randomIndex];
    }
}

function updateGhost(ghost) {

    let nextPosition =
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

// -------------------------
// GAME LOOP
// -------------------------

function gameLoop() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    updatePacman();
    updateGhost(blinky);

    drawMaze();
    drawPacman();
    drawGhost(blinky);

    requestAnimationFrame(gameLoop);
}


gameLoop();