// Note: This file is mostly used to store globals and utility functions
// Go to index.html for webpage stuff and MainScene.js for puzzle stuff

let UIspacerheight = 128;
let borderPadding = 0; //Set this to zero but keeping around in case I change my mind
let sizePerUnit = 100;
let edgeWidth = 20;

let hasOneWayStreets = false; 
let num_solutions = 0;
let endNode1, endNode2;

let rand;
let curSeed;
const seedButton = document.querySelector('#seedButton');

//Get references to the value fields
let widthField    = document.querySelector('#widthField')
let heightField   = document.querySelector('#heightField')
let lengthField   = document.querySelector('#lengthField')
let maxCrossField = document.querySelector('#maxCrossingField')

//Get the values
let gridWidth  = widthField.value
let gridHeight = heightField.value
let maxLength  = lengthField.value //Note: A bit of a misnomer, this WILL be the path length, not an upper bound
let maxCrosses = maxCrossField.value //Max times a node or edge can be crossed

let errorMessage = document.querySelector("#HtmlErrorLabel");

let restraintTexts = [];
let scene;
let playerNode;

function initRNG(){ 
    rand = Phaser.Math.RND;
    let stateInit = rand.state();
    rand.sow(stateInit + Date.now()); //First seed with the date to make sure we get a random seed when we refresh the page
    curSeed = rand.integerInRange(0, Number.MAX_SAFE_INTEGER);
    rand.sow(curSeed.toString());
}

function createSeedString() {
    return `${gridWidth}.${gridHeight}.${maxLength}.${maxCrosses}.${curSeed}`;
}

function copyBaseURL() {
    navigator.clipboard.writeText("https://spacedoddyssey.github.io/Wanderpath/");
    document.querySelector("#shareButton").innerHTML = "Copied to clipboard!"
    setTimeout(() => { document.querySelector("#shareButton").innerHTML = "Share Wanderpath" }, 1000);
}

function copySeedURL() {
    navigator.clipboard.writeText("https://spacedoddyssey.github.io/Wanderpath/#" + createSeedString());
    document.querySelector("#sharePuzzleButton").innerHTML = "Copied to clipboard!"
    setTimeout(() => { document.querySelector("#sharePuzzleButton").innerHTML = "Share this puzzle" }, 1000);
}

function parseSeedString(seedString) {
    console.log("Loading seed:", seedString);
    const seedStringRegex = /^\d+.\d+.\d+.\d+.\d+$/;
    if (!seedStringRegex.test(seedString)) {
        console.log("Invalid seed format!");
        return false;
    }
    
    let seed;
    console.log(seedString.split('.'));
    [widthField.value, heightField.value, lengthField.value, maxCrossField.value, seed]
        = seedString.split('.')

    rand.sow(seed.toString());
    let curParameters = getCurParameters();

    if(curParameters == null) {
        console.log("Invalid settings!");
        return false;
    } 

    [gridWidth, gridHeight, maxLength, maxCrosses] = curParameters;
    return true;
}

function getCurParameters(){
    let [newGW, newGH, newML, newMC] = [widthField.value, heightField.value, lengthField.value, maxCrossField.value];

    //Check that the parameters are valid, display error message if necessary
    //The maximum path length is (width * height - 1) * maxCrossings
    if(newML > (newGW * newGH - 1) * newMC){ 
        console.log("Invalid settings!");
        errorMessage.innerHTML = "<b>&nbspInvalid settings!</b><br>&nbspPath Length must be at most&nbsp<br>&nbsp(Width * Height - 1) * Max Crosses&nbsp"
        return null;
    }

    let widthNotInRange    = newGW < widthRange[0] || newGW > widthRange[1];
    let heightNotInRange   = newGH < heightRange[0] || newGH > heightRange[1];
    let lengthNotInRange   = newML < lengthRange[0] || newML > lengthRange[1];
    let maxCrossNotInRange = newMC < maxCrossRange[0] || newMC > maxCrossRange[1];
    if(widthNotInRange || heightNotInRange || lengthNotInRange || maxCrossNotInRange){
        console.log("Invalid settings!");
        errorMessage.innerHTML = "<b>&nbspInvalid settings!<br>Values out of range&nbsp"
        return null;
    }

    console.log("Valid settings!");
    errorMessage.innerHTML = ""
    return [newGW, newGH, newML, newMC];
}

let defaultDimensions = newDimensions(gridWidth, gridHeight)

function newDimensions(newGridWidth, newGridHeight) {
    let w = (newGridWidth * sizePerUnit) + borderPadding * 2;
    let h = (newGridHeight * sizePerUnit) + borderPadding * 2;
    return [w, h];
} 

let config = {
    type: Phaser.CANVAS,
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: defaultDimensions[0],
    height: defaultDimensions[1],
    parent: "game",
    scene:[ MainScene ]
}

let restraintConfig = {
    fontFamily: 'Georgia',
    fontSize: '28px',
    color: '#ff0404',
    align: 'center'
}

function getElementColor(timesCrossed){
    let color;
    if (timesCrossed === 0) {
        color = 0xFFFFFF; 
    } else if (timesCrossed >= 1 && timesCrossed <= 5) {
        const gradient = Math.floor((maxCrosses - timesCrossed) * (255 / 4));
        color = (gradient << 16) | (gradient << 8) | 0xFF; 
    } else {
        color = 0xFF0000; 
    }

    return color;
}

//Returns a point 90% of the way between coord1 and coord2
//Used only for one-way-streets right now
function percentBetween(coord1, coord2, proportion){
    const [x1, y1] = coord1;
    const [x2, y2] = coord2;
    
    const newX = x1 + proportion * (x2 - x1);
    const newY = y1 + proportion * (y2 - y1);
    
    return [newX, newY];
}

const Dirs = {
    Up: 0,
    Down: 1,
    Left: 2,
    Right: 3,
    Endpoint: 4
}
const InverseDirs = [Dirs.Down, Dirs.Up, Dirs.Right, Dirs.Left, Dirs.Endpoint]
const dirNames = ["north", "south", "west", "east"]

let UpKey, DownKey, LeftKey, RightKey, RKey, ZKey, WKey, AKey, SKey, DKey, XKey, QKey, EnterKey;

let recursionCounter = 0;
let recursionLimit = 30000;
let recursionLimitReached = false;

//Used to enforce in-range values on the html number fields 
function enforceMinMax(field){
    if(field.value == "") {
        field.value = field.min;
        return;
    }

    if(parseInt(field.value) < parseInt(field.min)){
        field.value = field.min;
    } else if(parseInt(field.value) > parseInt(field.max)){
        field.value = field.max;
    }
}

//Debug flags
let edgeCrossDebug = false
let restraintDebug = false
let reachedGoalDebug = false
let recursiveDebugLevel = 0
let finalPathDebug = true
let foundSolutionDebug = false
let playerMoveDebug = false

//Use to disable or enable player movement while it's under construction
let playerMovementEnabled = true;

//Create the game
let graphics; 
let game = new Phaser.Game(config);