// ===== consts =====
// colors
const COLOR_TILE_DARK = '#303030';
const COLOR_TILE_LIGHT = '#F0F0F0';
const COLOR_LIGHT_GREEN = '#00FFB2';
const COLOR_DARK_GREEN = '#4D8A77';
const COLOR_LIGHT_RED = '#ED3459';
const COLOR_DARK_RED = '#BD2040';
const COLOR_POS_CIRCLE = '#F0F0F0';

// dimensions
const GRID_DIM = 11;

// canvas dimensions
const PADDING_LEFT = 2.5;
const PADDING_TOP = 30;

const CIRCLE_RADIUS = 5;
const CIRCLE_X = [190, 210, 230, 250];

const SQR_DIM = 35;
const GAP_SIZE = 5;

// tile code
const EMPTY = 0;
const SNAKE = 1;
const HEAD = 2;
const ORB = 3;

// game settings
let SPEEDS = [500, 300, 100, 25];

// ===== vars =====
// theme
let darkTheme

// game state
let orb;
let snake;
let snakeDir = 0;
let prevDir;
let state;
let score;
let pause = true;

// game setting
let speedSelection = 1;

// doc vars
let canvas;
let ctx;

// ===== functions =====
// layout and theme
const openMenu = () => document.getElementById('menu').style.width = '100%';

const closeMenu = () => document.getElementById('menu').style.width = '0%';

const toggleDarkTheme = () => {
    darkTheme = !darkTheme;
    window.localStorage.setItem('darkTheme', darkTheme.toString());

    // background color
    let body = document.body;
    body.classList.toggle('dark-mode-body');

    let menu = document.getElementById('menu');
    menu.classList.toggle('dark-mode-menu-bg');

    // text
    let paras = document.getElementsByTagName('p');
    Array.from(paras).forEach(para => para.classList.toggle('dark-mode-text'));

    // menu img
    let menuImg = document.getElementById('menuImg');
    menuImg.src = darkTheme ? './img/menu_dark.svg' : './img/menu_light.svg';

    // close img
    let closeImg = document.getElementById('closeImg');
    closeImg.src = darkTheme ? './img/close_dark.svg' : './img/close_light.svg';

    // update swtich
    document.getElementById('switch').checked = darkTheme;

    updateCanvas(false);
}

// set difficulty
const selectDifficulty = (index) => {
    let elems = [
        document.getElementById('easyDiffBtn'),
        document.getElementById('normDiffBtn'),
        document.getElementById('hardDiffBtn'),
        document.getElementById('aiDiffBtn'),
    ];

    // update buttons
    speedSelection = index;
    elems.forEach((elem, index )=> elem.src = index === speedSelection ? './img/checked_true.svg' : './img/checked_false.svg');

    // save diff selection
    window.localStorage.setItem('diff', index.toString());
}

