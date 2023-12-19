class MainScene extends Phaser.Scene {
    constructor() {
        super("mainScene");
    }

    create() {
        graphics = this.add.graphics();

        initRNG();
        document.querySelector('#seedButton').addEventListener('click', () => {
            if (parseSeedString()){
                this.regenerateWholeScene();
            }
        });

        // define keys 
        keyUP    = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        keyDOWN  = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        keyLEFT  = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        keyR     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

        // show game title text
        this.add.text(game.config.width / 2, 10, 'Wanderpath', textConfig).setOrigin(0.5, 0);

        //Hook up the button that regenerates the whole game with new given parameters
        document.querySelector('#regenerateGridButton').onclick = this.initRandAndGenerate.bind(this);

        //Create a new empty puzzle grid
        this.puzzle = new PuzzleGrid(gridWidth, gridHeight, this);
        //Generate a puzzle within the grid
        this.puzzle.generatePuzzle(gridWidth, gridHeight);
        setSeedText();

        this.puzzle.drawGrid();
    }

    update(){ 
        if (Phaser.Input.Keyboard.JustDown(keyR)) { 
            initRNG();
            this.regenerateWholeScene(); 
        }

        if(Phaser.Input.Keyboard.JustDown(keyUP)){
            this.puzzle.movePlayer(Dirs.Up);
        }
        if(Phaser.Input.Keyboard.JustDown(keyDOWN)){
            this.puzzle.movePlayer(Dirs.Down);
        }
        if(Phaser.Input.Keyboard.JustDown(keyLEFT)){
            this.puzzle.movePlayer(Dirs.Left);
        }
        if(Phaser.Input.Keyboard.JustDown(keyRIGHT)){
            this.puzzle.movePlayer(Dirs.Right);
        }
    }

    initRandAndGenerate(){
        initRNG();
        this.regenerateWholeScene(); 
        setSeedText();
    }

    //This function is called when the user clicks the Regenerate Game button on the left side of the page
    regenerateWholeScene(){
        let newParams = getCurParameters();
        if(newParams == null){ return; }

        [gridWidth, gridHeight, maxLength, maxCrosses] = newParams;

        // errorMessage.innerHTML = "<b>&nbspGenerating...&nbsp</b>"

        let newDim = newDimensions(gridWidth, gridHeight);
        game.scale.resize(newDim[0], newDim[1]);
        
        this.puzzle.resetAndRegenerate();
    }
}