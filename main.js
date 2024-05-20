const MAPSIZE = 11;

const missions = {
    "basic": [
        {
            title: "Az erdő széle",
            description: "A térképed szélével szomszédos erdőmezőidért egy-egy pontot kapsz.",
            score: () => {
                let total = 0;
                for (let i = 0; i < 2; ++i) {
                    for (let j = 0; j < 11; ++j) {
                        total += fields[i * 10][j].type === 'forest';
                        if (1 <= j && j < 10) {
                            total += fields[j][i * 10].type === 'forest';
                        }
                    }
                }
                return total;
            },
            scoreSum: 0
        },
        {
            title: "Álmos-völgy",
            description: "Minden olyan sorért, amelyben három erdőmező van, négy-négy pontot kapsz.",
            score: () => {
                let total = 0;
                for (let i = 0; i < 11; ++i) {
                    let c = 0;
                    for (let j = 0; j < 11; ++j) {
                        c += fields[i][j].type === 'forest';
                    }
                    if (c === 3) {
                        total += 4;
                    }
                }
                return total;
            },
            scoreSum: 0
        },
        {
            title: "Krumpliöntözés",
            description: "A farmmezőiddel szomszédos vízmezőidért két-két pontot kapsz.",
            score: () => {
                return 2 * countWithNeighbor('water', 'farm');
            },
            scoreSum: 0
        },
        {
            title: "Határvidék",
            description: "Minden teli sorért vagy oszlopért 6-6 pontot kapsz.",
            score: () => {
                let total = 0;
                for (let i = 0; i < 11; ++i) {
                    let rowOK = true;
                    let colOK = true;
                    for (let j = 0; j < 11; ++j) {
                        if (fields[i][j].type === 'empty') {
                            rowOK = false;
                        }
                        if (fields[j][i].type === 'empty') {
                            colOK = false;
                        }
                    }
                    if (rowOK) {
                        total += 6;
                    }
                    if (colOK) {
                        total += 6;
                    }
                }
                return total;
            },
            scoreSum: 0
        }
    ],
    "extra": [
        {
            title: "Fasor",
            description: "A leghosszabb, függőlegesen megszakítás nélkül egybefüggő erdőmezők mindegyikéért kettő-kettő pontot kapsz. Két azonos hosszúságú esetén csak az egyikért.",
            score: () => {
                let longest = 0;
                for (let col = 0; col < 11; ++col) {
                    let current = 0;
                    for (let row = 0; row < 11; ++row) {
                        current = fields[row][col].type === 'forest' ? current + 1 : 0;
                        if (current > longest) {
                            longest = current;
                        }
                    }
                }
                return 2 * longest;
            },
            scoreSum: 0
        },
        {
            title: "Gazdag város",
            description: "A legalább három különböző tereptípussal szomszédos falurégióidért három-három pontot kapsz.",
            score: () => {
                let total = 0;
                for (let i = 0; i < 11; ++i) {
                    for (let j = 0; j < 11; ++j) {
                        if (fields[i][j].type === 'town' && (new Set(neighborTypes(i, j))).size >= 3) {
                            total += 3;
                        }
                    }
                }
                return total;
            },
            scoreSum: 0
        },
        {
            title: "Öntözőcsatorna",
            description: "Minden olyan oszlopodért, amelyben a farm illetve a vízmezők száma megegyezik, négy-négy pontot kapsz. Mindkét tereptípusból legalább egy-egy mezőnek lennie kell az oszlopban ahhoz, hogy pontot kaphass érte.",
            score: () => {
                let total = 0;
                for (let col = 0; col < 11; ++col) {
                    let fCount = 0;
                    let wCount = 0;
                    for (let row = 0; row < 11; ++row) {
                        if (fields[row][col].type === 'farm') {
                            ++fCount;
                        } else if (fields[row][col].type === 'water') {
                            ++wCount;
                        }
                    }
                    if (fCount > 0 && fCount === wCount) {
                        total += 4;
                    }
                }
                return total;
            },
            scoreSum: 0
        },
        {
            title: "Mágusok völgye",
            description: "A hegymezőiddel szomszédos vízmezőidért három-három pontot kapsz.",
            score: () => {
                return 3 * countWithNeighbor('water', 'mountain');
            },
            scoreSum: 0
        },
        {
            title: "Üres telek",
            description: "A városmezőiddel szomszédos üres mezőkért 2-2 pontot kapsz.",
            score: () => {
                return 2 * countWithNeighbor('empty', 'town');
            },
            scoreSum: 0
        },
        {
            title: "Sorház",
            description: "A leghosszabb, vízszintesen megszakítás nélkül egybefüggő falumezők mindegyikéért kettő-kettő pontot kapsz.",
            score: () => {
                let longest = 0;
                for (let i = 0; i < 11; ++i) {
                    let current = 0;
                    for (let j = 0; j < 11; ++j) {
                        current = fields[i][j].type === 'town' ? current + 1 : 0;
                        if (current > longest) {
                            longest = current;
                        }
                    }
                }
                return 2 * longest;
            },
            scoreSum: 0
        },
        {
            "title": "Páratlan silók",
            "description": "Minden páratlan sorszámú teli oszlopodért 10-10 pontot kapsz.",
            score: () => {
                let total = 0;
                for (let col = 0; col < 11; col += 2) {
                    let full = true;
                    for (let row = 0; row < 11; ++row) {
                        if (fields[row][col].type === 'empty') {
                            full = false;
                        }
                    }
                    if (full) {
                        total += 10;
                    }
                }
                return total;
            },
            scoreSum: 0
        },
        {
            "title": "Gazdag vidék",
            "description": "Minden legalább öt különböző tereptípust tartalmazó sorért négy-négy pontot kapsz.",
            score: () => {
                let total = 0;
                for (let i = 0; i < 11; ++i) {
                    const types = new Set();
                    for (let j = 0; j < 11; ++j) {
                        const t = fields[i][j].type;
                        if (t !== 'empty') {
                            types.add(fields[i][j].type);
                        }
                    }
                    if (types.size >= 5) {
                        total += 4;
                    }
                }
                return total;
            },
            scoreSum: 0
        }
    ],
};