// game functions & script
const init = () => {
    snakeDir = 0;
    prevDir = 0;

    score = 0;

    state = [
        [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
        [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
        [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
        [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
        [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
        [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
        [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
        [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
        [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
        [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
        [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    ];

    snake = [
        [
            Math.floor(GRID_DIM / 2),
            Math.floor(GRID_DIM / 2),
        ],
    ];
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

    let rowDelta = (snakeDir === 2) * -1 + (snakeDir === 3) * 1;
    let colDelta = (snakeDir === 0) * -1 + (snakeDir === 1) * 1;

    newHead[0] += rowDelta;
    newHead[1] += colDelta;

    // kill game if invalid
    if (
        // out of bounds
        newHead[0] < 0 ||
        newHead[0] > GRID_DIM - 1 ||
        newHead[1] < 0 ||
        newHead[1] > GRID_DIM - 1 ||
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
    newOrb = false
    if (newHead[0] === orb[0] && newHead[1] === orb[1]) {
        score += 50;
        document.getElementById('score').innerHTML = ('00000' + (score)).slice(-6);
        // unable to spawn orb, beate the game
        if (!spawnOrb()) {
            pause = true;
            return false;
        }
        // new orb
        else
            newOrb = true
        state[orb[0]][orb[1]] = ORB;
    }
    else {
        state[snake[0][0]][snake[0][1]] = EMPTY;
        snake.splice(0, 1);
    }

    updateCanvas(newOrb);

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
    }, SPEEDS[speedSelection]);
}

const markSnake = () => snake.forEach((coords, index) => state[coords[0]][coords[1]] = index == snake.length - 1 ? HEAD : SNAKE);

const drawCircle = (x, y, radius, ctx, color) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2, true)
    ctx.fill()
}

const updateCanvas = (newOrb) => {
    // clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw pos circle
    drawCircle(
        CIRCLE_RADIUS * 2,
        CIRCLE_RADIUS * 2,
        CIRCLE_RADIUS,
        ctx,
        COLOR_POS_CIRCLE,
    );

    // draw direction circles
    CIRCLE_X.forEach((x, index) => drawCircle(
        x,
        CIRCLE_RADIUS * 2,
        CIRCLE_RADIUS,
        ctx,
        snakeDir === index ? COLOR_LIGHT_GREEN : COLOR_DARK_GREEN
    ));

    // draw orb circle
    drawCircle(
        canvas.width - CIRCLE_RADIUS * 2,
        CIRCLE_RADIUS * 2,
        CIRCLE_RADIUS,
        ctx,
        newOrb ? COLOR_LIGHT_RED : COLOR_DARK_RED,
    );

    // draw grid
    for (let row = 0; row < GRID_DIM; ++row) {
        for (let col = 0; col < GRID_DIM; ++col) {
            ctx.fillStyle = darkTheme ? COLOR_TILE_DARK : COLOR_TILE_LIGHT;

            if (state[row][col] === HEAD)
                ctx.fillStyle = COLOR_DARK_GREEN;

            if (state[row][col] === SNAKE)
                ctx.fillStyle = COLOR_LIGHT_GREEN;

            if (state[row][col] === ORB)
                ctx.fillStyle = COLOR_LIGHT_RED;

            ctx.fillRect(
                row * (SQR_DIM + GAP_SIZE) + PADDING_LEFT,
                col * (SQR_DIM + GAP_SIZE) + PADDING_TOP,
                SQR_DIM,
                SQR_DIM
            );
        }
    }
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
                if (prevDir === 1)
                    return;
                return snakeDir = 0;

            case 'ArrowDown':
            case 's':
                if (prevDir === 0)
                    return;
                return snakeDir = 1;

            case 'ArrowLeft':
            case 'a':
                if (prevDir === 3)
                    return;
                return snakeDir = 2;

            case 'ArrowRight':
            case 'd':
                if (prevDir === 2)
                    return;
                return snakeDir = 3;

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
        // background color
        let body = document.body;
        body.classList.toggle('dark-mode-body');

        let menu = document.getElementById('menu');
        menu.classList.toggle('dark-mode-menu-bg');

        // text
        let paras = document.getElementsByTagName('p');
        Array.from(paras).forEach(para => para.classList.toggle('dark-mode-text'));

        // menu img
        let menuImg = document.getElementById('menuImg');
        menuImg.src = darkTheme ? './img/menu_dark.svg' : './img/menu_light.svg';

        // close img
        let closeImg = document.getElementById('closeImg');
        closeImg.src = darkTheme ? './img/close_dark.svg' : './img/close_light.svg';
    }

    // set speed
    let speed = window.localStorage.getItem('diff');
    if (speed === null) {
        window.localStorage.setItem('diff', '1');
        speed = '1';
    }
    
    selectDifficulty(parseInt(speed));

    // load score
    let hScore = window.localStorage.getItem('hScore');
    if (hScore !== null)
        document.getElementById('hScore').innerHTML = ('00000' + (hScore)).slice(-6);

    // update
    updateCanvas(false);
}
