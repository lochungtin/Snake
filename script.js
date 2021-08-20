// ===== consts =====
// colors
const COLOR_TILE_DARK = '#303030';
const COLOR_TILE_LIGHT = '#F0F0F0';
const COLOR_LIGHT_GREEN = '#00FFB2';
const COLOR_DARK_GREEN = '#4D8A77';
const COLOR_LIGHT_RED = '#ED3459';
const COLOR_DARK_RED = '#BD2040';
const COLOR_POS_CIRCLE = '#F0F0F0';


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
// theme and layout
let darkTheme
let menuOpen = false;

// game state
let orb;
let snake;
let snakeDir;
let prevDir;
let state;
let score;
let pause = true;

// game setting
let speedSelection;
let gridDim;

// score data (t[speed][dim])
let hScore;
let hScoreTable;

// doc vars
let canvas;
let ctx;

// ===== functions =====
// menu toggle
const toggleMenu = open => {
    menuOpen = open;
    document.getElementById('menu').style.width = menuOpen ? '100%' : '0%';
}

// === config setting ===
// set grid dim
const setGridDim = (dim, bypass) => {
    // update global var
    gridDim = dim;

    // update buttons
    [
        document.getElementById('x11Btn'),
        document.getElementById('x9Btn'),
        document.getElementById('x7Btn'),
    ]
        .forEach((elem, index) => elem.src = index === 2 - (gridDim - 7) / 2 ? './icons/checked_true.svg' : './icons/checked_false.svg');

    // redraw canvas
    init();

    // save grid dim
    window.localStorage.setItem('dim', gridDim.toString());

    // highscore bypass
    if (bypass)
        return;

    loadHScore(hScoreTable);
}
// set difficulty
const setDifficulty = (index, bypass) => {
    // update global var
    speedSelection = index;

    // update buttons
    [
        document.getElementById('easyDiffBtn'),
        document.getElementById('normDiffBtn'),
        document.getElementById('hardDiffBtn'),
        document.getElementById('aiDiffBtn'),
    ]
        .forEach((elem, index) => elem.src = index === speedSelection ? './icons/checked_true.svg' : './icons/checked_false.svg');

    // save diff selection
    window.localStorage.setItem('diff', speedSelection.toString());

    // highscore bypass
    if (bypass)
        return;

    loadHScore(hScoreTable)
}

// set dark theme
const setDarkTheme = on => {
    // update global var
    darkTheme = on;

    // get all elems
    let body = document.body;
    let menu = document.getElementById('menu');
    let paras = document.getElementsByTagName('p');
    let menuImg = document.getElementById('menuImg');
    let closeImg = document.getElementById('closeImg');

    // update elements
    if (darkTheme) {
        body.classList.add('dark-mode-body');
        menu.classList.add('dark-mode-menu-bg');
        Array.from(paras).forEach(para => para.classList.add('dark-mode-text'));
    }
    else {
        body.classList.remove('dark-mode-body');
        menu.classList.remove('dark-mode-menu-bg');
        Array.from(paras).forEach(para => para.classList.remove('dark-mode-text'));
    }

    // update images
    menuImg.src = darkTheme ? './icons/menu_dark.svg' : './icons/menu_light.svg';
    closeImg.src = darkTheme ? './icons/close_dark.svg' : './icons/close_light.svg';

    // update swtich
    document.getElementById('switch').checked = darkTheme;

    // redraw canvas
    updateCanvas(false);

    // save theme selection
    window.localStorage.setItem('darkTheme', darkTheme.toString());
}

const toggleDarkTheme = () => setDarkTheme(!darkTheme);

// load scores
const loadHScore = table => {
    // update global var
    hScoreTable = table;

    // update doc display
    hScore = hScoreTable[speedSelection][2 - (gridDim - 7) / 2];
    document.getElementById('hScore').innerHTML = ('00000' + hScore).slice(-6);
}

const setHScore = score => {
    // update global var
    hScore = score

    // update table
    hScoreTable[speedSelection][2 - (gridDim - 7) / 2] = hScore;

    // update doc display
    document.getElementById('hScore').innerHTML = ('00000' + (hScore)).slice(-6);

    // save hscore to table
    window.localStorage.setItem('hScoreTable', JSON.stringify(hScoreTable));

    
}

