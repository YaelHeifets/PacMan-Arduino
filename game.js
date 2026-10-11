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
    direction: "NONE",
    nextDirection: "NONE"
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
    " ........--........ ",
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

    if (
        row < 0 ||
        row >= mazeGrid.length ||
        col < 0 ||
        col >= mazeGrid[0].length
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
        playEatGhostSound();

        ghost.x = ghost.startX;
        ghost.y = ghost.startY;
        ghost.direction = "LEFT";

        ghost.lastDecisionRow = -1;
        ghost.lastDecisionCol = -1;
    }

    else {

        lives--;

        playDeathSound();

        document.getElementById("lives").textContent =
            lives;

        if (lives <= 0) {

            gameOver = true;
            stopBackgroundMusic();
            stopPowerSound();

            document.getElementById("finalScore").textContent =
                score;

            document.getElementById("gameOverModal").style.display =
                "flex";
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

    // Stay still until the player chooses a direction
    if (pacman.direction === "NONE" &&
        pacman.nextDirection === "NONE") {
        return;
    }

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

    const tunnelRow = 10;
    const currentRow = Math.floor(pacman.y / TILE_SIZE);

    if (currentRow === tunnelRow) {

        if (
            pacman.direction === "LEFT" &&
            pacman.x <= TILE_SIZE / 2
        ) {
            pacman.x = canvas.width - TILE_SIZE / 2;
        }

        else if (
            pacman.direction === "RIGHT" &&
            pacman.x >= canvas.width - TILE_SIZE / 2
        ) {
            pacman.x = TILE_SIZE / 2;
        }
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
let serialPort;
let serialReader;
let isPaused = false;
let dotsEaten = 0;
let cherryActive = false;
let capsuleActive = false;
let audioContext = null;
let wakaToggle = false; 
let gameStarted = false;
let levelComplete = false;
let level = 1;

function enableGameAudio() {
    if (!audioContext) {
        audioContext = new AudioContext();
    }

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }
}

document.addEventListener("pointerdown", enableGameAudio);
document.addEventListener("keydown", enableGameAudio);

const cherry = {
    x: 332.5,
    y: 437.5,
    radius: 8
};

const capsule = {
    x: 507.5,
    y: 227.5,
    width: 24,
    height: 12
};

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
    playWakaSound();

    dotsEaten++;

    if (dotsEaten === 30) {
        cherryActive = true;
        }

        if (dotsEaten === 60) {
    capsuleActive = true;
        }
    }

    else if (tile === "o") {

        mazeGrid[row][col] = " ";

        addScore(50);

        activatePowerMode();
    }

    if (!levelComplete && areAllDotsEaten()) {
    levelComplete = true;
    console.log("LEVEL COMPLETE!");
    }
}

function areAllDotsEaten() {

    for (let row = 0; row < mazeGrid.length; row++) {
        for (let col = 0; col < mazeGrid[row].length; col++) {

            if (
                mazeGrid[row][col] === "." ||
                mazeGrid[row][col] === "o"
            ) {
                return false;
            }
        }
    }

    return true;
}

