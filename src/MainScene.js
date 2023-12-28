class MainScene extends Phaser.Scene {
    constructor() {
        super("mainScene");
    }

    create() {
        scene = this;
        graphics = this.add.graphics();

        initRNG();
        seedButton.addEventListener('click', () => {
            if (parseSeedString(seedTextArea.value)){
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
        this.puzzle = new PuzzleGrid(gridWidth, gridHeight);

        //Check if the user has entered a seed in the URL and parse it if so
        let urlSeed = false;
        const seedString = document.location.hash.substring(1);
        if (seedString) {
            console.log("Loading seed from URL:", seedString)
            parseSeedString(seedString);
            urlSeed = true;
            this.puzzle.generatePuzzle(gridWidth, gridHeight);
            setSeedText(seedString);
        } else {
            this.initRandAndGenerate()
        }

        this.puzzle.drawGrid();
    }

    update(){ 
        if (Phaser.Input.Keyboard.JustDown(keyR)) { 
            this.initRandAndGenerate(); 
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
        setSeedText(createSeedString());
        window.location.hash = seedTextArea.value;
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
        window.location.hash = seedTextArea.value;
    }
}