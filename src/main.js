let UIspacerheight = 64;
let borderPadding = 64;
let sizePerUnit = 64;

let gridWidth  = document.getElementById('widthField').value
let gridHeight = document.getElementById('heightField').value
let maxLength  = document.getElementById('lengthField').value
let maxCrosses = document.getElementById('maxCrossingField').value

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
    color: '#1722E8',
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

//Used to enforce minmax on the html fifieldds 
function enforceMinMax(field){
    //First enforce minmax
    if(field.value != ""){
        console.log("Minmax")
        if(parseInt(field.value) < parseInt(field.min)){
        field.value = field.min;
        }
        if(parseInt(field.value) > parseInt(field.max)){
        field.value = field.max;
        }
    } else {
        field.value = field.min;
    }
}