const elements = [
    {
        time: 2,
        type: 'water',
        shape: [[1, 1, 1],
        [0, 0, 0],
        [0, 0, 0]],
        rotation: 0,
        mirrored: false
    },
    {
        time: 2,
        type: 'town',
        shape: [[1, 1, 1],
        [0, 0, 0],
        [0, 0, 0]],
        rotation: 0,
        mirrored: false
    },
    {
        time: 1,
        type: 'forest',
        shape: [[1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]],
        rotation: 0,
        mirrored: false
    },
    {
        time: 2,
        type: 'farm',
        shape: [[1, 1, 1],
        [0, 0, 1],
        [0, 0, 0]],
        rotation: 0,
        mirrored: false
    },
    {
        time: 2,
        type: 'forest',
        shape: [[1, 1, 1],
        [0, 0, 1],
        [0, 0, 0]],
        rotation: 0,
        mirrored: false
    },
    {
        time: 2,
        type: 'town',
        shape: [[1, 1, 1],
        [0, 1, 0],
        [0, 0, 0]],
        rotation: 0,
        mirrored: false
    },
    {
        time: 2,
        type: 'farm',
        shape: [[1, 1, 1],
        [0, 1, 0],
        [0, 0, 0]],
        rotation: 0,
        mirrored: false
    },
    {
        time: 1,
        type: 'town',
        shape: [[1, 1, 0],
        [1, 0, 0],
        [0, 0, 0]],
        rotation: 0,
        mirrored: false
    },
    {
        time: 1,
        type: 'town',
        shape: [[1, 1, 1],
        [1, 1, 0],
        [0, 0, 0]],
        rotation: 0,
        mirrored: false
    },
    {
        time: 1,
        type: 'farm',
        shape: [[1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]],
        rotation: 0,
        mirrored: false
    },
    {
        time: 1,
        type: 'farm',
        shape: [[0, 1, 0],
        [1, 1, 1],
        [0, 1, 0]],
        rotation: 0,
        mirrored: false
    },
    {
        time: 2,
        type: 'water',
        shape: [[1, 1, 1],
        [1, 0, 0],
        [1, 0, 0]],
        rotation: 0,
        mirrored: false
    },
    {
        time: 2,
        type: 'water',
        shape: [[1, 0, 0],
        [1, 1, 1],
        [1, 0, 0]],
        rotation: 0,
        mirrored: false
    },
    {
        time: 2,
        type: 'forest',
        shape: [[1, 1, 0],
        [0, 1, 1],
        [0, 0, 1]],
        rotation: 0,
        mirrored: false
    },
    {
        time: 2,
        type: 'forest',
        shape: [[1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]],
        rotation: 0,
        mirrored: false
    },
    {
        time: 2,
        type: 'water',
        shape: [[1, 1, 0],
        [1, 1, 0],
        [0, 0, 0]],
        rotation: 0,
        mirrored: false
    },
];

