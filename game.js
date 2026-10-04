const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 700;
canvas.height = 700;


// -------------------------
// PAC-MAN
// -------------------------

const pacman = {
    x: 350,
    y: 500,
    radius: 17,
    speed: 3,
    direction: "RIGHT"
};


// -------------------------
// INPUT
// -------------------------

function handleDirection(direction) {

    pacman.direction = direction;

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


// -------------------------
// UPDATE
// -------------------------

function updatePacman() {

    if (pacman.direction === "UP") {
        pacman.y -= pacman.speed;
    }

    else if (pacman.direction === "DOWN") {
        pacman.y += pacman.speed;
    }

    else if (pacman.direction === "LEFT") {
        pacman.x -= pacman.speed;
    }

    else if (pacman.direction === "RIGHT") {
        pacman.x += pacman.speed;
    }

    // Keep Pac-Man inside the canvas
    if (pacman.x - pacman.radius < 0) {
        pacman.x = pacman.radius;
    }

    if (pacman.x + pacman.radius > canvas.width) {
        pacman.x = canvas.width - pacman.radius;
    }

    if (pacman.y - pacman.radius < 0) {
        pacman.y = pacman.radius;
    }

    if (pacman.y + pacman.radius > canvas.height) {
        pacman.y = canvas.height - pacman.radius;
    }

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

    ctx.fillStyle = "yellow";
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

    drawPacman();

    requestAnimationFrame(gameLoop);
}


gameLoop();