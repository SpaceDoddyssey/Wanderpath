let UIspacerheight = 64;
let borderPadding = 64;
let sizePerUnit = 64;

let defaultGridWidth = 4;
let defaultGridHeight = 4;

let defaultDimensions = newDimensions(defaultGridWidth, defaultGridHeight)

let config = {
    type: Phaser.CANVAS,
    width: defaultDimensions[0],
    height: defaultDimensions[1],
    scene:[ MainScene ]
}

function newDimensions(gridWidth, gridHeight) {
    let w = (defaultGridWidth * sizePerUnit) + borderPadding * 2;
    let h = (defaultGridHeight * sizePerUnit) + borderPadding * 2 + UIspacerheight;
    return [w, h];
} 

let game = new Phaser.Game(config);

let keyUP, keyDOWN, keyLEFT, keyRIGHT, keyR;