const mountains = [[2, 2], [4, 9], [6, 4], [9, 10], [10, 6]];
const seasons = [
    {
        eng: 'spring',
        hun: 'Tavasz',
        missions: [0, 1]
    },
    {
        eng: 'summer',
        hun: 'Nyár',
        missions: [1, 2]
    },
    {
        eng: 'fall',
        hun: 'Ősz',
        missions: [2, 3]
    },
    {
        eng: 'winter',
        hun: 'Tél',
        missions: [0, 3]
    },
];
const fields = [];
const tableCells = [];
const placedPieces = [];
let lastPreviewed = [];
let currentMissions = [];
let currentSeason = 0;
let timePassed = 0;
let pieces;
let currentPiece = 0;
let totalScore = 0;

const scoreSpans = {
    spring: document.querySelector('#spring-score'),
    summer: document.querySelector('#summer-score'),
    fall: document.querySelector('#fall-score'),
    winter: document.querySelector('#winter-score'),
    total: document.querySelector('#total-score')
}

const missionScores = [
    document.querySelector('#m0-score'),
    document.querySelector('#m1-score'),
    document.querySelector('#m2-score'),
    document.querySelector('#m3-score')
]
const currentSeasonSpan = document.querySelector('#current-season');
const timeLeftSpan = document.querySelector('#time-left');
const nextPieceT = document.querySelector('#next-piece>table');
const nextPieceTime = document.querySelector("#next-piece-time");
const map = document.querySelector('#map');
const missionCards = document.querySelectorAll('.mission-card');
const rotateButton = document.querySelector('#rotate-button');
const hMirrorButton = document.querySelector('#hmirror-button');
const vMirrorButton = document.querySelector('#vmirror-button');
const stuckButton = document.querySelector('#stuck-button');


function shuffle(arr) {
    return arr.sort(() => 0.5 - Math.random());
}

function randMissions(count) {
    let result = [];
    [missions.basic, missions.extra].forEach((arr) => arr.forEach((e) => result.push(e)));
    return shuffle(result).slice(0, count);
}

function neighborTypes(row, col, includeEmtpies = false) {
    const pairs = [[row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]];
    const types = []
    pairs.forEach(([i, j]) => {
        if (0 <= i && i < 11 && 0 <= j && j < 11) {
            const t = fields[i][j].type
            if (t !== 'empty') {
                types.push(fields[i][j].type);
            } else if (includeEmtpies) {
                types.push(fields[i][j].type);
            }
        }
    });
    return types;
}

function hasNeighbor(row, col, type) {
    return (new Set(neighborTypes(row, col, type === 'empty'))).has(type);
}

function countWithNeighbor(type, neighbor) {
    let count = 0;
    for (let i = 0; i < 11; ++i) {
        for (let j = 0; j < 11; ++j) {
            if (fields[i][j].type === type && hasNeighbor(i, j, neighbor)) {
                ++count;
            }
        }
    }
    return count;
}

function calculateScore(indices) {
    let sum = 0;
    indices.forEach((i) => {
        const s = currentMissions[i].score()
        currentMissions[i].scoreSum += s;
        sum += s;
    });
    return sum;
}

function mountainScore() {
    let sum = 0;
    mountains.forEach(([i, j]) => {
        --i;
        --j;
        sum += fields[i - 1][j].type !== 'empty'
            && fields[i + 1][j].type !== 'empty'
            && fields[i][j - 1].type !== 'empty'
            && fields[i][j + 1].type !== 'empty';
    });
    return sum;
}

function endGame() {
    map.onclick = null;
    map.onmouseover = null;
    map.onmouseout = null;
    rotateButton.onclick = rotatePiece;
    hMirrorButton.onclick = () => mirrorPiece(true);
    vMirrorButton.onclick = () => mirrorPiece(false);
    timeLeftSpan.innerText = 0;
    scoreSpans.total.innerText = totalScore;
}

function tickTime() {
    timePassed += pieces[currentPiece].time;
    const r = timePassed % 7;
    const q = (timePassed - r) / 7;
    timeLeftSpan.innerText = 7 - r;
    if (q > currentSeason) {
        updateSeason();
    }
}