// === game functions ===
const init = () => {
    // reset directions
    snakeDir = 0;
    prevDir = 0;

    // reset score
    score = 0;
    document.getElementById('score').innerHTML = '000000';

    // build state
    state = [];
    for (let i = 0; i < gridDim; ++i) {
        let row = new Array(gridDim);
        row.fill(EMPTY);

        state.push(row);
    }

    // set snake head to center
    snake = [
        [
            Math.floor(gridDim / 2),
            Math.floor(gridDim / 2),
        ],
    ];
    markSnake();

    // spawn orb
    spawnOrb();
    state[orb[0]][orb[1]] = ORB;

    // redraw canvas
    updateCanvas(false);
}

const markSnake = () => snake.forEach((coords, index) => state[coords[0]][coords[1]] = index == snake.length - 1 ? HEAD : SNAKE);

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

const start = () => {
    let id = setTimeout(() => {
        if (!pause) {
            if (nextFrame())
                start();
            else {
                clearTimeout(id);
                document.getElementById('state').innerHTML = 'GAMEOVER';

                // set highscore
                if (hScore < score)
                    setHScore(score);
            }
        }
    }, SPEEDS[speedSelection]);
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
        newHead[0] > gridDim - 1 ||
        newHead[1] < 0 ||
        newHead[1] > gridDim - 1 ||
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

// update canvas
const updateCanvas = newOrb => {
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

    // compensation for smaller grid sizes
    let indent = 2 - (gridDim - 7) / 2;
    let filler = (SQR_DIM + GAP_SIZE) * indent;
    // draw grid
    for (let row = 0; row < gridDim; ++row) {
        for (let col = 0; col < gridDim; ++col) {
            ctx.fillStyle = darkTheme ? COLOR_TILE_DARK : COLOR_TILE_LIGHT;

            if (state[row][col] === HEAD)
                ctx.fillStyle = COLOR_DARK_GREEN;

            if (state[row][col] === SNAKE)
                ctx.fillStyle = COLOR_LIGHT_GREEN;

            if (state[row][col] === ORB)
                ctx.fillStyle = COLOR_LIGHT_RED;

            ctx.fillRect(
                row * (SQR_DIM + GAP_SIZE) + PADDING_LEFT + filler,
                col * (SQR_DIM + GAP_SIZE) + PADDING_TOP + filler,
                SQR_DIM,
                SQR_DIM
            );
        }
    }
}

const drawCircle = (x, y, radius, ctx, color) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2, true)
    ctx.fill()
}

// key stroke listener
document.addEventListener('keydown', event => {
    // ignore if sidebar open
    if (menuOpen) {
        if (event.key === 'Escape')
            toggleMenu(false);
        return
    }

    // space bar
    if (event.key === ' ') {
        if (document.getElementById('state').innerHTML === 'GAMEOVER')
            init();

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

// window on load initialization
window.onload = () => {
    // get doc vars
    canvas = document.getElementById('main');
    ctx = canvas.getContext('2d');

    // set grid dimensions
    dim = window.localStorage.getItem('dim');
    if (dim === null) {
        dim = '11';
        window.localStorage.setItem('dim', dim);
    }
    setGridDim(parseInt(dim), true);

    // set speed
    let speed = window.localStorage.getItem('diff');
    if (speed === null) {
        speed = '1';
        window.localStorage.setItem('diff', speed);
    }
    setDifficulty(parseInt(speed), true);

    // set theme
    theme = window.localStorage.getItem('darkTheme');
    if (darkTheme === null) {
        theme = 'true';
        window.localStorage.setItem('darkTheme', theme);
    }
    setDarkTheme(theme === 'true');

    // load highscores
    let table = window.localStorage.getItem('hScoreTable');
    if (table === null) {
        table = [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]];
        window.localStorage.setItem('hScoreTable', JSON.stringify(table));
    }
    else
        table = JSON.parse(table);
    loadHScore(table);

    // initialize
    init();
}
