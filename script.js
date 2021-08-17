// === consts ===
// colors
const tileColorD = '#303030';
const tileColorL = '#F0F0F0';
const snakeColor = '#00FFB2';
const headColor = '#4d8a77';
const orbColor = '#ED3459';

// dimensions
const paddingL = 2.5;
const gridDim = 11;
const gapSize = 5;
const sqrDim = 35;

// tile code
const EMPTY = -1;
const SNAKE = 1;
const HEAD = 2;
const ORB = 3;

// === vars ===
// theme
let darkTheme

// game state
let orb;

let snake;
let snakeDir;
let prevDir;

let state;

let score;

let pause = true;

// doc vars
let canvas;
let ctx;

// === functions ===
const init = () => {
    snakeDir = 'u';
    prevDir = 'u';

    score = 0;

    state = [
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    ];

    snake = [[5, 7], [5, 6]];
}

const spawnOrb = () => {
    let emptyList = [];

    state.forEach((row, rIndex) => {
        row.forEach((col, cIndex) => {
            if (col === EMPTY)
                emptyList.push([rIndex, cIndex]);
        });
    });

    if (emptyList.length === 0)
        return false;

    orb = emptyList[Math.floor(Math.random() * emptyList.length)];
    return true;
}

const nextFrame = () => {
    // new head
    let newHead = [...snake[snake.length - 1]];

    let rowDelta = (snakeDir === 'l') * -1 + (snakeDir === 'r') * 1;
    let colDelta = (snakeDir === 'u') * -1 + (snakeDir === 'd') * 1;

    newHead[0] += rowDelta;
    newHead[1] += colDelta;

    // kill game if invalid
    if (
        // out of bounds
        newHead[0] < 0 ||
        newHead[0] > 10 ||
        newHead[1] < 0 ||
        newHead[1] > 10 ||
        // own body collision
        snake.findIndex(coords => coords[0] === newHead[0] && coords[1] === newHead[1]) !== -1
    ) {
        pause = true;
        return false;
    }

    // update head
    snake.push(newHead);
    markSnake();

    // collides with orb
    if (newHead[0] === orb[0] && newHead[1] === orb[1]) {
        score += 50;
        document.getElementById('score').innerHTML = ('00000' + (score)).slice(-6);
        if (!spawnOrb()) {
            pause = true;
            return false;
        }
        else
            state[orb[0]][orb[1]] = ORB;
    }
    else {
        state[snake[0][0]][snake[0][1]] = EMPTY;
        snake.splice(0, 1);
    }

    drawGrid();

    // update directions
    prevDir = snakeDir;
    return true;
}

const start = () => {
    let id = setTimeout(() => {
        if (!pause) {
            if (nextFrame())
                start();
            else {
                clearTimeout(id);
                document.getElementById('state').innerHTML = 'GAMEOVER';

                // set highscore
                let hScore = window.localStorage.getItem('hScore');
                if (hScore === null || parseInt(hScore) < score) {
                    window.localStorage.setItem('hScore', score);
                    document.getElementById('hScore').innerHTML = ('00000' + (score)).slice(-6);
                }
            }
        }
    }, 300);
}

const markSnake = () => snake.forEach((coords, index) => state[coords[0]][coords[1]] = index == snake.length - 1 ? HEAD : SNAKE);

const drawGrid = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let row = 0; row < gridDim; ++row) {
        for (let col = 0; col < gridDim; ++col) {
            ctx.fillStyle = darkTheme ? tileColorD : tileColorL;

            if (state[row][col] === HEAD)
                ctx.fillStyle = headColor;

            if (state[row][col] === SNAKE)
                ctx.fillStyle = snakeColor;

            if (state[row][col] === ORB)
                ctx.fillStyle = orbColor;

            ctx.fillRect(
                row * (sqrDim + gapSize) + paddingL,
                col * (sqrDim + gapSize) + paddingL,
                sqrDim,
                sqrDim
            );
        }
    }
}

const toggleDarkTheme = () => {
    darkTheme = !darkTheme;
    window.localStorage.setItem('darkTheme', darkTheme.toString())

    let body = document.body;
    body.classList.toggle('dark-mode-body');

    let paras = document.getElementsByTagName('p');
    Array.from(paras).forEach(para => para.classList.toggle('dark-mode-text'));

    document.getElementById('switch').checked = darkTheme;

    drawGrid();
}

document.addEventListener('keydown', event => {
    if (event.key === ' ') {
        if (document.getElementById('state').innerHTML === 'GAMEOVER') {
            document.getElementById('score').innerHTML = '000000';

            init();
            markSnake();

            spawnOrb();
            state[orb[0]][orb[1]] = ORB;
        }

        document.getElementById('state').innerHTML = pause ? 'PLAYING' : 'PAUSED';
        start();
        return pause = !pause;
    }

    // handle keystrokes
    if (!pause) {
        switch (event.key) {
            case 'ArrowUp':
            case 'w':
                if (prevDir === 'd')
                    return;
                return snakeDir = 'u';

            case 'ArrowDown':
            case 's':
                if (prevDir === 'u')
                    return;
                return snakeDir = 'd';

            case 'ArrowLeft':
            case 'a':
                if (prevDir === 'r')
                    return;
                return snakeDir = 'l';

            case 'ArrowRight':
            case 'd':
                if (prevDir === 'l')
                    return;
                return snakeDir = 'r';

            default:
                return;
        }
    }
});


window.onload = () => {
    // get doc vars
    canvas = document.getElementById('main');
    ctx = canvas.getContext('2d');

    // intialize objects
    init();
    markSnake();

    spawnOrb();
    state[orb[0]][orb[1]] = ORB;

    // set theme
    darkTheme = window.localStorage.getItem('darkTheme');
    if (darkTheme === null) {
        window.localStorage.setItem('darkTheme', 'true');
        darkTheme = true;
    }
    else
        darkTheme = (darkTheme === 'true');

    document.getElementById('switch').checked = darkTheme;

    if (!darkTheme) {
        let body = document.body;
        body.classList.toggle('dark-mode-body');

        let paras = document.getElementsByTagName('p');
        Array.from(paras).forEach(para => para.classList.toggle('dark-mode-text'));
    }

    // load score
    let hScore = window.localStorage.getItem('hScore');
    if (hScore !== null)
        document.getElementById('hScore').innerHTML = ('00000' + (hScore)).slice(-6);

    // update
    drawGrid();
}