function updateScore() {
    totalScore += mountainScore();
    const ms = seasons[currentSeason].missions;
    const s = seasons[currentSeason];
    const score = calculateScore(ms);
    totalScore += score;
    scoreSpans[s.eng].innerText = score;
    for (let i = 0; i < 4; ++i) {
        missionScores[i].innerText = currentMissions[i].scoreSum;
    }
}

function updateSeason() {
    currentPiece = 0;
    pieces = shuffle(elements);
    showCurrentPiece();
    updateScore();

    ++currentSeason;
    if (currentSeason > 3) {
        endGame();
        return;
    }
    const ms = seasons[currentSeason].missions;
    missionCards.forEach((c) => c.classList.remove('active'));
    ms.forEach((i) => missionCards[i].classList.add('active'));
    currentSeasonSpan.innerText = seasons[currentSeason].hun;
    map.removeAttribute('class');
    map.classList.add(`${seasons[currentSeason].eng}-glow`);
}

function findPiecePivot(piece) {
    for (let j = 0; j < 3; ++j) {
        for (let i = 0; i < 3; ++i) {
            if (piece.shape[i][j] === 1) {
                return [i, j];
            }
        }
    }
    return [-1, -1];
}

function findRow(cell) {
    for (let i = 0; i < 11; ++i) {
        if (tableCells[i][cell.cellIndex] === cell) {
            return i;
        }
    }
    return -1;
}

function rotatePiece() {
    let s = pieces[currentPiece].shape;
    [
        s[0][0], s[0][1], s[0][2],
        s[1][0],          s[1][2],
        s[2][0], s[2][1], s[2][2]
    ] = [
        s[2][0], s[1][0], s[0][0],
        s[2][1],          s[0][1],
        s[2][2], s[1][2], s[0][2],
    ];
    showCurrentPiece();
}

function mirrorPiece(horizontal) {
    let s = pieces[currentPiece].shape;
    for (let i = 0; i < 3; ++i) {
        if (horizontal) {
            [s[0][i], s[2][i]] = [s[2][i], s[0][i]];
        } else {
            [s[i][0], s[i][2]] = [s[i][2], s[i][0]];
        }
    }
    showCurrentPiece();
}

function checkStuck() {
    let ok = false;
    const piece = pieces[currentPiece];
    const original = JSON.parse(JSON.stringify(piece.shape));
    for (let i = 0; i < 11 && !ok; ++i) {
        for (let j = 0; j < 11 && !ok; ++j) {
            if (fields[i][j].type === 'empty') {
                const target = tableCells[i][j];
                for (let k = 0; k < 4 && !ok; ++k) {
                    if (fits(piece, target)) {
                        ok = true;
                    }
                    rotatePiece();
                }
                for (let k = 0; k < 2 && !ok; ++k) {
                    mirrorPiece(k);
                    if (fits(piece, target)) {
                        ok = true;
                    }
                    mirrorPiece(k);
                }
            }
        }
    }
    piece.shape = original;
    showCurrentPiece();
    if (ok) {
        alert('Ezt az elemet el lehet helyezni a játéktéren.');
        return;
    }
    alert('Az elem nem fér el a játéktéren, a játék véget ért.');
    while (currentSeason < 4) {
        updateSeason();
    }
}

function showCurrentPiece() {
    const current = pieces[currentPiece];
    const rows = nextPieceT.rows;
    const [pR, pC] = findPiecePivot(current);
    for (let i = 0; i < 3; ++i) {
        let cells = rows[i].cells;
        for (let j = 0; j < 3; ++j) {
            cells[j].removeAttribute('style');
            if (current.shape[i][j] === 1) {
                cells[j].className = current.type;
            } else {
                cells[j].removeAttribute('class');
            }
            if (i === pR && j === pC) {
                cells[j].style = "border-color: black;";
            }
        }
    }
    nextPieceTime.innerText = current.time;
}

function shave(shape) {
    let minI = undefined;
    let minJ = undefined; 
    let maxI = undefined;
    let maxJ = undefined;

    for (let i = 0; i < 3; ++i) {
        let emptyRow = true;
        let emptyCol = true;
        for (let j = 0; j < 3; ++j) {
            if (shape[i][j] === 1 && emptyRow) {
                emptyRow = false;
            }
            if (shape[j][i] === 1 && emptyCol) {
                emptyCol = false;
            }
            if (!emptyRow) {
                if (minI === undefined) {
                    minI = i;
                } else {
                    maxI = i;
                }
            }
            if (!emptyCol) {
                if (minJ === undefined) {
                    minJ = i;
                } else {
                    maxJ = i;
                }
            }
        }
    }

    minI = minI === undefined ? 0 : minI;
    maxI = maxI === undefined ? 2 : maxI;
    minJ = minJ === undefined ? 0 : minJ;
    maxJ = maxJ === undefined ? 2 : maxJ;

    return [minI, maxI, minJ, maxJ];
}