function activatePowerMode() {

    powerMode = true;
    playPowerSound();

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
        stopPowerSound();

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

function drawCherry() {

    if (!cherryActive) {
        return;
    }

    // Cherries
    ctx.fillStyle = "red";

    ctx.beginPath();
    ctx.arc(
        cherry.x - 7,
        cherry.y + 5,
        cherry.radius,
        0,
        Math.PI * 2
    );
    ctx.fill();

    ctx.beginPath();
    ctx.arc(
        cherry.x + 10,
        cherry.y + 5,
        cherry.radius,
        0,
        Math.PI * 2
    );
    ctx.fill();


    // Stems
    ctx.strokeStyle = "green";
    ctx.lineWidth = 3;

    ctx.beginPath();

    ctx.moveTo(
        cherry.x - 7,
        cherry.y - 5
    );

    ctx.lineTo(
        cherry.x,
        cherry.y - 22
    );

    ctx.lineTo(
        cherry.x + 10,
        cherry.y - 5
    );

    ctx.stroke();
}

function drawCapsule() {

    if (!capsuleActive) {
        return;
    }

    const x = capsule.x;
    const y = capsule.y;
    const w = capsule.width;
    const h = capsule.height;

    // Left half - red
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.roundRect(
        x - w / 2,
        y - h / 2,
        w / 2,
        h,
        [h / 2, 0, 0, h / 2]
    );
    ctx.fill();

    // Right half - white
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.roundRect(
        x,
        y - h / 2,
        w / 2,
        h,
        [0, h / 2, h / 2, 0]
    );
    ctx.fill();
}

function checkCherryCollision() {

    if (!cherryActive) {
        return;
    }

    const dx = pacman.x - cherry.x;
    const dy = pacman.y - cherry.y;

    const distance = Math.sqrt(
        dx * dx + dy * dy
    );

    if (
        distance <
        pacman.radius + cherry.radius
    ) {
        cherryActive = false;

        addScore(500);
        playCherrySound();
    }
}

function checkCapsuleCollision() {

    if (!capsuleActive) {
        return;
    }

    const dx = pacman.x - capsule.x;
    const dy = pacman.y - capsule.y;

    const distance = Math.sqrt(
        dx * dx + dy * dy
    );

    if (distance < pacman.radius + capsule.width / 2) {

        capsuleActive = false;

        lives++;
        playExtraLifeSound();

        document.getElementById("lives").textContent = lives;
    }
}

function resetPacman() {

    pacman.x = 350;
    pacman.y = 612.5;

    pacman.direction = "NONE";
    pacman.nextDirection = "NONE";

    blinky.x = blinky.startX;
    blinky.y = blinky.startY;
    blinky.direction = "LEFT";

    blinky.lastDecisionRow = -1;
    blinky.lastDecisionCol = -1;
}

function restartGame() {
    gameStarted = true;
    levelComplete = false;
    level = 1;
    
    playStartSound();
    isPaused = false;
    stopPowerSound();
    stopBackgroundMusic();
    musicStep = 0;
    startBackgroundMusic();

    score = 0;
    lives = 3;
    gameOver = false;
    powerMode = false;
    dotsEaten = 0;
    cherryActive = false;
    capsuleActive = false;


    // Stop an old Power Mode timer
    if (powerTimer !== null) {
        clearTimeout(powerTimer);
        powerTimer = null;
    }

    // Restore all dots and Power Pellets
    for (let row = 0; row < maze.length; row++) {
        mazeGrid[row] = maze[row].split("");
    }

    document.getElementById("score").textContent = score;
    document.getElementById("lives").textContent = lives;
    document.getElementById("level").textContent = level;

    document.getElementById("status").textContent =
        "Use arrow keys to move";

    document.getElementById("gameOverModal").style.display =
        "none";

    resetPacman();

}

document.getElementById("modalRestartButton").addEventListener("click", function() {
    enableGameAudio();
    restartGame();
});

document.getElementById("musicButton").addEventListener("click", function() {

    musicEnabled = !musicEnabled;

    if (musicEnabled) {
        this.textContent = "MUSIC: ON";

        if (gameStarted && !gameOver && !isPaused) {
            startBackgroundMusic();
        }
    } else {
        this.textContent = "MUSIC: OFF";
        stopBackgroundMusic();
    }
});

async function readSerialData() {
    const reader = serialPort.readable.getReader();
    const decoder = new TextDecoder();

    let buffer = "";

    try {
        while (true) {
            const { value, done } = await reader.read();

            if (done) {
                break;
            }

            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split(/\r?\n/);
            buffer = lines.pop();

            lines.forEach(direction => {
                direction = direction.trim();

                if (
                    direction === "UP" ||
                    direction === "DOWN" ||
                    direction === "LEFT" ||
                    direction === "RIGHT"
                ) {
                    console.log("Arduino:", direction);
                    handleDirection(direction);
                }
                else if (direction === "START") {
                    console.log("Arduino: START");
                    restartGame();
                    }
                else if (direction === "PAUSE") {
                console.log("Arduino: PAUSE");

                isPaused = !isPaused;

                if (isPaused) {
                    stopBackgroundMusic();
                } else {
                    startBackgroundMusic();
                }

                console.log("isPaused:", isPaused);
            }

            });

        }
    } catch (error) {
        console.log("Serial connection error:", error);
    } finally {
        reader.releaseLock();
    }
}
async function connectController() {

    try {

        serialPort = await navigator.serial.requestPort();

        await serialPort.open({
            baudRate: 9600
        });

        document.getElementById("connectButton").textContent =
            "CONTROLLER CONNECTED";

        document.getElementById("status").textContent =
            "Arduino controller connected";

        readSerialData();

    } catch (error) {

        console.log(
            "Serial connection error:",
            error
        );
    }
}


document
    .getElementById("connectButton")
    .addEventListener(
        "click",
        connectController
    );
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

    // Update only after START
    if (gameStarted && !gameOver && !isPaused && !levelComplete) {
        updatePacman();
        checkCherryCollision();
        checkCapsuleCollision();
        updateGhost(blinky);
        handleGhostCollision(blinky);
    }

    // Always draw the game
    drawMaze();
    drawPacman();
    drawCherry();
    drawCapsule();
    drawGhost(blinky);

    if (levelComplete) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.fillRect(0, 280, canvas.width, 140);

    ctx.fillStyle = "yellow";
    ctx.font = "bold 42px Arial";
    ctx.textAlign = "center";
    ctx.fillText("LEVEL COMPLETE!", canvas.width / 2, 360);
    }

    requestAnimationFrame(gameLoop);
}
document.getElementById("startButton").addEventListener("click", function() {
    enableGameAudio();
    restartGame();
});

