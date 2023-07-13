let UIspacerheight = 64;
let borderPadding = 64;
let sizePerUnit = 64;

let gridWidth = 4;
let gridHeight = 4;

let defaultDimensions = newDimensions(gridWidth, gridHeight)

let config = {
    type: Phaser.CANVAS,
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: defaultDimensions[0],
    height: defaultDimensions[1],
    scene:[ MainScene ]
}

// text configuration
let textConfig = {
    fontFamily: 'Georgia',
    fontSize: '28px',
    color: '#843605',
    align: 'right',
    padding: {
        top: 5,
        bottom: 5,
    },
    fixedWidth: 0
}

let restraintConfig = {
    fontFamily: 'Georgia',
    fontSize: '28px',
    color: '#0000F5',
    align: 'center'
}

function newDimensions(newGridWidth, newGridHeight) {
    let w = (newGridWidth * sizePerUnit) + borderPadding * 2;
    let h = (newGridHeight * sizePerUnit) + borderPadding * 2 + UIspacerheight;
    return [w, h];
} 

let game = new Phaser.Game(config);

const Dirs = {
    Up: 0,
    Down: 1,
    Left: 2,
    Right: 3,
    Endpoint: 4
}

const InverseDirs = [Dirs.Down, Dirs.Up, Dirs.Right, Dirs.Left, Dirs.Endpoint]

const dirNames = ["north", "south", "west", "east"]

let keyUP, keyDOWN, keyLEFT, keyRIGHT, keyR;