function fits(piece, tableCell) {
    const r = findRow(tableCell);
    const c = tableCell.cellIndex;

    const [pivotRow, pivotCol] = findPiecePivot(piece);
    const [minI, maxI, minJ, maxJ] = shave(piece.shape);
    if (!(0 <= r + minI - pivotRow
        && r + maxI - pivotRow < 11
        && 0 <= c + minJ - pivotCol
        && c + maxJ - pivotCol < 11)) {
        return [false, []];
    }

    const coords = [];
    for (let i = minI; i <= maxI; ++i) {
        for (let j = minJ; j <= maxJ; ++j) {
            if (piece.shape[i][j] === 1) {
                const row = r + i - pivotRow;
                const col = c + j - pivotCol;
                if (fields[row][col].type !== 'empty') {
                    return [false, []];
                }
                coords.push([row, col]);
            }
        }
    }
    return [true, coords];
}

function previewPiece(e) {
    if (!(e.target instanceof HTMLTableCellElement) || !e.target.classList.contains('empty')) {
        return;
    }
    const [ok, coords] = fits(pieces[currentPiece], e.target);
    if (!ok) {
        return;
    }
    for (let i = 0; i < coords.length; ++i) {
        const [row, col] = coords[i];
        const c = tableCells[row][col];
        c.classList.add(`previewed-${pieces[currentPiece].type}`);
        lastPreviewed.push(c);
    }
}

function clearPreview() {
    currentType = pieces[currentPiece].type;
    lastPreviewed.forEach((c) => c.classList.remove(`previewed-${currentType}`));
    lastPreviewed = [];
}

function clearPreviewHandler(e) {
    if (!(e.target instanceof HTMLTableCellElement)) {
        return;
    }
    clearPreview();
}

function placePiece(e) {
    if (!(e.target instanceof HTMLTableCellElement) || !e.target.classList.contains('empty')) {
        return;
    }
    const current = pieces[currentPiece];
    const [ok, coords] = fits(current, e.target);
    if (!ok) {
        return;
    }
    clearPreview();

    coords.forEach(([row, col]) => {
        fields[row][col].type = current.type;
        tableCells[row][col].classList.add(current.type);
        tableCells[row][col].classList.remove('empty');
    });

    tickTime();
    ++currentPiece;
    showCurrentPiece();
}

function initTable() {
    const tbody = document.createElement('tbody');

    for (let i = 0; i < MAPSIZE; ++i) {
        let row = tbody.insertRow();
        fields.push([]);
        tableCells.push([]);
        for (let j = 0; j < MAPSIZE; ++j) {
            fields[i].push({ type: 'empty' });
            tableCells[i].push(row.insertCell());
            tableCells[i][j].classList.add('empty');
        }
    }

    map.appendChild(tbody);
    map.onclick = placePiece;
    map.onmouseover = previewPiece;
    map.onmouseout = clearPreviewHandler;

    mountains.forEach((e) => {
        const i = e[0] - 1;
        const j = e[1] - 1;
        fields[i][j] = {
            type: 'mountain'
        };
        tableCells[i][j].classList.remove('empty');
        tableCells[i][j].classList.add('mountain');
    });
}

function initMissions() {
    currentMissions = randMissions(4);
    for (let i = 0; i < 4; ++i) {
        missionCards[i].querySelector('.title').innerText = currentMissions[i].title;
        missionCards[i].querySelector('.description').innerText = currentMissions[i].description;
        missionScores.forEach((m) => m.innerText = 0);
    }
    const ms = seasons[currentSeason].missions;
    missionCards.forEach((c) => c.classList.remove('active'));
    ms.forEach((i) => missionCards[i].classList.add('active'));
}

function initPieces() {
    pieces = shuffle(elements);
    showCurrentPiece();

    rotateButton.onclick = rotatePiece;
    hMirrorButton.onclick = () => mirrorPiece(true);
    vMirrorButton.onclick = () => mirrorPiece(false);
    stuckButton.onclick = checkStuck;
}

function initGame() {
    initTable();
    initMissions();
    initPieces();
}

initGame();