// TEMPORARY QA SHORTCUT - REMOVE BEFORE SUBMISSION
document.addEventListener("keydown", function(event) {
    if (event.key === "t" && gameStarted && !gameOver) {
        event.preventDefault();

        levelComplete = true;

        console.log("QA: LEVEL COMPLETE!");
    }
});

gameLoop();

// ===== GAME SOUNDS =====

function playWakaSound() {
    if (!audioContext) {
        audioContext = new AudioContext();
    }

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "square";

    // Alternate between two tones
    oscillator.frequency.value = wakaToggle ? 420 : 520;
    wakaToggle = !wakaToggle;

    gain.gain.setValueAtTime(0.08, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.07
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.07);
}

function playDeathSound() {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;

    oscillator.type = "square";

    // Falling arcade sound
    oscillator.frequency.setValueAtTime(600, now);
    oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.5);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.5);
}

function playEatGhostSound() {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;

    oscillator.type = "square";

    // Rising arcade sound
    oscillator.frequency.setValueAtTime(300, now);
    oscillator.frequency.exponentialRampToValueAtTime(900, now + 0.2);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.25);
}

function playCherrySound() {
    if (!audioContext) return;

    const now = audioContext.currentTime;
    const notes = [523, 659, 784];

    for (let i = 0; i < notes.length; i++) {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        const startTime = now + i * 0.1;

        oscillator.type = "square";
        oscillator.frequency.value = notes[i];

        gain.gain.setValueAtTime(0.06, startTime);
        gain.gain.exponentialRampToValueAtTime(
            0.001,
            startTime + 0.12
        );

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.12);
    }
}

function playExtraLifeSound() {
    if (!audioContext) return;

    const now = audioContext.currentTime;
    const notes = [440, 554, 659, 880];

    for (let i = 0; i < notes.length; i++) {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        const startTime = now + i * 0.09;

        oscillator.type = "sine";
        oscillator.frequency.value = notes[i];

        gain.gain.setValueAtTime(0.07, startTime);
        gain.gain.exponentialRampToValueAtTime(
            0.001,
            startTime + 0.15
        );

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.15);
    }
}

function playStartSound() {
    if (!audioContext) {
        audioContext = new AudioContext();
    }

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }

    const now = audioContext.currentTime;

    const notes = [
        523, 659, 784, 1047,
        784, 1047, 1175, 1568
    ];

    for (let i = 0; i < notes.length; i++) {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        const startTime = now + i * 0.12;

        oscillator.type = "square";
        oscillator.frequency.value = notes[i];

        gain.gain.setValueAtTime(0.05, startTime);
        gain.gain.exponentialRampToValueAtTime(
            0.001,
            startTime + 0.11
        );

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.11);
    }
}

let powerSoundInterval = null;

function playPowerSound() {
    if (!audioContext || powerSoundInterval !== null) {
        return;
    }

    let highTone = false;

    powerSoundInterval = setInterval(() => {
        if (!powerMode || gameOver) {
            stopPowerSound();
            return;
        }

        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const now = audioContext.currentTime;

        oscillator.type = "sawtooth";
        oscillator.frequency.value = highTone ? 260 : 190;
        highTone = !highTone;

        gain.gain.setValueAtTime(0.025, now);
        gain.gain.exponentialRampToValueAtTime(
            0.001,
            now + 0.12
        );

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start(now);
        oscillator.stop(now + 0.12);

    }, 220);
}

function stopPowerSound() {
    if (powerSoundInterval !== null) {
        clearInterval(powerSoundInterval);
        powerSoundInterval = null;
    }
}

// ===== BACKGROUND MUSIC =====

let musicInterval = null;
let musicStep = 0;
let musicEnabled = false;

// Original retro arcade melody
const musicNotes = [
    523, 659, 784, 659,
    587, 698, 880, 698,
    659, 784, 988, 784,
    587, 659, 784, 0
];

function playMusicNote(frequency) {
    if (!audioContext || frequency === 0) return;

    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "square";
    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(0.012, now);
    gain.gain.exponentialRampToValueAtTime(
        0.001,
        now + 0.13
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.13);
}

function startBackgroundMusic() {
    if (!musicEnabled || musicInterval !== null) return;

    musicInterval = setInterval(function() {
        if (!gameStarted || gameOver || isPaused) return;

        playMusicNote(musicNotes[musicStep]);
        musicStep = (musicStep + 1) % musicNotes.length;
    }, 180);
}

function stopBackgroundMusic() {
    if (musicInterval !== null) {
        clearInterval(musicInterval);
        musicInterval = null;
    }
}